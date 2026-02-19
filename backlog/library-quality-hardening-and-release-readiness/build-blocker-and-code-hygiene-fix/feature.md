# [F-07] 빌드 차단 이슈와 코드 위생 수정

## 메타
- ID: `F-07`
- 소속 Epic: `[E-03] 라이브러리 품질 하드닝과 릴리스 준비` (`../epic.md`)
- 우선순위: `P0`
- 상태: `TBD`
- GitHub Issue: `TBD`

## 사용자 가치
- 가치:
  - 유지보수자는 릴리스 직전 실패를 유발하는 빌드/린트 차단 이슈를 제거해 배포 안정성을 확보할 수 있다.
  - 소비자 애플리케이션은 경고/오염 없는 기본 품질을 갖춘 컴포넌트를 사용할 수 있다.
- 수용 기준:
  - [ ] `npm run build`, `npm run lint`가 메인 브랜치 기준으로 100% 성공한다.
  - [ ] React `key` 누락 경고를 포함한 고빈도 렌더 경고가 제거된다.
  - [ ] 디버그 로그와 불필요 콘솔 출력이 운영 빌드에서 제거된다.
  - [ ] 코드 위생 규칙(미사용 import/변수, 타입 경고) 위반이 릴리스 게이트 기준 이하로 유지된다.

## 하위 UserStory
- [US-019] 빌드 실패 원인 분석과 수정 (`./build-failure-root-cause-and-fixes/userstory.md`)
- [US-020] 렌더 경고와 디버그 로그 정리 (`./render-warning-and-debug-log-cleanup/userstory.md`)
- [US-021] 코드 위생 게이트 강화 (`./code-hygiene-gate-hardening/userstory.md`)

## 의존성
- 선행:
  - `TBD`
- 후행:
  - `[F-08] 회귀 검증 체계와 QA 시나리오 자동화` (`../regression-validation-and-qa-automation/feature.md`)
  - `[F-09] 스타일 충돌 완화와 릴리스 운영 준비` (`../style-isolation-and-release-operations-readiness/feature.md`)
