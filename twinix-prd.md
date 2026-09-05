# TWINIX — Product Requirements Document (PRD)

**Status:** Draft v1
**Owner:** Ojewande
**Platform:** Mobile (iOS + Android), React Native
**Related doc:** `twinix-mvp-build-brief.md` (screen-by-screen and phased build spec for engineering)

---

## 1. Summary

TWINIX is an accountability app that pairs two people — a "student" and a "mentor" — around a shared commitment. One person commits to a recurring action (spiritual discipline, learning a skill); the other checks whether they followed through, using submitted proof and reflection notes. The product is deliberately narrow at launch: it targets two real, known groups (a campus fellowship and classmates learning a tech skill) rather than a general-purpose productivity platform.

---

## 2. Problem Statement

People abandon commitments they make to themselves when no one else is watching. This shows up in two very different but structurally identical ways:

- **Spiritual accountability**: Fellowship members intend to pray, read scripture, or stay consistent in their walk, but drift without a peer checking in.
- **Skill-learning accountability**: People start learning a tech skill (e.g. React) independently, hit a wall or lose momentum, and quit — because there's no deadline, no check-in, and no social cost to stopping.

Existing tools don't solve this well:
- To-do list apps (Todoist, etc.) track tasks but have no human accountability loop.
- Habit trackers are solo and easy to ignore or abandon quietly.
- Mentorship happens informally (WhatsApp, in-person) with no structure, proof, or history.

---

## 3. Goals

### Primary goal
Validate that a lightweight, PIN-paired accountability loop (commit → check in with proof → partner verifies) increases follow-through, for two real pilot groups.

### Secondary goals
- Establish a working free-to-premium conversion path (solo use free, paired accountability paid).
- Learn what breaks in the underlying proof/verification model before expanding to other use cases or building gamification.

### Non-goals (for v1)
- Being a general-purpose productivity or task management tool.
- Serving "any organization" — this is explicitly out of scope until the two pilot flows are validated.
- Discovery/matching strangers into mentor relationships.

---

## 4. Target Users (v1)

| User group | Commitment type | Accountability partner |
|---|---|---|
| MFM Campus Fellowship (OAU) members | Prayer, scripture reading, spiritual consistency | Fellow member or fellowship leader |
| Classmates learning a tech skill (e.g. React) | Structured learning goals with deadlines | Peer or more experienced classmate |

Both groups are reachable directly by the founder for pilot testing (5–10 people per group).

---

## 5. User Roles

- **Student**: the person making and keeping a commitment.
- **Mentor**: the person checking whether the commitment was kept.
- A single user can hold both roles simultaneously (mentored by one person, mentoring another) — roles are not mutually exclusive account types.

---

## 6. Core User Journey

1. User opens the app for the first time → sees onboarding (welcome slides + light preference questions) → chooses Get Started or Log In.
2. User signs up, receives a personal PIN.
3. User can immediately use the app solo — free tier — to track personal tasks and self check-ins.
4. To connect with an accountability partner, both users must be on **premium**. One shares their PIN with the other; the receiving user enters it to request a connection.
5. Once paired, the student creates (or receives, if mentor-assigned) a commitment with a category (fellowship / tech-skill), frequency, and due date.
6. Student checks in — uploads proof (photo/PDF) or writes a self-report and reflection note.
7. Mentor reviews the check-in: verifies it or requests a revision with a comment.
8. A simple streak counter tracks consistency over time.

---

## 7. Monetization

| Tier | Price | What's included |
|---|---|---|
| **Free** | ₦0 | Solo to-do list, personal task tracking, self check-ins and reflection notes. No mentor connection. |
| **Premium** | Monthly subscription (amount TBD) | Everything in Free, plus the ability to connect with a mentor/accountability partner via PIN, assign/receive commitments, and mentor-side verification. |

**Both parties in a connection must be premium.** This is the primary gate — free tier drives daily solo usage and habit formation; premium unlocks the actual accountability relationship, which is TWINIX's core value proposition. If either side's subscription lapses, the connection goes inactive until both are premium again (history is preserved).

