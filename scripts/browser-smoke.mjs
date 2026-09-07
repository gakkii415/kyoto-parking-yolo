import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Tests the actual public deployment, not mock boxes or cached predictions.
const base = 'https://gakkii415.github.io/kyoto-parking-yolo/';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
const result = { url: base, browser: 'Chromium, 390px mobile viewport', mockedInference: false };
page.on('pageerror', e => errors.push(e.message));
page.setDefaultTimeout(120000);
try {
  const response = await page.goto(base + '?v=1', { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => !document.querySelector('#run').disabled);
  const started = Date.now();
  await page.locator('#run').click();
  await page.waitForFunction(() => /検出完了|解析できませんでした/.test(document.querySelector('#status').textContent));
  result.inferenceStatus = await page.locator('#status').innerText();
  assert.match(result.inferenceStatus, /検出完了/);
  result.inferenceSeconds = (Date.now() - started) / 1000;
  const count = Number(await page.locator('#count').innerText());
  assert.ok(count > 0, 'Actual sample must yield vehicle detections');
  result.detectedVehicles = count;
  result.pageWidth = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  assert.ok(result.pageWidth.content <= result.pageWidth.viewport, 'No horizontal page overflow');
  await page.screenshot({ path: 'mobile-result.png', fullPage: true });
  await page.locator('#save').click();
  assert.match(await page.locator('#history').innerText(), new RegExp(count + '台'));
  await page.locator('#confidence').evaluate(el => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  assert.ok(Number(await page.locator('#count').innerText()) <= count);
  await page.locator('#confidence').evaluate(el => { el.value = '25'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#roi').click();
  await page.locator('#done').click();
  assert.match(await page.locator('#status').innerText(), /3点以上/);
  await page.locator('#cancel').click();
  assert.equal(Number(await page.locator('#count').innerText()), count);
  await page.locator('#full').click();
  assert.ok(Number(await page.locator('#count').innerText()) >= count);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#csv').click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), 'kyoto-parking.csv');
  const sample = await page.request.get(new URL('sample.png', base).href);
  await page.locator('#file').setInputFiles({ name: 'observation.png', mimeType: 'image/png', buffer: await sample.body() });
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('画像を読み込みました'));
  assert.equal(await page.locator('#count').innerText(), '—');
  assert.equal(await page.locator('#siteName').inputValue(), '');
  assert.ok(await page.locator('#save').isDisabled());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.querySelector('#run').disabled);
  assert.match(await page.locator('#history').innerText(), new RegExp(count + '台'));
  result.tested = ['public HTTP 200', 'real ONNX WASM inference', 'vehicle count', 'mobile width', 'confidence filtering', 'polygon validation and cancellation', 'full-image count', 'CSV download', 'image import state reset', 'history after reload'];
  assert.deepEqual(errors, []);
  result.passed = true;
} catch (error) {
  result.passed = false;
  result.error = String(error.stack || error);
  await page.screenshot({ path: 'browser-failure.png', fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  result.pageErrors = errors;
  fs.writeFileSync('browser-check.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}
