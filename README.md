# Areia · Navy · Ardósia

A regra de cores dos nossos projetos, com tema claro e escuro, feita para painéis executivos: telas
em que alguém precisa ler um número, entender se ele está bom ou ruim e decidir, em poucos segundos.

- **Areia** nas superfícies: um fundo quente e calmo, sem o branco hospitalar, que cansa menos a vista
  em telas abertas o dia todo.
- **Ardósia** no texto: um cinza azulado, frio, que contrasta com a areia e mantém o texto legível
  em qualquer tamanho.
- **Navy** na marca e na interação: a faixa do cabeçalho, o botão principal, o item ativo, o link e a primeira
  série dos gráficos.

As cores dos dados (8 séries, sequencial, divergente e status) foram escolhidas por cálculo, não no
olho: contraste WCAG contra a superfície e distância de cor simulando daltonismo, nos dois temas.
`node scripts/verificar.mjs` refaz todas as contas.

## Arquivos

| Arquivo | O que é |
|---|---|
| `tokens.json` | **A fonte.** Todas as cores, no formato W3C Design Tokens (`$type`, `$value`). |
| `tokens.css` | Gerado do JSON: variáveis CSS com o tema claro, o escuro e a troca pelo sistema. Não edite à mão. |
| `index.html` | A vitrine: abra no navegador e troque entre Claro, Escuro e Sistema. Mostra rampas, papéis com o contraste calculado na hora, gráficos de exemplo e um painel executivo. |
| `scripts/gerar-css.mjs` | Gera o `tokens.css` a partir do `tokens.json` (`--conferir` só confere, para CI). |
| `scripts/verificar.mjs` | Confere contraste, daltonismo e as escalas. Sai com erro se algo não passar. |

Os scripts precisam só do Node 18 ou mais novo, sem dependências.

## Como usar

```html
<link rel="stylesheet" href="tokens.css">
<html data-theme="light">  <!-- "light", "dark" ou sem o atributo para seguir o sistema -->
```

```css
body   { background: var(--cor-pagina); color: var(--cor-tinta); font-family: var(--fonte); }
.card  { background: var(--cor-superficie); border: 1px solid var(--cor-borda); }
.nota  { color: var(--cor-tinta-3); }
.botao { background: var(--cor-acento); color: var(--cor-sobre-acento); }
.botao:hover { background: var(--cor-acento-hover); }
:focus-visible { outline: 2px solid var(--cor-foco); outline-offset: 2px; }
td.numero { font-variant-numeric: var(--fonte-numeros); text-align: right; }
```

Nos gráficos (SVG, canvas, bibliotecas), leia as variáveis do CSS em vez de copiar o hex, e desenhe
de novo quando o tema mudar:

```js
const cor = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
const series = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => cor(`--serie-${i}`));
```

**A regra de ouro:** o código fala em papéis (`--cor-superficie`, `--serie-1`, `--status-critico`),
nunca em hex nem em passo de rampa. É isso que deixa o tema escuro de graça e a paleta trocável.

## As rampas

Onze passos cada, desenhados no espaço OKLCH: a luminosidade cai por igual de um passo ao outro,
então o 500 de uma rampa pesa o mesmo que o 500 da outra. As rampas são iguais nos dois temas; cada
tema escolhe passos diferentes delas.

| Passo | Areia | Ardósia | Navy |
|---|---|---|---|
| 50 | `#fcfaf6` | `#f8fafd` | `#f0f5ff` |
| 100 | `#f6f2ea` | `#eff3f7` | `#dde9ff` |
| 200 | `#ece5d9` | `#e1e7ee` | `#bdd4fc` |
| 300 | `#ddd4c3` | `#ced6e0` | `#95b6f3` |
| 400 | `#bfb39e` | `#aab5c4` | `#6792e3` |
| 500 | `#9b8f7a` | `#8592a3` | `#406fca` |
| 600 | `#796f5d` | `#647183` | `#2c56a8` |
| 700 | `#5b5344` | `#495565` | `#204286` |
| 800 | `#413b31` | `#323d4b` | `#173268` |
| 900 | `#2a261f` | `#1e2733` | `#10244c` |
| 950 | `#191713` | `#101822` | `#0a1834` |

## Os papéis da interface

O tema escuro não é o claro invertido: cada papel tem um passo próprio, conferido contra a superfície
escura. O contraste do texto está ao lado (claro / escuro).

