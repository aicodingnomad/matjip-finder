# 🎃 할로윈 맛집·술집

현재 위치(GPS)나 입력한 주소 주변의 **맛집·술집**을 지도와 목록으로 보여주는 웹 앱입니다.

## 실행

Node.js 18 이상만 있으면 됩니다. 설치할 패키지는 없습니다.

```bash
cd matjip-finder
npm start
# → http://localhost:3000
```

### 카카오 API 키 사용 (권장)

키가 없어도 OpenStreetMap 데이터로 동작하지만, 국내 가게 정보는 카카오가 훨씬 풍부합니다.

1. [Kakao Developers](https://developers.kakao.com) → 내 애플리케이션 → 애플리케이션 추가
2. 앱 설정에서 **카카오맵(로컬) API 사용 설정**을 켜고 **REST API 키**를 복사
3. 키를 환경변수로 넣어 실행

```bash
KAKAO_REST_API_KEY=발급받은키 npm start
```

키는 서버에서만 사용하므로 브라우저에 노출되지 않습니다.

## 기능

- 📍 **현재 위치** 버튼 또는 **주소/장소명**(예: `강남역`, `서울 마포구 와우산로 94`) 검색
- 지도를 클릭하면 그 지점 기준으로 다시 검색
- **전체 / 맛집 / 술집** 탭, 반경 300m ~ 2km
- 한식·일식·호프 등 **세부 종류 필터**
- 가까운 순 정렬, 도보 시간 표시
- 가게별 상세정보 · 네이버 리뷰 · 카카오맵 길찾기 · 전화 링크

## 디자인

UI는 **Google Stitch**로 할로윈 콘셉트 화면을 생성한 뒤, 그 디자인 시스템(색상·폰트·글로우·카드 스타일)을 `public/style.css`에 옮겨 적용했습니다.

- `design/DESIGN.md` — Stitch가 만든 디자인 시스템 문서 (색상 토큰, 타이포그래피, 컴포넌트 규칙)
- `design/stitch-desktop.png` — Stitch 원본 시안
- `design/app-screenshot.png` — 실제 앱 화면

Stitch 시안의 별점·리뷰 수·할로윈 이벤트 문구는 장식용 예시 데이터라서 실제 앱에는 넣지 않았습니다(카카오/OSM API가 제공하지 않는 정보).

## 구조

```
server.js          API 서버 + 정적 파일 제공 (외부 의존성 없음)
public/index.html  화면
public/app.js      지도(Leaflet), 검색, 목록 렌더링
public/style.css   할로윈 테마 스타일 (모바일 대응)
design/            Google Stitch 디자인 원본
```

| API | 설명 |
| --- | --- |
| `GET /api/geocode?q=강남역` | 주소/장소명 → 좌표 |
| `GET /api/reverse?lat=&lng=` | 좌표 → 주소 |
| `GET /api/places?lat=&lng=&radius=1000&type=all` | 주변 가게 (`type`: `food`, `bar`, `all`) |

## 참고

- 현재 위치 기능은 브라우저 정책상 `localhost` 또는 **HTTPS**에서만 동작합니다. 서버에 배포한다면 HTTPS를 붙여 주세요.
- 카카오 키워드 검색은 종류별로 최대 45곳까지 반환합니다.
- 별점/리뷰 수는 카카오·OSM API가 제공하지 않아 외부 링크(카카오맵 상세, 네이버 리뷰)로 연결합니다.
- 환경변수: `PORT`(기본 3000), `KAKAO_REST_API_KEY`, `OVERPASS_URL`(OSM 사용 시 Overpass 서버 지정)
