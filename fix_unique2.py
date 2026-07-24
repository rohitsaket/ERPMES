import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'(capa\s+CorrectiveAction\?\s+@relation\(fields:\s*\[capaId\],\s*references:\s*\[id\]\))',
    r'\1\n  capaId String? @unique',
    content
)

content = re.sub(
    r'(salesOrder\s+SalesOrder\?\s+@relation\(fields:\s*\[salesOrderId\],\s*references:\s*\[id\]\))',
    r'\1\n  salesOrderId String? @unique',
    content
)

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)
