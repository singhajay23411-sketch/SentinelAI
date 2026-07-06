import re
from html.parser import HTMLParser

with open('frontend/Resourses/Dashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

block_lines = lines[366:502] # lines 367 to 502
block_code = "".join(block_lines)

# Remove JS expressions
cleaned = block_code
cleaned = re.sub(r'/\*.*?\*/', '', cleaned, flags=re.DOTALL)
cleaned = re.sub(r'//.*?\n', '\n', cleaned)
prev_len = 0
while len(cleaned) != prev_len:
    prev_len = len(cleaned)
    cleaned = re.sub(r'\{[^{}]*?\}', '""', cleaned)

class TestParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
    def handle_starttag(self, tag, attrs):
        if tag in ['img', 'br', 'hr', 'input', 'meta', 'circle', 'path', 'rect', 'line', 'ellipse', 'polygon', 'polyline', 'use']:
            return
        line, _ = self.getpos()
        self.stack.append((tag, line + 367))
    def handle_endtag(self, tag):
        if tag in ['circle', 'path', 'rect', 'line', 'ellipse', 'polygon', 'polyline', 'use']:
            return
        line, _ = self.getpos()
        if not self.stack:
            print(f"Closed </{tag}> at line {line + 367} but nothing was open")
            return
        prev_tag, prev_line = self.stack.pop()
        if prev_tag != tag:
            print(f"Mismatch: Closed </{tag}> at line {line + 367}, but expected </{prev_tag}> (opened at line {prev_line})")

parser = TestParser()
parser.feed(cleaned)
if parser.stack:
    print(f"Unclosed tags in dashboard block: {len(parser.stack)}")
    for tag, line in parser.stack:
        print(f"  - <{tag}> at line {line}")
else:
    print("Dashboard block is balanced!")
