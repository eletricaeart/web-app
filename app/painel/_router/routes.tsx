// app/painel/_router/routes.tsx
'use client';

import React from 'react';
import { usePainelRouter } from './PainelRouterContext';
import PerfilPainel from '@/components/painel/perfil/PerfilPainel';
import HomePainel from '@/components/painel/home/HomePainel';
import EquipePainel from '@/components/painel/equipe/EquipePainel';
import EquipeEditarPainel from '@/components/painel/equipe/EquipeEditarPainel';
import NotasPainel from '@/components/painel/notas/NotasPainel';
import NotaNovaPainel from '@/components/painel/notas/NotaNovaPainel';
import RecibosPainel from '@/components/painel/recibos/RecibosPainel';
import ReciboNovoPainel from '@/components/painel/recibos/ReciboNovoPainel';
import ReciboVerPainel from '@/components/painel/recibos/ReciboVerPainel';
import ClientesPainel from '@/components/painel/clientes/ClientesPainel';
import ClienteNovoPainel from '@/components/painel/clientes/ClienteNovoPainel';
import ClientePerfilPainel from '@/components/painel/clientes/ClientePerfilPainel';
import OrcamentosPainel from '@/components/painel/orcamentos/OrcamentosPainel';
import OrcamentoNovoPainel from '@/components/painel/orcamentos/OrcamentoNovoPainel';
import OrcamentoVerPainel from '@/components/painel/orcamentos/OrcamentoVerPainel';
import DocumentosPainel from '@/components/painel/documentos/DocumentosPainel';
// Importações Drywall
import DrywallPainel from '@/components/painel/ferramentas/drywall/DrywallPainel';
import DrywallToolsPage from '@/components/painel/ferramentas/drywall/DrywallToolsPage';
import DrywallFurniturePainel from '@/components/painel/ferramentas/drywall/DrywallFurniturePainel';
// Ferramentas gerais
import FerramentasPainel from '@/components/painel/ferramentas/FerramentasPainel';
import EletricaPainel from '@/components/painel/ferramentas/EletricaPainel';
import PinturaPainel from '@/components/painel/ferramentas/PinturaPainel';
import AdminsPainel from '@/components/painel/admins/AdminsPainel';
import ConfiguracoesPainel from '@/components/painel/configuracoes/ConfiguracoesPainel';
import NotaVerPainel from '@/components/painel/notas/NotaVerPainel';
import ServicosPainel from '@/components/painel/servicos/ServicosPainel';
import ServicoEditorPainel from '@/components/painel/servicos/ServicoEditorPainel';

const routes: Record<string, React.ComponentType> = {
  home: HomePainel,
  perfil: PerfilPainel,
  equipe: EquipePainel,
  'equipe.editar': EquipeEditarPainel,
  notas: NotasPainel,
  'notas.novo': NotaNovaPainel,
  recibos: RecibosPainel,
  'recibos.novo': ReciboNovoPainel,
  'recibos.ver': ReciboVerPainel,
  clientes: ClientesPainel,
  'clientes.novo': ClienteNovoPainel,
  'clientes.perfil': ClientePerfilPainel,
  orcamentos: OrcamentosPainel,
  'orcamentos.novo': OrcamentoNovoPainel,
  'orcamentos.ver': OrcamentoVerPainel,
  documentos: DocumentosPainel,
  ferramentas: FerramentasPainel,
  'ferramentas.eletrica': EletricaPainel,
  'ferramentas.pintura': PinturaPainel,
  // Drywall
  'ferramentas.drywall': DrywallToolsPage, // Página central
  'ferramentas.drywall.paredes': DrywallPainel, // Calculadora de paredes/forros
  'ferramentas.drywall.moveis': DrywallFurniturePainel, // Calculadora de móveis
  admins: AdminsPainel,
  configuracoes: ConfiguracoesPainel,
  'notas.ver': NotaVerPainel,
  servicos: ServicosPainel,
  'servicos.novo': ServicoEditorPainel,
  'servicos.editar': ServicoEditorPainel,
};

export function PainelRouterView() {
  const { section } = usePainelRouter();
  const Section = routes[section];

  if (!Section) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
        Seção <b>"{section}"</b> ainda não migrada para o painel SPA.
      </div>
    );
  }

  return <Section />;
}
