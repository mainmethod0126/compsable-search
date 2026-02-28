# Plan - ComposableSearch 구조 품질 점검 및 무중단 개선

## 요약
- 현재 기준선 결과: `npm run lint` 통과, `npm test` 통과, `npm run build` 실패.
- 목표: 0.2.x 하위 호환을 유지하면서 확장성, 사용성, 범용성, 편의성, 재사용성 저해 요인을 제거한다.
- 사용자 선택 전략: `무중단 점진개선`.
- 출력 경로(계획 문서 기준): `.agents/issues/composable-search-architecture-review/plan.md`

## 문서 메타
- 이슈 제목: `ComposableSearch 구조 품질 점검 및 개선`
- 이슈 소스: `사용자 요청(전체 코드 리뷰 + 개선 plan 문서화)`
- 작성일: `2026-02-28`
- 작성자: `Codex`
- 상태: `Final`
- 적용 릴리스 목표: `0.2.x (non-breaking)`

## 핵심 발견사항 (심각도 순)
1. `P0` 빌드가 깨진 상태다. `regionSelector` null 안전성 미보장으로 TS18048 발생.  
   근거: [ComposableSearch.tsx:345](D:/Project/compsable-search/src/components/ComposableSearch.tsx:345), [ComposableSearch.tsx:346](D:/Project/compsable-search/src/components/ComposableSearch.tsx:346), [ComposableSearch.tsx:347](D:/Project/compsable-search/src/components/ComposableSearch.tsx:347), [ComposableSearch.tsx:349](D:/Project/compsable-search/src/components/ComposableSearch.tsx:349)
2. `P1` selector 다건 확장 시 동작이 비일관적이다. 렌더는 `selectorsProps` 전체를 순회하지만 실제 패널 데이터는 타입별 첫 selector만 사용한다.  
   근거: [ComposableSearch.tsx:97](D:/Project/compsable-search/src/components/ComposableSearch.tsx:97), [ComposableSearch.tsx:102](D:/Project/compsable-search/src/components/ComposableSearch.tsx:102), [ComposableSearch.tsx:298](D:/Project/compsable-search/src/components/ComposableSearch.tsx:298), [selectorTypeUtils.ts:29](D:/Project/compsable-search/src/components/selectorTypeUtils.ts:29)
3. `P1` 통합 변경 콜백이 `region.options.onChange`에 결합되어 범용성이 낮다.  
   근거: [publicTypes.ts:52](D:/Project/compsable-search/src/components/publicTypes.ts:52), [ComposableSearch.tsx:144](D:/Project/compsable-search/src/components/ComposableSearch.tsx:144), [callbackPipeline.ts:48](D:/Project/compsable-search/src/components/callbackPipeline.ts:48)
4. `P1` 접근성 ID 충돌 위험이 있다. 키워드 입력 패널이 고정 ID를 사용해 다중 인스턴스 시 중복된다.  
   근거: [KeywordDetailPanel.tsx:30](D:/Project/compsable-search/src/components/KeywordDetailPanel.tsx:30), [KeywordDetailPanel.tsx:31](D:/Project/compsable-search/src/components/KeywordDetailPanel.tsx:31), [KeywordDetailPanel.tsx:40](D:/Project/compsable-search/src/components/KeywordDetailPanel.tsx:40)
5. `P1` 공개 옵션 미사용/사각지대가 있다. `searchNoResultMessage` 선언만 있고 실제 UI 반영이 없다.  
   근거: [publicTypes.ts:49](D:/Project/compsable-search/src/components/publicTypes.ts:49), [RegionSearchInput.tsx:66](D:/Project/compsable-search/src/components/RegionSearchInput.tsx:66)
6. `P1` 삭제 로직이 문자열 prefix 규칙에 의존한다. 타입 안정성과 재사용성에 취약하다.  
   근거: [ComposableSearch.tsx:212](D:/Project/compsable-search/src/components/ComposableSearch.tsx:212), [publicTypes.ts:26](D:/Project/compsable-search/src/components/publicTypes.ts:26)
7. `P2` 성능 확장성 리스크가 있다. 전체 지역 인덱스를 메모에서 직접 빌드하며 selector 객체 재생성 시 재계산된다.  
   근거: [ComposableSearch.tsx:109](D:/Project/compsable-search/src/components/ComposableSearch.tsx:109), [App.tsx:208](D:/Project/compsable-search/src/App.tsx:208)
8. `P2` 데이터소스 교체 시 하위 선택 상태 리셋 정책이 명시적이지 않다.  
   근거: [RegionDetailPanel.tsx:56](D:/Project/compsable-search/src/components/RegionDetailPanel.tsx:56)

## 문제 정의
### 현재 동작
- 기능 테스트는 풍부하고 런타임 동작은 대체로 안정적이다.
- 그러나 타입 빌드 실패(P0), API 설계 결합, 확장 시나리오 비정합이 남아 있다.

### 기대 동작
- `lint/test/build`가 모두 통과한다.
- selector/콜백/API 계약이 타입과 런타임에서 일관적이다.
- 다중 인스턴스/대량 데이터에서도 성능과 접근성이 깨지지 않는다.

