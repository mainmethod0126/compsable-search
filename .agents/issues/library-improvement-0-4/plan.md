# ComposableSearch 0.4 개선 계획 (안정성 우선)

## 요약
- 목표 릴리스: `0.4 마이너` (하위호환 유지, breaking 금지).
- 최우선 과제: `async RegionDataSource`에서 상단 지역 검색 인덱스가 비는 안정성 결함 제거.
- 동시 개선 과제: 개발자 오사용 방지 경고 강화, 문서 온보딩 개선, 확장성 보조 API 공개.
- 완료 게이트: `lint + test + build:lib + verify:package` 전부 통과.
- 배포 방식: `0.4.0-rc` 검증 후 `0.4.0` 정식 배포.

## 문서 메타
- 이슈 제목: `라이브러리 개선사항 계획 (안정성/사용성/확장성/코드품질)`
- 이슈 소스: `사용자 요청`
- 작성일: `2026-03-04`
- 작성자: `Codex`
- 상태: `In Progress (외부 릴리스 의존으로 Step 8 차단)`
- 출력 경로(계획): `.agents/issues/library-improvement-0-4/plan.md`

## 문제 정의

### 현재 동작
- `RegionDataSource`는 타입/문서상 sync+async를 허용하지만, `ComposableSearch`의 상단 검색 인덱스 경로는 sync 배열 전제 처리로 async 시 빈 결과가 될 수 있다.
- `selectors`가 누락되어도 조용히 빈 UI가 렌더링되어 오사용을 늦게 발견한다.
- selector 중복 타입은 경고가 있으나, 실사용 가드/사전검증 도구 노출은 제한적이다.
- README/API 가이드에 설치/적용/장애 대응 관점의 온보딩 정보가 부족하다.

### 기대 동작
- sync/async RegionDataSource 모두에서 상세 패널과 상단 검색 결과가 일관되게 동작한다.
- 개발 단계에서 오사용(`selectors` 누락, plugin-selector 미매칭)을 즉시 인지할 수 있다.
- 확장성 보조 유틸을 공개해 consumer가 selector/plugin 구성 검증을 사전에 수행할 수 있다.
- 문서만 보고 설치부터 기본/고급 사용, 마이그레이션까지 재현 가능해야 한다.

### 재현 조건
- `findAllSidos/findAllSigungus/findAllEupmyeondongs` 중 하나 이상이 Promise 반환.
- 패널 오픈 후 상단 지역 검색 입력 시, 인덱스 로드 타이밍/경합에서 결과가 비거나 no-result 메시지가 오표시될 수 있음.
- `selectors` 미전달 또는 빈 배열 전달.

### 영향 범위
- 사용성: 소비자 앱에서 async 데이터소스 사용 시 검색 UX 신뢰도 저하.
- 확장성: 커스텀 selector/plugin 구성 시 사전검증 난이도 증가.
- 코드 품질: 계약(문서/타입)과 런타임 동작의 불일치로 회귀 위험 증가.

## 성공 기준 / 비목표

### 성공 기준
- [x] async RegionDataSource 환경에서 상단 검색 인덱스가 정상 로드되고 검색 결과가 노출된다.
- [x] 로딩 중에는 no-result 메시지가 노출되지 않고, 로딩 완료 후에만 no-result 정책이 적용된다.
- [x] `selectors` 누락/빈 배열 및 plugin 미매칭에 대해 개발 환경 1회 경고가 출력된다.
- [x] 확장성 보조 유틸 공개(추가 export)와 계약 테스트가 통과한다.
- [x] 문서(README/API/migration)가 0.4 계약에 맞게 동기화된다.
- [x] `npm run lint`, `npm run test`, `npm run build:lib`, `npm run verify:package` 통과.

### 비목표
- major 수준 breaking 변경(`selectors` required 타입 강제, legacy 타입 제거).
- UI 전면 재설계.
- plugin 시스템의 새로운 런타임 모델 도입.

## 원인 가설과 검증 계획

| ID | 가설 | 근거 | 검증 방법 | 우선순위 |
| --- | --- | --- | --- | --- |
| H1 | 상단 검색 인덱스 경로가 Promise 반환을 배열로 정규화하지 못한다 | sync 전제 분기 존재 | async datasource 통합 테스트 추가 후 실패 재현(RED) | P0 |
| H2 | 검색 로딩 상태 부재로 no-result 메시지 타이밍이 잘못된다 | 결과 배열만으로 상태 판단 | loading/loaded/error 상태 도입 후 UI 테스트 | P0 |
| H3 | 오사용 가드 부족이 디버깅 비용을 높인다 | selectors optional + 조용한 empty render | 개발 경고 테스트(once semantics) 추가 | P1 |
| H4 | 확장성 유틸 비공개가 사전검증 비용을 높인다 | 내부 유틸 미노출 | 추가 export + type/runtime 계약 테스트 | P1 |

## 해결 대안 비교

