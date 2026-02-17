# HWPtoRAG Frontend

[HWPtoRAG](https://hwptorag.site) 웹 변환기의 프론트엔드입니다.

HWP 파일을 드래그앤드롭하면 Markdown, JSON, RAG-JSON 등 AI/RAG에 최적화된 포맷으로 변환합니다.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + shadcn/ui + next-themes
- **State:** Zustand 5
- **Testing:** Vitest + @testing-library/react + MSW
- **Language:** TypeScript (strict mode)

## Getting Started

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run test` | 테스트 (watch mode) |
| `npm run test:run` | 테스트 일회 실행 |
| `npm run lint` | ESLint |
| `npm run types:generate` | OpenAPI → TypeScript 타입 생성 |

## Project Structure

```
app/                    # Next.js App Router 페이지
├── convert/            # 변환 페이지 (/convert, /convert/[id])
├── pricing/            # 가격 페이지
└── docs/               # API 문서

components/
├── layout/             # Header, Footer
├── ui/                 # shadcn/ui 컴포넌트
└── __tests__/          # 컴포넌트 테스트

stores/                 # Zustand 스토어 (upload, conversion, usage)
lib/                    # 유틸리티 (HWP 검증, 청크 업로드, 마크다운 변환)
mocks/                  # MSW 핸들러 및 fixture
api/                    # OpenAPI 기반 API 클라이언트
```

## Development

MSW 기반 Mock API로 백엔드 독립 개발:

```bash
# .env.local
NEXT_PUBLIC_API_MODE=mock   # 개발 시
NEXT_PUBLIC_API_MODE=real   # 프로덕션
```

## Links

- [Website](https://hwptorag.site)
- [Docs](https://hwptorag.site/docs/getting-started)
- [Pricing](https://hwptorag.site/pricing)
