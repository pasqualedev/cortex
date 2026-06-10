# Feature Experimental: Modelo Cognitivo Cortex

## Objetivo

Validar se estudantes se engajam mais com métricas cognitivas do que com métricas acadêmicas tradicionais.

Em vez de mostrar:

text Matemática: 80% Humanas: 70% Natureza: 45%

O Cortex apresentará uma representação visual do cérebro do estudante.

Exemplo:

text 🧠 Seu Cérebro Energia Neural 63% Memória de Longo Prazo ███████░░░ 70% Lógica 82% Interpretação 61% Raciocínio Científico 45%

---

# Hipótese

Estudantes se conectarão mais com a ideia de:

> "Estou fortalecendo meu cérebro"

do que com:

> "Estou resolvendo questões."

Se a hipótese estiver correta, isso se tornará o principal diferencial do Cortex.

---

# Status

Experimental.

Não é requisito para o lançamento inicial.

Pode ser habilitado para grupos específicos de usuários.

---

# Atributos Cognitivos

## Energia Neural

Representa consistência de estudo.

Não mede inteligência.

Mede frequência e regularidade.

### Possível cálculo

text Dias consecutivos estudando + Quantidade de atividade recente - Dias de inatividade

---

## Memória de Longo Prazo

Representa retenção.

### Possível cálculo

Baseado em:

- Revisões realizadas
- Acertos recorrentes
- Tempo entre revisões

Exemplo:

text Questão acertada após 30 dias = Mais pontos de memória

---

## Lógica

Representa raciocínio lógico.

### Fontes

- Matemática
- Probabilidade
- Estatística
- Álgebra

### Possível cálculo

text Acertos ponderados por dificuldade

---

## Interpretação

Representa compreensão textual e análise.

### Fontes

- Linguagens
- Humanas

### Possível cálculo

text Questões de interpretação + Questões contextualizadas

---

## Raciocínio Científico

Representa capacidade de análise científica.

### Fontes

- Física
- Química
- Biologia

### Possível cálculo

text Acertos ponderados + Questões de maior complexidade

---

# Evolução

Os atributos nunca são permanentes.

Eles devem evoluir e regredir ao longo do tempo.

Exemplo:

text Lógica 82% ↑ +4% esta semana

ou

text Interpretação 61% ↓ -2% esta semana

---

# Possível Evolução Futura

Visualização gráfica do cérebro.

Cada região representa um atributo.

Exemplo conceitual:

text 🧠 Lógica 82% Memória Interpretação 70% 61% Energia Científico 63% 45%

Com evolução visual baseada no progresso.

---

# Critérios de Validação

A funcionalidade será considerada validada se:

- Usuários acessarem frequentemente a tela "Seu Cérebro"
- A retenção aumentar em comparação ao grupo controle
- Usuários demonstrarem interesse em melhorar atributos cognitivos
- A funcionalidade aumentar a quantidade semanal de questões respondidas

---

# Observação Importante

Os atributos não representam medições científicas reais.

Eles são abstrações de produto criadas para:

- Tornar o progresso visível
- Aumentar motivação
- Reforçar a identidade do Cortex
- Criar uma experiência única de aprendizado

```
:::

Eu manteria isso como Feature Flag desde o dia 1. Você consegue lançar o Cortex normalmente com XP, questões e progresso, e ativar o "Modelo Cognitivo Cortex" para 10% dos usuários. Se os dados mostrarem mais retenção e engajamento, aí sim ele vira o centro do produto. Isso evita que toda a identidade do app dependa de uma hipótese que ainda não foi validada.
```
