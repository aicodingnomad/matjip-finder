// 근처 맛집·술집 찾기 - 백엔드 (의존성 없음, Node 18+)
//
// KAKAO_REST_API_KEY 환경변수가 있으면 카카오 로컬 API를 사용하고,
// 없으면 OpenStreetMap(Nominatim + Overpass)으로 동작한다.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const KAKAO_KEY = process.env.KAKAO_REST_API_KEY || '';
const PUBLIC_DIR = path.join(__dirname, 'public');
const USER_AGENT = 'matjip-finder/1.0 (https://github.com/)';
const OVERPASS_ENDPOINTS = process.env.OVERPASS_URL
  ? [process.env.OVERPASS_URL]
  : ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ---------- 공통 유틸 ----------

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function fetchJson(url, options = {}, timeoutMs = 15000) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new HttpError(502, `외부 API 오류 (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

// 하버사인 거리(m)
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

function parseCoords(params) {
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw new HttpError(400, 'lat, lng 값이 올바르지 않습니다.');
  }
  return { lat, lng };
}

// 간단한 메모리 캐시 (같은 검색을 반복할 때 외부 API 호출을 줄인다)
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;
async function cached(key, fn) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await fn();
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return value;
}

// ---------- 카카오 로컬 API ----------

function kakaoGet(endpoint, params) {
  const url = `https://dapi.kakao.com${endpoint}?${new URLSearchParams(params)}`;
  return fetchJson(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } });
}

async function kakaoGeocode(query) {
  // 1) 주소로 검색, 2) 결과가 없으면 장소명(예: "강남역")으로 검색
  const addr = await kakaoGet('/v2/local/search/address.json', { query, size: 1 });
  if (addr.documents.length) {
    const d = addr.documents[0];
    return { lat: Number(d.y), lng: Number(d.x), label: d.address_name };
  }
  const kw = await kakaoGet('/v2/local/search/keyword.json', { query, size: 1 });
  if (kw.documents.length) {
    const d = kw.documents[0];
    return { lat: Number(d.y), lng: Number(d.x), label: `${d.place_name} (${d.road_address_name || d.address_name})` };
  }
  return null;
}

async function kakaoReverse(lat, lng) {
  const r = await kakaoGet('/v2/local/geo/coord2address.json', { x: lng, y: lat });
  const d = r.documents[0];
  if (!d) return null;
  return d.road_address?.address_name || d.address?.address_name || null;
}

const KAKAO_QUERIES = {
  food: '맛집',
  bar: '술집',
};

async function kakaoPlaces(lat, lng, radius, type) {
  const query = KAKAO_QUERIES[type];
  const results = [];
  // 카카오 키워드 검색은 페이지당 최대 15개, 최대 3페이지(45개)까지 제공
  for (let page = 1; page <= 3; page++) {
    const r = await kakaoGet('/v2/local/search/keyword.json', {
      query,
      category_group_code: 'FD6', // 음식점
      x: lng,
      y: lat,
      radius,
      sort: 'distance',
      page,
      size: 15,
    });
    for (const d of r.documents) {
      const categories = d.category_name.split('>').map((s) => s.trim());
      results.push({
        id: `kakao-${d.id}`,
        name: d.place_name,
        type,
        category: categories.slice(1).join(' > ') || categories[0],
        // 예: "음식점 > 한식 > 육류,고기" → 한식 / "음식점 > 술집 > 호프,요리주점" → 호프,요리주점
        subCategory: categories[type === 'bar' ? 2 : 1] || categories[categories.length - 1],
        address: d.road_address_name || d.address_name,
        phone: d.phone || null,
        lat: Number(d.y),
        lng: Number(d.x),
        distance: Number(d.distance) || distanceMeters(lat, lng, Number(d.y), Number(d.x)),
        url: d.place_url,
        openingHours: null,
      });
    }
    if (r.meta.is_end) break;
  }
  return results;
}

