import React from "react";
import View from "./View";
import "./ClientCard.css";

/**
 * Interface que define os dados esperados de um cliente.
 */
interface ClientData {
  id?: string | number;
  name: string;
  /** Gênero do cliente para seleção do avatar ('masc' ou 'fem') */
  gender: "masc" | "fem" | string;
  cidade?: string;
  doc?: boolean | string;
}

/**
 * Interface para as propriedades do componente ClientCard.
 */
interface ClientCardProps {
  /** Objeto com os dados do cliente */
  client: ClientData;
  /** Função disparada ao clicar no avatar ou nas informações do cliente */
  onClick?: () => void;
  /** Objeto contendo as URLs dos avatares (ex: { masc: 'url', fem: 'url' }) */
  AVATARS: {
    masc: string;
    fem: string;
    [key: string]: string;
  };
  /** Elemento ou componente adicional (botões, menus, ícones) exibido no badge */
  options?: React.ReactNode;
}

/**
 * Componente de Card para Listagem de Clientes.
 *
 * @param {ClientCardProps} props - Propriedades do card.
 *
 * @description
 * Exibe um resumo do cliente com avatar dinâmico baseado no gênero,
 * nome capitalizado e cidade. Possui uma área de 'options' (badge) customizável.
 * Otimizado para renderização em listas no Next.js.
 */
export default function ClientCard({
  client,
  onClick,
  AVATARS,
  options,
}: ClientCardProps) {
  // Fallback seguro caso o gênero não seja encontrado no objeto AVATARS
  const avatarSrc = AVATARS[client.gender] || AVATARS.masc;

  return (
    <View tag="client-card">
      <View tag="client-avatar" onClick={onClick} className="cursor-pointer">
        <img
          src={avatarSrc}
          alt={`Avatar de ${client.name}`}
          // Loading lazy para melhorar performance de grandes listas no Next.js
          loading="lazy"
        />
      </View>

      <View tag="client-info" onClick={onClick} className="cursor-pointer">
        <h4 className="text-[#333] capitalize">{client.name.toLowerCase()}</h4>
        <p>{client.cidade || "Cidade não informada"}</p>
      </View>

      {/* Área de ações ou status (Badge) */}
      <View tag="client-badge">{options}</View>
    </View>
  );
}