| 대안 | 핵심 아이디어 | 장점 | 리스크 | 구현/검증 비용 |
| --- | --- | --- | --- | --- |
| A | P0 버그만 패치 | 일정 최소화 | 사용성/확장성 개선 누락, 0.4 가치 약함 | Low |
| B | 안정성+사용성+확장성 보강(비파괴) | 0.4 마이너 목적과 일치, 실사용 가치 큼 | 테스트/문서 갱신 범위 확대 | Medium |
| C | selector/runtime 구조 대폭 재설계 | 장기 확장성 최대 | 0.4에서 과도, 사실상 major 리스크 | High |

## 권장 해결안
- 선택 대안: `B`
- 선택 근거:
- `안정성 우선` 결정을 반영하면서도 0.4 마이너에 맞는 사용자 체감 개선을 함께 달성한다.
- 하위호환을 유지해 배포 리스크를 통제할 수 있다.
- 기존 테스트/문서 자산을 재사용하면서 회귀 방어를 강화할 수 있다.
- 기각 대안과 사유:
- `A`: 버그는 줄이지만 0.4 릴리스 명분(사용성/확장성)이 약하다.
- `C`: 현재 릴리스 목표(마이너) 대비 의사결정/검증 비용이 과도하다.

## 공개 API / 인터페이스 / 타입 변경(중요)

### 변경 원칙
- `0.4`에서는 breaking 금지.
- 기존 계약(`selectors`, `onValueChange`, `meta.source`) 유지.
- additive export와 동작 보정만 수행.

### 계획된 변경
- 동작 보정: `RegionDataSource` async 계약을 상단 검색 인덱스 경로에도 동일 적용.
- 동작 보정: 지역 검색 로딩 상태를 명시적으로 관리하여 no-result 메시지 오표시 방지.
- 개발 경고 추가: `selectors` 누락/빈 배열, plugin-selector type 미매칭.
- 공개 export 추가(확장성 보조):
  - `createSelectorResolutionWarningContext`
  - `resolveSelectorsWithPolicy`
  - `validateSelectorTypeUniqueness`
- 문서 계약 갱신:
  - 설치 섹션 추가.
  - sync/async 검색 동작 보장 범위 명시.
  - 경고/중복/first-wins 정책 예시 추가.

## 실행 계획

| 단계 | 작업 | 담당 역할 | 선행조건 | 산출물 | 완료 조건(DoD) |
| --- | --- | --- | --- | --- | --- |
| 1 | P0 재현 테스트 작성(Red) | FE/QA | 없음 | async 인덱스 실패 테스트, 로딩/no-result 실패 테스트 | 현재 코드에서 실패 확인 |
| 2 | 상단 검색 인덱스 로더 리팩터링(Green) | FE | 1 | async/sync 공용 인덱스 로딩 로직, abort/race 안전 처리 | 1단계 테스트 통과 |
| 3 | 로딩 상태/메시지 정책 정렬(Refactor) | FE | 2 | 로딩 상태 모델, UI 조건식 단순화 | no-result 오표시 회귀 0건 |
| 4 | 개발 경고 가드 강화 | FE | 2 | selectors/plugin 오사용 warning-once 로직 | 경고 계약 테스트 통과 |
| 5 | 확장성 보조 export 공개 | FE | 4 | index export 업데이트, 타입 계약 테스트 | 새 export 사용 샘플 컴파일 통과 |
| 6 | 문서 동기화 | FE/Docs | 2~5 | README, API 가이드, migration 노트 업데이트 | 문서 예제-테스트 계약 통과 |
| 7 | 릴리스 게이트 수행 | FE/QA/Release | 1~6 | 검증 리포트, 0.4.0-rc 릴리스 노트 | 필수 명령 전부 통과 |
| 8 | 정식 배포 및 사후 점검 | Release | 7 | 0.4.0 태그/노트 | 48시간 이슈 모니터링 완료 |

### 진행 현황 (2026-03-04)
1. 1단계: 완료
   - 근거: `src/components/ComposableSearch.async-search.test.tsx`에 async 인덱스/no-result 타이밍 재현 시나리오(2건, `TDD Red`)를 추가했고, 현재 `npm run test`에서 통과 확인.
2. 2단계: 완료
   - 근거: `src/components/ComposableSearch.tsx`, `src/components/ComposableSearch.test.tsx` 변경 후 async/sync 공용 인덱스 로딩 경로가 반영되었고 `ComposableSearch.async-search.test.tsx` 통과로 검증.
3. 3단계: 완료
   - 근거: `src/components/ComposableSearch.tsx`의 로딩 상태 기반 메시지 정책 반영, `ComposableSearch.async-search.test.tsx`의 "로딩 중 no-result 미노출" 케이스 통과.
4. 4단계: 완료
   - 근거: `src/components/ComposableSearch.warning-guards.test.tsx`(3건) 추가 및 통과로 selectors 누락/빈 배열 + plugin-selector 미매칭 warning-once 계약 검증.
