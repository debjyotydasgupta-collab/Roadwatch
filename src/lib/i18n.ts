// Tiny i18n dictionary for the demo. Real apps should use react-intl/i18next.
export type Lang = "en" | "hi" | "es";

const dict = {
  en: {
    appName: "RoadWatch",
    tagline: "Report road issues. Track spending. Hold authorities accountable.",
    reportIssue: "Report Issue",
    viewMap: "View Map",
    publicSpending: "Public Spending",
    chatbot: "Ask RoadWatch AI",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    admin: "Authority",
    timeline: "Timeline",
    submit: "Submit",
    cancel: "Cancel",
  },
  hi: {
    appName: "रोडवॉच",
    tagline: "सड़क समस्याएँ रिपोर्ट करें। खर्च देखें।",
    reportIssue: "समस्या रिपोर्ट करें",
    viewMap: "मानचित्र देखें",
    publicSpending: "सार्वजनिक खर्च",
    chatbot: "रोडवॉच AI से पूछें",
    login: "लॉगिन",
    signup: "साइन अप",
    logout: "लॉग आउट",
    admin: "अधिकारी",
    timeline: "टाइमलाइन",
    submit: "जमा करें",
    cancel: "रद्द करें",
  },
  es: {
    appName: "RoadWatch",
    tagline: "Reporta problemas viales. Sigue el gasto público.",
    reportIssue: "Reportar problema",
    viewMap: "Ver mapa",
    publicSpending: "Gasto público",
    chatbot: "Pregunta a RoadWatch AI",
    login: "Iniciar sesión",
    signup: "Registrarse",
    logout: "Cerrar sesión",
    admin: "Autoridad",
    timeline: "Cronología",
    submit: "Enviar",
    cancel: "Cancelar",
  },
} as const;

export type DictKey = keyof typeof dict["en"];

let currentLang: Lang = "en";

export function setLang(l: Lang) {
  currentLang = l;
  if (typeof window !== "undefined") localStorage.setItem("rw_lang", l);
}

export function getLang(): Lang {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("rw_lang") as Lang | null;
    if (stored) currentLang = stored;
  }
  return currentLang;
}

export function t(key: DictKey, lang?: Lang): string {
  const l = lang ?? getLang();
  return dict[l][key] ?? dict.en[key];
}
