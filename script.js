const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
const year = document.getElementById('year');
const form = document.getElementById('lead-form');
const status = document.getElementById('form-status');

if (year) year.textContent = new Date().getFullYear();

const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

const closeMenu = () => {
  nav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Abrir menu');
};

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
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
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
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
  const cfg = window.CASA_PRONTA_CONFIG || {};
  const number = String(cfg.whatsappNumber || '').replace(/\D/g, '');
  if (!number || /000000/.test(number)) {
    status.classList.add('error');
    status.textContent = 'O contacto por WhatsApp ainda não está disponível. Tente novamente mais tarde.';
    return;
  }
  const message = [
    'Olá, gostaria de solicitar uma avaliação da Casa Pronta Premium.',
    '',
    `Nome: ${data.get('nome')}`,
    `Telefone: ${data.get('telefone')}`,
    `Localização: ${data.get('localizacao')}`,
    `Tipo de imóvel: ${data.get('imovel')}`,
    `Serviço: ${data.get('servico')}`,
    `Informações: ${data.get('mensagem') || 'Não indicado'}`
  ].join('\n');
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  status.classList.add('success');
  status.textContent = 'A abrir o WhatsApp com os dados do pedido…';
});
