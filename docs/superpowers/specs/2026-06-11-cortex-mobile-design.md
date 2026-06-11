# CORTEX — Documentação Completa de Produto e Arquitetura

**Versão**: 1.0 — MVP Mobile  
**Data**: 2026-06-11  
**Status**: Pronto para implementação

---

## Sumário

1. [Visão do Produto](#1-visão-do-produto)
2. [Proposta de Valor](#2-proposta-de-valor)
3. [Personas](#3-personas)
4. [UX — Especificação Completa](#4-ux--especificação-completa)
5. [Fluxos de Usuário](#5-fluxos-de-usuário)
6. [Arquitetura Técnica](#6-arquitetura-técnica)
7. [Modelagem de Domínio](#7-modelagem-de-domínio)
8. [Banco de Dados](#8-banco-de-dados)
9. [API — Especificação Completa](#9-api--especificação-completa)
10. [Design System](#10-design-system)
11. [Gamificação](#11-gamificação)
12. [Modelo Cognitivo](#12-modelo-cognitivo)
13. [Roadmap](#13-roadmap)
14. [Métricas e Critérios de Validação](#14-métricas-e-critérios-de-validação)

---

## 1. Visão do Produto

### O que é o Cortex

Cortex é um aplicativo mobile de estudos focado no ENEM que transforma a preparação para o exame em uma jornada de evolução cognitiva visível. Diferente de bancos de questões tradicionais, o Cortex usa uma metáfora central poderosa: **seu cérebro como entidade viva que se fortalece com cada questão respondida**.

O usuário não está "fazendo provas". Ele está **fortalecendo atributos do seu cérebro**.

### Missão

Tornar a evolução do estudante tão visível e motivante que ele queira voltar todos os dias.

### Visão

Ser o aplicativo de estudos mais retentivo do Brasil, onde cada sessão deixa o usuário com a certeza clara de que ficou mais capaz.

### Princípios Invioláveis

1. **30 segundos**: Do abrir o app à primeira questão em menos de 30 segundos.
2. **Uma ação principal**: Sempre existe uma única CTA óbvia em cada tela.
3. **Zero ambiguidade**: O usuário nunca se pergunta o que fazer a seguir.
4. **Sensação de força**: Cada sessão deve terminar com a sensação "meu cérebro ficou mais forte".
5. **Jornada, não tarefa**: Estudar parece progressão, não obrigação.
6. **Sem IA no MVP**: Toda a lógica é determinística e auditável.
7. **Sem flashcards no MVP**: Foco exclusivo em questões objetivas ENEM.

### Contexto: o MVP Web como Protótipo

Um protótipo web em Next.js foi desenvolvido e concluído (23 tarefas, todas verificadas). Ele validou o core loop — sessão de desafio, XP, streak, Brain Status com Energia Neural e Memória de Longo Prazo. O Cortex mobile é o produto real: nova stack (Expo + Fastify), modelo cognitivo expandido para 5 atributos, e experiência nativa.

---

## 2. Proposta de Valor

### O Problema

Estudantes têm acesso a conteúdo de sobra (PDFs, vídeos, bancos de questões, apps), mas carecem de **visibilidade sobre sua própria evolução**. As perguntas que ficam sem resposta:

- "Estou realmente melhorando?"
- "Em que área cognitiva sou mais fraco?"
- "Vale a pena continuar estudando hoje?"
- "Por que não consigo manter a consistência?"

Apps tradicionais respondem com "você acertou 67% de Matemática". O Cortex responde com "+2 Lógica, +1 Raciocínio Científico. Seu cérebro está mais forte."

### Diferenciação Direta

| Dimensão | Apps Tradicionais | Cortex |
|----------|------------------|--------|
| Unidade de progresso | % por matéria | Atributos cognitivos |
| Metáfora de estudo | Fazer prova | Fortalecer o cérebro |
| Feedback por questão | "Certo/Errado" | "+2 Lógica, +1 Memória" |
| Visualização | Tabelas, rankings | Brain Status visual |
| Motivação | Externo (ranking) | Interno (evolução pessoal) |
| Onboarding | Criar conta → questões | Criar conta → Meta → Missão |

### Proposta Única

> "O único app de estudos que mostra como cada questão do ENEM fortalece seu cérebro."

---

## 3. Personas

### Persona 1 — Lucas Ferreira, "O Vestibulandão"

- **Idade**: 17 anos, 3º ano do Ensino Médio
- **Rotina**: Estuda 1-2h/dia, inconsistente. Passa 4h/dia em redes sociais.
- **Dispositivo**: iPhone 12 (celular principal). Raramente usa computador para estudar.
- **Frustrações**: "Eu estudo muito mas não sei se estou melhorando de verdade."
- **Motivadores**: Conquistas visíveis, comparação com seu próprio progresso, streaks.
- **Comportamento em apps**: Sessões curtas (15-25 min), abandona apps sem feedback claro.
- **Job to be Done**: "Quero ter certeza de que o tempo que invisto está me tornando melhor."
- **Medo profundo**: Chegar ao ENEM sem preparo suficiente e desperdiçar o ano.
- **Como o Cortex ajuda**: Mostra evolução diária clara. Streak cria hábito. Brain Status responde "sim, você está melhorando."

### Persona 2 — Mariana Costa, "A Segunda Tentativa"

- **Idade**: 21 anos, trabalha meio período como auxiliar administrativa.
- **Rotina**: 45 min antes do trabalho + 30 min à noite. Tempo é recurso escasso.
- **Dispositivo**: Android mid-range (Moto G, 6GB RAM).
- **Frustrações**: "Já tentei 3 apps de estudos. Parei de usar todos após 2 semanas. São chatos."
- **Motivadores**: Progresso tangível, ausência de desperdício de tempo, metas claras.
- **Comportamento**: Precisa ver resultado do investimento de tempo para continuar.
- **Job to be Done**: "Quero um app que me prove que vale a pena abrir ele amanhã."
- **Medo profundo**: Desistir de novo e perder mais um ano.
- **Como o Cortex ajuda**: Sessões curtas (5-10 min). Feedback imediato por questão. Evolução visível mesmo com pouco tempo.

### Persona 3 — Rafael Oliveira, "O Competitivo"

- **Idade**: 19 anos, cursinho período integral, meta: medicina.
- **Rotina**: 6-8h de estudo/dia. Usa 3-5 ferramentas em paralelo.
- **Dispositivo**: iPhone 14 Pro + iPad.
- **Frustrações**: "Nenhum app me mostra onde sou mais fraco cognitivamente, só por matéria."
- **Motivadores**: Dados granulares, gráficos de evolução, domínio profundo por área.
- **Comportamento**: Power user. Quer ver histórico, tendências, comparar sessões.
- **Job to be Done**: "Quero identificar com precisão quais habilidades cognitivas preciso desenvolver."
- **Medo profundo**: Não conseguir a nota de corte para o curso que quer.
- **Como o Cortex ajuda**: Atributos cognitivos por área ENEM. Histórico e gráficos na tela de Progresso. Achados acionáveis, não só números.

---

## 4. UX — Especificação Completa

### Filosofia de Design: Clareza Neural

A experiência Cortex é governada por um princípio central: **em cada momento, o usuário sabe exatamente o que está acontecendo e o que fazer a seguir**. Sem menus escondidos, sem ambiguidade, sem cognitive load desnecessário.

Inspirações aplicadas (conceito, não cópia visual):
- **Duolingo**: Uma única CTA principal. Progresso sempre visível. Loop de sessão claro.
- **Headspace**: Interface limpa. Espaço em branco como elemento de design.
- **Habitica**: Gamificação com contexto narrativo. Cada ação tem peso e significado.
- **Steam Achievements**: Conquistas como momentos memoráveis, não só pontuações.

### Arquitetura de Informação

```
Cortex
├── (auth) — não autenticado
│   ├── Splash Screen
│   ├── Onboarding (T1, T2, T3)
│   ├── Login
│   └── Register
│
└── (app) — autenticado
    ├── Home [tab]
    │   ├── Brain Status
    │   ├── Streak
    │   ├── Nota Estimada
    │   └── CTA: Começar Desafio
    │
    ├── Desafio [flow, sem tabs]
    │   ├── Questão (1..N)
    │   ├── Feedback por questão
    │   └── Resultado da Sessão
    │
    ├── Progresso [tab]
    │   ├── Gráfico de Nota Estimada
    │   ├── Atributos Cognitivos (expandíveis)
    │   ├── Histórico de Sessões
    │   └── Conquistas (grid)
    │
    └── Perfil [tab]
        ├── Dados do usuário
        ├── Meta ENEM
        ├── Estatísticas gerais
        └── Sair
```

### Navegação Global

Bottom Tab Bar com 3 abas (MVP):

| Aba | Ícone | Rota |
|-----|-------|------|
| Home | cérebro (brain-outline) | `/` |
| Progresso | gráfico (analytics-outline) | `/progresso` |
| Perfil | pessoa (person-outline) | `/perfil` |

Durante a sessão de desafio, a Bottom Tab Bar é **ocultada**. O usuário está em modo imersivo.

### Estados Universais

Todo componente ou tela que carrega dados assíncronos deve implementar:

**Loading (Skeleton)**: Skeleton screens com mesmas dimensões do conteúdo final. Nunca spinners centralizados. Usar `animate-pulse` em `bg-zinc-800`.

**Erro**: Card com ícone de aviso, mensagem humanizada em PT-BR ("Algo deu errado. Tente novamente.") e botão "Tentar novamente" que dispara o retry.

**Vazio**: Ilustração simples + texto descritivo + CTA contextual. Ex: tela de Progresso sem histórico → "Sua primeira sessão desbloqueará sua evolução. Começar agora →"

**Sucesso**: Feedback visual imediato via mudança de cor ou microanimação. Nunca toast para ações críticas — o estado da tela muda.

### Microinterações

| Interação | Comportamento | Duração |
|-----------|--------------|---------|
| Toque em alternativa | Highlight instantâneo + borda indigo | 0ms |
| Confirmar resposta | Loading state no botão | 200ms max |
| Feedback slide-up | Overlay sobe do bottom | 300ms ease-out |
| Transição entre questões | Fade out/in do conteúdo | 150ms |
| Progress bar | Preenchimento suave | 400ms ease-in-out |
| XP counter | Número incrementa animado | 600ms |
| Streak pulse | Pulse sutil no emoji 🔥 | 800ms, 1x |
| Achievement unlock | Scale + fade in do card | 400ms |

### Hierarquia Visual (por tela)

Regra: **Métrica Principal → CTA → Informações Secundárias**

- Home: Brain Status → COMEÇAR DESAFIO → métricas de rodapé
- Questão: Enunciado → Alternativas → Confirmar
- Feedback: Resultado (✅/❌) → XP ganho → Impacto cognitivo → Próxima
- Resultado: XP total → Corretas/Incorretas → Evolução cognitiva → CTAs

---

## 5. Telas Detalhadas

### Splash Screen

**Objetivo**: Transmitir identidade Cortex em 2 segundos enquanto carrega autenticação em background.

**Layout**:
- Fundo: `bg-zinc-950` (tela inteira, sem status bar customizada)
- Logo: símbolo abstrato de rede neural (SVG de linhas finas, não clipart) centralizado
- Logotipo "CORTEX" abaixo do símbolo, `text-zinc-100`, `font-bold`, `tracking-widest`
- Tagline: "Fortaleça seu cérebro" em `text-zinc-500`, `text-sm`

**Animação**:
1. Logo: `fade-in` 400ms
2. Logotipo: `slide-up` + `fade-in`, 300ms, delay 150ms
3. Tagline: `fade-in`, 250ms, delay 350ms

**Transição**: fade para Onboarding T1 (novo usuário) ou Home (retornante).

---

### Onboarding — Tela 1: Boas-vindas

**Objetivo**: Primeiro impacto emocional com a metáfora cognitiva.

**Layout** (full-screen, sem bottom tabs, sem header):
- Fundo: `bg-zinc-950`
- Hero SVG: rede neural abstrata (pontos conectados por linhas finas `stroke-indigo-500/40`), ocupa 45% da altura da tela
- Título: "Seu cérebro está pronto para evoluir" — `text-2xl`, `font-bold`, `text-zinc-100`, `text-center`
- Subtítulo: "Cada questão do ENEM fortalece capacidades reais do seu cérebro." — `text-base`, `text-zinc-400`, `text-center`, `px-8`
- CTA: Botão "Começar" — `bg-indigo-500`, `text-white`, `font-bold`, `h-14`, `w-full`, `rounded-xl`
- Indicador de progresso: 3 pontos no rodapé (`• ○ ○`), `text-zinc-600` / `text-indigo-500`

**Tom**: Inspirador, científico mas acessível. Nunca místico ou intimidador.

---

### Onboarding — Tela 2: O Conceito

**Objetivo**: Explicar o modelo de atributos cognitivos de forma simples e visual.

**Layout**:
- Título: "Você não está fazendo questões" — `text-2xl`, `font-bold`, `text-zinc-100`
- Subtítulo: "Você está fortalecendo atributos do seu cérebro." — `text-zinc-400`
- Lista dos 5 atributos (cada item é um mini-card `bg-zinc-900 border-zinc-800`):
  - Ícone (ionicons) + nome + barra de progresso em 0% com label "Bloqueado"
  - 🧠 Energia Neural — `text-indigo-400`
  - 🔵 Memória de Longo Prazo — `text-violet-400`
  - ⚡ Lógica — `text-blue-400`
  - 📖 Interpretação — `text-emerald-400`
  - 🔬 Raciocínio Científico — `text-rose-400`
- CTA: "Entendi" — botão primário
- Link: "Pular" — `text-zinc-500`, `text-sm`, link acima ou abaixo do botão
- Indicador: `(○ • ○)`

---

### Onboarding — Tela 3: Sua Meta

**Objetivo**: Capturar meta ENEM para personalizar a nota estimada.

**Layout**:
- Título: "Qual é a sua meta no ENEM?" — `text-2xl`, `font-bold`
- Subtítulo: "Calculamos seu progresso em direção a essa nota." — `text-zinc-400`
- Grid 2 colunas de opções de seleção (style: card com borda):
  - `bg-zinc-900 border-2 border-zinc-800 rounded-xl p-4` (estado normal)
  - `border-indigo-500 bg-indigo-500/10` (estado selecionado)
  - Opções: 500, 600, 700, 800, 900+
  - (5ª opção ocupa a linha inteira)
- CTA: "Continuar" — desabilitado (`opacity-50`) até seleção; ativa ao selecionar
- Nota de rodapé: "Você pode ajustar sua meta depois." — `text-zinc-600`, `text-xs`
- Indicador: `(○ ○ •)`

---

### Login / Cadastro

**Objetivo**: Autenticar com mínimo de atrito.

**Layout** (sem bottom tabs):
- Cabeçalho: Logo pequeno + "Entrar no Cortex"
- Subtítulo: "Continue sua jornada de evolução."
- Botão Google: `bg-zinc-800 border border-zinc-700`, ícone Google SVG + "Continuar com Google", `h-14`, `rounded-xl`, full-width
- Divisor: linha `bg-zinc-800` + "ou" centralizado em `text-zinc-600`
- Campo Email: `bg-zinc-900 border border-zinc-800`, label acima, placeholder "seu@email.com"
- Campo Senha: idem, com botão toggle show/hide (ícone ionicons)
- Botão "Entrar": `bg-indigo-500`, primário, full-width
- Link alternância: "Não tem conta? **Cadastre-se**" (ou inverso)

**Cadastro**: adiciona campo "Nome completo" antes do email.

**Validação**: erros aparecem inline sob o campo específico, em `text-red-400 text-sm`. Nunca toast global para erros de formulário.

**Estado de loading**: botão principal mostra spinner branco enquanto processa.

---

### Home (Tela Principal)

**Objetivo**: Único ponto de ação — iniciar um desafio. Tudo mais é contexto motivacional.

**Layout** (`ScrollView` vertical, `px-4`, `pt-safe`):

#### Seção 1 — Saudação e Streak
```
Olá, Lucas 👋                              🔥 17 dias
```
- Nome: `text-zinc-400`, `text-sm`
- Streak: `text-amber-400`, `font-bold`, alinhado à direita

#### Seção 2 — Brain Status Card
Card `bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-4`:

```
🧠 Seu Cérebro                          Nível 5
                     650 pts
               estimativa ENEM
─────────────────────────────────────────
Energia Neural                          63%
[████████████████░░░░░░░░░░░░░░░░░░░░]

Memória de Longo Prazo                  70%
[██████████████████████░░░░░░░░░░░░░░]

Lógica                                  82%
[██████████████████████████░░░░░░░░░░]

Interpretação                           61%
[███████████████████░░░░░░░░░░░░░░░░░]

Raciocínio Científico                   45%
[██████████████░░░░░░░░░░░░░░░░░░░░░░]
```

Cores das barras por atributo:
- Energia Neural: `bg-indigo-500`
- Memória de Longo Prazo: `bg-violet-500`
- Lógica: `bg-blue-500`
- Interpretação: `bg-emerald-500`
- Raciocínio Científico: `bg-rose-500`

Todos os tracks: `bg-zinc-800`, `h-2`, `rounded-full`.

#### Seção 3 — CTA Principal
```
[        COMEÇAR DESAFIO        ]
     10 questões · ~5 minutos
```
- Botão: `bg-indigo-500`, `h-14`, full-width, `rounded-xl`, `font-bold`, `text-base`, `tracking-wide`
- Subtexto: `text-zinc-500`, `text-sm`, `text-center`, `mt-2`
- Espaçamento: `mt-6`

#### Seção 4 — Métricas Rápidas
Row de 3 colunas `bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-4`:
```
   1.240 XP      |    127 Q.    |   68% Acertos
   Total XP      |  Respondidas |
```
- Valores: `text-zinc-100`, `font-bold`, `text-base`
- Labels: `text-zinc-500`, `text-xs`

**Estado Vazio (primeiro acesso)**:
- Brain Status: todos os atributos em 0%, nota estimada exibe "—"
- Abaixo do CTA: card `bg-zinc-900 border-zinc-800` com mensagem "Responda seu primeiro desafio para despertar seu cérebro 🧠"

---

### Tela de Desafio — Questão

**Layout** (`SafeAreaView`, sem Bottom Tab Bar durante desafio):

#### Header
```
[✕]    Questão 3 de 10         +30 XP
```
- Botão X: `text-zinc-400`, ativa modal de confirmação de saída
- Label: `text-zinc-400`, `text-sm`, centralizado
- XP sessão: `text-indigo-400`, `text-sm`, alinhado à direita

#### Barra de Progresso Linear
`bg-zinc-800 h-1 rounded-full` — track  
`bg-indigo-500 rounded-full` — fill, animação suave ao avançar  
Posicionada imediatamente abaixo do header.

#### Conteúdo da Questão (`ScrollView`)
- Chips de contexto: "Matemática" + "ENEM 2023" — `bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full`, flex-row gap-2, `mt-4`
- Enunciado: `text-base text-zinc-100 leading-relaxed mt-4`
- Imagem (se existir): `rounded-lg border border-zinc-800 mt-4`, `resizeMode: contain`
- Espaçamento antes das alternativas: `mt-6`

#### Alternativas (lista A–E)
Cada alternativa é um card tocável:
```
bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3
flex-row items-start gap-3
```
- Letra: `bg-zinc-800 rounded-lg w-8 h-8 items-center justify-center text-zinc-400 font-bold text-sm`
- Texto: `flex-1 text-zinc-300 text-sm leading-relaxed`

**Estado selecionado**:
- Container: `border-indigo-500 bg-indigo-500/10`
- Letra: `bg-indigo-500 text-white`
- Texto: `text-zinc-100`

Tap seleciona imediatamente. Não há submit duplo — a seleção é visual e o botão CONFIRMAR efetiva.

#### Rodapé Fixo
- Botão "CONFIRMAR": `bg-indigo-500 h-14 rounded-xl font-bold` full-width
- Desabilitado (`opacity-50 pointer-events-none`) até alternativa selecionada

---

### Tela de Desafio — Feedback Correto

**Overlay inferior** (slide-up, `bg-zinc-900 border-t border-zinc-800`, altura ~300px):

```
✅  Correto!                            +10 XP

      [ +2 Lógica ]  [ +1 Memória ]

  "Questões de geometria analítica
   reforçam o raciocínio espacial."

          [    PRÓXIMA    ]
```

- "Correto!": `text-emerald-400 text-lg font-bold`
- "+10 XP": `text-indigo-400 text-2xl font-bold`
- Chips cognitivos: `bg-[cor-atributo]/20 text-[cor-atributo]-300 border border-[cor-atributo]/30 rounded-full px-3 py-1 text-sm`
- Explicação (opcional, max 2 linhas): `text-zinc-400 text-sm leading-relaxed mt-3`
- Botão "PRÓXIMA": `bg-indigo-500 h-12 rounded-xl font-bold` full-width

---

### Tela de Desafio — Feedback Incorreto

Mesmo overlay, variante de erro:

```
❌  Incorreto

  Resposta correta:
  [B] "O volume de um cubo de lado 3 é 27 cm³"

                 +3 XP

          [    PRÓXIMA    ]
```

- "Incorreto": `text-red-400 text-lg font-bold`
- Card de resposta correta: `bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3`
- "+3 XP": `text-zinc-500 text-lg`
- Botão "PRÓXIMA": `bg-zinc-800 border border-zinc-700 h-12 rounded-xl` (destaque reduzido intencionalmente)

---

### Tela de Resultado (Fim de Sessão)

**Layout** (full-screen, sem Bottom Tab Bar):

#### Header
"Sessão Completa! 🧠" — `text-2xl font-bold text-zinc-100 text-center mt-8`

#### Card de Desempenho
`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6 mx-4`:
```
          +135 XP
     ─────────────────
   ✅ Corretas   8 / 10
   ❌ Incorretas 2 / 10
   ⏱️ Tempo      4:32
```
- XP ganho: `text-4xl font-bold text-indigo-400 text-center`
- Métricas: row com ícone + label + valor, `text-zinc-300`

#### Card de Evolução Cognitiva
`bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mt-4 mx-4`:
- Título: "Evolução desta sessão" — `text-zinc-400 text-sm font-medium`
- Lista de atributos impactados (apenas os que mudaram ≥ 0.5%):
  ```
  ⚡ Lógica            +1.8%   →  83.8%
  📖 Interpretação     +0.6%   →  61.6%
  ```
- Cada linha: ícone + nome (`text-zinc-300`) + delta (`text-emerald-400 font-bold`) + novo valor (`text-zinc-500 text-sm`)

#### Card de Streak (condicional)
Exibido se o usuário manteve ou aumentou o streak:
`bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mt-4 mx-4`:
"🔥 Streak mantido! **17 dias** consecutivos"

#### Card de Achievement (condicional)
Exibido se alguma conquista foi desbloqueada nesta sessão:
`bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mt-4 mx-4`:
"🏆 Conquista desbloqueada: **Semana Perfeita**"

#### CTAs
```
[        NOVO DESAFIO        ]   ← bg-indigo-500
[        Ver Progresso       ]   ← bg-zinc-800
```
Ambos full-width, empilhados verticalmente, `mx-4 mb-8`.

---

### Tela de Progresso

**Layout** (ScrollView, Bottom Tab aba 2):

#### Seção 1 — Nota Estimada no Tempo
- Título: "Nota Estimada" — `text-zinc-100 font-bold text-lg`
- Gráfico de linha (últimos 30 dias): biblioteca `react-native-svg` + wrapper customizado
  - Y: 300–1000, X: datas
  - Linha: `stroke-indigo-500 stroke-width-2`
  - Background grid: linhas horizontais `stroke-zinc-800`
  - Ponto atual: círculo `fill-indigo-500`
- Seletor de período: "7d / 30d / 90d" — tabs pequenas

#### Seção 2 — Atributos Cognitivos
Cada atributo em card expansível `bg-zinc-900 border-zinc-800 rounded-xl`:
- Header do card: ícone + nome + valor atual % + chevron
- Expandido: mini-gráfico 7 dias + label "Área ENEM: [nome]" + dica de melhoria

#### Seção 3 — Histórico de Sessões
Lista vertical de sessões (mais recente primeiro):
```
bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3
[data/hora]          [8/10 ✅]  +135 XP
Matemática, Linguagens
```

#### Seção 4 — Conquistas
Grid 3 colunas de badges:
- Desbloqueada: cor completa + nome + data
- Bloqueada: `opacity-40` + "???" + progresso: "7/30 dias"

---

### Tela de Perfil

**Layout** (ScrollView, Bottom Tab aba 3):

- Avatar (inicial do nome, `bg-indigo-500/30 text-indigo-400`, circular, 64px) + Nome + email
- Nível atual: "Nível 5 — Córtex" com barra de XP até próximo nível
- Meta: card `bg-zinc-900` com "Meta: 700 pontos ENEM" + botão "Editar" (abre bottom sheet)
- Estatísticas: XP total, total de questões, maior streak, sessões completas
- Botão "Sair": `text-red-400`, ao fundo da tela, com confirmação modal

---

## 5. Fluxos de Usuário

### Fluxo 1 — Novo Usuário (Primeiro Acesso)

```
Instala o app
  ↓
Splash Screen (2s, carrega sessão em background)
  ↓
Onboarding T1 — Boas-vindas
  ↓ [tap "Começar"]
Onboarding T2 — Conceito Cognitivo
  ↓ [tap "Entendi"]
Onboarding T3 — Definir Meta
  ↓ [seleciona meta + tap "Continuar"]
Login / Cadastro
  ↓ [Google OAuth ou email+senha]
Home (Brain Status: todos 0%, nota "—")
  ↓ [card informativo: "Primeiro desafio desbloqueia seu cérebro"]
  ↓ [tap "COMEÇAR DESAFIO"]
Desafio — Q1
  ↓ ... × 10 questões
Resultado (primeira evolução cognitiva visível)
  ↓ [tap "NOVO DESAFIO" ou "Ver Progresso"]
```

### Fluxo 2 — Usuário Retornante (Uso Diário)

```
Abre o app (push notification ou orgânico)
  ↓
Splash (carrega sessão: já autenticado)
  ↓
Home (Brain Status atualizado, streak incrementado)
  ↓ [tap "COMEÇAR DESAFIO"]
Desafio — Q1 / 10
  ↓ [seleciona alternativa + CONFIRMAR]
Feedback (acerto: ✅ +10 XP +2 Lógica / erro: ❌ +3 XP resposta correta)
  ↓ [tap "PRÓXIMA"]
... questões 2–10
  ↓
Resultado da Sessão
  ↓ [tap "NOVO DESAFIO" → nova sessão] ou [tap "Ver Progresso"]
```

### Fluxo 3 — Abandono de Sessão

```
Durante o Desafio
  ↓ [tap X no header]
Modal: "Sair do desafio?"
  "Seu progresso nesta sessão será perdido."
  [Cancelar]  [Sair]
  ↓ [Cancelar] → volta ao desafio, mesma questão
  ↓ [Sair] → Home, sessão não salva, XP não computado
```

### Fluxo 4 — Consulta de Progresso

```
Home
  ↓ [tap tab "Progresso"]
Tela de Progresso
  ↓ [seleciona período 30d]
Gráfico de nota estimada
  ↓ [expande atributo "Lógica"]
Mini-gráfico + área ENEM + dica
  ↓ [tap em sessão no histórico]
Detalhe da sessão (questões, acertos, XP)
```

### Fluxo 5 — Desbloqueio de Conquista

```
Durante o Resultado da Sessão
  → Sistema detecta critério atendido (ex: 7 dias streak)
  → Card "Achievement Unlocked" aparece no Resultado
  → Animação de entrada (scale + fade)
  → Botão "Ver todas as conquistas" no card → Tela de Progresso > Conquistas
```

---

## 6. Arquitetura Técnica

### Diagrama de Sistema

```
┌─────────────────────────────────────┐
│        Expo / React Native          │
│  (iOS + Android via EAS Build)      │
│                                     │
│  Expo Router (file-based routing)   │
│  NativeWind (Tailwind para RN)      │
│  Zustand (estado local/sessão)      │
│  TanStack Query (server state)      │
│  Expo SecureStore (tokens JWT)      │
│  Expo Notifications (push)          │
└──────────────┬──────────────────────┘
               │ HTTPS / JWT Bearer
               ▼
┌─────────────────────────────────────┐
│         Fastify API Server          │
│         Node.js 20 + TypeScript     │
│                                     │
│  Fastify 4+                         │
│  Zod (validação de entrada)         │
│  JWT (access 15min + refresh 7d)    │
│  Prisma ORM                         │
│  bcryptjs (senhas)                  │
└──────────────┬──────────────────────┘
               │ Prisma Client
               ▼
┌─────────────────────────────────────┐
│         PostgreSQL 15               │
│         (VPS, Docker container)     │
└─────────────────────────────────────┘
               ▲
               │ script manual / cron
┌─────────────────────────────────────┐
│       Importer Script               │
│  (Node.js, importa da API ENEM,     │
│   enriquece e insere no DB)         │
└──────────────┬──────────────────────┘
               │ HTTP
               ▼
┌─────────────────────────────────────┐
│         API ENEM (externa)          │
│  Nunca consumida pelo app mobile    │
└─────────────────────────────────────┘
```

### Infraestrutura

- **VPS**: Ubuntu 22.04 LTS, 4 vCPU / 8GB RAM (mínimo MVP)
- **Docker Compose**: containers para API + PostgreSQL + Nginx
- **Cloudflare**: DNS + CDN + proxy reverso (SSL terminado na Cloudflare)
- **Nginx**: reverse proxy para Fastify (porta 3000 → 443)
- **CI/CD**: GitHub Actions → EAS Build (mobile) + SSH deploy (backend)

### Frontend Mobile — Estrutura de Diretórios

```
app/
  _layout.tsx                  # Root: providers (Query, Auth, Notifications)
  +not-found.tsx
  (auth)/
    _layout.tsx                # Redireciona autenticado → (app)
    index.tsx                  # Splash / decisão de rota
    onboarding.tsx             # Steps T1, T2, T3 em stack local
    login.tsx
    register.tsx
  (app)/
    _layout.tsx                # Auth guard + BottomTabBar
    index.tsx                  # Home
    progresso.tsx              # Progress screen
    perfil.tsx                 # Profile screen
    desafio/
      index.tsx                # Challenge session
      resultado.tsx            # Session result

components/
  brain-status/
    BrainStatus.tsx            # Card completo com 5 atributos
    AttributeBar.tsx           # Barra individual de atributo
  challenge/
    QuestionCard.tsx           # Enunciado + meta-info
    AnswerOption.tsx           # Alternativa tocável
    FeedbackOverlay.tsx        # Slide-up de acerto/erro
    SessionProgress.tsx        # Header + barra de progresso
  progress/
    EstimatedScoreChart.tsx    # Gráfico de linha (react-native-svg)
    CognitiveAttributeCard.tsx # Card expansível por atributo
    SessionHistoryItem.tsx     # Item de sessão no histórico
    AchievementGrid.tsx        # Grid de badges
  ui/
    Button.tsx
    Card.tsx
    Input.tsx
    Badge.tsx
    SkeletonLoader.tsx
    Modal.tsx                  # Confirmação de saída
    BottomSheet.tsx
  layout/
    SafeScreen.tsx             # SafeAreaView + bg-zinc-950

hooks/
  useDashboard.ts              # GET /dashboard
  useChallenge.ts              # GET /challenges/next + POST /answers
  useProgress.ts               # GET /brain/history + /achievements
  useProfile.ts                # GET + PATCH /users/me

stores/
  challenge.store.ts           # Zustand: questões, respostas, índice atual
  auth.store.ts                # Zustand: accessToken, user

lib/
  api/
    client.ts                  # axios instance + interceptor de refresh
    endpoints.ts               # constantes de URL
  auth/
    token.ts                   # SecureStore: read/write/delete tokens
    google.ts                  # Expo AuthSession config para Google
  utils/
    formatting.ts              # formatXP, formatPercent, formatDate
    cognitive.ts               # mapeamento atributo → cor/ícone

types/
  api.types.ts                 # Response shapes da API
  domain.types.ts              # Entidades de domínio

constants/
  cognitive-attributes.ts      # Definições dos 5 atributos
  colors.ts                    # Tokens do Design System
```

### Backend Fastify — Estrutura de Diretórios

```
src/
  server.ts                    # instância Fastify + plugins registrados
  config.ts                    # Zod: valida env vars ao iniciar
  routes/
    v1/
      index.ts                 # Agrega e registra todas as rotas
      auth.routes.ts
      users.routes.ts
      challenges.routes.ts
      answers.routes.ts
      brain.routes.ts
      dashboard.routes.ts
      achievements.routes.ts
  services/
    auth.service.ts            # register, login, google, refresh, logout
    challenge.service.ts       # buildChallengeSession, completeChallenge
    answer.service.ts          # submitAnswer, calculateXP, cognitiveImpact
    brain.service.ts           # updateBrainMetrics, takeSnapshot, getCurrent
    dashboard.service.ts       # getDashboardData
    achievement.service.ts     # checkAndUnlockAchievements
  repositories/
    user.repository.ts
    question.repository.ts
    answer.repository.ts
    brain.repository.ts
    achievement.repository.ts
  middleware/
    authenticate.ts            # hook Fastify: verifica JWT Bearer
    rateLimiter.ts             # @fastify/rate-limit config
  validators/
    auth.schema.ts             # Zod schemas para cada rota de auth
    challenge.schema.ts
    answer.schema.ts
    user.schema.ts
  utils/
    jwt.ts                     # sign, verify, refresh
    password.ts                # hash, compare (bcryptjs)
    cognitive.ts               # cálculo dos 5 atributos (fórmulas)
    streak.ts                  # updateStreak logic

prisma/
  schema.prisma
  migrations/
  seed.ts                      # seed de achievements e topics

scripts/
  import-enem.ts               # importa questões da API ENEM
```

---

## 7. Modelagem de Domínio

### Entidades

#### User
O estudante que usa o Cortex. Possui estado de jornada (XP, nível, streak).

Relacionamentos:
- `1:1` → Goal
- `1:1` → BrainMetrics
- `1:N` → BrainSnapshot
- `1:N` → Challenge
- `1:N` → Attempt
- `1:N` → UserAchievement
- `1:N` → Account (OAuth)

#### Goal
Meta de pontuação no ENEM definida no onboarding. Alterável pelo usuário.

Relacionamentos: `N:1` → User

#### Topic (Área ENEM)
Agrupa questões por grande área do ENEM. Cada Topic mapeia para um atributo cognitivo.

| Topic | CognitiveAttribute |
|-------|-------------------|
| Matemática | LOGICA |
| Ciências da Natureza | CIENCIAS |
| Linguagens e Códigos | INTERPRETACAO |
| Ciências Humanas | MEMORIA |
| (Global/todas) | ENERGIA_NEURAL |

Relacionamentos: `1:N` → SubTopic, `1:N` → Question

#### SubTopic
Disciplina ou tópico granular dentro de uma área.  
Exemplos: Álgebra, Geometria (dentro de Matemática), Física, Química, Biologia (dentro de Ciências da Natureza).

Relacionamentos: `N:1` → Topic, `1:N` → Question

#### Question
Questão importada da API ENEM, enriquecida com topicId e dificuldade.

Relacionamentos: `N:1` → Topic, `N:1` → SubTopic (opcional)

#### Challenge
Sessão de estudo (conjunto de 10 questões apresentado ao usuário). Um Challenge é criado ao iniciar o desafio e completado ao responder a 10ª questão.

Status: `ACTIVE` → `COMPLETED` ou `ABANDONED`

Relacionamentos: `N:1` → User, `1:N` → ChallengeQuestion, `1:N` → Attempt

#### ChallengeQuestion
Tabela de junção entre Challenge e Question, com a posição (1–10) da questão na sessão.

#### Attempt
Registro de uma resposta: qual alternativa o usuário escolheu, se acertou, XP ganho e impacto cognitivo calculado no momento da resposta.

`cognitiveImpact` é armazenado como JSON: `[{ attribute: "LOGICA", delta: 1.8 }]`

Relacionamentos: `N:1` → User, Question, Challenge

#### BrainMetrics
Estado atual dos 5 atributos cognitivos do usuário. Atualizado após cada Attempt. É a fonte de dados para o Brain Status na Home.

Relacionamentos: `1:1` → User

#### BrainSnapshot
Foto periódica (1×/dia ou após cada sessão) do estado cognitivo. Fonte do gráfico histórico na tela de Progresso.

Relacionamentos: `N:1` → User

#### Achievement
Catálogo global de conquistas disponíveis (seed de dados). Contém critério e threshold.

#### UserAchievement
Registro de quando um usuário desbloqueou uma conquista específica.

Relacionamentos: `N:1` → User, Achievement

---

## 8. Banco de Dados

### Schema Prisma Completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ChallengeStatus {
  ACTIVE
  COMPLETED
  ABANDONED
}

enum CognitiveAttribute {
  ENERGIA_NEURAL
  MEMORIA
  LOGICA
  INTERPRETACAO
  CIENCIAS
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  image         String?
  passwordHash  String?
  xp            Int       @default(0)
  level         Int       @default(1)
  streakDays    Int       @default(0)
  lastStudiedAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  goal             Goal?
  brainMetrics     BrainMetrics?
  brainSnapshots   BrainSnapshot[]
  challenges       Challenge[]
  attempts         Attempt[]
  userAchievements UserAchievement[]
  accounts         Account[]

  @@index([email])
  @@index([streakDays])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  accessToken       String?
  refreshToken      String?
  expiresAt         Int?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Goal {
  id          String   @id @default(cuid())
  userId      String   @unique
  targetScore Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Topic {
  id                 String             @id @default(cuid())
  name               String
  slug               String             @unique
  description        String?
  cognitiveAttribute CognitiveAttribute

  subTopics SubTopic[]
  questions Question[]
}

model SubTopic {
  id      String @id @default(cuid())
  topicId String
  name    String
  slug    String

  topic     Topic      @relation(fields: [topicId], references: [id])
  questions Question[]

  @@unique([topicId, slug])
  @@index([topicId])
}

model Question {
  id           String   @id @default(cuid())
  externalId   String?  @unique
  year         Int
  index        Int
  topicId      String
  subTopicId   String?
  statement    String   @db.Text
  alternatives Json
  correctKey   String   @db.Char(1)
  difficulty   Int      @default(3)
  imageUrl     String?
  createdAt    DateTime @default(now())

  topic              Topic               @relation(fields: [topicId], references: [id])
  subTopic           SubTopic?           @relation(fields: [subTopicId], references: [id])
  attempts           Attempt[]
  challengeQuestions ChallengeQuestion[]

  @@index([topicId])
  @@index([year])
  @@index([difficulty])
  @@index([topicId, difficulty])
}

model Challenge {
  id             String          @id @default(cuid())
  userId         String
  status         ChallengeStatus @default(ACTIVE)
  totalXP        Int             @default(0)
  totalCorrect   Int             @default(0)
  totalQuestions Int             @default(10)
  startedAt      DateTime        @default(now())
  completedAt    DateTime?

  user               User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  attempts           Attempt[]
  challengeQuestions ChallengeQuestion[]

  @@index([userId])
  @@index([userId, status])
  @@index([completedAt])
}

model ChallengeQuestion {
  id          String @id @default(cuid())
  challengeId String
  questionId  String
  position    Int

  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  question  Question  @relation(fields: [questionId], references: [id])

  @@unique([challengeId, position])
  @@unique([challengeId, questionId])
  @@index([challengeId])
}

model Attempt {
  id              String   @id @default(cuid())
  userId          String
  questionId      String
  challengeId     String
  chosenKey       String   @db.Char(1)
  isCorrect       Boolean
  xpEarned        Int
  cognitiveImpact Json
  answeredAt      DateTime @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question  Question  @relation(fields: [questionId], references: [id])
  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, answeredAt])
  @@index([challengeId])
  @@index([questionId])
}

model BrainMetrics {
  id                 String   @id @default(cuid())
  userId             String   @unique
  energiaNeuralScore Float    @default(0)
  memoriaScore       Float    @default(0)
  logicaScore        Float    @default(0)
  interpretacaoScore Float    @default(0)
  cienciasScore      Float    @default(0)
  estimatedScore     Float    @default(0)
  updatedAt          DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model BrainSnapshot {
  id                 String   @id @default(cuid())
  userId             String
  energiaNeuralScore Float
  memoriaScore       Float
  logicaScore        Float
  interpretacaoScore Float
  cienciasScore      Float
  estimatedScore     Float
  recordedAt         DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, recordedAt])
}

model Achievement {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String
  type        String
  threshold   Int
  createdAt   DateTime @default(now())

  userAchievements UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@index([userId])
}
```

### Estratégia de Crescimento

| Tabela | Crescimento esperado | Estratégia |
|--------|---------------------|-----------|
| questions | ~1.800 linhas (estável) | Sem necessidade de particionamento |
| users | 1k → 100k usuários | Índice em email, streakDays |
| attempts | ~50k/semana (1k usuários) | Índice em (userId, answeredAt); particionar por mês após 10M |
| brain_snapshots | ~365/user/ano | TTL de 2 anos pós-inatividade; purge job mensal |
| challenges | ~3/user/semana | Índice em (userId, status) |

### Índices Críticos para Performance

- `attempts(userId, answeredAt)` — usado no cálculo de atributos cognitivos (query com WHERE userId + ORDER BY answeredAt)
- `questions(topicId, difficulty)` — usado no buildChallengeSession
- `challenges(userId, status)` — usado para validar sessão ativa e histórico
- `brain_snapshots(userId, recordedAt)` — gráfico histórico com filtro de período

---

## 9. API — Especificação Completa

### Convenções

- **Base URL**: `https://api.cortex.app/v1`
- **Autenticação**: `Authorization: Bearer <access_token>` em todos os endpoints (exceto `/auth/*`)
- **Content-Type**: `application/json`
- **Erros**: `{ "error": "ERROR_CODE", "message": "Mensagem legível" }`
- **Timestamps**: ISO 8601 UTC
- **IDs**: CUID strings

### Códigos de Erro Padrão

| HTTP | error code | Quando |
|------|-----------|--------|
| 400 | VALIDATION_ERROR | Body/query inválido (Zod) |
| 401 | UNAUTHORIZED | Token ausente ou expirado |
| 403 | FORBIDDEN | Recurso não pertence ao usuário |
| 404 | NOT_FOUND | Entidade não encontrada |
| 409 | CONFLICT | Ex: email já cadastrado |
| 429 | RATE_LIMIT | Too many requests |
| 500 | INTERNAL_ERROR | Erro interno não tratado |

---

### Auth

```
POST /auth/register
Body:   { name: string, email: string, password: string (min 6) }
Return: 201 { user: UserDTO, accessToken: string, refreshToken: string }
Errors: 409 email já cadastrado | 400 validação

POST /auth/login
Body:   { email: string, password: string }
Return: 200 { user: UserDTO, accessToken: string, refreshToken: string }
Errors: 401 credenciais inválidas

POST /auth/google
Body:   { idToken: string }   ← ID token do Google via Expo AuthSession
Return: 200 { user: UserDTO, accessToken: string, refreshToken: string }
Logic:  verifica idToken com Google, cria usuário se não existe (upsert por email)

POST /auth/refresh
Body:   { refreshToken: string }
Return: 200 { accessToken: string, refreshToken: string }
Errors: 401 refresh token inválido ou expirado

DELETE /auth/logout
Auth:   Bearer token
Body:   { refreshToken: string }
Return: 204 No Content
Logic:  invalida o refreshToken no servidor
```

**UserDTO**:
```typescript
{
  id: string
  email: string
  name: string
  image: string | null
  xp: number
  level: number
  streakDays: number
  hasCompletedOnboarding: boolean  // goal != null
}
```

---

### Users

```
GET /users/me
Auth:   Bearer
Return: 200 UserDTO & { goal: { targetScore: number } | null }

PATCH /users/me
Auth:   Bearer
Body:   { name?: string, image?: string }
Return: 200 UserDTO
Errors: 400 validação

POST /users/me/onboarding
Auth:   Bearer
Body:   { targetScore: number (500 | 600 | 700 | 800 | 900) }
Return: 201 { goal: { id, targetScore } }
Logic:  cria BrainMetrics se não existe; upsert Goal
```

---

### Dashboard

```
GET /dashboard
Auth:   Bearer
Return: 200 {
  user: {
    name: string
    level: number
    xp: number
    streakDays: number
  }
  brainMetrics: {
    energiaNeuralScore: number   // 0-100
    memoriaScore: number
    logicaScore: number
    interpretacaoScore: number
    cienciasScore: number
    estimatedScore: number       // 300-1000
  }
  recentActivity: {
    questionsThisWeek: number
    correctThisWeek: number
    sessionsThisWeek: number
  }
}
```

---

### Challenges

```
GET /challenges/next
Auth:   Bearer
Query:  topicId?: string, difficulty?: 1|2|3|4|5
Return: 200 {
  challengeId: string
  questions: Array<{
    id: string
    statement: string
    alternatives: Array<{ key: string, text: string }>
    imageUrl: string | null
    year: number
    topic: { name: string, cognitiveAttribute: string }
  }>
}
Logic:
  1. Cria Challenge com status ACTIVE
  2. Seleciona 10 questões: evita questões recentes do usuário (últimas 30 respostas no topic)
     Prioridade: questões incorretas anteriores > novas > aleatório
  3. Cria ChallengeQuestion para cada questão com position 1-10
  4. Retorna questões SEM revelar correctKey

PATCH /challenges/:id/complete
Auth:   Bearer
Return: 200 {
  totalXP: number
  totalCorrect: number
  cognitiveChanges: Array<{ attribute: string, delta: number, newValue: number }>
}
Logic:
  1. Valida que challenge pertence ao usuário e está ACTIVE
  2. Atualiza status → COMPLETED, completedAt
  3. Tira BrainSnapshot
  4. Retorna resumo (dados já calculados via POST /answers individuais)
```

---

### Answers

```
POST /answers
Auth:   Bearer
Body: {
  challengeId: string
  questionId: string
  chosenKey: string (A|B|C|D|E)
  consecutiveCorrect: number   ← cliente rastreia localmente
}
Return: 200 {
  isCorrect: boolean
  correctKey: string
  xpEarned: number
  cognitiveImpact: Array<{ attribute: string, delta: number }>
  explanation: string | null
}
Logic:
  1. Valida que questionId pertence ao challengeId
  2. Valida que já não foi respondida neste challenge
  3. Determina isCorrect
  4. Calcula XP (base + bônus de consecutiveCorrect)
  5. Persiste Attempt com cognitiveImpact
  6. Atualiza BrainMetrics (recalcula atributo da área)
  7. Atualiza user.xp, user.level
  8. Verifica streak (updateStreak)
  9. Verifica achievements (checkAndUnlockAchievements)
  10. Retorna resultado (sem revelar correctKey de outras questões)
```

---

### Brain

```
GET /brain/current
Auth:   Bearer
Return: 200 BrainMetricsDTO (same as dashboard.brainMetrics)

GET /brain/history
Auth:   Bearer
Query:  days?: number (default 30, max 365)
Return: 200 {
  snapshots: Array<{
    recordedAt: string (ISO)
    energiaNeuralScore: number
    memoriaScore: number
    logicaScore: number
    interpretacaoScore: number
    cienciasScore: number
    estimatedScore: number
  }>
}
```

---

### Achievements

```
GET /achievements
Auth:   Bearer
Return: 200 {
  unlocked: Array<{
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string
  }>
  locked: Array<{
    id: string
    name: string
    description: string
    icon: string
    progress: number      // valor atual do usuário
    threshold: number     // valor necessário para desbloquear
  }>
}
```

### Autenticação — Fluxo de Token

1. Login → `accessToken` (JWT, exp 15min) + `refreshToken` (opaque token, 7 dias)
2. Mobile armazena ambos no `expo-secure-store`
3. Cada request: `Authorization: Bearer <accessToken>`
4. Interceptor (`client.ts`): se receber 401, chama `POST /auth/refresh` automaticamente
5. Novo par de tokens é armazenado; request original é retentado
6. Se refresh também falhar (401): limpa tokens, redireciona para login
7. Logout: `DELETE /auth/logout` + limpa SecureStore

---

## 10. Design System

### Fundação: Neural Dark

O Cortex usa um sistema visual baseado em **dark mode exclusivo** com identidade "Neural Interface" — minimalista, técnico e vivo.

**Princípios visuais**:
- Separação por border (1px `border-zinc-800`), nunca por sombra
- Elevação implícita: `zinc-950` (fundo) → `zinc-900` (superfícies) → `zinc-800` (elementos interativos)
- Ênfase por cor, não por tamanho excessivo
- Sem glassmorphism, neumorphism, neubrutalism ou neon

### Paleta de Cores

```
Camadas:
  zinc-950  #09090B   Background (tela base)
  zinc-900  #18181B   Surface (cards, modais, inputs)
  zinc-800  #27272A   Border, skeleton, hover surface
  zinc-700  #3F3F46   Border pressed, divisores

Texto:
  zinc-100  #F4F4F5   Texto primário
  zinc-400  #A1A1AA   Texto secundário
  zinc-500  #71717A   Labels, hints, muted
  zinc-600  #52525B   Placeholders, indicadores inativos

Ação:
  indigo-500  #6366F1   Accent principal (botões, seleções, progresso)
  indigo-600  #4F46E5   Pressed state do accent

Feedback:
  green-500   #22C55E   Acerto, sucesso
  red-500     #EF4444   Erro, incorreto
  amber-500   #F59E0B   Streak, atenção

Atributos Cognitivos:
  indigo-500  #6366F1   Energia Neural
  violet-500  #A855F7   Memória de Longo Prazo
  blue-500    #3B82F6   Lógica
  emerald-500 #10B981   Interpretação
  rose-500    #F43F5E   Raciocínio Científico
```

### Tipografia

- **Família**: Public Sans (Google Fonts, carregada via `expo-font`)
- **Pesos**: 400 Regular, 500 Medium, 700 Bold
- **Escala**:

| Token | Tamanho | Line Height | Uso típico |
|-------|---------|------------|-----------|
| xs | 12px | 16px | Labels, chips, hints |
| sm | 14px | 20px | Subtextos, metadados |
| base | 16px | 24px | Corpo, alternativas |
| lg | 18px | 28px | Subtítulos de seção |
| xl | 20px | 28px | Títulos de card |
| 2xl | 24px | 32px | XP earned, métricas |
| 3xl | 30px | 36px | Títulos de tela |
| 4xl | 36px | 40px | XP sessão (destaque) |

### Espaçamentos

- Unidade base: 4px
- Scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`
- Padding horizontal padrão: `16px` (`px-4`)
- Padding de cards: `20px` (`p-5`)
- Gap entre seções na Home: `16px` (`gap-4`)
- Safe areas: `pt-safe`, `pb-safe` via `react-native-safe-area-context`

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| sm | 6px | Chips, badges pequenos |
| md | 8px | Botões secundários |
| lg | 12px | Inputs, cards compactos |
| xl | 16px | Cards principais |
| 2xl | 24px | Bottom sheets, cards hero |
| full | 9999px | Avatares, pills, barras de progresso |

### Componentes

#### Button
- **Primary**: `bg-indigo-500 text-white h-14 rounded-xl font-bold` — CTA principal
- **Secondary**: `bg-zinc-800 border border-zinc-700 text-zinc-100 h-12 rounded-xl` — ação secundária
- **Ghost**: `bg-transparent text-zinc-400` — ações terciárias, links
- **Danger**: `bg-red-500/10 border border-red-500/30 text-red-400` — ações destrutivas
- **Disabled**: `opacity-50 pointer-events-none`
- **Loading**: spinner `ActivityIndicator` branco inline, sem texto

#### Card
```
bg-zinc-900 border border-zinc-800 rounded-xl p-5
```

#### Input
```
bg-zinc-900 border border-zinc-800 rounded-xl h-12 px-4
text-zinc-100 placeholder:text-zinc-500
```
- Focus: `border-indigo-500`
- Error: `border-red-500` + `text-red-400 text-sm mt-1` abaixo

#### Progress Bar (linear)
```
Track:  bg-zinc-800 h-2 rounded-full
Fill:   bg-[attribute-color] rounded-full (width: animado)
```

#### AttributeBar (componente custom do Cortex)
```
Row: [nome]                    [valor%]
     [████████████░░░░░░░░░░]
```
- Label: `text-zinc-300 text-sm`
- Valor: `text-zinc-100 text-sm font-medium`
- Track: `bg-zinc-800 h-2 rounded-full flex-1`
- Fill: `bg-[cognitiveColor] h-2 rounded-full`

#### Badge/Chip
```
Neutral:  bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full
Colored:  bg-[color]/20 text-[color]-300 border border-[color]/30 rounded-full
```

#### SkeletonLoader
```
bg-zinc-800 rounded-[mesmas dimensões do conteúdo real] animate-pulse
```

#### Modal de Confirmação
- Bottom sheet com `bg-zinc-900 border-t border-zinc-800`
- Título, mensagem, 2 botões (Cancelar / Confirmar)
- Backdrop: `bg-black/60`

### Ícones

- Biblioteca: `@expo/vector-icons` (Ionicons)
- Tamanhos: 16, 20, 24 (padrão), 32
- Cor inativa: `text-zinc-500`
- Cor ativa (tab): `text-indigo-500`
- Cor em contexto: `text-zinc-100`

---

## 11. Gamificação

### Sistema de XP

| Evento | XP Concedido |
|--------|-------------|
| Resposta correta | +10 XP |
| Resposta incorreta | +3 XP (esforço) |
| Bônus: 3 corretas consecutivas | +5 XP extra |
| Sessão completa (10 questões) | +20 XP bônus |
| Sessão perfeita (10/10) | +50 XP extra |
| Manter streak (dia seguinte) | +10 XP ao abrir o app |

O bônus de consecutivas é rastreado pelo cliente (`consecutiveCorrect`) e validado pelo servidor.

### Sistema de Níveis

| Nível | XP Total Necessário | Nome Cognitivo |
|-------|-------------------|----------------|
| 1 | 0 | Neurônio |
| 2 | 100 | Sinapse |
| 3 | 250 | Dendrito |
| 4 | 500 | Axônio |
| 5 | 1.000 | Córtex |
| 6 | 2.000 | Hipocampo |
| 7 | 3.500 | Amígdala |
| 8 | 5.500 | Tálamo |
| 9 | 8.000 | Lóbulo Frontal |
| 10 | 12.000 | Cérebro Pleno |

Para nível N > 10: `XP(N) = 12.000 + (N − 10) × 2.000`

Subida de nível: animação de destaque na Home + notificação push.

### Streak

**Regras**:
- Incrementa quando o usuário responde ≥ 1 questão em um dia diferente do `lastStudiedAt`
- "Dia" é definido pela data local do usuário (não UTC)
- Resetado para 0 se `now() - lastStudiedAt > 24h` sem atividade
- `streakDays` e `lastStudiedAt` são atualizados no `POST /answers`

**Exibição**: "🔥 N dias" com cor `amber-500`. Pulse animation ao incrementar.

**Push Notification** (18h se não estudou): "Seu cérebro está esperando 🧠 Mantenha sua sequência de N dias!"

### Conquistas (MVP — 11 iniciais)

| ID | Nome | Tipo | Critério |
|----|------|------|----------|
| first-challenge | Primeiro Passo | Sessão | Completar 1 desafio |
| streak-3 | Três em Sequência | Streak | 3 dias consecutivos |
| streak-7 | Semana Perfeita | Streak | 7 dias consecutivos |
| streak-30 | Mês Dedicado | Streak | 30 dias consecutivos |
| perfect-session | Mente Afiada | Perfeição | 10/10 em 1 desafio |
| questions-50 | Meio Centenário | Volume | 50 questões respondidas |
| questions-100 | Centenário | Volume | 100 questões respondidas |
| questions-500 | Maratonista | Volume | 500 questões respondidas |
| level-5 | Córtex Ativado | Nível | Atingir nível 5 |
| level-10 | Cérebro Pleno | Nível | Atingir nível 10 |
| logica-80 | Lógico Avançado | Habilidade | Atributo Lógica ≥ 80% |

Verificação: `achievement.service.ts` roda após cada `POST /answers` e `PATCH /challenges/:id/complete`, consultando os critérios contra o estado atual do usuário.

### Loop de Engajamento

```
Push notification (ou intenção orgânica)
        ↓
  Abre o app → Home
  [Brain Status mostra estado atual — motivação extrínseca]
        ↓
  CTA "COMEÇAR DESAFIO" — única ação possível
        ↓
  Sessão 10 questões (5-10 min)
  [Feedback rico por questão — gratificação imediata]
        ↓
  Resultado com evolução cognitiva visível
  [Progressão tangível — loop de recompensa fechado]
        ↓
  Home com Brain Status atualizado
  [Streak incrementado — âncora diária]
        ↓
  Conquistas desbloqueadas (momento memorável)
        ↓
  Notificação no dia seguinte → fecha o loop
```

---

## 12. Modelo Cognitivo

### A Hipótese Central

> "Estudantes que percebem evolução em atributos cognitivos abstratos — em vez de porcentagens por matéria — têm maior taxa de retenção semanal e completam mais sessões de estudo."

Esta é uma **hipótese de produto**, não uma afirmação científica. O Cortex usa abstrações motivacionais para aumentar a sensação de progresso e o engajamento diário.

### Mapeamento Atributo ↔ Área ENEM

| Atributo Cognitivo | Área(s) ENEM | Raciocínio do mapeamento |
|-------------------|-------------|--------------------------|
| Energia Neural | Global (todas as áreas) | Mede atividade e consistência. Independe de matéria — reflete o hábito de estudo. |
| Memória de Longo Prazo | Ciências Humanas | História, Geografia, Filosofia e Sociologia exigem retenção de contexto, cronologias e conceitos ao longo do tempo. |
| Lógica | Matemática | Álgebra, Geometria e Probabilidade exigem raciocínio formal dedutivo e resolução sequencial de problemas. |
| Interpretação | Linguagens e Códigos | Português, Literatura e Língua Estrangeira demandam leitura crítica, inferência e análise textual. |
| Raciocínio Científico | Ciências da Natureza | Física, Química e Biologia testam método científico, análise de dados e formulação de hipóteses. |

### Fórmulas de Cálculo

#### Energia Neural (engajamento dos últimos 7 dias)

```
energia_neural = min(100, (questoes_ultimos_7_dias / 70) × 100)
```

- `70` = meta ideal (10 questões/dia × 7 dias)
- Decai naturalmente com inatividade sem precisar de penalidade explícita
- Recalculada no `GET /dashboard` e `GET /brain/current`

#### Memória, Lógica, Interpretação, Raciocínio Científico (precisão com decaimento temporal)

```
Para cada tentativa i do usuário na área do atributo:
  weight_i = exp(−λ × dias_desde_attempt_i)
  onde λ = 0.05  (half-life ≈ 14 dias)

raw_score = [Σ(weight_i × is_correct_i)] / [Σ(weight_i)] × 100

Revelação gradual (evita cold start extremo):
  n = total_attempts_na_area
  if n < 20:
    attribute_score = raw_score × (n / 20)
  else:
    attribute_score = raw_score
```

O decaimento temporal garante que performance recente pesa mais. Um usuário que errou muito há 2 meses mas está acertando agora verá seus atributos subirem progressivamente.

#### Nota Estimada ENEM

```
Pesos por área (simplificado, sem redação):
  Matemática:           25%
  Ciências da Natureza: 25%
  Linguagens e Códigos: 25%
  Ciências Humanas:     25%

Para cada área:
  accuracy_area = correct_answers / total_answers (sem decaimento)
  score_area    = 300 + (accuracy_area × 700)   // mapeia 0%→300, 100%→1000

estimated_score = Σ(score_area × peso_area)
                  clamped em [300, 1000]

Se total_answers < 10 (pouco dados): exibir "—" no lugar do número
```

#### Impacto Cognitivo por Resposta (cognitiveImpact)

```
Após cada Attempt:
  1. Identifica topicId da questão → atributo cognitivo
  2. Recalcula o atributo com as novas tentativas incluídas
  3. delta = novo_valor − valor_anterior_de_brain_metrics
  4. Se |delta| ≥ 0.5: inclui no cognitiveImpact retornado
     (deltas menores são cumulativos mas não exibidos individualmente)

Formato: [{ attribute: "LOGICA", delta: 1.8 }]
```

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|:------------:|:-------:|-----------|
| Usuário não entende o mapeamento | Alta | Médio | Onboarding T2 explica com exemplos; tooltip "?" em cada atributo |
| Atributo cai após sessão ruim — desmotivação | Média | Alto | Exibir tendência de 7 dias, não só valor absoluto; mensagem encorajadora |
| Cold start: todos os atributos em 0% | Alta | Médio | Revelação gradual; mensagem "Responda mais questões para desbloquear" |
| Usuário questiona base científica do mapeamento | Baixa | Médio | Disclaimer: "Estimativa motivacional — não é diagnóstico clínico" |
| Gaming: responder aleatoriamente para farmar XP | Baixa | Baixo | +3 XP para erro (baixo incentivo) + decaimento temporal normaliza |
| Estagnação em 85%+ — plateau desmotivante | Média | Médio | V1: Mostrar "manutenção" como conquista; aumentar dificuldade das questões |

### Validação da Hipótese

**Experimento A/B (MVP, 4 semanas)**:
- Grupo A (controle): Dashboard mostra "Acertos por matéria" (formato tradicional)
- Grupo B (Cortex): Dashboard mostra os 5 atributos cognitivos
- Métrica primária: D7 retention rate
- Métrica secundária: questões respondidas/semana
- Tamanho mínimo por grupo: 50 usuários

**Survey in-app** (após 7 dias de uso, 3 perguntas):
1. "Você sente que seu cérebro está ficando mais forte?" (1–5)
2. "O Cortex te motiva a estudar mais que outros apps?" (1–5)
3. "Você indicaria o Cortex para um amigo?" (0–10, NPS)

**Critérios de Validação da Hipótese**:
- D7 Grupo B ≥ 25% vs. D7 Grupo A ≤ 15%
- NPS ≥ 30
- Média "cérebro mais forte" ≥ 4.0/5.0
- Questões/semana Grupo B ≥ 50 vs. Grupo A

---

## 13. Roadmap

### MVP — Meses 1–3: Validar Retenção

**Objetivo**: Verificar se o modelo cognitivo aumenta retenção vs. apps tradicionais.

**Escopo**:
- Expo + React Native + Fastify + PostgreSQL do zero
- Importer da API ENEM (questões 2015–2024)
- Onboarding completo (3 telas)
- Auth Google + Email
- Home com Brain Status (5 atributos)
- Sessão de desafio (10 questões, modo livre)
- Feedback por questão (XP + impacto cognitivo)
- Tela de resultado da sessão
- Sistema de XP + streak
- 11 conquistas iniciais
- Tela de Progresso (histórico básico + atributos)
- Push notifications (abertura diária + streak em risco)
- Deploy: VPS + Cloudflare + EAS Build

**Fora do MVP**:
- IA / recomendações
- Flashcards
- Features sociais
- Ranking global
- Redação
- Seleção de área/tópico pelo usuário (desafio aleatório)

---

### V1 — Meses 4–6: Profundidade e Retenção de Médio Prazo

**Objetivo**: Melhorar D30 retention e adicionar razões para voltar além do streak.

**Escopo**:
- Gráficos de evolução (brain history) interativos
- Skill Tree por área ENEM (nível de domínio por subtopic)
- Modo de desafio por área (usuário escolhe o foco)
- Revisão de erros (sessão só com questões erradas anteriores)
- Streak freeze (1 uso/semana gratuito)
- 20 conquistas (9 novas)
- Push notifications personalizadas por área fraca
- Ajuste de dificuldade básico (mais questões difíceis à medida que atributo cresce)
- Light Mode opcional

---

### V2 — Meses 7–12: Expansão e Monetização

**Objetivo**: Introduzir modelo de negócio e features de rede.

**Escopo**:
- Freemium: 5 desafios/dia grátis, ilimitados no plano pago
- Flashcards de revisão (pós-questão)
- Features sociais básicas: adicionar amigos, ver streak dos amigos
- Ranking de streak semanal (opt-in)
- Daily Quest (meta personalizada por fraqueza detectada)
- Compartilhamento de conquistas (imagem para Instagram/WhatsApp)
- Notificações de streak de amigos ("Rafael está com 30 dias seguidos!")

---

### V3 — Ano 2: Plataforma

**Objetivo**: Expandir para outros exames e aprofundar IA.

**Escopo**:
- IA para recomendação de questões por weak spots
- Redação (envio de foto + correção humana ou automatizada)
- Outros exames: Fuvest, FGTS, Enade, concursos públicos
- Plano de estudos personalizado com datas e metas
- Comunidades e grupos de estudo
- API para instituições educacionais (B2B)

---

## 14. Métricas e Critérios de Validação

### North Star Metric

**Weekly Active Learners com ≥ 50 questões respondidas na semana**

Combina frequência (semanal = hábito formado) com volume (50q = ~5 sessões × 10q = engajamento real, não casual).

### Funil de Ativação

| Etapa | Meta MVP | Evento de rastreamento |
|-------|---------|----------------------|
| Download e abertura | 100% | App store metrics |
| Completa onboarding (T1→T2→T3) | ≥ 80% | `onboarding_completed` |
| Cria conta | ≥ 70% | `user_created` |
| Completa 1ª sessão de desafio | ≥ 60% | `challenge_completed` (first) |
| Retorna em 24h (D1) | ≥ 40% | Any `challenge_completed` D+1 |
| Retorna em 7 dias (D7) | ≥ 25% | Any `challenge_completed` D2–D7 |
| Retorna em 30 dias (D30) | ≥ 10% | Any `challenge_completed` D8–D30 |

### Métricas de Engajamento

| Métrica | Meta MVP |
|---------|---------|
| Sessões por usuário ativo/semana | ≥ 3 |
| Questões por sessão (completion rate) | ≥ 8/10 |
| Tempo médio de sessão | 5–10 min |
| Streak médio (usuários ativos) | ≥ 5 dias |
| Dias com atividade / 30 dias | ≥ 10 |

### Métricas do Modelo Cognitivo (hipótese)

| Métrica | Método |
|---------|--------|
| % usuários que abrem Progresso > 1x/semana | Event tracking |
| NPS da pergunta "cérebro mais forte" | Survey in-app D7 |
| D7 retention Grupo B (atributos) vs. Grupo A (matérias) | A/B experiment |

### Critérios de Sucesso do MVP

O MVP é considerado bem-sucedido se atender **todos** os critérios abaixo:

1. ✅ **100 usuários cadastrados** no primeiro mês pós-lançamento
2. ✅ **D7 retention ≥ 20%**
3. ✅ **Média de ≥ 50 questões/semana** por usuário ativo
4. ✅ **Completion rate de sessão ≥ 70%** (≥ 7/10 questões respondidas)
5. ✅ **NPS ≥ 30** (survey in-app após 7 dias)
6. ✅ **Crash rate < 0.1%** (via Sentry ou Expo Crash Reporting)
7. ✅ **Hipótese cognitiva**: D7 Grupo B ≥ D7 Grupo A + 10pp (A/B test)

### Plano de Coleta de Dados

- **Analytics mobile**: PostHog (self-hosted)
- **Eventos mínimos do MVP**: `app_open`, `onboarding_step_completed`, `challenge_started`, `answer_submitted`, `challenge_completed`, `achievement_unlocked`, `streak_updated`
- **Error tracking**: Sentry (React Native SDK)
- **Backend logs**: Fastify logger (pino) → arquivo + alertas Cloudflare

---

## Apêndice A — Conquistas (Seed Data)

```typescript
const achievements = [
  { id: 'first-challenge', name: 'Primeiro Passo',     type: 'SESSION',  threshold: 1,   icon: 'footsteps-outline',    description: 'Complete seu primeiro desafio' },
  { id: 'streak-3',        name: 'Três em Sequência',  type: 'STREAK',   threshold: 3,   icon: 'flame-outline',        description: '3 dias de estudo consecutivos' },
  { id: 'streak-7',        name: 'Semana Perfeita',    type: 'STREAK',   threshold: 7,   icon: 'flame',                description: '7 dias de estudo consecutivos' },
  { id: 'streak-30',       name: 'Mês Dedicado',       type: 'STREAK',   threshold: 30,  icon: 'trophy-outline',       description: '30 dias de estudo consecutivos' },
  { id: 'perfect-session', name: 'Mente Afiada',       type: 'PERFECT',  threshold: 1,   icon: 'star-outline',         description: '10/10 em um único desafio' },
  { id: 'questions-50',    name: 'Meio Centenário',    type: 'VOLUME',   threshold: 50,  icon: 'library-outline',      description: '50 questões respondidas' },
  { id: 'questions-100',   name: 'Centenário',         type: 'VOLUME',   threshold: 100, icon: 'library',              description: '100 questões respondidas' },
  { id: 'questions-500',   name: 'Maratonista',        type: 'VOLUME',   threshold: 500, icon: 'medal-outline',        description: '500 questões respondidas' },
  { id: 'level-5',         name: 'Córtex Ativado',     type: 'LEVEL',    threshold: 5,   icon: 'flash-outline',        description: 'Atingir Nível 5' },
  { id: 'level-10',        name: 'Cérebro Pleno',      type: 'LEVEL',    threshold: 10,  icon: 'hardware-chip-outline', description: 'Atingir Nível 10' },
  { id: 'logica-80',       name: 'Lógico Avançado',    type: 'SKILL',    threshold: 80,  icon: 'calculator-outline',   description: 'Atributo Lógica ≥ 80%' },
]
```

## Apêndice B — Topics (Seed Data)

```typescript
const topics = [
  { name: 'Matemática',           slug: 'matematica', cognitiveAttribute: 'LOGICA' },
  { name: 'Ciências da Natureza', slug: 'ciencias',   cognitiveAttribute: 'CIENCIAS' },
  { name: 'Linguagens e Códigos', slug: 'linguagens', cognitiveAttribute: 'INTERPRETACAO' },
  { name: 'Ciências Humanas',     slug: 'humanas',    cognitiveAttribute: 'MEMORIA' },
]
```

## Apêndice C — Variáveis de Ambiente

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/cortex
JWT_ACCESS_SECRET=<random 64 chars>
JWT_REFRESH_SECRET=<random 64 chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<Google OAuth client ID>
PORT=3000
NODE_ENV=production
ENEM_API_URL=https://api.enem.example.com
```

### Mobile (`app.config.ts` / `.env`)
```
EXPO_PUBLIC_API_URL=https://api.cortex.app/v1
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<Google OAuth client ID para Expo>
```

---

## Verificação End-to-End

Para validar a implementação antes de marcar o MVP como completo:

1. **Onboarding**: Instalar fresh → completar T1/T2/T3 → criar conta (email) → verificar BrainMetrics criado no DB com todos os scores em 0
2. **Google Auth**: Instalar fresh → "Continuar com Google" → verificar Account criado + tokens no SecureStore
3. **Home**: Verificar Brain Status mostra 5 atributos, nota "—" no primeiro acesso, CTA habilitado
4. **Desafio**: Tap "COMEÇAR DESAFIO" → 10 questões carregam → responder todas → verificar Attempts no DB com cognitiveImpact preenchido
5. **XP e Streak**: Responder questão correta → verificar `user.xp += 10` e `user.streakDays` no DB
6. **Brain Metrics**: Após sessão → verificar `BrainMetrics` atualizado e `BrainSnapshot` criado
7. **Conquista**: Completar 1 sessão → verificar `UserAchievement` "first-challenge" criado → exibido no Resultado
8. **Refresh token**: Aguardar token expirar (ou modificar exp para 1s) → fazer request → verificar intercepção automática e renovação
9. **Progresso**: Abrir aba → verificar gráfico com snapshots + atributos corretos
10. **Push notification**: Após 18h sem uso → verificar notificação "Seu cérebro está esperando" disparada

---

*Documento gerado em 2026-06-11. Versão de referência para implementação do Cortex Mobile MVP.*
