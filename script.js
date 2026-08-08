const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
const year = document.getElementById('year');
const form = document.getElementById('lead-form');
const status = document.getElementById('form-status');
const progressBar = document.querySelector('.scroll-progress span');
const languageLinks = [...document.querySelectorAll('[data-language]')];
const i18n = window.LAREVIA_I18N;
const supportedLanguages = ['pt', 'en', 'es'];
const productionUrl = 'https://igsolutionmkt-lang.github.io/casa-pronta-premium/';
const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
let currentLanguage = supportedLanguages.includes(requestedLanguage) ? requestedLanguage : 'pt';

const textNodes = [];
const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    const parentTag = node.parentElement?.tagName;
    if (!node.nodeValue.trim() || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parentTag)) {
      return NodeFilter.FILTER_REJECT;
    }
    return NodeFilter.FILTER_ACCEPT;
  }
});
while (textWalker.nextNode()) {
  textNodes.push({ node: textWalker.currentNode, original: textWalker.currentNode.nodeValue });
}

const translatedAttributes = [];
document.querySelectorAll('[aria-label], [alt], [placeholder]').forEach(element => {
  ['aria-label', 'alt', 'placeholder'].forEach(attribute => {
    if (element.hasAttribute(attribute)) {
      translatedAttributes.push({ element, attribute, original: element.getAttribute(attribute) });
    }
  });
});

const translateOriginal = (value, dictionary) => {
  const key = value.trim();
  return dictionary[key] ? value.replace(key, dictionary[key]) : value;
};

const setMetaContent = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) element.setAttribute('content', value);
};

const updatePageUrl = language => {
  const url = new URL(window.location.href);
  if (language === 'pt') url.searchParams.delete('lang');
  else url.searchParams.set('lang', language);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
};

const applyLanguage = (language, updateUrl = false) => {
  if (!supportedLanguages.includes(language) || !i18n) return;
  currentLanguage = language;
  const dictionary = i18n.translations[language] || {};
  const meta = i18n.meta[language];

  textNodes.forEach(item => {
    item.node.nodeValue = translateOriginal(item.original, dictionary);
  });
  translatedAttributes.forEach(item => {
    item.element.setAttribute(item.attribute, translateOriginal(item.original, dictionary));
  });

  document.documentElement.lang = meta.lang;
  document.title = meta.title;
  setMetaContent('meta[name="description"]', meta.description);
  setMetaContent('meta[property="og:title"]', meta.title);
  setMetaContent('meta[property="og:description"]', meta.ogDescription);
  setMetaContent('meta[property="og:locale"]', meta.locale);
  setMetaContent('meta[property="og:url"]', language === 'pt' ? productionUrl : `${productionUrl}?lang=${language}`);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', language === 'pt' ? productionUrl : `${productionUrl}?lang=${language}`);

  const structuredData = document.getElementById('structured-data');
  if (structuredData) {
    const schema = JSON.parse(structuredData.textContent);
    schema.url = language === 'pt' ? productionUrl : `${productionUrl}?lang=${language}`;
    schema.serviceType = meta.serviceType;
    schema.inLanguage = meta.lang;
    structuredData.textContent = JSON.stringify(schema);
  }

  languageLinks.forEach(link => {
    const active = link.dataset.language === language;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const menuCopy = i18n.interface[language];
  const menuOpen = nav.classList.contains('open');
  navToggle.setAttribute('aria-label', menuOpen ? menuCopy.closeMenu : menuCopy.openMenu);
  navToggle.querySelector('.sr-only').textContent = menuOpen ? menuCopy.closeMenu : menuCopy.openMenu;
  if (updateUrl) updatePageUrl(language);
};

applyLanguage(currentLanguage);

document.body.classList.add('motion-ready');
requestAnimationFrame(() => document.body.classList.add('page-ready'));

if (year) year.textContent = new Date().getFullYear();

const setHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
};
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

const closeMenu = () => {
  nav.classList.remove('open');
  document.body.classList.remove('nav-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', i18n.interface[currentLanguage].openMenu);
  navToggle.querySelector('.sr-only').textContent = i18n.interface[currentLanguage].openMenu;
};

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  document.body.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  const menuCopy = i18n.interface[currentLanguage];
  navToggle.setAttribute('aria-label', open ? menuCopy.closeMenu : menuCopy.openMenu);
  navToggle.querySelector('.sr-only').textContent = open ? menuCopy.closeMenu : menuCopy.openMenu;
});
languageLinks.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  applyLanguage(link.dataset.language, true);
}));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeMenu();
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

const revealItems = document.querySelectorAll('.reveal');
revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}

const trackedSections = [...nav.querySelectorAll('a[href^="#"]')]
  .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(item => item.section);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      trackedSections.forEach(item => item.link.classList.toggle('active', item.section === entry.target));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  trackedSections.forEach(item => sectionObserver.observe(item.section));
}

document.querySelectorAll('.accordion details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.accordion details[open]').forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

const hero = document.querySelector('.hero');
const canParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (hero && canParallax) {
  hero.addEventListener('pointermove', event => {
    const x = ((event.clientX / window.innerWidth) - 0.5) * -10;
    const y = ((event.clientY / window.innerHeight) - 0.5) * -6;
    hero.style.setProperty('--hero-x', `${x}px`);
    hero.style.setProperty('--hero-y', `${y}px`);
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--hero-x', '0px');
    hero.style.setProperty('--hero-y', '0px');
  });
}

form.addEventListener('input', () => {
  if (status.textContent) {
    status.textContent = '';
    status.classList.remove('error', 'success');
  }
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const cfg = window.LAREVIA_CONFIG || {};
  const number = String(cfg.whatsappNumber || '').replace(/\D/g, '');
  const copy = i18n.interface[currentLanguage];
  const message = [
    copy.intro,
    '',
    `${copy.name}: ${data.get('nome')}`,
    `${copy.phone}: ${data.get('telefone')}`,
    `${copy.email}: ${data.get('email')}`,
    `${copy.location}: ${data.get('localizacao')}`,
    `${copy.propertyType}: ${data.get('imovel')}`,
    `${copy.service}: ${data.get('servico')}`,
    `${copy.information}: ${data.get('mensagem') || copy.notIndicated}`
  ].join('\n');
  if (!number || /000000/.test(number)) {
    const email = String(cfg.businessEmail || '').trim();
    if (!email || !email.includes('@')) {
      status.classList.add('error');
      status.textContent = copy.unavailable;
      return;
    }
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(message)}`;
    status.classList.add('success');
    status.textContent = copy.openingEmail;
    return;
  }
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  status.classList.add('success');
  status.textContent = copy.openingWhatsApp;
});

