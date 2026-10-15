# 10K Websites 스킬 준비 안내

업로드된 `10k-websites-skill.zip`을 이 저장소의 프로젝트 스킬로 설치했습니다. 이 문서는 스킬이 무엇을 하는지, 어떻게 부르는지, 어디까지 준비됐고 무엇이 사용자 계정을 필요로 하는지를 정리합니다. 스킬 본문이 말하지 않는, 이 저장소와 클라우드 환경에 맞춘 보충 사항은 "보충"이라고 표시했습니다.

## 무엇을 하는 스킬인가

- 스크롤에 따라 AI 생성 히어로 영상이 앞으로·뒤로 재생되는 시네마틱 원페이지 사이트를 만들고 배포합니다. 순수 HTML·CSS·JS 한 폴더, 빌드 없음. 스크롤 영상은 노트북·데스크톱에서만 재생되고 휴대폰은 정지 이미지 히어로를 봅니다(스킬이 사용자에게 알리도록 정한 사실).
- 파이프라인은 고정이고 메뉴가 아닙니다. Claude Code가 제작, **Higgsfield** 커넥터가 이미지·영상 생성, **Hostinger** 커넥터가 호스팅·배포를 맡습니다. 스킬 본문이 다른 생성기·호스팅으로의 대체를 금지합니다.
- 11단계로 진행합니다. 설정 마법사 → 디자인 대화 → 고객 리서치와 제안 → 깊이 티어 → 디자인 패키지 → 히어로 생성(비용 고지·영상 게이트) → 에셋 가공(ffmpeg) → 제작 → 자체 검수 → 온라인(Hostinger) → 폴리시 루프.
- 대화는 클릭형 선택지 질문으로 진행하고, 첫 응답은 반드시 Phase 1 체크리스트입니다.

## 설치 위치와 상태

| 경로 | 내용 |
|---|---|
| `.claude/skills/10k-websites/SKILL.md` | 스킬 본문(프런트매터 `name: 10k-websites`) |
| `.claude/skills/10k-websites/references/` | prompt-laws, design-package, scrub-pipeline, ffmpeg-recipes, deploy, troubleshooting |

- **이 폴더가 곧 압축을 푼 스킬입니다.** SKILL.md 첫머리의 "ZIP을 작업 폴더에 풀어라"는 단계는 이미 끝난 것이므로, 호출 시 바로 SKILL.md와 references를 읽고 Phase 1부터 시작하면 됩니다. 원본 ZIP은 더 이상 필요 없고 저장소에 넣지 않았습니다(스킬 규칙: ZIP과 해제본은 배포 폴더 밖에).
- **프런트매터에 한 줄을 추가했습니다(보충).** `disable-model-invocation: true`. 스킬 설명이 "웹사이트·랜딩페이지를 만들어 달라"는 요청 전반에 반응하도록 쓰여 있어, 소개 사이트를 고치는 평범한 요청에도 Claude가 이 스킬을 자동으로 불러 Phase 1 체크리스트로 대화를 가로챌 수 있습니다. 이 한 줄로 `/10k-websites`를 직접 입력했을 때만 동작합니다. 본문은 업로드본과 동일하며, 나중에 새 ZIP으로 갱신하면 이 한 줄만 다시 넣으면 됩니다.
- **발견 범위.** 이 브랜치(`claude/youthful-johnson-35duig`)가 GitHub 저장소의 기본 브랜치이므로, 새로 clone하거나 새 클라우드 세션을 열면 자동으로 보입니다. `main`에는 아직 없습니다. 스킬을 추가한 바로 그 세션에서는 `/reload-skills`를 한 번 실행해야 목록에 나타납니다.
- **다른 저장소나 Mac 전체에서 쓰려면(보충)** 폴더를 한 번 복사합니다. 모든 프로젝트에서 쓰려면 `cp -R .claude/skills/10k-websites ~/.claude/skills/`, 특정 저장소에서만 쓰려면 그 저장소의 `.claude/skills/`에 복사합니다.

## BEST 생태계 사이트를 이 스킬로 짓기: `/best-10k`

새 세션에서 아래 한 줄이면 시작됩니다.

```text
/best-10k
```

