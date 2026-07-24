import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('  pmScheduleId  String?\n  sparePartLinks', '  sparePartLinks')
content = content.replace('  salesOrderId  String?     @unique\n}', '}')

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed")
