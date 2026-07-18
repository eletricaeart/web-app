// components/public/home/PublicHomeClient.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lightning,
  PaintRoller,
  Wall,
  MapPin,
  WhatsappLogo,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import { useLanguage } from '@/providers/LanguageProvider';
import './publicHome.css';

const WHATSAPP_NUMBER = '5513997685853';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * Revela uma seção com fade/slide quando ela entra na viewport.
 * Respeita prefers-reduced-motion (fica sempre visível, sem animação).
 */
function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`eahome-reveal ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

const SERVICES = [
  {
    key: 'electric',
    icon: Lightning,
    accent: 'amber',
  },
  {
    key: 'painting',
    icon: PaintRoller,
    accent: 'clay',
  },
  {
    key: 'drywall',
    icon: Wall,
    accent: 'slate',
  },
] as const;

const CITIES = ['Praia Grande', 'Santos', 'São Vicente'];

export default function PublicHomeClient() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="eahome">
      {/* --- TOPO / IDENTIDADE --- */}
      <header className="eahome-topbar">
        <div className="eahome-topbar-inner">
          <div className="eahome-brand">
            <Image
              src="/pix/ea/EA-logo.png"
              alt="Elétrica & Art"
              width={40}
              height={40}
              className="eahome-brand-logo"
              priority
            />
            <span className="eahome-brand-word">
              ELÉTRICA<span className="eahome-brand-amp">&</span>ART
            </span>
          </div>

          <div className="eahome-topbar-actions">
            <button
              type="button"
              className="eahome-lang-toggle"
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              aria-label={t('theme.toggle')}
            >
              {t('lang.toggle')}
            </button>
            <Link href="/login" className="eahome-login-link">
              {t('home.login')}
            </Link>
          </div>
        </div>
      </header>

      {/* --- HERO --- */}
      <section className="eahome-hero">
        <CircuitTrace />

        <div className="eahome-hero-inner">
          <div className="eahome-hero-copy">
            <span className="eahome-eyebrow">
              <Sparkle size={14} weight="fill" />
              PRAIA GRANDE · SANTOS · SÃO VICENTE
            </span>

            <h1 className="eahome-hero-title">{t('home.hero.title')}</h1>
            <p className="eahome-hero-subtitle">{t('home.hero.subtitle')}</p>

            <div className="eahome-hero-actions">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="eahome-btn eahome-btn-primary"
              >
                {t('home.hero.cta')}
                <ArrowRight size={18} weight="bold" />
              </a>
              <a href="#servicos" className="eahome-btn eahome-btn-ghost">
                Ver serviços
              </a>
            </div>
          </div>

          <div className="eahome-hero-portrait">
            <div className="eahome-portrait-glow" aria-hidden="true" />
            <div className="eahome-portrait-frame">
              <Image
                src="/pix/ea/EA-Rafael.png"
                alt="Rafael, especialista da Elétrica & Art"
                fill
                sizes="(max-width: 768px) 80vw, 420px"
                className="eahome-portrait-img"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- SOBRE O RAFAEL --- */}
      <Reveal>
        <section className="eahome-about">
          <div className="eahome-about-inner">
            <span className="eahome-eyebrow eahome-eyebrow-dark">QUEM FAZ</span>
            <h2 className="eahome-section-title">{t('home.about.title')}</h2>
            <p className="eahome-about-text">{t('home.about.description')}</p>
          </div>
        </section>
      </Reveal>

      {/* --- SERVIÇOS --- */}
      <section id="servicos" className="eahome-services">
        <Reveal className="eahome-services-header">
          <span className="eahome-eyebrow eahome-eyebrow-dark">
            O QUE FAZEMOS
          </span>
          <h2 className="eahome-section-title">{t('home.services.title')}</h2>
        </Reveal>

        <div className="eahome-services-grid">
          {SERVICES.map(({ key, icon: Icon, accent }, i) => (
            <Reveal key={key} className={`eahome-reveal-delay-${i}`}>
              <div className={`eahome-service-card eahome-accent-${accent}`}>
                <div className="eahome-service-icon">
                  <Icon size={28} weight="duotone" />
                </div>
                <h3 className="eahome-service-title">
                  {t(`home.services.${key}`)}
                </h3>
                <p className="eahome-service-desc">
                  {t(`home.services.${key}.desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- ÁREA DE ATUAÇÃO --- */}
      <Reveal>
        <section className="eahome-area">
          <div className="eahome-area-inner">
            <span className="eahome-eyebrow">
              <MapPin size={14} weight="fill" />
              ONDE ATENDEMOS
            </span>
            <h2 className="eahome-section-title eahome-section-title-light">
              Do litoral pra sua casa
            </h2>
            <div className="eahome-cities">
              {CITIES.map((city) => (
                <span key={city} className="eahome-city-chip">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* --- CTA FINAL --- */}
      <Reveal>
        <section className="eahome-final-cta">
          <h2 className="eahome-final-cta-title">
            Vamos colocar seu projeto de pé?
          </h2>
          <p className="eahome-final-cta-text">
            Fale direto com o Rafael e receba seu orçamento sem compromisso.
          </p>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="eahome-btn eahome-btn-primary eahome-btn-lg"
          >
            <WhatsappLogo size={22} weight="fill" />
            Chamar no WhatsApp
          </a>
        </section>
      </Reveal>

      {/* --- RODAPÉ --- */}
      <footer className="eahome-footer">
        <span>&copy; {new Date().getFullYear()} Elétrica & Art</span>
        <span>Praia Grande / SP</span>
      </footer>
    </div>
  );
}

/**
 * Motivo assinatura da página: traçado de circuito elétrico animado,
 * ecoando as faíscas da logo. Fica confinado ao fundo do hero.
 */
function CircuitTrace() {
  return (
    <svg
      className="eahome-circuit"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g className="eahome-circuit-group">
        <path
          className="eahome-circuit-path"
          d="M40 480 L180 480 L220 420 L220 300 L300 220"
        />
        <path
          className="eahome-circuit-path eahome-circuit-path-2"
          d="M760 120 L620 120 L580 180 L580 320 L480 400 L480 520"
        />
        <path
          className="eahome-circuit-path eahome-circuit-path-3"
          d="M700 500 L560 500 L520 460 L400 460"
        />
        <path
          className="eahome-circuit-path eahome-circuit-path-4"
          d="M60 80 L200 80 L240 120 L360 120"
        />
      </g>
      <g className="eahome-circuit-nodes">
        <circle cx="300" cy="220" r="4" />
        <circle cx="480" cy="520" r="4" />
        <circle cx="400" cy="460" r="4" />
        <circle cx="360" cy="120" r="4" />
        <circle cx="40" cy="480" r="4" />
        <circle cx="760" cy="120" r="4" />
      </g>
    </svg>
  );
}
