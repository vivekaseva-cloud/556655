# Security Specification (`security_spec.md`) — ఏది నిజం (Edi Nijam)

## 1. Data Invariants

1. **PII Isolation Invariant**: Personal Identifiable Information (`mobile`, `aadhaarNumber`, `aadhaarDocName`, `passwordHash`) is strictly isolated in `/reporterApplications/{appId}` and NEVER stored in `/reporterDirectory/{reporterId}` or `/news/{newsId}`. Only the document owner (`resource.data.ownerUid == request.auth.uid`) or a verified Admin (`isAdmin()`) may read `/reporterApplications/{appId}`.
2. **Mandal Lock & Approval Invariant**: A reporter cannot self-approve (`status == 'pending'` on creation). A non-admin reporter can only create a `/news/{newsId}` document if their corresponding `/reporterDirectory/$(incoming().reporterId)` record exists, belongs to `request.auth.uid`, has `status == 'approved'`, and matches their assigned `state`, `district`, and `mandal`.
3. **Private Ad Approval Invariant**: Every private advertisement created by a non-admin in `/ads/{adId}` must start with `status == 'pending'`. Public `list` and `get` queries on `/ads/{adId}` and `/news/{newsId}` only permit documents where `resource.data.status == 'approved'` (unless the requester is the owner or `isAdmin()`).
4. **View Counter Action-Based Update Invariant**: Non-admin users updating `/news/{newsId}` can ONLY increment `views` by `+1` and update `updatedAt == request.time` via `affectedKeys().hasOnly(['views', 'updatedAt'])`, while all other fields remain immutable.
5. **Temporal & Key Strictness Invariant**: Every `create` operation enforces `data.keys().hasAll(...)`, `data.keys().hasOnly(...)`, `createdAt == request.time`, and string `.size()` boundaries.

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection (`news`)**: `{ ..., "isSuperFeatured": true }` -> Rejected by `hasOnly()`.
2. **Self-Approved Reporter (`reporterApplications`)**: Creating an application with `status: "approved"` as a non-admin -> Rejected by `incoming().status == 'pending'`.
3. **Unapproved Reporter News Upload (`news`)**: Uploading news when `/reporterDirectory/{reporterId}.status != 'approved'` -> Rejected by relational `get()` check.
4. **Cross-Mandal Spoofing (`news`)**: Approved reporter for `"Guntur"` attempting to upload news with `mandal: "Vijayawada"` -> Rejected by relational Mandal match check.
5. **PII Scraping (`reporterApplications`)**: Authenticated non-owner reading another reporter's Aadhaar/Mobile document -> Rejected by `isOwner() || isAdmin()`.
6. **Unverified Email Admin Spoof (`admins`)**: Token with `email == 'viveka.seva@gmail.com'` but `email_verified == false` -> Rejected by `request.auth.token.email_verified == true`.
7. **ID Poisoning Attack**: Document ID with 200 characters or special SQL/path characters -> Rejected by `isValidId()`.
8. **View Count Manipulation (`news`)**: Updating `views` by `+10000` in a single write -> Rejected by `incoming().views == existing().views + 1`.
9. **Unauthorized Private Ad Approval (`ads`)**: Advertiser updating their own ad `status` from `'pending'` to `'approved'` -> Rejected by `isAdmin()` gate on status transitions.
10. **Terminal State Mutation**: Modifying a `'rejected'` application or ad as a regular user -> Rejected by terminal state lock (`existing().status != 'rejected'`).
11. **Timestamp Forgery**: Submitting `createdAt` in the past or future -> Rejected by `incoming().createdAt == request.time`.
12. **AdSense Hijacking (`siteSettings`)**: Non-admin attempting to update `adsenseClientId` or `adsenseScriptUrl` -> Rejected by `isAdmin()`.
