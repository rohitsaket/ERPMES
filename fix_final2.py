import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. SalesOrder invoice
content = re.sub(
    r'  invoice\s+Invoice\?',
    r'  invoice    Invoice? @relation(fields: [invoiceId], references: [id])\n  invoiceId  String?',
    content
)

# 2. SalesOrder shipment
content = re.sub(
    r'  shipment\s+Shipment\?',
    r'  shipment   Shipment? @relation(fields: [shipmentId], references: [id])\n  shipmentId String?',
    content
)

# 3. Nonconformance capa
content = re.sub(
    r'  capa\s+CorrectiveAction\?',
    r'  capa       CorrectiveAction? @relation(fields: [capaId], references: [id])\n  capaId String?',
    content
)

# 4. CorrectiveAction ncr
content = re.sub(
    r'  ncr\s+Nonconformance\?',
    r'  ncr Nonconformance? @relation(fields: [ncrId], references: [id])\n  ncrId String?',
    content
)

# 5. Asset pmSchedule
content = re.sub(
    r'  pmSchedule\s+PreventiveMaintenanceSchedule\?',
    r'  pmSchedule    PreventiveMaintenanceSchedule? @relation(fields: [pmScheduleId], references: [id])\n  pmScheduleId  String?',
    content
)

# 6. PreventiveMaintenanceSchedule assets
content = re.sub(
    r'  assets\s+Asset\[\]\s*@relation\("AssetPmSchedule"\)',
    r'  assets Asset[]',
    content
)

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed")
