import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix SalesOrder invoice missing fields
content = content.replace('  invoice    Invoice?', '  invoice    Invoice? @relation(fields: [invoiceId], references: [id])\n  invoiceId  String?')

# Fix SalesOrder quotation missing fields
# Let's check if quotation needs it too. The error didn't mention it, but it might.
content = content.replace('  quotation  Quotation?      @relation(fields: [quotationId], references: [id])', '  quotation  Quotation?      @relation(fields: [quotationId], references: [id])\n  quotationId String?')

# Fix Shipment missing @unique on salesOrderId
# Since my previous fix removed salesOrderId entirely, we have:
#  salesOrder    SalesOrder? @relation(fields: [salesOrderId], references: [id])
# Let's add salesOrderId String? @unique right after it.
content = content.replace(
    '  salesOrder    SalesOrder? @relation(fields: [salesOrderId], references: [id])',
    '  salesOrder    SalesOrder? @relation(fields: [salesOrderId], references: [id])\n  salesOrderId  String? @unique'
)

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed")
