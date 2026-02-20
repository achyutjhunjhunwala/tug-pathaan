#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NOTIFY_API_URL = "http://tugpi:3000/notify";

const program = new Command();

program
  .name("pathaan")
  .description("Run Gemini prompts from .spec.md files and announce via Google Home")
  .argument("[specfile]", "Name of the .spec.md file (e.g. demo.spec.md)")
  .action(async (specfile) => {
    if (!specfile) {
      const specDir = resolve(__dirname, "spec");
      const files = existsSync(specDir)
        ? readdirSync(specDir).filter((f) => f.endsWith(".spec.md"))
        : [];

      console.log(`\nHey AJ, did you forget the spec file? Please use one of the files from here:\n`);
      if (files.length) {
        files.forEach((f) => console.log(`  → ${f}`));
      } else {
        console.log("  (no .spec.md files found in spec/)");
      }
      console.log(`\nUsage: node pathaan.js <specfile>\n`);
      return;
    }

    try {
      await run(specfile);
    } catch (err) {
      console.error(`\n✗ Fatal error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();

async function run(specfile) {
  const specPath = resolve(__dirname, "spec", specfile);

  if (!existsSync(specPath)) {
    throw new Error(`Spec file not found: ${specPath}`);
  }

  if (!specfile.endsWith(".spec.md")) {
    throw new Error(`File must be a .spec.md file. Got: ${specfile}`);
  }

  const prompt = readFileSync(specPath, "utf-8").trim();
  if (!prompt) {
    throw new Error("Spec file is empty");
  }

  console.log(`\n▸ Running spec: ${specfile}`);

  const geminiResponse = executeGemini(prompt);

  console.log(`\n▸ Gemini response received (${geminiResponse.length} chars)`);

  saveResponse(specfile, geminiResponse);

  await notifyApi(geminiResponse);

  console.log(`\n✓ Done\n`);
}

function executeGemini(prompt) {
  console.log(`▸ Executing Gemini CLI...`);

  try {
    const escaped = prompt.replace(/'/g, "'\\''");
    const output = execSync(`gemini -p '${escaped}'`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 5 * 60 * 1000,
    });

    return output.trim();
  } catch (err) {
    throw new Error(`Gemini CLI failed: ${err.stderr || err.message}`);
  }
}

function saveResponse(specfile, content) {
  const folderName = specfile.substring(0, specfile.indexOf(".spec.md"));
  const historyDir = resolve(__dirname, "history");
  const folderPath = resolve(historyDir, folderName);

  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
    console.log(`▸ Created folder: history/${folderName}/`);
  }

  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-") + "-" + [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join(":");

  const fileName = `${folderName}-${timestamp}.md`;
  const filePath = resolve(folderPath, fileName);

  const mdContent = `# ${folderName} — ${timestamp}\n\n${content}\n`;

  writeFileSync(filePath, mdContent, "utf-8");
  console.log(`▸ Saved response: history/${folderName}/${fileName}`);
}

async function notifyApi(message) {
  console.log(`▸ Sending notification to Google Home...`);

  const res = await fetch(NOTIFY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error(`Notify API returned ${res.status}: ${await res.text()}`);
  }

  console.log(`▸ Notification sent successfully`);
}
