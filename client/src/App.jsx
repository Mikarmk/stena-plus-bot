import { useEffect, useMemo, useState } from "react";

const plans = [
  {
    id: "month_1",
    title: "1 месяц",
    description: "Полный доступ к Стена Плюс на 30 дней.",
    price: "99 ₽",
    period: "в месяц",
    badge: null
  },
  {
    id: "month_2",
    title: "2 месяца",
    description: "Лучший тариф для стабильного доступа на 60 дней.",
    price: "179 ₽",
    period: "89,5 ₽ / месяц",
    badge: "Выгоднее на 10%"
  }
];

const paymentMethods = [
  { id: "apple", label: " Pay" },
  { id: "gpay", label: "G Pay" },
  { id: "mir", label: "МИР" },
  { id: "card", label: "•••• 1234" }
];

function Icon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  switch (name) {
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4.2 4.2L19 6.5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="2.5" />
          <path d="M8 11V8.5A4 4 0 0 1 12 4a4 4 0 0 1 4 4.5V11" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </svg>
      );
    default:
      return null;
  }
}

function App() {
  const [selectedPlanId, setSelectedPlanId] = useState("month_2");
  const [selectedMethod, setSelectedMethod] = useState("apple");
  const [paymentState, setPaymentState] = useState("idle");
  const [processing, setProcessing] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[1],
    [selectedPlanId]
  );

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) return;

    webApp.ready();
    webApp.expand();

    if (typeof webApp.versionAtLeast === "function") {
      if (webApp.versionAtLeast("6.1")) {
        webApp.setHeaderColor("#f7f4ee");
      }

      if (webApp.versionAtLeast("6.9")) {
        webApp.setBackgroundColor("#f7f4ee");
      }
    }
  }, []);

  useEffect(() => {
    setPaymentState("idle");
    setProcessing(false);
  }, [selectedPlanId, selectedMethod]);

  const handleMockPay = () => {
    setProcessing(true);
    setPaymentState("processing");

    window.setTimeout(() => {
      setProcessing(false);
      setPaymentState("success");
    }, 1600);
  };

  return (
    <div className="app">
      <div className="app__glow app__glow--left" />
      <div className="app__glow app__glow--right" />

      <main className="screen">
        <header className="topbar">
          <button type="button" className="circle-button" aria-label="Назад">
            <Icon name="close" />
          </button>

          <div className="brand-lockup">
            <div className="brand-lockup__title">Стена Плюс</div>
            <div className="brand-lockup__subtitle">mini app</div>
          </div>

          <button type="button" className="circle-button" aria-label="Меню">
            <span className="menu-dots">•••</span>
          </button>
        </header>

        <section className="stage">
          <div className="hero">
            <div className="hero__copy">
              <div className="brand-line">
                <span className="brand-line__dot" />
                <span>Стена Плюс</span>
              </div>

              <h1>Стена Плюс без ограничений</h1>
              <p>
                Два тарифа, быстрая активация и оплата внутри Telegram Mini App.
              </p>
            </div>

            <div className="hero__art" aria-hidden="true">
              <div className="hero__arch" />
              <div className="hero__cube hero__cube--back" />
              <div className="hero__cube hero__cube--front">C</div>
              <div className="hero__leaf hero__leaf--one" />
              <div className="hero__leaf hero__leaf--two" />
            </div>
          </div>

          <div className="purchase-card">
            <div className="section-title">Выберите подписку</div>

            <div className="plan-stack">
              {plans.map((plan) => {
                const active = plan.id === selectedPlanId;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={`plan ${active ? "plan--active" : ""}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <div className="plan__select">
                      <div className={`radio ${active ? "radio--active" : ""}`}>
                        {active ? <Icon name="check" /> : null}
                      </div>
                    </div>

                    <div className="plan__body">
                      <div className="plan__heading">
                        <span>{plan.title}</span>
                        {plan.badge ? (
                          <span className="plan__badge">{plan.badge}</span>
                        ) : null}
                      </div>
                    <div className="plan__description">{plan.description}</div>
                  </div>

                    <div className="plan__price">
                      <strong>{plan.price}</strong>
                      <span>{plan.period}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="payment-block">
              <div className="payment-block__label">Способ оплаты</div>

              <div className="method-row">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`method-pill ${
                      selectedMethod === method.id ? "method-pill--active" : ""
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="checkout-card">
              <div className="checkout-card__meta">
                <span>К оплате</span>
                <div className="checkout-card__amount">
                  <strong>{selectedPlan.price}</strong>
                  <span>{selectedPlan.period}</span>
                </div>
              </div>

              <button
                type="button"
                className="cta-button"
                onClick={handleMockPay}
                disabled={processing}
              >
                <Icon name="lock" />
                <span>
                  {processing
                    ? "Подтверждаем оплату..."
                    : paymentState === "success"
                      ? "Оплата подтверждена"
                      : "Оформить подписку"}
                </span>
              </button>

              <div className="trust-line">
                <Icon name="lock" />
                <span>Безопасная оплата через Telegram</span>
              </div>
            </div>
          </div>
        </section>

        <div
          className={`toast ${paymentState === "success" ? "toast--visible" : ""}`}
        >
          <div className="toast__icon">
            <Icon name="check" />
          </div>
          <div className="toast__copy">
            <div className="toast__title">Оплата успешно завершена</div>
            <div className="toast__text">Подписка активирована</div>
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => setPaymentState("idle")}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
