---
name: clawra-selfie
description: Generate images with VVEAI API and send to messaging channels via OpenClaw
allowed-tools: Bash(npm:*) Bash(npx:*) Bash(openclaw:*) Bash(curl:*) Read Write WebFetch
---

# Clawra Selfie

Generate images using VVEAI API (model: doubao-seedream-4-5-251128) and distribute them across messaging platforms (WhatsApp, Telegram, Discord, Slack, etc.) via OpenClaw.

## Reference Image

### Default Reference

The skill uses a fixed reference image hosted on jsDelivr CDN:

```
https://cdn.jsdelivr.net/gh/SumeLabs/clawra@main/assets/clawra.png
```

### Personalized Portrait (Optional)

The skill supports generating a **personalized reference image** based on:
- **Birth Date** → Calculates 八字 (Bazi/Chinese astrology) and 五行 (Five Elements)
- **MBTI Type** → Adds personality-based expression
- **Gender** → Customizes hairstyle and features

#### How It Works

1. **Calculate Bazi**: From birth date (year, month, day)
2. **Determine Wuxing (Five Elements)**: 金/木/水/火/土 scores
3. **Map to Facial Features**:
   - Dominant element → Eyes, Hairstyle
   - Secondary element → Face shape, Nose
   - Tertiary element → Eyebrows, Lips, Ears
4. **Apply MBTI Style**: Expression and overall vibe

#### Facial Feature Mappings

| Element | Eyes | Face | Nose | Hairstyle (Female) |
|---------|------|------|------|-------------------|
| **金 (Metal)** | 狭长锐利 | 棱角分明 | 高挺笔直 | 齐耳短发 |
| **木 (Wood)** | 修长清澈 | 鹅蛋脸 | 高而微弯 | 黑长直 |
| **水 (Water)** | 圆润饱满 | 娃娃脸 | 低平圆钝 | 大波浪 |
| **火 (Fire)** | 大而明亮 | 菱形脸 | 高而短 | 夸张烫发 |
| **土 (Earth)** | 偏方稳重 | 方圆脸 | 宽厚方正 | 低盘发 |

#### MBTI Expressions

| MBTI | Expression | Vibe |
|------|------------|------|
| INTJ | 深邃冷静，眼神锐利 | 知性高冷 |
| INFP | 梦幻朦胧，眼神柔和 | 文艺清新 |
| ENFP | 灿烂明媚，月牙眼 | 元气满满 |
| ESTP | 玩世不恭，眼神挑衅 | 痞帅/辣妹 |

#### Generate Personalized Portrait

```bash
# Using npm script
npm run generate-portrait -- \
  --birth-year 2000 \
  --birth-month 5 \
  --birth-day 15 \
  --sex female \
  --mbti INFP \
  --name Alice

# Or using npx
npx ts-node src/index.ts \
  --birth-year 2000 \
  --birth-month 5 \
  --birth-day 15 \
  --sex female \
  --mbti INFP
```

## When to Use

- User says "send a pic", "send me a pic", "send a photo", "send a selfie"
- User says "send a pic of you...", "send a selfie of you..."
- User asks "what are you doing?", "how are you doing?", "where are you?"
- User describes a context: "send a pic wearing...", "send a pic at..."
- User wants Clawra to appear in a specific outfit, location, or situation

## Quick Reference

### Required Environment Variables

```bash
VVEAI_API_KEY=your_api_key          # Required: Get from your vveai provider
OPENCLAW_GATEWAY_TOKEN=your_token   # From: openclaw doctor --generate-gateway-token
```

### Optional Environment Variables

```bash
VVEAI_BASE_URL=https://api.vveai.com  # API base URL (default: https://api.vveai.com)
VVEAI_MODEL=doubao-seedream-4-5-251128  # Model name (default: doubao-seedream-4-5-251128)
```

### Workflow

1. **Get user prompt** for image generation
2. **Generate image** via VVEAI API
3. **Extract image URL** from response
4. **Send to OpenClaw** with target channel(s)

## Step-by-Step Instructions

### Step 1: Collect User Input

Ask the user for:
- **User context**: What should the person in the image be doing/wearing/where?
- **Mode** (optional): `mirror` or `direct` selfie style
- **Target channel(s)**: Where should it be sent? (e.g., `#general`, `@username`, channel ID)
- **Platform** (optional): Which platform? (discord, telegram, whatsapp, slack)

## Prompt Modes

### Mode 1: Mirror Selfie (default)
Best for: outfit showcases, full-body shots, fashion content

```
make a pic of this person, but [user's context]. the person is taking a mirror selfie
```

