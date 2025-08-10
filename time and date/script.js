(function () {
  const timeElement = document.getElementById("time");
  const dateElement = document.getElementById("date");
  const titleElement = document.getElementById("title");
  const formatToggleButton = document.getElementById("formatToggle");
  const themeToggleButton = document.getElementById("themeToggle");
  const languageToggleButton = document.getElementById("langToggle");
  const copyButton = document.getElementById("copyBtn");
  const timezoneSelect = document.getElementById("tzSelect");
  const secondsBar = document.getElementById("secBar");

  const DEFAULT_TIMEZONE = "Asia/Dhaka";
  const STORAGE_KEYS = {
    theme: "pref-theme",
    hour12: "pref-hour12",
    lang: "pref-lang",
    tz: "pref-timezone",
  };

  // State
  let isHour12 = readBool(STORAGE_KEYS.hour12, false);
  let currentLang = localStorage.getItem(STORAGE_KEYS.lang) || "bn";
  let currentTimezone =
    localStorage.getItem(STORAGE_KEYS.tz) || DEFAULT_TIMEZONE;

  // Apply theme from prefers-color-scheme or storage
  const initialTheme =
    localStorage.getItem(STORAGE_KEYS.theme) ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(initialTheme);

  // Populate timezone list (top common + all from Intl)
  buildTimezoneOptions();

  // Attach events
  formatToggleButton.addEventListener("click", () => {
    isHour12 = !isHour12;
    localStorage.setItem(STORAGE_KEYS.hour12, String(isHour12));
    updateUiTexts();
    tick();
  });

  themeToggleButton.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    setTheme(next);
  });

  languageToggleButton.addEventListener("click", () => {
    currentLang = currentLang === "bn" ? "en" : "bn";
    localStorage.setItem(STORAGE_KEYS.lang, currentLang);
    updateUiTexts();
    tick();
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        timeElement.textContent + " — " + dateElement.textContent
      );
      const old = copyButton.textContent;
      copyButton.textContent = currentLang === "bn" ? "কপি হয়েছে" : "Copied!";
      setTimeout(() => (copyButton.textContent = old), 1200);
    } catch {
      alert(currentLang === "bn" ? "কপি করা যায়নি" : "Copy failed");
    }
  });

  timezoneSelect.addEventListener("change", () => {
    currentTimezone = timezoneSelect.value || DEFAULT_TIMEZONE;
    localStorage.setItem(STORAGE_KEYS.tz, currentTimezone);
    updateUiTexts();
    tick();
  });

  // Init UI language/labels
  updateUiTexts();

  // Start clock
  tick();
  setInterval(tick, 1000);

  function tick() {
    const now = new Date();
    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: isHour12,
      timeZone: currentTimezone,
    };
    const dateOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: currentTimezone,
    };

    const locale = currentLang === "bn" ? "bn-BD" : undefined; // use browser default for en
    const timeStr = new Intl.DateTimeFormat(locale, timeOptions).format(now);
    const dateStr = new Intl.DateTimeFormat(locale, dateOptions).format(now);

    timeElement.textContent = timeStr;
    dateElement.textContent = dateStr;

    const seconds = Number(
      new Intl.DateTimeFormat("en-US", {
        second: "2-digit",
        timeZone: currentTimezone,
      }).format(now)
    );
    const width = ((seconds % 60) / 59) * 100; // fill across the minute
    secondsBar.style.width = width + "%";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    themeToggleButton.setAttribute(
      "aria-pressed",
      theme === "dark" ? "true" : "false"
    );
    themeToggleButton.textContent =
      theme === "dark"
        ? currentLang === "bn"
          ? "লাইট মোড"
          : "Light mode"
        : currentLang === "bn"
        ? "ডার্ক মোড"
        : "Dark mode";
  }

  function readBool(key, fallback) {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "true";
  }

  function buildTimezoneOptions() {
    const preferred = [
      "Asia/Dhaka",
      "Asia/Kolkata",
      "Asia/Riyadh",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Europe/London",
      "Europe/Berlin",
      "America/New_York",
      "America/Chicago",
      "America/Los_Angeles",
      "Australia/Sydney",
    ];

    const tzSet = new Set(preferred);
    try {
      const all = Intl.supportedValuesOf
        ? Intl.supportedValuesOf("timeZone")
        : preferred;
      for (const z of all) {
        tzSet.add(z);
      }
    } catch {
      // Fallback if supportedValuesOf not available
    }

    const list = Array.from(tzSet).sort((a, b) => a.localeCompare(b));
    timezoneSelect.innerHTML = "";
    for (const zone of list) {
      const opt = document.createElement("option");
      opt.value = zone;
      opt.textContent = zone;
      if (zone === currentTimezone) opt.selected = true;
      timezoneSelect.appendChild(opt);
    }
  }

  function updateUiTexts() {
    const isBn = currentLang === "bn";
    document.documentElement.lang = isBn ? "bn" : "en";
    titleElement.textContent = isBn
      ? "বাংলাদেশ (Asia/Dhaka) লাইভ সময়"
      : "Bangladesh (Asia/Dhaka) Live Time";
    document.title = isBn ? "লাইভ সময় – Asia/Dhaka" : "Live Time – Asia/Dhaka";

    const tzLabel = document.getElementById("tzLabel");
    tzLabel.textContent = isBn ? "টাইম জোন" : "Time zone";

    formatToggleButton.textContent = isBn
      ? isHour12
        ? "২৪-ঘণ্টা দেখাও"
        : "১২-ঘণ্টা দেখাও"
      : isHour12
      ? "Switch to 24-hour"
      : "Switch to 12-hour";
    languageToggleButton.textContent = isBn ? "English" : "বাংলা";
    themeToggleButton.textContent =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? isBn
          ? "লাইট মোড"
          : "Light mode"
        : isBn
        ? "ডার্ক মোড"
        : "Dark mode";
    copyButton.textContent = isBn ? "কপি" : "Copy";
  }
})();
