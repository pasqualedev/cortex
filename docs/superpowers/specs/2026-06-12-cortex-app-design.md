# Cortex App — Design Spec

**Data**: 2026-06-12  
**Status**: Aprovado  
**Escopo**: Frontend mobile Expo (`cortex-app`) — MVP completo

---

## 1. Contexto

O `cortex-api` (Fastify + Prisma + PostgreSQL) está completo no branch `feature/cortex-api-backend`. Este documento especifica o frontend mobile que consome essa API.

O `cortex-app` vive como projeto standalone dentro do repositório `/cortex`, sem configuração de monorepo workspace. Cada pacote (`cortex-api`, `cortex-app`) mantém seu próprio `package.json` independente.

---

## 2. Stack

| Camada | Lib | Versão |
|---|---|---|
| Framework | Expo SDK 53 | `latest` |
| Routing | Expo Router 4 | via Expo |
| Estilização | NativeWind 4 | `^4.x` |
| Estado global (auth) | Zustand 5 | `^5.x` |
| Server state | TanStack Query 5 | `^5.x` |
| HTTP client | axios | `^1.x` |
| Tokens | Expo SecureStore | via Expo |
| Ícones | `@expo/vector-icons` (Ionicons) | via Expo |
| Gráficos | `react-native-svg` + `victory-native` | tela Progresso |
| Formulários | `react-hook-form` + `zod` | validação client-side |
| Testes | Vitest + `@testing-library/react-native` | unitários |

**Bootstrap:**
```bash
npx create-expo-app@latest cortex-app --template blank-typescript
```

---

## 3. Variáveis de Ambiente

Arquivo `.env` na raiz do `cortex-app`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Expo expõe automaticamente variáveis com prefixo `EXPO_PUBLIC_` para o bundle do cliente.

---

## 4. Navegação

Expo Router 4 com file-based routing. Dois grupos de rota:

```
app/
  _layout.tsx              # Root — providers: QueryClient, AuthProvider
  +not-found.tsx

  (auth)/
    _layout.tsx            # Redireciona autenticado → (app)
    index.tsx              # Splash Screen + decisão de rota
    onboarding.tsx         # Steps T1/T2/T3 com estado local
    login.tsx
    register.tsx

  (app)/
    _layout.tsx            # Auth guard + Bottom Tab Bar (3 abas)
    index.tsx              # Home
    progresso.tsx          # Progresso
    perfil.tsx             # Perfil

    desafio/
      index.tsx            # Sessão de questões
      resultado.tsx        # Resultado da sessão
```

**Regras:**
- `(auth)/_layout.tsx`: lê token do SecureStore — se válido, `router.replace('/(app)')`.
- `(app)/_layout.tsx`: guard inverso — sem token, `router.replace('/(auth)')`.
- Splash (`(auth)/index.tsx`): exibe animação enquanto resolve a rota assincronamente.
- Bottom Tab Bar: 3 abas (Home, Progresso, Perfil). Ocultada durante o fluxo `desafio/` via `tabBarStyle: { display: 'none' }` no layout pai da aba ativa.

---

## 5. Camada de API

### Estrutura de arquivos

```
lib/
  api.ts            # instância axios com baseURL do .env
  interceptors.ts   # injeta Bearer token; trata 401 com refresh automático
  query-keys.ts     # query keys centralizadas (objeto const)

services/
  auth.service.ts
  user.service.ts
  challenge.service.ts
  dashboard.service.ts
  progress.service.ts
```

### Interceptor de refresh

Quando o interceptor recebe `401`, tenta `POST /auth/refresh` com o `refreshToken` do SecureStore. Se bem-sucedido, salva o novo `accessToken` e reenvia a requisição original. Se falhar, limpa o store Zustand e redireciona para `/(auth)`.

### Services

Cada service é uma coleção de funções puras (sem classe) que recebem parâmetros e retornam uma Promise. Componentes nunca importam axios diretamente — apenas services.

### Estratégia de cache (TanStack Query)

| Query | `staleTime` |
|---|---|
| Dashboard / Home | 30s |
| Progresso / Histórico | 60s |
| Próxima questão | 0 (sempre fresh) |
| Perfil do usuário | 5min |

---

## 6. Estado Global

