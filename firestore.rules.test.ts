import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const rulesText = fs.readFileSync(rulesPath, 'utf8');

test('firestore.rules enforces rules_version 2 and default-deny safety net', () => {
  assert.match(rulesText, /rules_version\s*=\s*'2'/);
  assert.match(rulesText, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
});

test('Dirty Dozen #1-3: enforces email verification, non-self-admin-escalation, and status protection on users', () => {
  assert.match(rulesText, /request\.auth\.token\.email_verified\s*==\s*true/);
  assert.match(rulesText, /incoming\(\)\.role\s*==\s*'user'/);
  assert.match(rulesText, /existing\(\)\.accountStatus\s*!=\s*'suspended'/);
  assert.match(rulesText, /incoming\(\)\.role\s*==\s*existing\(\)\.role/);
});

test('Dirty Dozen #4: enforces PII isolation on users and subscriptions without blanket signed-in reads', () => {
  assert.doesNotMatch(rulesText, /allow\s+read:\s*if\s*isSignedIn\(\)\s*;/);
  assert.doesNotMatch(rulesText, /allow\s+list:\s*if\s*isSignedIn\(\)\s*;/);
  assert.match(rulesText, /match \/users\/\{userId\}[\s\S]*?allow get:\s*if isValidId\(userId\) && \(isOwner\(userId\) \|\| isAdmin\(\)\);/);
});

test('Dirty Dozen #5: enforces strict hasAll + hasOnly + affectedKeys allowlists on every entity', () => {
  assert.match(rulesText, /function isValidUserProfile[\s\S]*?keys\(\)\.hasAll[\s\S]*?keys\(\)\.hasOnly/);
  assert.match(rulesText, /function isValidAuction[\s\S]*?keys\(\)\.hasAll[\s\S]*?keys\(\)\.hasOnly/);
  assert.match(rulesText, /function isValidBid[\s\S]*?keys\(\)\.hasAll[\s\S]*?keys\(\)\.hasOnly/);
  assert.match(rulesText, /incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasOnly/);
});

test('Dirty Dozen #6-10: enforces atomic bid/auction sync, monotonic bid increments, live window, and bidder identity', () => {
  assert.ok(rulesText.includes("existsAfter(/databases/$(database)/documents/bids/$(auctionId + '_bid_' + string(incoming().bidCount)))"));
  assert.ok(rulesText.includes('getAfter(/databases/$(database)/documents/auctions/$(incoming().auctionId)).data.currentHighestBidMinor == incoming().amountMinor'));
  assert.match(rulesText, /existing\(\)\.bidCount == 0 && incoming\(\)\.currentHighestBidMinor >= existing\(\)\.startingBidMinor/);
  assert.match(rulesText, /existing\(\)\.bidCount > 0 && incoming\(\)\.currentHighestBidMinor >= existing\(\)\.currentHighestBidMinor \+ existing\(\)\.minimumIncrementMinor/);
  assert.match(rulesText, /existing\(\)\.status == 'live'/);
  assert.ok(rulesText.includes('request.time >= existing().startTime'));
  assert.ok(rulesText.includes('request.time < existing().endTime'));
  assert.match(rulesText, /incoming\(\)\.highestBidderId == request\.auth\.uid/);
  assert.match(rulesText, /incoming\(\)\.bidderId == request\.auth\.uid/);
});

test('Dirty Dozen #11-12: blocks draft leaks, enforces ID regex guards, and binds timestamps to request.time', () => {
  assert.match(rulesText, /allow list:\s*if resource\.data\.status in \['upcoming', 'live', 'paused', 'ended', 'completed', 'cancelled'\]/);
  assert.match(rulesText, /isValidId\(id\)[\s\S]*?id\.matches\('\^\[a-zA-Z0-9_\\\\-\]\+\$'\)/);
  assert.match(rulesText, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rulesText, /incoming\(\)\.updatedAt == request\.time/);
});

test('Demo Governance: blocks binding real bids on unactivated demo lots and isolates admin demo bid seeding', () => {
  assert.ok(rulesText.includes("existing().demoBiddingActive == true"));
  assert.ok(rulesText.includes("incoming().isDemo == false"));
  assert.ok(rulesText.includes("incoming().bidderId == 'demo_system_simulator'"));
  assert.ok(rulesText.includes("incoming().bidderAlias.matches('^DEMO / .*')"));
});