// ---------- OpenStreetMap (키 없이 동작) ----------

async function osmGeocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: 'json',
    limit: 1,
    countrycodes: 'kr',
    'accept-language': 'ko',
  })}`;
  let r = await fetchJson(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!r.length) {
    // 국내 결과가 없으면 전세계로 다시 검색
    r = await fetchJson(url.replace('&countrycodes=kr', ''), { headers: { 'User-Agent': USER_AGENT } });
  }
  if (!r.length) return null;
  return { lat: Number(r[0].lat), lng: Number(r[0].lon), label: r[0].display_name };
}

async function osmReverse(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?${new URLSearchParams({
    lat,
    lon: lng,
    format: 'json',
    'accept-language': 'ko',
    zoom: 18,
  })}`;
  const r = await fetchJson(url, { headers: { 'User-Agent': USER_AGENT } });
  return r.display_name || null;
}

const OSM_AMENITIES = {
  food: ['restaurant', 'fast_food', 'food_court'],
  bar: ['bar', 'pub', 'biergarten'],
};

const OSM_CUISINE_KO = {
  korean: '한식', chinese: '중식', japanese: '일식', sushi: '초밥', ramen: '라멘',
  italian: '이탈리안', pizza: '피자', burger: '버거', chicken: '치킨', fried_chicken: '치킨',
  barbecue: '고기/구이', bbq: '고기/구이', noodle: '면요리', vietnamese: '베트남', thai: '태국',
  indian: '인도', western: '양식', american: '양식', french: '프랑스', mexican: '멕시칸',
  seafood: '해산물', coffee_shop: '카페', sandwich: '샌드위치', kebab: '케밥', steak_house: '스테이크',
  regional: '향토음식', asian: '아시안', international: '세계음식', dessert: '디저트',
};

const OSM_AMENITY_KO = {
  restaurant: '음식점', fast_food: '패스트푸드', food_court: '푸드코트',
  bar: '바', pub: '펍/호프', biergarten: '비어가든',
};

// 공개 Overpass 서버는 혼잡할 때 응답에 30~40초가 걸리거나 곧바로 502/429를 돌려준다.
// 빨리 실패한 경우는 같은 서버에 한 번 더 시도하고, 시간 초과면 다음 서버로 넘어간다.
async function overpassQuery(query) {
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await fetchJson(
          endpoint,
          {
            method: 'POST',
            headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ data: query }),
          },
          60000,
        );
      } catch (e) {
        lastError = e;
        if (e.name === 'TimeoutError') break;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }
  throw lastError;
}

// 맛집·술집을 한 번의 쿼리로 가져온다 (요청을 나누면 공개 서버에서 속도 제한에 더 잘 걸린다)
async function osmPlaces(lat, lng, radius, types) {
  // 종류별로 따로 200개씩 출력해서 음식점이 많은 동네에서도 술집이 잘리지 않게 한다
  const query = `[out:json][timeout:50];
${types
  .map((t) => `nwr(around:${radius},${lat},${lng})["amenity"~"^(${OSM_AMENITIES[t].join('|')})$"]["name"];
out center 200;`)
  .join('\n')}`;
  const r = await overpassQuery(query);
  return r.elements.map((el) => {
    const t = el.tags || {};
    const type = types.find((ty) => OSM_AMENITIES[ty].includes(t.amenity));
    const pLat = el.lat ?? el.center?.lat;
    const pLng = el.lon ?? el.center?.lon;
    const cuisine = (t.cuisine || '').split(';')[0].trim();
    const sub = OSM_CUISINE_KO[cuisine] || OSM_AMENITY_KO[t.amenity] || t.amenity;
    const addr = [t['addr:city'], t['addr:district'], t['addr:street'], t['addr:housenumber']]
      .filter(Boolean)
      .join(' ');
    return {
      id: `osm-${el.type}-${el.id}`,
      name: t['name:ko'] || t.name,
      type,
      category: [OSM_AMENITY_KO[t.amenity], OSM_CUISINE_KO[cuisine]].filter(Boolean).join(' > '),
      subCategory: sub,
      address: addr || t['addr:full'] || null,
      phone: t.phone || t['contact:phone'] || null,
      lat: pLat,
      lng: pLng,
      distance: distanceMeters(lat, lng, pLat, pLng),
      url: t.website || t['contact:website'] || `https://www.openstreetmap.org/${el.type}/${el.id}`,
      openingHours: t.opening_hours || null,
    };
  });
}

