import { createClient } from './client'

export async function logAudit(action: string, entity: string, entityId?: string, details?: any) {
  const supabase = createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      entity,
      entity_id: entityId,
      details: details || null,
    })
  } catch (error) {
    console.error('Error logging audit:', error)
  }
}

export async function logSaleCreated(saleId: string, saleNumber: number, total: number) {
  await logAudit('sale_created', 'sales', saleId, {
    sale_number: saleNumber,
    total,
  })
}

export async function logProductCreated(productId: string, name: string, sku: string) {
  await logAudit('product_created', 'products', productId, {
    name,
    sku,
  })
}

export async function logProductUpdated(productId: string, name: string) {
  await logAudit('product_updated', 'products', productId, {
    name,
  })
}

export async function logStockMovement(productId: string, type: string, quantity: number) {
  await logAudit('stock_movement', 'stock_movements', productId, {
    type,
    quantity,
  })
}

export async function logUserActivated(userId: string, userName: string) {
  await logAudit('user_activated', 'profiles', userId, {
    user_name: userName,
  })
}

export async function logUserDeactivated(userId: string, userName: string) {
  await logAudit('user_deactivated', 'profiles', userId, {
    user_name: userName,
  })
}

export async function logSettingsUpdated() {
  await logAudit('settings_updated', 'company_settings')
}
