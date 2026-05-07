import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import consolidated translations
import { translations } from '../constants/translations';

const resources = {
  de: { translation: translations.de },
  en: { translation: translations.en },
  tr: { translation: translations.tr },
  it: { translation: translations.it },
  fr: { translation: translations.fr },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0].languageCode ?? 'de',
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
