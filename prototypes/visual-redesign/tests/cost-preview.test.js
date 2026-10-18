import test from 'node:test'
import assert from 'node:assert/strict'
import {COST_FIELDS,parseCents,compareCosts,EXAMPLE_COSTS} from '../src/prototype-calc.js'

const costs=(...values)=>Object.fromEntries(COST_FIELDS.map((key,index)=>[key,values[index]??'0']))

test('preview preserves normalized Arabic/Persian decimal amounts as integer cents',()=>{
  for(const value of ['12.34','١٢٫٣٤','۱۲٫۳۴',' 12.34 ']) assert.equal(parseCents(value),1234)
  assert.equal(parseCents('0'),0)
  assert.equal(parseCents('9999999.99'),999999999)
})
test('preview rejects ambiguous, grouped, negative, overprecision and out-of-range amounts',()=>{
  for(const value of ['',undefined,null,12,'1,000','١٬٠٠٠','-1','01','0.001','10000000','1e3']) assert.equal(parseCents(value),null)
})
test('fractional additions are exact and equal costs have no favored option',()=>{
  const {result,errors}=compareCosts(costs('0.10','0.20','0.30','0.60'))
  assert.deepEqual(errors,[])
  assert.equal(result.upgrade,60)
  assert.equal(result.replacement,60)
  assert.equal(result.difference,0)
  assert.equal(result.lower,'equal')
})
test('zero costs remain valid, including an all-zero equal comparison',()=>{
  const {result}=compareCosts(costs())
  assert.equal(result.upgrade,0)
  assert.equal(result.replacement,0)
  assert.equal(result.lower,'equal')
})
test('comparison handles either lower-cost option and all maximum inputs safely',()=>{
  assert.equal(compareCosts(EXAMPLE_COSTS).result.lower,'upgrade')
  assert.equal(compareCosts(costs('10','20','30','1')).result.lower,'replacement')
  const {result}=compareCosts(costs(...COST_FIELDS.map(()=>'9999999.99')))
  assert.equal(result.upgrade,3*999999999)
  assert(Number.isSafeInteger(result.upgrade))
  assert.equal(result.difference,2*999999999)
})
test('invalid preview identifies field keys and never returns a misleading partial result',()=>{
  const {errors,result}=compareCosts({...EXAMPLE_COSTS,ram_cost_egp:'',ssd_cost_egp:'invalid'})
  assert.deepEqual(errors,['ram_cost_egp','ssd_cost_egp'])
  assert.equal(result,null)
})
