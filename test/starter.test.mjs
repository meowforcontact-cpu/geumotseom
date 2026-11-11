import test from 'node:test';
import assert from 'node:assert/strict';
import {claimStarterPet,needsStarterPet} from '../src/storage.mjs';

const oldPet=()=>({name:'기존 토끼',kind:'white',hatched:true,taps:3});
const fresh=()=>({owned:[],pets:[{name:'피카',kind:'white',hatched:false,taps:0}],rep:0});

for(const [kind,id] of [['cat','p3'],['dog','p2']]){
 test('new starter '+kind+' grants one free pet only',()=>{
  const state=fresh();
  assert.equal(needsStarterPet(state),true);
  claimStarterPet(state,kind,{preserveLegacy:false});
  assert.deepEqual(state.pets.map(p=>p.kind),[kind]);
  assert.deepEqual(state.owned,[id]);
  assert.equal(state.rep,0);
  assert.equal(needsStarterPet(state),false);
  assert.throws(()=>claimStarterPet(state,kind==='cat'?'dog':'cat'));
 });
}
test('existing saved pet remains owned after free choice',()=>{
 const state={owned:[],pets:[oldPet()],rep:0};
 claimStarterPet(state,'cat',{preserveLegacy:true});
 assert.equal(state.pets[0].name,'기존 토끼');
 assert.equal(state.pets[0].hatched,true);
 assert.deepEqual(state.pets.map(p=>p.kind),['white','cat']);
 assert.equal(state.rep,1);
});
test('cannot claim unapproved species',()=>{
 const state=fresh();
 assert.throws(()=>claimStarterPet(state,'raccoon'));
 assert.equal(state.owned.length,0);
 assert.equal(needsStarterPet(state),true);
});
