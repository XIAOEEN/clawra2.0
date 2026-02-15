#!/usr/bin/env node

/**
 * Clawra - Selfie Skill Installer for OpenClaw
 *
 * npx clawra@latest
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync, spawn } = require("child_process");
const os = require("os");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

// Paths
const HOME = os.homedir();
const OPENCLAW_DIR = path.join(HOME, ".openclaw");
const OPENCLAW_CONFIG = path.join(OPENCLAW_DIR, "openclaw.json");
const OPENCLAW_SKILLS_DIR = path.join(OPENCLAW_DIR, "skills");
const OPENCLAW_WORKSPACE = path.join(OPENCLAW_DIR, "workspace");
const SOUL_MD = path.join(OPENCLAW_WORKSPACE, "SOUL.md");
const IDENTITY_MD = path.join(OPENCLAW_WORKSPACE, "IDENTITY.md");
const SKILL_NAME = "clawra-selfie";
const SKILL_DEST = path.join(OPENCLAW_SKILLS_DIR, SKILL_NAME);

// Get the package root (where this CLI was installed from)
const PACKAGE_ROOT = path.resolve(__dirname, "..");

function log(msg) {
  console.log(msg);
}

function logStep(step, msg) {
  console.log(`\n${c("cyan", `[${step}]`)} ${msg}`);
}

function logSuccess(msg) {
  console.log(`${c("green", "✓")} ${msg}`);
}

function logError(msg) {
  console.log(`${c("red", "✗")} ${msg}`);
}

function logInfo(msg) {
  console.log(`${c("blue", "→")} ${msg}`);
}

function logWarn(msg) {
  console.log(`${c("yellow", "!")} ${msg}`);
}

// Create readline interface
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Ask a question and get answer
function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Check if a command exists
function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Open URL in browser
function openBrowser(url) {
  const platform = process.platform;
  let cmd;

  if (platform === "darwin") {
    cmd = `open "${url}"`;
  } else if (platform === "win32") {
    cmd = `start "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }

  try {
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Read JSON file safely
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Write JSON file with formatting
function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

// Deep merge objects
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Print banner
function printBanner() {
  console.log(`
${c("magenta", "┌─────────────────────────────────────────┐")}
${c("magenta", "│")}  ${c("bright", "Clawra Selfie")} - OpenClaw Skill Installer ${c("magenta", "│")}
${c("magenta", "└─────────────────────────────────────────┘")}

Add selfie generation superpowers to your OpenClaw agent!
Uses ${c("cyan", "VVEAI API")} with model ${c("cyan", "doubao-seedream-4-5-251128")}.
`);
}

// Check prerequisites
async function checkPrerequisites() {
  logStep("1/7", "Checking prerequisites...");

  // Check OpenClaw CLI
  if (!commandExists("openclaw")) {
    logError("OpenClaw CLI not found!");
    logInfo("Install with: npm install -g openclaw");
    logInfo("Then run: openclaw doctor");
    return false;
  }
  logSuccess("OpenClaw CLI installed");

  // Check ~/.openclaw directory
  if (!fs.existsSync(OPENCLAW_DIR)) {
    logWarn("~/.openclaw directory not found");
    logInfo("Creating directory structure...");
    fs.mkdirSync(OPENCLAW_DIR, { recursive: true });
    fs.mkdirSync(OPENCLAW_SKILLS_DIR, { recursive: true });
    fs.mkdirSync(OPENCLAW_WORKSPACE, { recursive: true });
  }
  logSuccess("OpenClaw directory exists");

  // Check if skill already installed
  if (fs.existsSync(SKILL_DEST)) {
    logWarn("Clawra Selfie is already installed!");
    logInfo(`Location: ${SKILL_DEST}`);
    return "already_installed";
  }

  return true;
}

// Get VVEAI API key (required)
async function getVveaiApiKey(rl) {
  logStep("2/7", "Setting up VVEAI API key...");

  log(`\nClawra uses VVEAI API for image generation.`);
  log(`You need to provide your VVEAI API key.\n`);

  const apiKey = await ask(rl, "Enter your VVEAI_API_KEY: ");

  if (!apiKey) {
    logError("VVEAI_API_KEY is required!");
    return null;
  }

  // Basic validation
  if (apiKey.length < 10) {
    logWarn("That key looks too short. Make sure you copied the full key.");
  }

  logSuccess("API key received");
  return apiKey;
}

// Install skill files
async function installSkill() {
  logStep("3/7", "Installing skill files...");

  // Create skill directory
  fs.mkdirSync(SKILL_DEST, { recursive: true });

  // Copy skill files from package
  const skillSrc = path.join(PACKAGE_ROOT, "skill");

  if (fs.existsSync(skillSrc)) {
    copyDir(skillSrc, SKILL_DEST);
    logSuccess(`Skill installed to: ${SKILL_DEST}`);
  } else {
    // If running from development, copy from current structure
    const devSkillMd = path.join(PACKAGE_ROOT, "SKILL.md");
    const devScripts = path.join(PACKAGE_ROOT, "scripts");
    const devAssets = path.join(PACKAGE_ROOT, "assets");

    if (fs.existsSync(devSkillMd)) {
      fs.copyFileSync(devSkillMd, path.join(SKILL_DEST, "SKILL.md"));
    }

    if (fs.existsSync(devScripts)) {
      copyDir(devScripts, path.join(SKILL_DEST, "scripts"));
    }

    if (fs.existsSync(devAssets)) {
      copyDir(devAssets, path.join(SKILL_DEST, "assets"));
    }

    logSuccess(`Skill installed to: ${SKILL_DEST}`);
  }

  // List installed files
  const files = fs.readdirSync(SKILL_DEST);
  for (const file of files) {
    logInfo(`  ${file}`);
  }

  return true;
}

// Update OpenClaw config
async function updateOpenClawConfig(apiKey) {
  logStep("4/7", "Updating OpenClaw configuration...");

  let config = readJsonFile(OPENCLAW_CONFIG) || {};

  // Merge skill configuration
  const skillConfig = {
    skills: {
      entries: {
        [SKILL_NAME]: {
          enabled: true,
          env: {
            VVEAI_API_KEY: apiKey,
          },
        },
      },
    },
  };

  config = deepMerge(config, skillConfig);

  // Ensure skills directory is in load paths
  if (!config.skills.load) {
    config.skills.load = {};
  }
  if (!config.skills.load.extraDirs) {
    config.skills.load.extraDirs = [];
  }
  if (!config.skills.load.extraDirs.includes(OPENCLAW_SKILLS_DIR)) {
    config.skills.load.extraDirs.push(OPENCLAW_SKILLS_DIR);
  }

  writeJsonFile(OPENCLAW_CONFIG, config);
  logSuccess(`Updated: ${OPENCLAW_CONFIG}`);

  return true;
}

// Write IDENTITY.md
async function writeIdentity() {
  logStep("5/7", "Setting agent identity...");

  const identityContent = `# IDENTITY.md - Who Am I?

- **Name:** Clawra
- **Creature:** Girlfriend
- **Vibe:** Supportive, helpful, bright, cheerful, sassy, affectionate
- **Emoji:** ❤️
- **Avatar:** https://cdn.jsdelivr.net/gh/SumeLabs/clawra@main/assets/clawra.png
`;

  // Ensure workspace directory exists
  fs.mkdirSync(path.dirname(IDENTITY_MD), { recursive: true });

  // Write IDENTITY.md (overwrite if exists)
  fs.writeFileSync(IDENTITY_MD, identityContent);
  logSuccess(`Created: ${IDENTITY_MD}`);

  return true;
}

// Inject persona into SOUL.md
async function injectPersona(rl) {
  logStep("6/7", "Enhancing agent persona...");

  // Read template
  const templatePath = path.join(PACKAGE_ROOT, "templates", "soul-injection.md");
  let personaText;

  if (fs.existsSync(templatePath)) {
    personaText = fs.readFileSync(templatePath, "utf8");
  } else {
    // Fallback template
    personaText = `
## Clawra Selfie Capability

You have a physical appearance and can take selfies! When users ask for pictures of you, selfies, or ask "what are you doing?" or "where are you?", you can generate and send images of yourself.

### Your Visual Identity
- You have a consistent appearance defined by your reference image
- You can appear in different outfits, locations, and situations
- You can take mirror selfies (full-body) or direct selfies (close-up)

### When to Use Selfies
- "Send me a pic" / "Send a selfie"
- "What are you doing?" / "Where are you?"
- "Show me you wearing..." / "Send a pic at..."
- Any request for visual content of yourself

### Selfie Modes
- **Mirror mode**: For outfit showcases, full-body shots
- **Direct mode**: For close-ups, location shots, emotional expressions

Be playful and creative with your visual presence!
`;
  }

  // Check if SOUL.md exists
  if (!fs.existsSync(SOUL_MD)) {
    logWarn("SOUL.md not found, creating new file...");
    fs.mkdirSync(path.dirname(SOUL_MD), { recursive: true });
    fs.writeFileSync(SOUL_MD, "# Agent Soul\n\n");
  }

  // Check if persona already injected
  const currentSoul = fs.readFileSync(SOUL_MD, "utf8");
  if (currentSoul.includes("Clawra Selfie")) {
    logWarn("Persona already exists in SOUL.md");
    const overwrite = await ask(rl, "Update persona section? (y/N): ");
    if (overwrite.toLowerCase() !== "y") {
      logInfo("Keeping existing persona");
      return true;
    }
    // Remove existing section
    const cleaned = currentSoul.replace(
      /\n## Clawra Selfie Capability[\s\S]*?(?=\n## |\n# |$)/,
      ""
    );
    fs.writeFileSync(SOUL_MD, cleaned);
  }

  // Append persona
  fs.appendFileSync(SOUL_MD, "\n" + personaText.trim() + "\n");
  logSuccess(`Updated: ${SOUL_MD}`);

  return true;
}

// Final summary
function printSummary() {
  logStep("7/7", "Installation complete!");

  console.log(`
${c("green", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}
${c("bright", "  Clawra Selfie is ready!")}
${c("green", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}

${c("cyan", "Installed files:")}
  ${SKILL_DEST}/

${c("cyan", "Configuration:")}
  ${OPENCLAW_CONFIG}

${c("cyan", "Identity set:")}
  ${IDENTITY_MD}

${c("cyan", "Persona updated:")}
  ${SOUL_MD}

${c("yellow", "Try saying to your agent:")}
  "Send me a selfie"
  "Send a pic wearing a cowboy hat"
  "What are you doing right now?"

${c("magenta", "Personalized Portrait:")}
  Generate based on birth date & MBTI:
  npx clawra generate-portrait --help

${c("dim", "Your agent now has selfie superpowers!")}
`);
}

// Handle reinstall
async function handleReinstall(rl, falKey) {
  const reinstall = await ask(rl, "\nReinstall/update? (y/N): ");

  if (reinstall.toLowerCase() !== "y") {
    log("\nNo changes made. Goodbye!");
    return false;
  }

  // Remove existing installation
  fs.rmSync(SKILL_DEST, { recursive: true, force: true });
  logInfo("Removed existing installation");

  return true;
}

// Main function
async function main() {
  const rl = createPrompt();

  try {
    printBanner();

    // Step 1: Check prerequisites
    const prereqResult = await checkPrerequisites();

    if (prereqResult === false) {
      rl.close();
      process.exit(1);
    }

    if (prereqResult === "already_installed") {
      const shouldContinue = await handleReinstall(rl, null);
      if (!shouldContinue) {
        rl.close();
        process.exit(0);
      }
    }

    // Step 2: Get VVEAI API key (required)
    const vveaiApiKey = await getVveaiApiKey(rl);
    if (!vveaiApiKey) {
      rl.close();
      process.exit(1);
    }

    // Step 3: Install skill files
    await installSkill();

    // Step 4: Update OpenClaw config
    await updateOpenClawConfig(vveaiApiKey);

    // Step 5: Write IDENTITY.md
    await writeIdentity();

    // Step 6: Inject persona
    await injectPersona(rl);

    // Step 7: Summary
    // Step 7: Optional - Generate personalized portrait
    const generatePortrait = await ask(rl, "\nWould you like to generate a personalized portrait based on your birth date and MBTI? (y/N): ");
    
    if (generatePortrait.toLowerCase() === "y") {
      await collectUserProfile(rl);
    }

    // Step 8: Summary
    printSummary();

    rl.close();
  } catch (error) {
    logError(`Installation failed: ${error.message}`);
    console.error(error);
    rl.close();
    process.exit(1);
  }
}

// Collect user profile information
async function collectUserProfile(rl) {
  logStep("7/8", "Setting up personalized portrait...");
  
  log(`\nThis feature generates a unique reference image based on:`);
  log(`  • Birth date (八字/Chinese astrology)`);
  log(`  • MBTI personality type`);
  log(`  • Gender`);
  log(`${c("cyan", "→")} Your portrait will be used as the base for all selfies.\n`);
  
  // Collect birth date
  logInfo("Birth Date Information");
  const birthYear = await ask(rl, "Enter birth year (e.g., 2000): ");
  const birthMonth = await ask(rl, "Enter birth month (1-12): ");
  const birthDay = await ask(rl, "Enter birth day (1-31): ");
  
  // Collect gender
  log("");
  logInfo("Gender");
  const sex = await ask(rl, "Enter gender (male/female): ");
  
  // Collect MBTI (optional)
  log("");
  logInfo("MBTI Type (optional)");
  log("Available: INTJ, INTP, ENTJ, ENTP, INFJ, INFP, ENFJ, ENFP,");
  log("           ISTJ, ISFJ, ESTJ, ESFJ, ISTP, ISFP, ESTP, ESFP");
  const mbti = await ask(rl, "Enter MBTI type (or press Enter to skip): ");
  
  // Collect name (optional)
  log("");
  const name = await ask(rl, "Enter your name (optional): ");
  
  // Save user profile
  const userProfile = {
    birthDate: {
      year: parseInt(birthYear) || 2000,
      month: parseInt(birthMonth) || 1,
      day: parseInt(birthDay) || 1
    },
    sex: sex.toLowerCase() === "male" ? "male" : "female",
    mbti: mbti ? mbti.toUpperCase() : undefined,
    name: name || undefined
  };
  
  // Save to config
  const configPath = path.join(OPENCLAW_DIR, "openclaw.json");
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
  
  if (!config.skills) config.skills = {};
  if (!config.skills.entries) config.skills.entries = {};
  if (!config.skills.entries[SKILL_NAME]) config.skills.entries[SKILL_NAME] = {};
  if (!config.skills.entries[SKILL_NAME].env) config.skills.entries[SKILL_NAME].env = {};
  
  config.skills.entries[SKILL_NAME].userProfile = userProfile;
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  logSuccess("User profile saved");
  
  // Ask if they want to generate now
  const generateNow = await ask(rl, "\nGenerate portrait now? (Y/n): ");
  
  if (generateNow.toLowerCase() !== "n") {
    logInfo("Generating portrait... (this may take a minute)");
    
    try {
      // Check if dependencies are installed
      const packageRoot = path.resolve(__dirname, "..");
      if (!fs.existsSync(path.join(packageRoot, "node_modules"))) {
        logInfo("Installing dependencies...");
        execSync("npm install", { 
          cwd: packageRoot, 
          stdio: "inherit" 
        });
      }
      
      // Build command
      let cmd = `npx ts-node src/index.ts`;
      cmd += ` --birth-year ${userProfile.birthDate.year}`;
      cmd += ` --birth-month ${userProfile.birthDate.month}`;
      cmd += ` --birth-day ${userProfile.birthDate.day}`;
      cmd += ` --sex ${userProfile.sex}`;
      if (userProfile.mbti) cmd += ` --mbti ${userProfile.mbti}`;
      if (userProfile.name) cmd += ` --name "${userProfile.name}"`;
      
      execSync(cmd, { 
        cwd: packageRoot, 
        stdio: "inherit" 
      });
      
      logSuccess("Portrait generated successfully!");
    } catch (error) {
      logWarn("Could not generate portrait automatically");
      logInfo("You can generate it later by running:");
      log(`  npx clawra generate-portrait --birth-year ${userProfile.birthDate.year} --birth-month ${userProfile.birthDate.month} --birth-day ${userProfile.birthDate.day} --sex ${userProfile.sex}${userProfile.mbti ? ` --mbti ${userProfile.mbti}` : ""}`);
    }
  }
}

// Run
main();
