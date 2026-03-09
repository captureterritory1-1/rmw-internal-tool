const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
]

function twoDigitWords(n: number): string {
  if (n < 20) return ones[n]
  return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only'

  const n = Math.round(num)
  if (n === 0) return 'Zero Rupees Only'

  let result = ''

  // Crore (1,00,00,000)
  const crore = Math.floor(n / 10000000)
  if (crore > 0) {
    result += twoDigitWords(crore) + ' Crore '
  }

  // Lakh (1,00,000)
  const lakh = Math.floor((n % 10000000) / 100000)
  if (lakh > 0) {
    result += twoDigitWords(lakh) + ' Lakh '
  }

  // Thousand
  const thousand = Math.floor((n % 100000) / 1000)
  if (thousand > 0) {
    result += twoDigitWords(thousand) + ' Thousand '
  }

  // Hundred
  const hundred = Math.floor((n % 1000) / 100)
  if (hundred > 0) {
    result += ones[hundred] + ' Hundred '
  }

  // Remaining
  const remainder = n % 100
  if (remainder > 0) {
    if (result) result += 'and '
    result += twoDigitWords(remainder)
  }

  return result.trim() + ' Rupees Only'
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}
