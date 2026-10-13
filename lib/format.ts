import type { PaymentMethod } from './types'

export const TZ = 'America/Sao_Paulo'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 })

export const formatCurrency = (v: number | string | null | undefined) => brl.format(Number(v ?? 0))
export const formatNumber = (v: number | string | null | undefined) => num.format(Number(v ?? 0))

export function formatDate(v: string | Date | null | undefined) {
  if (!v) return '—'
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split('-')
    return `${d}/${m}/${y}`
  }
  return new Date(v).toLocaleDateString('pt-BR', { timeZone: TZ })
}

export function formatDateTime(v: string | Date | null | undefined) {
  if (!v) return '—'
  return new Date(v).toLocaleString('pt-BR', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })
}

export function todayISO(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000)
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  debit: 'Débito',
  credit: 'Crédito',
  credit_term: 'A prazo',
  boleto: 'Boleto',
  transfer: 'Transferência',
}

export const paymentLabel = (m: PaymentMethod | string | null | undefined) => (m ? PAYMENT_LABELS[m] ?? m : '—')

export const UNITS = ['UN', 'PC', 'PAR', 'JG', 'KIT', 'CX', 'L', 'ML', 'KG', 'M']
export const INTEGER_UNITS = ['UN', 'PC', 'PAR', 'JG', 'KIT', 'CX']

export function parseDecimal(v: string | number | null | undefined): number {
  if (typeof v === 'number') return v
  if (!v) return 0
  const s = String(v).trim().replace(/\s/g, '').replace(/R\$/i, '')
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  const n = Number(normalized)
  return Number.isFinite(n) ? n : NaN
}

export const onlyDigits = (v: string | null | undefined) => (v ?? '').replace(/\D/g, '')

export function formatDocument(v: string | null | undefined) {
  const d = onlyDigits(v)
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return v || '—'
}

export function formatPhone(v: string | null | undefined) {
  const d = onlyDigits(v)
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return v || '—'
}

export function errorMessage(e: unknown, fallback = 'Ocorreu um erro inesperado.') {
  if (!e) return fallback
  const msg = typeof e === 'string' ? e : (e as { message?: string }).message
  if (!msg) return fallback
  if (msg.includes('products_sku_unique')) return 'Já existe um produto com este código.'
  if (msg.includes('products_barcode_unique')) return 'Já existe um produto com este código de barras.'
  if (msg.includes('customers_document_unique')) return 'Já existe um cliente com este CPF/CNPJ.'
  if (msg.includes('violates foreign key')) return 'Registro vinculado a outros dados; não pode ser removido.'
  if (msg.includes('row-level security') || msg.includes('permission denied')) return 'Você não tem permissão para esta ação.'
  if (msg.includes('duplicate key')) return 'Registro duplicado.'
  return msg
}

export function csvEscape(v: unknown) {
  const s = v == null ? '' : String(v)
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
