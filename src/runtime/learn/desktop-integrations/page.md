# Desktop integrations

Copy your draft into another app, then opt into save notifications. Saving should still work when notifications are unavailable.

**Before you start:** continue from [Windows and messaging](/runtime/learn/windows-and-messaging/). Keep the preview code.

## 1. Enable the capabilities

Add these keys under `[permissions]` in `oro.toml`; create the section if needed.

### `oro.toml` — add `[permissions]`

```toml
[permissions]
allow_clipboard = true
allow_notifications = true
```

## 2. Add the buttons

Insert after **Preview draft**, before the status paragraph:

### `src/index.html` — insert after Preview draft

```html
<button id="copy-draft" type="button">Copy draft</button>
<button id="enable-notifications" type="button">Enable save notifications</button>
```

## 3. Connect them

Remove the original `form.addEventListener('submit', …)` block from `src/main.js`. Keep `saveDraft()` and append this code. There must be only one submit listener.

### `src/main.js` — append after removing the old submit listener

```javascript
import Notification, { showNotification } from 'oro:notification'
import { writeText, canWriteText } from 'oro:clipboard'

const copyButton = document.getElementById('copy-draft')
const notificationsButton = document.getElementById('enable-notifications')
let notificationsEnabled = false

copyButton.addEventListener('click', async () => {
  try {
    if (!canWriteText()) {
      status.textContent = 'Clipboard writing is unavailable on this host.'
      return
    }
    await writeText(noteInput.value)
    status.textContent = 'Draft copied. Paste it into another app to check.'
  } catch (error) {
    status.textContent = `Could not copy draft: ${error.message}`
  }
})

notificationsButton.addEventListener('click', async () => {
  try {
    const permission = await Notification.requestPermission()
    notificationsEnabled = permission === 'granted'
    status.textContent = notificationsEnabled
      ? 'Save notifications enabled for this session.'
      : 'Notifications are off. You can still save your draft.'
  } catch (error) {
    status.textContent = `Notifications unavailable: ${error.message}`
  }
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!saveDraft() || !notificationsEnabled) return
  try {
    await showNotification('Field Notes', { body: 'Your draft was saved.' })
  } catch (error) {
    status.textContent = `Draft saved; notification unavailable: ${error.message}`
  }
})
```

Consent is requested on a click. Enabling notifications lasts for this session; denying consent leaves saving usable. See [notification behavior](/runtime/docs/javascript/notification/) for host details.

## 4. Try the actions

### Terminal

```bash
oroc build .
oroc run .
```

**Expected result:** **Copy draft** preserves the text and line breaks when pasted into another app. Enable notifications, then save: the OS can show **Your draft was saved.** Deny permission and save again: reopening should still restore the draft.

For silent notifications, check the OS notification settings and focus mode. To add menu actions later, see [`setSystemMenu`](/runtime/docs/javascript/application/).

## Try it yourself

Save with notifications off, close, and reopen. The draft itself should confirm that saving worked.

## Next

[Store multiple notes with SQLite →](/runtime/docs/guides/local-data-with-sqlite/) or [package the app →](/runtime/docs/guides/build-and-package/).
