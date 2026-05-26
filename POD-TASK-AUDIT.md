# Pod 1–4 Task Audit Report

**Date:** May 15, 2026
**Audited by:** Deepak (via Claude Code)
**Scope:** All active Sprint 4 tasks across Pod 1 (Onboarding), Pod 2 (Learning Modules), Pod 3 (Interview/Resume), Pod 4 (QA/Deploy)

---

## Tasks Closed in This Audit (Covered by DK-F / DK-B batch)

These were still showing as "in progress" or "to do" but had been fully delivered in `feature/dk-frontend-day2` (PR #34) or `feature/dk-backend-batch`.

| Task                                                                       | ClickUp                                          | Pod   | Covered By    | Notes                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------ | ----- | ------------- | -------------------------------------------------------------------- |
| FE: Home Screen — Post-CEFR Dashboard                                      | [86d2txan4](https://app.clickup.com/t/86d2txan4) | Pod 1 | DK-F4         | HomeScreen fully wired — streak, XP, badges, modules, cards, ChatFab |
| FE: Pre-Assessment Landing + Section Sequencer + CEFR Result screens       | [86d2urxmr](https://app.clickup.com/t/86d2urxmr) | Pod 1 | DK-F7         | All 6 sections + results screen wired end-to-end                     |
| FE: Section A Speak-by-Reading + Listen & Repeat screens                   | [86d2urxn3](https://app.clickup.com/t/86d2urxn3) | Pod 1 | DK-F7         | SpeakingReadScreen + ListenWithAudioScreen built and wired           |
| FE: Onboarding + Section B Speaking + Section D Listening + CEFR Result    | [86d2n6vgu](https://app.clickup.com/t/86d2n6vgu) | Pod 1 | DK-F3 + DK-F7 | Full onboarding wizard + B/D sections + results all done             |
| FE: Module Day View — replace mock data, render 4-skill activities per day | [86d2urxpy](https://app.clickup.com/t/86d2urxpy) | Pod 2 | DK-F6         | Fully wired to real API, TapToBuild + Correct/Wrong sheets live      |
| BE: XP / Streaks / Achievements service (gamification foundation)          | [86d2urxk4](https://app.clickup.com/t/86d2urxk4) | Pod 1 | DK-B3/B4/B5   | Achievements + Medals + Accuracy endpoints all live                  |

**6 tasks closed. Comments added to each explaining the DK task that covered it.**

---

## Already Complete (No Action Needed)

These were already marked complete by their assignees before this audit.

### Pod 1 — Onboarding Flow

| Task                                                        | ClickUp                                          | Assignee     |
| ----------------------------------------------------------- | ------------------------------------------------ | ------------ |
| FE: Reading Screen + Grammar MCQ Screen                     | [86d2n6vaw](https://app.clickup.com/t/86d2n6vaw) | Dharun Kumar |
| BE: CEFR Scoring Integration + Learning Path Assignment API | [86d2n6vpq](https://app.clickup.com/t/86d2n6vpq) | Vaaheesan    |
| Wire JWT Auth + Pre-Assessment UI Flow                      | [86d2m67cx](https://app.clickup.com/t/86d2m67cx) | Gowtham Raj  |
| Raise PR — pod-1-architecture → dev                         | [86d2m67c9](https://app.clickup.com/t/86d2m67c9) | Gowtham Raj  |
| Dev→QA Promotion Pipeline + Pod 3 Auth Coordination         | [86d2hzuvw](https://app.clickup.com/t/86d2hzuvw) | Lokesh Y     |

### Pod 2 — Learning Modules

| Task                                                             | ClickUp                                          | Assignee      |
| ---------------------------------------------------------------- | ------------------------------------------------ | ------------- |
| BE: Module Activity Content API + schema                         | [86d2urybh](https://app.clickup.com/t/86d2urybh) | Nithya Shree  |
| BE: Module admin endpoints                                       | [86d2x9zgn](https://app.clickup.com/t/86d2x9zgn) | krishanth     |
| BE: Module Content DB Schema + Seed (Modules 1-3) + Progress API | [86d2n6xmv](https://app.clickup.com/t/86d2n6xmv) | krishanth     |
| BE: Modules 4-13 content seed script                             | [86d2urxud](https://app.clickup.com/t/86d2urxud) | Jayani        |
| BE: Speaking Prompt Delivery + Vocabulary Activity API           | [86d2n6y3r](https://app.clickup.com/t/86d2n6y3r) | Jayani        |
| BE: Pronunciation + Listen & Repeat Scoring API                  | [86d2n6xxn](https://app.clickup.com/t/86d2n6xxn) | Nithya Shree  |
| FE: Module Map Screen + Module Card Navigation                   | [86d2n6yb6](https://app.clickup.com/t/86d2n6yb6) | Lavanya S B   |
| FE: Daily Lesson Flow UI (4-Skill Activities per Day)            | [86d2n6yg3](https://app.clickup.com/t/86d2n6yg3) | Karthikeyan M |
| BE: Module Content Seed Completion — Pod 4 Support               | [86d2txagt](https://app.clickup.com/t/86d2txagt) | —             |
| Raise PR — pod-2-architecture-learningmodules → dev              | [86d2m67fy](https://app.clickup.com/t/86d2m67fy) | Lavanya S B   |

### Pod 3 — Interview Coach / Resume

| Task                                                 | ClickUp                                          | Assignee     |
| ---------------------------------------------------- | ------------------------------------------------ | ------------ |
| BE: Mock Interview Session API + AI Scoring          | [86d2n78bv](https://app.clickup.com/t/86d2n78bv) | Ilakiya      |
| BE: Question Bank Pre-Generation + Seed Service      | [86d2n77wt](https://app.clickup.com/t/86d2n77wt) | Devika       |
| FE: Resume Builder Mobile UI                         | [86d2n78v6](https://app.clickup.com/t/86d2n78v6) | Rathish R    |
| FE: Mock Interview Mobile UI (Mobile-First)          | [86d2n78m0](https://app.clickup.com/t/86d2n78m0) | —            |
| FE Lead: Pod 3 design hand-off + architecture review | [86d2urxz1](https://app.clickup.com/t/86d2urxz1) | Kevin Joshua |
| Auth Fix — All Pod 3 Routes                          | [86d2hzux6](https://app.clickup.com/t/86d2hzux6) | Devika       |

### Pod 4 — QA / Stabilization

| Task                                                           | ClickUp                                          | Assignee   |
| -------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| Day 1 — Onboarding: Read CLAUDE.md + architecture walk-through | [86d2urvwv](https://app.clickup.com/t/86d2urvwv) | Pod 4 team |
| Day 1 — Onboarding: Local environment setup                    | [86d2urvqn](https://app.clickup.com/t/86d2urvqn) | Pod 4 team |

---

## Still Open — Active Work by Assignees

These are legitimately in flight with active owners. Do NOT close — let assignees finish.

| Task                                                              | ClickUp                                          | Pod   | Assignee                        | Status      | Notes                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------ | ----- | ------------------------------- | ----------- | ----------------------------------------------------------------- |
| BE: Diagnostic orchestration service (tie assessment → CEFR flow) | [86d2urxmh](https://app.clickup.com/t/86d2urxmh) | Pod 1 | Lokesh Y                        | in progress | Critical — needed for full assessment → CEFR → learning path flow |
| BE: api-powerup deploy-readiness audit + production hardening     | [86d2x9zhm](https://app.clickup.com/t/86d2x9zhm) | Pod 1 | Vaaheesan                       | in progress | Needed before Azure deploy                                        |
| BE: Google OAuth (Firebase Auth token verification)               | [86d2zx3zj](https://app.clickup.com/t/86d2zx3zj) | Pod 1 | Vishvaa K                       | in progress | Social login BE                                                   |
| QA: End-to-End Integration Test Suite — Sprint 4                  | [86d2txajk](https://app.clickup.com/t/86d2txajk) | Pod 1 | Vaaheesan                       | in progress | Full E2E test suite                                               |
| BE: Audio file management — upload + serve activity audio         | [86d2x9zg0](https://app.clickup.com/t/86d2x9zg0) | Pod 2 | Nithya Shree                    | in progress | Needed for Speaking/Listening module activities                   |
| Pod 4 Oversight Liaisons — daily check-in + PR review             | [86d2urxhx](https://app.clickup.com/t/86d2urxhx) | Pod 4 | Vaaheesan / krishanth / Ilakiya | in progress | Ongoing oversight                                                 |
| BE: AI Chatbot service (general Q&A)                              | [86d2urxvd](https://app.clickup.com/t/86d2urxvd) | Pod 3 | Devika                          | in progress | Chat BE for HomeScreen ChatFab                                    |
| FE: Land Resume Builder to qa + Interview History Screen          | [86d2urxzv](https://app.clickup.com/t/86d2urxzv) | Pod 3 | Rathish R                       | in progress | Resume branch merge + interview history                           |
| BE: Resume AI Feedback Loop (critique + suggestions)              | [86d2urxw7](https://app.clickup.com/t/86d2urxw7) | Pod 3 | Suba Shree                      | in progress | AI resume feedback                                                |
| FE: Mock Interview Mobile UI (Pod 3 hand-off)                     | [86d2urvu6](https://app.clickup.com/t/86d2urvu6) | Pod 4 | Mohamed Saif                    | in progress | Interview screen build                                            |

---

## Still Open — Not Started, Needs Attention

These are "to do" with no recent activity. Flag if overdue.

| Task                                                                | ClickUp                                          | Pod   | Assignee         | Priority  | Notes                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------ | ----- | ---------------- | --------- | -------------------------------------------------------- |
| BE: Learning path personalization (GET /learning-path/personalized) | [86d2zx448](https://app.clickup.com/t/86d2zx448) | Pod 2 | krishanth        | 🔴 High   | Blocks My Learning tab showing correct CEFR band content |
| FE: Learning Path screen — show personalized module sequence        | [86d2zx48y](https://app.clickup.com/t/86d2zx48y) | Pod 2 | Lavanya S B      | 🔴 High   | Depends on above BE task                                 |
| FE: Module Completion + Vocabulary Activity screens + XP toast      | [86d2urxqq](https://app.clickup.com/t/86d2urxqq) | Pod 2 | Karthikeyan M    | 🟡 Medium | Module completion flow not yet built                     |
| FE: Google OAuth — Expo social login flow                           | [86d2zx462](https://app.clickup.com/t/86d2zx462) | Pod 1 | Karthikeyan M    | 🟡 Medium | Depends on BE OAuth task                                 |
| BE: Rate limiting + brute-force protection on /auth                 | [86d2zx47n](https://app.clickup.com/t/86d2zx47n) | Pod 1 | Nithya Shree     | 🟡 Medium | Security hardening                                       |
| BE: Integration test suite for /assessment + /learning-path         | [86d2urvxu](https://app.clickup.com/t/86d2urvxu) | Pod 4 | Harinishree S    | 🟡 Medium | QA coverage                                              |
| Pod 4: Drive E2E Integration Test Suite (Sprint 4 user journey)     | [86d2urvur](https://app.clickup.com/t/86d2urvur) | Pod 4 | Pod 4 team       | 🟡 Medium | Full journey E2E                                         |
| Pod Lead: Dev→QA merge readiness audit + branch triage              | [86d2urvtw](https://app.clickup.com/t/86d2urvtw) | Pod 4 | Mary Kanakam     | 🟡 Medium | Pre-merge gate check                                     |
| ML/Data: Seed validation pipeline + AI scoring eval harness         | [86d2urvv7](https://app.clickup.com/t/86d2urvv7) | Pod 4 | Gokulakrishnan M | 🟡 Medium | Data quality for AI scoring                              |
| DEPLOY: api-powerup → Azure Container Apps                          | [86d2x9zq3](https://app.clickup.com/t/86d2x9zq3) | Pod 4 | **Deepak**       | 🔴 High   | Blocking all real API calls from app                     |
| DEPLOY: app-powerup → EAS production + Vercel web                   | [86d2x9zrd](https://app.clickup.com/t/86d2x9zrd) | Pod 4 | **Deepak**       | 🔴 High   | Needed for APK + web deploy                              |

---

## Summary

| Category                                            | Count  |
| --------------------------------------------------- | ------ |
| Closed in this audit (covered by DK-F / DK-B batch) | **6**  |
| Already complete (closed by assignees)              | **21** |
| In progress — active owners, leave running          | **10** |
| Not started — needs attention or flagging           | **11** |

### Critical blockers to watch

1. **Lokesh Y** — Diagnostic orchestration service. Without this, assessment → CEFR assignment doesn't complete automatically.
2. **krishanth** — Learning path personalization endpoint. Without this, My Learning tab can't show the correct CEFR band modules.
3. **Deepak (you)** — Azure deploy tasks (api-powerup + app-powerup). Blocking the whole team from testing against prod.
