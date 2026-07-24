import re

with open(r'C:\Users\Administrator\.gemini\antigravity-ide\brain\a4ab7e38-d398-4957-a242-637cbe9bdff6\.system_generated\tasks\task-374.log', 'r', encoding='utf-8') as f:
    lines = f.readlines()

schema_lines = []
recording = False
for line in lines:
    if 'cat /app/prisma/schema.prisma' in line:
        recording = True
        continue
    
    if recording:
        if 'Validation Error Count' in line or 'ERROR:' in line or '[Context: getDmmf]' in line or 'error: Error parsing attribute' in line:
            break
            
        # extract content after `#26 X.XXX `
        match = re.match(r'#\d+\s+\d+\.\d+\s(.*)', line)
        if match:
            schema_lines.append(match.group(1))

if schema_lines:
    with open(r'E:\MEGen\prisma\schema.prisma.recovered', 'w', encoding='utf-8') as f:
        f.write('\n'.join(schema_lines))
    print(f"Recovered {len(schema_lines)} lines!")
else:
    print("Could not find schema in log!")
