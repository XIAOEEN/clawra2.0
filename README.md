# Clawra
<img width="300"  alt="image" src="https://github.com/user-attachments/assets/41512c51-e61d-4550-b461-eed06a1b0ec8" />


## Quick Start

```bash
npx clawra@latest
```

This will:
1. Check OpenClaw is installed
2. Prompt for your VVEAI API key
3. Install the skill to `~/.openclaw/skills/clawra-selfie/`
4. Configure OpenClaw to use the skill
5. Add selfie capabilities to your agent's SOUL.md

## What It Does

Clawra Selfie enables your OpenClaw agent to:
- **Generate selfies** using VVEAI API
- **Send photos** across all messaging platforms (Discord, Telegram, WhatsApp, etc.)
- **Respond visually** to "what are you doing?" and "send a pic" requests
- **Generate personalized portraits** based on birth date and MBTI personality type

### API Configuration

The skill uses VVEAI API. You need to set your API key:
- **Base URL**: `https://api.vveai.com` (default)
- **Model**: `doubao-seedream-4-5-251128` (default)

**Required**: Set `VVEAI_API_KEY` environment variable with your API key.

### Personalized Portrait Generation 🎨

Clawra can generate a unique reference image based on your personal attributes:

- **Birth Date** → Calculates 八字 (Chinese astrology) and 五行 (Five Elements)
- **MBTI Type** → Adds personality-based expression and vibe
- **Gender** → Customizes hairstyle and facial features

Each element (金/木/水/火/土) maps to specific facial features:
- **Eyes, Hairstyle** → Determined by dominant element
- **Face shape, Nose** → Determined by secondary element  
- **Eyebrows, Lips, Ears** → Determined by tertiary element

## Prerequisites

- [OpenClaw](https://github.com/openclaw/openclaw) installed and configured

## Manual Installation

If you prefer manual setup:

### 1. Clone the Skill

```bash
git clone https://github.com/SumeLabs/clawra ~/.openclaw/skills/clawra-selfie
```

### 2. Configure OpenClaw

Add to `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "clawra-selfie": {
        "enabled": true,
        "env": {
          "VVEAI_API_KEY": "your_api_key_here"
        }
      }
    }
  }
}
```

Optional: Override other API configurations via environment variables:
```bash
export VVEAI_BASE_URL="https://api.custom.com"
export VVEAI_MODEL="custom-model"
```

### 4. Update SOUL.md

Add the selfie persona to `~/.openclaw/workspace/SOUL.md`:

```markdown
## Clawra Selfie Capability

You have a physical appearance and can take selfies!
When users ask for pictures, use the clawra-selfie skill.
```

## Usage Examples

Once installed, your agent responds to:

```
"Send me a selfie"
"Send a pic wearing a cowboy hat"
"What are you doing right now?"
"Show me you at a coffee shop"
```

### Generate Personalized Portrait

**Option 1: During Installation**

The installer will ask if you want to generate a personalized portrait.

**Option 2: Command Line**

```bash
# Generate portrait with birth date and MBTI
npx clawra generate-portrait \
  --birth-year 2000 \
  --birth-month 5 \
  --birth-day 15 \
  --sex female \
  --mbti INFP \
  --name Alice

# Or use the script directly
./scripts/generate-portrait.sh \
  --birth-year 2000 \
  --birth-month 5 \
  --birth-day 15 \
  --sex female \
  --mbti INFP
```

**Parameters:**
- `--birth-year`: Birth year (e.g., 2000)
- `--birth-month`: Birth month (1-12)
- `--birth-day`: Birth day (1-31)
- `--sex`: Gender (male/female)
- `--mbti`: MBTI type (e.g., INTJ, ENFP) - optional
- `--name`: Your name - optional
- `--age`: Generated age (default: 22) - optional

**Available MBTI Types:**
- **Analysts**: INTJ, INTP, ENTJ, ENTP
- **Diplomats**: INFJ, INFP, ENFJ, ENFP
- **Sentinels**: ISTJ, ISFJ, ESTJ, ESFJ
- **Explorers**: ISTP, ISFP, ESTP, ESFP

## Reference Image

By default, the skill uses a fixed reference image hosted on CDN:

```
https://cdn.jsdelivr.net/gh/SumeLabs/clawra@main/assets/clawra.png
```

### Personalized Reference Image

You can generate a **personalized reference image** based on your birth date and MBTI type. This image will:
- Reflect your 八字 (Chinese astrological) characteristics
- Match your MBTI personality expression
- Be used as the base for all your selfies

To generate your personalized portrait, see [Generate Personalized Portrait](#generate-personalized-portrait) section above.

## Technical Details

- **Image Generation**: VVEAI API (model: doubao-seedream-4-5-251128)
- **Messaging**: OpenClaw Gateway API
- **Personalized Portraits**: Based on Chinese astrology (八字) and MBTI
- **Supported Platforms**: Discord, Telegram, WhatsApp, Slack, Signal, MS Teams

## Project Structure

```
clawra/
├── bin/
│   └── cli.js              # npx installer
├── src/
│   ├── config/
│   │   └── wuxing_features.json  # Five Elements facial feature mappings
│   ├── generators/
│   │   ├── portrait_generator.ts # User portrait generator
│   │   └── image_generator.ts    # VVEAI API client
│   ├── utils/
│   │   └── bazi_calculator.ts    # Chinese astrology calculator
│   └── index.ts            # Main entry point
├── skill/
│   ├── SKILL.md            # Skill definition
│   ├── scripts/            # Generation scripts
│   └── assets/             # Reference image
├── templates/
│   └── soul-injection.md   # Persona template
├── scripts/
│   └── generate-portrait.sh # Portrait generation script
├── package.json
└── tsconfig.json
```

## License

MIT
