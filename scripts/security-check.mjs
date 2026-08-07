import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname } from "node:path";

const repositoryFiles = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" }
)
  .split("\0")
  .filter((file) => Boolean(file) && existsSync(file));

const forbiddenPublicUploads = repositoryFiles.filter(
  (file) => file.startsWith("public/uploads/") || file.startsWith("uploads/")
);

const textExtensions = new Set([
  "",
  ".cjs",
  ".env",
  ".example",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".sql",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

const secretPatterns = [
  { name: "provider API key", pattern: /s[k]-[A-Za-z0-9_-]{20,}/g },
  { name: "private key", pattern: /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/g },
  { name: "Supabase service-role token", pattern: /service[_-]?role[^\n]{0,40}eyJ[A-Za-z0-9_-]{20,}/gi },
  { name: "hardcoded bearer token", pattern: /Bearer\s+[A-Za-z0-9._-]{30,}/g },
];

const findings = [];

for (const file of repositoryFiles) {
  if (!textExtensions.has(extname(file)) && !file.endsWith(".env.example")) continue;

  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) findings.push(`${file}: ${name}`);
  }
}

if (forbiddenPublicUploads.length > 0 || findings.length > 0) {
  console.error("Security check failed.");

  if (forbiddenPublicUploads.length > 0) {
    console.error("Tracked upload files are forbidden:");
    forbiddenPublicUploads.forEach((file) => console.error(`- ${file}`));
  }

  if (findings.length > 0) {
    console.error("Potential committed secrets detected:");
    findings.forEach((finding) => console.error(`- ${finding}`));
  }

  process.exit(1);
}

console.log("Security check passed: no tracked uploads or obvious embedded secrets found.");
