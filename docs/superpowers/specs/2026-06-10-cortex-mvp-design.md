# Cortex ENEM — MVP Design Spec

**Data:** 2026-06-10  
**Status:** Aprovado

---

## Visão Geral

Plataforma gamificada de preparação para o ENEM. O diferencial é apresentar o progresso do estudante como atributos cognitivos ("Seu Cérebro"), não como métricas acadêmicas tradicionais. O estudante não resolve questões — ele fortalece sua mente.

**North Star Metric:** 50+ questões respondidas por usuário por semana.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (latest) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Next.js App Router — Route Handlers (`/app/api/v1/`) |
| Estado servidor | TanStack Query |
| Estado local | Zustand |
| Auth | Auth.js v5 (NextAuth) — Google OAuth + Email/senha |
| ORM | Prisma |
| Banco | PostgreSQL (Vercel Postgres ou Neon) |
| Deploy | Vercel |
| Dev local | Docker Compose (PostgreSQL) |
| Validação | Zod em todos os Route Handlers |

---

## Arquitetura

### Fluxo de Dados

```
Browser
  └── React Client Component
        ├── TanStack Query → GET /api/v1/[recurso]
        │     └── Route Handler → Service → Repository → Prisma → PostgreSQL
        └── Zustand (estado local: sessão de desafio em andamento, modais, onboarding)
```

### Separação de Responsabilidades

```
/app/api/v1/[recurso]/route.ts   → Controller (valida request com Zod, chama service)
/src/services/[recurso].ts       → Service (lógica de negócio)
/src/repositories/[recurso].ts   → Repository (queries Prisma)
/src/models/                     → Interfaces e types TypeScript (sem classes)
```

---

## Estrutura de Pastas

```
cortex/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                        # rotas protegidas
│   │   ├── layout.tsx                # verifica sessão, redireciona para /login
│   │   ├── dashboard/page.tsx
│   │   ├── desafio/page.tsx
│   │   ├── skill-tree/page.tsx
│   │   └── onboarding/page.tsx
│   └── api/
│       └── v1/
│           ├── auth/[...nextauth]/route.ts
│           ├── users/
│           │   ├── me/route.ts
│           │   └── me/onboarding/route.ts
│           ├── dashboard/route.ts
│           ├── challenges/
│           │   └── next/route.ts
│           ├── answers/route.ts
│           └── skill-tree/route.ts
├── src/
│   ├── services/
│   │   ├── dashboard.service.ts
│   │   ├── challenge.service.ts
│   │   ├── answer.service.ts
│   │   ├── skill-tree.service.ts
│   │   └── user.service.ts
│   ├── repositories/
│   │   ├── question.repository.ts
│   │   ├── answer.repository.ts
│   │   ├── skill-progress.repository.ts
│   │   └── user.repository.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── question.model.ts
│   │   ├── answer.model.ts
│   │   └── skill-progress.model.ts
│   ├── lib/
│   │   ├── prisma.ts                 # singleton PrismaClient
│   │   ├── auth.ts                   # config Auth.js v5
│   │   └── query-client.ts           # TanStack Query client
│   ├── components/
│   │   ├── ui/                       # shadcn/ui
│   │   ├── brain-status/
│   │   ├── skill-card/
│   │   ├── challenge-card/
│   │   └── question-session/
│   └── hooks/                        # hooks TanStack Query por recurso
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── import-questions.ts           # seed via API ENEM
└── docker-compose.yml
```

---

## Schema do Banco (Prisma)

```prisma
// Auth.js v5 Prisma adapter — modelos obrigatórios
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  passwordHash  String?
  targetScore   Int?      // meta do onboarding: 500, 600, 700, 800, 900
  xp            Int       @default(0)
  level         Int       @default(1)
  streakDays    Int       @default(0)
  lastStudiedAt DateTime?
  createdAt     DateTime  @default(now())

  accounts      Account[]
  answers       Answer[]
  skillProgress SkillProgress[]
}

model Question {
  id           String   @id @default(cuid())
  externalId   String   @unique  // "{year}-{index}" ex: "2023-142"
  year         Int
  index        Int               // número da questão no exame
  area         String            // Matemática, Humanas, Natureza, Linguagens
  topic        String
  subtopic     String
  statement    String
  alternatives Json              // [{key: "A", text: "..."}]
  correctKey   String
  difficulty   Int       @default(3)  // 1-5, definido no enriquecimento
  imageUrl     String?
  createdAt    DateTime @default(now())

  answers Answer[]
}

model Answer {
  id          String   @id @default(cuid())
  userId      String
  questionId  String
  chosenKey   String
  isCorrect   Boolean
  xpEarned    Int
  answeredAt  DateTime @default(now())

  user     User     @relation(fields: [userId], references: [id])
  question Question @relation(fields: [questionId], references: [id])
}

model SkillProgress {
  id       String @id @default(cuid())
  userId   String
  area     String
  topic    String
  accuracy Float  @default(0)  // 0.0 - 1.0
  total    Int    @default(0)
  correct  Int    @default(0)

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, area, topic])
}
```

---

## Fonte de Dados: ENEM API

**Base URL:** `https://enem.dev/api/v1` (confirmar na documentação — `https://docs.enem.dev`)

