"use client";

import React from "react";
import View from "./layout/View";
import { MagnifyingGlass } from "@phosphor-icons/react";
import "./SearchBar.css";

/**
 * Interface que define as propriedades do componente SearchBar.
 */
interface SearchBarProps {
  /** Texto de dica dentro do input - Default: "Buscar..." */
  placeholder?: string;
  /** Função de callback que recebe o valor digitado a cada mudança */
  onSearch?: (value: string) => void;
  /** Valor atual do input para controle externo (opcional) */
  value?: string;
}

/**
 * Componente de busca inspirado na interface do iFood.
 *
 * @param {SearchBarProps} props - Propriedades de configuração da busca.
 *
 * @description
 * Apresenta um campo de busca com ícone fixo à esquerda (MagnifyingGlass) e
 * estilização via CSS externo. Otimizado para Next.js com suporte a inputs controlados.
 */
export default function SearchBar({
  placeholder = "Buscar...",
  onSearch,
  value,
}: SearchBarProps) {
  /**
   * Manipulador de mudança que extrai o valor e dispara o callback tipado.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <View tag="toolbar" className="search-bar-container">
      <div className="ifood-search-wrapper">
        <MagnifyingGlass
          size={20}
          weight="duotone"
          className="ifood-search-icon"
        />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          spellCheck="false"
          autoComplete="off"
        />
      </div>
    </View>
  );
}
