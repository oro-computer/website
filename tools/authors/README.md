# Local author registry

Import or refresh a public GitHub profile:

```sh
npm run import-author -- bcomnes
node --test tools/authors/import.test.ts
```

Importing makes bounded HTTPS requests to `api.github.com` (profile and social
accounts), `avatars.githubusercontent.com` (avatar), and `github.com` (public
SSH/GPG keys). GitHub rate limits apply. An optional `GITHUB_TOKEN` environment
variable is sent only to `api.github.com`; it is never written to metadata.
Redirects are rejected, so credentials cannot be forwarded. No token is needed
for public profiles. Network failures, timeouts, invalid responses, and HTTP
errors fail the import before replacing existing data. Organization-only 404s
for social accounts or keys are treated as empty; other errors remain fatal.
The request deadline is 20 seconds, with 1 MiB text and 10 MiB avatar limits.

## Files and schema

Each `src/authors/<lowercase-github-username>/` contains `author-meta.json`
and `avatar.jpg`, `avatar.png`, `avatar.gif`, or `avatar.webp`.

Metadata schema version 1:

- `schemaVersion`: `1`
- `username`: canonical lowercase GitHub login
- `name`: GitHub display name, falling back to login
- `profile`: `https://github.com/<username>`
- `website`: validated, normalized HTTP(S) profile website, or `null`
- `links`: array of `{ provider: string, url: string }` public social accounts
- `avatar`: relative avatar filename, never an external URL or path traversal
- `keys`: public SSH keys as returned by GitHub, possibly an empty string
- `gpg`: public armored GPG data as returned by GitHub, possibly empty

An organization may return an empty armored GPG public-key block rather than
an empty response; this is preserved verbatim. Only public data is stored.
These files are intended to be checked in. Metadata and avatars are public
site assets; do not add private information or credentials.

## Runtime API and integration

`src/lib/authors.ts` exports:

- `BlogAuthor { username, name, url, avatar }`.
- `AuthorRegistry(directory?)`: lazy asynchronous, per-username registry.
  - `get(username)` returns a cached `Promise<BlogAuthor>`; concurrent calls for
    the same username share the exact promise and filesystem work.
  - `resolve(value, source)` resolves a nonempty array in input order and rejects
    duplicates, aliases, unknown names, and unsafe paths.
  - `clear(username?)` invalidates one author, or the entire instance. Already
    running callers still complete, but cannot repopulate a cleared cache.
- `authorRegistry`: shared module-level instance used by the site and CLI.
- `resolveBlogAuthors(value, source)`: async convenience wrapper around that
  instance. There is **no default** for this API.
- `authorRegistryDirectory`: local registry root.

Resolved `url` prefers the website, falling back to the GitHub profile. Avatar
URLs are `/authors/<username>/<filename>`; the site asset pipeline must copy
those files to those routes. Only requested authors are read; successful results
are cached for the instance lifetime, while failures are evicted so later calls
can retry. Cached author objects are frozen; each resolved author array is new.
Workers, processes, and reloaded module instances have separate caches. This is
an I/O cache, not a replacement for DOMStack's data fingerprints or dependencies.
The registry reads only local files and never contacts GitHub during builds.

**Restart the watch process after importing authors or manually editing metadata.**
The registry currently reads metadata through `fs`; native DOMStack dependency
tracking only tracks static imports, not these filesystem reads. Changes to
registry metadata therefore do not automatically rebuild author-dependent
pages or feeds. Stop and restart `npm start` after registry changes (including
additions/removals or avatar replacements), or run a fresh build. No custom
watcher or invalidation mechanism is installed.

Refresh replaces an entire author directory, so reserve that directory for
imported files.

Replacement uses a staged directory and rollback backup on the same filesystem.
Concurrent imports of the same username are prevented by a per-author lock.
An interrupted process may leave a dot-prefixed staging or lock directory.
Inspect `.username.lock/previous` before manually removing a stale lock: it
may contain the previous registry entry. If rollback itself fails, the importer
retains this backup rather than deleting it.
