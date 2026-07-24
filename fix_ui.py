import re

# 1. select.tsx
with open(r'E:\MEGen\packages\ui\src\components\ui\select.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace(');', '));')
# wait! we don't want to replace `SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;` but that doesn't have `);`
# wait! `  <SelectPrimitive.Trigger ... > ... </SelectPrimitive.Trigger>\n);`
# we should replace `\n);\nSelectTrigger.displayName` with `\n));\nSelectTrigger.displayName`
text = text.replace('\n);\nSelectTrigger', '\n));\nSelectTrigger')
text = text.replace('\n);\nSelectScrollUpButton', '\n));\nSelectScrollUpButton')
text = text.replace('\n);\nSelectScrollDownButton', '\n));\nSelectScrollDownButton')
with open(r'E:\MEGen\packages\ui\src\components\ui\select.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. button.tsx
with open(r'E:\MEGen\packages\ui\src\components\ui\button.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('    )\n  );\n);\nButton.displayName', '    );\n  }\n);\nButton.displayName')
with open(r'E:\MEGen\packages\ui\src\components\ui\button.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 3. input.tsx
with open(r'E:\MEGen\packages\ui\src\components\ui\input.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace('    )\n  );\n);\nInput.displayName', '    );\n  }\n);\nInput.displayName')
with open(r'E:\MEGen\packages\ui\src\components\ui\input.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 4. data-table.tsx
with open(r'E:\MEGen\packages\ui\src\components\ui\data-table.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
# In data-table.tsx, there's a missing closing `</tr>` before `</thead>`.
# Look at lines 160-204:
#            {table.getHeaderGroups().map((headerGroup) => (
#              <tr key={headerGroup.id}>
#                {headerGroup.headers.map((header) => (
#                   ...
#                ))}
#              </tr>
#            ))}
# Wait, let's see what's actually missing.
# Line 147: `<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">`
# This `<tr>` wraps `{selectable && <th.../>}` and `{table.getHeaderGroups().map(...)}`.
# But `table.getHeaderGroups().map` returns `<tr key={headerGroup.id}>`!
# You can't nest `<tr>` inside `<tr>`!
# Ah! The outer `<tr>` at line 147 is WRONG. It shouldn't exist, OR it shouldn't contain the `table.getHeaderGroups().map`.
# Let's see: The original author probably meant to put the selectable checkbox INSIDE the map.
# Let's replace the whole `thead` with a clean one.
text = re.sub(
    r'<thead className="\[&_tr\]:border-b">[\s\S]*?</thead>',
    r'''<thead className="[&_tr]:border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {selectable && (
                <th className="w-12 h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedCount === table.getFilteredRowModel().rows.length && table.getFilteredRowModel().rows.length > 0}
                    indeterminate={selectedCount > 0 && selectedCount < table.getFilteredRowModel().rows.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:bg-muted/50'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ width: header.getSize() }}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="ml-auto">
                        {header.column.getIsSorted() === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 opacity-0" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>''',
    text
)
with open(r'E:\MEGen\packages\ui\src\components\ui\data-table.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed UI components")
