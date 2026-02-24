# Iteration 09 지역 검색 정책

## 메타
- 이터레이션: `iteration-09-p0-region-search-preview-experience`
- 관련 Task: `T-177`
- 작성일: `2026-02-24`

## 1. 매칭 정책
- 정규화:
  - `trim`
  - 다중 공백 축약
  - 소문자 변환
- 매칭 규칙: 정규화된 `searchText.includes(query)` 부분 일치
- 최소 입력 길이: `1`

## 2. 정렬/개수 정책
- 기본 최대 노출 개수: `20`
- 오버라이드: `RegionSelectOptions.searchResultLimit`
- 정렬 우선순위:
1. 지역명 내부 매칭 시작 위치(앞쪽 우선)
2. 레벨 우선순위(`읍/면/동` > `시/군/구` > `시/도`)
3. 경로 라벨 `ko-KR` 오름차순

## 3. 노출 정책
- 지역 selector가 존재하면 검색 입력은 항상 노출한다.
- 배치: `cs-selector-area` 바깥 아래(다음 형제 영역) + `cs-detailed-area` 외부

## 4. 레벨별 선택 매핑
1. 시/도 결과 선택
- condition id: `sido.code`
- display: `{sido}>{sido 전체}>{sido 전체}`

2. 시/군/구 결과 선택
- condition id: `sigungu.code`
- display: `{sido}>{sigungu}>{sigungu 전체}`

3. 읍/면/동 결과 선택
- condition id: `eupmyeondong.code`
- display: `{sido}>{sigungu}>{eupmyeondong}`

## 5. 테스트 고정 지점
- 단위: `src/components/regionSearchModel.test.ts`
- 통합: `src/components/ComposableSearch.test.tsx`
- 콜백 계약: `src/components/callbackContract.test.tsx`


