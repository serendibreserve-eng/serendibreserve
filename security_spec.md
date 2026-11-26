# Serendib Reserve Auction Platform — Security Specification

## 1. Data Invariants
1. **Identity & Privilege Invariant**: User documents under `/users/{userId}` can only be created with `uid == request.auth.uid` and `role == 'user'` (except verified bootstrap admin `serendibreserve@gmail.com`). Regular users can never escalate `role`, un-suspend `accountStatus`, or spoof `emailVerified`.
2. **PII Isolation Invariant**: Full user contact information (`email`, `contactNumber`, `nationality`, `companyName`) lives strictly in `/users/{userId}` and is readable ONLY by the document owner or an Admin. Public bid feeds store only a non-PII `bidderAlias`.
3. **Atomic Bid Integrity Invariant**: No bid can exist in `/bids/{bidId}` without updating `/auctions/{auctionId}` in the exact same atomic transaction (`bidId == auctionId + '_bid_' + string(bidSequence)`), and no auction `currentHighestBidMinor` or `bidCount` can be incremented without creating the matching `bids` document verified via `existsAfter` / `getAfter`.
4. **Live Bidding Eligibility Invariant**: Only authenticated users with `request.auth.token.email_verified == true`, `accountStatus == 'active'`, and `profileCompleted == true` can place bids, and only while `existing().status == 'live'` and `request.time >= existing().startTime && request.time < existing().endTime`.
5. **Monotonic Bid Amount Invariant**: When `bidCount == 0`, bid `amountMinor >= startingBidMinor`. When `bidCount > 0`, `amountMinor >= currentHighestBidMinor + minimumIncrementMinor`. Negative, zero, or under-increment bids are rejected.
6. **Immutable Audit & Bid History Invariant**: Existing `/bids/{bidId}` and `/auditLogs/{logId}` records cannot be altered or deleted by bidders; only Admins can flag or invalidate an irregular bid.
7. **Terminal State Lock Invariant**: Completed or cancelled auctions reject any further client bidding transitions; only Admins may perform administrative corrections.
8. **Server Temporal Integrity Invariant**: All `createdAt` and `updatedAt` timestamps on protected writes must equal `request.time`.
9. **Demo Governance & Real-Bid Isolation Invariant**: Demonstration showcase lots (`isDemo == true`) default to `demoBiddingActive == false`, blocking binding bids from non-admin collectors at the database layer until an Admin explicitly enables real bidding (`demoBiddingActive == true`). Admin-seeded simulated bids must carry `isDemo == true`, `bidderId == 'demo_system_simulator'`, and a `DEMO / ` prefixed alias, and can never target production (`isDemo == false`) lots.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Privilege Escalation on Signup**: `POST /users/{uid}` with `role: "admin"` by non-admin user -> `PERMISSION_DENIED`.
2. **Self-Unsuspend Attack**: Suspended user updates `/users/{uid}` changing `accountStatus: "active"` -> `PERMISSION_DENIED`.
3. **Email Verification Spoof**: Unverified user (`email_verified: false`) attempts to place a bid or update `emailVerified: true` -> `PERMISSION_DENIED`.
4. **PII Scrape Attempt**: Signed-in User B reads `/users/{userA_uid}` or lists `/users` -> `PERMISSION_DENIED`.
5. **Shadow Ghost Field Injection**: User creates or updates `/users/{uid}` or `/auctions/{id}` adding an unexpected field `{ isSuperAdmin: true }` -> `PERMISSION_DENIED`.
6. **Under-Minimum / Negative Bid**: Bidder sets `currentHighestBidMinor` below `currentHighestBidMinor + minimumIncrementMinor` or negative -> `PERMISSION_DENIED`.
7. **Orphan Bid (No Auction Sync)**: Attacker creates `/bids/{bidId}` without atomically updating `/auctions/{auctionId}` -> `PERMISSION_DENIED`.
8. **Auction Manipulation by Bidder**: Bidder updates `title`, `startingBidMinor`, `status`, `isDemo`, `demoBiddingActive`, or `endTime` during a bid transaction -> `PERMISSION_DENIED`.
9. **Closed / Draft / Unactivated Demo Auction Bid**: Bidder attempts to bid on `status: "upcoming"`, `"completed"`, `"paused"`, or `isDemo == true && demoBiddingActive == false` -> `PERMISSION_DENIED`.
10. **Bidder Impersonation / Spoofed Demo Bid**: User B submits a bid with `bidderId: userA_uid`, `bidderId: 'demo_system_simulator'`, or `isDemo: true` -> `PERMISSION_DENIED`.
11. **Draft Auction Leak**: Public/non-admin user queries or reads an auction with `status: "draft"` -> `PERMISSION_DENIED`.
12. **Client Timestamp Forgery & 1MB ID Poisoning**: User submits a forged past `createdAt` or oversized document ID > 128 chars / invalid characters -> `PERMISSION_DENIED`.
