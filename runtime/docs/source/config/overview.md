# Configuration overview

Oro Runtime projects are configured with a file named `oro.toml` (TOML) in the project root.

The CLI also supports `oro.ini` when `oro.toml` is absent. This is mainly for compatibility with older projects.

## How configuration is composed

At build/run time, `oroc` computes an effective configuration from multiple sources:

1. **Project config**: `oro.toml` (preferred) or `oro.ini`
2. **RC overrides**: `.ororc` files (global → user → local)
3. **CLI flags**: `oroc run/build/...` options

To see what you’re actually running with, use:

```bash
oroc config --format toml
```

## Local overrides: `.ororc`

Some values are machine-local or secret (signing identities, provisioning profiles, simulator device names, tokens).
Put those in `.ororc` so you don’t have to commit them.

`oroc` will read `.ororc` from several locations (system, user, and project). The project-local `.ororc` has the
highest precedence.

To override values from `oro.toml`, use a `settings.*` section. For example:

```ini
[settings.ios]
simulator_device = "iPhone 15"
codesign_identity = "iPhone Developer: Jane Doe (XXXXXXXXXX)"
provisioning_profile = "jane.mobileprovision"
```

## No `~` expansion

`~` does not expand to your home directory in config files. Use an absolute path or `$HOME`.

## Next

- Reference: [Config keys](?p=config/reference)
- Bundling inputs: [copy_map](?p=config/copy-map)
- CLI: [`oroc config`](?p=cli/config)

