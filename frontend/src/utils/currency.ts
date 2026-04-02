// Format price in Ghana Cedis (GHS)
export const formatPrice = (amount: number): string => {
  return `GHS ${amount.toFixed(2)}`
}

// Format currency short (for display in cards)
export const formatPriceShort = (amount: number): string => {
  return `₵${amount.toFixed(2)}`
}
