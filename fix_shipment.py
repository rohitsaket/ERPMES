import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('  salesOrder      SalesOrder?        @relation(fields: [salesOrderId], references: [id])', '  salesOrder      SalesOrder?        @relation(fields: [salesOrderId], references: [id])\n  salesOrderId  String?     @unique')

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed")
