import fs from 'fs';
import path from 'path';

const appDir = path.join(process.cwd(), 'apps/web/src/app/(app)');
const registryPath = path.join(process.cwd(), 'apps/web/src/components/workspace/registry.tsx');

function getPages(dir, baseRoute = '') {
  let pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Avoid deep dynamic routes for now if we want just the main lists, 
      // but let's include all 'page.tsx' that do not contain '[' or ']'?
      // Actually, if we map everything it's fine.
      pages = pages.concat(getPages(path.join(dir, entry.name), `${baseRoute}/${entry.name}`));
    } else if (entry.name === 'page.tsx') {
      pages.push(baseRoute === '' ? '/' : baseRoute);
    }
  }
  return pages;
}

const allPages = getPages(appDir);

// Filter out root (handled by layout maybe) and dynamic routes for simplicity, or include them but we just want to match the prefix.
// The current logic uses url.startsWith() for module bases.
// Let's just create exact matches for everything to be safe, except the ones that were startsWith.
// Actually, let's map every page we found.

let imports = `import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Fallback empty page for unmapped routes
const FallbackPage = () => <div className="p-6 text-muted-foreground">Module not yet configured for tabs.</div>;

`;

let mappings = `export function getComponentForUrl(url: string): ComponentType<any> {
`;

const importStatements = [];
const mappingStatements = [];

// Clean up pages
const uniquePages = Array.from(new Set(allPages)).filter(p => p !== '/' && p !== '');

// sort pages so that more specific paths come first (e.g. /a/b/c before /a/b)
uniquePages.sort((a, b) => b.length - a.length);

uniquePages.forEach((route, index) => {
  // convert route to Component Name (e.g. /master-data/vendors -> MasterDataVendorsPage)
  const compName = route.split('/').filter(Boolean).map(s => {
    // remove dynamic brackets for component name
    s = s.replace(/\[|\]/g, '');
    return s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  }).join('') + 'Page' + index;
  
  // path for import
  const importPath = `@/app/(app)${route}/page`;
  
  importStatements.push(`const ${compName} = dynamic(() => import("${importPath}"));`);
  
  // if route contains dynamic part like [id], we need a regex or simply fallback to exact for now
  // Actually, we can just replace [id] with [^/]+ for a regex match, or just use exact matches.
  // In the original, they used url.startsWith("/master-data/vendors").
  // If we map exact routes, we can just do:
  
  if (route.includes('[')) {
    // skip dynamic routes for now, or match them with regex
    const regexStr = route.replace(/\[.*?\]/g, '[^/]+').replace(/\//g, '\\\\/');
    mappingStatements.push(`  if (new RegExp('^' + '${regexStr}' + '$').test(url)) return ${compName};`);
  } else {
    mappingStatements.push(`  if (url === "${route}") return ${compName};`);
    // Also if it's the base of a route, maybe we want it to handle subroutes if they aren't mapped?
    // Let's just add an exact match.
  }
});

// For compatibility with their existing code:
// removed hardcoded fallbacks

imports += importStatements.join('\n') + '\n\n';
mappings += mappingStatements.join('\n') + '\n  return FallbackPage;\n}\n';

fs.writeFileSync(registryPath, imports + mappings);
console.log('Registry updated successfully.');
