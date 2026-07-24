import json

with open(r'E:\MEGen\package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)

pkg['scripts']['build:api'] = 'nx build @diamondflow/api'
pkg['scripts']['build:web'] = 'nx build @diamondflow/web'
pkg['scripts']['build:worker'] = 'nx build @diamondflow/worker'
pkg['scripts']['dev'] = 'nx run-many --target=dev --projects=@diamondflow/api,@diamondflow/web --parallel'

with open(r'E:\MEGen\package.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)

print("Updated root package.json")