| Papel | Claro | Escuro | Para quê |
|---|---|---|---|
| `--cor-pagina` | `#f1ece1` | `#080f18` | fundo da página (no claro, um areia entre o 100 e o 200: os cartões saltam) |
| `--cor-superficie` | `#fffdf9` | `#101723` | cartões, tabelas, gráficos |
| `--cor-superficie-2` | `#fcfaf6` | `#161e2a` | blocos dentro do cartão |
| `--cor-superficie-3` | `#f6f2ea` | `#1e2734` | controles, trilhas, linhas alternadas |
| `--cor-borda` | `#ece5d9` | `#242e3d` | bordas finas |
| `--cor-grade` | `#ece5d9` | `#1e2734` | linhas de grade |
| `--cor-eixo` | `#ddd4c3` | `#333e4d` | eixos e linha de base |
| `--cor-tinta` | `#101822` | `#fcfaf6` | texto principal e números · 17,58:1 / 17,23:1 |
| `--cor-tinta-2` | `#495565` | `#ced6e0` | texto secundário e rótulos · 7,46:1 / 12,25:1 |
| `--cor-tinta-3` | `#5d6a7c` | `#aab5c4` | notas e texto apagado, ainda AA · 5,41:1 / 8,65:1 |
| `--cor-marca` | `#10244c` | `#bdd4fc` | logotipo, títulos de marca · 14,99:1 / 11,97:1 |
| `--cor-acento` | `#204286` | `#406fca` | botão principal, item ativo |
| `--cor-acento-hover` | `#173268` | `#2c56a8` | botão principal ao passar o mouse |
| `--cor-acento-suave` | `#f0f5ff` | `#162644` | fundo de item selecionado |
| `--cor-sobre-acento` | `#ffffff` | `#ffffff` | texto sobre o acento · 9,61:1 / 4,83:1 |
| `--cor-link` | `#2c56a8` | `#95b6f3` | links · 6,88:1 / 8,78:1 |
| `--cor-foco` | `#406fca` | `#6792e3` | anel de foco · 4,76:1 / 5,82:1 |
| `--cor-marca-fundo` | `#10244c` | `#10244c` | a faixa da marca (o cabeçalho do app) |
| `--cor-marca-controle` | `#173268` | `#173268` | botões e controles dentro da faixa |
| `--cor-marca-borda` | `#2c56a8` | `#2c56a8` | bordas dentro da faixa |
| `--cor-sobre-marca` | `#fcfaf6` | `#fcfaf6` | texto na faixa · 14,61:1 |
| `--cor-sobre-marca-2` | `#bdd4fc` | `#bdd4fc` | texto secundário, links e foco na faixa · 10,14:1 |

### A faixa da marca

A identidade aparece em **um** lugar forte: o cabeçalho de cada app é uma faixa navy (`--cor-marca-fundo`)
com o nome em areia. O resto da tela é areia e ardósia, e o navy volta só no que é ação ou escolha: a aba
ativa (`--cor-acento`), o botão principal e os títulos dos cartões (`--cor-marca`). Dentro da faixa, troque
os papéis de texto e de controle pelos da faixa; assim os botões e os seletores do topo se ajustam sozinhos:

```css
header.app {
  background: var(--cor-marca-fundo); color: var(--cor-sobre-marca);
  --cor-tinta: var(--cor-sobre-marca); --cor-tinta-2: var(--cor-sobre-marca-2);
  --cor-superficie: var(--cor-marca-controle); --cor-eixo: var(--cor-marca-borda); --cor-foco: var(--cor-sobre-marca-2);
}
header.app [aria-pressed="true"] { background: var(--cor-sobre-marca); color: var(--cor-marca-fundo); }
```

A faixa é a mesma nos dois temas: no escuro ela continua navy sobre a página quase preta.

## As cores dos dados

Cada cor de gráfico faz **um trabalho só**. Antes de escolher a cor, pergunte qual é o trabalho:

| Trabalho | Pergunta que responde | Tokens |
|---|---|---|
| Identidade (categórica) | "qual produto é este?" | `--serie-1` … `--serie-8`, `--serie-contexto`, `--serie-outros` |
| Quantidade (sequencial) | "quanto?" | `--seq-1` (pouco) … `--seq-9` (muito) |
| Lado (divergente) | "acima ou abaixo da referência?" | `--div-n4` … `--div-0` … `--div-p4` |
| Estado (status) | "está bom ou ruim?" | `--status-bom`, `-atencao`, `-alerta`, `-critico` |
| Projeção | "quanto falta e com que incerteza?" | `--dado-previsto`, `--dado-faixa` |

### Séries (categórica)

