"""Run this file in PyCharm (right-click > Run). It serves the dashboard and opens your browser.
Stop with the red Stop button / Ctrl+C."""
import http.server, socketserver, webbrowser, os, threading
PORT = 8000
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "website"))
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as s:
    url = f"http://localhost:{PORT}/index.html"
    print("Dashboard running at", url)
    threading.Timer(1, lambda: webbrowser.open(url)).start()
    try: s.serve_forever()
    except KeyboardInterrupt: print("Stopped.")
