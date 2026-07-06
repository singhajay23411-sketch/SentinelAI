import re

with open('frontend/Resourses/Dashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    # Strip comments
    clean = re.sub(r'//.*', '', line)
    # Find any '/' that is not part of '</' or '/>' or '//' or '/*' or '*/'
    # Also ignore URLs in strings like 'http://' or 'https://'
    clean = re.sub(r'https?://', '', clean)
    
    # Search for '/'
    matches = []
    for match in re.finditer(r'/[^*&/<= ]', clean):
        # Check if it's '</'
        pos = match.start()
        if pos > 0 and clean[pos-1] == '<':
            continue
        matches.append(match.group(0))
        
    if matches:
        print(f"Line {idx+1}: {line.strip()} (matches: {matches})")
