import re

with open('frontend/Resourses/Dashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

block_code = "".join(lines[366:502]) # lines 367 to 502

cleaned = re.sub(r'/\*.*?\*/', '', block_code, flags=re.DOTALL)
cleaned = re.sub(r'//.*?\n', '\n', cleaned)
# Clean template literals/JSX expressions
prev_len = 0
while len(cleaned) != prev_len:
    prev_len = len(cleaned)
    cleaned = re.sub(r'\{[^{}]*?\}', '""', cleaned)

tag_pattern = re.compile(r'<(/?[a-zA-Z0-9_\-]+)(?:\s+[^>]*?)?>')
stack = []
for match in tag_pattern.finditer(cleaned):
    tag = match.group(1)
    pos = match.start()
    line = block_code[:pos].count('\n') + 367
    
    raw_match = match.group(0)
    if raw_match.endswith('/>') or tag.lower() in ['img', 'br', 'hr', 'input', 'meta', 'circle', 'path', 'rect', 'line', 'ellipse', 'polygon', 'polyline', 'use']:
        continue
        
    if tag.startswith('/'):
        tag_name = tag[1:]
        if not stack:
            print(f"Error: Mismatched closing </{tag_name}> at line {line}")
        else:
            prev_tag, prev_line = stack.pop()
            if prev_tag != tag_name:
                print(f"Error: Opened <{prev_tag}> at line {prev_line}, but closed </{tag_name}> at line {line}")
    else:
        stack.append((tag, line))

print(f"Tags remaining in stack at end of dashboard block:")
for tag, line in stack:
    print(f"  - <{tag}> at line {line}")
