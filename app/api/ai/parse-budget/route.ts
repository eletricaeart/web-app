import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chave de API do Gemini (GEMINI_API_KEY) não configurada.');
  }
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'O texto da proposta não foi informado.' },
        { status: 400 },
      );
    }

    const ai = getGeminiClient();

    const systemInstruction = `Você é um extrator de dados de altíssima precisão e fidelidade documental da empresa "Elétrica&Art – Soluções Técnicas em Instalações e Acabamentos".
Sua ÚNICA função é extrair, transcrever e estruturar fielmente as informações contidas no texto do orçamento fornecido para a estrutura JSON especificada.

DIRETRIZES DE RIGOR ABSOLUTO:

1. REGRA SUPREMA DE EXTRAÇÃO DE TODAS AS CLÁUSULAS ("services"):
   - TODA e QUALQUER seção ou cláusula presente no documento (ex: "1. OBJETIVO DA PROPOSTA", "2. ESCOPO TÉCNICO – GESSO DRYWALL", "3. ESCOPO TÉCNICO – PINTURA", "4. ESCOPO TÉCNICO – REFORMA ELÉTRICA", "5. INVESTIMENTO", "6. RESUMO FINANCEIRO", "7. PRAZO DE EXECUÇÃO", "8. CONDIÇÕES DE PAGAMENTO", "9. GARANTIA", etc.) DEVE OBRIGATORIAMENTE gerar uma cláusula correspondente no array "services".
   - A ÚNICA seção que deve ser IGNORADA e NÃO incluída no array "services" é a seção "Considerações Finais", pois o encerramento com assinaturas e dados de contato é impresso automaticamente pelo layout padrão da empresa.
   - NUNCA omita cláusulas como Investimento, Resumo Financeiro, Prazo, Pagamento ou Garantia do array "services". Elas devem constar com seu texto e formato literais em "services" E, SIMULTANEAMENTE, seus valores e prazos devem ser extraídos para os campos analíticos de "financialV3" / "financialV2".

2. CÓPIA LITERAL E INTEGRAL (PROIBIDO RESUMIR, ALTERAR OU CORTAR):
   - Transcreva o texto de cada cláusula e subcláusula NA ÍNTEGRA.
   - NUNCA resuma, NUNCA abrevie, NUNCA corte parágrafos e NUNCA omita tópicos, tabelas, quantidades ou especificações técnicas.
   - O texto descritivo de cada item deve conter exatamente todas as frases, detalhes, medidas e itens listados no documento de origem.

3. PROIBIÇÃO TOTAL DE INVENÇÃO / ALUCINAÇÃO:
   - NUNCA invente clientes, endereços, serviços, prazos, garantias ou valores que não estejam no texto.
   - Se uma informação não for encontrada no documento, retorne uma string vazia "" ou o número 0.

4. ESTRUTURAÇÃO DAS CLÁUSULAS ("services"):
   - "titulo": Título limpo da cláusula SEM o número prefixado (ex: use "Objetivo da Proposta", "Escopo Técnico – Gesso Drywall", "Escopo Técnico – Pintura", "Escopo Técnico – Reforma Elétrica", "Investimento", "Resumo Financeiro", "Prazo de Execução", "Condições de Pagamento", "Garantia").
   - "items":
     - Se a seção tiver subcláusulas (ex: 2.1, 2.2, 2.3 ou tópicos distintos de serviços):
       - "subtitulo": Nome da subcláusula (ex: "Infraestrutura Elétrica", "Pintura dos Quartos").
       - "content": Todo o texto original daquela subcláusula, formatado com tags HTML como <p>...</p>, <ul><li>...</li></ul>, <strong>...</strong> ou tabelas <table> para preservar exatamente a formatação original.
       - "numbered": true (se for subdivisão numerada como 2.1, 2.2) ou false.
     - Se a seção for um texto contínuo ou tabela (ex: Objetivo, Investimento, Resumo Financeiro, Prazo, Condições de Pagamento, Garantia):
       - Crie 1 item com "subtitulo": "", "numbered": false, e em "content" insira todo o texto/tabela original completo e formatado da seção.

5. INTELIGÊNCIA FINANCEIRA, PRAZOS E GESTÃO ("financialV3" e "financialV2"):
   - Simultaneamente à transcrição das cláusulas, extraia para os campos analíticos:
     - "servicesBreakdown" e "categories": Todos os serviços/disciplinas orçados com seus valores numéricos em Reais (ex: Gesso Drywall, Pintura, Reforma Elétrica, etc.).
     - "grandTotal": Valor total geral numérico do orçamento.
     - "paymentConditions": Texto descritivo exato das condições de pagamento.
     - "deadline": Prazo de execução exato.
     - "warranty": Termos de garantia exatos.
     - "paymentSchedule": Parcelamento ou etapas financeiras identificadas.`;

    const tryGenerate = async (modelName: string) => {
      const config: any = {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentTitle: {
              type: Type.STRING,
              description: 'Título principal da proposta de serviço.',
            },
            subtitle: {
              type: Type.STRING,
              description:
                'Subtítulo (PROPOSTA DE ORÇAMENTO ou PROPOSTA COMERCIAL).',
            },
            issueDate: {
              type: Type.STRING,
              description: 'Data de emissão no formato YYYY-MM-DD.',
            },
            expiration: {
              type: Type.STRING,
              description: 'Prazo de validade da proposta.',
            },
            client: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                street: { type: Type.STRING },
                number: { type: Type.STRING },
                complement: { type: Type.STRING },
                neighborhood: { type: Type.STRING },
                city: { type: Type.STRING },
                zip: { type: Type.STRING },
              },
            },
            services: {
              type: Type.ARRAY,
              description:
                'Lista completa de TODAS as cláusulas (1 a N) do documento original sem exceção.',
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: {
                    type: Type.STRING,
                    description: 'Título da cláusula (sem número prefixado).',
                  },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        subtitulo: {
                          type: Type.STRING,
                          description:
                            'Subtítulo do item/subcláusula ou vazio se único.',
                        },
                        content: {
                          type: Type.STRING,
                          description:
                            'Conteúdo formatado com <p>, <ul>, <li>, <strong>, etc.',
                        },
                        numbered: {
                          type: Type.BOOLEAN,
                          description:
                            'Verdadeiro se for subcláusula numerada (2.1, 2.2, etc.).',
                        },
                      },
                      required: ['content'],
                    },
                  },
                },
                required: ['titulo', 'items'],
              },
            },
            financialV3: {
              type: Type.OBJECT,
              description:
                'Camada de inteligência financeira desacoplada para gestão e métricas.',
              properties: {
                totalLabor: { type: Type.NUMBER },
                totalMaterials: { type: Type.NUMBER },
                grandTotal: { type: Type.NUMBER },
                paymentConditions: { type: Type.STRING },
                deadline: { type: Type.STRING },
                warranty: { type: Type.STRING },
                servicesBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: {
                        type: Type.STRING,
                        description: 'Nome do serviço/etapa',
                      },
                      value: {
                        type: Type.NUMBER,
                        description: 'Valor numérico em Reais',
                      },
                      type: {
                        type: Type.STRING,
                        description: 'mao_de_obra, material ou misto',
                      },
                      description: { type: Type.STRING },
                      area_m2: { type: Type.NUMBER },
                      deadline_days: { type: Type.NUMBER },
                    },
                    required: ['name', 'value'],
                  },
                },
                paymentSchedule: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stage: { type: Type.STRING },
                      percentage: { type: Type.NUMBER },
                      value: { type: Type.NUMBER },
                    },
                    required: ['stage', 'value'],
                  },
                },
              },
              required: ['grandTotal'],
            },
            financialV2: {
              type: Type.OBJECT,
              description: 'Retrocompatibilidade V2',
              properties: {
                totalLabor: { type: Type.NUMBER },
                totalMaterials: { type: Type.NUMBER },
                grandTotal: { type: Type.NUMBER },
                paymentConditions: { type: Type.STRING },
                deadline: { type: Type.STRING },
                warranty: { type: Type.STRING },
                categories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      categoryLabel: { type: Type.STRING },
                      laborValue: { type: Type.NUMBER },
                      materialsValue: { type: Type.NUMBER },
                      totalValue: { type: Type.NUMBER },
                      description: { type: Type.STRING },
                    },
                    required: ['category', 'categoryLabel', 'totalValue'],
                  },
                },
              },
            },
          },
          required: ['documentTitle', 'services', 'financialV3'],
        },
      };

      if (modelName.startsWith('gemini-3')) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      }

      return await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Extraia integral e literalmente todos os dados do seguinte orçamento para o JSON especificado, sem resumir, sem cortar texto, mantendo 100% de todas as cláusulas e sem inventar nada:\n\n${text}`,
              },
            ],
          },
        ],
        config,
      });
    };

    // Priorizamos modelos com alta estabilidade e taxa de sucesso
    let response;
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-3.1-flash-lite',
    ];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Iniciando extração com ${modelName}...`);
        response = await tryGenerate(modelName);
        if (response && response.text && response.text.trim().length > 0) {
          console.log(`Sucesso na extração com ${modelName}!`);
          break;
        }
      } catch (err: any) {
        console.warn(
          `Tentativa com ${modelName} falhou (${err.message}). Tentando próximo modelo...`,
        );
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw (
        lastError ||
        new Error('Não foi possível obter resposta dos modelos do Gemini.')
      );
    }

    const rawJson = response.text?.trim() || '{}';
    const parsedData = JSON.parse(rawJson);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error(
      'Erro na extração de orçamento via Gemini (Next.js route):',
      error,
    );
    return NextResponse.json(
      { error: error.message || 'Falha ao processar orçamento com IA.' },
      { status: 500 },
    );
  }
}
