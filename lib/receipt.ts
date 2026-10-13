import type { CompanySettings, SaleListItem, SaleItem } from './types'

export interface ReceiptData {
  company: CompanySettings
  sale: SaleListItem
  items: SaleItem[]
}

export function generateReceiptHTML(data: ReceiptData, format: '58' | '80' | 'a4' = '80'): string {
  const { company, sale, items } = data

  const width = format === '58' ? '58mm' : format === '80' ? '80mm' : '80mm'
  const fontSize = format === '58' ? '10px' : '12px'
  const padding = format === '58' ? '4px' : '8px'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Comprovante #${sale.number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: ${fontSize};
      width: ${width};
      margin: 0 auto;
      background: white;
      color: black;
      padding: ${padding};
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
      border-bottom: 1px dashed black;
      padding-bottom: 10px;
    }
    .company-name {
      font-weight: bold;
      font-size: ${format === '58' ? '12px' : '14px'};
      margin-bottom: 4px;
    }
    .company-slogan {
      font-size: ${format === '58' ? '9px' : '10px'};
      margin-bottom: 4px;
    }
    .company-info {
      font-size: ${format === '58' ? '9px' : '10px'};
      margin-bottom: 2px;
    }
    .sale-info {
      margin: 10px 0;
      border-bottom: 1px dashed black;
      padding-bottom: 10px;
    }
    .sale-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .items {
      margin: 10px 0;
      border-bottom: 1px dashed black;
      padding-bottom: 10px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .item-name {
      flex: 1;
    }
    .item-qty {
      margin-right: 8px;
    }
    .item-total {
      text-align: right;
    }
    .totals {
      margin: 10px 0;
      border-top: 1px dashed black;
      padding-top: 10px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .total-row.final {
      font-weight: bold;
      font-size: ${format === '58' ? '12px' : '14px'};
      margin-top: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed black;
      font-size: ${format === '58' ? '8px' : '9px'};
    }
    .command-info {
      margin: 10px 0;
      padding: 8px;
      border: 1px solid black;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    ${company.logo_url ? `<img src="${company.logo_url}" alt="Logo" style="max-width: 60px; margin-bottom: 8px;">` : ''}
    <div class="company-name">${company.name}</div>
    ${company.slogan ? `<div class="company-slogan">${company.slogan}</div>` : ''}
    ${company.cnpj ? `<div class="company-info">CNPJ: ${company.cnpj}</div>` : ''}
    ${company.phone ? `<div class="company-info">Tel: ${company.phone}</div>` : ''}
    ${company.address ? `<div class="company-info">${company.address}</div>` : ''}
    ${company.city && company.state ? `<div class="company-info">${company.city} - ${company.state}</div>` : ''}
  </div>

  <div class="sale-info">
    <div class="sale-info-row">
      <span>COMPROVANTE DE VENDA</span>
      <span>#${sale.number}</span>
    </div>
    <div class="sale-info-row">
      <span>Data: ${new Date(sale.created_at).toLocaleString('pt-BR')}</span>
    </div>
    <div class="sale-info-row">
      <span>Funcionário: ${sale.user_name || 'N/A'}</span>
    </div>
    ${sale.customer_name ? `
    <div class="sale-info-row">
      <span>Cliente: ${sale.customer_name}</span>
    </div>
    ` : ''}
  </div>

  <div class="items">
    ${items.map(item => `
      <div class="item">
        <div class="item-name">${item.name}</div>
        <div class="item-qty">${item.quantity}x</div>
        <div class="item-total">${item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
      </div>
    `).join('')}
  </div>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>${sale.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
    </div>
    ${sale.discount > 0 ? `
    <div class="total-row">
      <span>Desconto</span>
      <span>-${sale.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
    </div>
    ` : ''}
    <div class="total-row final">
      <span>TOTAL</span>
      <span>${sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
    </div>
  </div>

  <div class="sale-info">
    <div class="sale-info-row">
      <span>Pagamento: ${getPaymentMethodLabel(sale.payment_method)}</span>
    </div>
    ${sale.payment_method === 'cash' && sale.amount_received ? `
    <div class="sale-info-row">
      <span>Recebido: ${sale.amount_received.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
    </div>
    <div class="sale-info-row">
      <span>Troco: ${sale.change_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
    </div>
    ` : ''}
  </div>

  ${sale.command_id ? `
  <div class="command-info">
    <div style="font-weight: bold; margin-bottom: 4px;">COMANDA #${sale.command_number}</div>
    <div>Vencimento: ${new Date(sale.command_due_date || '').toLocaleDateString('pt-BR')}</div>
    <div>Saldo em aberto: ${sale.command_balance?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}</div>
  </div>
  ` : ''}

  <div class="footer">
    <div>${company.receipt_footer || 'COMPROVANTE DE VENDA — NÃO É DOCUMENTO FISCAL'}</div>
    <div style="margin-top: 4px;">${new Date().toLocaleString('pt-BR')}</div>
  </div>
</body>
</html>
  `.trim()
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    debit: 'Débito',
    credit: 'Crédito',
    credit_term: 'A Prazo',
  }
  return labels[method] || method
}

export function printReceipt(html: string): void {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }
}

export function downloadReceiptPDF(html: string, filename: string): void {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    // Browser's print dialog will have "Save as PDF" option
    printWindow.print()
  }
}
