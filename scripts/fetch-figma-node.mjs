import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import fetch from "node-fetch";

const token = process.env.FIGMA_ACCESS_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;
const cliNodeIds = process.argv.slice(2).filter(Boolean);
const envNodeIds = process.env.FIGMA_NODE_IDS?.split(",").map((id) => id.trim()).filter(Boolean) ?? [];
const nodeIds = cliNodeIds.length > 0 ? cliNodeIds : envNodeIds;
const outputPath = process.env.FIGMA_OUTPUT_PATH ?? "figma-node.json";

if (!token) {
  throw new Error("Missing FIGMA_ACCESS_TOKEN. Add it to .env before running this script.");
}

if (!fileKey) {
  throw new Error("Missing FIGMA_FILE_KEY. Add it to .env before running this script.");
}

if (nodeIds.length === 0) {
  throw new Error("Missing node id. Run: npm run figma:node -- 1:92");
}

const url = new URL(`https://api.figma.com/v1/files/${fileKey}/nodes`);
url.searchParams.set("ids", nodeIds.join(","));

const response = await fetch(url, {
  headers: {
    "X-Figma-Token": token,
  },
});

const payload = await response.json();

if (!response.ok) {
  throw new Error(`Figma API ${response.status}: ${JSON.stringify(payload, null, 2)}`);
}

const resolvedOutputPath = path.resolve(process.cwd(), outputPath);
await fs.writeFile(resolvedOutputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Fetched ${nodeIds.length} node(s): ${nodeIds.join(", ")}`);
console.log(`Saved to ${resolvedOutputPath}`);
