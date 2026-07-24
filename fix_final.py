import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix duplicates added by my previous script
content = content.replace('  company    Company? @relation(fields: [companyId], references: [id])\n  companyId  String?\n', '  company    Company? @relation(fields: [companyId], references: [id])\n')
content = content.replace('  warehouse    Warehouse? @relation(fields: [warehouseId], references: [id])\n  warehouseId  String?\n', '  warehouse    Warehouse? @relation(fields: [warehouseId], references: [id])\n')

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed")
