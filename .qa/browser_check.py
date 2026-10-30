import base64, json, os, socket, struct, time, urllib.request
from pathlib import Path

BASE = 'http://127.0.0.1:9338'
req = urllib.request.Request(BASE + '/json/new?about:blank', method='PUT')
tab = json.load(urllib.request.urlopen(req))
from urllib.parse import urlsplit
url = urlsplit(tab['webSocketDebuggerUrl'])
sock = socket.create_connection((url.hostname, url.port), timeout=15)
key = base64.b64encode(os.urandom(16)).decode()
sock.sendall((f'GET {url.path} HTTP/1.1\r\nHost: {url.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
response = b''
while b'\r\n\r\n' not in response: response += sock.recv(1)
assert response.startswith(b'HTTP/1.1 101 '), response
seq = 0
errors = []
def receive(n):
    result = b''
    while len(result) < n:
        part = sock.recv(n-len(result))
        if not part: raise RuntimeError('Browser disconnected')
        result += part
    return result
def frame():
    a,b = receive(2)
    length = b & 127
    if length == 126: length = struct.unpack('!H', receive(2))[0]
    elif length == 127: length = struct.unpack('!Q', receive(8))[0]
    mask = receive(4) if b & 128 else None
    data = receive(length)
    if mask: data = bytes(v ^ mask[i%4] for i,v in enumerate(data))
    return json.loads(data)
def call(method, params=None):
    global seq
    seq += 1
    payload = json.dumps({'id':seq, 'method':method, 'params':params or {}}).encode()
    mask = os.urandom(4)
    header = bytes([129, 128 | len(payload)]) if len(payload)<126 else bytes([129,254])+struct.pack('!H',len(payload))
    sock.sendall(header + mask + bytes(v ^ mask[i%4] for i,v in enumerate(payload)))
    while True:
        message = frame()
        if message.get('method') == 'Runtime.exceptionThrown': errors.append(message['params'])
        if message.get('id') == seq:
            if 'error' in message: raise RuntimeError(message['error'])
            return message.get('result', {})
def evaluate(expression):
    result = call('Runtime.evaluate', {'expression':expression, 'returnByValue':True, 'awaitPromise':True})
    if 'exceptionDetails' in result: raise RuntimeError(result['exceptionDetails'])
    return result['result'].get('value')
def check(expression, label):
    assert evaluate(expression), label
    print('PASS:', label, flush=True)
def screenshot(name):
    result = call('Page.captureScreenshot', {'format':'png','captureBeyondViewport':True})
    Path(name).write_bytes(base64.b64decode(result['data']))

call('Page.enable')
call('Runtime.enable')
call('Emulation.setDeviceMetricsOverride', {'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
call('Page.navigate', {'url':'http://127.0.0.1:8768/'})
time.sleep(2)
evaluate('document.fonts.ready.then(() => true)')
check("document.title.includes('VoltEdge')", 'Page loaded')
check("[...document.images].every(i=>i.complete&&i.naturalWidth>0)", 'All images loaded')
check('document.documentElement.scrollWidth <= innerWidth', 'Desktop fits viewport')
evaluate("document.querySelector('[data-hotspot]').click()")
check("!document.querySelector('#hotspot-detail').hidden", 'Image annotation opens')
evaluate("document.querySelector('[data-hotspot]').click()")
evaluate("document.querySelector('[data-sector=industrial]').click()")
check("document.querySelector('#sector-panel').textContent.includes('bigger ambitions')", 'Sector content changes')
evaluate("document.querySelector('[data-sector=residential]').click()")
evaluate("document.querySelector('[data-service=cabling]').click()")
check("document.querySelector('#service-dialog').open", 'Service details dialog opens')
evaluate("document.querySelector('#dialog-cta').click()")
check("!document.querySelector('#service-dialog').open && document.querySelector('#enquiry-service').value === 'Underground cable works'", 'Service selection flows to enquiry')
evaluate("document.querySelector('[name=name]').value='QA Example'; document.querySelector('[name=email]').value='qa@example.com'; document.querySelector('[name=location]').value='Example City'; document.querySelector('[name=details]').value='Underground cable route for a new site.'; document.querySelector('#enquiry-form').requestSubmit()")
check("!document.querySelector('#form-success').hidden && projectBrief.includes('Underground cable works')", 'Project brief generated')
call('Browser.setDownloadBehavior', {'behavior':'allow','downloadPath':str(Path('.qa/downloads').resolve())})
evaluate("document.querySelector('#download-brief').click()")
time.sleep(.5)
assert Path('.qa/downloads/electrical-project-brief.txt').is_file(), 'Brief download failed'
print('PASS: Brief downloads as text', flush=True)
evaluate("document.querySelector('[data-service=ht]').click();document.querySelector('#dialog-cta').click()")
check("document.querySelector('#form-success').hidden && projectBrief === ''", 'Changed service invalidates old brief')
evaluate("document.querySelector('#enquiry-form').reset();document.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));window.scrollTo(0,0)")
time.sleep(.8)
screenshot('.qa/desktop.png')
for width in [390,320,768]:
    call('Emulation.setDeviceMetricsOverride', {'width':width,'height':844,'deviceScaleFactor':1,'mobile':False})
    time.sleep(.3)
    check('document.documentElement.scrollWidth <= innerWidth', str(width)+'px layout fits viewport')
    if width==390:
        evaluate("document.querySelector('.menu-toggle').click()")
        check("document.querySelector('.main-nav').classList.contains('is-open')", 'Mobile navigation opens')
        evaluate("document.querySelector('.main-nav a').click()")
        check("!document.querySelector('.main-nav').classList.contains('is-open')", 'Mobile navigation closes after selection')
        evaluate('window.scrollTo(0,0)')
        time.sleep(.7)
        screenshot('.qa/mobile.png')
check("document.querySelector('h1').innerText.includes('Powering')", 'Headline remains visible')
assert not errors, errors
print('PASS: No JavaScript runtime exceptions', flush=True)
print('Screenshots saved to .qa/desktop.png and .qa/mobile.png', flush=True)
sock.close()

