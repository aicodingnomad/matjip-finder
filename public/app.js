// 근처 맛집·술집 찾기 - 프론트엔드

const $ = (sel) => document.querySelector(sel);

const state = {
  center: null, // { lat, lng, label, title } - title은 상태줄에 보여줄 짧은 이름
  type: 'all',
  radius: 1000,
  places: [],
  subFilter: null,
  selectedId: null,
};

// ---------- 지도 ----------

const map = L.map('map', { zoomControl: true }).setView([37.5665, 126.978], 13); // 서울시청
// 기본 OSM 타일을 CSS 필터(style.css의 .leaflet-tile-pane)로 할로윈 밤 지도처럼 어둡게 만든다
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
let centerMarker = null;
let radiusCircle = null;
const markersById = new Map();

const TYPE_META = {
  food: { label: '맛집', emoji: '🎃' },
  bar: { label: '술집', emoji: '👻' },
};

function pinIcon(type) {
  return L.divIcon({
    className: '',
    html: `<div class="pin ${type}"><span>${TYPE_META[type].emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

// ---------- 유틸 ----------

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function formatDistance(m) {
  return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
}

function walkMinutes(m) {
  return Math.max(1, Math.round(m / 67)); // 도보 약 4km/h
}

function setStatus(text, isError = false) {
  const el = $('#status');
  el.textContent = text;
  el.classList.toggle('error', isError);
}

async function api(path, params) {
  const res = await fetch(`${path}?${new URLSearchParams(params)}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `요청 실패 (${res.status})`);
  return body;
}

function setBusy(busy) {
  document.querySelectorAll('#search-form button').forEach((b) => (b.disabled = busy));
}

// ---------- 위치 설정 ----------

function setCenter(lat, lng, label, title = label) {
  state.center = { lat, lng, label, title };
  if (centerMarker) centerMarker.remove();
  centerMarker = L.marker([lat, lng], {
    icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
    zIndexOffset: 1000,
  })
    .bindTooltip(label || '검색 위치')
    .addTo(map);
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    setStatus('이 브라우저는 위치 정보를 지원하지 않습니다. 주소를 입력해 주세요.', true);
    return;
  }
  setBusy(true);
  setStatus('현재 위치를 확인하는 중...');
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setCenter(lat, lng, '현재 위치');
      $('#address').value = '';
      // 주소 표시는 부가 정보라 실패해도 검색은 계속한다
      api('/api/reverse', { lat, lng })
        .then(({ label }) => {
          if (label && state.center?.lat === lat) {
            state.center.label = label;
            $('#address').placeholder = `현재 위치: ${label}`;
            centerMarker?.setTooltipContent(`현재 위치: ${label}`);
          }
        })
        .catch(() => {});
      await search();
    },
    (err) => {
      setBusy(false);
      const msg = {
        1: '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용하거나 주소를 입력해 주세요.',
        2: '현재 위치를 확인할 수 없습니다. 주소를 입력해 주세요.',
        3: '위치 확인 시간이 초과되었습니다. 다시 시도하거나 주소를 입력해 주세요.',
      }[err.code];
      setStatus(msg || '위치를 가져오지 못했습니다.', true);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
}

async function searchByAddress(query) {
  setBusy(true);
  setStatus(`'${query}' 위치를 찾는 중...`);
  try {
    const { lat, lng, label } = await api('/api/geocode', { q: query });
    setCenter(lat, lng, label, query);
    await search();
  } catch (e) {
    setBusy(false);
    setStatus(e.message, true);
  }
}

// ---------- 장소 검색 ----------

let searchSeq = 0;

async function search() {
  if (!state.center) return;
  const seq = ++searchSeq;
  const { lat, lng, title } = state.center;
  setBusy(true);
  setStatus('주변 가게를 찾는 중... (지도 서버가 붐비면 30초 이상 걸릴 수 있어요)');

  if (radiusCircle) radiusCircle.remove();
  radiusCircle = L.circle([lat, lng], {
    radius: state.radius,
    color: '#ff7b00',
    weight: 2,
    dashArray: '6 6',
    fillColor: '#6f00be',
    fillOpacity: 0.08,
  }).addTo(map);
  map.fitBounds(radiusCircle.getBounds(), { padding: [20, 20] });

  try {
    const data = await api('/api/places', { lat, lng, radius: state.radius, type: state.type });
    if (seq !== searchSeq) return; // 더 최근 검색이 있으면 무시
    state.places = data.places;
    state.subFilter = null;
    state.selectedId = null;
    renderChips();
    render();
    const status = $('#status');
    status.classList.remove('error');
    status.innerHTML = `🎃 ${escapeHtml(title)} 주변 ${formatDistance(state.radius)} 이내 <strong>${data.count}곳</strong>`;
  } catch (e) {
    if (seq !== searchSeq) return;
    state.places = [];
    renderChips();
    render();
    setStatus(e.message, true);
  } finally {
    if (seq === searchSeq) setBusy(false);
  }
}

// ---------- 렌더링 ----------

function visiblePlaces() {
  return state.subFilter ? state.places.filter((p) => p.subCategory === state.subFilter) : state.places;
}

