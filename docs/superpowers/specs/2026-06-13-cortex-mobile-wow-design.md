# Cortex Mobile — "Wow" UX Upgrade

**Data:** 2026-06-13
**Escopo:** Abordagem A — Home + Resultado (3 passos) + FeedbackOverlay
**Inspirações:** Duolingo (gamificação, revelação progressiva) + Yazio (dados bonitos, score em anel)

---

## Objetivo

Elevar o engajamento visual do app Cortex introduzindo:
1. Home com hierarquia cognitiva clara (score em anel + XP bar)
2. Tela de resultado em 3 passos animados (celebração → score → streak)
3. FeedbackOverlay mais expressivo durante o desafio

---

## Dependências

| Pacote | Uso | Status |
|---|---|---|
| `react-native-reanimated` | Animações de barra, spring, pulse, fade | Verificar se já instalado |
| `react-native-confetti-cannon` | Confetti no Passo 1 do resultado | Nova instalação |

---

## Seção 1 — Arquitetura de Componentes

### Novos componentes

| Arquivo | Responsabilidade |
|---|---|
| `components/ui/AnimatedProgressBar.tsx` | Barra que anima de 0% → valor com easing customizável via Reanimated |
| `components/ui/CountUp.tsx` | Texto numérico que conta de 0 até valor final com duração configurável |
| `components/resultado/StepCelebration.tsx` | Passo 1 — confetti + emoji com spring animation |
| `components/resultado/StepScoreXP.tsx` | Passo 2 — barras animadas em sequência (precisão, XP, combo) |
| `components/resultado/StepStreak.tsx` | Passo 3 — chama pulse, contagem de dias, mini calendário em cascata |

### Arquivos modificados

| Arquivo | O que muda |
|---|---|
| `app/(app)/index.tsx` | Home redesenhada com 4 blocos |
| `app/(app)/desafio/resultado.tsx` | Substituído pelo orquestrador de 3 passos |
| `components/challenge/FeedbackOverlay.tsx` | Borda colorida, ícone animado, XP com FadeInRight, badge de combo |
| `components/brain-status/BrainStatus.tsx` | Score em anel SVG animado substituindo header atual |

---

## Seção 2 — Home Screen

### Layout (4 blocos em ordem vertical)

**1. Header row**
- Saudação `Olá, {name}` à esquerda
- Pill `🔥 {streakDays} | Nv.{level}` à direita em `bg-zinc-900` com border
- Compacto, sem card — linha única

**2. Score Cognitivo card** (`bg-zinc-900`, `border-zinc-800`)
- Anel SVG animado via Reanimated: progresso = `score / 1000`
- Ao lado: label "Score Cognitivo", valor numérico em destaque, 3 barras compactas dos atributos com maior e menor score
- Abaixo: badges de tendência gerados dinamicamente (`↑ Lógica` em `emerald`, `↓ Ciências` em `red`)

**3. XP & Nível card** (slim)
- Label `Nível {N} → {N+1}` + valor `{xp} / {xpNext} XP`
- `AnimatedProgressBar` que anima na entrada (0 → valor atual) com duration 800ms

**4. CTA card**
- "Próximo Desafio" como label, subtexto motivacional
- Meta do dia: checkboxes visuais (`sessionsToday / dailyGoal`)
- Botão `Iniciar Desafio` em `indigo-500`

### Notas
- `BrainStatus.tsx` atual é reutilizado na tela de **Progresso** (5 barras completas)
- A Home mostra apenas resumo de 3 atributos — os 2 mais fortes e o mais fraco
- O anel SVG é desenhado com `react-native-svg` (já usado no projeto) + Reanimated para `strokeDashoffset`

### XP e Nível — cálculo client-side

O backend usa os seguintes thresholds (em `answer.service.ts`):

```ts
// lib/xp.ts
const XP_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000]

export const xpForLevel = (level: number): number => XP_THRESHOLDS[level - 1] ?? 0
export const xpForNextLevel = (level: number): number => XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]!
export const xpProgress = (xp: number, level: number): number =>
  (xp - xpForLevel(level)) / (xpForNextLevel(level) - xpForLevel(level))
```

