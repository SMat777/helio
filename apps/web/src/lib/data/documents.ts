import type { SupplierDocument, Supplier } from '../types'
import { SUPPLIERS } from './suppliers'
import { seededRng, intBetween, isoDate, NOW, addDays } from './seed'

type DocSpec = { category: string; fileType: SupplierDocument['fileType']; sizeLo: number; sizeHi: number }

const CATALOG: DocSpec[] = [
  { category: 'ISO 9001 Certificate', fileType: 'PDF', sizeLo: 180, sizeHi: 900 },
  { category: 'Quality Audit Report', fileType: 'PDF', sizeLo: 400, sizeHi: 2400 },
  { category: 'Master Supply Agreement', fileType: 'PDF', sizeLo: 300, sizeHi: 1200 },
  { category: 'Material Spec Sheet', fileType: 'XLSX', sizeLo: 40, sizeHi: 300 },
  { category: 'ESG Self-Assessment', fileType: 'DOCX', sizeLo: 120, sizeHi: 700 },
  { category: 'Insurance Certificate', fileType: 'PDF', sizeLo: 90, sizeHi: 400 },
  { category: 'Price List', fileType: 'CSV', sizeLo: 8, sizeHi: 90 },
]

function generate(s: Supplier): SupplierDocument[] {
  const rng = seededRng(`documents:${s.id}`)
  const n = intBetween(rng, 3, 6)
  const pool = [...CATALOG]
  const out: SupplierDocument[] = []
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(rng() * pool.length)
    const spec = pool.splice(idx, 1)[0]
    const date = addDays(NOW, -intBetween(rng, 10, 720))
    out.push({
      supplierId: s.id,
      name: `${spec.category}`,
      fileType: spec.fileType,
      category: spec.category.split(' ')[0],
      date: isoDate(date),
      sizeKb: intBetween(rng, spec.sizeLo, spec.sizeHi),
    })
  }
  return out.sort((a, b) => b.date.localeCompare(a.date))
}

export function getDocuments(supplierId: string): SupplierDocument[] {
  const s = SUPPLIERS.find((x) => x.id === supplierId)
  return s ? generate(s) : []
}
