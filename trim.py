import re

with open(r'E:\MEGen\prisma\schema.prisma', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove garbage at the start
while lines and not lines[0].startswith('generator client'):
    lines.pop(0)

# Remove garbage at the end
# find the last '}'
last_brace = -1
for i in range(len(lines)-1, -1, -1):
    if '}' in lines[i]:
        last_brace = i
        break

if last_brace != -1:
    lines = lines[:last_brace+1]
    # In case there's garbage after the last '}' on the same line
    lines[-1] = '}\n'

with open(r'E:\MEGen\prisma\schema.prisma', 'w', encoding='utf-8') as f:
    f.write(''.join(lines))

print("Schema trimmed!")
