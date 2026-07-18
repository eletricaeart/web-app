// providers/LanguageProvider.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'pt' | 'en';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  pt: {
    'home.hero.title': 'Transformando Projetos em Realidade',
    'home.hero.subtitle':
      'Excelência em Elétrica, Pintura e Drywall para sua casa ou empresa.',
    'home.hero.cta': 'Solicitar Orçamento',
    'home.about.title': 'Sobre Rafael',
    'home.about.description':
      'Especialista com anos de experiência entregando os melhores serviços de Elétrica e Arte (Pintura e Drywall). Nosso compromisso é com a qualidade e segurança da sua obra.',
    'home.services.title': 'Nossos Serviços',
    'home.services.electric': 'Elétrica',
    'home.services.electric.desc':
      'Instalações, manutenções, quadros de força e iluminação.',
    'home.services.painting': 'Pintura',
    'home.services.painting.desc':
      'Pintura residencial e comercial, texturas e acabamentos finos.',
    'home.services.drywall': 'Drywall',
    'home.services.drywall.desc':
      'Divisórias, forros, nichos e projetos de gesso estruturado.',
    'home.login': 'Entrar',
    'theme.toggle': 'Alternar Tema',
    'lang.toggle': 'EN',
  },
  en: {
    'home.hero.title': 'Transforming Projects into Reality',
    'home.hero.subtitle':
      'Excellence in Electrical, Painting and Drywall for your home or business.',
    'home.hero.cta': 'Request a Quote',
    'home.about.title': 'About Rafael',
    'home.about.description':
      'Expert with years of experience delivering the best Electrical and Art (Painting & Drywall) services. Our commitment is with quality and safety.',
    'home.services.title': 'Our Services',
    'home.services.electric': 'Electrical',
    'home.services.electric.desc':
      'Installations, maintenance, breaker boxes, and lighting.',
    'home.services.painting': 'Painting',
    'home.services.painting.desc':
      'Residential and commercial painting, textures, and fine finishes.',
    'home.services.drywall': 'Drywall',
    'home.services.drywall.desc':
      'Partitions, ceilings, niches, and structured plaster projects.',
    'home.login': 'Login',
    'theme.toggle': 'Toggle Theme',
    'lang.toggle': 'PT',
  },
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const initialState: LanguageProviderState = {
  language: 'pt',
  setLanguage: () => null,
  t: () => '',
};

const LanguageProviderContext =
  createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = 'pt',
  storageKey = 'vite-ui-language',
}: {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage,
  );

  const setLanguage = (lang: Language) => {
    localStorage.setItem(storageKey, lang);
    setLanguageState(lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageProviderContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);
  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
