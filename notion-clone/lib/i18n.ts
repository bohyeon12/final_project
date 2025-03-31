// lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/../../public/locales/en/translation.json";
import ko from "@/../../public/locales/ko/translation.json";
import ja from "@/../../public/locales/ja/translation.json";
import zh from "@/../../public/locales/zh/translation.json";

let isInitialized = false;

if (!isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      // resources에 import한 JSON들 매핑
      resources: {
        en: { translation: en },
        ko: { translation: ko },
        ja: { translation: ja },
        zh: { translation: zh },
      },
      fallbackLng: "ko",
      debug: process.env.NODE_ENV === "development",
      interpolation: { escapeValue: false },
    });

  isInitialized = true;
}

export default i18n;