- `.claude/skills/best-10k/SKILL.md`가 10k-websites 스킬 파일(SKILL.md와 references 여섯 개)을 읽어 그 흐름(Phase 1 체크리스트부터)을 그대로 따르게 하고, BEST 생태계 브리프(사업 설명, 철도 프리미스, 팔레트 출발점, 페이지 구성, 금지 사항, 크레딧 보호 규칙)를 사전 답변으로 넘깁니다. 10k-websites는 자동 호출이 꺼져 있어 Skill 도구로는 부를 수 없으므로 파일을 직접 읽는 방식입니다. 스킬이 묻는 질문은 그대로 나오고, 브리프의 답이 1번 추천 옵션으로 올라옵니다.
- **시작 전에 한 가지:** 이 환경의 네트워크 정책이 Higgsfield 미디어 호스트(`upload.higgsfield.ai`, 결과 CDN `d2ol7oe51mr4n9.cloudfront.net`)를 막고 있습니다(2026-10-15 확인, 403). 생성된 영상을 컨테이너로 받아 인코딩·커밋하려면 세션 제목줄의 클라우드 환경 메뉴 → Edit → Network access → Allowed domains에 이 두 호스트를 추가하고(패키지 매니저 허용은 유지) 새 세션을 여세요. 추가하지 않으면 스킬이 Phase 1에서 이를 감지해 알리고, Higgsfield의 원격 sandbox에서 처리하는 우회 경로를 씁니다(완성 mp4를 저장소에 넣으려면 결국 허용이 필요).
- 새 사이트는 `sites/best/`에 생기고 루트의 소개 사이트는 건드리지 않습니다. 원본 영상과 검토용 프레임은 `sites/best-review/`에 두며 `.gitignore`로 커밋에서 제외됩니다.
- 호스팅은 하지 않습니다. Phase 10은 시작하지 않고, 결과는 브랜치 커밋과 아티팩트 미리보기로 전달합니다. 나중에 올리고 싶으면 GitHub Pages(Settings → Pages)로 `sites/best/`를 공개하는 것이 가장 간단합니다.
- 새 세션을 열 때 필요한 것: 이 저장소의 **기본 브랜치**(`claude/youthful-johnson-35duig`; `main`에는 스킬이 없음)와 세션에 켜 둔 Higgsfield 커넥터. 2026-10-15 점검에서 이 환경의 세션에 Higgsfield 도구가 보였고(잔액 2,210크레딧, plus 플랜), ffmpeg·Node도 준비되어 있었습니다. 새 세션은 자기 이름의 `claude/*` 브랜치에 커밋하므로, 끝나면 그 브랜치를 기본 브랜치로 합치면 됩니다.
- 크레딧은 생성 전마다 스킬이 가격을 말하고 사용자가 고릅니다. 시작 이미지 약 2크레딧, 6초 영상 약 10~55크레딧(모델별).

## 호출 방법 (일반)

```text
/10k-websites
/10k-websites sites/cafe 폴더에 동네 카페 사이트를 만들어줘
```

**새 사이트는 별도 폴더에서 만드세요.** 이 스킬은 `index.html` + `assets/`를 새로 만듭니다. 저장소 루트는 BEST 생태계 소개 사이트가 쓰고 있으므로, 첫 메시지에 작업 폴더(예: `sites/<브랜드>/`)를 지정하거나 별도 저장소(위의 복사 절차 필요)에서 시작해야 소개 사이트가 덮어써지지 않습니다.

## 준비 상태 (Phase 1 체크리스트 기준)

