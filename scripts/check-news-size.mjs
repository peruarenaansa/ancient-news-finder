#!/usr/bin/env node
/**
 * news.json fitxategiaren tamaina-egiaztapena (gordina + gzip + brotli).
 * Build-aren ondoren exekuta daiteke, edo CI-n alerta sortzeko.
 *
 * Lovable hostingek (eta gehienek) automatikoki gzip/brotli zerbitzatzen dituzte
 * .json fitxategiak, baina hemen ratioa eta benetako tamaina egiazta daiteke.
 */
import { readFileSync, statSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { resolve } from 'node:path';

const PATH = resolve(process.cwd(), 'public/news.json');

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

try {
  const raw = readFileSync(PATH);
  const stat = statSync(PATH);
  const gz = gzipSync(raw);
  const br = brotliCompressSync(raw);

  console.log(`📰 ${PATH}`);
  console.log(`   Gordina: ${fmt(stat.size)}`);
  console.log(`   gzip:    ${fmt(gz.length)} (${((gz.length / stat.size) * 100).toFixed(1)}%)`);
  console.log(`   brotli:  ${fmt(br.length)} (${((br.length / stat.size) * 100).toFixed(1)}%)`);

  // Ohartarazpena tamaina handitzen bada
  if (stat.size > 500 * 1024) {
    console.warn('⚠️  news.json 500 KB-tik gora — paginatzea edo iragazte zorrotzagoa kontuan hartu.');
    process.exit(0);
  }
} catch (err) {
  console.error('Errorea:', err.message);
  process.exit(1);
}
