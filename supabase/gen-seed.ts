// Generates seed.sql from the app's actual deterministic mock data, so the
// seeded Postgres rows match the in-app dataset 1:1.
// Run: npx tsx supabase/gen-seed.ts   (from the repo root)
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SUPPLIERS } from '../apps/web/src/lib/data/suppliers'

const esc = (s: string) => s.replace(/'/g, "''")
const txt = (s: string | undefined) => (s == null ? 'null' : `'${esc(s)}'`)

const rows = SUPPLIERS.map((s) =>
  `('${s.id}','${esc(s.name)}','${s.country}','${esc(s.category)}','${s.segment}',` +
  `${s.tier},${s.scorecard},${s.riskScore},${s.onTimePct},${s.qualityPct},${s.ncrs},` +
  `'${esc(s.spend)}',${s.spendEur},'${JSON.stringify(s.trend)}'::jsonb,${txt(s.change)},${txt(s.reason)})`,
)

const sql =
  '-- Helio — supplier seed (generated from the app mock; do not edit by hand).\n' +
  `-- ${SUPPLIERS.length} rows. Run after schema.sql.\n` +
  'insert into public.suppliers\n' +
  '  (id,name,country,category,segment,tier,scorecard,risk_score,on_time_pct,quality_pct,ncrs,spend,spend_eur,trend,change,reason)\n' +
  'values\n' +
  rows.join(',\n') +
  '\non conflict (id) do nothing;\n'

const out = join(dirname(fileURLToPath(import.meta.url)), 'seed.sql')
writeFileSync(out, sql)
console.log(`wrote ${SUPPLIERS.length} rows -> ${out}`)
