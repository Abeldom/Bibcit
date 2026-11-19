"""Bibcit on the laptop: serves the app and saves your recordings.

Run it in this folder:
    python server.py
then open http://localhost:8000  (recording page: http://localhost:8000/#/inregistrare)

To try the app on a phone in the same Wi-Fi:
    python server.py --lan
and open on the phone the address it prints (http://<laptop address>:8000).
Saving recordings only works from the laptop itself.

Recordings are saved as audio/<name>.wav and listed in audio/index.json.
Upload the audio folder together with the app so every phone has them.
"""
import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8000
ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
KEY = re.compile(r"^/api/audio/([A-Za-z0-9_]{1,60})$")
MAX_BYTES = 5_000_000


def write_index():
    keys = sorted(p.stem for p in AUDIO.glob("*.wav"))
    (AUDIO / "index.json").write_text(json.dumps(keys, indent=0), encoding="utf-8")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/status":
            return self.send_json(200, {"ok": True})
        return super().do_GET()

    def do_POST(self):
        if self.client_address[0] not in ("127.0.0.1", "::1", "::ffff:127.0.0.1"):
            return self.send_json(403, {"error": "recording only from this laptop"})
        match = KEY.match(self.path)
        if not match:
            return self.send_json(404, {"error": "not found"})
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 44 or length > MAX_BYTES:
            return self.send_json(400, {"error": "bad size"})
        body = self.rfile.read(length)
        if body[:4] != b"RIFF" or body[8:12] != b"WAVE":
            return self.send_json(400, {"error": "not a wav file"})
        AUDIO.mkdir(exist_ok=True)
        (AUDIO / f"{match.group(1)}.wav").write_bytes(body)
        write_index()
        print(f"  saved audio/{match.group(1)}.wav")
        return self.send_json(200, {"ok": True})


def lan_address():
    import socket
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))  # no data is sent; this only picks the Wi-Fi address
            return s.getsockname()[0]
    except OSError:
        return None


if __name__ == "__main__":
    import sys
    args = sys.argv[1:]
    lan = "--lan" in args
    numbers = [a for a in args if a.isdigit()]
    if numbers:
        PORT = int(numbers[0])  # e.g. python server.py 8001
    AUDIO.mkdir(exist_ok=True)
    write_index()
    server = ThreadingHTTPServer(("0.0.0.0" if lan else "127.0.0.1", PORT), Handler)
    print(f"Bibcit: http://localhost:{PORT}   (recording page: http://localhost:{PORT}/#/inregistrare)")
    if lan:
        print(f"On the phone (same Wi-Fi): http://{lan_address() or '<laptop address>'}:{PORT}")
    print("Stop with Ctrl+C.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
