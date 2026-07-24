import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const appRoot = join(webRoot, "src", "app");
const sourceRoot = join(webRoot, "src");

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function pageRoute(file: string) {
  const path = relative(appRoot, file)
    .split(sep)
    .filter((segment) => !/^\(.+\)$/.test(segment))
    .join("/")
    .replace(/\/?page\.tsx$/, "");
  return path ? `/${path}` : "/";
}

function routePattern(route: string) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\\\[[^/]+\\\]/g, "[^/]+")}/?$`);
}

describe("application route connections", () => {
  it("keeps every local href connected to a page", () => {
    const routes = walk(appRoot)
      .filter((file) => file.endsWith("page.tsx"))
      .map(pageRoute);
    const patterns = routes.map(routePattern);
    const source = walk(sourceRoot)
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    const hrefs = [
      ...source.matchAll(/href\s*[=:]\s*["'](\/[^"'`{}]+)["']/g),
    ].map((match) => match[1]!.split(/[?#]/)[0]!);
    const templateHrefs = [
      ...source.matchAll(/href=\{`(\/[^`]+)`\}/g),
    ].map((match) =>
      match[1]!.replace(/\$\{[^}]+\}/g, "example-id").split(/[?#]/)[0]!,
    );
    const missing = [...new Set([...hrefs, ...templateHrefs])]
      .filter((href) => !patterns.some((pattern) => pattern.test(href)))
      .sort();

    expect(missing).toEqual([]);
  });
});
