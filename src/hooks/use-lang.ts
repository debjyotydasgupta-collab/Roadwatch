import { useState, useEffect } from "react";
import { getLang, t, type DictKey, type Lang } from "@/lib/i18n";

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() =>
    typeof window !== "undefined" ? getLang() : "en",
  );

  useEffect(() => {
    setLangState(getLang());
  }, []);

  const translate = (key: DictKey) => t(key, lang);

  return { lang, t: translate };
}
