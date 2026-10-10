# BEST 생태계 — 투자자 소개 웹사이트

동네 마트·길거리 야채가게·나들가게가 자기 이름을 지킨 채 거래망·고객 접점·업무 도구·AI를 함께 쓰는
지역 상거래 생태계(베스트마켓 · 베스트마트 온라인몰 · 운영허브 + ERP · 메신저 · ARGOS)를 투자자에게
설명하는 단일 페이지 사이트입니다.

## 실행

빌드 도구가 없습니다. `index.html`을 브라우저에서 바로 열거나, 정적 서버로 띄우면 됩니다.

```bash
npx serve .          # 또는
python3 -m http.server 8080
```

GitHub Pages, Vercel, Netlify 등 정적 호스팅에 폴더째 올리면 동작합니다.

## 구조

| 경로 | 내용 |
|---|---|
| `index.html` | 모든 본문 텍스트와 섹션 구조 (ST.00 ~ ST.09) |
| `assets/css/style.css` | 디자인 토큰(`:root` 라이트, `[data-theme="dark"]`·`.band` 다크), 섹션별 스타일, 애니메이션, 인쇄 |
| `assets/js/main.js` | 노선도 상호작용, 채팅 시연(재생·멈춤), 스크롤 등장, 키보드 섹션 이동, 테마 전환, 열차 불빛 일시정지 |
| `DESIGN.md` | 디자인 시스템(토큰·타이포·컴포넌트·모션 규칙) |

## 프레젠테이션 조작

- `←` `→`: 섹션 단위 이동. `Space` `PageDown` `PageUp`: 한 화면씩 넘기다가 섹션 끝·시작에서 다음·이전 섹션으로 이동
- 테마: 우상단 달/해 버튼으로 라이트·다크 전환(선택은 브라우저에 저장). 다크를 기본으로 두려면 `index.html`의 `<html lang="ko">`에 `data-theme="dark"`를 추가합니다. 단일 문자 단축키는 접근성(WCAG 2.1.4) 때문에 두지 않습니다.
- 노선도의 역을 클릭하면 오른쪽 패널에 설명이 바뀝니다.
- 채팅 시연은 화면에 들어오면 자동 재생되고, 승인/거절 버튼을 직접 누를 수 있습니다. "멈춤"으로 정지, "다시 보기"로 반복합니다. 시연이 끝나면 승인 장면이 화면에 남습니다.
- 히어로 노선의 열차 불빛은 캡션 옆 "불빛 멈춤"으로 멈출 수 있습니다. 키보드 사용자는 첫 Tab에서 "본문으로 건너뛰기" 링크를 받습니다.

## 확인 방법

| 방법 | 언제 | 하는 법 |
|---|---|---|
| 브라우저 미리보기 | 가장 빠르게, 휴대전화에서도 | Claude에 로그인한 기기에서 아티팩트 링크를 엽니다. 사이트를 고칠 때마다 같은 링크가 갱신됩니다. |
| 파일로 직접 열기 | 오프라인·발표 자리 | GitHub에서 브랜치를 ZIP으로 받거나 `git clone` 한 뒤 `index.html`을 더블클릭합니다. 글꼴은 인터넷이 있어야 Google Fonts에서 내려받고, 없으면 기기 기본 명조·고딕으로 보입니다. |
| 휴대전화 실기기 | 터치·스크롤 감각 확인 | PC에서 `python3 -m http.server 8080`을 실행하고, 같은 Wi-Fi의 휴대전화 브라우저에서 `http://<PC의 IP>:8080`을 엽니다. |
| 기기 흉내 | 여러 폭을 빠르게 | Chrome에서 F12 → Ctrl+Shift+M(기기 툴바) → iPhone·Galaxy·iPad 선택. |
| 상시 주소 | 투자자에게 링크로 보낼 때 | GitHub 저장소 Settings → Pages → Branch를 배포할 브랜치의 `/ (root)`로 지정하면 `https://davechankim.github.io/-/`에서 열립니다. 사이트가 공개되므로 연락처·브랜드명을 확정한 뒤 켜는 것을 권장합니다. |
| 자동 스크린샷 | 변경 뒤 회귀 확인 | `npx playwright install chromium` 후 `npx playwright screenshot --viewport-size=390,844 --full-page http://localhost:8080 mobile.png` (데스크톱은 `1440,900`). |

## 내용 수정

- **연락처**: `index.html`에서 `id="contactValue"`인 문단의 텍스트("담당자 연락처는 발표 자리에서 안내합니다.")를 실제 연락처로 바꿉니다.
- **상위 브랜드명**: 현재 "BEST 생태계"는 가칭입니다. 상단바(`.brand-text`와 `.brand`의 aria-label), `<title>`, `og:title`, 푸터에서 바꿉니다.
- **노선도 역 설명**: `assets/js/main.js`의 `STATIONS` 객체를 수정합니다. 역 자체(위치·이름)는 `index.html`의 `<svg class="metro">` 안에 있습니다.
- **채팅 시연 대사**: `assets/js/main.js`의 `playChat()` 함수와 `dataCard()`, `approveCard()`에 있습니다.
- **속도 목표 수치**: `index.html`의 `ul.targets` 안에 있습니다.

## 디자인 원칙

토큰·컴포넌트·모션 규칙 전체는 [DESIGN.md](DESIGN.md)에 있습니다.

- 서체: 헤드라인 Noto Serif KR 500, 본문 IBM Plex Sans KR, 라벨·숫자 IBM Plex Mono (모두 Google Fonts, 요청 1개).
- 색: 크림 캔버스가 기본이고 다크는 토글입니다. 크롬(버튼·링크·강조)의 유채색은 앰버 `--accent` 하나. 노선 4색(`--rail-*`)은 노선도·차트 SVG 안에서만 씁니다.
- 깊이: 그림자 대신 표면 명도 사다리(`--canvas` → `--s1` → `--s2` → `--s3`)와 1px 헤어라인(`--hair`). 섹션은 크림·소프트 크림·다크 밴드를 번갈아 둡니다. 개념도·노선도·역할 표는 상자 없이 캔버스 위에 직접 그립니다.
- 모션: 등장 640ms 1회, 상태 변화 160ms. 루프 애니메이션은 히어로 노선의 작은 불빛과 채팅 시연의 '입력 중' 점 둘뿐이며, 둘 다 멈출 수 있고 `prefers-reduced-motion`에서 꺼집니다.
- 접근성: WCAG 2.1 AA 기준으로 점검했습니다(대비, 44px 터치 타깃, 키보드 조작, `aria-pressed` 상태, 목록 의미, 건너뛰기 링크).

## 주의

사이트의 서비스 구성·업무 흐름·속도 수치는 설계 목표이며, 구현 완료나 검증된 성과가 아닙니다.
채팅 시연은 가상 데이터입니다. 푸터의 고지 문구를 유지하는 것을 권장합니다.

## Claude Code Design Toolbox

이 브랜치에는 `/design-toolbox` 프로젝트 스킬과 326개 원본 가이드가 포함됩니다.
클라우드 세션에서도 이 브랜치를 선택하면 읽을 수 있습니다.

```text
/design-toolbox 모드=개선. DESIGN.md를 유지하면서 모바일 화면을 개선해줘.
```

Playwright 준비와 Figma·21st 인증은 [클라우드 설정 안내](docs/design-toolbox-cloud.md)를 확인하세요.