| # | Cor | Claro | Contraste | Escuro | Contraste |
|---|---|---|---|---|---|
| 1 | Navy | `#305eb7` | 6,06:1 | `#5889e6` | 5,25:1 |
| 2 | Ocre | `#bb7e00` | 3,39:1 | `#c28412` | 5,65:1 |
| 3 | Vinho | `#a4345c` | 6,41:1 | `#c65379` | 4,20:1 |
| 4 | Céu | `#2f91bd` | 3,50:1 | `#268bb6` | 4,66:1 |
| 5 | Oliva | `#698e2f` | 3,75:1 | `#6f9436` | 5,10:1 |
| 6 | Lavanda | `#8765be` | 4,46:1 | `#9977d1` | 5,06:1 |
| 7 | Terracota | `#c45034` | 4,55:1 | `#d25d40` | 4,60:1 |
| 8 | Petróleo | `#029393` | 3,69:1 | `#0c9999` | 5,16:1 |

1. **Ordem fixa.** A primeira série é sempre navy, a segunda sempre ocre, e assim por diante. A ordem
   foi escolhida para que cada cor fique o mais longe possível da vizinha, nos dois temas.
2. **A cor segue a entidade, não a posição.** Se "Pagamentos" é ocre, é ocre em todos os gráficos e
   continua ocre quando um filtro tira outras séries. Guarde o mapa entidade → cor.
3. **Nada de 9ª cor gerada.** Da 9ª série em diante, some tudo em "outros" (`--serie-outros`), ou
   divida em gráficos pequenos lado a lado.
4. **Destaque:** quando a história é uma série só, ela leva `--serie-1` e as outras ficam em
   `--serie-contexto`.
5. **Dispersão, mapas e pontos soltos:** no máximo 3 séries. As 3 primeiras se distinguem todas
   contra todas; da 4ª em diante, só garantimos a distância entre vizinhas (como numa pilha ou
   legenda).
6. **Texto em tinta.** Valores, rótulos e legendas usam `--cor-tinta`/`-2`/`-3`; a cor da série vai na
   marca ao lado (bolinha, traço), nunca na letra.
7. **Com 2 séries ou mais, sempre há legenda**, e até 4 séries também ganham rótulo direto na
   ponta. A cor nunca é a única pista.

### Sequencial e divergente

- **Sequencial** é uma cor só, navy, do claro ao escuro. No tema escuro a escala inverte: o "pouco"
  fica perto do fundo e o "muito" brilha. Nunca use arco-íris para quantidade.
- **Divergente** tem duas cores opostas e um meio neutro: navy (abaixo da referência: economia) ←
  areia → terracota (acima: gasto a mais). O meio é sempre neutro, nunca uma cor.

| | n4 | n3 | n2 | n1 | 0 | p1 | p2 | p3 | p4 |
|---|---|---|---|---|---|---|---|---|---|
| Claro | `#234993` | `#426ec2` | `#7398dc` | `#acc2e9` | `#ece5d9` | `#e2baad` | `#db8e76` | `#cb6443` | `#a33f1e` |
| Escuro | `#a2bef2` | `#6f97e2` | `#4972c0` | `#2e4b83` | `#2a2e34` | `#763927` | `#af5234` | `#d9704f` | `#eaa48e` |

### Status

Quatro estados com significado reservado. **Sempre com ícone e rótulo**, nunca só a cor, e nunca
usados como cor de série (o "crítico" não é a série 4).

| Estado | Ícone | Claro: marca / texto | Escuro: marca / texto |
|---|---|---|---|
| bom | ✓ | `#099864` / `#016c46` (6,39:1) | `#08ad72` / `#4fcc92` (8,88:1) |
| atenção | ! | `#ecaa0b` / `#8a5601` (6,06:1) | `#f0b135` / `#f5c25f` (10,92:1) |
| alerta | ▲ | `#e97125` / `#ac430e` (5,80:1) | `#f3813f` / `#fa9d68` (8,63:1) |
| crítico | ✕ | `#d21d4e` / `#b61441` (6,53:1) | `#ef546e` / `#fd8996` (7,87:1) |

- `--status-*` é o preenchimento (bolinha, ícone, barra fina); `--status-*-texto` é para letras;
  `--status-*-sobre` é a cor do ícone desenhado em cima do preenchimento.
- O amarelo de atenção no claro tem só 2:1 contra a superfície: por isso ele nunca aparece sozinho,
  sempre com o ícone e o rótulo no `-texto`. O verificador mostra isso como aviso, de propósito.
- Em custo, **cair é bom**: uma variação de −12% vai em `--status-bom-texto` com ▼; +8% vai em
  `--status-critico-texto` com ▲. A seta carrega o sentido, a cor só reforça.

### Projeção

Para "quanto vai fechar o mês", use uma **barra de bala** numa régua comum a todas as linhas:

- o já realizado na cor da série (cheio);
- o que falta até o fim do período em `--dado-previsto` (a mesma família, mais clara no claro e mais
  escura no escuro), separado por 2px de respiro;
