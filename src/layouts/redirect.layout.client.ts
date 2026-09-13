const target = document.querySelector<HTMLAnchorElement>('[data-redirect]')
if (target) location.replace(target.pathname + location.search + location.hash)
