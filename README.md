# 쿠루쿠루 V5 · GitHub Pages 배포

## 1. Supabase 설정
- SQL 스키마를 이미 성공적으로 실행했다면 다시 실행하지 마세요.
- Supabase → Authentication → Providers → Anonymous Sign-ins를 활성화하세요.
- SQL Editor에서 `01-create-group.sql`을 **한 번만** 실행하고 출력된 `invite_code`를 별도로 보관하세요. 이미 그룹과 초대코드를 만들었다면 이 과정은 건너뛰고 기존 코드를 사용하세요.
- Project Settings → API / URL configuration에서 GitHub Pages 도메인을 확인하세요. 웹사이트는 `https://jasol53.github.io/kurukurutest/`입니다.

## 2. GitHub Pages 배포
- ZIP의 `index.html`, `style.css`, `data.js`, `analysis.js`, `script.js`, `supabase-sync.js` 파일을 GitHub 저장소 `jasol53/kurukurutest`의 **루트**에 업로드하고 기존 파일을 교체하세요. `01-create-group.sql`, `README.md`는 사이트에 업로드할 필요 없습니다.
- Settings → Pages에서 기존 GitHub Pages 배포가 켜져 있는지 확인하세요.
- 친구들에게 `https://jasol53.github.io/kurukurutest/?invite=발급받은_초대코드` 형태로 전달하세요. 링크를 가진 사람은 그룹에 가입할 수 있습니다. 유출되면 새 코드로 교체하세요.

## 3. 사용 흐름
이름 입력 → 그룹 공개 동의 → 72문항 → 기존 주관적 BEST/WORST 입력 → 결과 보기 → Supabase 자동 저장 → 같은 그룹 친구의 V5 결과와 비교.
브라우저에는 익명 계정이 유지되며, 브라우저 데이터를 지우거나 기기를 바꾸면 새 계정이 생성됩니다. 같은 이름의 중복 계정은 자동으로 합쳐지지 않습니다.

## 4. 채점 방식과 한계
- 선택지마다 6개 축에 독립적인 0~5점이 부여됩니다. 72×4개 선택지의 점수는 `data.js`에 있습니다.
- 축별 이론상 최소·최대 점수는 전체 문항 배점에서 자동 산출합니다. 최종 점수는 `(획득점수-최소)/(최대-최소)×100`입니다.
- V5 배점은 문장 단서와 행동 분류를 이용한 **초기 설계안**이며 실제 응답을 통한 검증/보정은 아직 이루어지지 않았습니다. 점수는 심리검사나 능력의 우열이 아닙니다.
- HIGH 체계는 사용하지 않습니다. 크기(전체 평균), 형태(상위 축), 편중도(최고/최저 격차)로 분류합니다.
- V4 코드 조회는 가능하지만 V5와 직접 비교해서는 안 됩니다.
- 그룹 케미는 오락적 해석이며 실제 인간관계를 판정하지 않습니다.

## 5. 보안 및 개인정보
- `supabase-sync.js`의 publishable key는 공개 클라이언트 키입니다. service_role/secret key를 넣지 마세요.
- SQL의 RLS로 같은 그룹 구성원만 멤버 이름과 점수를 조회할 수 있습니다. 그룹 초대 링크를 전달받은 사람은 그룹에 가입할 수 있습니다.
- 익명 계정의 재발급/복구 및 관리자의 결과 삭제 기능은 현재 별도로 제공하지 않습니다. 운영 전 정책을 정하는 것이 좋습니다.
- **중요:** SQL `kuru_join_group`은 사용자의 이름을 가입 시 저장합니다. 같은 브라우저에서 이름을 바꿔도 서버의 기존 표시 이름은 변경되지 않습니다.
- 브라우저 캐시가 남으면 강력 새로고침(Ctrl+Shift+R)으로 확인하세요.