function renderChips() {
  const counts = new Map();
  for (const p of state.places) {
    if (p.subCategory) counts.set(p.subCategory, (counts.get(p.subCategory) || 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const chips = $('#chips');
  if (top.length < 2) {
    chips.innerHTML = '';
    return;
  }
  chips.innerHTML =
    `<button class="chip ${state.subFilter ? '' : 'active'}" data-sub="">전체 ${state.places.length}</button>` +
    top
      .map(
        ([name, n]) =>
          `<button class="chip ${state.subFilter === name ? 'active' : ''}" data-sub="${escapeHtml(name)}">${escapeHtml(name)} ${n}</button>`,
      )
      .join('');
}

function linksHtml(p) {
  const q = encodeURIComponent(p.name);
  const links = [];
  if (p.url) links.push(`<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">상세정보</a>`);
  links.push(`<a href="https://map.naver.com/p/search/${q}?c=${p.lng},${p.lat},17,0,0,0,dh" target="_blank" rel="noopener">네이버 리뷰</a>`);
  links.push(`<a class="route" href="https://map.kakao.com/link/to/${q},${p.lat},${p.lng}" target="_blank" rel="noopener">🧭 길찾기</a>`);
  if (p.phone) links.push(`<a href="tel:${escapeHtml(p.phone)}">📞 ${escapeHtml(p.phone)}</a>`);
  return links.join('');
}

function render() {
  const places = visiblePlaces();
  const list = $('#list');
  markerLayer.clearLayers();
  markersById.clear();

  if (!places.length) {
    list.innerHTML = state.center
      ? '<li class="empty"><b>👻</b>주변에서 가게를 찾지 못했어요.<br />반경을 넓히거나 다른 위치로 검색해 보세요.</li>'
      : '';
    return;
  }

  list.innerHTML = places
    .map(
      (p) => `
      <li class="item ${p.type} ${p.id === state.selectedId ? 'selected' : ''}" data-id="${escapeHtml(p.id)}">
        <div class="item-head">
          <div class="item-title">
            <span class="item-name">${escapeHtml(p.name)}</span>
            <span class="badge ${p.type}">${TYPE_META[p.type].label}</span>
          </div>
          <span class="item-dist">${formatDistance(p.distance)} · 도보 ${walkMinutes(p.distance)}분</span>
        </div>
        ${p.category ? `<div class="item-cat">${escapeHtml(p.category)}</div>` : ''}
        ${p.address ? `<div class="item-addr"><span>📍</span>${escapeHtml(p.address)}</div>` : ''}
        ${p.openingHours ? `<div class="item-hours"><span>🕯️</span>${escapeHtml(p.openingHours)}</div>` : ''}
        <div class="item-links">${linksHtml(p)}</div>
      </li>`,
    )
    .join('');

  for (const p of places) {
    const marker = L.marker([p.lat, p.lng], { icon: pinIcon(p.type) })
      .bindPopup(
        `<div class="popup-name">${escapeHtml(p.name)} <span class="badge ${p.type}">${TYPE_META[p.type].label}</span></div>
         <div class="popup-meta">${escapeHtml(p.category || '')} · <b>${formatDistance(p.distance)} (도보 ${walkMinutes(p.distance)}분)</b></div>
         <div class="item-links">${linksHtml(p)}</div>`,
      )
      .on('click', () => selectPlace(p.id, { fromMap: true }));
    marker.addTo(markerLayer);
    markersById.set(p.id, marker);
  }
}

function selectPlace(id, { fromMap = false } = {}) {
  state.selectedId = id;
  document.querySelectorAll('.item').forEach((el) => el.classList.toggle('selected', el.dataset.id === id));
  for (const [markerId, m] of markersById) {
    m.getElement()?.querySelector('.pin')?.classList.toggle('selected', markerId === id);
  }
  const marker = markersById.get(id);
  if (!marker) return;
  if (fromMap) {
    document.querySelector(`.item[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 17));
    marker.openPopup();
  }
}

// ---------- 이벤트 ----------

$('#search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('#address').value.trim();
  if (q) searchByAddress(q);
  else if (state.center) search();
  else setStatus('주소를 입력하거나 📍 내 위치 탐색 버튼을 눌러 주세요.', true);
});

$('#locate').addEventListener('click', useCurrentLocation);

document.querySelectorAll('.tab').forEach((tab) =>
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    state.type = tab.dataset.type;
    search();
  }),
);

$('#radius').addEventListener('change', (e) => {
  state.radius = Number(e.target.value);
  search();
});

$('#chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.subFilter = chip.dataset.sub || null;
  renderChips();
  render();
});

$('#list').addEventListener('click', (e) => {
  if (e.target.closest('a')) return;
  const item = e.target.closest('.item');
  if (item) selectPlace(item.dataset.id);
});

// 지도를 클릭하면 그 지점을 기준으로 다시 검색
map.on('click', (e) => {
  setCenter(e.latlng.lat, e.latlng.lng, '지도에서 선택한 위치');
  $('#address').value = '';
  search();
});

api('/api/config', {})
  .then(({ provider }) => {
    $('#credit').innerHTML =
      provider === 'kakao'
        ? '🎃 장소 데이터: 카카오 로컬 API · 지도: © OpenStreetMap · 디자인: Google Stitch'
        : '🎃 장소 데이터: © OpenStreetMap contributors (카카오 API 키를 설정하면 더 많은 가게가 검색됩니다) · 디자인: Google Stitch';
  })
  .catch(() => {});
