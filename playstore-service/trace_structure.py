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

    if char in ['{', '(']:
        stack.append((char, line, i))
    elif char in ['}', ')']:
        if not stack:
            print(f"Mismatched closing '{char}' at line {line}")
        else:
            top_char, top_line, top_pos = stack.pop()
            if (char == '}' and top_char != '{') or (char == ')' and top_char != '('):
                print(f"Structural mismatch at line {line}: Closed '{char}', but expected closure for '{top_char}' (opened at line {top_line})")
                # print snippet of opening
                print(f"  Opening context: {code[top_pos:top_pos+40].replace('\n', ' ')}")
                # print snippet of closing
                print(f"  Closing context: {code[i-20:i+20].replace('\n', ' ')}")
                
    i += 1