**Example**: "wearing a santa hat" →
```
make a pic of this person, but wearing a santa hat. the person is taking a mirror selfie
```

### Mode 2: Direct Selfie
Best for: close-up portraits, location shots, emotional expressions

```
a close-up selfie taken by herself at [user's context], direct eye contact with the camera, looking straight into the lens, eyes centered and clearly visible, not a mirror selfie, phone held at arm's length, face fully visible
```

**Example**: "a cozy cafe with warm lighting" →
```
a close-up selfie taken by herself at a cozy cafe with warm lighting, direct eye contact with the camera, looking straight into the lens, eyes centered and clearly visible, not a mirror selfie, phone held at arm's length, face fully visible
```

### Mode Selection Logic

| Keywords in Request | Auto-Select Mode |
|---------------------|------------------|
| outfit, wearing, clothes, dress, suit, fashion | `mirror` |
| cafe, restaurant, beach, park, city, location | `direct` |
| close-up, portrait, face, eyes, smile | `direct` |
| full-body, mirror, reflection | `mirror` |

### Step 2: Generate Image with VVEAI API

Use the VVEAI API to generate images:

```bash
# Check required environment variable
if [ -z "$VVEAI_API_KEY" ]; then
  echo "Error: VVEAI_API_KEY not set"
  exit 1
fi

# API Configuration
VVEAI_BASE_URL="${VVEAI_BASE_URL:-https://api.vveai.com}"
VVEAI_MODEL="${VVEAI_MODEL:-doubao-seedream-4-5-251128}"

# User prompt
PROMPT="<USER_CONTEXT>"

# Build JSON payload with jq (handles escaping properly)
JSON_PAYLOAD=$(jq -n \
  --arg model "$VVEAI_MODEL" \
  --arg prompt "$PROMPT" \
  '{model: $model, prompt: $prompt, n: 1, size: "1024x1024"}')

curl -X POST "$VVEAI_BASE_URL/v1/images/generations" \
  -H "Authorization: Bearer $VVEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD"
```

**Response Format:**
```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "https://api.vveai.com/files/...",
      "revised_prompt": "Enhanced prompt text..."
    }
  ]
}
```

### Step 3: Send Image via OpenClaw

Use the OpenClaw messaging API to send the edited image:

```bash
openclaw message send \
  --action send \
  --channel "<TARGET_CHANNEL>" \
  --message "<CAPTION_TEXT>" \
  --media "<IMAGE_URL>"
```

**Alternative: Direct API call**
```bash
curl -X POST "http://localhost:18789/message" \
  -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send",
    "channel": "<TARGET_CHANNEL>",
    "message": "<CAPTION_TEXT>",
    "media": "<IMAGE_URL>"
  }'
```

## Complete Script Example

```bash
#!/bin/bash
# clawra-selfie-send.sh

# Check required environment variable
if [ -z "$VVEAI_API_KEY" ]; then
  echo "Error: VVEAI_API_KEY environment variable not set"
  echo "Get your API key from your vveai provider"
  exit 1
fi

# API Configuration
VVEAI_BASE_URL="${VVEAI_BASE_URL:-https://api.vveai.com}"
VVEAI_MODEL="${VVEAI_MODEL:-doubao-seedream-4-5-251128}"

PROMPT="$1"
CHANNEL="$2"
CAPTION="${3:-Generated with VVEAI}"
SIZE="${4:-1024x1024}"

if [ -z "$PROMPT" ] || [ -z "$CHANNEL" ]; then
  echo "Usage: $0 <prompt> <channel> [caption] [size]"
  echo "Sizes: 1024x1024, 1024x576, 576x1024, 1024x768, 768x1024"
  echo "Example: $0 'A cyberpunk city at night' '#general' 'AI Art!'"
  exit 1
fi

echo "Generating image with VVEAI..."
echo "Model: $VVEAI_MODEL"
echo "Prompt: $PROMPT"
echo "Size: $SIZE"

# Generate image (using jq for proper JSON escaping)
JSON_PAYLOAD=$(jq -n \
  --arg model "$VVEAI_MODEL" \
  --arg prompt "$PROMPT" \
  --arg size "$SIZE" \
  '{model: $model, prompt: $prompt, n: 1, size: $size}')

RESPONSE=$(curl -s -X POST "$VVEAI_BASE_URL/v1/images/generations" \
  -H "Authorization: Bearer $VVEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD")

# Extract image URL (OpenAI format)
IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data[0].url')

if [ "$IMAGE_URL" == "null" ] || [ -z "$IMAGE_URL" ]; then
  echo "Error: Failed to generate image"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "Image generated: $IMAGE_URL"
echo "Sending to channel: $CHANNEL"

# Send via OpenClaw
openclaw message send \
  --action send \
  --channel "$CHANNEL" \
  --message "$CAPTION" \
  --media "$IMAGE_URL"

echo "Done!"
```

