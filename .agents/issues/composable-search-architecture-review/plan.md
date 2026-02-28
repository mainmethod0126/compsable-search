# Plan - ComposableSearch 0.3.0 라이브러리 구조개편 (사용성/확장성/편의성)

## 요약
- 기준선 확인(2026-02-28): `npm run lint`, `npm test`, `npm run build` 모두 통과.
- 현재 강점: 테스트 커버리지 높고, 0.2.x 계약(`top-level onChange`, `searchNoResultMessage`, selector 중복 경고 등)은 안정적.
- 핵심 미흡점: 패키지 배포 준비 미흡, selector 확장 구조 부재, 상태 제어(Controlled) 부재, 동기식 region 데이터 계약 고정.
- 확정된 방향: `0.3.0 구조개편`, `소비자 DX/제어성 우선`, `Dual ESM/CJS 배포`, `플러그인 인터페이스 도입`.

## 문서 메타
- 이슈 제목: `ComposableSearch 라이브러리 아키텍처 리뷰 및 개선 계획`
- 이슈 소스: `사용자 요청`
- 작성일: `2026-02-28`
- 작성자: `Codex`
- 상태: `Final`
- 출력 대상 경로: `.agents/issues/composable-search-architecture-review/plan.md`

## 문제 정의
### 현재 동작
- `ComposableSearch`는 region/keyword 내장 시나리오에 최적화되어 안정적으로 동작한다.
- 공개 타입과 문서 계약은 정리되어 있고 회귀 테스트가 충분하다.
- 배포는 앱 빌드 중심이며 라이브러리 패키지 메타(`exports`, `main/module/types`, `peerDependencies`)가 없다.

### 기대 동작
- 외부 소비자가 패키지로 설치해 즉시 사용 가능해야 한다.
- 상태 제어를 `controlled/uncontrolled` 모두 지원해야 한다.
- region/keyword 외 selector를 코어 수정 없이 확장할 수 있어야 한다.
- 기존 소비자는 마이그레이션 경로를 따라 무중단 또는 저비용 전환이 가능해야 한다.

### 재현 조건
- 패키지 소비자 관점에서 현재 repo는 npm 라이브러리 진입 계약이 없다.
- selector 타입이 `region | keyword` 고정이라 신규 selector 추가 시 코어 수정이 필요하다.
- 외부 폼/URL 동기화를 위한 `value/defaultValue` 제어 API가 없다.

### 영향 범위
- 소비자: 대형 앱 통합 시 상태 동기화/확장 비용 증가.
- 유지보수: selector 유형 증가 시 코어 변경 폭 확대.
- 배포: 라이브러리 소비 경로가 표준화되지 않아 도입 장벽 존재.

## 성공 기준 / 비목표
### 성공 기준
- [x] `0.3.0`에서 Dual ESM/CJS + 타입 선언 + CSS export 포함 패키지 배포 가능.
- [x] `ComposableSearch`가 `value/defaultValue/onValueChange` 하이브리드 제어 모델 지원.
- [x] region/keyword built-in 유지 + 외부 custom selector 플러그인 등록 가능.
- [x] 0.2.x → 0.3.0 마이그레이션 문서/어댑터/계약 테스트 제공.
- [x] `lint/test/build` + 패키지 소비(ESM/CJS) 검증 통과.

### 비목표
- UI 전면 리디자인.
- 서버 백엔드 신규 구축.
- 0.3.0에서 모든 레거시 API 즉시 제거 강제.

## 원인 가설과 검증 계획
| ID | 가설 | 근거 | 검증 방법 | 우선순위 |
| --- | --- | --- | --- | --- |
| H1 | 배포 계약 부재가 라이브러리 사용성 저하의 1순위 원인 | package 메타/exports 부재 | 패키지 fixture 앱(ESM/CJS) 설치 및 import 검증 | P0 |
| H2 | 내부 상태 고정이 소비자 DX 저하의 핵심 | controlled API 부재 | form/url-sync 통합 예제 및 테스트 통과 | P0 |
| H3 | selector 타입 고정이 확장성 병목 | union 고정 + 코어 분기 하드코딩 | custom selector plugin PoC + 계약 테스트 | P0 |
| H4 | 동기 데이터 계약 고정이 대규모/원격 데이터 확장성 제한 | RegionDataSource sync-only | async plugin 시나리오(loading/error/cancel) 통합 테스트 | P1 |

## 해결 대안 비교
| 대안 | 핵심 아이디어 | 장점 | 리스크 | 구현/검증 비용 |
| --- | --- | --- | --- | --- |
| A | 현 구조 유지 + 패키징만 추가 | 일정 짧음 | 확장성/DX 문제 잔존 | Low |
| B | 하이브리드 제어 + 플러그인 인터페이스 + 패키징 표준화 | 요구사항 균형 충족 | 마이그레이션 설계 필요 | Medium |
| C | 헤드리스 코어 완전 분리 | 장기 확장성 최대 | 초기 복잡도/학습비용 큼 | High |

## 권장 해결안
- 선택 대안: `B`
- 선택 근거:
- 사용자 우선순위(`DX/제어성`)를 직접 해결한다.
- `0.3.0` 구조개편 범위에서 플러그인 확장을 현실적인 비용으로 달성한다.
- Dual ESM/CJS 배포와 함께 실제 라이브러리 채택성을 즉시 개선한다.
- 기각 사유:
- `A`: 본질적 확장성 한계 미해결.
- `C`: 현재 요구 대비 과도한 구조 분리.

