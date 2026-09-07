"""Integration test uses the real model, never a mocked response."""
import json, math, os, threading, time, traceback
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
out=Path('test-results');out.mkdir(exist_ok=True)
server=ThreadingHTTPServer(('127.0.0.1',8765),partial(SimpleHTTPRequestHandler,directory='_site'))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={'checks':[],'errors':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 try:
  page.goto(os.environ.get('SITE_URL','http://127.0.0.1:8765/'))
  page.wait_for_function('window.parkingApp?.snapshot().ready')
  page.screenshot(path=str(out/'desktop-initial.png'),full_page=True)
  report['preview']=page.evaluate('parkingApp.snapshot()')
  page.locator('#runBtn').click()
  page.wait_for_function('!parkingApp.snapshot().busy',timeout=240000)
  state=page.evaluate('parkingApp.snapshot()');report['inference']=state
  report['status']=page.locator('#statusText').inner_text()+' / '+page.locator('#runDetail').inner_text()
  page.screenshot(path=str(out/'desktop-result.png'),full_page=True)
  assert state['engine']=='browser',report['status']
  assert state['count']>0,'Default real parking image should contain detected vehicles'
  assert all(all(math.isfinite(b[k]) for k in ['cx','cy','w','h','angle','score']) for b in state['boxes'])
  report['checks'].append('Real ONNX/WASM inference completed with finite vehicle boxes')
  count=state['count']
  page.locator('#confidence').evaluate('(e)=>{e.value=85;e.dispatchEvent(new Event("input"))}')
  assert page.evaluate('parkingApp.snapshot().count')<=count
  page.locator('#confidence').evaluate('(e)=>{e.value=25;e.dispatchEvent(new Event("input"))}')
  page.locator('#saveBtn').click();page.locator('#saveBtn').click()
  assert page.evaluate('parkingApp.snapshot().history')==1
  page.locator('[data-tab=history]').click()
  assert page.locator('.history-item').count()==1
  with page.expect_download() as d:page.locator('#exportCsv').click()
  d.value.save_as(str(out/'observations.csv'))
  report['checks'].append('Threshold monotonically filters, duplicate save updates, CSV exports')
  page.locator('[data-tab=analyse]').click()
  page.locator('#roiBtn').click();page.wait_for_timeout(500)
  page.locator('#fitBtn').click()
  tr=page.evaluate('parkingApp.snapshot().transform');box=page.locator('#map').bounding_box()
  # Select a small non-parking area near the upper left, keeping clear of overlays.
  for x,y in [(130,110),(190,110),(190,170),(130,170)]:
   page.mouse.click(box['x']+tr['ox']+x*tr['scale'],box['y']+tr['oy']+y*tr['scale'])
  page.locator('#applyRoi').click()
  assert len(page.evaluate('parkingApp.snapshot().roi'))==4
  report['checks'].append('Pointer polygon editor completes')
  page.locator('#runBtn').click();page.locator('#cancelBtn').click()
  assert not page.evaluate('parkingApp.snapshot().busy')
  report['checks'].append('Worker cancellation restores controls')
  # Input image is decoded locally and resets old counts. No upload network request.
  posts=[];page.on('request',lambda r:posts.append(r.url) if r.method=='POST' else None)
  page.locator('#upload').set_input_files('_site/assets/icc-seamlessphoto.jpg')
  page.wait_for_function('parkingApp.snapshot().ready && parkingApp.snapshot().engine===null')
  assert page.locator('#count').inner_text()=='—'
  assert posts==[],posts
  report['checks'].append('Image upload is local and invalidates old results')
  page.reload();page.wait_for_function('window.parkingApp?.snapshot().ready')
  assert page.evaluate('parkingApp.snapshot().history')==1
  assert not report['errors'],report['errors']
  mobile=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
  mp=mobile.new_page();mp.goto('http://127.0.0.1:8765/');mp.wait_for_function('window.parkingApp?.snapshot().ready')
  assert mp.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  mp.screenshot(path=str(out/'mobile-initial.png'),full_page=True)
  mp.locator('#focusBtn').tap();mp.locator('#viewer').screenshot(path=str(out/'mobile-parking-focus.png'))
  report['checks'].append('390px mobile layout has no horizontal overflow and focus control works')
  report['passed']=True
 except Exception as e:
  report['passed']=False;report['failure']=str(e);report['traceback']=traceback.format_exc()
  try:page.screenshot(path=str(out/'failure.png'),full_page=True)
  except Exception:pass
 finally:
  (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
  print(json.dumps({k:v for k,v in report.items() if k not in ('preview','inference')},ensure_ascii=False),flush=True)
  browser.close();server.shutdown()
assert report.get('passed'),report.get('failure')
