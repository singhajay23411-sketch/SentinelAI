with open('frontend/Resourses/Dashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

stack = []
in_string = None
in_comment = False
in_multiline_comment = False

i = 0
n = len(code)
while i < n:
    char = code[i]
    if in_multiline_comment:
        if char == '*' and i + 1 < n and code[i+1] == '/':
            in_multiline_comment = False
            i += 2
            continue
        i += 1
        continue
    if in_comment:
        if char == '\n':
            in_comment = False
        i += 1
        continue
    if in_string:
        if char == in_string:
            backslash_count = 0
            j = i - 1
            while j >= 0 and code[j] == '\\':
                backslash_count += 1
                j -= 1
            if backslash_count % 2 == 0:
                in_string = None
        i += 1
        continue
    if char == '/' and i + 1 < n:
        if code[i+1] == '/':
            in_comment = True
            i += 2
            continue
        elif code[i+1] == '*':
            in_multiline_comment = True
            i += 2
            continue
    if char in ['"', "'", '`']:
        in_string = char
        i += 1
        continue

    line = code[:i].count('\n') + 1

    # Check if this line starts a tab block
    if char == '\n':
        next_line_end = code.find('\n', i + 1)
        if next_line_end != -1:
            next_line_text = code[i+1:next_line_end]
            if 'activeTab ===' in next_line_text:
                print(f"Line {line + 1} has 'activeTab ==='. Stack depth: {len(stack)}. Stack: {[s[0] for s in stack]}")

    if char in ['{', '(']:
        stack.append((char, line))
    elif char in ['}', ')']:
        if stack:
            stack.pop()
            
    i += 1
