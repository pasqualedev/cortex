# Fonte de Dados

## Base Inicial

O Cortex utilizará como fonte principal de questões a API ENEM.

Objetivos:

- Reduzir tempo de desenvolvimento do MVP
- Evitar construção manual de banco de questões
- Permitir foco na experiência do produto
- Validar a proposta de valor antes de investir em conteúdo próprio

---

## Arquitetura de Importação

A API não será consumida diretamente pelos usuários.

Fluxo:

text API ENEM ↓ Job de Importação ↓ PostgreSQL ↓ Cortex

---

## Estratégia

Durante o processo de importação, os dados serão normalizados e enriquecidos.

Exemplo:

json { "externalId": "enem-2023-142", "year": 2023, "area": "Matemática", "statement": "...", "alternatives": [], "correctAnswer": "B" }

---

## Enriquecimento de Dados

A API fornece:

- Ano
- Área
- Enunciado
- Alternativas
- Gabarito
- Imagens

O Cortex adicionará:

- Tópico
- Subtópico
- Dificuldade
- Atributos Cognitivos
- Estatísticas de uso
- Estatísticas de acerto

Exemplo:

json { "topic": "Probabilidade", "subtopic": "Probabilidade Condicional", "difficulty": 4, "cognitiveAttributes": [ "logic", "memory" ] }

---

## Ativos Estratégicos do Cortex

A API ENEM não é o diferencial do produto.

O diferencial será:

1. Taxonomia de tópicos
2. Modelo cognitivo
3. Sistema de progressão
4. Dados de desempenho dos usuários
5. Experiência gamificada

O banco de questões é apenas a matéria-prima.

O verdadeiro ativo do Cortex é a inteligência construída sobre essas questões.
::: Aliás, olhando como fundador de produto, eu diria que sua ordem correta de construção deveria ser: text

1. Importador API ENEM
2. Banco PostgreSQL
3. Classificação por tópicos
4. API própria
5. Frontend Next.js
6. Gamificação
7. Modelo Cognitivo
   Porque o ativo mais valioso que você vai construir não é o app. É a camada que transforma: text
   Questão ENEM 2023
   em text
   Probabilidade
   ↓
   Lógica
   ↓
   Dificuldade 4
   ↓
   Impacta Memória

```

Essa camada ninguém consegue copiar simplesmente consumindo a mesma API que você. Ela vira o "motor" do Cortex.
```
