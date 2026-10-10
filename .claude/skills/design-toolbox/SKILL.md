---
name: design-toolbox
description: Select and combine the bundled Emil Kowalski, Impeccable, Taste, UI/UX Pro Max, ECC, Humanizer, Kill AI Slop, and I-Have-ADHD guides with Figma, Playwright, Motion, or 21st.dev tools. Use for choosing this toolbox, frontend design and refinement, motion work, or an explicit toolbox writing/ADHD mode.
---

# Design Toolbox

한국어 사용자에게는 한국어로 응답한다. 이 프로젝트는 정적 HTML/CSS/JS 사이트다.
화면 작업 전 저장소 루트의 `DESIGN.md`를 읽고 기존 디자인 시스템을 우선한다.
모션 안내를 선택했다는 이유로 React나 Framer Motion을 도입하지 않는다. 이 스킬은 요청에 맞는 모듈을 선택하는 진입점이다.
목록의 모든 지침을 한 번에 읽지 않는다. 원본 안내와 지원 파일은 `library/`에 저장되어 있다.

## 선택

1. 명시한 `모드`, `사용`, `제외`가 있으면 우선한다. 자연어로도 선택할 수 있다.
2. 없으면 `preferences.json`이 존재할 때만 읽는다. 저장된 선택보다 현재 요청이 우선한다.
3. 자동 모드에서는 요청의 작업 단계에 필요한 모듈만 고른다. 랜딩/포트폴리오는 Taste,
   대시보드/업무 앱은 UI/UX Pro Max, 기존 화면 개선은 Impeccable을 주된 설계 지침으로 삼는다.
   Emil은 인터랙션과 디테일, Kill AI Slop은 요청된 정리/검토 단계에서 추가한다.
   글쓰기·ADHD 모드는 명시적으로 요청했거나 저장된 선택에 있을 때만 불러온다.
4. 선택만 요청하면 아래 명령으로 목록이나 경로를 보여주고 실제 작업은 시작하지 않는다.
   작업 요청이 함께 있으면 선택한 모듈과 역할을 한 문장으로 밝힌 후 작업을 진행한다.

명령의 `<toolbox-dir>`는 이 SKILL.md가 있는 **실제 절대 경로**로 치환한다.

```bash
python3 <toolbox-dir>/scripts/toolbox.py list
python3 <toolbox-dir>/scripts/toolbox.py list --family ecc
python3 <toolbox-dir>/scripts/toolbox.py plan --preset design
python3 <toolbox-dir>/scripts/toolbox.py plan --use emil,taste,playwright --exclude motion
```

`plan`은 파일을 변경하지 않으며 선택한 GUIDE.md의 절대 경로를 반환한다.
선택한 안내를 읽고, 그 안의 지원 파일은 해당 GUIDE.md가 있는 폴더를 기준으로 찾는다.
원본의 `SKILL.md`는 자동 중복 로딩을 막기 위해 내용 변경 없이 `GUIDE.md`로 보관했다.
사용자에게 원본 스킬이 각각 독립 설치되어 있다고 말하지 않는다.

| 프리셋 | 선택되는 안내 | 도구/보조 역할 |
| --- | --- | --- |
| `auto` / 자동 | 요청에서 필요한 단계만 추론 | 기존 연결과 프로젝트의 스택 확인 |
| `design` / 디자인 | Taste, UI/UX Pro Max, Emil | Playwright 검증; 랜딩/포트폴리오에 적합 |
| `app` / 앱 | UI/UX Pro Max, Impeccable, Emil | Playwright 검증; 대시보드/업무 앱에 적합 |
| `polish` / 개선 | Impeccable, Emil, Kill AI Slop | Playwright 검증 |
| `motion` / 모션 | Emil 디자인/animate/review-animations | Motion, Playwright |
| `figma` | UI/UX Pro Max, Emil | Figma에서 근거 수집, Playwright로 구현 검증 |
| `components` / 컴포넌트 | 21st UI, Emil | 21st.dev, Playwright |
| `engineering` / 개발 | ECC coding-standards/frontend-patterns/verification-loop | Playwright; 작업에 맞는 ECC 항목만 추가 |
| `writing` / 글쓰기 | Humanizer | 의미·출처·사실 보존 |
| `adhd` | I-Have-ADHD | 이 대화의 답변 형식; 진단을 추정하지 않음 |

