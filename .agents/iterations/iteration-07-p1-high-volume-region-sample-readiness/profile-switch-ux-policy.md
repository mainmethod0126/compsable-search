# Iteration 07 프로파일 전환 UX 정책

## 메타
- 이터레이션: `iteration-07-p1-high-volume-region-sample-readiness`
- 관련 Task: `T-161`, `T-162`, `T-163`
- 갱신일: `2026-02-19`
- 근거 코드: `src/App.tsx`, `src/App.css`, `src/components/ComposableSearch.css`, `src/App.test.tsx`, `src/components/ComposableSearch.test.tsx`

## 1. 전환 컨트롤 정책
- 위치: 데모 헤더 아래 `demo-profile-panel` 상단
- 접근성: 라벨 `샘플 프로파일`로 `select`와 연결
- 기본값: `small`
- 옵션 표기: `profile (시/도 x 시/군/구 x 읍/면/동)`

## 2. 전환 시 상태 정책
- 프로파일 전환 즉시 `ComposableSearch`를 remount(`key=demo-search-{profile}`)한다.
- 전환 직후 초기화 대상:
  - 선택 조건(칩/체크 상태)
  - 상세 패널 열림 상태
  - 콜백 이벤트 로그
- 유지 대상:
  - 프로파일별 성능 기준선(`패널 오픈`, `첫 선택 반영`)
  - 프로파일별 콜백 호출 카운트

## 3. 레이아웃 보호 기준
- 공통:
  - 상세 패널 가로 overflow 차단(`.cs-detailed-area { overflow-x: hidden; }`)
  - 컬럼은 내부 스크롤 컨테이너로 동작(`overflow: hidden`)
- 대량 리스트:
  - 시/군/구 목록과 체크 목록은 최대 높이 + 세로 스크롤 사용
  - `max-height: 280px`, `overflow-y: auto`
- 뷰포트별:
  - 데스크톱(`>=1024px`): 3열 그리드 유지
  - 모바일(`<=768px`): 1열 스택 전환(@media)

## 4. 실패 판정 기준
- 가로 overflow로 인해 컬럼/컨텐츠가 잘림
- 항목 클릭/체크가 불가능하거나 지연으로 인식되는 상태
- 전환 후 이전 프로파일 선택 상태가 잔존
- 콜백 계약(`onClick/onChange/onSelectedEupmyeondong`) 누락/중복 이상
