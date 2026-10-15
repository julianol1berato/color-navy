#!/usr/bin/env node
/*
 * Confere a paleta Areia · Navy · Ardósia a partir do tokens.json, nos dois temas.
 * Sem dependências: Node 18+.
 *
 *   node scripts/verificar.mjs                 confere o tokens.json (sai com 1 se algo falhar)
 *   node scripts/verificar.mjs --series "#305eb7,#bb7e00,..." --fundo "#fffdf9"
 *                                              mede uma lista qualquer de cores de série
 *
 * O que é medido:
 *   - contraste WCAG 2.x (luminância relativa do sRGB);
 *   - distância de cor ΔE no OKLab (Björn Ottosson, 2020), multiplicada por 100;
 *   - daltonismo pela simulação de Machado, Oliveira e Fernandes (2009), severidade 1,0,
 *     aplicada no RGB linear; vale o pior entre protanopia e deuteranopia (tritanopia é
 *     rara e aparece só como informação).
 *
 * Limites (os mesmos do README):
 *   texto principal ≥ 7:1 · texto ≥ 4,5:1 · marcas de dado e foco ≥ 3:1 ·
 *   séries vizinhas: ΔE ≥ 8 com daltonismo e ≥ 15 com visão normal ·
 *   as 3 primeiras séries: as mesmas distâncias todas contra todas.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ---------- cor ----------
const hex2rgb = (hex) => {
  const h = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`cor inválida: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linear = (hex) => hex2rgb(hex).map(toLinear);

function luminance(hex) {
  const [r, g, b] = linear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function oklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
export const lightness = (hex) => oklab(linear(hex))[0];
export const chroma = (hex) => { const [, a, b] = oklab(linear(hex)); return Math.hypot(a, b); };

// Machado, Oliveira e Fernandes (2009), severidade 1,0, sobre o RGB linear
const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
function simulate(hex, kind) {
  const c = linear(hex);
  return MACHADO[kind].map((row) => Math.min(1, Math.max(0, row[0] * c[0] + row[1] * c[1] + row[2] * c[2])));
}
export function deltaE(a, b, kind) {
  const x = oklab(kind ? simulate(a, kind) : linear(a));
  const y = oklab(kind ? simulate(b, kind) : linear(b));
  return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}
export const deltaCVD = (a, b) => Math.min(deltaE(a, b, 'protan'), deltaE(a, b, 'deutan'));

// ---------- relatório ----------
const LIMITE = { texto: 4.5, principal: 7, grafico: 3, cvd: 8, normal: 15 };
const br = (v, d = 2) => v.toFixed(d).replace('.', ',');
let falhas = 0, avisos = 0;
function linha(ok, texto, aviso = false) {
  if (!ok && !aviso) falhas++;
  if (!ok && aviso) avisos++;
  console.log(`  ${ok ? '✓' : aviso ? '!' : '✕'} ${texto}`);
}

function series(cores, fundo, rotulo = '') {
  console.log(`  séries${rotulo} sobre ${fundo}`);
  cores.forEach(([nome, hex], i) => {
    const c = contrast(hex, fundo);
    linha(c >= LIMITE.grafico, `${i + 1} ${nome.padEnd(10)} ${hex}  ${br(c)}:1 (≥ 3:1)`);
  });
  let piorCvd = Infinity, piorNormal = Infinity, piorTritan = Infinity;
  for (let i = 1; i < cores.length; i++) {
    const [na, a] = cores[i - 1], [nb, b] = cores[i];
    const cvd = deltaCVD(a, b), nor = deltaE(a, b), tri = deltaE(a, b, 'tritan');
    piorCvd = Math.min(piorCvd, cvd); piorNormal = Math.min(piorNormal, nor); piorTritan = Math.min(piorTritan, tri);
    linha(cvd >= LIMITE.cvd && nor >= LIMITE.normal, `vizinhas ${na} × ${nb}: daltonismo ΔE ${br(cvd, 1)} (≥ 8), normal ΔE ${br(nor, 1)} (≥ 15)`);
  }
  let pior3 = Infinity;
  const tres = cores.slice(0, 3);
  for (let i = 0; i < tres.length; i++) {
    for (let j = i + 1; j < tres.length; j++) {
      const cvd = deltaCVD(tres[i][1], tres[j][1]), nor = deltaE(tres[i][1], tres[j][1]);
      pior3 = Math.min(pior3, cvd);
      linha(cvd >= LIMITE.cvd && nor >= LIMITE.normal, `as 3 primeiras, ${tres[i][0]} × ${tres[j][0]}: daltonismo ΔE ${br(cvd, 1)}, normal ΔE ${br(nor, 1)}`);
    }
  }
  console.log(`  resumo: pior vizinha com daltonismo ΔE ${br(piorCvd, 1)} · pior vizinha normal ΔE ${br(piorNormal, 1)} · ` +
    `pior entre as 3 primeiras ΔE ${br(pior3, 1)} · tritanopia (informação) ΔE ${br(piorTritan, 1)}`);
  return { piorCvd, piorNormal, pior3 };
}

function tema(nome, t) {
  const v = (grupo, k) => t[grupo][k].$value;
  const cor = (k) => v('cor', k);
  console.log(`\n=== tema ${nome}`);
  const pares = [
    ['tinta', 'superficie', LIMITE.principal], ['tinta', 'pagina', LIMITE.principal],
    ['tinta-2', 'superficie', LIMITE.texto], ['tinta-2', 'superficie-2', LIMITE.texto], ['tinta-2', 'pagina', LIMITE.texto],
    ['tinta-3', 'superficie', LIMITE.texto], ['tinta-3', 'superficie-2', LIMITE.texto], ['tinta-3', 'superficie-3', LIMITE.texto],
    ['tinta-3', 'pagina', LIMITE.texto],
    ['marca', 'superficie', LIMITE.principal], ['link', 'superficie', LIMITE.texto], ['link', 'pagina', LIMITE.texto],
    ['sobre-acento', 'acento', LIMITE.texto], ['sobre-acento', 'acento-hover', LIMITE.texto],
    ['acento', 'superficie', LIMITE.grafico], ['foco', 'superficie', LIMITE.grafico], ['foco', 'pagina', LIMITE.grafico],
    ['sobre-marca', 'marca-fundo', LIMITE.principal], ['sobre-marca-2', 'marca-fundo', LIMITE.texto],
    ['sobre-marca', 'marca-controle', LIMITE.texto], ['sobre-marca-2', 'marca-controle', LIMITE.texto],
    ['marca-fundo', 'sobre-marca', LIMITE.texto], // o controle escolhido na faixa: fundo areia, letra navy
  ];
  console.log('  texto e interface');
  for (const [a, b, min] of pares) {
    const c = contrast(cor(a), cor(b));
    linha(c >= min, `${a} ${cor(a)} sobre ${b} ${cor(b)}: ${br(c)}:1 (≥ ${br(min, 1)}:1)`);
  }
  const fundo = cor('superficie');
  const faixa = contrast(v('dado', 'faixa'), fundo);
  linha(faixa >= LIMITE.grafico, `dado-faixa ${v('dado', 'faixa')}: ${br(faixa)}:1 (≥ 3:1)`);
  console.log('  status (o -texto é para letras; o preenchimento vai sempre com ícone e rótulo)');
  for (const k of ['bom', 'atencao', 'alerta', 'critico']) {
    const ct = contrast(v('status', `${k}-texto`), fundo), cf = contrast(v('status', k), fundo);
    linha(ct >= LIMITE.texto, `${k}-texto ${v('status', `${k}-texto`)}: ${br(ct)}:1 (≥ 4,5:1)`);
    linha(cf >= LIMITE.grafico, `${k} ${v('status', k)}: ${br(cf)}:1 (marca sozinha pediria ≥ 3:1)`, true);
    const cs = contrast(v('status', `${k}-sobre`), v('status', k));
    linha(cs >= LIMITE.texto, `${k}-sobre ${v('status', `${k}-sobre`)} sobre ${k}: ${br(cs)}:1 (≥ 4,5:1)`);
  }
  const lista = Object.keys(t.serie).filter((k) => /^\d+$/.test(k)).sort((a, b) => a - b)
    .map((k) => [t.serie[k].$description || k, t.serie[k].$value]);
  const r = series(lista, fundo);

  // sequencial: o "pouco" fica perto da superfície e cada passo se afasta mais dela
  const Lf = lightness(fundo);
  const seq = Object.keys(t.seq).sort((a, b) => a - b).map((k) => t.seq[k].$value);
  const dist = seq.map((h) => Math.abs(lightness(h) - Lf));
  linha(dist.every((d, i) => i === 0 || d > dist[i - 1]), `sequencial: cada passo mais longe da superfície (L ${seq.map((h) => br(lightness(h))).join(' ')})`);

  // divergente: meio neutro (croma baixo) e cada braço se afastando do meio
  const ord = ['n4', 'n3', 'n2', 'n1', '0', 'p1', 'p2', 'p3', 'p4'].map((k) => t.div[k].$value);
  const meio = ord[4];
  linha(chroma(meio) < 0.03, `divergente: meio neutro ${meio} (croma ${br(chroma(meio), 3)} < 0,03)`);
  const afasta = (lado) => lado.every((h, i) => i === 0 || deltaE(h, meio) > deltaE(lado[i - 1], meio));
  linha(afasta(ord.slice(0, 4).reverse()) && afasta(ord.slice(5)), 'divergente: cada braço se afasta do meio a cada passo');
  return r;
}

// ---------- entrada (só quando chamado direto; importado, só exporta as funções) ----------
function main(args) {
  const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  if (arg('--series')) {
    const cores = arg('--series').split(',').map((h, i) => [`s${i + 1}`, h.trim()]);
    series(cores, arg('--fundo') || '#ffffff');
  } else {
    const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
    const tokens = JSON.parse(readFileSync(join(raiz, 'tokens.json'), 'utf8'));
    console.log(`Areia · Navy · Ardósia v${tokens.versao}`);
    for (const [nome, t] of Object.entries(tokens.tema)) tema(nome, t);
  }
  console.log(`\n${falhas ? `✕ ${falhas} falha(s)` : '✓ tudo passa'}${avisos ? ` · ${avisos} aviso(s)` : ''}`);
  process.exit(falhas ? 1 : 0);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
