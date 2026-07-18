// lib/fetcher.ts
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao carregar dados");
  }
  return res.json();
};