### Auth Store (Zustand)

```typescript
interface AuthStore {
  readonly user: User | null;
  readonly accessToken: string | null;
  readonly isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}
```

Tokens persistidos exclusivamente via `expo-secure-store`. O `refreshToken` nunca entra no store Zustand — lido/escrito diretamente no SecureStore pelo interceptor.

---

## 7. Componentes

```
components/
  brain-status/
    BrainStatus.tsx            # Card com os 5 atributos cognitivos
    AttributeBar.tsx           # Barra individual de atributo

  challenge/
    QuestionCard.tsx           # Enunciado + área + ano
    AnswerOption.tsx           # Alternativa tocável (estados: idle, selected, correct, wrong)
    FeedbackOverlay.tsx        # Slide-up após resposta: resultado + XP + impacto cognitivo
    SessionProgress.tsx        # Header: barra de progresso + questão X/N + botão sair

  progress/
    EstimatedScoreChart.tsx    # Gráfico de linha (victory-native)
    CognitiveAttributeCard.tsx # Card expansível por atributo
    SessionHistoryItem.tsx     # Item de sessão no histórico
    AchievementGrid.tsx        # Grid de conquistas

  ui/
    Button.tsx                 # Variantes: primary, secondary, ghost
    Card.tsx
    Input.tsx                  # Com label, erro inline, toggle senha
    Badge.tsx
    SkeletonLoader.tsx         # animate-pulse, mesmas dimensões do conteúdo real
    Modal.tsx                  # Confirmação de saída do desafio
```

### Microinterações

Implementadas via `react-native` `Animated` API — sem Reanimated no MVP.

| Interação | Comportamento | Duração |
|---|---|---|
| Toque em alternativa | Highlight + borda indigo | 0ms |
| Confirmar resposta | Loading state no botão | 200ms max |
| FeedbackOverlay | Slide-up do bottom | 300ms ease-out |
| Transição entre questões | Fade out/in | 150ms |
| SessionProgress bar | Preenchimento suave | 400ms ease-in-out |

### Estados universais

Todo componente com dados assíncronos implementa os três estados:

- **Loading**: `SkeletonLoader` com mesmas dimensões do conteúdo final. Nunca spinner centralizado.
- **Erro**: `ErrorCard` com mensagem humanizada em PT-BR e botão "Tentar novamente".
- **Vazio**: Ilustração simples + texto + CTA contextual.

---

## 8. Design System

Segue a paleta definida no CLAUDE.md do projeto:

| Token | Valor |
|---|---|
| Background | `bg-zinc-950` |
| Surface | `bg-zinc-900` |
| Border | `border-zinc-800` |
| Text primário | `text-zinc-100` |
| Text secundário | `text-zinc-500` |
| Accent | `bg-indigo-500` (#6366F1) |

Tipografia: **Public Sans**. Sem fontes decorativas.

Interações: apenas mudanças de opacidade e estado — sem scale transforms ou glow effects.

---

## 9. Testes

### Suites unitárias

| Arquivo | Cobre |
|---|---|
| `auth.service.test.ts` | login, register, refresh token |
| `challenge.service.test.ts` | fetch próxima questão, submit resposta |
| `stores/auth.store.test.ts` | setAuth, clearAuth, isAuthenticated |
| `lib/interceptors.test.ts` | retry com refresh em 401, falha → clearAuth |
| `components/AnswerOption.test.tsx` | seleção, estados visual correct/wrong |
| `components/FeedbackOverlay.test.tsx` | renderiza XP e impacto cognitivo |

**Ferramentas:** Vitest + `@testing-library/react-native`. Services testados com `vitest.mock` do axios. Stores testados diretamente sem render. Sem E2E (Detox) no MVP.

---

## 10. Arquivos Afetados

Criação do projeto:
- `/cortex-app/` — diretório raiz do projeto Expo (novo)
- `/cortex-app/app/` — todas as telas via Expo Router
- `/cortex-app/components/` — todos os componentes
- `/cortex-app/lib/` — api, interceptors, query-keys
- `/cortex-app/services/` — services por domínio
- `/cortex-app/stores/` — Zustand stores
- `/cortex-app/.env` — variáveis de ambiente (não commitado)
- `/cortex-app/.env.example` — template commitado