- a faixa de cenários (mínimo a máximo) como um traço com hastes em `--dado-faixa`;
- o orçamento ou a meta como uma marca vertical em `--cor-tinta`;
- ao lado, o número grande (≈ US$ 95), o realizado pequeno embaixo e a confiança em três pontos
  (●●○) neutros. A cor de alarme fica só para quando passar do orçamento, com ▲ e o texto.

A vitrine (`index.html`, seção Painel) tem o exemplo pronto.

## Acessibilidade e validação

`node scripts/verificar.mjs` lê o `tokens.json` e confere, nos dois temas:

- **Contraste WCAG 2.x:** texto principal ≥ 7:1; todo outro texto (inclusive o apagado e o de
  status) ≥ 4,5:1; séries, foco e marcas de referência ≥ 3:1.
- **Daltonismo:** simula protanopia e deuteranopia pelo modelo de Machado, Oliveira e Fernandes
  (2009) e mede a distância no OKLab (×100). Séries vizinhas precisam de ΔE ≥ 8 com daltonismo e
  ≥ 15 com visão normal; as 3 primeiras, todas contra todas.
- **Escalas:** a sequencial se afasta da superfície a cada passo; a divergente tem o meio neutro e
  cada braço se afasta do meio.

Para medir qualquer outra lista de cores:
`node scripts/verificar.mjs --series "#305eb7,#bb7e00,#a4345c" --fundo "#fffdf9"`.

## O que aprendemos com os painéis executivos

Olhamos como plataformas de produto financeiro e de observabilidade (Stripe, Ramp, Brex, Mercury,
Linear, Vercel, Datadog), ferramentas de BI (Power BI, Tableau), o sistema de dados do IBM Carbon e a
gráfica de jornais econômicos (Financial Times, The Economist) resolvem a mesma tela. O que se repete:

1. **Um número herói por tela.** O valor que responde à pergunta do executivo, grande e sozinho, com
   a comparação (vs mês anterior, vs orçamento) logo abaixo e menor.
2. **Neutro por padrão, cor por exceção.** Quase tudo é superfície e tinta; a cor aparece onde há
   informação: a série que importa, o estado que pede ação.
3. **Fundo que não é branco puro.** Papel quente (o salmão do FT, o creme de muitos relatórios) cansa
   menos e deixa as cores dos dados mais firmes. Daqui veio a areia.
4. **Cores de dado com ordem fixa e validadas para daltonismo**, com regra explícita para o que não
   cabe ("outros", gráficos pequenos lado a lado).
5. **Uma série em destaque, o resto em cinza.** O título conta a conclusão; o gráfico prova.
6. **Status com significado reservado** e sempre com ícone e texto, nunca só a cor.
7. **Grade e eixos quase invisíveis**, números com algarismos de largura fixa e alinhados à direita.
8. **Incerteza à vista e sem drama:** projeção como faixa, confiança com marca neutra, alarme só
   quando cruza um limite que alguém definiu.
9. **Tema escuro com passos próprios**, conferido de novo, nunca o claro invertido.

## Faça e não faça

**Faça**

- Use os papéis: `var(--serie-1)`, `var(--cor-tinta-2)`.
- Mantenha a ordem das séries e o mapa entidade → cor.
- Linhas finas (2px), barras com a ponta de dado arredondada e 2px de respiro entre segmentos.
- Legenda sempre presente com 2 séries ou mais; rótulo direto em até 4.
- Uma tabela ou um texto alternativo para todo gráfico.

**Não faça**

- Gerar uma 9ª cor.
- Usar status como série ou série como status.
- Arco-íris para quantidade.
- Dois eixos Y no mesmo gráfico: faça dois gráficos ou um índice com base 100.
- Grade tracejada ou grossa.
- Inverter o tema na mão: o escuro já tem os passos certos.

## Mudar a paleta

1. Edite o `tokens.json`.
2. `node scripts/gerar-css.mjs` para gerar o `tokens.css`.
3. `node scripts/verificar.mjs`: se algo não passar, ajuste o passo (mais claro ou mais escuro na
   mesma rampa) até passar.
4. Abra o `index.html` nos dois temas e olhe: o script confere a cor, não o desenho.
5. Suba a versão (`versao` no JSON) e anote a mudança abaixo.

## Versões

- **1.1.0:** a faixa da marca (`--cor-marca-fundo`, `-controle`, `-borda`, `--cor-sobre-marca`, `-2`) e a página do
  tema claro um passo mais areia (`#f1ece1`), para a identidade aparecer além dos gráficos.
- **1.0.0:** rampas, papéis dos dois temas, 8 séries, sequencial, divergente, status e projeção.
