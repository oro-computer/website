import { html, render } from 'fragtml'

export function searchDialog(): string {
  return render(html`<dialog id="site-search" class="site-search" aria-label="Search Oro Computer" aria-describedby="site-search-help">
    <div class="site-search-field">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
      <input id="site-search-input" type="search" role="combobox" aria-label="Search the site" aria-autocomplete="list" aria-controls="site-search-results" aria-expanded="true" autocomplete="off" spellcheck="false" placeholder="Search documentation, guides, and more…" />
      <button type="button" class="site-search-close" aria-label="Close search">✕</button>
    </div>
    <div class="site-search-body">
      <p class="site-search-label" id="site-search-label">Quick links</p>
      <ul id="site-search-results" role="listbox" aria-labelledby="site-search-label"></ul>
      <p class="site-search-message" hidden></p>
      <button type="button" class="site-search-retry" hidden>Try again</button>
    </div>
    <div class="site-search-footer">
      <span role="status" aria-live="polite" aria-atomic="true" class="site-search-status"></span>
      <span class="site-search-keys" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></span>
    </div>
    <span id="site-search-help" class="search-sr-only">Type to search across the site. Use the up and down arrow keys to choose a result, Enter to open it, and Escape to close.</span>
  </dialog>`)
}
