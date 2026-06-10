# Cortex ENEM

> Transformando estudo em progressão.

---

# Visão

O Cortex é uma plataforma gamificada para preparação do ENEM.

Diferente dos aplicativos tradicionais, o Cortex não mede apenas quantas questões o aluno acertou.

O objetivo é mostrar:

- O que ele domina
- O que precisa estudar
- Como está evoluindo
- Qual sua nota estimada
- Qual o estado atual do seu cérebro

O estudante não está resolvendo questões.

Ele está fortalecendo seu cérebro.

---

# O Conceito Central

O Cortex não é um banco de questões.

O Cortex é uma representação visual do cérebro do estudante.

Toda ação realizada dentro da plataforma impacta atributos cognitivos.

Exemplo:

text 🧠 Seu Cérebro Energia Neural 63% Memória de Longo Prazo ███████░░░ 70% Nível Geral 8 🔥 Streak 17 dias Matemática LV.8 Humanas LV.10 Natureza LV.4 Linguagens LV.7

O usuário deve sentir que está evoluindo constantemente.

A sensação principal do produto é:

> Estou fortalecendo minha mente.

---

# Princípios de Produto

## 1. Menos Configuração

O estudante não deve precisar:

- Criar flashcards
- Organizar conteúdo
- Escolher dezenas de filtros

Fluxo ideal:

text Entrar ↓ Começar desafio ↓ Responder questão

Menos de 30 segundos.

---

## 2. Progressão Visível

Toda ação deve gerar:

- XP
- Evolução
- Níveis
- Progresso
- Conquistas

Nada pode parecer invisível.

---

## 3. Clareza Acima de Tudo

Inspirado na simplicidade do Duolingo.

O usuário nunca deve se perguntar:

> O que faço agora?

Sempre existe uma ação principal.

Exemplo:

text 🧠 Seu Cérebro [ COMEÇAR DESAFIO ]

---

## 4. Aprendizado Ativo

O foco principal é:

- Resolver questões
- Evoluir habilidades
- Melhorar a nota estimada

Não haverá IA no MVP.

---

# Público-Alvo

Inicialmente:

- Estudantes do ENEM
- 15 a 25 anos

Expansão futura:

- Vestibulares
- Concursos
- Certificações

---

# Fonte de Dados

Questões importadas da API ENEM.

Pipeline:

text ENEM API ↓ Importador ↓ PostgreSQL ↓ Cortex

Todos os dados ficam armazenados localmente.

A aplicação não depende da disponibilidade da API.

---

# Estrutura de Conhecimento

text Área ↓ Tópico ↓ Subtópico ↓ Questão

Exemplo:

text Matemática └── Funções └── Função Afim ├── Questão 1 ├── Questão 2 └── Questão 3

---

# MVP

## Funcionalidades

### Cadastro

- Google
- Email

---

### Onboarding

Pergunta única:

text Qual sua meta? 500 600 700 800 900+

---

### Dashboard

Exibe:

- Energia Neural
- Memória de Longo Prazo
- XP
- Nível Geral
- Streak
- Nota Estimada
- Evolução por área

---

### Desafios

Botão principal:

text COMEÇAR DESAFIO

O sistema seleciona automaticamente:

- Questões adequadas
- Tópicos fracos
- Dificuldade apropriada

Sem configuração manual.

---

### Sessão de Questões

Exibe:

- Enunciado
- Alternativas
- Imagens

Após resposta:

text Correto +10 XP

ou

text Resposta Correta: B +3 XP

---

### Skill Tree

Exemplo:

text Matemática Funções 80% Geometria 45% Estatística 20% Probabilidade 62%

Objetivo:

Mostrar exatamente onde o aluno está evoluindo.

---

### Sistema de XP

Acerto:

text +10 XP

Erro:

text +3 XP

Sequências geram bônus.

---

### Levels

Exemplo:

text Level 1 = 0 XP Level 2 = 100 XP Level 3 = 250 XP Level 4 = 500 XP

---

### Streak

text 🔥 17 dias

---

### Nota Estimada

Versão simplificada.

Baseada em:

- Acertos
- Dificuldade
- Evolução histórica

---

# Identidade Visual

## Direção

Mistura de:

- Clareza do Duolingo
- Dashboard de RPG
- Interface Neural

---

## O que NÃO será

- Material Design corporativo
- Neumorphism
- Neubrutalism puro
- Interface acadêmica tradicional

---

## O que será

Tema escuro.

Visual limpo.

Pouco texto.

Muitos indicadores visuais.

Foco absoluto em progresso.

---

## Paleta Inicial

text Background #09090B Surface #18181B Primary #6366F1 Success #22C55E Warning #F59E0B Danger #F43F5E

---

## Componentes Principais

### Brain Status

Componente central da aplicação.

text 🧠 Seu Cérebro Energia Neural 63% Memória de Longo Prazo 70% Nível Geral 8 🔥 17 dias

---

### Skill Card

text Matemática LV.8 ████████░░ 80%

---

### Challenge Card

text Desafio Diário 10 Questões +100 XP

---

### Achievement Card

text 🏆 Matemática Lv.10 Conquista desbloqueada

---

# Stack Tecnológica

## Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui2

---

## Gerenciamento de Dados

### TanStack Query

Responsável por:

- Buscar questões
- Buscar progresso
- Buscar dashboard
- Cache automático
- Atualizações automáticas

Exemplos:

- Brain Status
- Skill Tree
- Questões
- Conquistas

---

### Zustand

Responsável por:

- Estado do onboarding
- Tema
- Modais
- Desafio em andamento
- Preferências locais

Não será usado para dados da API.

---

## Backend

- Next.js
- Arquitetura MVC estilo clone-tabnews (https://github.com/filipedeschamps/clone-tabnews)

---

## Banco de Dados

- PostgreSQL
- Prisma ORM

---

## Infraestrutura

- Docker
- Vercel

---

# North Star Metric

Questões respondidas por usuário por semana.

Meta inicial:

text 50+ questões por semana

---

# Fora do Escopo do MVP

- IA
- Chatbot
- Flashcards
- Mobile Nativo
- Marketplace
- Ranking Global
- Social
- Redação
- Concursos

---

# Critério de Sucesso

Após 60 dias:

- 100 usuários cadastrados
- 30 usuários ativos semanalmente
- Retenção D7 > 25%
- Média de 50 questões por semana por usuário ativo

---

# Princípio Fundamental

O usuário deve abrir o Cortex e imediatamente entender:

1. Como está seu cérebro.
2. Qual é seu próximo desafio.
3. O que precisa fazer para evoluir.

Se uma funcionalidade não contribuir para esses três objetivos, ela não entra no MVP.
