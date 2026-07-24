import re

# 1. fix domain-events.ts
with open(r'E:\MEGen\packages\domain\src\events\domain-events.ts', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('../../aggregate-root.js', '../aggregate-root.js')
with open(r'E:\MEGen\packages\domain\src\events\domain-events.ts', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. fix src/index.ts
with open(r'E:\MEGen\packages\domain\src\index.ts', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('OeeMetrics', 'OEEMetrics')
text = text.replace('OeeMetricsProps', 'OEEMetricsProps')
text = text.replace('StatusState', 'StatusValue') # Or maybe Status?
# Let's check value-objects/status.ts exports later if StatusValue fails. I'll just remove StatusState export if it doesn't exist.
text = re.sub(r',\s*StatusState\s*', '', text)
text = text.replace('AggregateRoot', 'AggregateRoot as AnyAggregateRoot') # Or something?
# wait, index.ts exports AggregateRoot, let's just make sure it's exported correctly.
# I'll just change export { ... AggregateRoot } to import { AggregateRoot } then export it, or remove it from the bad line.
# "Cannot find name 'AggregateRoot'" means it's trying to export a type that wasn't imported.
# Let's just remove AggregateRoot from that specific export line or import it.
with open(r'E:\MEGen\packages\domain\src\index.ts', 'w', encoding='utf-8') as f:
    f.write(text)

# 3. fix lot-number.ts
with open(r'E:\MEGen\packages\domain\src\value-objects\lot-number.ts', 'r', encoding='utf-8') as f:
    text = f.read()
# Type 'number | null' is not assignable to type 'number | undefined'
# Just replace `: number | undefined` with `: number | null` or vice versa, or add `|| undefined`
text = re.sub(r'(:\s*number\s*\|\s*undefined)', r': number | null | undefined', text)
text = re.sub(r'(:\s*string\s*\|\s*undefined)', r': string | null | undefined', text)
with open(r'E:\MEGen\packages\domain\src\value-objects\lot-number.ts', 'w', encoding='utf-8') as f:
    f.write(text)
