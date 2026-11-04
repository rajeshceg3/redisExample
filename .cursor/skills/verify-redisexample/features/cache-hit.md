# Cached GitHub profile

Cached GitHub profile is a user-facing part of redisExample.

## Sub-features

- `cache-hit`: GET /repos/verify-cache-user twice; require matching Cache verification heading, repository/follower counts and positive Redis TTL.

## How to get to it (user POV)

Visit /repos/verify-cache-user after an isolated Redis fixture is seeded.

## Driving it with verify-redisexample

Preconditions: launch and doctor pass on the helper-owned disposable instance.

GET /repos/verify-cache-user twice; require matching Cache verification heading, repository/follower counts and positive Redis TTL. Run `node .cursor/skills/verify-redisexample/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

The helper uses a real disposable Redis, not a mock. Preseeding is verification scaffolding, not proof of fetching from GitHub.
