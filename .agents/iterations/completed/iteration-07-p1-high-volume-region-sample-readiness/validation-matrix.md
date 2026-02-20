# Iteration 07 자동 검증 매트릭스

## 메타
- 이터레이션: `iteration-07-p1-high-volume-region-sample-readiness`
- 관련 Task: `T-165`, `T-166`, `T-167`
- 갱신일: `2026-02-19`
- 관련 스크립트: `npm test`, `npm run test:large`

## 1. 프로파일별 자동 검증 매트릭스
| 프로파일 | 핵심 시나리오 | 검증 위치 |
| --- | --- | --- |
| `small` | 기본 콜백 계약/상호 배타/키워드 모델 | `src/components/ComposableSearch.test.tsx`, `src/components/callbackContract.test.tsx` |
| `medium` | 전환 후 상태 초기화/콜백 로그 유지 | `src/App.test.tsx` |
| `large` | 열기/선택/해제/전체선택/초기화 + 콜백 계약 | `src/components/ComposableSearch.test.tsx` (`large` 시나리오), `src/DemoService.test.ts` |

## 2. 성능 기준선 정책
- 정책 선택: **상대 비교 우선**
  - 환경 편차를 고려해 절대 임계값(ms) 고정보다 직전 기준선 대비 편차를 우선 감시한다.
- 측정 포인트:
  - 패널 오픈 시간
  - 첫 선택 반영 시간
- 측정 수집 경로:
  - 데모 UI `프로파일별 성능 기준선` 패널(`src/App.tsx`)
- 판정 방식:
  - 동일 환경 반복 측정 시 직전 기준선 대비 ±20% 이내를 정상 범위로 본다.
  - 절대 임계값은 운영 데이터 축적 후 확정(`TBD`).

## 3. CI 실행 분리 전략
- 기본 게이트:
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 대량 시나리오 분리:
  - `npm run test:large`를 별도 단계로 분리해 실행
  - 실패 시 대량 시나리오 관련 변경만 우선 triage

## 4. 안정성 반복 실행 결과 (`npm run test:large`, 3회)
| 실행 | 결과 | 총 소요 시간 |
| --- | --- | --- |
| Run 1 | Pass (33 tests) | 26.89s |
| Run 2 | Pass (33 tests) | 26.69s |
| Run 3 | Pass (33 tests) | 26.74s |

- 실패율: `0/3 (0%)`
- 최대 편차: 약 `0.20s` (Run1 대비 Run2)
- 결론: 대량 시나리오 테스트는 현재 기준에서 릴리스 게이트 포함 가능

## 5. 플래키 억제 적용 사항
- 결정적 데이터 생성(`src/DemoService.ts`)으로 비결정성 제거
- 프로파일 전환 시 remount 정책으로 상태 잔존 회귀 차단
- assertion은 텍스트/역할 기반으로 통일해 타이밍 의존 최소화
