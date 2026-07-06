import re
from html.parser import HTMLParser

with open('frontend/Resourses/Dashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's clean Javascript expressions inside curly braces {} so they don't confuse HTML parser
# We replace {...} with ""
# We must do this carefully, but we can do a simple regex for now.
cleaned = code
# Remove comments
cleaned = re.sub(r'/\*.*?\*/', '', cleaned, flags=re.DOTALL)
cleaned = re.sub(r'//.*?\n', '\n', cleaned)

# Replace JSX expressions {...} with dummy strings
# We do it recursively from inside out
prev_len = 0
while len(cleaned) != prev_len:
    prev_len = len(cleaned)
    cleaned = re.sub(r'\{[^{}]*?\}', '""', cleaned)

class JSXTagParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        
    def handle_starttag(self, tag, attrs):
        # Ignore self-closing or standard self-closing tags
        if tag in ['img', 'br', 'hr', 'input', 'meta', 'circle', 'path', 'rect', 'line', 'ellipse', 'polygon', 'polyline', 'use']:
            return
        line, _ = self.getpos()
        self.stack.append((tag, line))
        
    def handle_endtag(self, tag):
        if tag in ['circle', 'path', 'rect', 'line', 'ellipse', 'polygon', 'polyline', 'use']:
            return
        line, _ = self.getpos()
        if not self.stack:
            print(f"Error: Closed </{tag}> at line {line} but nothing was open")
            return
        prev_tag, prev_line = self.stack.pop()
        if prev_tag != tag:
            print(f"Mismatched tag at line {line}: Closed </{tag}>, but expected </{prev_tag}> (opened at line {prev_line})")

parser = JSXTagParser()
try:
    parser.feed(cleaned)
    if parser.stack:
        print(f"Unclosed tags left: {len(parser.stack)}")
        for tag, line in parser.stack:
            print(f"  - <{tag}> opened at line {line}")
except Exception as e:
    print("Parser crashed:", e)