### Meta do dia — rastreamento local

A API retorna apenas `sessionsThisWeek`. A meta diária (3 sessões) é rastreada num slice Zustand `dailyStore`:
- Persiste `{ date: string; count: number }` via `AsyncStorage`
- Incrementa `count` após cada `completeChallenge` bem-sucedido
- Reseta `count` para 0 quando `date !== today`
- A Home lê `dailyStore.count` para renderizar os checkboxes (máx 3)

---

## Seção 3 — Tela de Resultado (3 Passos)

### Orquestrador (`resultado.tsx`)

```
step: 1 | 2 | 3
sessionData: { xpEarned, correctCount, totalCount, maxCombo, streakDays }
```

- `sessionData` é recebido via Zustand `resultStore` (slice novo) preenchido antes do `completeChallenge`
- Cada step ocupa a tela inteira
- Avança por toque ou timeout (Passo 1 apenas)

### Passo 1 — StepCelebration

- Confetti dispara automaticamente ao montar (`react-native-confetti-cannon`)
- Emoji 🧠 entra com `spring` de baixo para cima (translateY: 80 → 0)
- Texto "Desafio Concluído!" + "X questões respondidas"
- Avança automaticamente após **2.5s** ou ao toque em qualquer lugar
- Background: `bg-zinc-950`

### Passo 2 — StepScoreXP

- Título "Veja seu desempenho" com `FadeInDown` (Reanimated)
- 3 `AnimatedProgressBar` em sequência com **300ms** de delay entre cada:
  1. **Precisão** — cor `indigo-500`, valor `correctCount / totalCount * 100`%
  2. **XP ganho** — cor `violet-500`, `CountUp` de 0 → `xpEarned` ao lado
  3. **Combo máximo** — cor `amber-500`, valor `maxCombo / 5 * 100`% (máx referência = 5)
- Botão "Continuar" aparece com `FadeIn` após **650ms** do início
- Sem timeout — usuário avança manualmente

### Passo 3 — StepStreak

- Emoji 🔥 entra com `spring` + pulse (scale 1.0 → 1.2 → 1.0, loop 2×)
- `CountUp` de 0 → `streakDays` com duration **800ms**
- Mini calendário dos últimos 7 dias: célula 🔥 aparece com **80ms** de delay em cascata
- Texto motivacional: "Continue amanhã para não perder!" (se streak > 0)
- Botões: "Voltar para Home" (primary) + "Novo Desafio" (secondary)

### Dados da sessão

Os seguintes valores são calculados/acumulados no `ChallengeScreen` e salvos no `resultStore` antes de `completeChallenge()`:

| Campo | Fonte |
|---|---|
| `xpEarned` | Soma dos `attemptResult.xpEarned` de cada questão |
| `correctCount` | Contador local de respostas corretas |
| `totalCount` | `session.questions.length` |
| `maxCombo` | Pico do `consecutiveCorrect` durante a sessão |
| `streakDays` | `dashboard.user.streakDays` (invalidado após complete) |

> `maxCombo` não é retornado pela API — deve ser rastreado no cliente durante a sessão.

---

## Seção 4 — FeedbackOverlay

### Mudanças visuais (sem alteração de lógica)

**Borda de estado**
- `borderTopWidth: 3` no container
- Correto: `emerald-500` | Errado: `red-500`

**Ícone animado**
- Ícone grande (✓ ou ✗) com `ZoomIn` (Reanimated) ao montar
- Substitui o texto `✓ Correto!` / `✗ Incorreto`

**XP com entrada animada**
- Tag `+{xpEarned} XP` aparece com `FadeInRight` após **150ms**
- Chama mais atenção que o texto estático atual

**Badge de combo**
- Se `consecutiveCorrect >= 2`: badge `🔥 Combo ×{consecutiveCorrect}` em `amber-500`
- Aparece acima do XP com `FadeInDown`
- Reforça o mesmo sistema visual da tela de resultado

---

## Fora de Escopo (próxima iteração)

- Tela de Progresso e Achievements
- League tables / ranking
- Notificações push de streak
- Animações no onboarding
