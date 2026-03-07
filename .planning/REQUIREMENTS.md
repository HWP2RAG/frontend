# Requirements: HWPtoRAG Collab Frontend

**Defined:** 2026-03-07
**Core Value:** HWPX 문서를 브랜치별로 편집하고 diff/merge로 안전하게 취합

## v1.1 Requirements

collab-planning.md 기준 미완성 항목 고도화.

### Merge

- [ ] **MERGE-01**: 사용자가 merge 결과 페이지에서 충돌 목록을 확인할 수 있다
- [ ] **MERGE-02**: 사용자가 각 충돌에 대해 Local/Remote/직접편집으로 해결할 수 있다
- [ ] **MERGE-03**: 모든 충돌 해결 후 merge를 확정(finalize)할 수 있다
- [ ] **MERGE-04**: MR 상세에서 merge 액션 후 merge 결과 페이지로 이동한다

### Preview

- [ ] **PREV-01**: 사용자가 특정 커밋 SHA 기준으로 문서를 미리볼 수 있다 (/preview?commit=sha)

### Auth UI

- [ ] **AUTH-01**: 사용자가 collab 페이지에서 Google 로그인 버튼으로 로그인할 수 있다

### UX Polish

- [ ] **UX-01**: 문서 뷰 헤더에 실제 문서 이름이 표시된다
- [ ] **UX-02**: 레거시 라우트(app/collab/[documentId]/*)가 제거된다

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time WebSocket editing | 복잡도 높음, 현재 스코프 밖 |
| Mobile responsive | Web-first |
| 다국어 지원 | 한국어 전용 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MERGE-01 | Phase 6 | Pending |
| MERGE-02 | Phase 6 | Pending |
| MERGE-03 | Phase 6 | Pending |
| MERGE-04 | Phase 6 | Pending |
| PREV-01 | Phase 7 | Pending |
| AUTH-01 | Phase 7 | Pending |
| UX-01 | Phase 7 | Pending |
| UX-02 | Phase 7 | Pending |

**Coverage:**
- v1.1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after initial definition*