// ---------- 라우팅 ----------

async function kakaoPlacesByTypes(lat, lng, radius, types) {
  const lists = await Promise.all(types.map((t) => kakaoPlaces(lat, lng, radius, t)));
  return lists.flat();
}

const provider = KAKAO_KEY
  ? { name: 'kakao', geocode: kakaoGeocode, reverse: kakaoReverse, places: kakaoPlacesByTypes }
  : { name: 'osm', geocode: osmGeocode, reverse: osmReverse, places: osmPlaces };

async function handleApi(url, res) {
  const params = url.searchParams;

  if (url.pathname === '/api/config') {
    return sendJson(res, 200, { provider: provider.name });
  }

  if (url.pathname === '/api/geocode') {
    const q = (params.get('q') || '').trim();
    if (!q) throw new HttpError(400, '주소를 입력해 주세요.');
    const result = await cached(`geo:${provider.name}:${q}`, () => provider.geocode(q));
    if (!result) throw new HttpError(404, `'${q}' 위치를 찾지 못했습니다. 주소나 장소명을 다시 확인해 주세요.`);
    return sendJson(res, 200, result);
  }

  if (url.pathname === '/api/reverse') {
    const { lat, lng } = parseCoords(params);
    const key = `rev:${provider.name}:${lat.toFixed(4)},${lng.toFixed(4)}`;
    const label = await cached(key, () => provider.reverse(lat, lng));
    return sendJson(res, 200, { label });
  }

  if (url.pathname === '/api/places') {
    const { lat, lng } = parseCoords(params);
    const radius = Math.min(Math.max(Number(params.get('radius')) || 1000, 100), 5000);
    const type = params.get('type') || 'all';
    const types = type === 'all' ? ['food', 'bar'] : [type];
    if (!types.every((t) => t in OSM_AMENITIES)) throw new HttpError(400, 'type은 food, bar, all 중 하나여야 합니다.');

    const key = `places:${provider.name}:${lat.toFixed(4)},${lng.toFixed(4)}:${radius}:${type}`;
    const places = await cached(key, async () => {
      const list = await provider.places(lat, lng, radius, types);
      const seen = new Set();
      return list
        .filter((p) => p.name && Number.isFinite(p.lat) && !seen.has(p.id) && seen.add(p.id))
        .sort((a, b) => a.distance - b.distance);
    });
    return sendJson(res, 200, { provider: provider.name, count: places.length, places });
  }

  throw new HttpError(404, '존재하지 않는 API입니다.');
}

function serveStatic(url, res) {
  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (!url.pathname.startsWith('/api/')) return serveStatic(url, res);
  try {
    await handleApi(url, res);
  } catch (e) {
    const status = e.status || (e.name === 'TimeoutError' ? 504 : 500);
    if (status >= 500) console.error(e);
    sendJson(res, status, {
      error: e.name === 'TimeoutError' ? '외부 지도 서버 응답이 늦습니다. 잠시 후 다시 시도해 주세요.' : e.message,
    });
  }
});

server.listen(PORT, () => {
  console.log(`🍜 맛집·술집 찾기 서버: http://localhost:${PORT}`);
  console.log(
    KAKAO_KEY
      ? '   데이터: 카카오 로컬 API'
      : '   데이터: OpenStreetMap (KAKAO_REST_API_KEY를 설정하면 카카오 데이터로 더 정확한 결과를 볼 수 있습니다)',
  );
});
