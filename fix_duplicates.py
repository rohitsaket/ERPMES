import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix duplicates added by my previous scripts
content = content.replace('  quotation  Quotation?      @relation(fields: [quotationId], references: [id])\n  quotationId String?\n  quotationId  String?', '  quotation  Quotation?      @relation(fields: [quotationId], references: [id])\n  quotationId String?')
content = content.replace('  quotation  Quotation?      @relation(fields: [quotationId], references: [id])\n  quotationId  String?\n  quotationId String?', '  quotation  Quotation?      @relation(fields: [quotationId], references: [id])\n  quotationId String?')

# Since I don't know the exact order or spacing for quotationId, let's use regex:
content = re.sub(r'  quotationId\s*String\?\n\s*quotationId\s*String\?', '  quotationId String?', content)
content = re.sub(r'  quotationId\s*String\?\n', '', content) # remove it if it exists
content = re.sub(r'  quotation\s*Quotation\?\s*@relation\(fields:\s*\[quotationId\],\s*references:\s*\[id\]\)', r'  quotation  Quotation?      @relation(fields: [quotationId], references: [id])\n  quotationId String?', content)

# Same for invoiceId
content = re.sub(r'  invoiceId\s*String\?\n', '', content)
content = re.sub(r'  invoice\s*Invoice\?\s*@relation\(fields:\s*\[invoiceId\],\s*references:\s*\[id\]\)', r'  invoice    Invoice? @relation(fields: [invoiceId], references: [id])\n  invoiceId  String?', content)

# Same for salesOrderId on Shipment
content = re.sub(r'  salesOrderId\s*String\?\s*@unique\n', '', content)
content = re.sub(r'  salesOrderId\s*String\?\n', '', content)
content = re.sub(r'  salesOrder\s*SalesOrder\?\s*@relation\(fields:\s*\[salesOrderId\],\s*references:\s*\[id\]\)', r'  salesOrder    SalesOrder? @relation(fields: [salesOrderId], references: [id])\n  salesOrderId  String? @unique', content)


with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed")
