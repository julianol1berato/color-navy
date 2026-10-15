#!/usr/bin/env node
/*
 * Gera as imagens SVG do README (pasta imagens/) a partir do tokens.json. Sem dependências: Node 18+.
 *
 *   node scripts/gerar-imagens.mjs
 *
 * São SVG estáticos (sem script nem fonte externa), para o GitHub mostrar direto no README.
 * Os dados dos exemplos são fictícios.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast } from './verificar.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(raiz, 'tokens.json'), 'utf8'));
const TEMAS = { claro: tokens.tema.claro, escuro: tokens.tema.escuro };
const PASSOS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const NOMES = ['Navy', 'Ocre', 'Vinho', 'Céu', 'Oliva', 'Lavanda', 'Terracota', 'Petróleo'];

// ---------- peças de SVG ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const br = (v, d = 2) => v.toFixed(d).replace('.', ',');
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => ` ${k}="${v}"`).join('');
const rect = (x, y, w, h, fill, o = {}) => `<rect${attrs({ x, y, width: w, height: h, fill, ...o })}/>`;
const circle = (cx, cy, r, fill, o = {}) => `<circle${attrs({ cx, cy, r, fill, ...o })}/>`;
const line = (x1, y1, x2, y2, stroke, w = 1, o = {}) => `<line${attrs({ x1, y1, x2, y2, stroke, 'stroke-width': w, ...o })}/>`;
function text(x, y, s, { size = 13, fill, weight, anchor, mono, raw } = {}) {
  return `<text${attrs({ x, y, 'font-size': size, fill, 'font-weight': weight, 'text-anchor': anchor, class: mono ? 'm' : undefined })}>${raw ? s : esc(s)}</text>`;
}
const tspan = (s, fill, weight) => `<tspan${attrs({ fill, 'font-weight': weight })}>${esc(s)}</tspan>`;
function svg(w, h, titulo, corpo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="titulo">
<title id="titulo">${esc(titulo)}</title>
<style>text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}.m{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}</style>
${corpo}
</svg>
`;
}
// a letra sobre uma cor: branco ou a tinta escura, o que contrastar mais
const sobre = (hex) => (contrast(hex, '#ffffff') >= contrast(hex, '#101822') ? '#ffffff' : '#101822');
// números fictícios, mas sempre os mesmos (um gerador com semente)
function sorteio(semente) {
  let s = semente;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}

const c = (t, k) => t.cor[k].$value;
const serie = (t, i) => t.serie[i].$value;

// ---------- capa ----------
function capa() {
  const t = TEMAS.escuro, W = 960, H = 320, r = tokens.rampa;
  let b = rect(0, 0, W, H, c(t, 'marca-fundo'), { rx: 18 });
  b += `<g fill="none" stroke="${c(t, 'sobre-marca-2')}" stroke-width="4" stroke-linecap="round"><path d="M52 92V80M64 92V70M76 92v-8M88 92V64"/></g>`;
  b += text(104, 90, 'paleta de cores', { size: 15, fill: c(t, 'sobre-marca-2') });
  b += text(48, 150, 'Areia · Navy · Ardósia', { size: 46, weight: 650, fill: c(t, 'sobre-marca') });
  b += text(48, 186, 'A regra de cores dos nossos painéis executivos,', { size: 18, fill: c(t, 'sobre-marca-2') });
  b += text(48, 212, 'com tema claro e escuro, validada por cálculo.', { size: 18, fill: c(t, 'sobre-marca-2') });
  for (let i = 1; i <= 8; i++) b += circle(58 + (i - 1) * 26, 248, 9, serie(t, i));
  b += text(48, 284, '8 séries em ordem fixa · texto AA · séries ≥ 3:1 · daltonismo ΔE ≥ 11', { size: 13, fill: c(t, 'sobre-marca-2') });
  const tri = [
    ['Areia', 'superfícies', r.areia['200'].$value, r.areia['900'].$value, null],
    ['Navy', 'marca', r.navy['900'].$value, r.navy['50'].$value, c(t, 'marca-borda')],
    ['Ardósia', 'texto', r.ardosia['700'].$value, r.ardosia['50'].$value, null],
  ];
  tri.forEach(([nome, papel, fundo, letra, borda], i) => {
    const x = 618 + i * 102;
    b += rect(x, 48, 92, 224, fundo, { rx: 14, stroke: borda || undefined, 'stroke-width': borda ? 1.5 : undefined });
    b += text(x + 12, 236, nome, { size: 16, weight: 600, fill: letra });
    b += text(x + 12, 256, `${papel}`, { size: 11, fill: letra });
  });
  return svg(W, H, 'Areia · Navy · Ardósia: paleta de cores', b);
}

// ---------- rampas ----------
function rampas() {
  const W = 960, H = 304, t = TEMAS.claro;
  let b = rect(0.5, 0.5, W - 1, H - 1, c(t, 'superficie'), { rx: 16, stroke: c(t, 'borda') });
  [['areia', 'Areia'], ['ardosia', 'Ardósia'], ['navy', 'Navy']].forEach(([k, nome], i) => {
    const y = 24 + i * 88;
    b += text(24, y + 42, nome, { size: 15, weight: 600, fill: c(t, 'tinta') });
    PASSOS.forEach((p, j) => {
      const hex = tokens.rampa[k][p].$value, x = 112 + j * 75.8, cor = sobre(hex);
      b += rect(x, y, 71.8, 72, hex, { rx: 8, stroke: j === 0 ? c(t, 'borda') : undefined });
      b += text(x + 8, y + 18, p, { size: 11, weight: 600, fill: cor });
      b += text(x + 8, y + 62, hex, { size: 11, fill: cor, mono: true });
    });
  });
  return svg(W, H, 'As rampas areia, ardósia e navy, do passo 50 ao 950', b);
}

// ---------- séries ----------
function seriesPainel(nome, t, y0) {
  const W = 960, H = 286, sup = c(t, 'superficie');
  let b = rect(0.5, y0 + 0.5, W - 1, H - 1, sup, { rx: 16, stroke: c(t, 'borda') });
  b += text(24, y0 + 32, `Tema ${nome}`, { size: 13, weight: 600, fill: c(t, 'tinta-2') });
  for (let i = 1; i <= 8; i++) {
    const x = 24 + (i - 1) * 115, hex = serie(t, i);
    b += rect(x, y0 + 46, 105, 52, hex, { rx: 8 });
    b += text(x, y0 + 118, `${i} · ${NOMES[i - 1]}`, { size: 13, weight: 600, fill: c(t, 'tinta') });
    b += text(x, y0 + 136, `${hex} · ${br(contrast(hex, sup))}:1`, { size: 11, fill: c(t, 'tinta-3'), mono: true });
  }
  // um gráfico de exemplo: barras empilhadas com 2px de respiro entre os segmentos
  const rnd = sorteio(7), base = y0 + 262, alto = 100;
  b += line(24, base + 0.5, W - 24, base + 0.5, c(t, 'eixo'));
  [0.33, 0.66, 1].forEach((f) => { b += line(24, base - alto * f + 0.5, W - 24, base - alto * f + 0.5, c(t, 'grade')); });
  for (let k = 0; k < 30; k++) {
    let y = base;
    const x = 30 + k * 30.4;
    [0.30, 0.22, 0.16, 0.12, 0.08].forEach((peso, s) => {
      const h = Math.max(4, alto * peso * (0.75 + rnd() * 0.5));
      b += rect(x, y - h, 20, h - 2, serie(t, s + 1), { rx: s === 4 ? 3 : 1 });
      y -= h;
    });
  }
  return b;
}
function series() {
  const b = seriesPainel('claro', TEMAS.claro, 0) + seriesPainel('escuro', TEMAS.escuro, 302);
  return svg(960, 588, 'As 8 cores de série nos temas claro e escuro, com um gráfico de barras empilhadas de exemplo', b);
}

// ---------- sequencial e divergente ----------
function escalasPainel(nome, t, y0) {
  const W = 960, H = 214;
  let b = rect(0.5, y0 + 0.5, W - 1, H - 1, c(t, 'superficie'), { rx: 16, stroke: c(t, 'borda') });
  b += text(24, y0 + 30, `Tema ${nome}`, { size: 13, weight: 600, fill: c(t, 'tinta-2') });
  // sequencial
  b += text(24, y0 + 58, 'Sequencial · navy', { size: 14, weight: 600, fill: c(t, 'tinta') });
  for (let i = 1; i <= 9; i++) b += rect(24 + (i - 1) * 48.6, y0 + 70, 46.6, 34, t.seq[i].$value, { rx: i === 1 || i === 9 ? 6 : 0 });
  b += text(24, y0 + 122, 'pouco', { size: 11, fill: c(t, 'tinta-3') });
  b += text(460, y0 + 122, 'muito', { size: 11, fill: c(t, 'tinta-3'), anchor: 'end' });
  const rnd = sorteio(3);
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 18; k++) {
      const meio = 1 - Math.abs(k - 8.5) / 9, v = Math.max(1, Math.min(9, Math.round(1 + meio * 6 + rnd() * 3 - r * 0.6)));
      b += rect(24 + k * 24.3, y0 + 134 + r * 22, 22.3, 20, t.seq[v].$value, { rx: 3 });
    }
  }
  // divergente
  const ord = ['n4', 'n3', 'n2', 'n1', '0', 'p1', 'p2', 'p3', 'p4'];
  b += text(500, y0 + 58, 'Divergente · navy ← areia → terracota', { size: 14, weight: 600, fill: c(t, 'tinta') });
  ord.forEach((k, i) => { b += rect(500 + i * 48.4, y0 + 70, 46.4, 34, t.div[k].$value, { rx: i === 0 || i === 8 ? 6 : 0 }); });
  b += text(500, y0 + 122, 'economia', { size: 11, fill: c(t, 'tinta-3') });
  b += text(718, y0 + 122, 'no previsto', { size: 11, fill: c(t, 'tinta-3'), anchor: 'middle' });
  b += text(936, y0 + 122, 'gasto a mais', { size: 11, fill: c(t, 'tinta-3'), anchor: 'end' });
  const vals = [-38, -22, -9, -3, 2, 6, 14, 27, 41], mid = 718;
  b += line(mid + 0.5, y0 + 134, mid + 0.5, y0 + 200, c(t, 'eixo'));
  vals.forEach((v, i) => {
    const w = Math.max(2, Math.abs(v) * 4.6), x = v < 0 ? mid - w : mid + 1;
    const k = ord[4 + Math.sign(v) * Math.min(4, Math.ceil(Math.abs(v) / 11))];
    b += rect(x, y0 + 136 + i * 7.2, w, 5.2, t.div[k].$value, { rx: 2 });
  });
  return b;
}
function escalas() {
  const b = escalasPainel('claro', TEMAS.claro, 0) + escalasPainel('escuro', TEMAS.escuro, 230);
  return svg(960, 444, 'As escalas sequencial (navy) e divergente (navy, areia, terracota) nos temas claro e escuro', b);
}

// ---------- status ----------
function statusPainel(nome, t, y0) {
  const W = 960, H = 112, sup = c(t, 'superficie');
  let b = rect(0.5, y0 + 0.5, W - 1, H - 1, sup, { rx: 16, stroke: c(t, 'borda') });
  b += text(24, y0 + 30, `Tema ${nome}`, { size: 13, weight: 600, fill: c(t, 'tinta-2') });
  const S = [['bom', '✓', 'No orçamento', 136], ['atencao', '!', 'Perto do limite', 150], ['alerta', '▲', 'Acima do previsto', 168], ['critico', '✕', 'Estourou', 108]];
  let x = 24;
  S.forEach(([k, ic, rot, w]) => {
    const st = (s) => t.status[s].$value;
    b += rect(x, y0 + 46, w, 32, c(t, 'superficie-2'), { rx: 16, stroke: c(t, 'borda') });
    b += circle(x + 18, y0 + 62, 10, st(k));
    b += text(x + 18, y0 + 66.5, ic, { size: 12, weight: 800, fill: st(`${k}-sobre`), anchor: 'middle' });
    b += text(x + 36, y0 + 66.5, rot, { size: 13, weight: 600, fill: st(`${k}-texto`) });
    x += w + 10;
  });
  b += text(x + 14, y0 + 66.5, [
    tspan('Em custo, cair é bom: ', c(t, 'tinta-2')), tspan('▼ −12,4%', t.status['bom-texto'].$value, 600),
    tspan(' · ', c(t, 'tinta-3')), tspan('▲ +8,1%', t.status['critico-texto'].$value, 600),
  ].join(''), { size: 13, raw: true });
  return b;
}
function status() {
  const b = statusPainel('claro', TEMAS.claro, 0) + statusPainel('escuro', TEMAS.escuro, 124);
  return svg(960, 236, 'Os quatro estados (bom, atenção, alerta, crítico), sempre com ícone e rótulo, nos dois temas', b);
}

// ---------- o painel modelo ----------
function painel(nome, t) {
  const W = 960, H = 612, tinta = c(t, 'tinta'), t2 = c(t, 'tinta-2'), t3 = c(t, 'tinta-3'), sup = c(t, 'superficie'), borda = c(t, 'borda');
  let b = rect(0, 0, W, H, c(t, 'pagina'), { rx: 18 });
  // a faixa da marca
  b += rect(20, 20, 920, 72, c(t, 'marca-fundo'), { rx: 12 });
  b += `<g fill="none" stroke="${c(t, 'sobre-marca-2')}" stroke-width="3" stroke-linecap="round"><path d="M42 64V56M50 64V48M58 64v-6M66 64V44"/></g>`;
  b += text(80, 52, 'Custos da nuvem', { size: 18, weight: 650, fill: c(t, 'sobre-marca') });
  b += text(80, 74, 'Organização com 4 contas · dados até 14/03 · câmbio R$ 5,10', { size: 12, fill: c(t, 'sobre-marca-2') });
  b += rect(694, 40, 98, 32, c(t, 'marca-controle'), { rx: 8 });
  b += rect(698, 44, 46, 24, c(t, 'sobre-marca'), { rx: 6 });
  b += text(721, 60.5, 'US$', { size: 12, weight: 600, fill: c(t, 'marca-fundo'), anchor: 'middle' });
  b += text(768, 60.5, 'R$', { size: 12, fill: c(t, 'sobre-marca-2'), anchor: 'middle' });
  b += rect(804, 40, 116, 32, c(t, 'marca-controle'), { rx: 8, stroke: c(t, 'marca-borda') });
  b += text(862, 60.5, 'Sincronizar', { size: 13, fill: c(t, 'sobre-marca'), anchor: 'middle' });
  // as abas
  b += rect(20.5, 104.5, 919, 44, sup, { rx: 10, stroke: borda });
  b += rect(26, 110, 104, 32, c(t, 'acento'), { rx: 8 });
  b += text(78, 130.5, 'Visão geral', { size: 13, weight: 650, fill: c(t, 'sobre-acento'), anchor: 'middle' });
  [['Produtos', 170], ['Orçamento', 258], ['Projeções', 352], ['Anomalias', 444]].forEach(([n, x]) => { b += text(x, 130.5, n, { size: 13, fill: t2, anchor: 'middle' }); });
  // os números: um herói e três apoios
  const card = (x, y, w, h) => rect(x + 0.5, y + 0.5, w - 1, h - 1, sup, { rx: 12, stroke: borda });
  b += card(20, 160, 300, 112);
  b += text(36, 184, 'Projeção da fatura de março', { size: 12, fill: t2 });
  b += text(36, 224, '≈ US$ 1.240', { size: 34, weight: 650, fill: tinta });
  b += text(36, 246, 'faixa de US$ 1.180 a US$ 1.310', { size: 12, fill: t3 });
  b += text(36, 263, [tspan('▼ −3,4%', t.status['bom-texto'].$value, 600), tspan(' vs fevereiro', t3)].join(''), { size: 12, raw: true });
  [['Gasto até agora', 'US$ 562', '14 de 31 dias'], ['Sem tag', '18%', 'US$ 101 do uso'], ['Economia possível', 'US$ 86', 'por mês, 5 ações']].forEach(([l, v, s], i) => {
    const x = 332 + i * 206;
    b += card(x, 160, 196, 112);
    b += text(x + 16, 184, l, { size: 12, fill: t2 });
    b += text(x + 16, 218, v, { size: 26, weight: 650, fill: tinta });
    b += text(x + 16, 244, s, { size: 12, fill: t3 });
  });
  // a projeção por produto: barras de bala numa régua comum
  b += card(20, 284, 604, 308);
  b += text(36, 310, 'Projeção do mês por produto', { size: 14, weight: 650, fill: c(t, 'marca') });
  b += text(36, 328, 'a mesma régua em todas as linhas', { size: 11, fill: t3 });
  let lx = 36;
  [['até agora', serie(t, 1)], ['até o fim do mês', t.dado.previsto.$value]].forEach(([n, cor]) => {
    b += rect(lx, 340, 14, 8, cor, { rx: 2 }); b += text(lx + 20, 348, n, { size: 11, fill: t2 }); lx += 28 + n.length * 6.2;
  });
  b += line(lx, 344.5, lx + 14, 344.5, t.dado.faixa.$value, 2); b += text(lx + 20, 348, 'cenários', { size: 11, fill: t2 }); lx += 78;
  b += rect(lx, 338, 2, 12, tinta); b += text(lx + 8, 348, 'orçamento', { size: 11, fill: t2 });
  const P = [
    ['Portal', '5 recursos', 42.5, 92, 90, 95, 100, 3, null],
    ['Pagamentos', '3 recursos', 31.2, 68, 65, 71, 60, 2, 'deve passar do orçamento'],
    ['Relatórios', 'desde 10/03', 3.4, 24, 19, 31, null, 1, null],
    ['Integrações', '2 recursos', 3.1, 9.2, 7, 10.5, 12, 1, null],
  ];
  const bx = 150, bw = 270, X = (v) => bx + (bw * v) / 110;
  P.forEach(([n, sub, a, f, lo, hi, orc, conf, aviso], i) => {
    const y = 366 + i * 56;
    if (i) b += line(36, y - 12.5, 608, y - 12.5, c(t, 'grade'));
    b += text(36, y + 6, n, { size: 13, weight: 600, fill: tinta });
    b += text(36, y + 22, sub, { size: 11, fill: t3 });
    b += rect(bx, y - 2, bw, 10, c(t, 'superficie-3'), { rx: 4 });
    b += rect(X(a) + 2, y - 2, X(f) - X(a) - 2, 10, t.dado.previsto.$value, { rx: 4 });
    b += rect(bx, y - 2, X(a) - bx, 10, serie(t, 1), { rx: 2 });
    b += line(X(lo), y + 3, X(hi), y + 3, t.dado.faixa.$value, 2);
    b += line(X(lo), y - 1, X(lo), y + 7, t.dado.faixa.$value, 2); b += line(X(hi), y - 1, X(hi), y + 7, t.dado.faixa.$value, 2);
    if (orc) b += rect(X(orc) - 1, y - 7, 2, 20, tinta, { rx: 1 });
    if (aviso) b += text(bx, y + 26, [tspan('▲ ', t.status.alerta.$value), tspan(aviso, t.status['alerta-texto'].$value, 600)].join(''), { size: 11, raw: true });
    b += text(530, y + 6, `≈ US$ ${String(f).replace('.', ',')}`, { size: 14, weight: 650, fill: tinta, anchor: 'end' });
    b += text(530, y + 22, `até agora US$ ${String(a).replace('.', ',')}`, { size: 11, fill: t3, anchor: 'end' });
    for (let d = 0; d < 3; d++) b += circle(546 + d * 8, y + 2, 3, d < conf ? t2 : c(t, 'eixo'));
    b += text(572, y + 6, ['', 'baixa', 'média', 'alta'][conf], { size: 11, fill: t2 });
  });
  // o custo por dia: barras empilhadas, legenda sempre presente
  b += card(636, 284, 304, 308);
  b += text(652, 310, 'Custo por dia, por produto', { size: 14, weight: 650, fill: c(t, 'marca') });
  [['Portal', 1, 652, 334], ['Pagamentos', 2, 760, 334], ['Relatórios', 3, 652, 352], ['Integrações', 4, 760, 352]].forEach(([n, s, x, y]) => {
    b += rect(x, y - 8, 10, 10, serie(t, s), { rx: 2 }); b += text(x + 16, y + 1, n, { size: 11, fill: t2 });
  });
  const base = 566, rnd = sorteio(11);
  [0.33, 0.66, 1].forEach((fr) => { b += line(652, base - 170 * fr + 0.5, 924, base - 170 * fr + 0.5, c(t, 'grade')); });
  b += line(652, base + 0.5, 924, base + 0.5, c(t, 'eixo'));
  for (let k = 0; k < 14; k++) {
    let y = base;
    const x = 656 + k * 19.2;
    [0.36, 0.26, 0.12, 0.07].forEach((peso, s) => {
      const h = 170 * peso * (0.8 + rnd() * 0.4);
      b += rect(x, y - h, 12, h - 2, serie(t, s + 1), { rx: s === 3 ? 3 : 1 });
      y -= h;
    });
  }
  return svg(W, H, `Um painel executivo de exemplo no tema ${nome}: a faixa da marca, as abas, os números e as projeções`, b);
}

const pasta = join(raiz, 'imagens');
mkdirSync(pasta, { recursive: true });
const arquivos = {
  'capa.svg': capa(), 'rampas.svg': rampas(), 'series.svg': series(), 'escalas.svg': escalas(), 'status.svg': status(),
  'painel-claro.svg': painel('claro', TEMAS.claro), 'painel-escuro.svg': painel('escuro', TEMAS.escuro),
};
for (const [nome, conteudo] of Object.entries(arquivos)) writeFileSync(join(pasta, nome), conteudo);
console.log(`✓ ${Object.keys(arquivos).length} imagens em imagens/: ${Object.keys(arquivos).join(', ')}`);
