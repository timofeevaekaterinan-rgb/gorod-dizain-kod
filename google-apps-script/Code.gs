// Приём заявок с лендинга в Google Таблицу.
// Вставить в таблицу: Расширения → Apps Script, затем Развернуть → Новое развертывание → Веб-приложение
// (Запуск от моего имени, Доступ: Все). URL развертывания вписать в script.js → SHEET_URL.

const SHEET_NAME = 'Заявки';
const HEADERS = ['Дата', 'Имя', 'Email', 'Согласие', 'Страница'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json({ ok: true }); // ловушка для ботов

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }
    sheet.appendRow([new Date(), clean(p.name), clean(p.email), p.consent ? 'да' : 'нет', clean(p.page)]);
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, service: 'webinar-form' });
}

// Обрезаем длину и не даём строкам исполниться как формула
function clean(value) {
  const v = String(value || '').trim().slice(0, 200);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