| 항목 | 클라우드 세션(이 환경) | Mac |
|---|---|---|
| ffmpeg | ✓ 6.1.1, libx264 포함. 레시피 전부 실행 확인(아래) | `brew install ffmpeg` (Homebrew가 없으면 brew.sh의 한 줄 설치 먼저) |
| Node.js | ✓ v22. 미리보기 서버 `npx http-server` 동작 확인 | `brew install node` 또는 nodejs.org |
| Higgsfield 커넥터 | ✓ 연결됨(2026-10-15, `balance` 도구로 확인). 새 세션에서 도구가 보이지 않으면 claude.ai 커넥터 설정(https://claude.ai/customize/connectors)에서 Higgsfield를 세션에 켜고 새 세션을 시작합니다(커넥터는 세션 시작 때 읽힘). 커넥터 통신은 Anthropic의 MCP 프록시를 거치므로 환경 네트워크 허용이 필요 없습니다. 다만 Claude가 컨테이너에서 Higgsfield 미디어 호스트에 직접 접속하는 경우(생성 결과 내려받기, Tier 2 체인의 업로드 PUT)는 현재 403으로 막혀 있어, 환경 설정 Network access의 Allowed domains에 `upload.higgsfield.ai`와 `d2ol7oe51mr4n9.cloudfront.net`을 추가해야 합니다. | 앱 UI: + → Connectors → Manage connectors → Add → Add custom connector. 이름 Higgsfield, URL `https://mcp.higgsfield.ai/mcp` → Add → Connect(브라우저 로그인 1회). 터미널(보충): `claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp` 후 `/mcp`에서 로그인 |
| Hostinger 커넥터 | Phase 10(온라인 단계)에서만 필요. 브라우저 OAuth가 열리지 않는 클라우드에서는(보충) ① hPanel에서 API 토큰 발급 → ② 환경 설정 Secrets에 `HOSTINGER_API_TOKEN` 저장 후 새 세션 → ③ Network access의 Allowed domains에 `developers.hostinger.com`(API), `hostingersite.com`(무료 임시 주소), 그리고 고른 도메인 추가 → ④ 서버 등록: `claude mcp add --transport stdio --env HOSTINGER_API_TOKEN=$HOSTINGER_API_TOKEN hostinger -- npx -y hostinger-api-mcp` (토큰이 있으면 OAuth를 건너뜀) | 스킬 본문의 명령 `claude mcp add hostinger -- npx -y hostinger-api-mcp` 후 첫 호출 때 브라우저 로그인. 대안(보충): 커스텀 커넥터로 `https://mcp.hostinger.com` |
| 영상 게이트·미리보기·자체 검수 | 스킬은 사용자가 같은 기기에서 영상 파일을 더블클릭하고 localhost 링크를 열고, Claude가 설치된 Chrome으로 검수한다고 가정합니다. 클라우드에서는 그 파일과 localhost가 사용자 브라우저에 닿지 않으므로(보충) Claude가 영상·미리보기를 파일 전송이나 아티팩트로 따로 전달해야 하고, 스크린샷 검수는 컨테이너의 Playwright Chromium으로 합니다. 가능하면 Phase 6~9는 Mac에서 진행하는 편이 매끄럽습니다. | 스킬 본문 그대로 |

스킬은 호스팅을 Phase 1에서 묻지 않습니다. 사용자가 먼저 호스팅 설정을 요청하면 그 자리에서 deploy.md의 Step 0을 진행하고, 아니면 Phase 10까지 기다립니다.

## 비용 (스킬 본문이 밝히는 수치)

| 항목 | 스킬이 말하는 기준 |
|---|---|
| 히어로 시작 이미지 | 약 2크레딧 |
| 히어로 영상 6초 1080p | 모델에 따라 약 10~55크레딧 |
| 사전 확인 | `get_cost: true` 호출은 무료. 생성 전에 반드시 가격을 말하도록 되어 있음 |
| 무료 체험 | 첫 사이트 1개 + 재시도 1회 정도를 감당한다고 설명 |
| 호스팅 | 별도. Hostinger 공유 호스팅 요금은 사이트에서 확인하도록 안내 |

스킬 규칙상 Higgsfield 가입 링크는 첫 체크리스트 메시지에, Hostinger 가입 링크는 Phase 10 메시지에 반드시 들어갑니다(이미 계정·플랜이 있다고 말한 사용자는 예외). 두 링크(meticsmedia.com 경유)는 스킬 제작자의 파트너 링크라고 본문이 밝히고 있습니다.

## 이 저장소의 다른 스킬과의 관계

- `design-toolbox`(브랜치 `codex/claude-cloud-design-toolbox`)와 스킬 폴더·문서 경로는 겹치지 않습니다. README.md는 양쪽에서 수정됐지만 서로 다른 위치라 `git merge-tree`로 확인했을 때 충돌 없이 합쳐집니다.
- 병합 뒤 정리할 것(보충): README의 스킬 안내를 한 곳으로 모으기, 그 브랜치의 CLAUDE.md에 두 스킬을 모두 적고 "기존 토큰·타이포 유지" 규칙을 루트 소개 사이트로 한정하기, `.github/workflows/design-toolbox.yml`의 경로 필터를 toolbox 폴더로 좁혀 10k 스킬 수정 때 CI가 돌지 않게 하기.
- 10k-websites 본문은 "다른 웹사이트 스킬이 있어도 이 스킬이 우선"이라고 못박습니다. 10k 작업 중에는 toolbox 모듈을 섞지 않고, 소개 사이트 개선에는 기존처럼 toolbox를 씁니다.

## 설치 시 확인한 것 (2026-10-14)

- 프런트매터 `name`이 폴더명과 일치하고 `description`은 526자입니다. 참조 파일 6개가 모두 존재하며 LF 줄바꿈, BOM 없음. 본문은 업로드본과 바이트 단위로 동일(프런트매터 한 줄 추가 제외).
- ffmpeg 레시피 스모크 테스트: 6초 1080p 합성 클립 → 스크럽 인코딩(키프레임 간격 8프레임 확인: 0.000 / 0.333 / 0.667초) → 포스터·엔딩 JPG, 체인용 PNG 추출, 2세그먼트 단일 인코딩 concat까지 모두 성공.
- Higgsfield·Hostinger 호스트로의 직접 접속은 현재 클라우드 환경에서 403으로 차단됨. npm 레지스트리는 열려 있어 `hostinger-api-mcp`(2.16.0)와 `http-server`는 받아집니다.
- 스킬 설치본·문서·브랜치 병합 호환성을 검증 에이전트 네 개로 교차 점검하고, 지적된 항목(자동 호출 차단, ZIP 단계 안내, 클라우드 커넥터 경로, 호스트 목록, 파트너 링크 규칙, 휴대폰 정지 히어로)을 이 문서에 반영했습니다.
