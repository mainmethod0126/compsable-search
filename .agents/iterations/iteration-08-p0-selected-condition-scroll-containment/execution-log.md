# Iteration 08 실행 로그

## 메타
- 이터레이션: `iteration-08-p0-selected-condition-scroll-containment`
- 갱신일: `2026-02-20`
- 반영 범위: `T-169 ~ T-172`

## 1. 정의 단계 완료 (`T-169`)
- 스크롤 UX 정책과 수용 기준을 확정했다.
  - `.agents/iterations/iteration-08-p0-selected-condition-scroll-containment/scroll-ux-policy.md`
- 확정값:
  - 데스크톱 상한 `144px`, 모바일 상한 `112px`
  - 세로 스크롤 전용
  - 헤더 sticky 미적용(헤더/viewport 구조 분리)

## 2. 구현 단계 완료 (`T-170`)
- 선택 조건 영역 구조를 헤더/스크롤 viewport로 분리했다.
  - `src/components/SelectedConditionBasket.tsx`
- 선택 조건 영역 스크롤/높이 상한 반응형 규칙을 추가했다.
  - `src/components/ComposableSearch.css`

## 3. 검증 단계 완료 (`T-171`)
### 3.1 TDD 로그
- Red:
  - `src/components/ComposableSearch.test.tsx`에 다수 칩 + 스크롤 viewport + 삭제/전체삭제/`onChange` 계약 테스트 추가 후 실패 확인
  - `src/styleIsolation.test.ts`에 선택 조건 스크롤 규칙 계약 테스트 추가 후 실패 확인
- Green:
  - 스크롤 viewport 구조/CSS 구현으로 실패 테스트 해결
- Refactor:
  - 선택 조건 영역 책임을 `header`와 `scroll viewport`로 분리해 SRP를 강화

### 3.2 자동 검증 결과
- `npm run test -- src/components/ComposableSearch.test.tsx src/styleIsolation.test.ts` 통과
- `npm test` 통과 (`10 files, 66 tests`)
- `npm run lint` 통과
- `npm run build` 통과

## 4. 운영 준비 완료 (`T-172`)
- 수동 QA 체크리스트 작성:
  - `.agents/iterations/iteration-08-p0-selected-condition-scroll-containment/manual-qa-checklist.md`
- 관측/롤백 런북 작성:
  - `.agents/iterations/iteration-08-p0-selected-condition-scroll-containment/release-runbook.md`

## 5. 잔여 리스크
- JSDOM 환경에서는 실제 픽셀 레이아웃 계산을 검증할 수 없으므로, 모바일/데스크톱 실기기 수동 점검이 추가로 필요하다.
