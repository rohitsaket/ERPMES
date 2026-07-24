import re

# 1. domain/src/index.ts
with open(r'E:\MEGen\packages\domain\src\index.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('AggregateRoot as AnyAggregateRoot', 'AggregateRoot')
if 'import type { AggregateRoot }' not in text:
    text = "import type { AggregateRoot } from './aggregate-root.js';\n" + text

with open(r'E:\MEGen\packages\domain\src\index.ts', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. ui/src/components/ui/select.tsx
with open(r'E:\MEGen\packages\ui\src\components\ui\select.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# fix my bad replacement `)));` -> `));`
text = text.replace(')));', '));')

# fix my bad replacement `\n));\nSelectTrigger` -> wait, SelectTrigger was `);` originally!
# so it should be `));` which is what I wanted.

with open(r'E:\MEGen\packages\ui\src\components\ui\select.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed")
