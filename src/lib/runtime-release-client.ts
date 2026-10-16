// Resolve npm's latest dist-tag at page load so releases do not require a site build.
export async function initRuntimeRelease(): Promise<void> {
  const labels = document.querySelectorAll<HTMLElement>('[data-runtime-release]')
  if (!labels.length) return

  try {
    const response = await fetch('https://registry.npmjs.org/@oro-computer/runtime/latest', {
      credentials: 'omit',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return
    const release: unknown = await response.json()
    if (!release || typeof release !== 'object' ||
        !('name' in release) || release.name !== '@oro-computer/runtime' ||
        !('version' in release) || typeof release.version !== 'string' ||
        !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(release.version)) return

    for (const label of labels) label.textContent = `Latest release: v${release.version}`
  } catch {
    // The static npm links and @latest install commands remain usable offline.
  }
}
