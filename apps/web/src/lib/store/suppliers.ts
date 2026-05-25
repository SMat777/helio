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

// Non-reactive read for plain accessors and the repo's mock fallback.
export function supplierList(): Supplier[] {
  return useSupplierStore.getState().suppliers
}
