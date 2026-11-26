// Famous Last Words at 1 Percent — entry program.
// Writes the phone's dying line to /output/entry.txt and verifies it.
import { mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ENTRY =
  "Tell my owner I was at 100% the whole time — I just wanted to see if he'd finally look up from me.";

const outDir = "/output";
mkdirSync(outDir, { recursive: true });
// Empty /output's CONTENTS only; never remove the mounted directory itself.
for (const name of readdirSync(outDir)) {
  rmSync(`${outDir}/${name}`, { recursive: true, force: true });
}

const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 199) {
  throw new Error(`gate: entry is ${chars.length} chars, must be 1-199`);
}
if (!ENTRY.trim()) throw new Error("gate: entry is only whitespace");
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("gate: entry must be a single line");
}
// Fail fast: no control characters, no BOM, and the UTF-8 byte length must
// stay sane for a one-line entry (the gate counts characters, not bytes).
if (/[\u0000-\u001F\u007F]/.test(ENTRY)) {
  throw new Error("gate: entry contains control characters");
}
if (ENTRY.charCodeAt(0) === 0xfeff) {
  throw new Error("gate: entry starts with a BOM");
}
const byteLen = Buffer.byteLength(ENTRY, "utf8");
if (byteLen > 796) throw new Error(`gate: entry is ${byteLen} bytes, too long`);

const target = `${outDir}/entry.txt`;
writeFileSync(target, ENTRY, "utf8");
const back = readFileSync(target, "utf8");
if (back !== ENTRY) throw new Error("read-back mismatch");
const sha = createHash("sha256").update(back, "utf8").digest("hex");
console.log(`wrote ${target}: ${chars.length} chars, sha256 ${sha}`);
