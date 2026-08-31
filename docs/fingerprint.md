# FINGERPRINT - EVOLUÇÃO TÉCNICA E ESTRUTURA DO SISTEMA (ELÉTRICA&ART)

Este documento registra os marcos arquiteturais, estruturas de dados e versionamento do sistema de orçamentos, garantindo rastreabilidade, integridade documental e retrocompatibilidade histórica.

---

## 📌 Linha do Tempo e Marcos de Versionamento

```
[ V1 - Legado Inicial ] ──────► [ V2 - Ponto de Restauração ] ──────► [ V3 - Arquitetura Desacoplada (Atual) ]
• Estrutura simples              • Integração Supabase / EA JSON       • Extração 100% fiel de cláusulas (1..N)
• Financial: labor/materials     • Categorias & Condições no JSON     • Camada de Inteligência de Negócio (BI)
• Cláusulas rígidas              • Geração por IA (Primeira fase)      • Retrocompatibilidade N-gerações
```

---

## 1. Versão 1: Legado Inicial (V1)

- **Período**: Versão fundacional.
- **Modelo de Dados**:
  - `financial`: `{ labor: number, materials: number, discount: number, total: number }`
  - `services`: Lista simplificada de itens ou serviços em bloco único.
- **Características**:
  - Focado apenas no valor final e na impressão direta.
  - Baixa granularidade para relatórios ou separação por disciplina técnica (elétrica, pintura, gesso).

---

## 2. Versão 2: Ponto de Restauração Atual (V2)

- **Período**: 31 de Agosto de 2026 (Snapshot de Referência).
- **Modelo de Dados**:
  - `financial_json` / `financial`:
    ```json
    {
      "total": 20500.0,
      "categories": [
        { "name": "Gesso Drywall", "value": 12000.0 },
        { "name": "Pintura", "value": 4500.0 },
        { "name": "Elétrica", "value": 4000.0 }
      ],
      "paymentConditions": "50% entrada / 50% entrega",
      "deadline": "20 dias corridos",
      "warranty": "3 meses sobre mão de obra"
    }
    ```
  - `services`: Array hierárquico `[ { titulo: string, itens: [ { subtitulo, detalhes: [...] } ] } ]`.
- **Comportamento Observado**:
  - Extração perfeita em documentos extensos como `Eao.txt` (23 cláusulas).
  - Em orçamentos como `oc.txt` e `Or.txt`, as cláusulas comerciais (Investimento, Resumo, Prazos) eram consumidas pelo objeto financeiro e omitidas do corpo textual.

---

## 3. Versão 3: Arquitetura Desacoplada e Inteligente (V3)

- **Objetivo**: Extração literal e íntegra de 100% das cláusulas textuais (1 a N) + Motor de Business Intelligence independente.
- **Estrutura de Identificação**: `schema_version: "v3"`
- **Camadas de Separação**:
  1. **Camada Contratual / Textual (`services`)**:
     - Preserva todas as seções (Objetivo, Escopos Técnicos, Investimento, Condições, Garantias, Considerações, etc.) exatamente como redigidas.
  2. **Camada Analítica / Gestão (`business_financial`)**:
     - Entidade estruturada com disciplinas técnicas, tipo de fornecimento (mão de obra vs. material), prazos e cronograma de fluxo de caixa para alimentar dashboards e métricas gerenciais.
