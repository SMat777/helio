import type { Contact, Supplier } from '../types'
import { SUPPLIERS } from './suppliers'
import { seededRng, pickFrom, intBetween } from './seed'

const FIRST = ['Anna', 'Lars', 'Mette', 'Sofie', 'Jonas', 'Emma', 'Niels', 'Clara', 'Peter', 'Ida', 'Markus', 'Lena', 'Henrik', 'Julia', 'Thomas', 'Nina']
const LAST = ['Schmidt', 'Hansen', 'Müller', 'Rossi', 'García', 'Nielsen', 'Andersson', 'Dubois', 'Costa', 'Novak', 'Weber', 'Berg', 'Larsen', 'Kowalski']
const ROLES = ['Account Manager', 'Quality Lead', 'Logistics Coordinator', 'Commercial Director', 'Technical Contact', 'Compliance Officer']

function domainFrom(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '')
  return `${slug.slice(0, 14) || 'supplier'}.com`
}

function generate(s: Supplier): Contact[] {
  const rng = seededRng(`contacts:${s.id}`)
  const domain = domainFrom(s.name)
  const n = intBetween(rng, 2, 4)
  const usedRoles = new Set<string>(['Account Manager']) // primary always holds this
  const out: Contact[] = []
  for (let i = 0; i < n; i++) {
    const first = pickFrom(rng, FIRST)
    const last = pickFrom(rng, LAST)
    let role = 'Account Manager'
    if (i > 0) {
      role = pickFrom(rng, ROLES)
      while (usedRoles.has(role) && usedRoles.size < ROLES.length) role = pickFrom(rng, ROLES)
      usedRoles.add(role)
    }
    out.push({
      supplierId: s.id,
      name: `${first} ${last}`,
      role,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, '')}@${domain}`,
      phone: `+${intBetween(rng, 30, 49)} ${intBetween(rng, 100, 999)} ${intBetween(rng, 1000, 9999)}`,
      primary: i === 0,
    })
  }
  return out
}

export function getContacts(supplierId: string): Contact[] {
  const s = SUPPLIERS.find((x) => x.id === supplierId)
  return s ? generate(s) : []
}