### 재현 조건
- `npm run build` 실행 시 즉시 실패.
- 동일 타입 selector 2개 이상 구성 시 패널-트리거 의미 불일치.
- ComposableSearch 다중 마운트 시 고정 ID 중복.

### 영향 범위
- 라이브러리 소비자: 통합 리스크 및 예측 불가 API 동작.
- 유지보수자: 타입 계약과 구현 계약 괴리로 회귀 위험 증가.
- 제품 품질: 대량 데이터/다중 컴포넌트 사용 시 확장성 저하.

## 성공 기준 / 비목표
### 성공 기준
- [ ] `npm run lint`, `npm test`, `npm run build` 모두 통과.
- [ ] selector 충돌 정책이 문서/테스트/런타임에서 일치.
- [ ] `searchNoResultMessage`가 실제 UI에서 동작.
- [ ] 다중 인스턴스 접근성 ID 충돌이 제거.
- [ ] 통합 변경 콜백의 권장 진입점이 top-level로 제공되고 하위 호환 유지.
- [ ] 대량 데이터에서 인덱스 재생성 호출 수가 “selector 변경 시 1회”로 제한됨(테스트 기반 검증).

### 비목표
- 전체 UI 리디자인.
- 0.2.x에서의 파괴적 API 제거.
- 서버 연동 비동기 데이터소스 전면 전환.

## 원인 가설과 검증 계획
| ID | 가설 | 근거 | 검증 방법 | 우선순위 |
| --- | --- | --- | --- | --- |
| H1 | 조건부 렌더 분기에서 타입 좁히기 누락으로 빌드 실패 | `isRegionPanelOpen`이 boolean 조합 | TS 빌드 통과 확인 + 해당 분기 단위 테스트 | P0 |
| H2 | 타입별 첫 selector 선택 정책이 명시되지 않아 동작 불일치 | `find` 기반 resolve + 전체 map 렌더 | 중복 selector 통합 테스트 추가 | P1 |
| H3 | 콜백 소유권이 region 옵션에 고정되어 범용성 저하 | dispatch가 region options만 수용 | top-level onChange 추가 후 legacy fallback 테스트 | P1 |
| H4 | 키워드 패널 고정 ID가 다중 인스턴스 충돌 유발 | static ID 문자열 하드코딩 | 컴포넌트 2개 렌더 시 aria linkage 테스트 | P1 |
| H5 | 검색 빈결과 옵션이 선언-구현 불일치 | 타입에는 있고 UI 분기에는 없음 | no-result 메시지 렌더 테스트 | P1 |
| H6 | 삭제 분기에서 문자열 규약 의존으로 타입 안정성 약화 | `conditionId.startsWith('keyword:')` | item 기반 삭제로 전환 후 회귀 테스트 | P1 |
| H7 | 인덱스 재생성 경계가 넓어 대량 데이터 확장성 저하 | selector identity 의존 memo | buildRegionSearchIndex 호출 횟수 스파이 테스트 | P2 |

## 해결 대안 비교
| 대안 | 핵심 아이디어 | 장점 | 리스크 | 구현/검증 비용 |
| --- | --- | --- | --- | --- |
| A | 최소 패치: 빌드 오류+접근성+dead option만 수정 | 빠른 안정화 | 구조적 결합 문제 잔존 | Low |
| B | 무중단 구조 개선(권장): 안정화 + 콜백/selector 정책 명확화 + 성능 경계 축소 | 품질/확장성 균형 | 변경 범위 중간 | Medium |
| C | 0.3 리디자인: 플러그인형 selector 아키텍처 전환 | 장기 확장성 최대 | breaking 변경, 마이그레이션 부담 큼 | High |

## 권장 해결안
- 선택 대안: `B (무중단 구조 개선)`
- 선택 근거:
  - 사용자 요구(확장성/범용성/재사용성)와 0.2.x 호환성 요구를 동시에 만족한다.
  - 빌드 실패(P0)와 설계 리스크(P1/P2)를 한 번에 정리할 수 있다.
- 기각 사유:
  - `A`: 근본 원인(콜백 결합, selector 정책, 성능 경계) 해결 불충분.
  - `C`: 현재 요청의 무중단 점진개선 전략과 충돌.

## 공개 API / 인터페이스 / 타입 변경
- 추가: `ComposableSearchProps.onChange?: (selectedItems: SearchSelectionItem[]) => void`  
  동작 규칙: `props.onChange` 우선, 미지정 시 `region.options.onChange` fallback.
- 유지: `RegionSelectOptions.onChange`는 0.2.x 동안 지원(legacy 경로).
- 동작 보강: `RegionSelectOptions.searchNoResultMessage`를 실제 UI에 반영.
- 문서화 강화: 동일 타입 selector 중복 시 `first-wins` 정책 + 개발 경고(`console.warn`) 명시.
- 내부 타입 강화(비공개): 키워드/지역 삭제 분기를 ID prefix가 아닌 item shape 기준으로 처리.

