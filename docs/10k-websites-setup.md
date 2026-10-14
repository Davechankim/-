# 10K Websites 스킬 준비 안내

업로드된 `10k-websites-skill.zip`을 이 저장소의 프로젝트 스킬로 설치했습니다. 이 문서는 스킬이 무엇을 하는지, 어떻게 부르는지, 어디까지 준비됐고 무엇이 사용자 계정을 필요로 하는지를 정리합니다.

## 무엇을 하는 스킬인가

- 스크롤에 따라 AI 생성 히어로 영상이 앞으로·뒤로 재생되는 시네마틱 원페이지 사이트를 만들고 배포합니다. 순수 HTML·CSS·JS 한 폴더, 빌드 없음.
- 파이프라인은 고정이고 메뉴가 아닙니다. Claude Code가 제작, **Higgsfield** 커넥터가 이미지·영상 생성, **Hostinger** 커넥터가 호스팅·배포를 맡습니다. 스킬 본문이 다른 생성기·호스팅으로의 대체를 금지합니다.
- 11단계로 진행합니다. 설정 마법사 → 디자인 대화 → 고객 리서치와 제안 → 깊이 티어 → 디자인 패키지 → 히어로 생성(비용 고지·영상 게이트) → 에셋 가공(ffmpeg) → 제작 → 자체 검수 → 온라인(Hostinger) → 폴리시 루프.
- 대화는 클릭형 선택지 질문으로 진행하고, 첫 응답은 반드시 Phase 1 체크리스트입니다.

## 설치 위치

| 경로 | 내용 |
|---|---|
| `.claude/skills/10k-websites/SKILL.md` | 스킬 본문(프런트매터 `name: 10k-websites`) |
| `.claude/skills/10k-websites/references/` | prompt-laws, design-package, scrub-pipeline, ffmpeg-recipes, deploy, troubleshooting |

이 저장소를 받은 모든 Claude Code 세션(Mac, 클라우드)에서 `/10k-websites`로 호출할 수 있습니다. 원본 ZIP과 압축 해제본은 스킬 규칙대로 배포 폴더 밖(세션 업로드 폴더·스크래치)에만 두었고 저장소에는 넣지 않았습니다.

## 호출 방법

```text
/10k-websites
/10k-websites sites/cafe 폴더에 동네 카페 사이트를 만들어줘
```

**새 사이트는 별도 폴더에서 만드세요.** 이 스킬은 `index.html` + `assets/`를 새로 만듭니다. 저장소 루트는 BEST 생태계 소개 사이트가 쓰고 있으므로, 첫 메시지에 작업 폴더(예: `sites/<브랜드>/`)를 지정하거나 별도 저장소에서 시작해야 소개 사이트가 덮어써지지 않습니다.

## 준비 상태 (Phase 1 체크리스트 기준)

| 항목 | 클라우드 세션(이 환경) | Mac |
|---|---|---|
| ffmpeg | ✓ 6.1.1, libx264 포함. 레시피 전부 실행 확인(아래) | `brew install ffmpeg` (Homebrew가 없으면 brew.sh의 한 줄 설치 먼저) |
| Node.js | ✓ v22. 미리보기 서버 `npx http-server` 동작 확인 | `brew install node` 또는 nodejs.org |
| Higgsfield 커넥터 | ✗ 계정과 연결 필요. claude.ai 커넥터 설정에서 커스텀 커넥터로 `https://mcp.higgsfield.ai/mcp`를 추가한 뒤 **새 세션**을 시작합니다(커넥터는 세션 시작 때 읽힘). 또한 이 환경의 네트워크 정책이 `mcp.higgsfield.ai`, `higgsfield.ai`를 막고 있어(403) 환경 설정의 Network access에서 허용해야 합니다. | Claude Code 앱: + → Connectors → Manage connectors → Add → Add custom connector. 이름 Higgsfield, URL `https://mcp.higgsfield.ai/mcp` → Add → Connect(브라우저 로그인 1회) |
| Hostinger 커넥터 | Phase 10(온라인 단계)에서만 필요. 클라우드에서는 브라우저 OAuth가 열리지 않으므로 환경 Secrets에 `HOSTINGER_API_TOKEN`을 두고 `npx -y hostinger-api-mcp`를 쓰거나, claude.ai 커스텀 커넥터로 `https://mcp.hostinger.com`을 추가합니다. `hostinger.com` 계열 호스트도 네트워크 허용이 필요합니다. | `claude mcp add hostinger -- npx -y hostinger-api-mcp` 후 첫 호출 때 브라우저 로그인 |

스킬은 호스팅을 Phase 1에서 묻지 않도록 되어 있습니다. 위 Hostinger 행은 그 시점이 왔을 때를 위한 메모입니다.

## 비용 (스킬 본문이 밝히는 수치)

| 항목 | 스킬이 말하는 기준 |
|---|---|
| 히어로 시작 이미지 | 약 2크레딧 |
| 히어로 영상 6초 1080p | 모델에 따라 약 10~55크레딧 |
| 사전 확인 | `get_cost: true` 호출은 무료. 생성 전에 반드시 가격을 말하도록 되어 있음 |
| 무료 체험 | 첫 사이트 1개 + 재시도 1회 정도를 감당한다고 설명 |
| 호스팅 | 별도. Hostinger 공유 호스팅 요금은 사이트에서 확인하도록 안내 |

스킬 안의 Higgsfield·Hostinger 가입 링크(meticsmedia.com 경유)는 스킬 제작자의 파트너 링크라고 본문이 밝히고 있습니다. 직접 가입해도 스킬 동작에는 차이가 없습니다.

## 이 저장소의 다른 스킬과의 관계

- `design-toolbox`(브랜치 `codex/claude-cloud-design-toolbox`)와 파일 경로가 겹치지 않아 병합해도 충돌이 없습니다.
- 10k-websites 본문은 "다른 웹사이트 스킬이 있어도 이 스킬이 우선"이라고 못박습니다. 10k 작업 중에는 toolbox 모듈을 섞지 않고, 소개 사이트 개선에는 기존처럼 toolbox를 씁니다.

## 설치 시 확인한 것 (2026-10-14)

- 프런트매터 `name`이 폴더명과 일치하고 `description`은 526자입니다. 참조 파일 6개가 모두 존재하며 LF 줄바꿈, BOM 없음.
- ffmpeg 레시피 스모크 테스트: 6초 1080p 합성 클립 → 스크럽 인코딩(키프레임 간격 8프레임 확인: 0.000 / 0.333 / 0.667초) → 포스터·엔딩 JPG, 체인용 PNG 추출, 2세그먼트 단일 인코딩 concat까지 모두 성공.
- Higgsfield·Hostinger 호스트는 현재 클라우드 환경에서 403으로 차단됨. npm 레지스트리는 열려 있어 `hostinger-api-mcp`(2.16.0)와 `http-server`는 받아집니다.
