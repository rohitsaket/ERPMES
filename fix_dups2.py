import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

models = content.split('model ')
new_models = [models[0]]

for m in models[1:]:
    lines = m.split('\n')
    seen_fields = set()
    new_lines = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith('//') or stripped.startswith('@@'):
            new_lines.append(line)
            continue
            
        parts = stripped.split()
        if not parts:
            new_lines.append(line)
            continue
            
        field = parts[0]
        # if it's a scalar field we added, let's just deduplicate any field that appears twice
        # wait, we only want to deduplicate scalar fields, not relations, but if a field name is exact same...
        # Prisma doesn't allow duplicate field names anyway!
        if field in seen_fields:
            # skip it!
            continue
        
        seen_fields.add(field)
        new_lines.append(line)
        
    new_models.append('\n'.join(new_lines))

content = 'model '.join(new_models)

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)
