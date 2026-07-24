import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_next = False
for i, line in enumerate(lines):
    if skip_next:
        skip_next = False
        continue
    
    # if line is `warehouseId String?` and previous was `warehouse Warehouse? @relation...`
    # wait, it's easier to just strip duplicate lines!
    # Let's write a simple rule: if a line defines a scalar field, and there's another line nearby defining it...
    # Actually, we can just replace the specific lines that failed:
    pass

content = ''.join(lines)

content = re.sub(r'(\s+warehouseId\s+String\?(?:.*)\n)(\s+warehouseId\s+String\?(?:.*)\n)', r'\1', content)
content = re.sub(r'(\s+capaId\s+String\?(?:.*)\n)(\s+capaId\s+String\?(?:.*)\n)', r'\1', content)
content = re.sub(r'(\s+pmScheduleId\s+String\?(?:.*)\n)(\s+pmScheduleId\s+String\?(?:.*)\n)', r'\1', content)
content = re.sub(r'(\s+salesOrderId\s+String\?(?:.*)\n)(\s+salesOrderId\s+String\?(?:.*)\n)', r'\1', content)

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)
