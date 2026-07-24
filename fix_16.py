import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Warehouse.lots -> add warehouse to InventoryLot
# Let's check if InventoryLot exists.
# We'll just add `warehouse Warehouse? @relation(fields: [warehouseId], references: [id])` and `warehouseId String?` to InventoryLot.
# Actually, the easiest way to fix "missing opposite relation" is to add it to the other model, or remove the field if it's unused.
content = re.sub(
    r'(model InventoryLot \{[\s\S]*?)(\n\})',
    r'\1\n  warehouse  Warehouse? @relation(fields: [warehouseId], references: [id])\n  warehouseId String?\2',
    content
)

# 2. SalesOrder.invoice -> add salesOrder to Invoice
content = re.sub(
    r'(model Invoice \{[\s\S]*?)(\n\})',
    r'\1\n  salesOrder SalesOrder? @relation(fields: [salesOrderId], references: [id])\n  salesOrderId String? @unique\2',
    content
)
# And remove invoice/shipment from SalesOrder to avoid ambiguity, OR just add the opposite relations to Invoice/Shipment and remove it from SalesOrder if it's not the defining side.
# Wait, SalesOrder has:
#   invoice    Invoice?
#   shipment   Shipment?
# If we add salesOrder to Invoice, we don't need fields in SalesOrder. We can just leave `invoice Invoice?` and it will be valid as long as Invoice has `@relation(fields: [...])`.

# 3. SalesOrder.shipment -> add salesOrder to Shipment
content = re.sub(
    r'(model Shipment \{[\s\S]*?)(\n\})',
    r'\1\n  salesOrder SalesOrder? @relation(fields: [salesOrderId], references: [id])\n  salesOrderId String? @unique\2',
    content
)

# 4. Nonconformance & CorrectiveAction
# They both have @relation. We should strip it from CorrectiveAction.
content = re.sub(
    r'ncr\s+Nonconformance\?\s+@relation\(fields:\s*\[ncrId\],\s*references:\s*\[id\]\)',
    r'ncr Nonconformance?',
    content
)
# And add @unique to capaId on Nonconformance! Because it's 1-1!
# Wait, Nonconformance has:
#   capa       CorrectiveAction? @relation(fields: [capaId], references: [id])
#   capaId     String?
# Let's add @unique to capaId if it exists, or just change the relation.
content = re.sub(
    r'(capa\s+CorrectiveAction\?\s+@relation\(fields:\s*\[capaId\],\s*references:\s*\[id\]\))',
    r'\1\n  capaId String? @unique',
    content
)

# 5. Asset pmSchedule
# Asset has:
#   pmSchedule    PreventiveMaintenanceSchedule? @relation(fields: [pmScheduleId], references: [id])
# But PreventiveMaintenanceSchedule has:
#   assets Asset[] @relation("AssetPmSchedule")
# This is a named relation! So Asset should be:
#   pmSchedule PreventiveMaintenanceSchedule? @relation("AssetPmSchedule", fields: [pmScheduleId], references: [id])
content = re.sub(
    r'pmSchedule\s+PreventiveMaintenanceSchedule\?\s+@relation\(fields:\s*\[pmScheduleId\],\s*references:\s*\[id\]\)',
    r'pmSchedule PreventiveMaintenanceSchedule? @relation("AssetPmSchedule", fields: [pmScheduleId], references: [id])\n  pmScheduleId String?',
    content
)

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed!")
