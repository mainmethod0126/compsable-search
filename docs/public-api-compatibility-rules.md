# 공개 API 호환 규칙 (0.5)

문서 버전 `v0.5` · 적용 범위 `0.5.x` · 마지막 갱신 `2026-03-04`

## 1. 설치

```bash
npm install compsable-search react react-dom
```

- React peer dependency 계약: `react`, `react-dom` = `^18.3.0 || ^19.0.0`
- 스타일 엔트리 계약: `import 'compsable-search/style.css'` 1회 import

## 2. 최소 예제 계약

- `ComposableSearchProps.selectors`는 required다.
- `selectors`는 최소 1개 이상이어야 한다.
- 상태/이벤트 계약은 `value/defaultValue/onValueChange` 조합이다.
- `ChangeMeta.source` 허용값은 `selector | external`만 유지한다.
- selector 옵션 표준 키는 `placeholder`다.
- deprecated 필드(`selectorsProps`, `onChange`, `placeHolder`)는 0.5 공개 API에서 제거되었으며 재도입 금지다.

```tsx
<ComposableSearch
  selectors={selectors}
  value={value}
  onValueChange={(nextValue, meta) => {
    // meta.source: selector | external
  }}
/>
```

## 3. 검증 API 및 즉시 오류 정책

### 3.1 공개 검증 API

- `validateComposableSearchConfiguration(config)`:
  - 결과: `{ isValid, issues }`
- `assertComposableSearchConfiguration(config)`:
  - 첫 이슈를 `ComposableSearchConfigurationError`로 throw

### 3.2 런타임 정책

- `ComposableSearch`는 렌더 시작 시 `assertComposableSearchConfiguration`을 수행한다.
- 아래 케이스는 경고가 아니라 즉시 오류다.
  - `selectors` 누락
  - `selectors` 빈 배열
  - duplicate `selector.type`
  - `plugin.type`과 selector type 불일치

### 3.3 에러 코드 4종 및 해결 가이드

| 코드 | 의미 | 해결 가이드 |
| --- | --- | --- |
| `MISSING_SELECTORS` | `selectors`가 전달되지 않음 | `selectors` 필드를 필수로 전달하고 최소 1개의 selector를 등록 |
| `EMPTY_SELECTORS` | `selectors` 길이가 0 | `region`, `keyword` 또는 커스텀 selector를 1개 이상 등록 |
| `DUPLICATE_SELECTOR_TYPE` | 동일 `selector.type`이 2개 이상 | 중복 type selector를 제거하거나 type을 분리 |
| `PLUGIN_SELECTOR_TYPE_MISMATCH` | `plugin.type`에 대응되는 selector type 없음 | plugin type 또는 selector 구성을 일치 |

## 4. 마이그레이션 및 호환성 규칙

### 4.1 0.4.x -> 0.5 전환 기준

| 항목 | 0.4.x | 0.5 |
| --- | --- | --- |
| selector 전달 | `selectors` 권장 | `selectors` 필수 |
| 이벤트 핸들러 | `onValueChange` 중심 | `onValueChange`만 사용 |
| 옵션 키 | `placeholder` 중심 | `placeholder`만 사용 |
| duplicate selector type | 우회 가능 정책 존재 | 즉시 오류(`DUPLICATE_SELECTOR_TYPE`) |
| plugin type mismatch | 우회 가능 정책 존재 | 즉시 오류(`PLUGIN_SELECTOR_TYPE_MISMATCH`) |

### 4.2 0.5.x에서의 허용/금지 변경

| 구분 | 허용 | 금지 |
| --- | --- | --- |
| 타입 필드 | additive 확장(새 optional 필드/타입 export) | `selectors`를 optional로 되돌리는 변경 |
| 이벤트 계약 | `onValueChange` 메타의 additive 확장 | `meta.source`에 `selector | external` 외 값 추가 |
| 구성 검증 | 검증 유틸 추가 | 4개 에러 코드 의미/동작 변경 |
| 런타임 정책 | 오류 메시지/가이드 개선 | duplicate type, plugin mismatch를 경고로 낮추는 변경 |
| 레거시 필드 | 문서상 제거 상태 유지 | `selectorsProps`, `onChange`, `placeHolder` 재노출/재지원 |

### 4.3 검증 게이트

- 타입/계약 회귀: `npm test`
- 정적 검증: `npm run lint`
- 빌드 검증: `npm run build`
