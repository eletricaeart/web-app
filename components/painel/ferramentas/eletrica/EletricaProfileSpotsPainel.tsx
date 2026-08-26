// components/painel/ferramentas/eletrica/EletricaProfileSpotsPainel.tsx
'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { usePainelRouter } from '@/app/painel/_router/PainelRouterContext';
import { PainelAppBar } from '@/components/painel/layout/PainelAppBar';
import View from '@/components/layout/View';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Lightning,
  Plus,
  Trash,
  PencilSimple,
  ShareNetwork,
  Package,
  X,
  Check,
  SquaresFour,
  Copy,
  Image,
  WhatsappLogo,
  LinkSimple,
  ArrowsOut,
  Cursor,
} from '@phosphor-icons/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  AmbienteEletrico,
  ProfileSegment,
  SpotPoint,
  calculateElectricalLoad,
  calculateProfileMaterials,
  calculateSpotMaterials,
} from '@/utils/calculators/eletricaProfileSpots';
import { EletricalBlueprint } from './EletricalBlueprint';
import FAB from '@/components/ui/FAB';
import Pressable from '@/components/Pressable';

// --- Tipos do projeto ---
interface ProjetoEletrico {
  id: string;
  name: string;
  ambientes: AmbienteEletrico[];
}

// --- Opções para selects ---
const LED_TYPES = ['SMD2835', 'SMD5050', 'COB'] as const;
const LED_DENSITIES = [60, 120, 240] as const;
const COLOR_TEMPS = ['3000K', '4000K', '6500K'] as const;
const SPOT_TYPES = ['embutido', 'sobrepor', 'pendente'] as const;
const SPOT_COLORS = ['branco', 'preto', 'cromo', 'ouro'] as const;
const BEAM_ANGLES = [15, 24, 36, 60] as const;

