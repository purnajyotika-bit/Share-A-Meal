import re
import glob
import os

pattern = re.compile(r'>\s*([^<>{}\n][^<>{}]*)\s*<')
ignore = {'node_modules', 'dist', '.git'}
files = glob.glob('**/*.jsx', recursive=True) + glob.glob('**/*.js', recursive=True)
issues = []
for fp in files:
    if any(part in ignore for part in fp.split(os.sep)):
        continue
    with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    for m in pattern.finditer(text):
        txt = m.group(1).strip()
        if not txt:
            continue
        if re.search(r'^[\d\W]+$', txt):
            continue
        if re.search(r'^\{.*\}$', txt):
            continue
        if re.search(r'\b(t\(|useLanguage\(|\w+\s*=|className=|style=|<\w)', txt):
            continue
        if re.search(r'^(true|false|null|undefined|NaN|Infinity)$', txt):
            continue
        if len(txt) < 3:
            continue
        if re.search(r'\b(nav_|profile_|dashboard_|analytics_|donation_|donor_|badge_|status_|category_|claim_|go_to_|fresh_text|ai_chat|role_banner|no_|empty|save|sign out|update|back|Post Food|Donate|Food|Volunteer|NGO|Receiver)\b', txt):
            issues.append((fp, txt))
print(len(issues))
for i, (fp, txt) in enumerate(issues[:200], 1):
    print(i, fp, repr(txt))
