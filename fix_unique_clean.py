import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# First, remove the duplicate lines I just added
content = content.replace('  capaId String? @unique', '')
content = content.replace('  salesOrderId String? @unique', '')

# Now, add @unique to the original lines
content = re.sub(r'(capaId\s+String\?)', r'\1 @unique', content, count=1)

# For salesOrderId, there are multiple models with salesOrderId (SalesOrderLine, Shipment, Invoice).
# We only want @unique on Shipment and Invoice.
# Let's find Shipment and replace inside it.
def replace_in_model(model_name, field_name, new_field, text):
    pattern = r'(model\s+' + model_name + r'\s+\{[\s\S]*?\})'
    match = re.search(pattern, text)
    if match:
        model_content = match.group(1)
        # only replace the exact scalar field definition, not the @relation fields
        # scalar field usually looks like: `  salesOrderId String?`
        model_content = re.sub(r'(\s+' + field_name + r'\s+String\?)', r'\1 @unique', model_content, count=1)
        return text.replace(match.group(1), model_content)
    return text

content = replace_in_model('Shipment', 'salesOrderId', 'salesOrderId String? @unique', content)
content = replace_in_model('Invoice', 'salesOrderId', 'salesOrderId String? @unique', content)

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)
