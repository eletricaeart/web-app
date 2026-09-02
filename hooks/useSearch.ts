// hooks/useSearch.ts
import { useState, useMemo, useEffect } from "react";

export function useSearch<T>(
  data: T[],
  searchKeys: string[],
  entityName: string, // Nome para a chave do localStorage
) {
  const [searchTerm, setSearchTerm] = useState("");

  // Estados iniciais vindos do localStorage
  const [sort, setSort] = useState("recent");
  const [filter, setFilter] = useState("all");

  // Carrega as preferências do LS quando a entidade é definida
  useEffect(() => {
    if (!entityName) return;

    const saved = localStorage.getItem(`ea_prefs_${entityName}`);
    if (saved) {
      try {
        const { sort: s, filter: f } = JSON.parse(saved);
        if (s) setSort(s);
        if (f) setFilter(f);
      } catch (e) {
        console.error("Erro ao ler preferências do LS", e);
      }
    }
  }, [entityName]);

  // Função para atualizar tanto o estado quanto o LS
  const updatePrefs = (newSort: string, newFilter: string) => {
    setSort(newSort);
    setFilter(newFilter);
    if (entityName) {
      localStorage.setItem(
        `ea_prefs_${entityName}`,
        JSON.stringify({ sort: newSort, filter: newFilter }),
      );
    }
  };

  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Filtragem por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((item: any) => {
        if (!item) return false;
        // Verifica as chaves configuradas
        const matchedKey = searchKeys.some((key) =>
          String(item[key] || "")
            .toLowerCase()
            .includes(term),
        );
        if (matchedKey) return true;

        // Fallbacks inteligentes para campos aninhados ou comuns
        const clientName =
          item.client_name_manual ||
          item.clientName ||
          item.cliente?.name ||
          item["Nome Cliente"] ||
          item.name ||
          "";
        const docTitle =
          item.document_title ||
          item.documentTitle ||
          item.docTitle?.text ||
          item["Título Doc"] ||
          "";

        return (
          clientName.toLowerCase().includes(term) ||
          docTitle.toLowerCase().includes(term)
        );
      });
    }

    // Lógica de Filtro Customizado (Ex: Por status em orçamentos ou cidade em clientes)
    if (filter && filter !== "all") {
      result = result.filter((item: any) => {
        if (!item) return false;
        if (filter === "expired") {
          const exp = item.expiration || item["Validade"] || item.validade;
          if (!exp) return false;
          const expDate = new Date(exp);
          return !isNaN(expDate.getTime()) && expDate.getTime() < Date.now();
        }
        const city = item.city || item["Cidade"] || "";
        const status = item.status || item["Status"] || "";
        return (
          city.toLowerCase().includes(filter.toLowerCase()) ||
          status.toLowerCase().includes(filter.toLowerCase())
        );
      });
    }

    // 3. Ordenação robusta com múltiplos fallbacks de data e nome
    result.sort((a: any, b: any) => {
      if (sort === "name") {
        const nameA =
          a.document_title ||
          a.documentTitle ||
          a.name ||
          a.client_name_manual ||
          a.clientName ||
          a["Nome Cliente"] ||
          a["Título Doc"] ||
          "";
        const nameB =
          b.document_title ||
          b.documentTitle ||
          b.name ||
          b.client_name_manual ||
          b.clientName ||
          b["Nome Cliente"] ||
          b["Título Doc"] ||
          "";
        return String(nameA).localeCompare(String(nameB));
      }

      const getTime = (item: any) => {
        if (!item) return 0;
        const rawDate =
          item.created_at ||
          item.updated_at ||
          item.issue_date ||
          item.issueDate ||
          item.updatedAt ||
          item.createdAt ||
          item["Emissão"] ||
          item.docTitle?.emissao;
        if (!rawDate) return 0;

        if (typeof rawDate === "string" && rawDate.includes("/")) {
          const parts = rawDate.split("/");
          if (parts.length === 3) {
            const parsedBr = new Date(
              `${parts[2].trim()}-${parts[1].trim()}-${parts[0].trim()}`
            ).getTime();
            if (!isNaN(parsedBr)) return parsedBr;
          }
        }

        const parsed = new Date(rawDate).getTime();
        return isNaN(parsed) ? 0 : parsed;
      };

      if (sort === "recent") {
        return getTime(b) - getTime(a);
      }
      if (sort === "oldest") {
        return getTime(a) - getTime(b);
      }
      return 0;
    });

    return result;
  }, [data, searchTerm, sort, filter, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    sort,
    filter,
    updatePrefs,
    filteredData,
  };
}
