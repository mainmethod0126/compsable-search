# Generic Selector 전면 재설계 플랜 (잔여 한계점 4종 해결)

## 요약
현재 남아 있는 한계점 4개를 한 번에 해결하기 위해 `ComposableSearch`를 `완전 Generic Selector 아키텍처`로 전면 재설계한다.  
사용자 결정사항을 반영해 `0.x 트랙 유지`, `완전 교체(브리지 없음)`, `Sync+Async 겸용 데이터 계약`으로 진행한다.

## 문서 메타
- 이슈 제목: `잔여 한계점 전면 개선 (Generic Selector 재설계)`
- 이슈 소스: `사용자 요청: 나머지 한계점을 고치는 플랜`
- 작성일: `2026-03-02`
- 작성자: `Codex`
- 상태: `Final`
- 기준 출력 경로: `.agents/issues/generic-selector-redesign/plan.md`

## 문제 정의
### 현재 동작
- selector 타입이 `region | keyword`로 고정되어 커스텀 selector 확장이 어렵다.
- `RegionDataSource`가 동기 함수 계약이라 원격/비동기 데이터 흐름 대응이 제한된다.
- plugin 훅이 `onInit/onDispose` 중심이라 런타임 이벤트 확장성이 낮다.
- plugin 바인딩이 객체 참조 동일성에 민감해 재렌더 시 불필요한 재바인딩 가능성이 있다.

### 기대 동작
- selector 타입을 문자열 기반으로 일반화해 사용자 정의 selector를 1급 시민으로 지원한다.
- 동기/비동기 데이터 로더를 동시에 수용하고 취소/경합(race) 제어를 제공한다.
- plugin이 lifecycle + selection/panel/error 이벤트를 수신할 수 있어 확장 포인트가 충분하다.
- plugin/selector 재바인딩이 ID/버전 기반으로 안정적으로 동작한다.

### 재현 조건
- 현재 공개 타입 및 런타임 구현(`publicTypes`, `ComposableSearch`, `callbackPipeline`) 기준.
- 기존 테스트는 region/keyword 중심 계약에 강하게 결합되어 있음.

### 영향 범위
- 공개 타입/런타임/테스트/문서/패키징 모두 영향.
- 기존 사용자 코드에 breaking change 발생(완전 교체 전략).

## 성공 기준 / 비목표
### 성공 기준
- [ ] selector 타입을 문자열 일반화한 신규 공개 API가 동작한다.
- [ ] region/keyword가 신규 Generic Driver 위에서 동작한다.
- [ ] 데이터 로더가 `sync + async`를 모두 지원하고 race/cancel 테스트를 통과한다.
- [ ] plugin 이벤트 확장(`onSelectionChange`, `onPanelOpenChange`, `onError`)이 동작한다.
- [ ] plugin 재바인딩이 참조 변경과 무관하게 `id+version` 기준으로 안정 동작한다.
- [ ] `npm test`, `npm run lint`, `npm run build`, `npm run build:lib`, `npm run verify:package` 통과한다.

### 비목표
- 기존 `selectorsProps/onChange`와의 병행 지원.
- 0.3.x 완전 호환 유지.

## 원인 가설과 검증 계획
| ID | 가설 | 근거 | 검증 방법 | 우선순위 |
| --- | --- | --- | --- | --- |
| H1 | 타입 고정 구조가 확장성 병목 | `SelectorType`이 region/keyword 고정 | 타입 일반화 후 커스텀 selector e2e 추가 | P0 |
| H2 | 동기 데이터 계약이 비동기 UX 제약 | `RegionDataSource`가 sync 함수만 정의 | async loader + cancel/race 테스트 | P0 |
| H3 | plugin 훅 범위 부족 | 현재 lifecycle 훅만 중심 | 이벤트 훅 추가 후 callback 계약 테스트 | P1 |
| H4 | 참조 기반 비교가 불필요 재바인딩 유발 | runtime binding이 참조 비교 사용 | id/version 기반 바인딩 키 테스트 | P1 |

