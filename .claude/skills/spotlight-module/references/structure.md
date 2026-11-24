# Карта шаблонов

Номера строк примерные — ищи по комментариям `/* ---------- … ---------- */` и по id.

## assets/reference/module3.html

### `<head>`
- `<title>`, `<meta name="description">` — поменяй под модуль.
- Блок PWA: `theme-color`, `manifest` → `mN.webmanifest`, `apple-touch-icon` → `mN-icon.png`,
  `apple-mobile-web-app-title` → «Module N», скрипт регистрации service worker → `spotlight-sw.js`.
- `<link … fonts.googleapis.com …>` — заменяется встроенными шрифтами скриптом `inline_fonts.py`.
- `<style>`: токены `:root` (светлая) + два блока тёмной темы, затем блоки по комментариям:
  HERO, Оглавление, Постер раздела, Подзаголовки, Карточки, Жирные слова, Упражнения,
  Дорожная карта (`.plan` — план из 4 шагов с точками и номерами 01–04), Итог (`.total`),
  Now I can (`.canlist`). CSS не меняй, если нет новой просьбы о дизайне.

### `<body>` — содержание
| Блок | Что менять |
|---|---|
| `header.hero#top` | `.giant` — цифра модуля; `.corner` — «Spotlight 7 / Module 0N»; `h1` — тема модуля строчными с точкой + `.script`; `.lead` — о чём модуль по-русски |
| `nav.toc` | `<a href="#id"><b>4a</b><small>Короткое имя</small></a>` на каждую часть, затем Use, History, Check, ↑ Наверх |
| `section.unit#a…` | постер (`.poster TONE` → `.corner` два `.label`, `h2`, `.foot` с `.desc` и `.arrow`), потом `h3` + карточки |
| `.card.rule` | правило грамматики: таблица/примеры, `.hl` — подсветка ключевого слова |
| `.note` | «study skills» из учебника (подпись рисуется сама) |
| `.grid2 > .card.text` | короткие пересказы по людям/героям: первый `<b>` — имя крупно |
| `.card.text.orig#txt-KEY` + `tbody#tbl-KEY` | полный английский текст; жирные слова → `[[…]]`; реплики диалога — `<b class="who">Имя:</b>` |
| `.ex[data-ex=ID]` | пустая панель с заголовком `h4` и `.score`; вопросы рисует движок из `EX.ID` |
| `#check` | `.canlist#canlist` (пункты «Now I can» из учебника), блоки `.ex[data-ex=pN][data-pts=K]`, `.total` |
| `footer` | `.script` «good luck!» + подпись модуля |

### `<script>`
1. **Данные модуля** — `const HOBBIES/CHAR/APP/PRON/DLG/U3` (только для модуля 3, заменить/удалить),
   `const EX={…}` (упражнения), ниже `const BOLD={KEY:{"слово в [[ ]]":[таблица, перевод, пример]}}`.
2. **Утилиты** `$`, `$$`, `say()` (озвучка en-GB через speechSynthesis), `sp()` (кнопка 🔊), `shuffle`.
3. **Статичные блоки** — заполнение `#hobbies`, `#charTbl`, `#appTbl`, `#pron`, `#dlg` из данных
   модуля 3. Удали строки для блоков, которых в новом модуле нет (иначе `null.innerHTML` уронит скрипт).
4. **BOLD-цикл** — превращает `[[…]]` в кнопки `.bw` и строит таблицы. Не трогать.
5. **Движок упражнений** `renderEx/mark/updScore/updTotal` — не трогать. Поддерживает:
   - выбор: `{q, o, a, w}`; `___` в `q` превращается в пропуск и заполняется ответом;
   - порядок слов: `{t:"order", pre, words}`;
   - пропуски диалога: `{…, gap:N}` дополнительно заполняет `#dlg .gap[data-g=N]`.
6. **Меню** (`markToc`, `jumping`) и **Now I can** (localStorage `m3can` → поменяй на `mNcan`),
   **тема** (localStorage `m3theme` — общий для всех модулей, оставить).

## assets/reference/module3-words.html
- `header.hero` — «words, *words,* words.», статистика `#sAll/#sKnown/#sSel`, полоса `#pbar`.
- `const RAW` — по строке на слово: `Раздел|english|перевод|пример`. Порядок строк = порядок в списке.
- `const KEY="m3words"` → `mNwords`.
- Остальное (режимы list/cards/quiz/spell, фильтры, печать) не трогать.
- В режиме «Написание» принимается и форма без скобок: `blond(e)` → `blond`, `give up (on)` → `give up`.

## assets/reference/writings.html
- `header.hero` с `.giant` «W», `h1` «writings.»
- `section#write` — `<details class="card" open><summary>Название (часть, объём)</summary>
  <p class="en">…</p><p class="small muted">план</p></details>` на каждый образец.
- Скрипт сам добавляет «N words» к заголовку — по нему проверяй объём.
