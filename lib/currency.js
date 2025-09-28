/**
 * Format currency amount in Indian Rupees
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));
};

/**
 * Format large currency amounts with Indian number system (lakhs, crores)
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string with Indian numbering
 */
export const formatCurrencyCompact = (amount) => {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 10000000) { // 1 crore
    return `₹${(absAmount / 10000000).toFixed(1)}Cr`;
  } else if (absAmount >= 100000) { // 1 lakh
    return `₹${(absAmount / 100000).toFixed(1)}L`;
  } else if (absAmount >= 1000) { // 1 thousand
    return `₹${(absAmount / 1000).toFixed(1)}K`;
  } else {
    return `₹${absAmount.toFixed(0)}`;
  }
};