const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
const year = document.getElementById('year');
const form = document.getElementById('lead-form');
const status = document.getElementById('form-status');
const progressBar = document.querySelector('.scroll-progress span');

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
  navToggle.setAttribute('aria-label', 'Abrir menu');
};

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  document.body.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
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
  const message = [
    'Olá, gostaria de solicitar uma avaliação da Larevia.',
    '',
    `Nome: ${data.get('nome')}`,
    `Telefone: ${data.get('telefone')}`,
    `Email: ${data.get('email')}`,
    `Localização: ${data.get('localizacao')}`,
    `Tipo de imóvel: ${data.get('imovel')}`,
    `Serviço: ${data.get('servico')}`,
    `Informações: ${data.get('mensagem') || 'Não indicado'}`
  ].join('\n');
  if (!number || /000000/.test(number)) {
    const email = String(cfg.businessEmail || '').trim();
    if (!email || !email.includes('@')) {
      status.classList.add('error');
      status.textContent = 'Os canais de contacto ainda não estão configurados. Escreva para contacto@larevia.pt.';
      return;
    }
    window.location.href = `mailto:${email}?subject=${encodeURIComponent('Pedido de consulta privada')}&body=${encodeURIComponent(message)}`;
    status.classList.add('success');
    status.textContent = 'A abrir o seu email com os dados do pedido…';
    return;
  }
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  status.classList.add('success');
  status.textContent = 'A abrir o WhatsApp com os dados do pedido…';
});
