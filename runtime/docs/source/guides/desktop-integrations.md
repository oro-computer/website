# Desktop integrations

Oro Runtime applications stay web-first, but the point of the runtime is that you do not stop at the browser boundary.
This guide shows how to add four integrations users actually notice: notifications, clipboard, file pickers, and native menus.

## 1) Request and use notifications

`src/main.js`:

```js
import Notification, { showNotification } from 'oro:notification'
import { onNotificationResponse } from 'oro:hooks'

const permission = await Notification.requestPermission()

if (permission === 'granted') {
  await showNotification('Field Notes ready', {
    body: 'Capture notes even when the main window is not focused.',
  })
}

onNotificationResponse((event) => {
  console.log('notification response', event)
})
```

Make sure your project enables notifications:

```toml
[permissions]
allow_notifications = true
```

## 2) Copy useful content to the clipboard

Clipboard integration is one of the fastest ways to make a utility app feel native:

```js
import { writeText, readText, canWriteText } from 'oro:clipboard'

async function copyCurrentNote(note) {
  if (!canWriteText()) return
  await writeText(`${note.title}\n\n${note.body}`)
}

console.log(await readText())
```

## 3) Let the user choose files with the native picker

Use the current window to open platform file pickers:

```js
import application from 'oro:application'

const currentWindow = await application.getCurrentWindow()
const paths = await currentWindow.showOpenFilePicker({ multiple: true })

console.log(paths)
```

This is the right path when the user is selecting files outside the application bundle or filesystem sandbox.

## 4) Add a native application menu

Menus matter on desktop. They make the app feel intentional instead of embedded:

```js
import application from 'oro:application'

await application.setSystemMenu({
  index: 0,
  value: `
    File:
      New Note: n + Meta;
      Sync Now: s + Meta;
      Quit: q + Meta;
    Edit:
      Copy Summary: c + Meta;
  `,
})
```

Use menu items for high-frequency actions, not every control in the UI.

## 5) Pull the integrations together

Here is a realistic pattern for a note-taking app:

```js
import { writeText } from 'oro:clipboard'
import { showNotification } from 'oro:notification'

async function exportNoteSummary(note) {
  await writeText(`${note.title}\n${note.updatedAt}`)
  await showNotification('Copied summary', {
    body: `Copied "${note.title}" to the clipboard.`,
  })
}
```

That one flow crosses UI, clipboard, and notifications without dropping into native platform code.

## Considerations

- Gate integrations behind permissions where the runtime requires them.
- Use notifications for user value, not background noise.
- Keep menu labels and button labels aligned so keyboard and UI navigation tell the same story.

## Next

- [Windows and messaging](?p=guides/windows-and-messaging)
- [Files and sandboxing](?p=guides/files-and-sandboxing)
- [`oro:notification`](?p=javascript/notification)
