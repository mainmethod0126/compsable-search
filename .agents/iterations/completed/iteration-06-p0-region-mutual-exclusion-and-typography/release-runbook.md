# Iteration 06 릴리스 런북

## 메타
- 이터레이션: `iteration-06-p0-region-mutual-exclusion-and-typography`
- 갱신일: `2026-02-19`
- 대상 범위: `US-037`, `US-038` (`FR-019`, `FR-021`, `FR-022`)

## 1. 사전 점검 (Pre-release)
- 코드 게이트:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 상호 배타/자동 선택 금지 스모크:
  - `서울특별시 전체` ↔ `서울특별시 강남구` 전환 시 마지막 선택만 유지
  - `부산광역시 해운대구` 선택 후 `부산광역시 전체` 체크 시 `해운대구` 즉시 해제
  - 시/도 변경 또는 `서울특별시 전체` 체크 후 해제 직후 `강남구` 자동 `current`/선택 미발생
- 타이포그래피 스모크:
  - 시/군/구 `시/도 전체` 체크박스 라벨, 읍/면/동 체크박스 라벨, 일반 지역 item의 타이포그래피 동일성 확인
  - `selected/current/hover` 상태에서 타이포그래피 속성 불변 확인

## 2. 관측/알람 기준
- 상호 배타 회귀 알람:
  - 조건: 동일 시/도에서 `전체`와 하위 시/군/구가 동시에 남는 상태 탐지
  - 조치: `selectionPolicy.ts` 충돌 필터링 분기, `RegionDetailPanel.tsx` 토글 경계 점검
- 자동 선택 금지 회귀 알람:
  - 조건: 시/군/구 목록 갱신 직후 first-item `current` 자동 지정 재발
  - 조치: `SelectableRegionColumn.tsx`의 `effectiveCurrentRegionCode` 계산과 key 리셋 동작 점검
- 타이포그래피 회귀 알람:
  - 조건: 체크박스 라벨과 일반 item 간 `font-family/size/weight/line-height` 불일치
  - 조치: `.cs-region-typography`와 상태 클래스(`.is-selected`, `.is-current`, `:hover`)의 속성 변경 여부 점검
- 임계값 정책:
  - 빌드/테스트 실패 허용치: `0`
  - 브라우저 범위 확대 임계값: `TBD`

## 3. 배포 후 스모크 체크 (Post-release)
1. `서울특별시` 선택 후 `서울특별시 전체` 체크/해제, `강남구` 자동 선택 미발생 확인
2. `부산광역시 > 해운대구` 선택 후 `부산광역시 전체` 체크 시 하위 체크/칩 동시 해제 확인
3. 타 시/도 교차 선택(서울 + 부산)에서 비충돌 조건 유지 확인
4. `시/도 전체` 체크박스 라벨과 일반 item 텍스트의 타이포그래피 동일성 확인
5. 읍/면/동 체크박스 hover 및 일반 item hover에서 타이포그래피 변화 없음 확인

## 4. 롤백 절차
- 롤백 조건:
  - FR-019/FR-021/FR-022 핵심 시나리오 중 1건 이상 실패
  - 선택 상태(UI 체크/칩/내부 상태) 동기화 불일치 1건 이상 재현
- 롤백 단계:
1. 직전 안정 버전으로 복구
2. 실패 케이스를 `selectionPolicy.test.ts`, `ComposableSearch.test.tsx`, `styleIsolation.test.ts`로 재현 고정
3. 패치 반영 후 `npm test`, `npm run lint`, `npm run build` 재실행

## 5. Triage 포인트
- 상태 전이/상호 배타:
  - `src/components/selectionPolicy.ts`
  - `src/components/RegionDetailPanel.tsx`
  - `src/components/SelectableRegionColumn.tsx`
- 스타일/타이포그래피:
  - `src/components/ComposableSearch.css`
  - `src/styleIsolation.test.ts`
- 통합 시나리오 검증:
  - `src/components/ComposableSearch.test.tsx`
