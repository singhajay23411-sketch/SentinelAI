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

    if char == '(':
        line = code[:i].count('\n') + 1
        stack.append((i, line))
    elif char == ')':
        line = code[:i].count('\n') + 1
        if not stack:
            print(f"Mismatched closing parenthesis ')' at line {line}")
        else:
            stack.pop()
            
    i += 1

if stack:
    print(f"{len(stack)} unclosed parentheses. Here are the first 10:")
    for idx, (pos, line) in enumerate(stack[:10]):
        snippet = code[pos:pos+30].replace('\n', ' ')
        print(f"  - Line {line}: {snippet}...")
else:
    print("Parentheses are balanced!")
