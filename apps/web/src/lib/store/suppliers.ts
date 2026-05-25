import { create } from 'zustand'
import type { Supplier } from '../types'
import { SUPPLIERS } from '../data/suppliers'

// In-memory mutable backing for the supplier list. Seeded from the deterministic
// mock; new suppliers are prepended so they surface at the top of every view.
// In fase 6 this store becomes the offline fallback behind the Supabase repo.
type SupplierStore = {
  suppliers: Supplier[]
  addSupplier: (s: Supplier) => void
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  suppliers: SUPPLIERS,
  addSupplier: (s) => set((state) => ({ suppliers: [s, ...state.suppliers] })),
}))

// Non-reactive read for plain accessors (called outside React render).
export function supplierList(): Supplier[] {
  return useSupplierStore.getState().suppliers
}

// Reactive selector for screens that must update live as suppliers are added.
export function useSuppliers(): Supplier[] {
  return useSupplierStore((s) => s.suppliers)
}

// Next free SUP-NNN id, one past the current numeric max.
export function nextSupplierId(): string {
  const max = supplierList().reduce((m, s) => {
    const n = parseInt(s.id.replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `SUP-${max + 1}`
}
