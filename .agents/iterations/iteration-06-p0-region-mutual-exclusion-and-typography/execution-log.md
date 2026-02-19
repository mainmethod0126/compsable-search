# Iteration 06 실행 로그

## 메타
- 이터레이션: `iteration-06-p0-region-mutual-exclusion-and-typography`
- 갱신일: `2026-02-19`
- 이번 반영 범위: `T-145~T-152`

## 1. 정의 (T-145, T-149)
### 1.1 시/도 전체-하위 시/군/구 상호 배타 판정 기준 (FR-019/AC-019, FR-021/AC-021)
| 시나리오 | 선택 순서 | 기대 결과 |
| --- | --- | --- |
| 동일 시/도에서 `전체` → 하위 시/군/구 | `서울특별시 전체` 선택 후 `강남구 > 역삼동` 선택 | `서울특별시 전체` 조건 제거, 마지막 선택만 유지 |
| 동일 시/도에서 하위 시/군/구 → `전체` | `부산광역시 해운대구` 선택 후 `부산광역시 전체` 선택 | `해운대구` 조건(UI 체크/칩/내부 상태) 즉시 제거 |
| 타 시/도 교차 선택 | 서울 조건 + 부산 조건 | 상호 배타는 동일 시/도 범위에만 적용 |
| 시/군/구 목록 갱신 직후 | 시/도 변경 또는 `서울특별시 전체` 체크 후 해제 | `강남구` 자동 `current`/선택 금지, 명시 선택 전 하위 비선택 유지 |

### 1.2 지역 항목 타이포그래피 기준 (FR-022/AC-022)
| 항목 | 기준 |
| --- | --- |
| 공통 타이포그래피 클래스 | `.cs-region-typography` |
| `font-family` | `inherit` |
| `font-size` | `14px` |
| `font-weight` | `400` |
| `line-height` | `1.4` |
| 상태(`selected/current/hover`) 허용 변경 속성 | `color`, `background-color`, `border-color` 중심 |
| 상태에서 금지되는 변경 속성 | `font-family`, `font-size`, `font-weight`, `line-height` |

## 2. 구현 (T-146, T-150)
- 상호 배타 및 자동 선택 금지 핵심 경계를 코드 기준으로 유지/검증했다.
  - `src/components/selectionPolicy.ts`
  - `src/components/RegionDetailPanel.tsx`
  - `src/components/SelectableRegionColumn.tsx`
- 타이포그래피 일관성 경계(`.cs-region-typography`)를 유지하면서 hover 상태를 명시했다.
  - `src/components/ComposableSearch.css`
  - `.cs-region-item:hover`, `.cs-checkable-item:hover` 추가
  - hover에서도 타이포그래피 속성 재정의 없음

## 3. 검증 (T-147, T-151)
### TDD 로그
- Red:
  - `src/styleIsolation.test.ts`에 상태(`selected/current/hover`)의 타이포그래피 비재정의 계약 테스트를 추가했다.
  - 초기 실행에서 `.cs-region-item:hover` 규칙 부재로 실패를 확인했다.
- Green:
  - `src/components/ComposableSearch.css`에 hover 스타일을 추가해 실패 테스트를 통과시켰다.
- Refactor:
  - 상태 클래스 검증 로직을 `extractRuleBody` 유틸로 분리해 테스트 가독성을 개선했다.

### 자동화 검증 범위
- 상호 배타/자동 선택 금지:
  - `src/components/selectionPolicy.test.ts`
  - `src/components/ComposableSearch.test.tsx`
- 타이포그래피/상태 스타일:
  - `src/styleIsolation.test.ts`
  - `src/components/ComposableSearch.test.tsx`

### 실행 명령/결과
- `npm test` → `9 files, 57 tests` 통과
- `npm run lint` → 통과
- `npm run build` → 통과

## 4. 운영 준비 (T-148, T-152)
- 이터레이션 6 릴리스 런북을 신규 작성했다.
  - `.agents/iterations/iteration-06-p0-region-mutual-exclusion-and-typography/release-runbook.md`
- 관측 포인트를 아래 기준으로 고정했다.
  - 동일 시/도 충돌 조건 자동 해제 누락 여부
  - 시/군/구 자동 current fallback 재발 여부
  - 체크박스 라벨 vs 일반 item 타이포그래피 불일치 여부
- 롤백 조건/절차를 FR-019/FR-021/FR-022 중심으로 정의했다.

## 5. 잔여 리스크
- 타이포그래피 정합성의 브라우저 범위(Chromium 외) 기준은 `TBD`
- AC-019/AC-021 테스트의 CI 필수 게이트 정책은 `TBD`
- 버전 태깅(`0.1.x` vs `0.2.0`) 정책은 `TBD`
