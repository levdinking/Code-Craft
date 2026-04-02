/* eslint-disable @typescript-eslint/no-explicit-any */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';
import deTranslations from './locales/de.json';

// Русские тексты для privacy и imprint (если их нет в ru.json)
const ruPrivacy = {
  seo: {
    title: "Политика конфиденциальности | Павел Левдин",
    description: "Информация о защите данных и обработке персональных данных."
  },
  title: "Политика конфиденциальности",
  section1: {
    title: "Оператор данных",
    text: "Оператором данных является Павел Левдин, Am Dobben 102A, 28211 Bremen, Германия. По вопросам защиты данных вы можете связаться с нами в любое время."
  },
  section2: {
    title: "Сбор данных",
    text: "Мы собираем только те данные, которые необходимы для предоставления наших услуг. Это включает технические данные (IP-адрес, тип браузера) и добровольные запросы."
  },
  section3: {
    title: "Безопасность данных",
    text: "Мы применяем технические и организационные меры для защиты ваших данных от потери, манипуляций и несанкционированного доступа. Все передачи данных осуществляются в зашифрованном виде."
  },
  section4: {
    title: "Cookies и отслеживание",
    text: "Наш сайт использует только необходимые cookies. Сторонние сервисы отслеживания не используются. Вы можете отключить cookies в настройках браузера."
  },
  contact: "Контакт по вопросам конфиденциальности",
  lastUpdated: "Последнее обновление"
};

const ruImprint = {
  seo: {
    title: "Контакты и реквизиты | Павел Левдин",
    description: "Юридическая информация и контакты."
  },
  title: "Контакты и реквизиты",
  owner: "Владелец сайта",
  ownerName: "Павел Левдин",
  address: "Адрес",
  addressLine1: "Am Dobben 102A",
  addressLine2: "28211 Bremen",
  country: "Германия",
  email: "Email",
  emailValue: "levdin.pavel@yandex.ru",
  lastUpdated: "Последнее обновление"
};

const ruWithPrivacy = {
  ...ruTranslations,
  privacy: (ruTranslations as any).privacy || ruPrivacy,
  imprint: (ruTranslations as any).imprint || ruImprint
};

const resources = {
  en: { translation: enTranslations },
  ru: { translation: ruWithPrivacy },
  de: { translation: deTranslations },
} as any;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];