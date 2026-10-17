export const COST_FIELDS = ['ram_cost_egp', 'ssd_cost_egp', 'installation_cost_egp', 'replacement_cost_egp']

// Accept Arabic-Indic/Persian digits and the Arabic decimal separator, not grouping separators.
export function normalizeCost(value) {
  return value.trim().replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x6f0)).replace(/٫/g, '.')
}

export function isValidCostString(value) {
  return typeof value === 'string' && !/\s/.test(value) && /^(?:0|[1-9][0-9]{0,6})(?:\.[0-9]{1,2})?$/.test(value)
}
