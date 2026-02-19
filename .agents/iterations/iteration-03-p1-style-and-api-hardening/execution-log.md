# Iteration 03 실행 로그

## 메타
- 이터레이션: `iteration-03-p1-style-and-api-hardening`
- 갱신일: `2026-02-19`
- 이번 반영 범위: `T-037~T-048`, `T-097~T-108`

## 1. 정의 (T-037, T-041, T-045, T-097, T-101, T-105)
- F-04 범위를 `공개 타입(publicTypes) / 내부 타입(internalTypes)` 경계로 명시했다.
- selector 공통 타입 유틸 요구사항을 `type literal 기반 추출 + type guard + selector 조회`로 확정했다.
- 하위 호환 규칙을 `docs/public-api-compatibility-rules.md`에 문서화했다.
- 스타일 격리 범위를 `컴포넌트 CSS 네임스페이스 + 엔트리 전역 selector 제거`로 확정했다.
- 소비자 앱 충돌 회귀 범위를 `styleIsolation.test.ts` 자동 검증으로 확정했다.
- 릴리스/롤백 절차를 `release-runbook.md`로 표준화했다.

## 2. 구현 (T-038, T-042, T-046, T-098, T-102, T-106)
- 공개 타입 계약 파일을 분리했다.
  - `src/components/publicTypes.ts` 추가
  - `src/components/types.ts`를 하위 호환 re-export 진입점으로 유지
- 내부 전용 타입 경계를 도입했다.
  - `src/components/internalTypes.ts` 추가
  - `ComposableSearch`, `RegionDetailPanel`에서 내부 타입 사용
- selector 공통 타입 유틸을 추가했다.
  - `src/components/selectorTypeUtils.ts`
  - `resolveSelectorByType`, `isRegionSelector`, `isKeywordSelector`, `SelectorOfType`
- 스타일 스코프 격리를 적용했다.
  - `src/index.css`에서 `html/body/:root` 전역 selector 제거
  - `src/App.tsx`, `src/App.css`로 데모 스코프 이동
- 하위 호환/운영 문서를 작성했다.
  - `docs/public-api-compatibility-rules.md`
  - `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md`

## 3. 검증 (T-039, T-043, T-047, T-099, T-103, T-107)
### TDD 실행 로그
- Red:
  - `src/components/selectorTypeUtils.test.ts` 추가 후 `./selectorTypeUtils` 미존재로 실패 확인
  - `src/styleIsolation.test.ts` 추가 후 `src/index.css`의 `html/body` 전역 selector로 실패 확인
- Green:
  - selector 타입 유틸/타입 분리/스타일 스코프 수정 반영 후 테스트 통과
- Refactor:
  - 공개 타입 파일 분리(`publicTypes.ts`) + 호환 엔트리(`types.ts`) 유지
  - 내부 타입 경계(`internalTypes.ts`)로 컴포넌트 계약 정리

### 검증 명령
- `npm test`
- `npm run lint`
- `npm run build`

### 결과
- 테스트: `5 files, 35 tests` 통과
- 린트: 통과
- 빌드: 통과

## 4. 운영 준비 (T-040, T-044, T-048, T-100, T-104, T-108)
- 릴리스 런북에 사전 점검/스모크 체크/롤백 절차를 반영했다.
- 관측/알람 기준을 타입 계약 회귀, 스타일 격리 회귀 기준으로 명시했다.
- 저장소 공통 임계값 미확정 항목은 `TBD`로 유지했다.

## 5. 잔여 리스크
- `0.2.0`에서 `ComposableSelectItem` 완전 제거 시점은 아직 미확정이다.
- 운영 메트릭 임계값(에러율/응답시간) 저장소 공통 정책은 `TBD`다.
