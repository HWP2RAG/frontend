# Roadmap: HWPtoRAG Collab Frontend v1.1

## Phase 6: Merge Conflict Resolution

**Goal:** 충돌 해결 페이지를 완성하고 MR -> merge 플로우를 연결한다

**Requirements:** MERGE-01, MERGE-02, MERGE-03, MERGE-04

**Plans:** 2 plans

Plans:
- [ ] 06-01-PLAN.md — Mock fixtures with conflict variants + merge store TDD tests
- [ ] 06-02-PLAN.md — Port merge page to new route + MR merge navigation + page tests

**Success Criteria:**
1. merge 결과 페이지에서 자동 병합 수, 충돌 수, 충돌 상세를 확인할 수 있다
2. 각 충돌에 대해 accept_local/accept_remote/manual_edit로 해결할 수 있다
3. 모든 충돌 해결 후 "Merge 확정" 버튼이 활성화되고 finalize가 동작한다
4. MR 상세에서 merge 액션 실행 시 merge 결과 페이지로 자동 이동한다
5. 충돌이 없는 merge는 자동 완료 후 성공 상태를 표시한다

## Phase 7: Preview, Auth UI, UX Polish

**Goal:** 나머지 스텁 페이지를 완성하고 UX를 다듬는다

**Requirements:** PREV-01, AUTH-01, UX-01, UX-02

**Success Criteria:**
1. /preview?commit=sha 로 특정 커밋 시점의 문서가 블록별 HTML로 렌더링된다
2. Google 로그인 버튼이 collab 레이아웃 헤더에 표시된다
3. 문서 뷰 헤더에 실제 문서 이름이 표시된다
4. app/collab/[documentId]/* 레거시 라우트가 완전히 제거된다
5. 모든 기존 테스트가 통과한다
