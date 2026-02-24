# Iteration 09 디자인 핸드오프

## 메타
- 이터레이션: `iteration-09-p0-region-search-preview-experience`
- 관련 Task: `T-176`
- 작성일: `2026-02-24`

## 1. 컴포넌트 계약
- 신규 컴포넌트: `RegionSearchInput`
- 위치 계약:
  - 배치: `cs-selector-area` 바로 아래의 형제 영역(`cs-region-search-area`)
  - 제약: `cs-detailed-area` 외부

## 2. 스타일 계약
- 입력 컨테이너: `border-radius: 10px`, 기본 border `#bec8d2`
- 포커스 상태: `focus-within`에서 파란 계열 경계 강조
- 미리보기 리스트:
  - `max-height: 180px`
  - `overflow-y: auto`
  - hover 배경 `#f0f6ff`

## 3. 아이콘 슬롯 계약
- `RegionSelectOptions.searchInputIcon?: ReactNode`
- 미지정 시 기본 검색 SVG를 렌더링한다.

## 4. 텍스트 계약
- 라벨: `RegionSelectOptions.searchInputLabel` (기본값 `지역 검색`)
- 플레이스홀더: `RegionSelectOptions.searchInputPlaceholder`
- 빈 결과: `RegionSelectOptions.searchNoResultMessage`
- 기본 안내: `RegionSelectOptions.searchIdleMessage`

## 5. 접근성 계약
- 입력은 라벨 연결(`label[htmlFor]`)과 `aria-label`을 함께 제공
- 미리보기 항목은 버튼 요소로만 렌더링
- 마우스/키보드 포커스 가능 상태를 유지