## 공개 API / 인터페이스 / 타입 변경(중요)
- 추가: `ComposableSearchProps.value?: ComposableSearchValue`
- 추가: `ComposableSearchProps.defaultValue?: ComposableSearchValue`
- 추가: `ComposableSearchProps.onValueChange?: (next: ComposableSearchValue, meta: ChangeMeta) => void`
- 추가: `ComposableSearchProps.selectors: SelectorInstance[]`
- 추가: `ComposableSearchProps.plugins?: SelectorPluginRegistry`
- 추가: `SelectorPlugin` 인터페이스(트리거/패널 렌더, 상태 전이, selection 직렬화, 검증 훅)
- 추가: `createRegionSelector`, `createKeywordSelector` 팩토리(내장 플러그인)
- 변경: `placeHolder` → `placeholder` 표준화, 0.3.x에서 alias 지원 후 경고
- 호환: `@composable-search/compat` 어댑터 제공(기존 `selectorsProps`를 새 API로 매핑)
- 패키지 계약: `exports`, `main`, `module`, `types`, `peerDependencies(react/react-dom)`, `sideEffects(css)` 명시

## 실행 계획
| 단계 | 작업 | 담당 역할 | 선행조건 | 산출물 | 완료 조건(DoD) |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.3 API 스펙 동결 | FE Lead | 없음 | RFC 문서 + 타입 초안 | 타입/이벤트/마이그레이션 규칙 승인 |
| 2 | 상태 코어 구현(hybrid controlled) | FE | 1 | 상태머신/리듀서 모듈 | controlled/uncontrolled 동치 테스트 통과 |
| 3 | 플러그인 인터페이스 도입 | FE | 1,2 | `SelectorPlugin`/registry | custom plugin 샘플 동작 |
| 4 | region/keyword를 built-in plugin으로 이관 | FE | 3 | 내장 플러그인 2종 | 기존 주요 UX 회귀 없음 |
| 5 | 레거시 어댑터(`@composable-search/compat`) 구현 | FE | 3,4 | adapter + deprecation 경고 | 기존 예제가 adapter 경유로 동작 |
| 6 | 패키지 빌드 파이프라인(Dual ESM/CJS, d.ts, css export) | FE/DevOps | 1 | build config + package.json | fixture 앱 ESM/CJS import 성공 |
| 7 | 문서/마이그레이션/예제 개편 | FE/Docs | 4,5,6 | README, API 가이드, migration guide | 신규/레거시 경로 모두 문서화 완료 |
| 8 | 릴리스 게이트 및 RC 배포 | FE/QA | 1~7 | `0.3.0-rc` 태그 | 게이트 통과 후 `0.3.0` 배포 |

## 테스트 및 검증 계획
### Unit
- 상태 코어: `value/defaultValue` 우선순위, 이벤트 병합, 메타 이벤트 정확성.
- 플러그인 계약: 필수 훅 누락 검증, selector ID 충돌 처리, 오류 격리.
- 어댑터: `selectorsProps` → `selectors/plugins` 매핑 정확성.

### Integration
- region+keyword 조합 + controlled 모드에서 양방향 동기화.
- custom selector plugin 1종(예: date-range) 등록 및 조건 칩 반영.
- async plugin(loading/error/cancel) 시나리오 동작 검증.

### Regression
- 기존 `ComposableSearch.test.tsx`, `callbackContract.test.tsx`의 핵심 시나리오 유지.
- 공개 타입 계약/가이드 계약 테스트 갱신.
- 명령: `npm run lint`, `npm test`, `npm run build`.

### Package Compatibility
- ESM 소비 fixture(예: Vite) import/렌더/스타일 적용 검증.
- CJS 소비 fixture(예: Node+Bundler) import 검증.
- 타입 해석(`tsc --noEmit`) 검증.

## 배포 / 롤백 / 운영 관측
### 배포 전략
- `0.3.0-rc.1` 사전 배포 후 `0.3.0` 정식 배포.
- 릴리스 노트에 breaking 변경, 어댑터 사용법, 제거 일정 명시.

### 롤백 전략
- 트리거: 소비자 앱에서 import 실패, controlled 루프 버그, plugin 등록 실패 급증.
- 절차: `0.2.x` latest 재지정 + `0.3.0` 배포 태그 yanked 처리 + 긴급 패치.

### 운영 관측
- 런타임 경고 카운트: deprecated API 사용량.
- 오류 로그 분류: plugin lifecycle error, controlled sync error.
- 릴리스 후 1주간 이슈/다운로드/실패 리포트 모니터링.

## 리스크 및 완화
| 리스크 | 영향도 | 가능성 | 완화 방안 | 소유자 |
| --- | --- | --- | --- | --- |
| API 복잡도 증가로 진입 장벽 상승 | H | M | 기본 preset API + 고급 plugin API 분리 문서화 | FE/Docs |
| controlled 모드 무한 루프 | H | M | 변경 메타(`source`, `selectorId`) 제공 + 루프 방지 테스트 | FE |
| 레거시 소비자 이탈 | M | M | compat 패키지 + codemod 가이드 + 단계적 제거 일정 | FE/PM |
| Dual 포맷 빌드 불일치 | M | M | fixture 기반 E2E import 테스트를 CI gate로 강제 | FE/DevOps |

## 가정 및 기본값
- React 지원 범위: `^18.3 || ^19`.
- 배포 포맷: Dual ESM/CJS + `.d.ts` + CSS export.
- 0.3.0에서 region/keyword built-in은 유지하되 구현은 plugin 기반으로 전환.
- 기존 `selectorsProps`는 core에서 제거하고 compat 경로로 이전.
- 기본 i18n 문자열은 한국어 유지, override API 제공.

## 오픈 이슈(TBD)
- compat 제거 목표 버전(`0.4` 또는 `1.0`) 확정.
- 플러그인 보안 샌드박스 수준(신뢰 경계) 정책 확정.
- SSR 최적화 가이드(Next.js/RSC 경계) 상세 범위 확정.