## 실행 계획
| 단계 | 작업 | 담당 역할 | 선행조건 | 산출물 | 완료 조건(DoD) |
| --- | --- | --- | --- | --- | --- |
| 1 | 빌드 안정화(P0): region 분기 타입 좁히기 수정 | FE | 없음 | 빌드 패치 커밋 | `npm run build` 통과 |
| 2 | selector 정책 명확화: 중복 타입 감지, first-wins 경고, 테스트 추가 | FE | 1단계 완료 | 정책 유틸 + 테스트 | 중복 selector 시 기대 동작 고정 |
| 3 | 콜백 경로 분리: top-level onChange 추가, legacy fallback 유지 | FE | 1단계 완료 | public types/API 문서/테스트 | onChange 호출 규칙 회귀 없음 |
| 4 | 접근성 개선: KeywordDetailPanel ID를 `useId` 기반으로 변경 | FE | 1단계 완료 | a11y 패치 + 테스트 | 다중 인스턴스 ID 충돌 없음 |
| 5 | 검색 UX 보강: `searchNoResultMessage` 렌더 분기 반영 | FE | 1단계 완료 | RegionSearchInput 개선 + 테스트 | 빈결과 메시지 정상 노출 |
| 6 | 삭제 로직 타입 강화: item 기반 삭제로 전환 | FE | 3단계 완료 | 내부 인터페이스 정리 + 테스트 | prefix 의존 코드 제거 |
| 7 | 성능 경계 최적화: 인덱스 생성 캐시/메모 경계 재설계 | FE | 1단계 완료 | 성능 패치 + 호출횟수 테스트 | 불필요 재생성 호출 제거 |
| 8 | 문서/가이드/마이그레이션 반영 | FE/Docs | 2~7 완료 | README, API 가이드, 호환성 문서 업데이트 | 문서와 구현 계약 일치 |

## 테스트 및 검증 계획
### Unit
- selector 충돌 정책 유틸 테스트(`first-wins`, 경고 조건).
- 콜백 우선순위 테스트(`props.onChange` vs legacy fallback).
- 키워드 패널 ID 생성 로직 테스트.

### Integration
- 동일 타입 selector 2개 구성 시 패널/콜백 일관성 검증.
- ComposableSearch 2개 동시 렌더 시 `aria-describedby` 충돌 없음 검증.
- 검색어 결과 0건일 때 `searchNoResultMessage` 노출 검증.

### Regression
- 기존 `ComposableSearch.test.tsx`, `callbackContract.test.tsx` 전체 유지.
- `publicTypeContract.test.ts`, `apiUsageGuideContract.test.ts`에 신규 API 계약 추가.
- 필수 명령: `npm run lint`, `npm test`, `npm run build`.

### 성능
- large 프로파일에서 `buildRegionSearchIndex` 호출 횟수 스파이 검증.
- 비-selector 상태 변경(로그/카운터 업데이트) 시 인덱스 재생성 없음 확인.

### 접근성
- 다중 인스턴스 렌더 시 input/hint/error ID 유일성 검증.
- 오류 메시지 `role="alert"` 연결 상태 검증.

## 배포 / 롤백 / 운영 관측
### 배포 전략
- `0.2.x` 마이너 릴리스.
- 변경 로그에 “권장 콜백 경로(top-level onChange)”와 “legacy fallback 유지” 명시.

### 롤백 전략
- 트리거: 소비자 콜백 중복 호출/누락 회귀, selector 정책 회귀.
- 절차: 직전 태그로 릴리스 롤백 + 신규 API 사용 가이드 임시 철회.

### 운영 관측
- 개발 경고 카운트: selector 충돌 경고 발생 빈도 추적.
- 콜백 오류 로깅: 기존 `[ComposableSearch] callback error` 로그 모니터링 유지.

## 리스크 및 완화
| 리스크 | 영향도 | 가능성 | 완화 방안 | 소유자 |
| --- | --- | --- | --- | --- |
| 신규 onChange 도입 시 소비자 혼선 | H | M | 우선순위 규칙 고정 + 문서/테스트/마이그레이션 예시 제공 | FE |
| selector 충돌 정책 변경으로 일부 화면 기대치 변동 | M | M | first-wins 유지 + 경고만 추가(동작 파괴 없음) | FE |
| 성능 최적화 중 회귀 가능성 | M | M | 호출횟수 테스트와 기존 회귀 세트 동시 통과 | FE |
| 문서 미동기화 | M | M | PR 체크리스트에 문서 업데이트 게이트 포함 | FE/Docs |

## 가정 및 기본값
- 호환성 정책은 `0.2.x non-breaking`을 유지한다.
- React/Vite/Vitest 기술 스택은 유지한다.
- 비동기 데이터소스 API는 이번 이터레이션의 구현 범위에서 제외하고 설계 후보로만 남긴다.
- 기존 한국어 기본 문구는 유지하되, 신규 커스터마이징 경로를 통해 확장 가능하게 한다.

## 오픈 이슈(TBD)
- 0.3.0에서 `RegionSelectOptions.onChange` legacy 경로 제거 시점.
- 동일 타입 selector 다중 지원을 “정식 기능”으로 승격할지 여부.
- 서버 연동형 비동기 지역 검색 API(`Promise` 기반) 도입 시점과 계약.
