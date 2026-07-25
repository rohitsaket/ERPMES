const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'apps/web/src/app/(app)');

// Exclude these paths from the migration
const excludePatterns = ['/new', '[id]', '/edit'];

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('page.tsx')) {
      const isExcluded = excludePatterns.some(pattern => name.includes(path.normalize(pattern)));
      if (!isExcluded) {
        files.push(name);
      }
    }
  }
  return files;
}

const listPages = getFiles(targetDir);

listPages.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // 1. Page container flex
  content = content.replace(/className="space-y-(4|5|6)( sm:space-y-6)?"/g, 'className="flex-1 flex flex-col gap-6 min-h-0"');
  
  // 2. Header shrink
  content = content.replace(/<div className="flex items-center justify-between">/g, '<div className="flex items-center justify-between shrink-0">');
  content = content.replace(/<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">/g, '<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between shrink-0">');

  // 3. Card flex
  // In some files it's <Card>, in others it's <Card className="...">
  content = content.replace(/<Card>/g, '<Card className="flex-1 flex flex-col min-h-0 shadow-sm overflow-hidden">');
  // Avoid doubling if already ran
  content = content.replace(/<Card className="flex-1/g, '<Card className="flex-1');

  // 4. CardHeader shrink
  // E.g. <CardHeader className="flex flex-row items-center justify-between py-4">
  content = content.replace(/<CardHeader className="([^"]+)">/g, (match, classes) => {
    if (!classes.includes('shrink-0')) {
      return `<CardHeader className="${classes} shrink-0">`;
    }
    return match;
  });

  // 5. CardContent flex
  content = content.replace(/<CardContent>/g, '<CardContent className="flex-1 flex flex-col min-h-0">');
  content = content.replace(/<CardContent className="([^"]+)">/g, (match, classes) => {
    if (!classes.includes('flex-1')) {
      return `<CardContent className="${classes} flex-1 flex flex-col min-h-0">`;
    }
    return match;
  });

  // 6. Table wrapper scroll
  // It's often <div className="overflow-x-auto"> or <div className="hidden overflow-x-auto md:block">
  content = content.replace(/<div className="overflow-x-auto">/g, '<div className="flex-1 overflow-auto border rounded-md">');
  content = content.replace(/<div className="hidden overflow-x-auto md:block">/g, '<div className="hidden flex-1 overflow-auto border rounded-md md:block">');

  // 7. Table Sticky Header
  content = content.replace(/<thead>/g, '<thead className="sticky top-0 bg-card z-10 shadow-sm">');
  
  // 8. Table relative to contain absolute positioned elements if any
  content = content.replace(/<table className="([^"]+)">/g, (match, classes) => {
    if (!classes.includes('relative')) {
      return `<table className="${classes} relative">`;
    }
    return match;
  });

  // 9. Pagination wrapper
  content = content.replace(/<div className="flex items-center justify-between pt-4">/g, '<div className="flex items-center justify-between pt-4 shrink-0 mt-4 border-t">');
  content = content.replace(/<div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">/g, '<div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between shrink-0">');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${path.relative(__dirname, file)}`);
  }
});

console.log("Migration complete.");