## 해결 대안 비교
| 대안 | 핵심 아이디어 | 장점 | 리스크 | 구현/검증 비용 |
| --- | --- | --- | --- | --- |
| A | 현 구조 유지 + 부분 보강 | 변경량 작음 | 한계점 대부분 미해결 | Low |
| B | Generic 전환 + Dual-run 브리지 | 전환 리스크 완화 | 코드/문서 복잡도 급증 | High |
| C | Generic 전면 교체(브리지 없음) | 구조 단순, 최종 목표 직행 | 단기 breaking 비용 큼 | High |

## 권장 해결안
- 선택 대안: `C (Generic 전면 교체, 브리지 없음)`
- 선택 근거:
1. 사용자 의사결정이 `전면 재설계 + 완전 교체`로 확정됨.
2. 장기 확장성(새 selector 추가, 이벤트 확장, async 처리)에서 가장 일관된 구조를 제공함.
3. 0.x 트랙 유지로 breaking 수용이 가능함.
- 기각 대안:
1. `A`: 근본 병목(H1~H4) 해결 불가.
2. `B`: 병행 유지 비용이 과도하고 아키텍처 복잡도 증가.

## 공개 API/인터페이스 변경 (중요)
### 1) 핵심 타입
```ts
export type MaybePromise<T> = T | Promise<T>

export interface SelectionItem {
  id: string
  displayName: string
  selectorId: string
  selectorType: string
  payload?: unknown
}

export interface ValueChangeMeta {
  source: 'selector' | 'external'
  selectorId?: string
  selectorType?: string
  reason: 'add' | 'remove' | 'replace' | 'clear'
}
```

### 2) Generic Selector 계약
```ts
export interface SelectorLoadContext {
  signal: AbortSignal
}

export interface SelectorPanelProps<TProps = unknown> {
  selectorId: string
  selectorType: string
  props: TProps
  selectedItems: SelectionItem[]
  setSelectedItems: (next: SelectionItem[]) => void
  closePanel: () => void
  emitError: (error: unknown) => void
}

export interface SelectorDriver<TProps = unknown> {
  type: string
  getTriggerLabel: (props: TProps) => string
  renderPanel: (props: SelectorPanelProps<TProps>) => React.ReactNode
  onInit?: (ctx: { selectorId: string; selectorType: string; props: TProps }) => void
  onDispose?: (ctx: { selectorId: string; selectorType: string; props: TProps }) => void
}
```

### 3) Selector 정의/생성
```ts
export interface SelectorDefinition<TProps = unknown> {
  id: string
  type: string
  version?: string | number
  props: TProps
  driver: SelectorDriver<TProps>
}

export function createSelector<TProps>(definition: SelectorDefinition<TProps>): SelectorDefinition<TProps>
```

### 4) Plugin 계약 확장
```ts
export interface SelectorPlugin {
  id: string
  version?: string | number
  onInit?: (ctx: PluginContext) => void
  onDispose?: (ctx: PluginContext) => void
  onSelectionChange?: (event: SelectionChangeEvent) => void
  onPanelOpenChange?: (event: PanelOpenChangeEvent) => void
  onError?: (event: SelectorErrorEvent) => void
}
```

### 5) `ComposableSearchProps` (신규 표준)
```ts
export interface ComposableSearchProps {
  selectors: SelectorDefinition[]
  value?: SelectionItem[]
  defaultValue?: SelectionItem[]
  onValueChange?: (nextValue: SelectionItem[], meta: ValueChangeMeta) => void
  plugins?: Record<string, SelectorPlugin>
  className?: string
  style?: React.CSSProperties
}
```

### 6) 제거 대상
- `selectorsProps`, `onChange`
- 기존 region/keyword 전용 타입 의존적 value 계약
- legacy adapter (`adaptLegacySelectorsProps`)

