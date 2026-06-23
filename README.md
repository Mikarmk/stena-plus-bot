# Стена Плюс — Telegram Bot + Mini App

Готовый проект Telegram-бота с Mini App для продажи подписки `Стена Плюс`.

Что уже реализовано:

- Telegram-бот на `Telegraf`
- Mini App на `React + Vite`
- 2 тарифа:
  - 1 месяц — `99 ₽`
  - 2 месяца — `179 ₽`
- endpoint для создания invoice link через Telegram Payments
- premium white-wall UI под мобильный Telegram WebView

## Быстрый старт

```bash
npm install
cp .env.example .env
```

Заполните `.env`:

- `BOT_TOKEN` — токен вашего бота
- `MINI_APP_URL` — публичный URL Mini App
- `PAYMENT_PROVIDER_TOKEN` — токен платёжного провайдера для Telegram Payments

Запуск в разработке:

```bash
npm run dev
```

Frontend поднимется на:

- `http://localhost:5173`

Backend:

- `http://localhost:3000`

## Важно по оплате

Для реальной оплаты в рублях одного `BOT_TOKEN` недостаточно. Нужен `PAYMENT_PROVIDER_TOKEN`, который выдаёт платёжный провайдер, подключённый к Telegram Payments.

Без него:

- бот и Mini App работают
- выбор тарифа работает
- реальная ссылка на оплату не создаётся

## Команды бота

- `/start` — открыть Mini App
- `/buy` — открыть экран покупки

## Продакшн

Соберите фронт:

```bash
npm run build
```

Затем запустите сервер:

```bash
npm start
```

Express будет раздавать собранный `dist` и API из одного процесса.

## Деплой на Render

В репозитории уже есть [render.yaml](/Users/murat/Documents/Стена%20плюс%20бот/render.yaml) для деплоя одним web service.

Что нужно сделать:

```bash
git init
git add .
git commit -m "Initial Stena Plus bot"
git branch -M main
git remote add origin <YOUR_GIT_REPO_URL>
git push -u origin main
```

Дальше в Render:

- Create New -> Blueprint
- выбрать ваш Git-репозиторий
- Render сам подхватит `render.yaml`

Обязательные переменные окружения в Render:

- `BOT_TOKEN`
- `PAYMENT_PROVIDER_TOKEN`
- `PUBLIC_BASE_URL` — например `https://stena-plus-bot.onrender.com`
- `MINI_APP_URL` — обычно тот же URL, что и `PUBLIC_BASE_URL`

После деплоя:

1. Откройте `@BotFather`
2. Выберите вашего бота
3. Настройте кнопку Mini App / menu button на публичный URL Render
4. Проверьте `/start`

Если хотите, следующим сообщением я могу:

- подготовить репозиторий к Git push,
- помочь выбрать хостинг,
- или перевести бота с long polling на webhook под прод.
