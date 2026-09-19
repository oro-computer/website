export function writeClipboard(text: string | null | undefined): Promise<boolean> {
    const value = String(text ?? "");
    if (!value) return Promise.resolve(false);

    if (globalThis.navigator?.clipboard?.writeText) {
      return globalThis.navigator.clipboard
        .writeText(value)
        .then(() => true)
        .catch(() => false);
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return Promise.resolve(Boolean(ok));
    } catch {
      return Promise.resolve(false);
    }
  }