5. 5단계: 완료
   - 근거: `src/components/index.ts`, `src/index.ts`, `src/components/publicTypes.ts`에 공개 export 반영, `src/components/publicApiExports.test.ts` 및 `src/components/publicTypeContract.test.ts` 통과.
6. 6단계: 완료
   - 근거: 문서 파일 `README.md`, `docs/api-usage-guide.md`, `docs/migration-notes/0.3.0-migration.md`, `docs/migration-notes/keyword-input-model-evolution.md`, `docs/public-api-compatibility-rules.md` 갱신 및 `src/components/apiUsageGuideContract.test.ts` 통과.
7. 7단계: 완료
   - 근거: 명령 실행 결과 `npm run lint`, `npm run test`(20 files / 111 tests passed), `npm run build:lib`, `npm run verify:package` 모두 성공(Exit code 0).
8. 8단계: 차단
   - 차단 사유: 실제 `npm publish`, `0.4.0` 태깅/릴리스 노트, 배포 후 48시간 모니터링은 외부 릴리스 권한 및 시간 경과 의존 항목.

### 외부 의존 TODO (Release)
- [ ] TODO: `npm publish` 수행(`0.4.0-rc.1` 검증 후 `0.4.0` 정식 배포).
- [ ] TODO: `v0.4.0` 태그 생성 및 릴리스 노트 발행.
- [ ] TODO: 배포 후 48시간 이슈 모니터링 완료 확인(회귀/소비자 import 이슈 포함).

## 테스트 및 검증 계획

### Unit
- async 인덱스 로더: Promise resolve/reject/abort/cancel/race.
- 검색 상태 모델: `idle/loading/ready/error` 전이.
- warning-once: 동일 키 중복 경고 방지.
- selector 유틸 export: 타입 추론 및 반환 일관성.

### Integration
- async datasource(지연 응답)에서 패널 오픈 → 검색 입력 → 결과 노출.
- 로딩 중 no-result 미노출, 로딩 완료 후 no-result 노출.
- 결과 선택 시 `onValueChange` meta 정확성 유지.
- region + keyword 동시 사용 시 기존 값 병합 계약 유지.

### Regression
- 기존 전체 테스트 스위트 재실행(현재 통과 기준 유지).
- deprecated 경고/first-wins 정책 기존 계약 보존.
- 문서 계약 테스트(`apiUsageGuideContract`, `publicTypeContract`) 갱신 후 통과.

### Package / 소비자 검증
- ESM/CJS smoke 유지.
- dist 산출물(ESM/CJS/d.ts/css) 검증 유지.
- 설치/기본 예제 컴파일 smoke 추가.

## 배포 / 롤백 / 운영 관측

### 배포 전략
- `0.4.0-rc.1` 배포 후 소비자 샘플 앱 검증.
- 이상 없으면 `0.4.0` 정식 배포.
- 릴리스 노트에 “비파괴 개선 + async 검색 안정화” 명시.

### 롤백 전략
- 트리거: async 검색 결과 미노출 재발, 선택 이벤트 계약 회귀, 소비자 import 실패.
- 절차: npm dist-tag를 직전 안정 버전으로 복구하고, 결함 버전에 deprecate 공지.
- 후속: hotfix 브랜치에서 최소 수정 패치(`0.4.1`) 준비.

### 운영 관측
- 지표: 테스트 게이트 통과율, smoke 실패율, 릴리스 후 이슈 발생 건수.
- 로그 포인트: callback/plugin error 경로, warning 발생 카테고리.
- 알람 조건: RC 단계에서 async 관련 통합 테스트 실패 1건 이상.

## 리스크 및 완화

| 리스크 | 영향도 | 가능성 | 완화 방안 | 소유자 |
| --- | --- | --- | --- | --- |
| async 로더 변경으로 UI 상태 회귀 | H | M | RED→GREEN→REFACTOR 순서 고수, 통합 회귀 테스트 강화 | FE |
| 경고 추가로 테스트 노이즈 증가 | M | M | warning-once + 테스트 스파이 정규화 유틸 적용 | FE/QA |
| 문서-코드 불일치 재발 | M | M | 문서 계약 테스트를 릴리스 게이트에 포함 | FE/Docs |
| 마이너 릴리스 범위 팽창 | M | M | P0/P1 스코프 고정, P2는 후속 이슈로 분리 | FE Lead |

## 오픈 이슈(TBD)
- `selectors`를 타입 레벨 required로 승격할 버전(1.0 여부) 확정.
- React peer 범위를 `^18.3 || ^19`로 확장할지 여부 결정.
- plugin validation을 빌드 게이트 기본 포함할지 여부 결정.

## 가정 및 기본값
- 릴리스는 `0.4 마이너`이며 breaking change는 허용하지 않는다.
- 우선순위는 안정성(P0)이며, 사용성/확장성(P1)은 비파괴 범위에서 포함한다.
- 기존 deprecated 정책(`type-only compat`)은 유지한다.
- 기존 디자인/컴포넌트 구조는 유지하고 계약 정합성 중심으로 개선한다.
