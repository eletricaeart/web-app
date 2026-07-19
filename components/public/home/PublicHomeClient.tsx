// components/public/landing/PublicLandingClient.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Orbitron, Rajdhani, Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
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

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const godOfThunder = localFont({
  src: '../../../app/fonts/GodOfThunder.ttf', // caminho para o arquivo
  variable: '--font-thunder', // Nome da variável CSS
  display: 'swap',
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
  { label: 'RESPONSÁVEL TÉCNICO', value: 'RAFAEL' },
  { label: 'ESPECIALIDADES', value: '03' },
  { label: 'REGIÃO', value: 'LITORAL SP' },
  { label: 'DISPONIBILIDADE', value: 'SOB CONSULTA' },
];

const SPECIALTIES = [
  {
    icon: Lightning,
    accent: '#00e5ff',
    title: 'Elétrica',
    desc: 'Instalações, manutenções, quadros de força e projetos luminotécnicos de alta performance para residências e empresas.',
  },
  {
    icon: PaintRoller,
    accent: '#ff4655',
    title: 'Pintura',
    desc: 'Acabamento premium, texturas avançadas e efeitos decorativos como mármore. Detalhes minuciosos para um resultado impecável.',
  },
  {
    icon: Wall,
    accent: '#00bc7d',
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
      className={`eahud ${orbitron.variable} ${geistSans.variable} ${geistMono.variable} ${godOfThunder.variable} ${phase !== 'done' ? '' : 'min-h-screen bg-[#0a0a0c] text-gray-100 font-sans selection:bg-[#ff4655] selection:text-white overflow-x-hidden'}`}
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

                <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight font-sans">
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
              <h2 className="text-4xl font-black uppercase tracking-widest text-white font-sans">
                Especialidades <span className="text-[#ff4655]">Táticas</span>
              </h2>
              <div className="mt-3 text-gray-500 font-mono text-sm tracking-widest">
                // SELECT_YOUR_LOADOUT
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {
                /* SERVIÇOS */
                SPECIALTIES.map(({ icon: Icon, accent, title, desc }, i) => (
                  <div
                    key={title}
                    style={{ '--cor': accent }}
                    className={`group relative bg-[#171a21] border border-white/5 p-10 hover:border-[var(--cor)] transition-colors duration-300`}
                  >
                    <div
                      className={`absolute top-0 right-0 p-4 font-mono text-4xl font-black text-white/5 group-hover:text-[var(--cor)]/20 transition-colors`}
                    >
                      {`0${i + 1}`}
                    </div>
                    <div
                      className={`w-16 h-16 bg-[var(--cor)]/10 flex items-center justify-center rounded-lg border border-[var(--cor)]/20 mb-8 group-hover:bg-[var(--cor)] group-hover:text-white transition-colors`}
                    >
                      <Icon
                        className={`w-8 h-8 text-[var(--cor)] group-hover:text-white transition-colors`}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-black uppercase tracking-widest mb-4 text-white font-sans`}
                    >
                      {title}
                    </h3>
                    <p
                      className={`text-gray-400 text-base leading-relaxed font-medium font-sans`}
                    >
                      {desc}
                    </p>
                    <div
                      className={`mt-8 h-1 w-12 bg-white/20 group-hover:w-full group-hover:bg-[var(--cor)] transition-all duration-500`}
                    ></div>
                  </div>
                ))
              }
            </div>
          </div>
        </section>

        {/* SECTION: PROTOCOLOS DE SEGURANÇA (WHY CHOOSE US) */}
        <section className="py-24 px-6 bg-[#0a0a0c] relative border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                  Protocolos de{' '}
                  <span className="text-emerald-500">Segurança</span>
                </h2>
                <div className="text-gray-500 font-mono text-sm tracking-widest">
                  // DIRETRIZES_DE_EXECUÇÃO
                </div>

                <div className="space-y-6 text-gray-400">
                  <p className="text-lg font-medium leading-relaxed">
                    Não abrimos mão da integridade. Cada projeto executado segue
                    normas rígidas de segurança para proteger você, seu
                    patrimônio e nossa equipe.
                  </p>

                  <ul className="space-y-4 font-mono text-sm">
                    <li className="flex items-start gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20">
                      <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                      <div>
                        <strong className="block text-white uppercase tracking-widest mb-1">
                          Norma NBR 5410
                        </strong>
                        Toda infraestrutura elétrica atende rigorosamente as
                        normas técnicas vigentes.
                      </div>
                    </li>
                    <li className="flex items-start gap-4 p-4 bg-[#00e5ff]/5 border border-[#00e5ff]/20">
                      <Crosshair className="w-6 h-6 text-[#00e5ff] shrink-0" />
                      <div>
                        <strong className="block text-white uppercase tracking-widest mb-1">
                          Materiais Homologados
                        </strong>
                        Utilizamos apenas insumos de alta durabilidade,
                        garantindo a integridade estrutural.
                      </div>
                    </li>
                    <li className="flex items-start gap-4 p-4 bg-[#ff4655]/5 border border-[#ff4655]/20">
                      <Lightning className="w-6 h-6 text-[#ff4655] shrink-0" />
                      <div>
                        <strong className="block text-white uppercase tracking-widest mb-1">
                          Execução Tática
                        </strong>
                        Planejamento minucioso para reduzir prazos e eliminar
                        retrabalhos.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative aspect-square border border-white/10 bg-[#111318] p-8 hidden lg:flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <div className="relative z-10 w-64 h-64 rounded-full border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                  <div className="w-48 h-48 rounded-full border border-emerald-500/50 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="w-full h-full rounded-full border-t border-emerald-500"></div>
                  </div>
                  <ShieldCheck className="absolute w-24 h-24 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: REGISTROS TÁTICOS / PORTFÓLIO YOUTUBE */}
        <section
          id="portfolio"
          className="py-24 px-6 relative border-t border-white/5 bg-[#0f1115]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-widest text-white">
                  Registros <span className="text-[#00e5ff]">Táticos</span>
                </h2>
                <div className="mt-3 text-gray-500 font-mono text-sm tracking-widest">
                  // MISSÕES_ANTERIORES // YOUTUBE_ARCHIVE
                </div>
              </div>
              <a
                href="https://youtube.com/@EletricaeArt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-colors font-mono text-sm uppercase font-bold tracking-widest"
              >
                Acessar Arquivo <CaretRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: '1',
                  title: 'Manutenção de Quadro de Distribuição',
                  tag: 'ELÉTRICA',
                  url: 'https://youtube.com/@EletricaeArt',
                },
                {
                  id: '2',
                  title: 'Estruturação Drywall com Sanca Invertida',
                  tag: 'DRYWALL',
                  url: 'https://youtube.com/@EletricaeArt',
                },
                {
                  id: '3',
                  title: 'Acabamento Fino e Efeito Mármore',
                  tag: 'PINTURA',
                  url: 'https://youtube.com/@EletricaeArt',
                },
              ].map((video) => (
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={video.id}
                  className="group relative aspect-video bg-[#111318] border border-white/10 overflow-hidden hover:border-[#00e5ff] transition-colors cursor-pointer block"
                >
                  {/* Placeholder frame for video thumbnail */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors z-0"></div>

                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 rounded-full bg-red-600/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
                    <div className="font-mono text-xs text-[#00e5ff] tracking-widest mb-1">
                      LOG_ID: {Math.floor(Math.random() * 9000) + 1000} //{' '}
                      {video.tag}
                    </div>
                    <div className="font-bold text-white text-sm uppercase tracking-wide">
                      {video.title}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-1 z-10">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-mono text-[10px] text-red-500 tracking-widest uppercase font-bold">
                      REC
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* WHATSAPP FLOAT BUTTON */}
      <a
        href="https://wa.me/5513997685853"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 group flex items-center"
      >
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 group-hover:opacity-0 transition-opacity duration-300"></div>
        <div className="relative flex items-center bg-[#0a0a0c] border border-[#25D366] rounded-full p-3 hover:bg-[#25D366] transition-all duration-300 shadow-[0_0_15px_rgba(37,211,102,0.3)] group-hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] cursor-pointer overflow-hidden">
          <div className="text-[#25D366] group-hover:text-black transition-colors z-10 flex-shrink-0">
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </div>
          <div className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
            <span className="pl-3 pr-2 text-black font-bold uppercase tracking-widest text-sm">
              Falar com Rafael
            </span>
          </div>
        </div>
      </a>

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

      {/* Estilos Globais Injetados para Animações e Fundos */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar {
          width: 8px;
          background: #0a0a0c;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ff4655;
        }
      `,
        }}
      />
    </div>
  );
}
