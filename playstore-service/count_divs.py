import re
with open('frontend/Resourses/Dashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

div_count = 0
for idx, line in enumerate(lines[367:501], 368): # lines 368 to 501
    # Count opening divs
    opens = len(list(re.finditer(r'<div\b', line)))
    # Count closing divs
    closes = len(list(re.finditer(r'</div>', line)))
    
    div_count += opens - closes
    if opens or closes:
        print(f"Line {idx}: Opens={opens}, Closes={closes}, Net={div_count} | {line.strip()[:60]}")

print(f"Final net div count in dashboard block: {div_count}")
