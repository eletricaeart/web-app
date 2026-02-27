// lib/gas.ts
export async function fetchFromGAS(params: Record<string, string | any>) {
  const url = process.env.GAS_MASTER_URL;

  if (!url) {
    throw new Error("GAS_MASTER_URL não configurada no servidor.");
  }

  // Se for uma operação de leitura (GET)
  if (params.method === "GET") {
    const queryParams = new URLSearchParams(params.data).toString();
    const response = await fetch(`${url}?${queryParams}`, {
      cache: "no-store", // Garante dados sempre frescos
    });
    return response.json();
  }

  // Se for uma operação de escrita (POST)
  const formData = new URLSearchParams();
  formData.append("data", JSON.stringify(params.data));

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  return response.json();
}
