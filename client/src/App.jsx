import { useEffect, useMemo, useState } from "react";

const plans = [
  {
    id: "month_1",
    title: "1 месяц",
    periodLabel: "в месяц",
    priceRub: 99,
    totalLabel: "99 ₽",
    subtitle: "Стена Плюс",
    description: "Для быстрого старта и знакомства со всеми возможностями.",
    highlight: null
  },
  {
    id: "month_2",
    title: "2 месяца",
    periodLabel: "89,5 ₽ / месяц",
    priceRub: 179,
    totalLabel: "179 ₽",
    subtitle: "Стена Плюс",
    description: "Более выгодный тариф для стабильного доступа без пауз.",
    highlight: "Выгода 10%"
  }
];

const paymentMethods = [
  { id: "gpay", label: "G Pay" },
  { id: "apple", label: " Pay" },
  { id: "mir", label: "МИР" },
  { id: "card", label: "•••• 1234" }
];

const features = [
  {
    id: "storage",
    title: "Безлимитные сохранения",
    text: "Сохраняйте столько, сколько нужно, без ограничения по материалам."
  },
  {
    id: "settings",
    title: "Расширенные настройки",
    text: "Гибкая персонализация и дополнительные продуктовые параметры."
  },
  {
    id: "early",
    title: "Эксклюзивные функции",
    text: "Доступ к новым возможностям раньше остальных пользователей."
  }
];

const heroPoints = [
  "Больше возможностей",
  "Приоритетная поддержка",
  "Эксклюзивные функции"
];

