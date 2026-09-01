import { useLang } from "@/components/controls/LangSwitch";

export type Localized<T> = { en: T; vi: T };

export function useLocalized<T>(dict: Localized<T>): T {
  const lang = useLang();
  return dict[lang];
}
