"""still.py PAGE OUT.jpg [--at SECONDS] : one still of a film page, straight from its canvas (no render needed).
  python engine/still.py "part1/index.html#cover" part1/cover.jpg     the page's cover mode
  python engine/still.py part1/index.html check.jpg --at 33.5          any moment, for a quick look
The page must expose window.seek(t) and a 1080x1920 canvas with id "film". The page's folder is served over http://127.0.0.1.
needs: pip install playwright (it uses the installed Chrome, or: python -m playwright install chromium)"""
import base64, functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

a = sys.argv[1:]
if len(a) < 2: sys.exit(__doc__)
page, _, frag = a[0].partition("#")
t = float(a[a.index("--at") + 1]) if "--at" in a else 0.0
root = os.path.dirname(os.path.abspath(page))
h = functools.partial(type("Q", (http.server.SimpleHTTPRequestHandler,), {"log_message": lambda *x: None}), directory=root)
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), h); threading.Thread(target=srv.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{srv.server_address[1]}/{os.path.basename(page)}" + ("#" + frag if frag else "")
with sync_playwright() as p:
    try: b = p.chromium.launch(channel="chrome")
    except Exception: b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    errors = []; pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(url); pg.wait_for_function("typeof window.seek === 'function'", timeout=60000)
    pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    data = pg.evaluate("t => { window.seek(t); return document.getElementById('film').toDataURL('image/jpeg', 0.92); }", t)
    open(a[1], "wb").write(base64.b64decode(data.split(",", 1)[1])); b.close()
srv.shutdown()
print("saved", a[1], ("| PAGE ERRORS: " + " | ".join(errors[:3])) if errors else "")
