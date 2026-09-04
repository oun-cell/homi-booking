export const HOMI_WHATSAPP = "962770980084";

export const SERVICES = {
  laundry: "غسيل وكوي",
  cleaning: "تنظيف البيت",
  car: "تنظيف السيارة",
};

export const TIMES = {
  flexible: "أي وقت مناسب",
  morning: "الصبح",
  afternoon: "بعد الظهر",
  evening: "المسا",
};

const arabicDateFormatter = new Intl.DateTimeFormat("ar-JO", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Amman",
});

const fullDateFormatter = new Intl.DateTimeFormat("ar-JO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Asia/Amman",
});

export function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDayOptions(now = new Date()) {
  return [
    { key: "tomorrow", label: "بكرا", value: fullDateFormatter.format(addDays(now, 1)) },
    { key: "after-tomorrow", label: arabicDateFormatter.format(addDays(now, 2)), value: fullDateFormatter.format(addDays(now, 2)) },
    { key: "custom", label: "تاريخ ثاني", value: "" },
  ];
}

export function buildBookingMessage({ service, day, time }) {
  if (!SERVICES[service]) throw new Error("A valid service is required");
  const chosenDay = day || "أقرب موعد متاح";
  const chosenTime = TIMES[time] || TIMES.flexible;
  return [
    "مرحبا هومي 👋",
    "بدي أحجز:",
    `• الخدمة: ${SERVICES[service]}`,
    `• اليوم المفضّل: ${chosenDay}`,
    `• الوقت المفضّل: ${chosenTime}`,
    "",
    "ببعتلكم اللوكيشن هون.",
    "ممكن تأكدولي الموعد والسعر؟",
  ].join("\n");
}

export function buildWhatsAppUrl(booking) {
  const message = buildBookingMessage(booking);
  return `https://wa.me/${HOMI_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function init() {
  const form = document.querySelector("#booking-form");
  if (!form) return;

  const state = {
    service: null,
    dayKey: "soonest",
    day: "أقرب موعد متاح",
    time: "flexible",
  };

  const serviceCards = [...document.querySelectorAll("[data-service]")];
  const dayOptions = document.querySelector("#day-options");
  const timeOptions = document.querySelector("#time-options");
  const customDateWrap = document.querySelector("#custom-date-wrap");
  const customDate = document.querySelector("#custom-date");
  const serviceError = document.querySelector("#service-error");
  const serviceSection = document.querySelector(".service-section");
  const summary = document.querySelector("#summary-text");
  const overlay = document.querySelector("#handoff-overlay");

  const today = new Date();
  customDate.min = toISODate(today);
  customDate.max = toISODate(addDays(today, 30));

  for (const option of createDayOptions(today)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-chip";
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", "false");
    button.dataset.day = option.key;
    button.dataset.value = option.value;
    button.textContent = option.label;
    dayOptions.append(button);
  }

  function chooseOne(container, button) {
    container.querySelectorAll('[role="radio"]').forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-checked", String(selected));
    });
  }

  function updateSummary() {
    if (!state.service) {
      summary.textContent = "اختار الخدمة وخلص";
      return;
    }
    const dayShort = state.dayKey === "soonest" ? "أقرب موعد" : state.day;
    const timeShort = TIMES[state.time];
    summary.textContent = `${SERVICES[state.service]} · ${dayShort} · ${timeShort}`;
  }

  serviceCards.forEach((button) => {
    button.addEventListener("click", () => {
      state.service = button.dataset.service;
      chooseOne(document.querySelector("#service-grid"), button);
      serviceError.hidden = true;
      serviceSection.classList.remove("has-error");
      updateSummary();
    });
  });

  dayOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-day]");
    if (!button) return;
    chooseOne(dayOptions, button);
    state.dayKey = button.dataset.day;
    customDateWrap.hidden = state.dayKey !== "custom";
    if (state.dayKey === "soonest") state.day = "أقرب موعد متاح";
    else if (state.dayKey !== "custom") state.day = button.dataset.value;
    else if (!customDate.value) customDate.showPicker?.();
    updateSummary();
  });

  customDate.addEventListener("change", () => {
    if (!customDate.value) return;
    const selected = new Date(`${customDate.value}T12:00:00`);
    state.day = fullDateFormatter.format(selected);
    updateSummary();
  });

  timeOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-time]");
    if (!button) return;
    chooseOne(timeOptions, button);
    state.time = button.dataset.time;
    updateSummary();
  });

  const requestedService = new URLSearchParams(window.location.search).get("service");
  if (SERVICES[requestedService]) {
    document.querySelector(`[data-service="${requestedService}"]`)?.click();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.service) {
      serviceError.hidden = false;
      serviceSection.classList.remove("has-error");
      void serviceSection.offsetWidth;
      serviceSection.classList.add("has-error");
      serviceCards[0].focus();
      return;
    }
    if (state.dayKey === "custom" && !customDate.value) {
      customDate.focus();
      customDate.showPicker?.();
      return;
    }

    const url = buildWhatsAppUrl(state);
    overlay.hidden = false;
    setTimeout(() => {
      window.location.assign(url);
      setTimeout(() => { overlay.hidden = true; }, 1200);
    }, 250);
  });

  updateSummary();
}

if (typeof document !== "undefined") init();
