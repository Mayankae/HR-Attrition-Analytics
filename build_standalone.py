"""Builds DWM_Dashboard_Standalone.html - ONE file with everything inside (works offline on any device).
Run again after editing anything in website/:  python build_standalone.py"""
import re, os
root = os.path.dirname(os.path.abspath(__file__)); w = os.path.join(root, "website")
rd = lambda f: open(os.path.join(w, f), encoding="utf8").read()
h = rd("index.html")
h = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: "<style>" + rd(m.group(1)) + "</style>", h)
h = re.sub(r'<script src="([^"]+)"></script>', lambda m: "<script>" + rd(m.group(1)).replace("</script", "<\\/script") + "</script>", h)
out = os.path.join(root, "DWM_Dashboard_Standalone.html")
open(out, "w", encoding="utf8").write(h); print("Created", out, round(len(h) / 1e6, 2), "MB")
