#!/usr/bin/env python3
"""Preview the static site locally and proxy only its public announcement feed."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

SITE_ROOT = Path(__file__).resolve().parents[1]
ANNOUNCEMENTS_PATH = '/api/v1/public/website-announcements'
ANNOUNCEMENTS_UPSTREAM = 'https://chuannong-api.mychangliapp.cn' + ANNOUNCEMENTS_PATH


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_ROOT), **kwargs)

    def send_head(self):
        path = Path(self.translate_path(self.path)).resolve()
        if path == SITE_ROOT:
            path = (SITE_ROOT / 'index.html').resolve()
        relative = path.relative_to(SITE_ROOT) if path.is_relative_to(SITE_ROOT) else None
        if relative and not any(part.startswith('.') for part in relative.parts):
            public_page = len(relative.parts) == 1 and relative.suffix == '.html'
            public_asset = relative.parts[0] == 'assets' and path.is_file()
            config = relative == Path('config/site.json')
            license_file = relative in (Path('TDESIGN_LICENSE.txt'), Path('THIRD_PARTY_NOTICES.md'))
            if (public_page or public_asset or config or license_file) and path.is_file():
                return super().send_head()
        self.send_error(404, 'File not found')
        return None

    def do_GET(self):
        if urlsplit(self.path).path != ANNOUNCEMENTS_PATH:
            return super().do_GET()
        try:
            request = Request(ANNOUNCEMENTS_UPSTREAM, headers={'Accept': 'application/json'})
            with urlopen(request, timeout=4) as response:
                content = response.read(1_048_577)
                if len(content) > 1_048_576:
                    return self.send_error(502, 'Announcement response too large')
                self.send_response(response.status)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Cache-Control', 'no-store')
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
        except (HTTPError, URLError, TimeoutError, OSError):
            self.send_error(502, 'Announcement service temporarily unavailable')


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 5181), PreviewHandler) as server:
        print('官网本机预览：http://127.0.0.1:5181/（仅本机可访问）', flush=True)
        server.serve_forever()
