import "dotenv/config";
import express from "express";
import cors from "cors";
import { Telegraf, Markup } from "telegraf";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(rootDir, "../dist");
const distIndex = path.resolve(distDir, "index.html");

const plans = {
  month_1: {
    id: "month_1",
    title: "Стена Плюс — 1 месяц",
    description: "Подписка на 1 месяц",
    amount: 9900,
    durationDays: 30
  },
  month_2: {
    id: "month_2",
    title: "Стена Плюс — 2 месяца",
    description: "Подписка на 2 месяца",
    amount: 17900,
    durationDays: 60
  }
};

const botToken = process.env.BOT_TOKEN;
const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;
const miniAppUrl =
  process.env.MINI_APP_URL || publicBaseUrl || "http://localhost:5173";
const paymentProviderToken = process.env.PAYMENT_PROVIDER_TOKEN || "";
const canOpenMiniApp = (() => {
  try {
    const url = new URL(miniAppUrl);
    return (
      url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1"
    );
  } catch {
    return false;
  }
})();

const bot = botToken ? new Telegraf(botToken) : null;

app.use(cors());
app.use(express.json());
app.use(express.static(distDir));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    botConfigured: Boolean(botToken),
    paymentConfigured: Boolean(paymentProviderToken),
    miniAppUrl
  });
});

app.post("/api/create-invoice-link", async (req, res) => {
  const { planId } = req.body ?? {};
  const plan = plans[planId];

  if (!plan) {
    return res.status(400).json({ error: "Неизвестный тариф." });
  }

  if (!bot) {
    return res.status(500).json({
      error: "BOT_TOKEN не настроен на сервере."
    });
  }

  if (!paymentProviderToken) {
    return res.status(500).json({
      error:
        "Для реальной оплаты нужен PAYMENT_PROVIDER_TOKEN от платёжного провайдера Telegram."
    });
  }

  try {
    const invoiceLink = await bot.telegram.createInvoiceLink({
      title: plan.title,
      description: `${plan.description}. Доступ на ${plan.durationDays} дней.`,
      payload: JSON.stringify({
        product: "stena_plus",
        planId: plan.id
      }),
      provider_token: paymentProviderToken,
      currency: "RUB",
      prices: [
        {
          label: plan.description,
          amount: plan.amount
        }
      ]
    });

    return res.json({ invoiceLink });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Ошибка создания инвойса."
    });
  }
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  return res.sendFile(distIndex);
});

if (bot) {
  const sendEntryMessage = (ctx) => {
    if (canOpenMiniApp) {
      return ctx.reply(
        "Откройте Mini App и выберите тариф Стена Плюс.",
        Markup.inlineKeyboard([
          Markup.button.webApp("Открыть Стена Плюс", miniAppUrl)
        ])
      );
    }

    return ctx.reply(
      [
        "Бот работает.",
        "Mini App пока не подключён к публичному HTTPS URL.",
        "После настройки адреса деплоя здесь появится кнопка покупки."
      ].join("\n")
    );
  };

  bot.start(sendEntryMessage);
  bot.command("buy", sendEntryMessage);
  bot.command("plans", (ctx) =>
    ctx.reply(
      ["Тарифы Стена Плюс:", "• 1 месяц — 99 ₽", "• 2 месяца — 179 ₽"].join(
        "\n"
      )
    )
  );

  bot.on("pre_checkout_query", (ctx) => ctx.answerPreCheckoutQuery(true));

  bot.on("successful_payment", (ctx) =>
    ctx.reply("Оплата прошла успешно. Подписка Стена Плюс активирована.")
  );

  bot.telegram
    .setMyCommands([
      { command: "start", description: "Запустить бота" },
      { command: "buy", description: "Открыть покупку" },
      { command: "plans", description: "Посмотреть тарифы" }
    ])
    .catch((error) => {
      console.error("Failed to set commands", error);
    });

  if (canOpenMiniApp) {
    bot.telegram
      .setChatMenuButton({
        menu_button: {
          type: "web_app",
          text: "Стена Плюс",
          web_app: { url: miniAppUrl }
        }
      })
      .catch((error) => {
        console.error("Failed to set chat menu button", error);
      });
  }

  bot.launch().then(() => {
    console.log("Telegram bot started");
    console.log(`Mini app public URL configured: ${canOpenMiniApp}`);
  });

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Mini app URL: ${miniAppUrl}`);
  console.log(`Public base URL: ${publicBaseUrl}`);
});
