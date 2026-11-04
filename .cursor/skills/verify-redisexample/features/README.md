# redisExample verification map

Run from an isolated local checkout. Baseline: dependencies installed, no shared services or production data. Only the helper-owned processes may be driven. Evidence survives cleanup.

- [Cached GitHub profile](cache-hit.md)
- [GitHub profile fetch](profile-fetch.md)
- [Cache lifetime](cache-expiry.md)

## Proof boundaries

The generation proof covers the safe helper recipe, not every mapped feature. No production or paid provider calls, deploys, or shared mutations are implied. Screenshots require VERIFY_BROWSER=1. Report remaining features as unverified until driven.