| Endpoint | Descrição |
|---|---|
| `GET /exams` | Lista todos os anos disponíveis |
| `GET /exams/{year}/questions` | Lista questões do ano |
| `GET /exams/{year}/questions/{index}` | Questão específica |

**Rate limit:** 1 req/seg. Para bulk, usar o repositório GitHub da API.

**Script de seed** (`scripts/import-questions.ts`):
1. Busca `/exams` para listar anos
2. Para cada ano, busca `/exams/{year}/questions` com delay de 1s entre requests
3. Persiste via `prisma.question.upsert` (idempotente)
4. `topic` e `subtopic` definidos por enriquecimento manual no seed (mapeamento `area → topic`)

---

## Autenticação

- **Auth.js v5** com dois providers: Google OAuth e Credentials (email + bcrypt)
- Sessão via **JWT** (stateless, compatível com Vercel edge)
- **Middleware** Next.js (`middleware.ts`) protege o grupo `(app)` — redireciona para `/login` se não houver sessão válida
- Primeiro acesso → redireciona para `/onboarding` se `targetScore` for `null`

---

## Fluxo de Telas

```
/login ou /register
      ↓
  (primeira vez) /onboarding  →  salva targetScore via PUT /api/v1/users/me/onboarding
      ↓
  /dashboard
      ↓  clica "Começar Desafio"
  /desafio  ← carrega questões via GET /api/v1/challenges/next, estado em Zustand
      ↓  finaliza sessão
  /dashboard  ← TanStack Query revalida dados (XP, streak, skill cards)
```

| Rota | Descrição |
|---|---|
| `/login` | Form email/senha + botão Google |
| `/register` | Cadastro por email |
| `/onboarding` | Tela única: escolha de meta (500–900+) |
| `/dashboard` | Brain Status + CTA "Começar Desafio" + Skill cards por área |
| `/desafio` | Sessão de questões: enunciado, alternativas, feedback XP inline |
| `/skill-tree` | Progresso detalhado por área e tópico |

---

## API Routes

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/dashboard` | Retorna XP, level, streak, energia neural, memória, skill summary |
| `GET` | `/api/v1/challenges/next` | Seleciona 10 questões para nova sessão |
| `POST` | `/api/v1/answers` | Registra resposta, calcula XP, atualiza SkillProgress e streak |
| `GET` | `/api/v1/skill-tree` | Progresso por área e tópico |
| `GET` | `/api/v1/users/me` | Dados do usuário autenticado |
| `PUT` | `/api/v1/users/me/onboarding` | Salva meta do onboarding |

---

## Gamificação

### XP
```
Acerto:  +10 XP
Erro:    +3 XP
Sequência 3+ acertos consecutivos: +5 XP bônus por questão
```

### Levels
```
Level 1:  0 XP
Level 2:  100 XP
Level 3:  250 XP
Level 4:  500 XP
Level n:  threshold[n-1] + (n * 100)
```

### Atributos Cognitivos (Dashboard)

Calculados em `dashboard.service.ts` a partir dos dados existentes — sem campos extras no banco.

**Energia Neural** (proxy: consistência recente)
```
recentAnswers = total de respostas nos últimos 7 dias
energiaNeuralPct = min(100, streakDays * 5 + recentAnswers * 2)
```

**Memória de Longo Prazo** (proxy: acurácia geral)
```
memoriaLongoPrazoPct = média ponderada de accuracy em todos os SkillProgress do usuário
                       (peso = total de questões por tópico)
```

Ambos retornados como inteiros 0–100 no `GET /api/v1/dashboard`.

---

### Streak
- Incrementa se o usuário responde ao menos 1 questão no dia
- Zera se pular um dia (verificado comparando `lastStudiedAt` com data atual no `POST /api/v1/answers`)

### Seleção de Questões (`GET /api/v1/challenges/next`)
- Prioriza tópicos com `accuracy < 0.6` no `SkillProgress` do usuário
- Distribuição de dificuldade: 60% média (3), 20% fácil (1-2), 20% difícil (4-5)
- Evita questões respondidas nos últimos 7 dias
- 10 questões por sessão

---

## Estado Local (Zustand)

```ts
interface ChallengeStore {
  readonly sessionId: string | null
  readonly questions: readonly Question[]
  readonly currentIndex: number
  readonly answers: readonly SessionAnswer[]
  startSession: (questions: readonly Question[]) => void
  submitAnswer: (questionId: string, key: string) => void
  endSession: () => void
}
```

---

## Identidade Visual

- Tema escuro: `bg-zinc-950` (background), `bg-zinc-900` (surface), `border-zinc-800`
- Accent: `indigo-500` (#6366F1)
- Tipografia: Public Sans
- Sem glassmorphism, sem neon, sem scale transforms
- Progress bars: `bg-zinc-800` track com fill sólido
- Mobile-first

---

## Fora do Escopo do MVP

IA, chatbot, flashcards, mobile nativo, marketplace, ranking global, social, redação, concursos, conquistas dedicadas, histórico de sessões, perfil.

---

## Critérios de Sucesso (60 dias)

- 100 usuários cadastrados
- 30 usuários ativos semanalmente
- Retenção D7 > 25%
- Média de 50 questões/semana por usuário ativo
