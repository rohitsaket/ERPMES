import fs from 'fs';
import path from 'path';

const appDir = path.join(process.cwd(), 'apps/web/src/app/(app)');

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      // Remove import
      content = content.replace(/import\s*\{\s*AppShell\s*\}\s*from\s*['"]@\/components\/layout\/app-shell['"]\s*;\n?/g, '');
      
      // Replace <AppShell> with <>
      content = content.replace(/<AppShell>/g, '<>');
      
      // Replace </AppShell> with </>
      content = content.replace(/<\/AppShell>/g, '</>');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(appDir);
console.log('Finished removing AppShell from pages.');
