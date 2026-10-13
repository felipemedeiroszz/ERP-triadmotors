'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, Minus, Trash2, ShoppingBag, Calendar as CalendarIcon, DollarSign, Printer, X, Keyboard } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CompanySettings, Profile } from '@/lib/types'

interface CartItem {
  product_id: string
  sku: string
  name: string
  unit: string
  quantity: number
  unit_price: number
  discount: number
  total: number
  image_url?: string
  stock: number
}

interface PDVClientProps {
  customers: { id: string; name: string; phone: string | null }[]
  settings: CompanySettings | null
  userProfile: Profile
}

export function PDVClient({ customers, settings, userProfile }: PDVClientProps) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pix' | 'debit' | 'credit' | 'credit_term'>('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [newCustomerDialog, setNewCustomerDialog] = useState(false)
  const [checkoutDialog, setCheckoutDialog] = useState(false)
  const [printDialog, setPrintDialog] = useState(false)
  const [paymentShortcutDialog, setPaymentShortcutDialog] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)
  const [lastCart, setLastCart] = useState<CartItem[]>([])
  const [lastSelectedCustomer, setLastSelectedCustomer] = useState<string | null>(null)
  const [lastPaymentMethod, setLastPaymentMethod] = useState<'cash' | 'pix' | 'debit' | 'credit' | 'credit_term'>('cash')
  const [lastAmountReceived, setLastAmountReceived] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const discount = cart.reduce((sum, item) => sum + item.discount, 0)
  const total = subtotal - discount
  const change = amountReceived ? parseFloat(amountReceived) - total : 0

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchProducts()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F10 opens payment method selection
      if (e.key === 'F10') {
        e.preventDefault()
        setPaymentShortcutDialog(true)
      }

      // Number keys for payment methods
      if (paymentShortcutDialog) {
        if (e.key === '1') {
          setPaymentMethod('cash')
          setPaymentShortcutDialog(false)
        } else if (e.key === '2') {
          setPaymentMethod('pix')
          setPaymentShortcutDialog(false)
        } else if (e.key === '3') {
          setPaymentMethod('debit')
          setPaymentShortcutDialog(false)
        } else if (e.key === '4') {
          setPaymentMethod('credit')
          setPaymentShortcutDialog(false)
        } else if (e.key === '5') {
          setPaymentMethod('credit_term')
          setPaymentShortcutDialog(false)
        } else if (e.key === 'Escape') {
          setPaymentShortcutDialog(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [paymentShortcutDialog])

  const searchProducts = async () => {
    setSearching(true)
    try {
      const { data } = await supabase
        .from('products')
        .select(`
          id, sku, barcode, name, unit, sale_price, stock,
          images:product_images(url, is_primary)
        `)
        .or(`sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .eq('active', true)
        .gt('stock', 0)
        .limit(10)

      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setSearching(false)
    }
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.product_id === product.id)

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Estoque insuficiente')
        return
      }
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
            : item
        )
      )
    } else {
      const primaryImage = product.images?.find((img: any) => img.is_primary)
      setCart([
        ...cart,
        {
          product_id: product.id,
          sku: product.sku,
          name: product.name,
          unit: product.unit,
          quantity: 1,
          unit_price: product.sale_price,
          discount: 0,
          total: product.sale_price,
          image_url: primaryImage?.url,
          stock: product.stock,
        },
      ])
    }

    setSearchTerm('')
    setSearchResults([])
  }

  const updateQuantity = (product_id: string, quantity: number) => {
    const item = cart.find((i) => i.product_id === product_id)
    if (!item) return

    if (quantity <= 0) {
      removeFromCart(product_id)
      return
    }

    if (quantity > item.stock) {
      toast.error('Estoque insuficiente')
      return
    }

    setCart(
      cart.map((i) =>
        i.product_id === product_id
          ? { ...i, quantity, total: quantity * i.unit_price }
          : i
      )
    )
  }

  const removeFromCart = (product_id: string) => {
    setCart(cart.filter((item) => item.product_id !== product_id))
  }

  const handlePrintReceipt = async () => {
    if (!lastSale) return

    try {
      const { data: settings } = await supabase
        .from('company_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (settings) {
        const { generateReceiptHTML, printReceipt } = await import('@/lib/receipt')

        // Calculate totals from last cart
        const lastSubtotal = lastCart.reduce((sum, item) => sum + item.total, 0)
        const lastDiscount = lastCart.reduce((sum, item) => sum + item.discount, 0)
        const lastTotal = lastSubtotal - lastDiscount

        const html = generateReceiptHTML(
          {
            company: settings,
            sale: {
              id: lastSale.id,
              number: lastSale.number,
              customer_id: lastSelectedCustomer,
              user_id: userProfile.id,
              subtotal: lastSubtotal,
              items_discount: lastDiscount,
              discount: 0,
              total: lastTotal,
              payment_method: lastPaymentMethod,
              amount_received: lastPaymentMethod === 'cash' ? parseFloat(lastAmountReceived) : null,
              change_amount: lastPaymentMethod === 'cash' ? (parseFloat(lastAmountReceived) - lastTotal) : 0,
              status: 'completed',
              notes: null,
              cancelled_at: null,
              cancel_reason: null,
              created_at: new Date().toISOString(),
              customer_name: customers.find(c => c.id === lastSelectedCustomer)?.name || null,
              user_name: userProfile.full_name,
              command_number: null,
              command_id: null,
              command_due_date: null,
              command_balance: null,
            },
            items: lastCart.map(item => ({
              id: crypto.randomUUID(),
              product_id: item.product_id,
              sku: item.sku,
              name: item.name,
              unit: item.unit,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount: item.discount,
              total: item.total,
            })),
          },
          settings.receipt_format as '58' | '80' | 'a4'
        )
        printReceipt(html)
      }
    } catch (printError) {
      console.error('Error printing receipt:', printError)
      toast.error('Erro ao imprimir comprovante')
    }
    setPrintDialog(false)
    setLastSale(null)
    setLastCart([])
    setLastSelectedCustomer(null)
    setLastPaymentMethod('cash')
    setLastAmountReceived('')
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Carrinho vazio')
      return
    }

    if (paymentMethod === 'credit_term' && !selectedCustomer) {
      toast.error('Selecione um cliente para venda a prazo')
      return
    }

    if (paymentMethod === 'credit_term' && !dueDate) {
      toast.error('Informe a data de vencimento')
      return
    }

    if (paymentMethod === 'cash' && (!amountReceived || parseFloat(amountReceived) < total)) {
      toast.error('Informe o valor recebido')
      return
    }

    setLoading(true)

    try {
      // Get next sale number
      const { data: saleNumberData } = await supabase.rpc('get_next_sale_number')
      const saleNumber = saleNumberData

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          number: saleNumber,
          customer_id: selectedCustomer,
          user_id: userProfile.id,
          subtotal,
          items_discount: discount,
          discount: 0,
          total,
          payment_method: paymentMethod,
          amount_received: paymentMethod === 'cash' ? parseFloat(amountReceived) : null,
          change_amount: paymentMethod === 'cash' ? change : 0,
          status: 'completed',
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        total: item.total,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Update stock
      for (const item of cart) {
        await supabase.rpc('update_product_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
          p_type: 'out',
          p_reason: `Venda #${saleNumber}`,
          p_user_id: userProfile.id,
          p_reference_id: sale.id,
          p_reference_type: 'sale',
        })
      }

      // Create command if credit term
      if (paymentMethod === 'credit_term') {
        const { data: commandNumberData } = await supabase.rpc('get_next_command_number')
        const commandNumber = commandNumberData

        const { error: commandError } = await supabase
          .from('commands')
          .insert({
            number: commandNumber,
            sale_id: sale.id,
            customer_id: selectedCustomer,
            total,
            paid_amount: 0,
            dueDate,
            status: 'open',
          })

        if (commandError) throw commandError
      }

      // Save sale data for printing
      setLastSale({ id: sale.id, number: saleNumber })
      setLastCart([...cart])
      setLastSelectedCustomer(selectedCustomer)
      setLastPaymentMethod(paymentMethod)
      setLastAmountReceived(amountReceived)

      // Show print dialog
      setPrintDialog(true)

      toast.success('Venda realizada com sucesso!')
      setCart([])
      setSelectedCustomer(null)
      setAmountReceived('')
      setDueDate('')
      setCheckoutDialog(false)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar venda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Product Search */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-gray-900 border-gray-800 h-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Buscar Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Digite código, nome ou escaneie código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                autoFocus
              />
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
                {searchResults.map((product) => {
                  const primaryImage = product.images?.find((img: any) => img.is_primary)
                  return (
                    <Card
                      key={product.id}
                      className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {primaryImage ? (
                            <Avatar className="h-16 w-16 rounded">
                              <AvatarImage src={primaryImage.url} alt={product.name} />
                              <AvatarFallback className="bg-gray-700">
                                {product.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-16 w-16 rounded bg-gray-700 flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.sku}</p>
                            <p className="text-sm font-bold text-red-500 mt-1">
                              {Number(product.sale_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <p className="text-xs text-gray-500">Estoque: {product.stock}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="space-y-4">
        <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-white">Carrinho</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label className="text-gray-300">Cliente</Label>
              <Select value={selectedCustomer || ''} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Consumidor final" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="">Consumidor final</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cart Items */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[40vh]">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.sku}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-400 h-6 w-6"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 border-gray-700 text-white hover:bg-gray-700"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 border-gray-700 text-white hover:bg-gray-700"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-white font-bold">
                        {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-gray-800 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Desconto</span>
                <span className="text-white">-{discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-red-500">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Forma de Pagamento</Label>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Keyboard className="h-3 w-3" />
                  <span>F10</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Card
                  className={`bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors ${paymentMethod === 'cash' ? 'border-red-600 ring-1 ring-red-600' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">1</div>
                    <div className="text-white font-medium text-sm">Dinheiro</div>
                  </CardContent>
                </Card>
                <Card
                  className={`bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors ${paymentMethod === 'pix' ? 'border-red-600 ring-1 ring-red-600' : ''}`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">2</div>
                    <div className="text-white font-medium text-sm">PIX</div>
                  </CardContent>
                </Card>
                <Card
                  className={`bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors ${paymentMethod === 'debit' ? 'border-red-600 ring-1 ring-red-600' : ''}`}
                  onClick={() => setPaymentMethod('debit')}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">3</div>
                    <div className="text-white font-medium text-sm">Débito</div>
                  </CardContent>
                </Card>
                <Card
                  className={`bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors ${paymentMethod === 'credit' ? 'border-red-600 ring-1 ring-red-600' : ''}`}
                  onClick={() => setPaymentMethod('credit')}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">4</div>
                    <div className="text-white font-medium text-sm">Crédito</div>
                  </CardContent>
                </Card>
                <Card
                  className={`bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors col-span-2 ${paymentMethod === 'credit_term' ? 'border-red-600 ring-1 ring-red-600' : ''}`}
                  onClick={() => setPaymentMethod('credit_term')}
                >
                  <CardContent className="p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">5</div>
                    <div className="text-white font-medium text-sm">A Prazo</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cash Payment */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label className="text-gray-300">Valor Recebido</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="0.00"
                />
                {change > 0 && (
                  <p className="text-sm text-green-400">
                    Troco: {change.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                )}
              </div>
            )}

            {/* Credit Term */}
            {paymentMethod === 'credit_term' && (
              <div className="space-y-2">
                <Label className="text-gray-300">Data de Vencimento</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            )}

            {/* Checkout Button */}
            <Button
              onClick={() => setCheckoutDialog(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={cart.length === 0 || loading}
            >
              {loading ? (
                'Processando...'
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Finalizar Venda
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={checkoutDialog} onOpenChange={setCheckoutDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Venda</DialogTitle>
            <DialogDescription className="text-gray-400">
              Revise os detalhes da venda antes de confirmar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.quantity}x {item.name}</span>
                  <span className="text-white">{item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-red-500">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-400">Pagamento: <span className="text-white capitalize">{paymentMethod === 'credit_term' ? 'A Prazo' : paymentMethod}</span></p>
              {selectedCustomer && (
                <p className="text-gray-400">Cliente: <span className="text-white">{customers.find(c => c.id === selectedCustomer)?.name}</span></p>
              )}
              {paymentMethod === 'cash' && (
                <p className="text-gray-400">Troco: <span className="text-green-400">{change.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCheckoutDialog(false)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button onClick={handleCheckout} className="bg-red-600 hover:bg-red-700 text-white">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Receipt Dialog */}
      <Dialog open={printDialog} onOpenChange={setPrintDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Imprimir Comprovante</DialogTitle>
            <DialogDescription className="text-gray-400">
              Deseja imprimir o comprovante da venda?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPrintDialog(false)
                setLastSale(null)
              }}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Não
            </Button>
            <Button onClick={handlePrintReceipt} className="bg-red-600 hover:bg-red-700 text-white">
              Sim, Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Shortcut Dialog */}
      <Dialog open={paymentShortcutDialog} onOpenChange={setPaymentShortcutDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Selecione a Forma de Pagamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pressione o número ou clique na opção desejada
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Card
              className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
              onClick={() => {
                setPaymentMethod('cash')
                setPaymentShortcutDialog(false)
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">1</div>
                <div className="text-white font-medium">Dinheiro</div>
              </CardContent>
            </Card>
            <Card
              className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
              onClick={() => {
                setPaymentMethod('pix')
                setPaymentShortcutDialog(false)
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">2</div>
                <div className="text-white font-medium">PIX</div>
              </CardContent>
            </Card>
            <Card
              className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
              onClick={() => {
                setPaymentMethod('debit')
                setPaymentShortcutDialog(false)
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">3</div>
                <div className="text-white font-medium">Débito</div>
              </CardContent>
            </Card>
            <Card
              className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
              onClick={() => {
                setPaymentMethod('credit')
                setPaymentShortcutDialog(false)
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">4</div>
                <div className="text-white font-medium">Crédito</div>
              </CardContent>
            </Card>
            <Card
              className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors col-span-2"
              onClick={() => {
                setPaymentMethod('credit_term')
                setPaymentShortcutDialog(false)
              }}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">5</div>
                <div className="text-white font-medium">A Prazo</div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentShortcutDialog(false)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Cancelar (ESC)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
