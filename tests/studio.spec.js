import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const ids = ['openai/gpt-5.6-sol', 'openai/gpt-5.6-luna', 'anthropic/claude-opus-5', 'anthropic/claude-sonnet-5'];
async function add(page,id) { await page.getByRole('searchbox').fill(id); const row=page.locator('.catalog-item').filter({has:page.locator('strong',{hasText:new RegExp(`^${id.replaceAll('.','\\.')}$$`)})}); await row.locator('input').check(); }
async function png(page, name) { const event=page.waitForEvent('download'); await page.getByRole('button',{name:'Download PNG'}).click(); const download=await event; await download.saveAs(`test-results/${name}`); const bytes=await fs.readFile(`test-results/${name}`); expect(bytes.subarray(1,4).toString()).toBe('PNG'); return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}; }

test('selection, accessible reorder, drag, persistence and real PNG export', async ({page}) => {
 const errors=[]; page.on('pageerror',e=>errors.push(e.message)); await page.goto('/');
 await expect(page.getByRole('button',{name:'Download PNG'})).toBeDisabled();
 for(const id of ids) await add(page,id);
 await page.getByRole('button',{name:`Move ${ids[1]} up`,exact:true}).click();
 await expect(page.locator('.selected-models li').first().locator('.model-label-input')).toHaveValue(ids[1]);
 await page.getByRole('button',{name:`Move ${ids[1]} down`,exact:true}).click();
 await page.locator('.selected-models li').nth(3).dragTo(page.locator('.selected-models li').nth(2));
 await expect(page.locator('.selected-models li').nth(2).locator('.model-label-input')).toHaveValue(ids[3]);
 await page.getByRole('button',{name:`Move ${ids[3]} down`,exact:true}).click();
 await page.reload(); await expect(page.locator('.selected-models li')).toHaveCount(4);
 await page.getByRole('searchbox').fill('');
 const dimensions=await png(page,'disclosure-four-models.png'); expect(dimensions.width).toBe(1180); expect(dimensions.height).toBeGreaterThan(280);
 await page.screenshot({path:'test-results/studio-desktop.png',fullPage:true});
 await page.getByLabel('Export size').selectOption('2'); expect((await png(page,'disclosure-2x.png')).width).toBe(2360);
 for(let rating=0;rating<4;rating++) { await page.locator(`input[name=rating][value="${rating}"]`).check(); await expect(page.locator('.preview-scaled .disclosure h1')).toHaveText(['NO AI-GENERATED CODE','AI-ASSISTED','MOSTLY AI-GENERATED','FULLY AI-GENERATED'][rating]); if(rating===0) {await expect(page.locator('.preview-scaled .model-pill')).toHaveCount(0); expect((await png(page,'disclosure-zero.png')).height).toBe(270);} }
 expect(errors).toEqual([]);
});

test('custom models, JSON roundtrip, errors, offline export and narrow layout', async ({page})=> {
 await page.goto('/'); await page.getByLabel('Not listed? Add a custom model').fill('independent/my-model'); await page.getByRole('button',{name:'Add',exact:true}).click();
 await page.getByLabel('Display label for independent/my-model').fill('My custom model');
 const saved=page.waitForEvent('download'); await page.getByRole('button',{name:'Save project',exact:true}).click(); const file=await saved; await file.saveAs('test-results/project.json');
 await page.getByRole('button',{name:'Remove independent/my-model'}).click();
 await page.getByLabel('Open project file').setInputFiles('test-results/project.json'); await expect(page.locator('.preview-scaled .model-pill')).toHaveText('IN My custom model');
 await page.getByLabel('Open project file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"wrong":true}')}); await expect(page.getByRole('alert')).toContainText('current draft is unchanged');
 await page.route('https://openrouter.ai/**',route=>route.abort()); await page.getByRole('button',{name:'Refresh catalog'}).click(); await expect(page.getByRole('alert')).toContainText('bundled catalog');
 await page.context().setOffline(true); await png(page,'disclosure-offline.png'); await page.context().setOffline(false);
 await page.setViewportSize({width:390,height:844}); await expect(page.getByRole('button',{name:'Download PNG'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.screenshot({path:'test-results/studio-mobile.png',fullPage:true});
});
