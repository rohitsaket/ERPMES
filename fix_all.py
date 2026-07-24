import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Company -> users User[]
# Find model User and add company Company? @relation(fields: [companyId], references: [id])
# Wait, let's just make sure there is a model User.
if 'model User {' in content:
    content = re.sub(
        r'(model User \{.*?)(^\})',
        r'\1  company    Company? @relation(fields: [companyId], references: [id])\n  companyId  String?\n\2',
        content,
        flags=re.MULTILINE | re.DOTALL
    )
else:
    content += '\nmodel User {\n  id Int @id @default(autoincrement())\n  company Company? @relation(fields: [companyId], references: [id])\n  companyId String?\n}\n'

# 2. Warehouse -> lots InventoryLot[]
# Find model InventoryLot and add warehouse Warehouse?
if 'model InventoryLot {' in content:
    content = re.sub(
        r'(model InventoryLot \{.*?)(^\})',
        r'\1  warehouse    Warehouse? @relation(fields: [warehouseId], references: [id])\n  warehouseId  String?\n\2',
        content,
        flags=re.MULTILINE | re.DOTALL
    )

# 3. WorkCenter -> company Company?
# WorkCenter -> factory Factory?
# Company missing WorkCenter opposite? Factory missing WorkCenter opposite?
# The error: `company` on `WorkCenter` missing opposite on `Company`.
# So add workCenters WorkCenter[] to Company
if 'model Company {' in content:
    content = re.sub(
        r'(model Company \{.*?)(^\})',
        r'\1  workCenters    WorkCenter[]\n\2',
        content,
        flags=re.MULTILINE | re.DOTALL
    )

# 4. Same for Factory: add workCenters WorkCenter[] to Factory
if 'model Factory {' in content:
    content = re.sub(
        r'(model Factory \{.*?)(^\})',
        r'\1  workCenters    WorkCenter[]\n\2',
        content,
        flags=re.MULTILINE | re.DOTALL
    )

# 5. SalesOrder -> quotation Quotation?
# Quotation missing opposite. Add salesOrders SalesOrder[] to Quotation
if 'model Quotation {' in content:
    content = re.sub(
        r'(model Quotation \{.*?)(^\})',
        r'\1  salesOrders    SalesOrder[]\n\2',
        content,
        flags=re.MULTILINE | re.DOTALL
    )

# 6. SalesOrder -> invoice Invoice?
# Invoice missing opposite. Add salesOrders SalesOrder[] to Invoice
if 'model Invoice {' in content:
    content = re.sub(
        r'(model Invoice \{.*?)(^\})',
        r'\1  salesOrders    SalesOrder[]\n\2',
        content,
        flags=re.MULTILINE | re.DOTALL
    )

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed")
