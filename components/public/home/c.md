```tsx
// components/public/landing/PublicLandingClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Orbitron, Rajdhani } from 'next/font/google';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  Globe,
  Lightning,
  PaintRoller,
  Wall,
  CaretRight,
  Crosshair,
  ShieldCheck,
} from '@phosphor-icons/react';
import './publicLanding.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-orbitron',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-rajdhani',
});

const WHATSAPP_NUMBER = '5513997685853';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const BOOT_LINES = [
  'INICIALIZANDO SISTEMA ELÉTRICA & ART...',
  'CARREGANDO PERFIL: RAFAEL — RESPONSÁVEL TÉCNICO',
  'REGIÃO DETECTADA: LITORAL SP',
  'CONEXÃO ESTABELECIDA.',
];

const STATUS_ITEMS = [
  { label: 'RESPONSÁVEL', value: 'RAFAEL' },
  { label: 'ESPECIALIDADES', value: '03' },
  { label: 'REGIÃO', value: 'LITORAL SP' },
  { label: 'DISPONIBILIDADE', value: 'SOB CONSULTA' },
];

const SPECIALTIES = [
  {
    icon: Lightning,
    accent: 'cyan',
    title: 'Elétrica',
    desc: 'Instalações, manutenções, quadros de força e projetos luminotécnicos de alta performance para residências e empresas.',
  },
  {
    icon: PaintRoller,
    accent: 'red',
    title: 'Pintura',
    desc: 'Acabamento premium, texturas avançadas e efeitos decorativos como mármore. Detalhes minuciosos para um resultado impecável.',
  },
  {
    icon: Wall,
    accent: 'emerald',
    title: 'Drywall',
    desc: 'Forros, sancas e divisórias com precisão milimétrica, modulação de espaços e execução rápida.',
  },
];

function useBootSequence() {
  const [phase, setPhase] = useState<'boot' | 'closing' | 'done'>('boot');

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem('ea_boot_seen');
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (alreadySeen || prefersReduced) {
      setPhase('done');
      return;
    }

    const timer = setTimeout(() => setPhase('closing'), 2100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'closing') {
      sessionStorage.setItem('ea_boot_seen', '1');
      const timer = setTimeout(() => setPhase('done'), 420);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const skip = () => setPhase('closing');

  return { phase, skip };
}

export default function PublicLandingClient() {
  const { t, language, setLanguage } = useLanguage();
  const { phase, skip } = useBootSequence();

  return (
    <div className={`eahud ${orbitron.variable} ${rajdhani.variable}`}>
      {phase !== 'done' && (
        <div
          className={`eahud-boot ${phase === 'closing' ? 'is-closing' : ''}`}
        >
          <div className="eahud-boot-lines">
            {BOOT_LINES.map((line, i) => (
              <div
                key={line}
                className="eahud-boot-line"
                style={{ animationDelay: `${i * 0.28}s` }}
              >
                <span className="eahud-boot-prompt">&gt;</span> {line}
              </div>
            ))}
          </div>
          <button type="button" className="eahud-boot-skip" onClick={skip}>
            PULAR
          </button>
        </div>
      )}

      <div className="eahud-grid" aria-hidden="true" />

      {/* --- TOPBAR --- */}
      <header className="eahud-topbar">
        <div className="eahud-topbar-inner">
          <div className="eahud-brand">
            <Image
              src="/pix/ea/EA-logo.png"
              alt="Elétrica & Art"
              width={48}
              height={48}
              className="eahud-brand-logo"
              priority
            />
            <span className="eahud-brand-word">
              ELÉTRICA <span className="eahud-brand-amp">&</span> ART
            </span>
          </div>

          <div className="eahud-topbar-actions">
            <div className="eahud-sys-status">
              <span>SYS_STATUS: ONLINE</span>
              <span className="eahud-status-dot" />
            </div>
            <button
              type="button"
              className="eahud-lang-toggle"
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            >
              <Globe size={15} weight="bold" />
              {language}
            </button>
            <a href="/login" className="eahud-topbar-link">
              <span className="eahud-topbar-link-fill" />
              <span className="eahud-topbar-link-text">{t('home.login')}</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* --- HERO --- */}
        <section className="eahud-hero">
          <div className="eahud-hero-glow" aria-hidden="true" />
          <div className="eahud-hero-inner">
            <div className="eahud-tag eahud-tag-red">
              <Crosshair size={14} weight="bold" />
              INITIATING_PROTOCOL
            </div>

            <h1 className="eahud-title">
              Operação
              <br />
              <span className="eahud-title-highlight">de Risco Zero.</span>
            </h1>

            <p className="eahud-lead">{t('home.hero.subtitle')}</p>

            <div className="eahud-actions">

                href="#identidade"
                className="eahud-btn eahud-btn-primary eahud-btn-red"
              >
                {t('home.hero.cta')}
                <CaretRight size={18} weight="bold" />
              </a>
            </div>
          </div>

          <div className="eahud-statusbar">
            {STATUS_ITEMS.map((item) => (
              <div key={item.label} className="eahud-status-item">
                <span className="eahud-status-label">{item.label}</span>
                <span className="eahud-status-value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- MARQUEE --- */}
        <div className="eahud-marquee">
          <div className="eahud-marquee-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <div className="eahud-marquee-group" key={i} aria-hidden={i === 1}>
                <span>// ALTA TENSÃO</span>
                <span className="eahud-marquee-dot">■</span>
                <span>ENGENHARIA DE PRECISÃO</span>
                <span className="eahud-marquee-dot">■</span>
                <span>INTEGRIDADE ESTRUTURAL</span>
                <span className="eahud-marquee-dot">■</span>
                <span>EXECUÇÃO TÁTICA</span>
                <span className="eahud-marquee-dot">■</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- IDENTIDADE / APRESENTAÇÃO DO RAFAEL --- */}
        <section id="identidade" className="eahud-identity">
          <div className="eahud-identity-inner">
            <div className="eahud-identity-portrait">
              <span className="eahud-bracket eahud-bracket-tl" />
              <span className="eahud-bracket eahud-bracket-br" />

              <div className="eahud-identity-frame">
                <div className="eahud-identity-fade" aria-hidden="true" />
                <Image
                  src="/pix/ea/EA-Rafael.png"
                  alt="Rafael, responsável técnico da Elétrica & Art"
                  fill
                  sizes="(max-width: 768px) 88vw, 420px"
                  className="eahud-identity-img"
                  priority
                />
                <div className="eahud-id-card">
                  <div className="eahud-id-name">ID: RAFAEL</div>
                  <div className="eahud-id-role">
                    CLASSE: RESPONSÁVEL TÉCNICO
                  </div>
                  <div className="eahud-id-status">
                    STATUS:
                    <span className="eahud-id-ready">
                      <span className="eahud-status-dot eahud-status-dot-green" />
                      READY
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="eahud-identity-copy">
              <div className="eahud-tag eahud-tag-ghost">
                <ShieldCheck size={14} weight="bold" />
                COMMUNICATION_LINK_ESTABLISHED
              </div>

              <h2 className="eahud-quote">
                "Eu sou o Rafael.
                <br />
                <span className="eahud-quote-highlight">
                  Prazer em conhecer.
                </span>
                "
              </h2>

              <div className="eahud-identity-text">
                <p>
                  Como responsável técnico da{' '}
                  <strong>Elétrica &amp; Art</strong>, meu objetivo não é
                  apenas entregar uma obra — é executar cada projeto com
                  precisão.
                </p>
                <p>
                  Seja em instalações elétricas, pintura de acabamento fino ou
                  estruturas em drywall, eu cuido pessoalmente de cada etapa,
                  do orçamento à entrega.
                </p>
              </div>

              <div className="eahud-callout">
                Você tem um projeto? Eu tenho a execução.
                <br className="eahud-callout-break" /> Vamos conversar sobre
                ele?
              </div>

              <a href="#especialidades" className="eahud-underline-link">
                Ver especialidades
                <CaretRight size={14} weight="bold" />
              </a>
            </div>
          </div>
        </section>

        {/* --- ESPECIALIDADES --- */}
        <section id="especialidades" className="eahud-specialties">
          <div className="eahud-specialties-inner">
            <div className="eahud-section-head">
              <h2 className="eahud-section-title">
                Especialidades <span className="eahud-title-red">Táticas</span>
              </h2>
              <span className="eahud-mono-label">// SELECT_YOUR_LOADOUT</span>
            </div>

            <div className="eahud-specialties-grid">
              {SPECIALTIES.map(({ icon: Icon, accent, title, desc }, i) => (
                <div
                  key={title}
                  className={`eahud-spec-card eahud-spec-${accent}`}
                >
                  <span className="eahud-spec-number">
                    0{i + 1}
                  </span>
                  <div className="eahud-spec-icon">
                    <Icon size={28} weight="bold" />
                  </div>
                  <h3 className="eahud-spec-title">{title}</h3>
                  <p className="eahud-spec-desc">{desc}</p>
                  <div className="eahud-spec-bar" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- RODAPÉ --- */}
      <footer className="eahud-footer">
        <div className="eahud-footer-inner">
          <div className="eahud-footer-brand">
            <Image
              src="/pix/ea/EA-logo.png"
              alt="Elétrica & Art"
              width={28}
              height={28}
              className="eahud-footer-logo"
            />
            <span>ELÉTRICA &amp; ART</span>
          </div>
          <span className="eahud-mono-label">
            &copy; {new Date().getFullYear()} // ALL SYSTEMS NOMINAL
          </span>
        </div>
      </footer>
    </div>
  );
}
```
