# composable-search

`ComposableSearch`는 selector/detailed/selected 3영역을 조합해 검색 조건 UI를 구성하는 React 컴포넌트입니다.

## 주요 동작
- `selectorsProps` 순서대로 selector 트리거 렌더링
- `region` 트리거 클릭 시 상세 패널 open/closed 토글
- `keyword` 트리거 클릭 시 키워드 입력 패널 토글
- 시/도 -> 시/군/구 -> 읍/면/동 3단계 선택
- 키워드 입력 상태머신(`idle`, `typing`, `token-committed`, `max-token-reached`) 기반 토큰 생성/삭제
- Enter/Blur 토큰 확정, 빈 입력 Backspace 마지막 토큰 삭제
- 정규화(공백 정리/대소문자 정책) + 중복/길이/최대개수 제약 정책
- 선택 조건 칩 렌더링, 개별 삭제, 전체 삭제
- `region + keyword` 조합 상태를 `onChange` payload로 전달
- 동일 시/군/구에서 `전체` 조건과 상세 조건 상호 배타 처리
- 타입 계약 유틸(`resolveSelectorByType`, `isRegionSelector`, `isKeywordSelector`) 제공
- 컴포넌트 스타일은 `cs-` 네임스페이스 기반으로 스코프 격리
- 콜백 예외가 발생해도 UI 흐름은 유지되고 에러 로그(`console.error`)로 격리 처리

## 사용 예시
```tsx
import { ComposableSearch, type RegionSelectionItem } from './src/components'

<ComposableSearch
  selectorsProps={[
    {
      type: 'region',
      findAllSidos,
      findAllSigungus,
      findAllEupmyeondongs,
      options: {
        placeHolder: '지역 선택',
        onClick: () => {},
        onChange: (selectedItems) => {},
        onSelectedEupmyeondong: (selected) => {},
      },
    },
    {
      type: 'keyword',
      options: {
        placeHolder: '키워드 선택',
        label: '키워드 입력',
        inputPlaceholder: '키워드를 입력해 주세요.',
        guideText: 'Enter로 키워드 확정, 입력이 비었을 때 Backspace로 마지막 키워드 삭제',
        maxTokens: 5,
        maxTokenLength: 20,
        normalization: { casePolicy: 'lower' },
        onInvalidToken: (error, context) => {},
        onClick: () => {},
      },
    },
  ]}
/>
```

## 개발 명령
- `npm run dev`
- `npm test`
- `npm run lint`
- `npm run build`

## 문서
- 하위 호환 규칙: `docs/public-api-compatibility-rules.md`
- API 사용 가이드: `docs/api-usage-guide.md`
- 키워드 입력 상태머신: `docs/keyword-input-state-machine.md`
- 마이그레이션 노트: `docs/migration-notes/keyword-input-model-evolution.md`
- 이터레이션 3 실행 로그: `.agents/iterations/iteration-03-p1-style-and-api-hardening/execution-log.md`
- 이터레이션 3 릴리스 런북: `.agents/iterations/iteration-03-p1-style-and-api-hardening/release-runbook.md`
- 이터레이션 4 실행 로그: `.agents/iterations/iteration-04-p1-callback-and-consumer-validation/execution-log.md`
- 이터레이션 4 릴리스 런북: `.agents/iterations/iteration-04-p1-callback-and-consumer-validation/release-runbook.md`
- 이터레이션 5 실행 로그: `.agents/iterations/iteration-05-p2-keyword-model-evolution/execution-log.md`
- 이터레이션 5 릴리스 런북: `.agents/iterations/iteration-05-p2-keyword-model-evolution/release-runbook.md`
