# npm 배포 준비 체크리스트

## 1. 메타데이터

- `name`: 고유 패키지명(스코프 포함 여부) 확인
- `version`: SemVer 형식 확인
- `description`: 패키지 목적 명시
- `license`: 배포 정책과 일치

## 2. 엔트리와 타입

- `exports` 필드 사용 시 경로 유효성 확인
- `main`/`module`/`types` 경로가 실제 빌드 산출물과 일치
- 타입 선언(`.d.ts`) 누락 여부 확인

## 3. 배포 범위

- `files` 필드 또는 `.npmignore`로 배포 파일 범위 제어
- 테스트/개발 전용 파일이 불필요하게 포함되지 않는지 확인
- README/라이선스 파일 포함 여부 확인

## 4. 품질 게이트

- `npm run lint` 통과
- `npm run build` 통과
- `npm pack --dry-run` 결과 검토
- 필요 시 `npm pack` 생성물 설치 테스트(`npm i <tgz>`) 수행

## 5. 차단 조건

- `private: true`이면 배포 차단
- 엔트리 파일 누락 시 배포 차단
- 주요 타입/런타임 오류가 재현되면 배포 차단
