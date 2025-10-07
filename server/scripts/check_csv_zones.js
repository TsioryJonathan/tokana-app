#!/usr/bin/env node
/*
  Dry-run CSV zone classification report
  - Reads CSVs from client/data/
  - Uses server/config/zone_lexicon.json to classify `Lieu de livraison` into zoneLevel
  - Prints coverage and anomalies. No DB or API changes.
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// __dirname polyfill for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../client/data');
const LEXICON_PATH = path.resolve(__dirname, '../config/zone_lexicon.json');

function readFileIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function listCsvFiles(dir) {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith('.csv'))
      .map((f) => path.join(dir, f));
  } catch {
    return [];
  }
}

// Basic CSV parser with quote support
function parseCsv(content) {
  const rows = [];
  let i = 0;
  const len = content.length;
  let current = '';
  let row = [];
  let inQuotes = false;

  function pushCell() {
    row.push(current);
    current = '';
  }
  function pushRow() {
    // ignore empty trailing newline
    rows.push(row);
    row = [];
  }

  while (i < len) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        current += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (ch === ',') {
        pushCell();
        i++;
        continue;
      } else if (ch === '\n') {
        pushCell();
        pushRow();
        i++;
        continue;
      } else if (ch === '\r') {
        // handle CRLF
        i++;
        continue;
      } else {
        current += ch;
        i++;
        continue;
      }
    }
  }
  // last cell
  if (current.length > 0 || row.length > 0) {
    pushCell();
    pushRow();
  }
  return rows;
}

function normalize(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadLexicon() {
  const raw = readFileIfExists(LEXICON_PATH);
  if (!raw) throw new Error(`Lexicon not found at ${LEXICON_PATH}`);
  const json = JSON.parse(raw);
  const toNormList = (arr) => (Array.isArray(arr) ? arr.map((s) => normalize(s)).filter(Boolean) : []);
  return {
    ville: toNormList(json['ville']),
    peripherie: toNormList(json['peripherie']),
    superPeripherie: toNormList(json['super-peripherie'] || json['super_peripherie'] || []),
  };
}

function detectDeliveryField(headers) {
  // Try common headers
  const candidates = [
    'lieu de livraison',
    'destination',
    'adresse livraison',
  ];
  const normHeaders = headers.map(normalize);
  for (const c of candidates) {
    const idx = normHeaders.indexOf(c);
    if (idx >= 0) return idx;
  }
  // fuzzy contains
  for (let i = 0; i < normHeaders.length; i++) {
    if (normHeaders[i].includes('livraison')) return i;
  }
  return -1;
}

function classify(normPlace, lex) {
  if (!normPlace) return null;
  for (const k of lex.ville) {
    if (normPlace.includes(k)) return 'ville';
  }
  for (const k of lex.peripherie) {
    if (normPlace.includes(k)) return 'peripherie';
  }
  for (const k of lex.superPeripherie) {
    if (normPlace.includes(k)) return 'super-peripherie';
  }
  return null;
}

function analyzeCsv(file, lex) {
  const content = readFileIfExists(file);
  if (!content) return null;
  const rows = parseCsv(content);
  if (rows.length === 0) return null;

  const headers = rows[0];
  const data = rows.slice(1);
  const deliveryIdx = detectDeliveryField(headers);
  const dateIdx = headers.map(normalize).indexOf('date');

  let total = 0;
  let classified = 0;
  const unknown = [];

  for (const r of data) {
    if (!r || r.length === 0) continue;
    const place = r[deliveryIdx] || '';
    const normPlace = normalize(place);
    const zone = classify(normPlace, lex);
    total++;
    if (zone) {
      classified++;
    } else {
      unknown.push({ place: place, date: dateIdx >= 0 ? r[dateIdx] : '' });
    }
  }

  return { file, total, classified, coverage: total ? Math.round((classified / total) * 100) : 0, unknown };
}

function main() {
  const csvFiles = listCsvFiles(DATA_DIR);
  if (csvFiles.length === 0) {
    console.log(`[check_csv_zones] No CSV files found in ${DATA_DIR}`);
    process.exit(0);
  }
  const lex = loadLexicon();

  const reports = csvFiles.map((f) => analyzeCsv(f, lex)).filter(Boolean);
  if (reports.length === 0) {
    console.log('[check_csv_zones] No valid CSV content to analyze.');
    process.exit(0);
  }

  console.log('=== Zone Classification Report (dry-run) ===');
  for (const r of reports) {
    console.log(`\nFile: ${path.basename(r.file)}\nTotal rows: ${r.total}\nClassified: ${r.classified}\nCoverage: ${r.coverage}%`);
    const sample = r.unknown.slice(0, 10);
    if (sample.length > 0) {
      console.log('Unknown places (samples):');
      sample.forEach((u, idx) => console.log(`  ${idx + 1}. ${u.place} ${u.date ? `(date: ${u.date})` : ''}`));
      if (r.unknown.length > sample.length) {
        console.log(`  ... and ${r.unknown.length - sample.length} more`);
      }
    } else {
      console.log('No unknown places in the first pass.');
    }
  }

  console.log('\nTips: update server/config/zone_lexicon.json to improve coverage.');
}

main();
