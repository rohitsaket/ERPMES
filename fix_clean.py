import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the messy relations added by my regexes

# Remove all @relation(...) from scalar fields like String? @relation(...)
content = re.sub(r'(String\??\s+)@relation\([^)]+\)', r'\1', content)

# Remove duplicate fields: if a field is defined twice consecutively, keep one
# E.g. capaId String? \n capaId String?
content = re.sub(r'(\w+\s+String\??(\s+@unique)?\n\s*)\1', r'\1', content)
content = re.sub(r'(\w+\s+String\??\n\s*)\w+\s+String\??\n', r'\1', content)

# For any duplicate fields that weren't caught by the simple regex:
lines = content.split('\n')
cleaned_lines = []
for i, line in enumerate(lines):
    if 'String?' in line and not '@relation' in line:
        # Check if the next line is exactly the same field
        parts = line.strip().split()
        if len(parts) >= 2:
            field_name = parts[0]
            # check if previous line had same field name
            if len(cleaned_lines) > 0:
                prev_parts = cleaned_lines[-1].strip().split()
                if len(prev_parts) >= 2 and prev_parts[0] == field_name:
                    continue # skip duplicate
    cleaned_lines.append(line)

content = '\n'.join(cleaned_lines)

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print("Schema fixed")
