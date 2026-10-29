import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesContent = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');

test('Firestore rules enforce default-deny safety net and all 7 collections', () => {
  assert.ok(rulesContent.includes("rules_version = '2';"));
  assert.ok(rulesContent.includes('match /{document=**} {\n      allow read, write: if false;\n    }'));
  assert.ok(rulesContent.includes('match /admins/{adminUid}'));
  assert.ok(rulesContent.includes('match /news/{newsId}'));
  assert.ok(rulesContent.includes('match /reporterDirectory/{reporterId}'));
  assert.ok(rulesContent.includes('match /reporterApplications/{appId}'));
  assert.ok(rulesContent.includes('match /ads/{adId}'));
  assert.ok(rulesContent.includes('match /feedback/{feedbackId}'));
  assert.ok(rulesContent.includes('match /siteSettings/{settingId}'));
});

test('Dirty Dozen Security Invariants: PII isolation, Mandal lock, email_verified, and view counter delta', () => {
  // 1. Email spoofing prevention
  assert.ok(rulesContent.includes('request.auth.token.email_verified == true'));

  // 2. PII isolation on reporterApplications
  assert.ok(
    rulesContent.includes(
      'allow get: if isSignedIn() && isValidId(appId) && (existing().ownerUid == request.auth.uid || isAdmin());'
    )
  );

  // 3. Mandal lock relational check on news upload
  assert.ok(
    rulesContent.includes(
      "get(/databases/$(database)/documents/reporterDirectory/$(incoming().reporterId)).data.mandal == incoming().mandal"
    )
  );

  // 4. View counter +1 increment guard
  assert.ok(
    rulesContent.includes("incoming().diff(existing()).affectedKeys().hasOnly(['views', 'updatedAt'])")
  );
  assert.ok(rulesContent.includes('incoming().views == existing().views + 1'));

  // 5. Atomic split-collection creation via existsAfter
  assert.ok(
    rulesContent.includes('existsAfter(/databases/$(database)/documents/reporterApplications/$(reporterId))')
  );
});
