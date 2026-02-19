# ComposableSearch API 사용 가이드

## 1. 빠른 시작
```tsx
import {
  ComposableSearch,
  type ComposableSearchProps,
  type RegionSelectionItem,
} from './src/components'

const props: ComposableSearchProps = {
  selectorsProps: [
    {
      type: 'region',
      findAllSidos,
      findAllSigungus,
      findAllEupmyeondongs,
      options: {
        placeHolder: '지역 선택',
        onClick: () => {},
        onChange: (selectedItems: RegionSelectionItem[]) => {},
        onSelectedEupmyeondong: (selected) => {},
      },
    },
    {
      type: 'keyword',
      options: {
        placeHolder: '키워드 선택',
        onClick: () => {},
      },
    },
  ],
}

<ComposableSearch {...props} />
```

## 2. 콜백 계약
- `region.options.onClick`
  - 지역 selector 트리거 클릭 시 항상 호출된다.
- `region.options.onChange`
  - 선택 조건이 변경될 때마다 호출된다.
  - payload 타입: `RegionSelectionItem[]`
- `region.options.onSelectedEupmyeondong`
  - 사용자가 지역 조건을 새로 확정(선택)할 때 호출된다.
  - 해제(toggle off) 시에는 호출되지 않는다.
- `keyword.options.onClick`
  - 키워드 selector 트리거 클릭 시 항상 호출된다.

## 3. 콜백 오류 처리 정책
- 콜백 내부에서 예외가 발생해도 UI 선택 흐름은 중단되지 않는다.
- 오류는 `console.error`로 기록되며 prefix는 다음과 같다.
  - `[ComposableSearch] callback error`

## 4. 권장 검증 명령
- `npm test`
- `npm run lint`
- `npm run build`
