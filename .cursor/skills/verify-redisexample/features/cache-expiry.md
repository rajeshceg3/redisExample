# Cache lifetime

Cache lifetime is a user-facing part of redisExample.

## Sub-features

- `cache-expiry`: Observe TTL dropping; after expiry verify a fresh fetch and newly populated value.

## How to get to it (user POV)

Revisit the same profile after its 100-second cache expiry.

## Driving it with verify-redisexample

Preconditions: launch and doctor pass on the helper-owned disposable instance.

Observe TTL dropping; after expiry verify a fresh fetch and newly populated value. Run `node .cursor/skills/verify-redisexample/verify.cjs`. Capture action and resulting state in evidence.json; browser proof also requires screenshots and pixel inspection.

## Gotchas

Not exercised: requires the external fetch path. Never flush or seed a shared Redis.
