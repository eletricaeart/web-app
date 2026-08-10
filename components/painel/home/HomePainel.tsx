// components/painel/home/HomePainel.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { usePainelAuth } from '@/components/painel/auth/PainelAuthContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import {
  ArrowRight,
  FilePlus,
  Users,
  Notebook,
  SignOut,
  Lightning,
  CaretRight,
  UserCircle,
  CalculatorIcon,
} from '@phosphor-icons/react';
import Page from '@/components/layout/Page';
// import { View } from '@/components/ui/view';

export default function HomePainel() {
  const router = usePainelRouter();
  const { profile, signOut } = usePainelAuth();

  const { data: profiles } = useEASyncSupabase<any>('profiles');
  const { data: clients } = useEASyncSupabase<any>('clientes');
  const { data: notes } = useEASyncSupabase<any>('notas');
  const { data: orcamentos } = useEASyncSupabase<any>('orcamentos');
  const { data: recibos } = useEASyncSupabase<any>('recibos');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Profissional';

  const [randomPhrase, setRandomPhrase] = useState('Gestão inteligente.');

  useEffect(() => {
    const phrases = [
      'O que vamos fazer hoje na Elétrica & Art?',
      'Pronto para mais um dia de sucesso?',
      'Gestão inteligente, resultados brilhantes.',
      'Sua produtividade começa por aqui.',
      'Transformando energia em eficiência.',
      'Organização é a chave para o crescimento.',
      'Vamos colocar os projetos em dia?',
    ];

    const today = new Date().toDateString();
    const savedData = localStorage.getItem('ea_daily_phrase');

    if (savedData) {
      try {
        const { phrase, date } = JSON.parse(savedData);
        if (date === today) {
          setRandomPhrase(phrase);
          return;
        }
      } catch (e) {
        // Fallback
      }
    }

    const newPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setRandomPhrase(newPhrase);
    localStorage.setItem(
      'ea_daily_phrase',
      JSON.stringify({ phrase: newPhrase, date: today }),
    );
  }, []);

  return (
    <>
      <PainelAppBar
        greeting={greeting}
        firstName={firstName}
        randomPhrase={randomPhrase}
        onAvatarClick={() => router.push('perfil')}
      />
      <Page hasBottomNavBar={true}>
        <main className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Ação Rápida */}
          <section>
            <QuickAction
              onClick={() => router.push('orcamentos.novo')}
              icon={<FilePlus size={28} weight="duotone" />}
              title="Novo Orçamento"
              description="Criar proposta comercial rápida"
              color="bg-indigo-600 hover:bg-indigo-700"
            />
          </section>

          {/* Seção 1: Gestão Geral com Título à esquerda e Ação à direita */}
          <section className="mt-6 sm:mt-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Gestão Geral
              </h2>
              <div
                onClick={() => router.push('orcamentos')}
                className="flex text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
              >
                <span>Ver orçamentos</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <MenuCard
                onClick={() => router.push('clientes')}
                icon={<Users size={24} weight="duotone" />}
                title="Clientes"
                count={`${clients?.length || 0} cadastrados`}
              />
              <MenuCard
                onClick={() => router.push('orcamentos')}
                icon={<Notebook size={24} weight="duotone" />}
                title="Orçamentos"
                count={`${orcamentos?.length || 0} registros`}
              />
              <MenuCard
                onClick={() => router.push('notas')}
                icon={<Notebook size={24} weight="duotone" />}
                title="Notas"
                count={`${notes?.length || 0} registros`}
              />
              <MenuCard
                onClick={() => router.push('recibos')}
                icon={<Notebook size={24} weight="duotone" />}
                title="Recibos"
                count={`${recibos?.length || 0} registros`}
              />
              <MenuCard
                onClick={() => router.push('equipe')}
                icon={<Lightning size={24} weight="duotone" />}
                title="Equipe"
                count={`${profiles?.length || 0} membros`}
              />
              <MenuCard
                onClick={() => router.push('perfil')}
                icon={<UserCircle size={24} weight="duotone" />}
                title="Meu Perfil"
                count="Visualizar"
              />
            </div>
          </section>

          {/* Seção 2: Ferramentas Técnicas */}
          <section className="mt-6 sm:mt-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
              Ferramentas Técnicas
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div
                className="cursor-pointer"
                onClick={() => router.push('ferramentas.drywall')}
              >
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 rounded-2xl sm:rounded-[2rem] shadow-md sm:shadow-lg active:scale-95 transition-all border border-white/20 relative overflow-hidden group">
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/10 rounded-full" />
                  <CalculatorIcon
                    size={28}
                    weight="duotone"
                    className="text-white mb-2"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-white font-black text-xs sm:text-sm uppercase truncate">
                      Drywall
                    </span>
                    <span className="text-indigo-100 text-[10px] truncate">
                      Calculadora Materiais
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-8 pb-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:bg-red-50 gap-3 h-12 sm:h-14 rounded-2xl"
              onClick={signOut}
            >
              <SignOut size={22} />
              <span className="font-bold text-sm sm:text-base">
                Sair do Sistema
              </span>
            </Button>
          </footer>
        </main>
      </Page>
    </>
  );
}

interface QuickActionProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}
function QuickAction({
  onClick,
  icon,
  title,
  description,
  color,
}: QuickActionProps) {
  return (
    <div className="cursor-pointer" onClick={onClick}>
      <Card
        className={`${color} border-none text-white shadow-lg active:scale-[0.98] transition-all rounded-2xl sm:rounded-3xl overflow-hidden`}
      >
        <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="bg-white/20 p-2.5 sm:p-3 rounded-xl shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg truncate">
                {title}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm truncate">
                {description}
              </p>
            </div>
          </div>
          <CaretRight size={20} weight="bold" className="opacity-70 shrink-0" />
        </CardContent>
      </Card>
    </div>
  );
}

interface MenuCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  count: string;
}
function MenuCard({ onClick, icon, title, count }: MenuCardProps) {
  return (
    <div className="cursor-pointer h-full" onClick={onClick}>
      <Card className="border-none shadow-sm hover:shadow-md active:scale-[0.95] transition-all rounded-2xl sm:rounded-3xl h-full">
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between gap-2.5 h-full">
          <div className="text-indigo-600 bg-indigo-50 w-fit p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
              {title}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
              {count}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
