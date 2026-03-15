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

  useEffect(() => {
    const saved = localStorage.getItem(`ea_prefs_${entityName}`);
    if (saved) {
      const { sort: s, filter: f } = JSON.parse(saved);
      if (s) setSort(s);
      if (f) setFilter(f);
    }
  }, [entityName]);

  const updatePrefs = (newSort: string, newFilter: string) => {
    setSort(newSort);
    setFilter(newFilter);
    localStorage.setItem(
      `ea_prefs_${entityName}`,
      JSON.stringify({ sort: newSort, filter: newFilter }),
    );
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Filtragem por termo
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((item: any) =>
        searchKeys.some((key) =>
          String(item[key] || "")
            .toLowerCase()
            .includes(term),
        ),
      );
    }

    // 2. Lógica de Filtro Customizado (Ex: Por cidade ou status)
    if (filter !== "all") {
      result = result.filter((item: any) => {
        // Exemplo: Filtrar por cidade em clientes ou status em orçamentos
        const city = item.city || item["Cidade"] || "";
        return city.toLowerCase().includes(filter.toLowerCase());
      });
    }

    // 3. Ordenação
    result.sort((a: any, b: any) => {
      if (sort === "name") return (a.name || "").localeCompare(b.name || "");
      if (sort === "recent")
        return (
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
        );
      if (sort === "oldest")
        return (
          new Date(a.updatedAt || 0).getTime() -
          new Date(b.updatedAt || 0).getTime()
        );
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