// --- Componente do Menu de Compartilhamento ---
interface ShareMenuProps {
  onShareWhatsApp: () => void;
  onCopyText: () => void;
  onDownloadImage: () => void;
  onCopyLink: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

function ShareMenu({
  onShareWhatsApp,
  onCopyText,
  onDownloadImage,
  onCopyLink,
  isOpen,
  onToggle,
}: ShareMenuProps) {
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={onToggle}
        className="flex items-center gap-2 bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
      >
        <ShareNetwork size={18} weight="bold" />
        <span>Compartilhar</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                onShareWhatsApp();
                onToggle();
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"
            >
              <WhatsappLogo size={18} className="text-green-600" />
              WhatsApp (texto + imagem)
            </button>
            <button
              onClick={() => {
                onCopyText();
                onToggle();
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"
            >
              <Copy size={18} className="text-indigo-600" />
              Copiar resumo do projeto
            </button>
            <button
              onClick={() => {
                onDownloadImage();
                onToggle();
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"
            >
              <Image size={18} className="text-amber-600" />
              Baixar blueprint (PNG)
            </button>
            <button
              onClick={() => {
                onCopyLink();
                onToggle();
              }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"
            >
              <LinkSimple size={18} className="text-blue-600" />
              Copiar link do projeto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Componente de Blueprint Interativo (com canvas e eventos) ---
interface InteractiveBlueprintProps {
  width: number;
  height: number;
  profiles: ProfileSegment[];
  spots: SpotPoint[];
  onAddSpot: (x: number, y: number) => void;
  onRemoveSpot: (id: string) => void;
  onUpdateSpot: (id: string, x: number, y: number) => void;
  onAddProfile: (x1: number, y1: number, x2: number, y2: number) => void;
  onRemoveProfile: (id: string) => void;
  readOnly?: boolean;
}

function InteractiveBlueprint({
  width,
  height,
  profiles,
  spots,
  onAddSpot,
  onRemoveSpot,
  onUpdateSpot,
  onAddProfile,
  onRemoveProfile,
  readOnly = false,
}: InteractiveBlueprintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [draggingSpot, setDraggingSpot] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null,
  );

  const scale = 80; // pixels por metro
  const padding = 40;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    // Fundo
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, cw, ch);

    const startX = padding;
    const startY = padding;
    const w = width * scale;
    const h = height * scale;

    // Desenhar contorno do forro/teto
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX, startY, w, h);

    // Linhas de grid (opcional)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = startX + (i / 10) * w;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + h);
      ctx.stroke();
      const y = startY + (i / 10) * h;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + w, y);
      ctx.stroke();
    }

    // Desenhar perfis (linhas)
    profiles.forEach((profile, idx) => {
      // Cada perfil é desenhado como uma linha horizontal ou vertical
      // Por simplicidade, vamos desenhar na posição acumulada
      // Na versão interativa, cada perfil tem posição x1,y1,x2,y2
      // Vamos assumir que o profile tem propriedades startX, startY, endX, endY
      // Mas como não temos, vamos usar a posição do perfil baseado em seu índice
      // Para uma versão mais realista, o usuário clicaria no canvas para definir pontos.
      // Vamos simular: cada perfil ocupa uma faixa.
      const posX = startX + 10 + (idx % 4) * 60;
      const posY = startY + 20 + Math.floor(idx / 4) * 50;
      const lengthPx = profile.length * scale;
      // Horizontal
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(posX, posY);
      ctx.lineTo(posX + lengthPx, posY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '9px sans-serif';
      ctx.fillText(
        `${profile.ledType} ${profile.ledDensity}LED`,
        posX,
        posY - 5,
      );
    });

    // Desenhar spots
    spots.forEach((spot) => {
      const x = startX + spot.x * scale;
      const y = startY + spot.y * scale;
      const radius = (spot.diameter / 2) * (scale / 100);

      // Sombra
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle =
        spot.color === 'branco'
          ? '#ffffff'
          : spot.color === 'preto'
            ? '#1a1a1a'
            : spot.color === 'cromo'
              ? '#b0b0b0'
              : '#d4af37';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Símbolo
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbol =
        spot.type === 'embutido' ? '⬤' : spot.type === 'sobrepor' ? '⏺' : '⌃';
      ctx.fillText(symbol, x, y);

      // Legenda
      ctx.fillStyle = '#64748b';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${spot.diameter}cm`, x, y + radius + 4);

      // Opção de remover (se não for readOnly)
      if (!readOnly) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('✕', x + radius + 2, y - radius - 2);
      }
    });

    // Legenda de dimensões
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Largura: ${width}m`, startX + 5, startY + h + 5);
    ctx.fillText(`Altura: ${height}m`, startX + w - 70, startY + h + 5);
  }, [width, height, profiles, spots, scale, padding, readOnly]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Eventos do mouse para interatividade
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const startX = padding;
    const startY = padding;
    const w = width * scale;
    const h = height * scale;

    // Verifica se clicou em um spot para arrastar ou remover
    for (const spot of spots) {
      const sx = startX + spot.x * scale;
      const sy = startY + spot.y * scale;
      const radius = (spot.diameter / 2) * (scale / 100);
      const dist = Math.hypot(mouseX - sx, mouseY - sy);
      if (dist < radius + 8) {
        // Verifica se clicou no X de remoção
        if (
          !readOnly &&
          mouseX > sx + radius + 2 &&
          mouseX < sx + radius + 12 &&
          mouseY > sy - radius - 2 &&
          mouseY < sy - radius + 8
        ) {
          onRemoveSpot(spot.id);
          return;
        }
        // Inicia arrasto
        setDraggingSpot(spot.id);
        setDragOffset({ x: mouseX - sx, y: mouseY - sy });
        return;
      }
    }

    // Se clicou dentro do forro, adiciona spot
    if (
      mouseX >= startX &&
      mouseX <= startX + w &&
      mouseY >= startY &&
      mouseY <= startY + h
    ) {
      const x = (mouseX - startX) / scale;
      const y = (mouseY - startY) / scale;
      onAddSpot(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingSpot || readOnly) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const startX = padding;
    const startY = padding;
    const w = width * scale;
    const h = height * scale;

    let newX = (mouseX - startX) / scale;
    let newY = (mouseY - startY) / scale;

    // Limitar dentro do forro
    newX = Math.max(0, Math.min(width, newX));
    newY = Math.max(0, Math.min(height, newY));

    onUpdateSpot(draggingSpot, newX, newY);
  };

  const handleMouseUp = () => {
    setDraggingSpot(null);
    setDragOffset(null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto max-w-full border border-slate-200 rounded-xl bg-white shadow-sm"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: readOnly ? 'default' : 'crosshair' }}
      />
      {!readOnly && (
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[10px] text-slate-500 border border-slate-200 shadow-sm flex items-center gap-2">
          <Cursor size={12} />
          <span>Clique no forro para adicionar spot</span>
          <span className="w-px h-4 bg-slate-200 mx-1" />
          <span>Arraste para mover</span>
        </div>
      )}
    </div>
  );
}

// --- Componente Principal ---
export default function EletricaProfileSpotsPainel() {
  const router = usePainelRouter();
  const [projetos, setProjetos] = useLocalStorage<ProjetoEletrico[]>(
    'eletrica-profile-spots-projetos',
    [],
  );

  // Estado do drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProjetoId, setEditingProjetoId] = useState<string | null>(null);
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [ambientesTemp, setAmbientesTemp] = useState<AmbienteEletrico[]>([]);

  // Estado do ambiente atual (edição)
  const [editingAmbienteId, setEditingAmbienteId] = useState<string | null>(
    null,
  );
  const [ambienteNome, setAmbienteNome] = useState('');
  const [ambienteWidth, setAmbienteWidth] = useState(4);
  const [ambienteHeight, setAmbienteHeight] = useState(3);
  const [profiles, setProfiles] = useState<ProfileSegment[]>([]);
  const [spots, setSpots] = useState<SpotPoint[]>([]);

  // Estado do formulário de perfil
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileLength, setProfileLength] = useState(0);
  const [profileLedType, setProfileLedType] =
    useState<ProfileSegment['ledType']>('SMD2835');
  const [profileLedDensity, setProfileLedDensity] =
    useState<ProfileSegment['ledDensity']>(60);
  const [profileColorTemp, setProfileColorTemp] =
    useState<ProfileSegment['colorTemp']>('4000K');

  // Estado do formulário de spot
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [spotX, setSpotX] = useState(0);
  const [spotY, setSpotY] = useState(0);
  const [spotType, setSpotType] = useState<SpotPoint['type']>('embutido');
  const [spotDiameter, setSpotDiameter] = useState(10);
  const [spotColor, setSpotColor] = useState<SpotPoint['color']>('branco');
  const [spotBeamAngle, setSpotBeamAngle] =
    useState<SpotPoint['beamAngle']>(36);

  // Estado para menu de compartilhamento
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const blueprintRef = useRef<HTMLDivElement>(null);

  // Projeto expandido para visualização
  const [expandedProjetoId, setExpandedProjetoId] = useState<string | null>(
    null,
  );

  // --- Funções de Perfil ---
  const resetProfileForm = () => {
    setEditingProfileId(null);
    setProfileLength(0);
    setProfileLedType('SMD2835');
    setProfileLedDensity(60);
    setProfileColorTemp('4000K');
  };

  const handleAddProfile = () => {
    if (profileLength <= 0) {
      toast.warning('Preencha o comprimento do perfil.');
      return;
    }

    const newProfile: ProfileSegment = {
      id: editingProfileId || Math.random().toString(36),
      length: profileLength,
      ledType: profileLedType,
      ledDensity: profileLedDensity,
      colorTemp: profileColorTemp,
    };

    if (editingProfileId) {
      setProfiles((prev) =>
        prev.map((p) => (p.id === editingProfileId ? newProfile : p)),
      );
      setEditingProfileId(null);
      toast.success('Perfil atualizado!');
    } else {
      setProfiles([...profiles, newProfile]);
      toast.success('Perfil adicionado!');
    }
    resetProfileForm();
  };

  const handleEditProfile = (profile: ProfileSegment) => {
    setEditingProfileId(profile.id);
    setProfileLength(profile.length);
    setProfileLedType(profile.ledType);
    setProfileLedDensity(profile.ledDensity);
    setProfileColorTemp(profile.colorTemp);
  };

  // --- Funções de Spot ---
  const resetSpotForm = () => {
    setEditingSpotId(null);
    setSpotX(0);
    setSpotY(0);
    setSpotType('embutido');
    setSpotDiameter(10);
    setSpotColor('branco');
    setSpotBeamAngle(36);
  };

  const handleAddSpot = (x?: number, y?: number) => {
    const finalX = x !== undefined ? x : spotX;
    const finalY = y !== undefined ? y : spotY;

    if (finalX < 0 || finalY < 0) {
      toast.warning('Posição do spot inválida.');
      return;
    }

    const newSpot: SpotPoint = {
      id: editingSpotId || Math.random().toString(36),
      x: finalX,
      y: finalY,
      type: spotType,
      diameter: spotDiameter,
      color: spotColor,
      beamAngle: spotBeamAngle,
    };

    if (editingSpotId) {
      setSpots((prev) =>
        prev.map((s) => (s.id === editingSpotId ? newSpot : s)),
      );
      setEditingSpotId(null);
      toast.success('Spot atualizado!');
    } else {
      setSpots([...spots, newSpot]);
      toast.success('Spot adicionado!');
    }
    resetSpotForm();
  };

  const handleEditSpot = (spot: SpotPoint) => {
    setEditingSpotId(spot.id);
    setSpotX(spot.x);
    setSpotY(spot.y);
    setSpotType(spot.type);
    setSpotDiameter(spot.diameter);
    setSpotColor(spot.color);
    setSpotBeamAngle(spot.beamAngle);
  };

  const handleRemoveSpot = (id: string) => {
    setSpots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateSpot = (id: string, x: number, y: number) => {
    setSpots((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  };

  // --- Salvar ambiente ---
  const handleSaveAmbiente = () => {
    if (!ambienteNome.trim()) {
      toast.warning('Preencha o nome do ambiente.');
      return;
    }
    if (ambienteWidth <= 0 || ambienteHeight <= 0) {
      toast.warning('Preencha as dimensões do ambiente.');
      return;
    }
    if (profiles.length === 0 && spots.length === 0) {
      toast.warning('Adicione pelo menos um perfil ou spot.');
      return;
    }

    const newAmbiente: AmbienteEletrico = {
      id: editingAmbienteId || Math.random().toString(36),
      name: ambienteNome,
      width: ambienteWidth,
      height: ambienteHeight,
      profiles: profiles,
      spots: spots,
    };

    if (editingAmbienteId) {
      setAmbientesTemp((prev) =>
        prev.map((a) => (a.id === editingAmbienteId ? newAmbiente : a)),
      );
      setEditingAmbienteId(null);
      toast.success('Ambiente atualizado!');
    } else {
      setAmbientesTemp([...ambientesTemp, newAmbiente]);
      toast.success('Ambiente adicionado!');
    }

    // Resetar formulário mantendo dimensões
    setAmbienteNome('');
    setProfiles([]);
    setSpots([]);
    setEditingAmbienteId(null);
  };

  const handleEditAmbiente = (ambiente: AmbienteEletrico) => {
    setEditingAmbienteId(ambiente.id);
    setAmbienteNome(ambiente.name);
    setAmbienteWidth(ambiente.width);
    setAmbienteHeight(ambiente.height);
    setProfiles(ambiente.profiles);
    setSpots(ambiente.spots);
  };

  // --- Salvar projeto ---
  const handleFinalSave = () => {
    if (!nomeProjeto.trim()) {
      toast.error('Nome do projeto é obrigatório.');
      return;
    }
    if (ambientesTemp.length === 0) {
      toast.error('Adicione pelo menos um ambiente.');
      return;
    }

    const projeto: ProjetoEletrico = {
      id: editingProjetoId || Date.now().toString(),
      name: nomeProjeto,
      ambientes: ambientesTemp,
    };

    if (editingProjetoId) {
      setProjetos((prev) =>
        prev.map((p) => (p.id === editingProjetoId ? projeto : p)),
      );
    } else {
      setProjetos([...projetos, projeto]);
    }

    setIsDrawerOpen(false);
    setNomeProjeto('');
    setAmbientesTemp([]);
    setEditingProjetoId(null);
    toast.success(editingProjetoId ? 'Projeto atualizado!' : 'Projeto salvo!');
  };

  // --- Cálculo de materiais ---
  const computeProjetoMaterials = (ambientes: AmbienteEletrico[]) => {
    const allProfiles = ambientes.flatMap((a) => a.profiles);
    const allSpots = ambientes.flatMap((a) => a.spots);

    const profileMats = calculateProfileMaterials(allProfiles);
    const spotMats = calculateSpotMaterials(allSpots);

    const allMats = [...profileMats, ...spotMats];
    const totals: Record<string, { item: string; qtd: number; unit: string }> =
      {};

    allMats.forEach((m) => {
      if (totals[m.item]) {
        totals[m.item].qtd += m.qtd;
      } else {
        totals[m.item] = { ...m, qtd: Number(m.qtd) };
      }
    });

    return Object.values(totals).map((m) => ({
      ...m,
      qtd: Number.isInteger(m.qtd) ? m.qtd : Number(m.qtd.toFixed(2)),
    }));
  };

  // --- Funções de Compartilhamento ---
  const generateProjectText = (projeto: ProjetoEletrico) => {
    const materials = computeProjetoMaterials(projeto.ambientes);
    const carga = calculateElectricalLoad(projeto.ambientes);

    let text = `*ELÉTRICA & ART*\n*Projeto de Perfilados e Spots*\n\n`;
    text += `*${projeto.name.toUpperCase()}*\n\n`;

    projeto.ambientes.forEach((a) => {
      text += `*${a.name.toUpperCase()}*\n`;
      text += `• Dimensões: ${a.width}x${a.height}m\n`;
      if (a.profiles.length > 0) {
        text += `• Perfis: ${a.profiles.length} segmentos (${a.profiles.reduce((acc, p) => acc + p.length, 0).toFixed(2)}m)\n`;
      }
      if (a.spots.length > 0) {
        text += `• Spots: ${a.spots.length} unidades\n`;
      }
      text += '\n';
    });

    text += `*CARGA TOTAL*\n`;
    text += `• Potência: ${carga.totalPotencia}\n`;
    text += `• Corrente: ${carga.correnteTotal}\n\n`;

    text += `*MATERIAIS*\n`;
    materials.forEach((m) => {
      text += `• ${m.item}: ${m.qtd} ${m.unit}\n`;
    });

    return text;
  };

  const handleShareWhatsApp = (projeto: ProjetoEletrico) => {
    const text = generateProjectText(projeto);
    // Tentar compartilhar imagem também
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      // Para WhatsApp, podemos enviar a imagem como arquivo se suportado, ou enviar link.
      // Solução simples: enviar texto com link para download da imagem (não implementado)
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyText = (projeto: ProjetoEletrico) => {
    const text = generateProjectText(projeto);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Resumo copiado!');
      })
      .catch(() => {
        toast.error('Erro ao copiar');
      });
  };

  const handleDownloadImage = (projeto: ProjetoEletrico) => {
    // Captura o blueprint (canvas)
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${projeto.name}-blueprint.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Blueprint baixado!');
    } else {
      toast.error('Nenhum blueprint encontrado');
    }
  };

  const handleCopyLink = (projeto: ProjetoEletrico) => {
    // Gera um link fictício (substituir por URL real se houver)
    const url = `${window.location.origin}/projetos/${projeto.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Link copiado!');
      })
      .catch(() => {
        toast.error('Erro ao copiar link');
      });
  };

  // --- FAB ---
  const fabConfig = [
    {
      icon: <Plus size={28} weight="duotone" />,
      label: 'Novo Projeto',
      action: () => setIsDrawerOpen(true),
    },
  ];

  // --- Ambiente atual para o blueprint interativo ---
  const currentAmbiente = useMemo(
    () => ({
      id: 'current',
      name: ambienteNome || 'Ambiente',
      width: ambienteWidth,
      height: ambienteHeight,
      profiles: profiles,
      spots: spots,
    }),
    [ambienteNome, ambienteWidth, ambienteHeight, profiles, spots],
  );

  return (
    <>
      <PainelAppBar
        title="Perfilados e Spots"
        backAction={() => router.push('ferramentas.eletrica')}
      />

      <View
        tag="page"
        className={`p-4 bg-slate-50 min-h-[calc(100dvh_-_120px)] pb-40 ${
          isDrawerOpen ? 'hidden' : 'block'
        }`}
      >
        <header className="mb-6 text-center">
          <Lightning
            size={48}
            weight="duotone"
            className="mx-auto text-amber-600 mb-2"
          />
          <h2 className="text-xl font-black text-slate-800 uppercase">
            Projetos de Iluminação
          </h2>
          <p className="text-slate-500 text-sm italic">
            Perfil LED e Spots com blueprint interativo
          </p>
        </header>

        {projetos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
            <Lightning
              size={48}
              weight="duotone"
              className="mx-auto text-slate-300 mb-3"
            />
            <p className="text-slate-500 font-bold">Nenhum projeto ainda</p>
            <p className="text-sm text-slate-400">
              Clique no botão + para criar seu projeto de iluminação
            </p>
          </div>
        ) : (
          projetos.map((projeto) => (
            <View
              key={projeto.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4 relative"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-indigo-900">{projeto.name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-indigo-600 bg-indigo-50 rounded-lg"
                    onClick={() => {
                      setEditingProjetoId(projeto.id);
                      setNomeProjeto(projeto.name);
                      setAmbientesTemp(projeto.ambientes);
                      setIsDrawerOpen(true);
                    }}
                  >
                    <PencilSimple size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 bg-red-50 rounded-lg"
                    onClick={() => {
                      setProjetos((prev) =>
                        prev.filter((p) => p.id !== projeto.id),
                      );
                      toast.success('Projeto removido');
                    }}
                  >
                    <Trash size={18} />
                  </Button>
                  <ShareMenu
                    isOpen={shareMenuOpen && expandedProjetoId === projeto.id}
                    onToggle={() => setShareMenuOpen(!shareMenuOpen)}
                    onShareWhatsApp={() => handleShareWhatsApp(projeto)}
                    onCopyText={() => handleCopyText(projeto)}
                    onDownloadImage={() => handleDownloadImage(projeto)}
                    onCopyLink={() => handleCopyLink(projeto)}
                  />
                </div>
              </div>

              {/* Resumo do projeto */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <span className="font-bold text-slate-600">
                    {projeto.ambientes.length}
                  </span>
                  <span className="text-slate-400 block">Ambientes</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <span className="font-bold text-slate-600">
                    {projeto.ambientes.reduce(
                      (acc, a) => acc + a.profiles.length,
                      0,
                    )}
                  </span>
                  <span className="text-slate-400 block">Perfis</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                  <span className="font-bold text-slate-600">
                    {projeto.ambientes.reduce(
                      (acc, a) => acc + a.spots.length,
                      0,
                    )}
                  </span>
                  <span className="text-slate-400 block">Spots</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full text-left text-[11px] font-bold text-indigo-500 uppercase py-2 flex items-center justify-between mt-2"
                onClick={() =>
                  setExpandedProjetoId(
                    expandedProjetoId === projeto.id ? null : projeto.id,
                  )
                }
              >
                <span>Detalhes e Blueprint</span>
                <span>{expandedProjetoId === projeto.id ? '▲' : '▼'}</span>
              </button>

              {expandedProjetoId === projeto.id && (
                <div className="mt-3 space-y-6">
                  {projeto.ambientes.map((ambiente) => (
                    <div
                      key={ambiente.id}
                      className="border border-slate-100 rounded-xl p-4 bg-slate-50/50"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-indigo-700">
                          {ambiente.name}
                        </h4>
                        <div className="text-xs text-slate-400">
                          {ambiente.width}x{ambiente.height}m
                        </div>
                      </div>
                      {/* Blueprint interativo (readonly) */}
                      <InteractiveBlueprint
                        width={ambiente.width}
                        height={ambiente.height}
                        profiles={ambiente.profiles}
                        spots={ambiente.spots}
                        onAddSpot={() => {}}
                        onRemoveSpot={() => {}}
                        onUpdateSpot={() => {}}
                        onAddProfile={() => {}}
                        onRemoveProfile={() => {}}
                        readOnly={true}
                      />
                    </div>
                  ))}

                  {/* Materiais consolidados do projeto */}
                  <div className="bg-indigo-50/50 rounded-xl p-3 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-2">
                      <Package size={14} /> Lista de Materiais
                    </h4>
                    {computeProjetoMaterials(projeto.ambientes).map((m, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm border-b border-indigo-100/50 pb-1 last:border-0"
                      >
                        <span className="text-slate-600">{m.item}</span>
                        <span className="font-bold text-indigo-700">
                          {m.qtd} {m.unit}
                        </span>
                      </div>
                    ))}
                    {/* Carga elétrica */}
                    {(() => {
                      const carga = calculateElectricalLoad(projeto.ambientes);
                      return (
                        <div className="mt-3 pt-3 border-t border-indigo-100 grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2 text-center">
                            <span className="font-bold text-amber-600">
                              {carga.totalPotencia}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Potência Total
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center">
                            <span className="font-bold text-amber-600">
                              {carga.correnteTotal}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Corrente Total (220V)
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </View>
          ))
        )}
      </View>

      {/* DRAWER para criar/editar projeto */}
      {isDrawerOpen && (
        <View className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setAmbientesTemp([]);
                setEditingProjetoId(null);
                setAmbienteNome('');
                setAmbienteWidth(4);
                setAmbienteHeight(3);
                setProfiles([]);
                setSpots([]);
                setEditingAmbienteId(null);
              }}
              className="p-2 bg-slate-100 rounded-full"
            >
              <X size={24} weight="bold" className="text-slate-600" />
            </button>
            <h2 className="font-black text-indigo-900 uppercase">
              {editingProjetoId ? 'Editar' : 'Novo'} Projeto
            </h2>
            <div className="w-10 h-10" />
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
            <div className="max-w-4xl mx-auto space-y-6 pb-32">
              {/* Nome do projeto */}
              <label className="block">
                <span className="text-[12px] font-bold text-slate-400 uppercase">
                  Nome do Projeto
                </span>
                <Input
                  placeholder="Ex: Iluminação Loja"
                  value={nomeProjeto}
                  onChange={(e) => setNomeProjeto(e.target.value)}
                  className="bg-white"
                />
              </label>

              {/* Lista de ambientes temporários */}
              {ambientesTemp.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-amber-500 uppercase">
                    Ambientes do Projeto
                  </span>
                  {ambientesTemp.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white p-3 rounded-xl border flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <span className="font-bold text-sm">{a.name}</span>
                        <span className="text-xs text-slate-400 ml-2">
                          {a.width}x{a.height}m | {a.profiles.length} perfis,{' '}
                          {a.spots.length} spots
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditAmbiente(a)}
                        >
                          <PencilSimple size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() =>
                            setAmbientesTemp((prev) =>
                              prev.filter((item) => item.id !== a.id),
                            )
                          }
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMULÁRIO DE AMBIENTE */}
              <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-700">
                  {editingAmbienteId ? 'Editar' : 'Adicionar'} Ambiente
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Nome
                    </span>
                    <Input
                      placeholder="Ex: Sala"
                      value={ambienteNome}
                      onChange={(e) => setAmbienteNome(e.target.value)}
                    />
                  </label>
                  <label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Largura (m)
                    </span>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.00"
                      value={ambienteWidth || ''}
                      onChange={(e) =>
                        setAmbienteWidth(parseFloat(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Altura (m)
                    </span>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.00"
                      value={ambienteHeight || ''}
                      onChange={(e) =>
                        setAmbienteHeight(parseFloat(e.target.value) || 0)
                      }
                    />
                  </label>
                </div>

                {/* BLUEPRINT INTERATIVO EM TEMPO REAL */}
                <div className="border rounded-xl overflow-hidden bg-slate-50">
                  <div className="p-3 border-b flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-600 uppercase">
                      Blueprint Interativo
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => {
                          setSpots([]);
                          setProfiles([]);
                        }}
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                  <div ref={blueprintRef} className="p-2">
                    <InteractiveBlueprint
                      width={ambienteWidth || 4}
                      height={ambienteHeight || 3}
                      profiles={profiles}
                      spots={spots}
                      onAddSpot={(x, y) => handleAddSpot(x, y)}
                      onRemoveSpot={handleRemoveSpot}
                      onUpdateSpot={handleUpdateSpot}
                      onAddProfile={() => {}}
                      onRemoveProfile={() => {}}
                      readOnly={false}
                    />
                    <div className="flex justify-between mt-2 text-xs text-slate-400 px-2">
                      <span>Clique no forro para adicionar spots</span>
                      <span>Arraste para mover</span>
                    </div>
                  </div>
                </div>

                {/* PERFIS */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-600 uppercase">
                      Perfis LED
                    </span>
                    <span className="text-xs text-slate-400">
                      {profiles.length} segmentos
                    </span>
                  </div>
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center bg-slate-50 p-2 rounded-lg mb-1"
                    >
                      <span className="text-xs">
                        {p.length}m | {p.ledType} {p.ledDensity}LED |{' '}
                        {p.colorTemp}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditProfile(p)}
                        >
                          <PencilSimple size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() =>
                            setProfiles((prev) =>
                              prev.filter((item) => item.id !== p.id),
                            )
                          }
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Compr. (m)"
                      className="h-8 text-xs"
                      value={profileLength || ''}
                      onChange={(e) =>
                        setProfileLength(parseFloat(e.target.value) || 0)
                      }
                    />
                    <select
                      className="h-8 text-xs border rounded px-1"
                      value={profileLedType}
                      onChange={(e) => setProfileLedType(e.target.value as any)}
                    >
                      {LED_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-8 text-xs border rounded px-1"
                      value={profileLedDensity}
                      onChange={(e) =>
                        setProfileLedDensity(Number(e.target.value) as any)
                      }
                    >
                      {LED_DENSITIES.map((d) => (
                        <option key={d} value={d}>
                          {d}LED
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-8 text-xs border rounded px-1"
                      value={profileColorTemp}
                      onChange={(e) =>
                        setProfileColorTemp(e.target.value as any)
                      }
                    >
                      {COLOR_TEMPS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={handleAddProfile}
                    className="w-full mt-1 text-xs bg-amber-600 hover:bg-amber-700 text-white h-8"
                  >
                    {editingProfileId ? 'Atualizar Perfil' : 'Adicionar Perfil'}
                  </Button>
                  {editingProfileId && (
                    <Button
                      variant="ghost"
                      onClick={resetProfileForm}
                      className="w-full text-xs h-6 text-slate-400"
                    >
                      Cancelar edição
                    </Button>
                  )}
                </div>

                {/* SPOTS (formulário auxiliar) */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-amber-600 uppercase">
                      Spots
                    </span>
                    <span className="text-xs text-slate-400">
                      {spots.length} unidades
                    </span>
                  </div>
                  {spots.map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center bg-slate-50 p-2 rounded-lg mb-1"
                    >
                      <span className="text-xs">
                        {s.x.toFixed(2)}m x {s.y.toFixed(2)}m | {s.diameter}cm{' '}
                        {s.type} | {s.color}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditSpot(s)}
                        >
                          <PencilSimple size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => handleRemoveSpot(s.id)}
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-6 gap-1 mt-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="X (m)"
                      className="h-8 text-xs"
                      value={spotX || ''}
                      onChange={(e) =>
                        setSpotX(parseFloat(e.target.value) || 0)
                      }
                    />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Y (m)"
                      className="h-8 text-xs"
                      value={spotY || ''}
                      onChange={(e) =>
                        setSpotY(parseFloat(e.target.value) || 0)
                      }
                    />
                    <select
                      className="h-8 text-xs border rounded px-1"
                      value={spotType}
                      onChange={(e) => setSpotType(e.target.value as any)}
                    >
                      {SPOT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="Φ (cm)"
                      className="h-8 text-xs"
                      value={spotDiameter || ''}
                      onChange={(e) =>
                        setSpotDiameter(parseFloat(e.target.value) || 10)
                      }
                    />
                    <select
                      className="h-8 text-xs border rounded px-1"
                      value={spotColor}
                      onChange={(e) => setSpotColor(e.target.value as any)}
                    >
                      {SPOT_COLORS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-8 text-xs border rounded px-1"
                      value={spotBeamAngle}
                      onChange={(e) =>
                        setSpotBeamAngle(Number(e.target.value) as any)
                      }
                    >
                      {BEAM_ANGLES.map((a) => (
                        <option key={a} value={a}>
                          {a}°
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={() => handleAddSpot(spotX, spotY)}
                    className="w-full mt-1 text-xs bg-amber-600 hover:bg-amber-700 text-white h-8"
                  >
                    {editingSpotId ? 'Atualizar Spot' : 'Adicionar Spot'}
                  </Button>
                  {editingSpotId && (
                    <Button
                      variant="ghost"
                      onClick={resetSpotForm}
                      className="w-full text-xs h-6 text-slate-400"
                    >
                      Cancelar edição
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleSaveAmbiente}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {editingAmbienteId ? 'Atualizar Ambiente' : 'Salvar Ambiente'}
                </Button>
                {editingAmbienteId && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingAmbienteId(null);
                      setAmbienteNome('');
                      setAmbienteWidth(4);
                      setAmbienteHeight(3);
                      setProfiles([]);
                      setSpots([]);
                    }}
                    className="w-full text-xs text-slate-400"
                  >
                    Cancelar edição do ambiente
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t">
            <Pressable
              onClick={handleFinalSave}
              className="w-full h-14 bg-green-600 text-white font-black uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Check size={20} /> Salvar Projeto
            </Pressable>
          </div>
        </View>
      )}

      <FAB actions={fabConfig} hasBottomNav={true} />
    </>
  );
}
