import { useEffect, useMemo, useState } from "react";

const plans = [
  {
    id: "month_1",
    title: "1 месяц",
    price: "99 ₽",
    value: "Базовый доступ",
    description: "Полный доступ к Стена Плюс на 30 дней.",
    accent: false
  },
  {
    id: "month_2",
    title: "2 месяца",
    price: "179 ₽",
    value: "Выгоднее",
    description: "Лучший тариф для стабильного доступа на 60 дней.",
    accent: true
  }
];

const features = [
  "Премиум-доступ без лишних шагов",
  "Покупка прямо внутри Telegram",
  "Мгновенная активация после оплаты"
];

function App() {
  const [selectedPlan, setSelectedPlan] = useState("month_2");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const checkoutEnabled = Boolean(apiBaseUrl);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlan) ?? plans[1],
    [selectedPlan]
  );

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) return;

    webApp.ready();
    webApp.expand();

    if (typeof webApp.versionAtLeast === "function") {
      if (webApp.versionAtLeast("6.1")) {
        webApp.setHeaderColor("#ffffff");
      }

      if (webApp.versionAtLeast("6.9")) {
        webApp.setBackgroundColor("#ffffff");
      }
    }
  }, []);

  const handleCheckout = async () => {
    if (!checkoutEnabled) {
      setError(
        "Покупка ещё не подключена: нужен публичный backend и payment provider token."
      );
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const webApp = window.Telegram?.WebApp;
      const payload = {
        planId: activePlan.id,
        initData: webApp?.initData ?? ""
      };

      const response = await fetch(`${apiBaseUrl}/api/create-invoice-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Не удалось создать ссылку на оплату.");
      }

      if (webApp?.openInvoice && result.invoiceLink) {
        webApp.openInvoice(result.invoiceLink, (status) => {
          if (status === "paid") {
            setSuccess("Подписка оплачена. Доступ обновлён.");
            return;
          }

          if (status === "cancelled") {
            setError("Оплата была отменена.");
            return;
          }

          if (status === "failed") {
            setError("Платёж не прошёл. Попробуйте ещё раз.");
          }
        });
      } else if (result.invoiceLink) {
        window.location.href = result.invoiceLink;
      }
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="wall-glow wall-glow-left" />
      <div className="wall-glow wall-glow-right" />

      <main className="screen">
        <section className="hero">
          <div className="brand-row">
            <span className="brand-mark" />
            <span className="brand-name">Стена Плюс</span>
          </div>

          <div className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">Подписка внутри Telegram</p>
              <h1>Белый, чистый и быстрый доступ к Стена Плюс.</h1>
              <p className="hero-description">
                Оформите подписку в пару касаний и получите доступ сразу после
                успешной оплаты.
              </p>
            </div>

            <div className="wall-preview" aria-hidden="true">
              <div className="wall-plane wall-plane-front" />
              <div className="wall-plane wall-plane-side" />
              <div className="wall-shadow" />
            </div>
          </div>
        </section>

        <section className="plans-section">
          <div className="section-heading">
            <h2>Выберите тариф</h2>
            <p>Два простых плана без перегруза интерфейса.</p>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => {
              const selected = plan.id === activePlan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  className={[
                    "plan-card",
                    selected ? "plan-card-selected" : "",
                    plan.accent ? "plan-card-accent" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="plan-topline">
                    <span className="plan-title">{plan.title}</span>
                    {plan.accent ? (
                      <span className="plan-badge">Лучший выбор</span>
                    ) : null}
                  </div>

                  <div className="plan-price">{plan.price}</div>
                  <div className="plan-value">{plan.value}</div>
                  <p className="plan-description">{plan.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="feature-panel">
          <div className="section-heading">
            <h2>Что внутри</h2>
          </div>

          <ul className="feature-list">
            {features.map((item) => (
              <li key={item} className="feature-item">
                <span className="feature-icon">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="checkout-panel">
          <div>
            <p className="checkout-caption">Сейчас выбран тариф</p>
            <div className="checkout-plan">
              <span>{activePlan.title}</span>
              <strong>{activePlan.price}</strong>
            </div>
          </div>

          <button
            type="button"
            className="cta-button"
            onClick={handleCheckout}
            disabled={isLoading || !checkoutEnabled}
          >
            {isLoading
              ? "Создаём оплату..."
              : checkoutEnabled
                ? "Оформить подписку"
                : "Покупка скоро будет доступна"}
          </button>

          {error ? <p className="message message-error">{error}</p> : null}
          {success ? <p className="message message-success">{success}</p> : null}
        </section>
      </main>
    </div>
  );
}

export default App;
