# GitHub profile fetch

GitHub profile fetch is a user-facing part of redisExample.

## Sub-features

- `profile-fetch`: With explicit public-API permission, request an uncached profile and check the resulting Redis entry and visible profile.

## How to get to it (user POV)

Open /repos/:username for a name absent from the cache.

## Driving it with verify-redisexample

Preconditions: launch and doctor pass on the helper-owned disposable instance.

With explicit public-API permission, request an uncached profile and check the resulting Redis entry and visible profile. Run `node .cursor/skills/verify-redisexample/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

Not exercised by the safe helper: invokes public GitHub API. Non-2xx handling and expired-cache path remain unverified.
