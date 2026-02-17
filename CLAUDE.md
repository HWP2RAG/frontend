# HWPtoRAG — Project Rules

## Development Approach

- **TDD 필수**: 모든 기능은 테스트를 먼저 작성한 후 구현한다. Red → Green → Refactor 사이클을 엄격히 따른다.
- **Mock API**: 개발 시 MSW 기반 Mock 서버 사용. `NEXT_PUBLIC_API_MODE=mock` (dev) / `NEXT_PUBLIC_API_MODE=real` (prod) 환경변수로 전환.
- **백엔드 독립 개발**: 백엔드 팀이 별도 작업 중. OpenAPI 명세서 기반으로 API 계약을 정의하고 Mock으로 프론트 개발 진행.

## Tech Stack

- Frontend: Next.js + shadcn/ui + Zustand + next-themes
- Testing: Vitest + MSW + @testing-library/react
- Language: TypeScript (strict mode)

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run test`: 테스트 실행 (watch mode)
- `npm run test:run`: 테스트 일회 실행
- `npm run lint`: ESLint 실행
- `npm run types:generate`: OpenAPI에서 TypeScript 타입 생성

## Project Structure

```
├── app/                  # Next.js App Router 페이지
├── components/           # React 컴포넌트
│   ├── __tests__/       # 컴포넌트 테스트
│   ├── layout/          # 레이아웃 관련 컴포넌트
│   └── ui/              # shadcn/ui 컴포넌트
├── lib/                 # 유틸리티 함수
│   └── __tests__/       # 라이브러리 테스트
├── stores/              # Zustand 스토어
│   └── __tests__/       # 스토어 테스트
├── api/                 # API 클라이언트
│   └── __tests__/       # API 테스트
└── mocks/               # MSW 모킹 핸들러
```

## Key Constraints

- 파일 업로드 최대 100MB, 동시 처리 3개
- 비로그인 사용, 일일 사용량 제한
- 한국어가 주 언어 (Korean text encoding 주의: UTF-8 출력)

## Current Features

- ✅ HWP 파일 검증 (magic number, 파일 구조)
- ✅ 청크 단위 파일 업로드 (재시도 지원)
- ✅ Zustand 기반 업로드 상태 관리
- ✅ 다크/라이트 테마 토글
- ✅ MSW 기반 API 모킹
- ✅ 업로드 UI (드래그앤드롭, 진행률)

## Development Commands

테스트 실행:
```bash
npm run test
```

타입 생성:
```bash
npm run types:generate
```
