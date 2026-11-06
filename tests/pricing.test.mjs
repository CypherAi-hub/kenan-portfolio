import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimate, packages, extras } from '../data/pricing.ts';
test('base ranges match the displayed package budgets', () => {
 for (const p of packages) { const e=calculateEstimate(p.id,[],0);assert.deepEqual([e.min,e.max],[...p.range]); }
});
test('business additions are itemized without double counting', () => {
 const e=calculateEstimate('business',['cms','cms','content'],2);
 assert.deepEqual([e.min,e.max],[2750,5750]);assert.equal(e.options.length,2);assert.equal(e.pages,2);
});
test('unsupported add-ons and pages do not leak across project types', () => {
 const e=calculateEstimate('mobile',['booking','cms','payments'],5);
 assert.deepEqual([e.min,e.max],[6750,13800]);assert.equal(e.pages,0);
});
test('additional page input is finite, whole, and bounded', () => {
 for(const [input,expected] of [[-4,0],[NaN,0],[2.9,2],[99,5]]) assert.equal(calculateEstimate('business',[],input).pages,expected);
});
test('all available add-on combinations produce ordered totals', () => {
 for(const p of packages) for(let mask=0;mask<(1<<extras.length);mask++) {
  const ids=extras.filter((_,i)=>mask&(1<<i)).map(x=>x.id);const e=calculateEstimate(p.id,ids,0);
  assert.ok(e.min>=p.range[0]);assert.ok(e.max>=e.min);
  assert.ok(e.options.every(x=>x.for.includes(p.id)));
 }
});
