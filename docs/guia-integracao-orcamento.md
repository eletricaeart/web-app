# Guia de Integração da Calculadora Drywall com o Módulo de Orçamentos

## Objetivo

Permitir que o usuário converta a lista de materiais calculada em um orçamento financeiro (proposta comercial) dentro do sistema, com valores unitários e totais.

## Pré-requisitos

- O sistema deve ter um módulo de orçamentos com:
  - Tabela de produtos/serviços com preço unitário.
  - Possibilidade de criar um novo orçamento associado a um cliente.
  - Campos: descrição, quantidade, unidade, preço unitário, total.

## Passos para Integração

### 1. Estrutura de Dados

Os materiais gerados pela calculadora têm o formato:

```ts
{
  item: string;
  qtd: number;
  unit: string;
}
```
