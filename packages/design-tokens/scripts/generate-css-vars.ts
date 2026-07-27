import { generateCssVariables } from '../src/css-vars/generate';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const css = generateCssVariables();
const outputPath = resolve(__dirname, '../dist/design-tokens.css');

mkdirSync(resolve(__dirname, '../dist'), { recursive: true });
writeFileSync(outputPath, css);
console.log(`CSS variables generated at ${outputPath}`);