## 실행 계획
| 단계 | 작업 | 담당 역할 | 선행조건 | 산출물 | 완료 조건(DoD) |
| --- | --- | --- | --- | --- | --- |
| 1 | 신규 타입/계약 초안 확정 및 RFC 문서화 | FE Lead | 없음 | RFC + 타입 초안 | API 표면 확정, 미결정 0건 |
| 2 | Generic core state 엔진 구현(value merge/meta) | FE | 1 | `valueStateCoreV2` | unit 테스트 통과 |
| 3 | Generic selector runtime(트리거/패널/선택) 구현 | FE | 2 | `ComposableSearchV2` | integration 테스트 통과 |
| 4 | async loader/cancel/race 제어 추가 | FE | 3 | load context + abort 처리 | race/cancel 회귀 0건 |
| 5 | built-in region/keyword driver를 V2 위로 이식 | FE | 3,4 | `drivers/region`, `drivers/keyword` | 기존 UX 시나리오 통과 |
| 6 | plugin 이벤트 버스 확장 + 안정 바인딩 키 적용 | FE | 3 | plugin runtime | `id+version` 재바인딩 테스트 통과 |
| 7 | 엔트리 export/패키징/verify 스크립트 정리 | FE/Release | 1~6 | index exports + scripts | ESM/CJS verify 통과 |
| 8 | 문서/마이그레이션 가이드 전면 갱신 | Docs/FE | 1~7 | README + migration vNext | 예제 코드 컴파일 통과 |
| 9 | 전체 게이트 + 릴리스 준비(0.x breaking) | QA/Release | 1~8 | 테스트 리포트 + 릴리스 노트 | 필수 커맨드 전부 통과 |

## 테스트 및 검증 계획
### Unit
- Generic value 엔진: add/remove/replace/clear/meta reason 검증
- plugin bus: lifecycle + selection/panel/error dispatch 검증
- binding key: 동일 `id+version`에서 재바인딩 없음 검증
- async loader 유틸: abort/race 처리 검증

### Integration
- region driver async 시나리오: 로딩/에러/취소/재시도
- keyword driver 입력 시나리오: 기존 정책(max tokens/normalize) 유지
- custom selector 샘플 드라이버 1종 동작 검증
- 다중 selector 동시 사용 시 value merge 및 panel 전환 검증

### Regression
- 기존 주요 사용자 시나리오(지역 선택, 키워드 추가/삭제, 전체 삭제) 동등 동작 검증
- ESM/CJS import/export smoke
- style export 및 패키지 구조 검증

### 성능
- 대량 region 데이터에서 패널 오픈/검색 반응 시간 기준선 측정
- 불필요 rebind/re-render 횟수 계측

### 보안/안정성
- plugin/error 경로에서 예외 격리
- abort 누락으로 인한 state update after unmount 방지 검증

## 배포 / 롤백 / 운영 관측
### 배포 전략
- `0.x breaking` 릴리스로 배포 (`0.5.0` 목표).
- changelog에 breaking 목록과 이전 API 제거 항목을 명시.
- 문서 첫 화면에 “V2 Generic API 전용” 표시.

### 롤백 전략
- 트리거: 배포 후 주요 소비자 CI 실패율 상승 또는 런타임 오류 급증.
- 절차: npm dist-tag를 직전 안정 버전(0.3.x 라인)으로 즉시 전환, 문제 버전 deprecate 처리.

### 운영 관측
- 지표: panel open latency, selection commit latency, plugin error count
- 로그 포인트: selector init/dispose, async load cancel/error, value change meta
- 알람 조건: plugin error rate 임계치 초과, async load timeout 비율 급증

## 리스크 및 완화
| 리스크 | 영향도 | 가능성 | 완화 방안 | 소유자 |
| --- | --- | --- | --- | --- |
| 전면 교체로 소비자 마이그레이션 부담 증가 | H | H | 상세 migration guide + codemod 예시 제공 | FE Lead |
| Generic 전환 중 타입 복잡도 급증 | H | M | 타입 레이어를 core/public로 분리, 계약 테스트 강화 | FE |
| async 도입으로 race/메모리 누수 회귀 | H | M | AbortSignal 강제 + unmount safety 테스트 | FE/QA |
| plugin 이벤트 확장으로 런타임 오버헤드 증가 | M | M | 이벤트 디스패치 최소화, perf 테스트 도입 | FE |
| 문서-코드 불일치 재발 | M | M | 계약 테스트 + README 예제 컴파일 smoke 추가 | FE/Docs |

## 오픈 이슈(TBD)
- 없음 (현재 플랜 기준 구현 의사결정 완료)

## 가정 및 기본값
- 범위는 남은 한계점 4개 모두 해결한다.
- 확장 모델은 `완전 Generic Selector`로 고정한다.
- 마이그레이션은 `완전 교체`로 진행하며 브리지는 제공하지 않는다.
- 데이터 계약은 `Sync+Async 겸용(MaybePromise)`으로 고정한다.
- 릴리스 트랙은 `0.x 유지`로 진행한다.
