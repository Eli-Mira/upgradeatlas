import {COST_FIELDS, normalizeCost, isValidCostString} from '../../../apps/web/src/costValidation.js'
export {COST_FIELDS}
export const EXAMPLE_COSTS = Object.freeze({ram_cost_egp:'2000',ssd_cost_egp:'3400',installation_cost_egp:'400',replacement_cost_egp:'45000'})

export function parseCents(value) {
  if (typeof value !== 'string') return null
  const normalized = normalizeCost(value)
  if (!isValidCostString(normalized)) return null
  const [whole, fraction = ''] = normalized.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2,'0'))
}

export function compareCosts(values) {
  const fields = Object.fromEntries(COST_FIELDS.map(key => [key,parseCents(values[key])]))
  const errors = COST_FIELDS.filter(key => fields[key] === null)
  if (errors.length) return {errors,result:null}
  const upgrade = fields.ram_cost_egp + fields.ssd_cost_egp + fields.installation_cost_egp
  const replacement = fields.replacement_cost_egp
  return {errors:[],result:{fields,upgrade,replacement,difference:Math.abs(replacement-upgrade),lower:upgrade<replacement?'upgrade':upgrade>replacement?'replacement':'equal'}}
}
