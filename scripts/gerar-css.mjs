#!/usr/bin/env node
/*
 * Gera o tokens.css a partir do tokens.json (a fonte única da paleta). Sem dependências: Node 18+.
 *
 *   node scripts/gerar-css.mjs              reescreve o tokens.css
 *   node scripts/gerar-css.mjs --conferir   só confere: sai com 1 se o tokens.css estiver desatualizado
 *
 * Ao mudar uma cor: edite o tokens.json, rode este script e depois o scripts/verificar.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(raiz, 'tokens.json'), 'utf8'));
const PASSOS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

function rampas() {
  const out = [];
  for (const nome of ['areia', 'ardosia', 'navy']) {
    const r = tokens.rampa[nome];
    const par = (lista) => '  ' + lista.map((s) => `--${nome}-${s}: ${r[s].$value};`).join(' ');
    out.push(par(PASSOS.slice(0, 6)), par(PASSOS.slice(6)));
  }
  return out.join('\n');
}

function tema(t) {
  const c = (k) => t.cor[k].$value;
  const out = [];
  out.push('  /* superfícies */');
  for (const k of ['pagina', 'superficie', 'superficie-2', 'superficie-3', 'borda', 'grade', 'eixo']) out.push(`  --cor-${k}: ${c(k)};`);
  out.push('  /* texto: tinta (principal), tinta-2 (secundário), tinta-3 (apagado, ainda AA) */');
  for (const k of ['tinta', 'tinta-2', 'tinta-3']) out.push(`  --cor-${k}: ${c(k)};`);
  out.push('  /* marca e interação */');
  for (const k of ['marca', 'acento', 'acento-hover', 'acento-suave', 'sobre-acento', 'link', 'foco']) out.push(`  --cor-${k}: ${c(k)};`);
  out.push('  /* a faixa da marca (o cabeçalho do app): fundo navy, controles e bordas nela, texto areia e navy claro */');
  for (const k of ['marca-fundo', 'marca-controle', 'marca-borda', 'sobre-marca', 'sobre-marca-2']) out.push(`  --cor-${k}: ${c(k)};`);
  out.push('  /* dados — categórica: ordem fixa, nunca reciclada; 9ª série em diante vai para "outros" */');
  for (let i = 1; i <= 8; i++) out.push(`  --serie-${i}: ${t.serie[i].$value}; /* ${t.serie[i].$description} */`);
  out.push(`  --serie-contexto: ${t.serie.contexto.$value}; /* o resto, quando uma série é o destaque */`);
  out.push(`  --serie-outros: ${t.serie.outros.$value}; /* a soma das séries que não cabem nas 8 */`);
  out.push(`  --dado-previsto: ${t.dado.previsto.$value}; /* o que falta até o fim do período numa projeção (o já realizado vai na cor da série) */`);
  out.push(`  --dado-faixa: ${t.dado.faixa.$value}; /* a faixa de cenários (mínimo a máximo) e as marcas de referência */`);
  out.push('  /* dados — sequencial (navy): seq-1 = pouco, seq-9 = muito */');
  for (let i = 1; i <= 9; i++) out.push(`  --seq-${i}: ${t.seq[i].$value};`);
  out.push('  /* dados — divergente: navy (abaixo, economia) ← neutro → terracota (acima, gasto a mais) */');
  for (const k of ['n4', 'n3', 'n2', 'n1', '0', 'p1', 'p2', 'p3', 'p4']) out.push(`  --div-${k}: ${t.div[k].$value};`);
  out.push('  /* status: só com ícone + rótulo; o preenchimento é para marcas, o -texto para letras (AA),');
  out.push('     o -sobre para o ícone desenhado em cima do preenchimento */');
  for (const k of ['bom', 'atencao', 'alerta', 'critico']) {
    out.push(`  --status-${k}: ${t.status[k].$value};`);
    out.push(`  --status-${k}-texto: ${t.status[`${k}-texto`].$value};`);
    out.push(`  --status-${k}-sobre: ${t.status[`${k}-sobre`].$value};`);
  }
  return out.join('\n');
}

const recuo = (txt) => txt.split('\n').map((l) => '  ' + l).join('\n');
const css = `/*!
 * Areia · Navy · Ardósia — paleta de cores v${tokens.versao}
 * A regra de cores dos projetos: superfícies em areia, texto em ardósia, marca
 * em navy; 8 cores de série validadas para daltonismo e contraste nos dois temas.
 * Documentação: README.md · Vitrine: index.html · Conferência: scripts/verificar.mjs
 *
 * Gerado de tokens.json por scripts/gerar-css.mjs: não edite à mão.
 *
 * Uso: <link rel="stylesheet" href="tokens.css"> e, no <html>, data-theme="light"
 * ou "dark" (sem o atributo, segue o tema do sistema). Escreva o CSS contra os
 * papéis (--cor-*, --serie-*, --status-*), nunca contra o hex.
 */

/* rampas (iguais nos dois temas): 50 = mais claro, 950 = mais escuro */
:root {
${rampas()}
  --fonte: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --fonte-numeros: tabular-nums; /* só em colunas de números e eixos */
}

/* tema claro (padrão) */
:root, :root[data-theme="light"] {
  color-scheme: light;
${tema(tokens.tema.claro)}
}

/* tema escuro: pelo sistema (sem data-theme) ou escolhido (data-theme="dark") */
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) {
    color-scheme: dark;
${recuo(tema(tokens.tema.escuro))}
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
${tema(tokens.tema.escuro)}
}
`;

const arquivo = join(raiz, 'tokens.css');
if (process.argv.includes('--conferir')) {
  const atual = readFileSync(arquivo, 'utf8');
  if (atual !== css) {
    console.error('✕ tokens.css está desatualizado: rode node scripts/gerar-css.mjs');
    process.exit(1);
  }
  console.log('✓ tokens.css confere com o tokens.json');
} else {
  writeFileSync(arquivo, css);
  console.log('✓ tokens.css gerado');
}