function Icon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  switch (name) {
    case "rocket":
      return (
        <svg {...common}>
          <path d="M5 19c3-1 5-3 6-6" />
          <path d="M15 4c2.5 0 5 2.5 5 5-2.2 2.2-5.2 4.8-8 6l-3-3c1.2-2.8 3.8-5.8 6-8Z" />
          <path d="M9 15H5v4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-2.7 7.6-7 10-4.3-2.4-7-5.5-7-10V6l7-3Z" />
          <path d="m9.5 12 1.7 1.7 3.8-3.8" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
        </svg>
      );
    case "sliders":
      return (
        <svg {...common}>
          <path d="M4 6h6" />
          <path d="M14 6h6" />
          <path d="M10 4v4" />
          <path d="M4 18h10" />
          <path d="M18 16v4" />
          <path d="M4 12h2" />
          <path d="M10 12h10" />
          <path d="M8 10v4" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
          <path d="m19 15 .7 2 .3.8.8.3 2 .7-2 .7-.8.3-.3.8-.7 2-.7-2-.3-.8-.8-.3-2-.7 2-.7.8-.3.3-.8.7-2Z" />
        </svg>
      );
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
  const [selectedPlanId, setSelectedPlanId] = useState("month_1");
  const [selectedMethod, setSelectedMethod] = useState("apple");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [paymentState, setPaymentState] = useState("idle");
  const [processing, setProcessing] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0],
    [selectedPlanId]
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
        webApp.setBackgroundColor("#f6f3ee");
      }
    }
  }, []);

  useEffect(() => {
    setPaymentState("idle");
  }, [selectedPlanId]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow || "";
    }

    return () => {
      document.body.style.overflow = previousOverflow || "";
    };
  }, [sheetOpen]);

  const openSheet = () => {
    setSheetOpen(true);
    setPaymentState("idle");
  };

  const closeSheet = () => {
    if (processing) return;
    setSheetOpen(false);
    setPaymentState("idle");
  };

  const handleMockPay = () => {
    setProcessing(true);
    setPaymentState("processing");

    window.setTimeout(() => {
      setProcessing(false);
      setPaymentState("success");
    }, 1800);
  };

  return (
    <div className="app">
      <div className="app__ambient app__ambient--left" />
      <div className="app__ambient app__ambient--right" />

      <main className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand__mark">C</div>
            <div className="brand__title">Стена Плюс</div>
          </div>

          <div className="topbar__meta">
            <div className="pill">Premium</div>
            <div className="avatar">M</div>
          </div>
        </header>

        <section className="hero-card card">
          <div className="hero-copy">
            <h1>Больше, чем просто стена</h1>
            <p>
              Откройте все возможности Стена Плюс и получите максимум от вашего
              опыта внутри Mini App.
            </p>

            <div className="hero-points">
              <div className="hero-point">
                <Icon name="rocket" />
                <span>{heroPoints[0]}</span>
              </div>
              <div className="hero-point">
                <Icon name="shield" />
                <span>{heroPoints[1]}</span>
              </div>
              <div className="hero-point">
                <Icon name="bolt" />
                <span>{heroPoints[2]}</span>
              </div>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-art__block hero-art__block--front">C</div>
            <div className="hero-art__block hero-art__block--back" />
            <div className="hero-art__leaf hero-art__leaf--one" />
            <div className="hero-art__leaf hero-art__leaf--two" />
          </div>
        </section>

        <section className="section">
          <div className="section__header">
            <h2>Выберите подписку</h2>
          </div>

          <div className="plan-list">
            {plans.map((plan) => {
              const active = selectedPlanId === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  className={`plan-card ${active ? "plan-card--active" : ""}`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="plan-card__left">
                    <div className="plan-card__title">{plan.title}</div>
                    <div className="plan-card__subtitle">{plan.subtitle}</div>
                    {plan.highlight ? (
                      <div className="plan-card__badge">{plan.highlight}</div>
                    ) : null}
                  </div>

                  <div className="plan-card__right">
                    <div className="plan-card__price">{plan.totalLabel}</div>
                    <div className="plan-card__period">{plan.periodLabel}</div>
                    <div
                      className={`plan-card__radio ${
                        active ? "plan-card__radio--active" : ""
                      }`}
                    >
                      {active ? <Icon name="check" /> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="section benefits">
          <div className="section__header section__header--split">
            <h2>Что вы получаете</h2>
            <button type="button" className="text-button">
              Все преимущества
            </button>
          </div>

          <div className="benefits__list">
            {features.map((feature, index) => {
              const icons = ["folder", "sliders", "sparkles"];

              return (
                <div key={feature.id} className="benefit-row">
                  <div className="benefit-row__icon">
                    <Icon name={icons[index]} />
                  </div>
                  <div className="benefit-row__copy">
                    <div className="benefit-row__title">{feature.title}</div>
                    <div className="benefit-row__text">{feature.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="trust-card card">
          <div className="trust-card__icon">
            <Icon name="shield" />
          </div>
          <div>
            <div className="trust-card__title">Безопасная оплата</div>
            <div className="trust-card__text">
              Это тестовый сценарий оплаты внутри Mini App. Флоу полностью
              интерактивный и остаётся в приложении.
            </div>
          </div>
        </section>

        <section className="sticky-order card">
          <div className="sticky-order__meta">
            <div className="sticky-order__label">Сейчас выбрано</div>
            <div className="sticky-order__plan">{selectedPlan.title}</div>
          </div>

          <div className="sticky-order__price">{selectedPlan.totalLabel}</div>

          <button type="button" className="primary-button" onClick={openSheet}>
            Оформить подписку
          </button>
        </section>
      </main>

      <div className={`sheet-backdrop ${sheetOpen ? "sheet-backdrop--open" : ""}`}>
        <section className={`sheet ${sheetOpen ? "sheet--open" : ""}`}>
          <div className="sheet__grabber" />

          <div className="sheet__header">
            <h3>Оформление заказа</h3>
            <button type="button" className="icon-button" onClick={closeSheet}>
              <Icon name="close" />
            </button>
          </div>

          <div className="sheet-card">
            <div className="sheet-card__title">Способ оплаты</div>
            <div className="method-grid">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`method-chip ${
                    selectedMethod === method.id ? "method-chip--active" : ""
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  {method.label}
                </button>
              ))}
            </div>

            <div className="summary">
              <div className="summary__row">
                <span>Подписка</span>
                <span>Стена Плюс — {selectedPlan.title}</span>
              </div>
              <div className="summary__row">
                <span>Сумма</span>
                <span>{selectedPlan.totalLabel}</span>
              </div>
              <div className="summary__row summary__row--total">
                <span>К оплате</span>
                <strong>{selectedPlan.totalLabel}</strong>
              </div>
            </div>

            <button
              type="button"
              className="payment-button"
              onClick={handleMockPay}
              disabled={processing || paymentState === "success"}
            >
              <Icon name="lock" />
              <span>
                {processing
                  ? "Обрабатываем оплату..."
                  : paymentState === "success"
                    ? "Оплата подтверждена"
                    : `Оплатить ${selectedPlan.totalLabel}`}
              </span>
            </button>
          </div>

          {paymentState === "success" ? (
            <div className="success-card">
              <div className="success-card__icon">
                <Icon name="check" />
              </div>
              <div>
                <div className="success-card__title">
                  Оплата успешно завершена
                </div>
                <div className="success-card__text">
                  Спасибо. Подписка активирована в тестовом режиме, сценарий
                  Mini App отработал полностью.
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default App;
