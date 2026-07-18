// components/painel/home/HomePainel.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { useEASyncSupabase } from '@/hooks/useEASyncSupabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FilePlus,
  Users,
  Notebook,
  SignOut,
  Lightning,
  CaretRight,
  UserCircle,
  ChatCircleDots,
  CalculatorIcon,
  RulerIcon,
} from '@phosphor-icons/react';
import Image from 'next/image';
import Page from '@/components/layout/Page';
import { createClient } from '@/lib/supabase/client';

// Interface atualizada
interface UsuarioHome {
  id: string;
  name: string;
  role: string;
  photo_url?: string;
}

export default function HomePainel() {
  const router = usePainelRouter();
  const supabase = createClient();

  // Chamadas ao hook Supabase para contadores reais
  const { data: profiles } = useEASyncSupabase<UsuarioHome>('profiles');
  const { data: clients } = useEASyncSupabase<any>('clientes');
  const { data: notes } = useEASyncSupabase<any>('notas');
  const { data: orcamentos } = useEASyncSupabase<any>('orcamentos');
  const { data: recibos } = useEASyncSupabase<any>('recibos');

  const [currentUser, setCurrentUser] = useState<UsuarioHome | null>(null);

  // Identifica o usuário logado para mostrar o Perfil correto no topo
  useEffect(() => {
    async function identify() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && profiles.length > 0) {
        const me = profiles.find((p) => String(p.id) === String(user.id));
        if (me) setCurrentUser(me);
      }
    }
    identify();
  }, [profiles, supabase.auth]);

  // Lógica de Saudação (Mantida)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const firstName = currentUser?.name
    ? currentUser.name.split(' ')[0]
    : 'Profissional';

  // Lógica da Frase do Dia Persistente (Salva no LocalStorage por 24h)
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

    const today = new Date().toDateString(); // Ex: "Tue May 19 2026"
    const savedData = localStorage.getItem('ea_daily_phrase');

    if (savedData) {
      const { phrase, date } = JSON.parse(savedData);
      if (date === today) {
        setRandomPhrase(phrase);
        return;
      }
    }

    // Se não tem ou o dia mudou, escolhe nova e salva
    const newPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setRandomPhrase(newPhrase);
    localStorage.setItem(
      'ea_daily_phrase',
      JSON.stringify({ phrase: newPhrase, date: today }),
    );
  }, []);

  return (
    <>
      <Page hasBottomNavBar={true}>
        <main className="p-6">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {greeting}, {firstName}
              </h1>
              <p className="text-slate-500 text-sm">{randomPhrase}</p>
            </div>
            <div
              className="cursor-pointer"
              onClick={() => router.push('perfil')}
            >
              <div className="w-12 h-12 bg-indigo-950 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white relative">
                {currentUser?.photo_url ? (
                  <Image
                    src={currentUser.photo_url}
                    alt="Perfil"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Lightning
                    size={24}
                    weight="duotone"
                    className="text-white"
                  />
                )}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4">
            <QuickAction
              onClick={() => router.push('orcamentos.novo')}
              icon={<FilePlus size={32} weight="duotone" />}
              title="Novo Orçamento"
              description="Criar proposta rápida"
              color="bg-indigo-600"
            />

            <div className="grid grid-cols-2 gap-4">
              <MenuCard
                onClick={() => router.push('clientes')}
                icon={<Users size={28} weight="duotone" />}
                title="Clientes"
                count={`${clients.length} cadastrados`}
              />
              <MenuCard
                onClick={() => router.push('orcamentos')}
                icon={<Notebook size={28} weight="duotone" />}
                title="Orçamentos"
                count={`${orcamentos.length} registros`}
              />
              <MenuCard
                onClick={() => router.push('notas')}
                icon={<Notebook size={28} weight="duotone" />}
                title="Notas"
                count={`${notes.length} registros`}
              />
              <MenuCard
                onClick={() => router.push('recibos')}
                icon={<Notebook size={28} weight="duotone" />}
                title="Recibos"
                count={`${recibos.length} registros`}
              />
              <MenuCard
                onClick={() => router.push('equipe')}
                icon={<Lightning size={28} weight="duotone" />}
                title="Equipe"
                count={`${profiles.length} membros`}
              />
              <MenuCard
                onClick={() => router.push('perfil')}
                icon={<UserCircle size={28} weight="duotone" />}
                title="Meu Perfil"
                count="Visualizar"
              />
            </div>
          </div>

          <section className="mt-8 px-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              Ferramentas Técnicas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="cursor-pointer"
                onClick={() => router.push('ferramentas.drywall')}
              >
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-4 rounded-[2rem] shadow-lg active:scale-95 transition-all border border-white/20 relative overflow-hidden group">
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/10 rounded-full" />
                  <CalculatorIcon
                    size={32}
                    weight="duotone"
                    className="text-white mb-3"
                  />
                  <div className="flex flex-col">
                    <span className="text-white font-black text-sm uppercase">
                      Drywall
                    </span>
                    <span className="text-indigo-100 text-[10px]">
                      Materiais
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="flex flex-col w-full px-4 py-8">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:bg-red-50 gap-3 h-14 rounded-2xl"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
          >
            <SignOut size={24} />
            <span className="font-bold">Sair do Sistema</span>
          </Button>
        </footer>
      </Page>
    </>
  );
}

// Interfaces e Componentes Auxiliares (QuickAction e MenuCard mantidos conforme original)
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
        className={`${color} border-none text-white shadow-xl active:scale-[0.98] transition-all`}
      >
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-white/70 text-sm">{description}</p>
            </div>
          </div>
          <CaretRight size={20} weight="bold" className="opacity-50" />
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
    <div className="cursor-pointer" onClick={onClick}>
      <Card className="border-none shadow-sm hover:shadow-md active:scale-[0.95] transition-all rounded-3xl h-full">
        <CardContent className="p-6 flex flex-col gap-3">
          <div className="text-indigo-600 bg-indigo-50 w-fit p-3 rounded-2xl">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400 font-medium">{count}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
