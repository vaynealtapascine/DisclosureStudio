import { test } from 'node:test';
import assert from 'node:assert/strict';
import { move, model, defaults, validateDraft, normalizeModels, filenameFor, providerFor } from '../src/domain.js';
test('reordering is immutable, boundaries are safe', () => { const a=['a','b','c']; assert.deepEqual(move(a,0,2),['b','c','a']); assert.deepEqual(a,['a','b','c']); assert.equal(move(a,0,-1),a); });
test('project roundtrip and schema validation', () => { const d={...defaults, selected:[model('anthropic/claude-opus-5')]}; assert.deepEqual(validateDraft(JSON.parse(JSON.stringify(d))),d); for(const value of [null,{}, {...d,rating:4}, {...d,selected:[d.selected[0],d.selected[0]]}, {...d,selected:[{...d.selected[0], color:'url(bad)'}]}]) assert.throws(()=>validateDraft(value)); });
test('catalog deduplicates and rejects malformed responses', () => { assert.deepEqual(normalizeModels([{id:'a/b'}, {id:'a/b',name:'B'}, {}]), [{id:'a/b',name:'B'}]); assert.throws(()=>normalizeModels([])); assert.throws(()=>normalizeModels({})); });
test('safe download names and unknown providers', () => { assert.equal(filenameFor('../my project.png','png'),'my-project.png'); assert.equal(filenameFor('','json'),'ai-transparency.json'); assert.equal(providerFor('unknown/model').icon,''); assert.equal(providerFor('~anthropic/claude').icon,'./logos/claude.svg'); });