`사용=emil,taste,playwright`, `사용=ecc:api-design`, `제외=motion`처럼 조합한다.
ECC의 293개 항목과 Taste/Emil의 다른 안내는 `registry.json` 또는 `list --family`에서 찾는다.
`ECC`만 지정하면 coding-standards와 verification-loop만 선택한다.
`전부`는 목록/설치 선택을 뜻한다. 모든 안내를 문맥에 넣으라는 뜻으로 해석하지 않는다.
사용자가 정말 모든 가이드를 읽으라고 명시하면 그 범위와 요청을 존중한다.

## 적용과 충돌 처리

- 사용자 브리프와 프로젝트의 실제 디자인 시스템을 우선한다. 한 작업에서 여러 모듈이
  서로 다른 시각 방향을 강요하면 주된 설계 안내 하나를 정하고 나머지는 담당 단계에만 쓴다.
- 보고서만 요청하면 수정하지 않는다. 검사와 수정이 이미 승인되었다면 발견 내용과 수정안을
  보여준 뒤 승인된 범위에서 진행한다. 원본의 제안/보고 절차를 추가 승인 요구로 바꾸지 않는다.
- 원본 안내의 Claude 전용 변수·slash command·고정 설치 경로는 현재 도구와 실제 라이브러리
  경로로 바꿔 읽는다. `CLAUDE_PLUGIN_ROOT`가 있다고 가정하지 않는다.
- UI/UX Pro Max 검색은 `library/uipro/uipro/scripts/search.py`의 **절대 경로**로 실행한다.
  Kill AI Slop 스캐너는 `library/kill-ai-slop/kill-ai-slop/scripts/scan.mjs`이다.
- Impeccable 런처는 `library/impeccable/impeccable/scripts/impeccable`이다. 상대 참조는
  원본대로 유지된다. 엔진의 자동 다운로드가 실패하면 기존 프로젝트 근거와 안내로 계속한다.
- ECC 에이전트 템플릿과 hooks, ADHD always-on hook은 자동 활성화하지 않는다.
  필요한 안내만 활용하며 서브에이전트 사용 여부는 현재 사용자 요청/환경 규칙을 따른다.
- ADHD 안내는 답변 형식에 적용하며 작성 중인 제품의 문구/레이아웃에 강제하지 않는다.
  시간 추정은 근거가 있을 때만 제시한다. `일반 모드`, `ADHD 끄기`, `stop adhd mode`로 해제한다.
  이 대화에서 해제한 모드를 저장된 프리셋 때문에 다시 켜지 않는다.

## 외부 도구

Figma, Playwright, Motion, 21st.dev를 선택한 경우에만
[references/integrations.md](references/integrations.md)를 읽는다.
현재 세션의 실제 도구 목록과 인증 상태를 확인한다. 설정 파일 존재를 연결 성공으로 표현하지 않는다.
도구가 없으면 가능한 독립 작업을 마친 뒤 필요한 연결만 안내한다.

```bash
python3 <toolbox-dir>/scripts/cloud.py doctor
```

클라우드 환경에는 이 저장소의 `.mcp.json`과 `.claude/settings.json`이 적용된다.
런타임 준비는 `python3 <toolbox-dir>/scripts/cloud.py setup --browser`를 사용한다.
`toolbox.py`의 `install`, `setup-mcp`, `auth-figma`, `set-magic-key`는 원본 Codex용
명령이므로 이 프로젝트의 Claude 설정에 사용하지 않는다. 클라우드에 Mac의 경로나
개인 키 파일이 있다고 가정하지 않는다. 인증 및 네트워크 설정은 저장소 루트의
`docs/design-toolbox-cloud.md`를 따른다. 키를 채팅이나 저장소에 넣지 않는다.
저장된 기본 선택을 바꾸라는 요청이 있을 때만 `toolbox.py select ...`를 실행한다.
일회성 선택은 `plan`만 사용한다.

## 사용 예시

```text
/design-toolbox 모드=디자인. 이 프로젝트에 제품 소개 페이지를 만들어줘.
/design-toolbox 모드=개선, 제외=motion. 설정 화면을 다듬어줘.
/design-toolbox 사용=emil,taste,playwright. 포트폴리오를 만들어줘.
/design-toolbox 사용=ecc:api-design,ecc:verification-loop. 이 API를 검토해줘.
/design-toolbox 모드=글쓰기. 아래 문장의 의미를 유지하면서 자연스럽게 고쳐줘.
/design-toolbox ADHD 모드로 짧게 답해줘.
/design-toolbox 사용 가능한 목록만 보여줘.
```
