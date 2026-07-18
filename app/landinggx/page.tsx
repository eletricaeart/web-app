// app/teste/page.tsx
'use client';

import React from 'react';
import { useLanguage } from '@/providers/LanguageProvider';
import {
  // Globe,
  Zap,
  ChevronRight,
  Crosshair,
  ShieldCheck,
} from 'lucide-react';
import {
  Globe,
  Lightning,
  PaintRoller,
  Wall,
  CaretRight,
  // Crosshair,
  // ShieldCheck,
} from '@phosphor-icons/react';
import Link from 'next/link';

export default function PublicHome() {
  const { t, language, setLanguage } = useLanguage();

  // Forçando o tema escuro para a vibe "Gamer/FPS" diretamente na estrutura
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-100 font-sans selection:bg-[#ff4655] selection:text-white overflow-x-hidden">
      {/* Fundo com Grade estilo HUD/Tech */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]"></div>

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
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center px-6">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#00e5ff]/10 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-3 text-[#ff4655] font-mono text-sm tracking-widest bg-[#ff4655]/10 px-4 py-2 border border-[#ff4655]/30">
                <Crosshair className="w-4 h-4" />
                <span>INITIATING_PROTOCOL</span>
              </div>

              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-white">
                Operação <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-600">
                  De Risco
                </span>{' '}
                <br />
                Zero.
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 border-l-4 border-[#00e5ff] pl-6 max-w-lg font-medium">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <a
                  href="#about"
                  className="relative group inline-flex items-center justify-center bg-[#ff4655] text-white px-10 py-5 font-black uppercase tracking-widest overflow-hidden"
                  style={{
                    clipPath:
                      'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
                  }}
                >
                  <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></span>
                  <span className="flex items-center gap-3">
                    {t('home.hero.cta')}
                    <ChevronRight className="w-6 h-6" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* DIVISOR TECH/MARQUEE */}
        <div className="w-full border-y border-white/10 bg-white/[0.02] py-4 overflow-hidden flex whitespace-nowrap text-xs font-mono text-gray-500 tracking-[0.4em] uppercase">
          <div className="animate-[marquee_20s_linear_infinite] flex gap-16 items-center">
            <span>// ALTA TENSÃO</span>{' '}
            <span className="text-[#00e5ff]">&#x25A0;</span>
            <span>ENGENHARIA DE PRECISÃO</span>{' '}
            <span className="text-[#00e5ff]">&#x25A0;</span>
            <span>INTEGRIDADE ESTRUTURAL</span>{' '}
            <span className="text-[#00e5ff]">&#x25A0;</span>
            <span>EXECUÇÃO TÁTICA</span>{' '}
            <span className="text-[#00e5ff]">&#x25A0;</span>
            <span>// ALTA TENSÃO</span>{' '}
            <span className="text-[#00e5ff]">&#x25A0;</span>
            <span>ENGENHARIA DE PRECISÃO</span>{' '}
            <span className="text-[#00e5ff]">&#x25A0;</span>
            <span>INTEGRIDADE ESTRUTURAL</span>{' '}
            <span className="text-[#00e5ff]">&#x25A0;</span>
            <span>EXECUÇÃO TÁTICA</span>{' '}
            <span className="text-[#00e5ff]">&#x25A0;</span>
          </div>
        </div>

        {/* SECTION: ABOUT RAFAEL (ESTILO COMANDANTE/FPS) */}
        <section id="about" className="py-32 px-6 relative">
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
                  <img
                    src="/pix/ea/EA-Rafael.png"
                    alt="Rafael - Tech Lead"
                    className="w-[120%] h-auto object-cover object-bottom group-hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
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
                      <br className="hidden sm:block" /> Vamos fechar esse
                      serviço?
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href="#services"
                    className="inline-flex items-center gap-3 border-b-2 border-[#00e5ff] text-[#00e5ff] pb-2 font-mono text-sm hover:text-white hover:border-white transition-colors uppercase font-bold tracking-widest"
                  >
                    Ver Especialidades <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: LOADOUTS / SERVICES */}
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
                  <Zap className="w-8 h-8 text-[#00e5ff] group-hover:text-black transition-colors" />
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

      {/* FOOTER TÁTICO */}
      <footer className="border-t border-white/10 py-10 text-center bg-[#050505] z-10 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/EA-logo.png"
              alt="Logo"
              className="w-8 h-8 grayscale opacity-50"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-bold tracking-widest text-gray-500">
              ELÉTRICA & ART
            </span>
          </div>
          <div className="font-mono text-xs text-gray-600 tracking-widest">
            &copy; {new Date().getFullYear()} // ALL SYSTEMS NOMINAL
          </div>
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