Pricing amount and payment provider (App Store/Play Store subscription via RevenueCat, vs. direct billing via Paystack/Flutterwave for Naira) are to be finalized before Phase 3 of the build (see build brief).

---

## 8. Functional Requirements (v1)

### Onboarding
- FR1: First-time users see a welcome/animation sequence before reaching login.
- FR2: Onboarding includes two light preference questions (why they're here; mentor/student/both) that pre-fill later settings but do not block progress.
- FR3: Onboarding shows only once per install.

### Identity & Auth
- FR4: Users sign up / log in via Firebase Auth (email or phone).
- FR5: Each user is issued a unique PIN on account creation, viewable at any time.

### Free tier
- FR6: Any authenticated user, regardless of subscription status, can create and manage personal to-do items and self check-ins with no connection required.

### Premium & Payments
- FR7: A paywall is shown when a free user attempts to send or approve a connection request.
- FR8: Subscription status and expiry are tracked per user and kept in sync with the payment provider.
- FR9: Users can view and manage their own subscription (renew/cancel).

### Pairing
- FR10: A user can request a connection by entering another user's PIN.
- FR11: A connection request is only sent if both users are premium; otherwise the requester sees the paywall.
- FR12: The PIN owner can approve or decline incoming requests.
- FR13: If either party's premium lapses, the connection becomes inactive (data preserved, no new activity until reactivated).

### Commitments
- FR14: A student can create a commitment (title, category, frequency, due date).
- FR15: A mentor can assign a commitment directly to a connected student.
- FR16: Both parties can view a list of active and past commitments.

### Check-ins & Verification
- FR17: A student can check in on a commitment via photo/PDF upload or a self-report text entry with an optional reflection note.
- FR18: A mentor can view pending check-ins and verify or request a revision, with an optional comment.
- FR19: A simple streak counter reflects consecutive successful check-ins.

---

## 9. Non-Functional Requirements

- **Platform**: Must run on iOS and Android via a single React Native (Expo) codebase.
- **Backend**: Firebase (Auth, Firestore, Storage) for v1 — chosen for speed of implementation over a self-hosted alternative.
- **Privacy**: Proof uploads (photos/PDFs) are only visible to the connected mentor/student pair, not publicly accessible.
- **Reliability**: Core loop (commit → check-in → verify) must work offline-tolerant enough to queue and sync when connectivity returns, given target users are on mobile data in Nigeria.

---

## 10. Explicitly Out of Scope for v1

These exist in the long-term product vision but are deliberately deferred until the core loop is validated with real pilot users:

- Gamification: badges, points, leaderboards
- Group/cohort mentorship and group PINs
- Analytics/reporting dashboards beyond basic check-in history
- Focus timer / countdown sessions
- Mentor discovery or directory (matching strangers)
- "Trust Score" system

---

## 11. Success Metrics (Pilot)

Since this is a validation-stage pilot, not a growth-stage launch, success is measured qualitatively and with simple counts rather than complex analytics:

- % of pilot users who complete at least one full loop (commit → check-in → verified) in the first 2 weeks
- % of active connections still active (not lapsed/abandoned) after 30 days
- Qualitative feedback: does having a mentor/partner actually change follow-through, per user report
- Whether the "proof of completion" model feels natural for spiritual accountability specifically (this is the shakiest assumption in the whole product — self-report may need to dominate over photo/PDF proof for that flow)

---

## 12. Open Questions

- Final premium price point (₦/month) — not yet set.
- Payment provider: RevenueCat (store billing) vs. Paystack/Flutterwave (direct Naira billing) — affects both build complexity and take-home revenue (app stores take a cut).
- Will pilot users get comped premium access, or pay real money during the pilot? (Recommended: comp it, so the accountability loop itself is what's being tested, not willingness to pay.)
- What happens to in-progress commitments/check-ins if a connection goes inactive mid-cycle — is there a grace period before data becomes read-only?

---

## 13. Related Documents

- `twinix-mvp-build-brief.md` — engineering-facing spec: data model, screen list, and phased build plan for Antigravity.
