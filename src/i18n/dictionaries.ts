import zhMessages from "./messages/zh.json";
import enMessages from "./messages/en.json";

export type Locale = "zh" | "en";

export const LOCALES: Locale[] = ["zh", "en"];
export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_COOKIE = "knloop_locale";

// zh.json is the source of truth; en.json must mirror its key structure.
export type Messages = typeof zhMessages;
export type UiMessages = Messages["ui"];
export type MessageKey = keyof UiMessages;
export type HomeMessages = Messages["home"];

export const messages: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages as Messages,
};

export function translate(locale: Locale, key: MessageKey): string {
  return (messages[locale].ui as UiMessages)[key] ?? messages.zh.ui[key];
}

/** 首页文案整块（hero / pillars / features / direction / cta / footer），按当前语言取。 */
export function homeMessages(locale: Locale): HomeMessages {
  return messages[locale].home;
}
