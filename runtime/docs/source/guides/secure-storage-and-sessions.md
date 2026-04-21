# Secure storage and sessions

Application data and application secrets are not the same thing. Put notes, caches, and drafts in the filesystem or
SQLite. Put refresh tokens, client secrets, and other credentials in `oro:secure-storage`.

## 1) Store a session token after sign-in

```js
import * as secureStorage from 'oro:secure-storage'

export async function storeSession(session) {
  await secureStorage.setItem('refresh-token', session.refreshToken)
  await secureStorage.setItem('api-base-url', session.apiBaseUrl)
}
```

By default the runtime scopes storage to the current app origin, which is usually what you want.

## 2) Restore the session on startup

```js
import * as secureStorage from 'oro:secure-storage'

export async function loadSession() {
  const refreshToken = await secureStorage.getItem('refresh-token')
  const apiBaseUrl = await secureStorage.getItem('api-base-url')

  if (!refreshToken || !apiBaseUrl) return null
  return { refreshToken, apiBaseUrl }
}
```

This lets the app recover cleanly after restart without leaking secrets into source-controlled config.

## 3) Use explicit scopes when you need separation

If the app talks to multiple environments, isolate them:

```js
await secureStorage.setItem('refresh-token', token, {
  scope: 'https://staging.example.com',
})
```

That prevents staging and production credentials from clobbering each other.

## 4) Enumerate and clear keys during sign-out

```js
import * as secureStorage from 'oro:secure-storage'

const keys = await secureStorage.keys()
console.log(keys)

await secureStorage.removeItem('refresh-token')
await secureStorage.removeItem('api-base-url')
```

If your app stores a full session namespace, `clear()` is also available.

## 5) Keep binary secrets binary

If you are storing keys or opaque encrypted values, do not base64 them unless you need portability:

```js
const bytes = crypto.getRandomValues(new Uint8Array(32))
await secureStorage.setItem('device-key', bytes)

const restored = await secureStorage.getItem('device-key', {
  encoding: 'buffer',
})
```

That avoids unnecessary conversions and accidental text encoding bugs.

## Considerations

- Do not put secrets in `oro.toml`, `.ororc`, or bundled JSON files.
- Prefer one storage key per concern (`refresh-token`, `device-key`, `signing-state`) instead of one opaque bag of JSON.
- Pair secure storage with ordinary application state. The secret unlocks the session; SQLite and files hold the user-visible data.

## Next

- [Calling HTTP APIs](?p=guides/calling-http-apis)
- [Local data with SQLite](?p=guides/local-data-with-sqlite)
- [`oro:secure-storage`](?p=javascript/secure-storage)
