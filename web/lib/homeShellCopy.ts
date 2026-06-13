import type { SeoLang } from "@/lib/site";

export const HOME_SHELL_COPY: Record<
  SeoLang,
  {
    nav: {
      buy: string;
      rent: string;
      login: string;
      getStarted: string;
      themeLight: string;
      themeDark: string;
      menu: string;
    };
    drawer: {
      buyCars: string;
      rentCar: string;
      login: string;
      logout: string;
      getStarted: string;
    };
    footer: {
      tag: string;
      platform: string;
      buyCars: string;
      rentCars: string;
      signIn: string;
      account: string;
      register: string;
      login: string;
      legal: string;
      terms: string;
      privacy: string;
      copy: string;
      built: string;
      sellCar: string;
    };
  }
> = {
  fr: {
    nav: {
      buy: "Acheter",
      rent: "Louer",
      login: "Connexion",
      getStarted: "Commencer",
      themeLight: "Passer au thème clair",
      themeDark: "Passer au thème sombre",
      menu: "Menu",
    },
    drawer: {
      buyCars: "Acheter une voiture",
      rentCar: "Louer une voiture",
      login: "Connexion",
      logout: "Déconnexion",
      getStarted: "Commencer",
    },
    footer: {
      tag: "La marketplace premium au Maroc pour acheter, vendre et louer des voitures en toute confiance et transparence.",
      platform: "Plateforme",
      buyCars: "Acheter",
      rentCars: "Louer",
      signIn: "Connexion",
      account: "Compte",
      register: "Inscription",
      login: "Connexion",
      legal: "Mentions",
      terms: "Conditions d'utilisation",
      privacy: "Politique de confidentialité",
      copy: "Marketplace automobile d'élite au Maroc",
      built: "Fait avec soin ♥",
      sellCar: "Vendre ma voiture",
    },
  },
  en: {
    nav: {
      buy: "Buy",
      rent: "Rent",
      login: "Sign In",
      getStarted: "Get Started",
      themeLight: "Switch to light theme",
      themeDark: "Switch to dark theme",
      menu: "Menu",
    },
    drawer: {
      buyCars: "Buy Cars",
      rentCar: "Rent a Car",
      login: "Sign In",
      logout: "Sign Out",
      getStarted: "Get Started",
    },
    footer: {
      tag: "Morocco's premium marketplace for buying, selling, and renting cars with confidence and full transparency.",
      platform: "Platform",
      buyCars: "Buy Cars",
      rentCars: "Rent Cars",
      signIn: "Sign In",
      account: "Account",
      register: "Register",
      login: "Login",
      legal: "Legal",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      copy: "Morocco's Elite Car Marketplace",
      built: "Built with care ♥",
      sellCar: "Sell my car",
    },
  },
  ar: {
    nav: {
      buy: "شراء",
      rent: "تأجير",
      login: "تسجيل الدخول",
      getStarted: "ابدأ الآن",
      themeLight: "التبديل إلى الوضع الفاتح",
      themeDark: "التبديل إلى الوضع الداكن",
      menu: "القائمة",
    },
    drawer: {
      buyCars: "شراء سيارة",
      rentCar: "تأجير سيارة",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      getStarted: "ابدأ الآن",
    },
    footer: {
      tag: "سوق السيارات المميز في المغرب لشراء وبيع وتأجير السيارات بثقة وشفافية كاملة.",
      platform: "المنصة",
      buyCars: "شراء سيارات",
      rentCars: "تأجير سيارات",
      signIn: "تسجيل الدخول",
      account: "الحساب",
      register: "التسجيل",
      login: "الدخول",
      legal: "قانوني",
      terms: "شروط الاستخدام",
      privacy: "سياسة الخصوصية",
      copy: "سوق السيارات الراقي في المغرب",
      built: "صُنع بعناية ♥",
      sellCar: "بيع سيارتي",
    },
  },
};
