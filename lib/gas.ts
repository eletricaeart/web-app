// lib/gas.ts
export async function fetchFromGAS(params: {
  method: "GET" | "POST";
  data: any;
}) {
  const url = process.env.GAS_MASTER_URL;

  if (!url) {
    throw new Error("GAS_MASTER_URL não configurada no servidor.");
  }

  // OPERAÇÃO DE LEITURA (GET)
  if (params.method === "GET") {
    // Transformamos o objeto data em parâmetros de URL (?entity=clientes&id=123)
    const queryParams = new URLSearchParams(params.data).toString();

    const response = await fetch(`${url}?${queryParams}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Falha na comunicação GET com o GAS");
    return response.json();
  }

  // OPERAÇÃO DE ESCRITA (POST) - ENVIO EM JSON PURO
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Enviamos o objeto diretamente como string JSON, sem o prefixo "data="
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro na resposta do GAS:", errorText);
    throw new Error("Falha na comunicação POST com o GAS");
  }

  return response.json();
}