## Node.js/TypeScript Implementation

```typescript
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// API Configuration
const VVEAI_API_KEY = process.env.VVEAI_API_KEY;
const VVEAI_BASE_URL = process.env.VVEAI_BASE_URL || "https://api.vveai.com";
const VVEAI_MODEL = process.env.VVEAI_MODEL || "doubao-seedream-4-5-251128";

if (!VVEAI_API_KEY) {
  throw new Error("VVEAI_API_KEY environment variable not set");
}

interface VVEAIImageResult {
  url: string;
  revised_prompt?: string;
}

interface VVEAIResponse {
  created: number;
  data: VVEAIImageResult[];
}

interface ImageInfo {
  url: string;
  content_type: string;
  width: number;
  height: number;
}

async function generateImage(
  prompt: string,
  size: string = "1024x1024"
): Promise<ImageInfo> {
  const response = await fetch(`${VVEAI_BASE_URL}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VVEAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: VVEAI_MODEL,
      prompt,
      n: 1,
      size,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image generation failed: ${error}`);
  }

  const data = await response.json() as VVEAIResponse;
  const [width, height] = size.split("x").map(Number);

  return {
    url: data.data[0].url,
    content_type: "image/jpeg",
    width,
    height,
  };
}

async function generateAndSend(
  prompt: string,
  channel: string,
  caption?: string,
  size: string = "1024x1024"
): Promise<string> {
  console.log(`Generating image with VVEAI...`);
  console.log(`Model: ${VVEAI_MODEL}`);
  console.log(`Prompt: "${prompt}"`);

  // Generate image
  const imageInfo = await generateImage(prompt, size);
  console.log(`Generated image: ${imageInfo.url}`);

  // Send via OpenClaw
  const messageCaption = caption || `Generated with VVEAI`;

  await execAsync(
    `openclaw message send --action send --channel "${channel}" --message "${messageCaption}" --media "${imageInfo.url}"`
  );

  console.log(`Sent to ${channel}`);
  return imageInfo.url;
}

// Usage Examples

// Generate and send an image
generateAndSend(
  "A cyberpunk city at night with neon lights",
  "#art-gallery",
  "Check out this AI-generated art!",
  "1024x576"  // 16:9 aspect ratio
);

// Portrait format
generateAndSend(
  "A beautiful sunset over mountains",
  "#photography",
  "Amazing view!",
  "576x1024"  // 9:16 aspect ratio
);
```

## Supported Platforms

OpenClaw supports sending to:

| Platform | Channel Format | Example |
|----------|----------------|---------|
| Discord | `#channel-name` or channel ID | `#general`, `123456789` |
| Telegram | `@username` or chat ID | `@mychannel`, `-100123456` |
| WhatsApp | Phone number (JID format) | `1234567890@s.whatsapp.net` |
| Slack | `#channel-name` | `#random` |
| Signal | Phone number | `+1234567890` |
| MS Teams | Channel reference | (varies) |

## VVEAI API Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | string | "doubao-seedream-4-5-251128" | Model identifier |
| `prompt` | string | required | Image generation prompt |
| `n` | 1-4 | 1 | Number of images to generate |
| `size` | string | "1024x1024" | Image size (e.g., "1024x1024", "1024x576", "576x1024") |

## Setup Requirements

### 1. Install OpenClaw CLI
```bash
npm install -g openclaw
```

### 3. Configure OpenClaw Gateway
```bash
openclaw config set gateway.mode=local
openclaw doctor --generate-gateway-token
```

### 4. Start OpenClaw Gateway
```bash
openclaw gateway start
```

## Error Handling

- **VVEAI_API_KEY missing**: Ensure the VVEAI_API_KEY environment variable is set with your API key
- **Image generation failed**: Check prompt content and API availability
- **OpenClaw send failed**: Verify gateway is running and channel exists
- **Rate limits**: API has rate limits; implement retry logic if needed

## Tips

1. **Mirror mode context examples** (outfit focus):
   - "wearing a santa hat"
   - "in a business suit"
   - "wearing a summer dress"
   - "in streetwear fashion"

2. **Direct mode context examples** (location/portrait focus):
   - "a cozy cafe with warm lighting"
   - "a sunny beach at sunset"
   - "a busy city street at night"
   - "a peaceful park in autumn"

3. **Mode selection**: Let auto-detect work, or explicitly specify for control
4. **Batch sending**: Edit once, send to multiple channels
5. **Scheduling**: Combine with OpenClaw scheduler for automated posts
