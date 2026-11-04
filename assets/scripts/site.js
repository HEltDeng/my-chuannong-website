(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* optional */ } },
  };
  const text = (selector, value) => $$(selector).forEach(el => { el.textContent = value; });
  const urlFor = (value, allowLocal = false) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, window.location.href);
      if (url.username || url.password) return null;
      if (url.protocol === 'https:' || (allowLocal && url.origin === location.origin && value.startsWith('/') && !value.startsWith('//'))) return url.href;
    } catch { /* invalid URL */ }
    return null;
  };

  const menu = $('[data-site-nav]');
  const menuButton = $('[data-menu-button]');
  const overlay = $('[data-menu-overlay]');
  const closeMenu = (restore = false) => {
    menu.dataset.open = 'false'; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', '打开导航菜单');
    overlay.hidden = true; document.body.classList.remove('nav-is-open');
    if (restore) menuButton.focus();
  };
  menuButton.addEventListener('click', () => {
    const opening = menu.dataset.open !== 'true';
    if (!opening) return closeMenu();
    menu.dataset.open = 'true'; menuButton.setAttribute('aria-expanded', 'true'); menuButton.setAttribute('aria-label', '关闭导航菜单');
    overlay.hidden = false; document.body.classList.add('nav-is-open');
    $('[data-menu-close]').focus();
  });
  $('[data-menu-close]').addEventListener('click', () => closeMenu(true));
  overlay.addEventListener('click', () => closeMenu(true));
  $$('a', menu).forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.dataset.open === 'true') closeMenu(true);
  });
  window.matchMedia('(min-width: 841px)').addEventListener('change', event => {
    if (event.matches && menu.dataset.open === 'true') closeMenu();
  });

  const applyTheme = value => {
    const dark = value === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#10251a' : '#ffffff';
    $$('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
      button.title = button.getAttribute('aria-label');
      $('[data-theme-icon]', button).src = dark ? 'assets/icons/sun.svg' : 'assets/icons/moon.svg';
    });
  };
  applyTheme(storage.get('mychuannong:theme'));
  $$('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    storage.set('mychuannong:theme', next); applyTheme(next);
  }));

  const qq = $('#qq-dialog');
  $$('[data-qq-trigger]').forEach(button => button.addEventListener('click', () => { closeMenu(); if (!qq.open) qq.showModal(); }));
  $('[data-qq-close]').addEventListener('click', () => qq.close());
  qq.addEventListener('click', event => { if (event.target === qq) qq.close(); });

  const guideSearch = $('[data-guide-search]');
  if (guideSearch) guideSearch.addEventListener('input', () => {
    const query = guideSearch.value.trim().toLocaleLowerCase();
    let visible = 0;
    $$('[data-guide-article]').forEach(article => {
      const matches = !query || article.textContent.toLocaleLowerCase().includes(query);
      article.hidden = !matches; if (matches) visible += 1;
      const link = $(`[data-guide-link][href="#${article.id}"]`);
      if (link) link.hidden = !matches;
    });
    $('[data-guide-empty]').hidden = visible > 0;
  });
  const legalLink = $(`[data-legal-page="${document.body.dataset.page}"]`);
  if (legalLink) legalLink.setAttribute('aria-current', 'page');

  const applyConfig = config => {
    const android = config.android || {};
    const download = urlFor(android.downloadUrl, true);
    const verified = download && /^[a-f0-9]{64}$/i.test(android.sha256 || '') && android.version && android.releaseDate && android.size;
    if (verified) {
      const link = $('[data-android-download]');
      if (link) { link.href = download; link.hidden = false; $('[data-android-disabled]').hidden = true; }
      text('[data-android-state]', '正式版已开放'); text('[data-android-platform]', '已开放');
      text('[data-android-version]', String(android.version)); text('[data-android-date]', String(android.releaseDate));
      text('[data-android-size]', String(android.size)); text('[data-android-hash]', String(android.sha256).toUpperCase());
    }
    const iosUrl = urlFor(config.ios?.downloadUrl);
    if (iosUrl) {
      text('[data-ios-platform]', '已开放');
      const link = $('[data-ios-download]'); if (link) { link.href = iosUrl; link.hidden = false; $('[data-ios-unavailable]').hidden = true; }
    }
    const qqUrl = urlFor(config.qqGroupUrl);
    if (qqUrl) { $('[data-qq-empty]').hidden = true; const link = $('[data-qq-link]'); link.href = qqUrl; link.hidden = false; }
    const filingUrl = urlFor(config.filing?.url);
    if (filingUrl && typeof config.filing?.number === 'string' && config.filing.number.trim()) {
      const link = $('[data-filing-link]'); link.href = filingUrl; link.textContent = config.filing.number; link.hidden = false;
    }
    const timeline = $('[data-release-timeline]');
    const releases = Array.isArray(config.releases) ? config.releases : [];
    if (timeline && releases.length) {
      timeline.replaceChildren();
      releases.forEach((release, index) => {
        if (!release || typeof release.version !== 'string') return;
        const item = document.createElement('article'); item.className = 'timeline-item' + (index === 0 ? ' is-current' : '');
        const dot = document.createElement('span'); dot.className = 'timeline-dot';
        const card = document.createElement('div'); card.className = 'timeline-card';
        const heading = document.createElement('div'); heading.className = 'timeline-heading';
        const h2 = document.createElement('h2'); h2.textContent = release.version;
        const status = document.createElement('div'); status.className = 'timeline-status';
        const label = document.createElement('span'); label.textContent = String(release.status || '已发布'); status.append(label);
        if (release.date) { const date = document.createElement('time'); date.className = 'timeline-release-date'; date.textContent = String(release.date); status.append(date); }
        heading.append(h2, status); card.append(heading);
        if (release.summary) { const p = document.createElement('p'); p.className = 'timeline-summary'; p.textContent = String(release.summary); card.append(p); }
        if (Array.isArray(release.items) && release.items.length) {
          const list = document.createElement('ul'); release.items.forEach(value => { const li = document.createElement('li'); li.textContent = String(value); list.append(li); }); card.append(list);
        }
        item.append(dot, card); timeline.append(item);
      });
    }
    return config.announcementPath;
  };

  const startAnnouncements = path => {
    const endpoint = urlFor(path, true);
    if (!endpoint || new URL(endpoint).origin !== location.origin) return;
    const region = $('[data-announcement-region]'); const dialog = $('#announcement-dialog');
    const shortcuts = $$('[data-announcement-shortcut]');
    let current = null;
    const keyFor = item => 'mychuannong:website-announcement:' + item.id + ':' + item.updatedAt;
    const updateDots = () => {
      const unread = current && !storage.get(keyFor(current));
      shortcuts.forEach(button => { $('.announcement-dot', button).hidden = !unread; });
    };
    const show = () => {
      if (!current) return;
      closeMenu();
      $('#announcement-title').textContent = current.title;
      $('#announcement-content').textContent = current.content;
      const date = $('[data-announcement-date]'); date.textContent = '';
      const raw = current.publishedAt;
      const stamp = typeof raw === 'number' && raw < 100000000000 ? raw * 1000 : raw;
      const parsed = new Date(stamp);
      if (raw && !Number.isNaN(parsed.getTime())) { date.textContent = new Intl.DateTimeFormat('zh-CN', { year:'numeric', month:'long', day:'numeric' }).format(parsed); date.dateTime = parsed.toISOString(); }
      if (!dialog.open) dialog.showModal();
    };
    $('[data-announcement-trigger]').addEventListener('click', show);
    shortcuts.forEach(button => button.addEventListener('click', show));
    $('[data-announcement-close]').addEventListener('click', () => dialog.close());
    $('[data-announcement-confirm]').addEventListener('click', () => { if (current) storage.set(keyFor(current), '1'); updateDots(); dialog.close(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    const refresh = async () => {
      const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 4500);
      try {
        const response = await fetch(endpoint, { signal: controller.signal, credentials: 'omit', cache: 'no-store' });
        if (!response.ok) throw new Error('unavailable');
        const json = await response.json(); const rows = json?.data?.websiteAnnouncements;
        const next = Array.isArray(rows) ? rows.find(item => item && item.id != null && typeof item.title === 'string' && typeof item.content === 'string') : null;
        current = next || null; region.hidden = !current;
        shortcuts.forEach(button => { button.disabled = !current; button.title = current ? '查看网站公告' : '暂无最新公告'; button.setAttribute('aria-label', button.title); });
        if (current) {
          $('[data-announcement-summary]').textContent = current.title;
          updateDots();
          if (!storage.get(keyFor(current)) && !dialog.open) show();
        }
      } catch { current = null; region.hidden = true; shortcuts.forEach(button => { button.disabled = true; $('.announcement-dot', button).hidden = true; button.title = '暂无最新公告'; button.setAttribute('aria-label', button.title); }); }
      finally { clearTimeout(timeout); }
    };
    refresh(); setInterval(refresh, 5 * 60 * 1000);
  };
  fetch('config/site.json', { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('configuration unavailable');
    return response.json();
  }).then(config => startAnnouncements(applyConfig(config))).catch(() => { /* the static pages stay usable without configuration */ });
})();
