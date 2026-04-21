# Release packaging and signed updates

Shipping the app is only half of the release story. The other half is producing update artifacts that can be verified,
served, and diagnosed later without improvisation.

This guide walks through a practical release flow for one runtime app.

## 1) Build a production package

From the project root:

```bash
oroc build . --prod --package
```

That gives you the packaged application artifact for the current target. Use this as the release candidate, not a debug
bundle from a development run.

## 2) Scaffold the update manifest

```bash
oroc update init
```

This creates the manifest file you will validate, sign, and publish with the release.

## 3) Generate signing keys once and store them outside the repo

```bash
oroc update keygen > update-key.json
```

Treat this as release infrastructure, not app source. The private key should never live in the project tree or be copied
between laptops casually.

## 4) Bundle the release artifact for update delivery

```bash
oroc update bundle --input ./dist --output ./updates/field-notes-1.2.0.tar --manifest manifest.json
```

This creates the update tarball and records it in the manifest.

## 5) Validate, sign, and verify before publishing

```bash
oroc update validate --manifest manifest.json --strict
oroc update sign --keys update-key.json --manifest manifest.json
oroc update verify --keys update-key.json --manifest manifest.json
```

If you skip validation and verification, you are pushing risk downstream to deployment and support.

## 6) Serve the update set from a bounded root

```bash
oroc update server --root ./updates
```

For smoke tests or alternate transports:

```bash
oroc update server --root ./updates --tcp --port 9090
oroc update server --root ./updates --udp --port 9090
```

Keep the server root narrow and predictable.

## 7) Inspect what clients will actually see

```bash
oroc update info --manifest-url https://updates.example.com/field-notes/manifest.json
```

If you are verifying signatures at inspection time:

```bash
oroc update info \
  --manifest-url https://updates.example.com/field-notes/manifest.json \
  --keys update-key.json
```

That closes the loop between packaging, signing, and distribution.

## 8) A release operator checklist

- build the production package
- generate or load the signing key material
- bundle the published update artifact
- validate the manifest
- sign and verify the manifest
- serve or upload the release root
- inspect the published manifest endpoint

That is the minimum professional release posture for a signed-update workflow.

## Considerations

- Keep private keys outside the repository and outside packaged app outputs.
- Version your update root contents deliberately; do not overwrite old release artifacts blindly.
- Use `--log-file` on update commands when you need a durable audit trail for release operations.

## Next

- [Build and package](?p=guides/build-and-package)
- [Mobile targets and device installs](?p=guides/mobile-targets-and-device-installs)
- [`oroc update`](?p=cli/update)
