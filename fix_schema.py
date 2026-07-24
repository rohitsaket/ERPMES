import re

def fix_schema():
    with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. SalesOrder__fkey duplicate constraint. SalesOrder has shipment Shipment?
    # Let's remove the shipment Shipment? from SalesOrder or add the opposite field in Shipment.
    # Looking at the error: "missing an opposite relation field on the model Shipment"
    # Let's find model Shipment
    # We can just add salesOrder SalesOrder? @relation(fields: [salesOrderId], references: [id]) to Shipment
    if 'model Shipment {' in content:
        content = re.sub(
            r'(model Shipment \{.*?)(^\})',
            r'\1  salesOrder    SalesOrder? @relation(fields: [salesOrderId], references: [id])\n  salesOrderId  String?     @unique\n\2',
            content,
            flags=re.MULTILINE | re.DOTALL
        )

    # 2. Nonconformance and CorrectiveAction
    # error: The relation fields `capa` on Model `Nonconformance` and `ncr` on Model `CorrectiveAction` both provide the `references` argument
    # We should keep it on CorrectiveAction (the child) and remove it from Nonconformance.
    content = re.sub(
        r'capa       CorrectiveAction\? @relation\(fields: \[capaId\], references: \[id\]\)',
        r'capa       CorrectiveAction?',
        content
    )
    
    # Also need to make capaId unique? The error says "A one-to-one relation must use unique fields on the defining side. Either add an `@unique` attribute to the field `capaId`"
    # But if we removed the relation fields from Nonconformance, it doesn't need @unique on capaId, because the defining side is CorrectiveAction.
    # We should remove capaId from Nonconformance if we removed the relation.
    # Let's check CorrectiveAction. It has: ncr Nonconformance? @relation(fields: [ncrId], references: [id])
    # So CorrectiveAction is the defining side. Nonconformance should just have `capa CorrectiveAction?`
    content = re.sub(
        r'capaId\s+String\?\n',
        r'',
        content
    )

    # 3. Asset and PreventiveMaintenanceSchedule
    # Error: pmSchedule on Model Asset must specify fields argument.
    # Error: assets on PreventiveMaintenanceSchedule must not specify fields.
    # Let's just fix it by making PreventiveMaintenanceSchedule the defining side, or making it 1-to-many.
    # Asset has `pmSchedule PreventiveMaintenanceSchedule?`
    # PreventiveMaintenanceSchedule has `assets Asset[] @relation(fields: [id])`
    # If PreventiveMaintenanceSchedule has Asset[], it's 1-to-many.
    # So Asset should be the defining side:
    # Asset: pmSchedule PreventiveMaintenanceSchedule? @relation(fields: [pmScheduleId], references: [id])
    # PreventiveMaintenanceSchedule: assets Asset[]
    content = re.sub(
        r'pmSchedule    PreventiveMaintenanceSchedule\?',
        r'pmSchedule    PreventiveMaintenanceSchedule? @relation(fields: [pmScheduleId], references: [id])\n  pmScheduleId  String?',
        content
    )
    content = re.sub(
        r'assets Asset\[\] @relation\(fields: \[id\]\)',
        r'assets Asset[]',
        content
    )
    
    with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Schema patched.")

fix_schema()
