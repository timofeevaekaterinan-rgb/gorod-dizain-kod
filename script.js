(() => {
  // URL веб-приложения Google Apps Script (см. google-apps-script/Code.gs)
  const SHEET_URL = '';

  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Кнопки регистрации ведут к форме и ставят фокус в первое поле
  const nameInput = document.querySelector('input[name="name"]');
  document.querySelectorAll('a[href="#register"]').forEach((link) => {
    link.addEventListener('click', () => setTimeout(() => nameInput.focus({ preventScroll: true }), 500));
  });

  const form = document.querySelector('.form');
  const status = form.querySelector('.form__status');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('input', (e) => e.target.classList.remove('is-error'));
  form.addEventListener('change', (e) => e.target.classList.remove('is-error'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.classList.contains('is-sending')) return;
    const { name, email, consent } = form.elements;
    form.querySelectorAll('.is-error').forEach((el) => el.classList.remove('is-error'));
    const errors = [];
    if (!name.value.trim()) errors.push(name);
    if (!emailRe.test(email.value.trim())) errors.push(email);
    if (!consent.checked) errors.push(consent);
    errors.forEach((el) => el.classList.add('is-error'));

    if (errors.length) {
      status.textContent = errors.includes(consent) && errors.length === 1
        ? 'Нужно согласие на обработку данных'
        : 'Проверьте имя и email';
      errors[0].focus();
      return;
    }
    if (!SHEET_URL) {
      status.textContent = 'Форма пока не подключена к таблице';
      return;
    }

    const submit = form.querySelector('.btn--submit');
    form.classList.add('is-sending');
    submit.disabled = true;
    status.textContent = 'Отправляем…';
    try {
      // Apps Script не отдаёт CORS-заголовки, поэтому no-cors: ответ не читаем,
      // успехом считаем отсутствие сетевой ошибки
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({
          name: name.value.trim(),
          email: email.value.trim(),
          consent: consent.checked ? '1' : '',
          website: form.elements.website.value,
          page: location.href,
        }),
      });
      status.textContent = 'Готово! Пришлём ссылку на вебинар на почту.';
      form.reset();
      consent.checked = true;
    } catch {
      status.textContent = 'Не получилось отправить. Проверьте интернет и попробуйте ещё раз.';
    } finally {
      form.classList.remove('is-sending');
      submit.disabled = false;
    }
  });
})();
