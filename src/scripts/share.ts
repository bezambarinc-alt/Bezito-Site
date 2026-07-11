/**
 * Shared share widget — used by archive modal and product pages.
 *
 * initShare    wires up the trigger, menu, copy, and outside-click handlers.
 * updateShare  rebuilds email/WA hrefs when the shared item changes (archive).
 */

export function initShare(
  els: {
    wrap:       Element | null;
    trigger:    HTMLButtonElement | null;
    menu:       HTMLElement | null;
    copyBtn:    HTMLButtonElement | null;
    copyLabel:  HTMLElement | null;
    emailLink:  HTMLAnchorElement | null;
    waLink:     HTMLAnchorElement | null;
  },
  getState: () => { title: string; url: string },
) {
  const { wrap, trigger, menu, copyBtn, copyLabel } = els;
  if (!trigger || !menu) return;

  trigger.addEventListener('click', function () {
    if (navigator.share) {
      const { title, url } = getState();
      navigator.share({ title, url }).catch(function () {});
    } else {
      const open = !menu.hidden;
      menu.hidden = open;
      trigger.setAttribute('aria-expanded', String(!open));
    }
  });

  if (copyBtn && copyLabel) {
    copyBtn.addEventListener('click', function () {
      const { url } = getState();
      navigator.clipboard.writeText(url)
        .then(function () {
          copyLabel.textContent = 'Copied!';
          menu.hidden = true;
          setTimeout(function () { copyLabel.textContent = 'Copy link'; }, 2000);
        })
        .catch(function () {
          menu.hidden = true;
        });
    });
  }

  document.addEventListener('click', function (e) {
    if (menu.hidden) return;
    if (wrap && !wrap.contains(e.target as Node)) menu.hidden = true;
  });
}

export function updateShare(
  els: {
    emailLink: HTMLAnchorElement | null;
    waLink:    HTMLAnchorElement | null;
  },
  title: string,
  url: string,
) {
  const { emailLink, waLink } = els;
  if (emailLink) {
    emailLink.href =
      'mailto:?subject=' +
      encodeURIComponent('Bez Ambar — ' + title) +
      '&body=' +
      encodeURIComponent('Take a look at this piece from Bez Ambar:\n' + url);
  }
  if (waLink) {
    waLink.href =
      'https://wa.me/?text=' +
      encodeURIComponent('Bez Ambar — ' + title + ': ' + url);
  }
}
