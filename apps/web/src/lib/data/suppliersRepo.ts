// Async suppliers repository — the one flow wired end-to-end through a backend.
// Reads/writes Supabase when configured, otherwise the in-memory mock store.
// This is the sync→async boundary: react-query (below) absorbs loading/error so
// the screens don't hand-roll useState/useEffect for fetching.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Supplier, Tier } from '../types'
import { getSupabase } from '../supabase'
import { useSupplierStore } from '../store/suppliers'

const QUERY_KEY = ['suppliers'] as const

// Postgres row (snake_case) ↔ Supplier (camelCase).
type Row = {
  id: string; name: string; country: string; category: string
  segment: Supplier['segment']; tier: number; scorecard: number; risk_score: number
  on_time_pct: number; quality_pct: number; ncrs: number
  spend: string; spend_eur: number; trend: number[]; change: string | null; reason: string | null
}

function fromRow(r: Row): Supplier {
  return {
    id: r.id, name: r.name, country: r.country, category: r.category,
    segment: r.segment, tier: r.tier as Tier, scorecard: r.scorecard, riskScore: r.risk_score,
    onTimePct: Number(r.on_time_pct), qualityPct: r.quality_pct, ncrs: r.ncrs,
    spend: r.spend, spendEur: Number(r.spend_eur), trend: r.trend ?? [],
    change: r.change ?? undefined, reason: r.reason ?? undefined,
  }
}

function toRow(s: Supplier) {
  return {
    id: s.id, name: s.name, country: s.country, category: s.category, segment: s.segment,
    tier: s.tier, scorecard: s.scorecard, risk_score: s.riskScore, on_time_pct: s.onTimePct,
    quality_pct: s.qualityPct, ncrs: s.ncrs, spend: s.spend, spend_eur: s.spendEur,
    trend: s.trend, change: s.change ?? null, reason: s.reason ?? null,
  }
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const sb = await getSupabase()
  if (sb) {
    const { data, error } = await sb.from('suppliers').select('*')
    if (error) throw new Error(error.message)
    return (data as Row[]).map(fromRow)
  }
  return useSupplierStore.getState().suppliers
}

export async function insertSupplier(s: Supplier): Promise<void> {
  const sb = await getSupabase()
  if (sb) {
    const { error } = await sb.from('suppliers').insert(toRow(s))
    if (error) throw new Error(error.message)
    return
  }
  useSupplierStore.getState().addSupplier(s)
}

export function useSuppliersQuery() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: fetchSuppliers })
}

export function useAddSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: insertSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
