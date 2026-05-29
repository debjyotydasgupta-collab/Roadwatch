import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getLang, setLang, type Lang } from "@/lib/i18n";

const LABELS: Record<Lang, string> = {
  en: "English",
  hi: "हिन्दी",
  es: "Español",
};

interface LanguageSelectorProps {
  onChange?: () => void;
}

export function LanguageSelector({ onChange }: LanguageSelectorProps) {
  const current = typeof window !== "undefined" ? getLang() : "en";

  const pick = (lang: Lang) => {
    setLang(lang);
    onChange?.();
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline text-xs">{LABELS[current]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(LABELS) as Lang[]).map((lang) => (
          <DropdownMenuItem key={lang} onClick={() => pick(lang)}>
            {LABELS[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
