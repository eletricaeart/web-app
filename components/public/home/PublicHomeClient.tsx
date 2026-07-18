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
import './publicHome.css';
import Link from 'next/link';

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

export default function PublicHomeClient() {
  const { t, language, setLanguage } = useLanguage();
  const { phase, skip } = useBootSequence();

  return (
    <div
      className={`eahud ${orbitron.variable} ${rajdhani.variable} ${phase !== 'done' ? '' : 'min-h-screen bg-[#0a0a0c] text-gray-100 font-sans selection:bg-[#ff4655] selection:text-white overflow-x-hidden'}`}
    >
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

      {/* Barra de Navegação HUD */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 uppercase text-xs font-bold tracking-[0.2em]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">
          <div className="flex items-center gap-4">
            <img
              src="/pix/ea/EA-logo.png"
              alt="EA Logo"
              className="h-14 w-14 drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-white text-base tracking-widest hidden sm:block">
              ELÉTRICA <span className="text-[#00e5ff]">&</span> ART
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 text-gray-500">
              <span className="hover:text-white cursor-crosshair transition-colors">
                SYS_STATUS: ONLINE
              </span>
              <span className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full animate-pulse shadow-[0_0_8px_#00e5ff]"></span>
            </div>
            <button
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#00e5ff] transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language}
            </button>
            <Link
              href="/login"
              className="relative group border border-white/20 px-8 py-3 overflow-hidden text-sm"
              style={{
                clipPath:
                  'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
              }}
            >
              <span className="absolute inset-0 bg-[#00e5ff] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
              <span className="relative group-hover:text-black transition-colors font-black tracking-widest">
                {t('home.login')}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative pt-20 pb-20 z-10">
        {/* --- HERO --- */}
        <section className="relative pt-20 pb-20 z-10">
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
              <a
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

        {/* --- DIVISOR TECH/MARQUEE --- */}
        <div className="w-full border-y border-white/10 bg-white/[0.02] py-4 overflow-hidden flex whitespace-nowrap text-xs font-mono text-gray-500 tracking-[0.4em] uppercase">
          <div className="eahud-marquee-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                className="animate-[marquee_20s_linear_infinite] flex gap-16 items-center"
                key={i}
                aria-hidden={i === 1}
              >
                <span>// ALTA TENSÃO</span>{' '}
                <span className="text-[#00e5ff]">&#x25A0;</span>
                <span>ENGENHARIA DE PRECISÃO</span>{' '}
                <span className="text-[#00e5ff]">&#x25A0;</span>
                <span>INTEGRIDADE ESTRUTURAL</span>{' '}
                <span className="text-[#00e5ff]">&#x25A0;</span>
                <span>EXECUÇÃO TÁTICA</span>{' '}
                <span className="text-[#00e5ff]">&#x25A0;</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- IDENTIDADE / APRESENTAÇÃO DO RAFAEL --- */}
        <section id="about" className="py-32 px-6 relative font-sans">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* IMAGEM COM HUD */}
              <div className="relative group max-w-md mx-auto w-full">
                {/* Elementos Decorativos de Mira/HUD */}
                <div className="absolute -top-6 -left-6 w-16 h-16 border-t-4 border-l-4 border-[#00e5ff] transition-all duration-500 group-hover:-top-8 group-hover:-left-8 z-20"></div>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 border-b-4 border-r-4 border-[#00e5ff] transition-all duration-500 group-hover:-bottom-8 group-hover:-right-8 z-20"></div>
                <div className="absolute top-1/2 left-0 w-2 h-10 bg-[#00e5ff] -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity z-20"></div>

                <div
                  className="relative bg-[#111318] border border-white/10 aspect-[3/4] overflow-hidden flex items-end justify-center"
                  style={{
                    clipPath:
                      'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent z-10"></div>
                  <Image
                    src="/pix/ea/EA-Rafael.png"
                    alt="Rafael, responsável técnico da Elétrica & Art"
                    fill
                    sizes="(max-width: 768px) 88vw, 420px"
                    className="w-[120%] h-auto object-cover object-bottom group-hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:scale-105"
                    priority
                  />

                  {/* Overlay do HUD Inferior */}
                  <div className="absolute bottom-6 left-6 z-20 font-mono text-sm space-y-1 backdrop-blur-md bg-black/40 p-4 border border-white/10">
                    <div className="text-[#00e5ff] font-black text-lg tracking-widest">
                      ID: RAFAEL
                    </div>
                    <div className="text-gray-300 text-xs tracking-widest">
                      CLASSE: TECH_LEAD
                    </div>
                    <div className="text-gray-300 text-xs tracking-widest flex items-center gap-2 mt-2">
                      STATUS:{' '}
                      <span className="text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>{' '}
                        READY
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TEXTO DE INTRODUÇÃO DIRETA */}
              <div className="space-y-8 relative">
                <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block"></div>

                <div className="flex items-center gap-4 text-gray-500 font-mono text-xs tracking-widest bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-[#00e5ff]" />
                  <span>COMMUNICATION_LINK_ESTABLISHED</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                  "Eu sou o Rafael.
                  <br />
                  <span className="text-[#00e5ff]">Prazer em conhecer.</span>"
                </h2>

                <div className="space-y-6 text-gray-400 text-lg leading-relaxed font-medium">
                  <p>
                    Como responsável técnico da{' '}
                    <strong className="text-white">Elétrica & Art</strong>, meu
                    objetivo não é apenas entregar uma obra, é executar uma
                    missão com precisão tática.
                  </p>
                  <p>
                    Seja em instalações elétricas de alta complexidade, pintura
                    de acabamento fino ou estruturas em drywall, minha equipe e
                    eu operamos sob os mais altos padrões de qualidade, estética
                    e segurança.
                  </p>
                  <div className="p-6 bg-[#00e5ff]/10 border border-[#00e5ff]/20 text-white">
                    <p className="font-bold tracking-wide uppercase">
                      Você tem um projeto? Nós temos a execução.{' '}
                      <br className="hidden sm:block" /> Vamos fechar negócio?
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="#services"
                    className="inline-flex items-center gap-3 border-b-2 border-[#00e5ff] text-[#00e5ff] pb-2 font-mono text-sm hover:text-white hover:border-white transition-colors uppercase font-bold tracking-widest"
                  >
                    Ver Especialidades <CaretRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ESPECIALIDADES --- */}
        <section
          id="services"
          className="py-24 px-6 bg-[#0f1115] relative border-t border-white/5"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                Especialidades <span className="text-[#ff4655]">Táticas</span>
              </h2>
              <div className="mt-3 text-gray-500 font-mono text-sm tracking-widest">
                // SELECT_YOUR_LOADOUT
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* SERVIÇO 1 */}
              <div className="group relative bg-[#171a21] border border-white/5 p-10 hover:border-[#00e5ff] transition-colors duration-300">
                <div className="absolute top-0 right-0 p-4 font-mono text-4xl font-black text-white/5 group-hover:text-[#00e5ff]/20 transition-colors">
                  01
                </div>
                <div className="w-16 h-16 bg-[#00e5ff]/10 flex items-center justify-center rounded-lg border border-[#00e5ff]/20 mb-8 group-hover:bg-[#00e5ff] group-hover:text-black transition-colors">
                  <Lightning className="w-8 h-8 text-[#00e5ff] group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 text-white">
                  Elétrica
                </h3>
                <p className="text-gray-400 text-base leading-relaxed font-medium">
                  Instalações, manutenções, quadros de força e projetos
                  luminotécnicos de alta performance para residências e
                  empresas.
                </p>
                <div className="mt-8 h-1 w-12 bg-white/20 group-hover:w-full group-hover:bg-[#00e5ff] transition-all duration-500"></div>
              </div>

              {/* SERVIÇO 2 */}
              <div className="group relative bg-[#171a21] border border-white/5 p-10 hover:border-[#ff4655] transition-colors duration-300">
                <div className="absolute top-0 right-0 p-4 font-mono text-4xl font-black text-white/5 group-hover:text-[#ff4655]/20 transition-colors">
                  02
                </div>
                <div className="w-16 h-16 bg-[#ff4655]/10 flex items-center justify-center rounded-lg border border-[#ff4655]/20 mb-8 group-hover:bg-[#ff4655] group-hover:text-white transition-colors">
                  <PaintRoller className="w-8 h-8 text-[#ff4655] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 text-white">
                  Pintura
                </h3>
                <p className="text-gray-400 text-base leading-relaxed font-medium">
                  Acabamento premium, texturas avançadas e proteção de
                  superfícies. Detalhes minuciosos para um resultado impecável.
                </p>
                <div className="mt-8 h-1 w-12 bg-white/20 group-hover:w-full group-hover:bg-[#ff4655] transition-all duration-500"></div>
              </div>

              {/* SERVIÇO 3 */}
              <div className="group relative bg-[#171a21] border border-white/5 p-10 hover:border-emerald-500 transition-colors duration-300">
                <div className="absolute top-0 right-0 p-4 font-mono text-4xl font-black text-white/5 group-hover:text-emerald-500/20 transition-colors">
                  03
                </div>
                <div className="w-16 h-16 bg-emerald-500/10 flex items-center justify-center rounded-lg border border-emerald-500/20 mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Wall className="w-8 h-8 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 text-white">
                  Drywall
                </h3>
                <p className="text-gray-400 text-base leading-relaxed font-medium">
                  Modulação de espaços, forros acústicos e estruturas de gesso
                  com precisão milimétrica e rápida execução.
                </p>
                <div className="mt-8 h-1 w-12 bg-white/20 group-hover:w-full group-hover:bg-emerald-500 transition-all duration-500"></div>
              </div>
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
