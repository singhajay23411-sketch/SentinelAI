import re

with open('frontend/Resourses/Dashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Simple tag tracer for JSX
# We will look for <tag> and </tag>
# Excluding self-closing tags <tag /> and comments

# Regex to match tags
# We match <TagName ...> or </TagName>
# But we need to ignore things inside strings, comments, etc.
# Let's clean comments first
cleaned = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
cleaned = re.sub(r'//.*?\n', '\n', cleaned)

# Let's find tags
tag_pattern = re.compile(r'<(/?[a-zA-Z0-9_\-]+)(?:\s+[^>]*?)?>')

stack = []
for match in tag_pattern.finditer(cleaned):
    tag = match.group(1)
    pos = match.start()
    line = code[:pos].count('\n') + 1
    
    # Ignore self-closing tags or SVG paths, circles, etc. (often self-closed or single tags like <circle ... />)
    raw_match = match.group(0)
    if raw_match.endswith('/>') or tag.lower() in ['img', 'br', 'hr', 'input', 'meta', 'circle', 'path', 'rect', 'svg']:
        # If it's a self-closing or standard self-closing HTML tag, or SVG shapes, ignore
        # Note: svg can have children, but often circle/path do not. Let's ignore shape tags.
        continue
        
    if tag.startswith('/'):
        tag_name = tag[1:]
        if not stack:
            print(f"Mismatched closing tag </{tag_name}> at line {line}")
        else:
            prev_tag, prev_line = stack.pop()
            if prev_tag != tag_name:
                print(f"Mismatched tag: Opened <{prev_tag}> at line {prev_line}, but closed </{tag_name}> at line {line}")
    else:
        stack.append((tag, line))

if stack:
    print(f"Unclosed tags left: {len(stack)}")
    for tag, line in stack:
        print(f"  - <{tag}> at line {line}")
else:
    print("Tags are balanced!")
