# Iteration 02 릴리스 런북

## 1. 사전 점검 (Pre-release)
- 코드 게이트:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 필수 시나리오:
  - `서울특별시 > 강남구 > 역삼동` 선택 시 `서울특별시`, `강남구`가 `has-descendant-selected` 표시
  - `서울특별시 > 강남구 전체` 선택 시 동일 상위 표시
  - `서울특별시 전체` 선택 시 시/도 `서울특별시` 표시
  - 마지막 하위 선택 해제 시 상위 표시 즉시 원복

## 2. 시각 회귀 감지 기준 (FR-023)
- 회귀 유형:
  - 하위 상세/전체 선택 시 상위 하이라이팅 누락
  - 선택 해제 후 `has-descendant-selected` 잔존
  - `is-current`와 `has-descendant-selected` 구분 불가
- 확인 방법:
  - 자동화 테스트(`src/components/ComposableSearch.test.tsx`, `src/components/selectionPolicy.test.ts`)
  - 스테이징 수동 점검(시/도 전환, 다중 하위 선택, 마지막 선택 해제)

## 3. Triage 절차
1. 실패 시나리오를 테스트 케이스 명으로 식별한다.
2. `selectionPolicy.ts` 파생 규칙(시도/시군구 code set)에서 누락 여부를 확인한다.
3. `SelectableRegionColumn.tsx` 클래스 조합(`is-current`, `has-descendant-selected`)을 점검한다.
4. 회귀 원인 분류:
   - 정책 로직 누락
   - UI 클래스 연결 누락
   - 테스트 데이터/시나리오 누락

## 4. 배포 후 점검 (Post-release)
- 스모크 체크:
  - 시/도 간 전환 후 이전 시/도의 하위 선택 표시 유지 여부
  - 다중 하위 선택 시 마지막 선택 해제 전까지 상위 표시 유지 여부
  - `시/도 전체`와 하위 선택 상호배타가 깨지지 않는지 확인

## 5. 롤백 절차
- 롤백 조건:
  - FR-023 핵심 시나리오 1건 이상 실패
  - 상호배타(FR-019/FR-021) 회귀 발생
- 롤백 단계:
  1. 직전 안정 커밋으로 배포 버전 복구
  2. 실패 테스트 케이스를 고정해 재현
  3. 패치 후 `npm test`, `npm run lint`, `npm run build` 재실행
