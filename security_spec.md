# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Identity & Ownership**: Every user-scoped document (`/users/{userId}` and subcollections `private`, `periods`, `symptoms`, `wellness`, `nutrition`, `water`, `journal`) MUST have `userId == request.auth.uid`, a verified Google session (`request.auth.token.email_verified == true`), and a valid ID matching `^[a-zA-Z0-9_\-]+$` (max 128 chars).
2. **PII Isolation**: Sensitive PII (`email`, `dateOfBirth`, `phoneNumber`) lives strictly inside `/users/{userId}/private/profile`, never on the root `/users/{userId}` document or tracker subcollections.
3. **Master Gate Parent Integrity**: Subcollection reads (single doc) and writes require the parent `/users/{userId}` document to exist via `exists()`.
4. **Anti-Update-Gap & Strict Schema**: Every `create` and `update` executes `isValid[Entity](incoming(), userId)` with exact `hasAll` / `hasOnly` key allowlists, string `.size()` ceilings matching `firebase-blueprint.json`, bounded array checks (`symptoms.size() <= 20`), numeric domain checks, and action-scoped `affectedKeys().hasOnly([...])` on `update`.
5. **Temporal & Ownership Immutability**: `createdAt` (`== request.time` on create) and `userId` are immutable across updates; `updatedAt` must equal `request.time`.
6. **Zero Query Delegation**: Every `allow list` rule enforces `isVerifiedOwner(userId) && resource.data.userId == request.auth.uid` without `get()` or `exists()` lookups.

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Attack Vector | Target Collection | Adversarial Payload Summary | Expected Rule Outcome |
|---|---|---|---|---|
| 1 | Unverified Email Spoof | `/users/{uid}` | Valid `UserAccount` payload where `request.auth.token.email_verified == false` | `PERMISSION_DENIED` |
| 2 | Cross-User UID Spoofing | `/users/{uid}/periods/{id}` | Authenticated as `uidA`, writes `userId: "uidB"` into `uidB` or `uidA` subcollection | `PERMISSION_DENIED` |
| 3 | Ghost / Shadow Field Injection | `/users/{uid}` | Includes `"isAdmin": true` or `"role": "admin"` alongside valid fields | `PERMISSION_DENIED` (`hasOnly` blocks unknown keys) |
| 4 | PII Leakage on Root User Doc | `/users/{uid}` | Attempts to store `"email"` or `"phoneNumber"` on `/users/{uid}` instead of `/private/profile` | `PERMISSION_DENIED` |
| 5 | Path Variable Poisoning | `/users/{uid}/journal/{id}` | Document ID contains invalid chars (`../evil`, spaces, or 200+ chars) | `PERMISSION_DENIED` (`isValidId` rejects) |
| 6 | Denial-of-Wallet Oversized String | `/users/{uid}/journal/{id}` | `content` exceeds `5000` chars or `title` exceeds `120` chars | `PERMISSION_DENIED` |
| 7 | Unbounded Symptoms Array | `/users/{uid}/symptoms/{id}` | `symptoms` array contains `21` items (`> 20` limit) | `PERMISSION_DENIED` |
| 8 | Array Element Type Poisoning | `/users/{uid}/periods/{id}` | `symptoms: [12345]` (number instead of string) | `PERMISSION_DENIED` |
| 9 | Client Clock Backdating | `/users/{uid}/wellness/{id}` | `createdAt` or `updatedAt` set to past client timestamp instead of `request.time` | `PERMISSION_DENIED` |
| 10 | Immutable `createdAt` / `userId` Mutation | `/users/{uid}/periods/{id}` | `update` attempts to alter `createdAt` or `userId` | `PERMISSION_DENIED` |
| 11 | Value Type / Bounds Poisoning | `/users/{uid}/water/{id}` | `amountMl: -500` or `amountMl: 999999` or string `"250"` | `PERMISSION_DENIED` |
| 12 | Orphaned Subcollection Write | `/users/{uid}/nutrition/{id}` | Writes subcollection meal before `/users/{uid}` root parent doc exists | `PERMISSION_DENIED` (`exists()` Master Gate blocks) |
