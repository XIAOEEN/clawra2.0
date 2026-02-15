/**
 * VVEAI to OpenClaw Integration
 *
 * Generates images using VVEAI API
 * and sends them to messaging channels via OpenClaw.
 *
 * Usage:
 *   npx ts-node clawra-selfie.ts "<prompt>" "<channel>" ["<caption>"]
 *
 * Environment variables:
 *   VVEAI_API_KEY - Your vveai API key (required)
 *   VVEAI_BASE_URL - API base URL (default: https://api.vveai.com)
 *   VVEAI_MODEL - Model name (default: doubao-seedream-4-5-251128)
 *   OPENCLAW_GATEWAY_URL - OpenClaw gateway URL (default: http://localhost:18789)
 *   OPENCLAW_GATEWAY_TOKEN - Gateway auth token (optional)
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Types
interface GrokImagineInput {
  prompt: string;
  num_images?: number;
  aspect_ratio?: AspectRatio;
  output_format?: OutputFormat;
}

interface GrokImagineImage {
  url: string;
  content_type: string;
  file_name?: string;
  width: number;
  height: number;
}

interface GrokImagineResponse {
  images: GrokImagineImage[];
  revised_prompt?: string;
}

interface OpenClawMessage {
  action: "send";
  channel: string;
  message: string;
  media?: string;
}

type AspectRatio =
  | "2:1"
  | "20:9"
  | "19.5:9"
  | "16:9"
  | "4:3"
  | "3:2"
  | "1:1"
  | "2:3"
  | "3:4"
  | "9:16"
  | "9:19.5"
  | "9:20"
  | "1:2";

type OutputFormat = "jpeg" | "png" | "webp";

interface GenerateAndSendOptions {
  prompt: string;
  channel: string;
  caption?: string;
  aspectRatio?: AspectRatio;
  outputFormat?: OutputFormat;
  useClaudeCodeCLI?: boolean;
}

interface Result {
  success: boolean;
  imageUrl: string;
  channel: string;
  prompt: string;
  revisedPrompt?: string;
}

// API Configuration
const VVEAI_API_KEY = process.env.VVEAI_API_KEY;
const VVEAI_BASE_URL = process.env.VVEAI_BASE_URL || "https://api.vveai.com";
const VVEAI_MODEL = process.env.VVEAI_MODEL || "doubao-seedream-4-5-251128";

if (!VVEAI_API_KEY) {
  throw new Error(
    "VVEAI_API_KEY environment variable not set. Get your API key from your vveai provider."
  );
}

/**
 * Generate image using VVEAI API
 */
async function generateImage(
  input: GrokImagineInput
): Promise<GrokImagineResponse> {
  // Map aspect ratio to size
  const sizeMap: Record<string, string> = {
    "1:1": "1024x1024",
    "16:9": "1024x576",
    "9:16": "576x1024",
    "4:3": "1024x768",
    "3:4": "768x1024",
  };
  const size = sizeMap[input.aspect_ratio || "1:1"] || "1024x1024";

  const response = await fetch(`${VVEAI_BASE_URL}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VVEAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: VVEAI_MODEL,
      prompt: input.prompt,
      n: input.num_images || 1,
      size: size,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image generation failed: ${error}`);
  }

  const data = await response.json();
  
  // Convert OpenAI format to our expected format
  return {
    images: data.data?.map((item: any) => ({
      url: item.url,
      content_type: "image/jpeg",
      width: parseInt(size.split("x")[0]),
      height: parseInt(size.split("x")[1]),
    })) || [],
    revised_prompt: data.data?.[0]?.revised_prompt,
  };
}

/**
 * Send image via OpenClaw
 */
async function sendViaOpenClaw(
  message: OpenClawMessage,
  useCLI: boolean = true
): Promise<void> {
  if (useCLI) {
    // Use OpenClaw CLI
    const cmd = `openclaw message send --action send --channel "${message.channel}" --message "${message.message}" --media "${message.media}"`;
    await execAsync(cmd);
    return;
  }

  // Direct API call
  const gatewayUrl =
    process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (gatewayToken) {
    headers["Authorization"] = `Bearer ${gatewayToken}`;
  }

  const response = await fetch(`${gatewayUrl}/message`, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenClaw send failed: ${error}`);
  }
}

/**
 * Main function: Generate image and send to channel
 */
async function generateAndSend(options: GenerateAndSendOptions): Promise<Result> {
  const {
    prompt,
    channel,
    caption = "Generated with Grok Imagine",
    aspectRatio = "1:1",
    outputFormat = "jpeg",
    useClaudeCodeCLI = true,
  } = options;

  console.log(`[INFO] Generating image with VVEAI API...`);
  console.log(`[INFO] Model: ${VVEAI_MODEL}`);
  console.log(`[INFO] Prompt: ${prompt}`);
  console.log(`[INFO] Aspect ratio: ${aspectRatio}`);

  // Generate image
  const imageResult = await generateImage({
    prompt,
    num_images: 1,
    aspect_ratio: aspectRatio,
    output_format: outputFormat,
  });

  const imageUrl = imageResult.images[0].url;
  console.log(`[INFO] Image generated: ${imageUrl}`);

  if (imageResult.revised_prompt) {
    console.log(`[INFO] Revised prompt: ${imageResult.revised_prompt}`);
  }

  // Send via OpenClaw
  console.log(`[INFO] Sending to channel: ${channel}`);

  await sendViaOpenClaw(
    {
      action: "send",
      channel,
      message: caption,
      media: imageUrl,
    },
    useClaudeCodeCLI
  );

  console.log(`[INFO] Done! Image sent to ${channel}`);

  return {
    success: true,
    imageUrl,
    channel,
    prompt,
    revisedPrompt: imageResult.revised_prompt,
  };
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: npx ts-node grok-imagine-send.ts <prompt> <channel> [caption] [aspect_ratio] [output_format]

Arguments:
  prompt        - Image description (required)
  channel       - Target channel (required) e.g., #general, @user
  caption       - Message caption (default: 'Generated with Grok Imagine')
  aspect_ratio  - Image ratio (default: 1:1) Options: 2:1, 16:9, 4:3, 1:1, 3:4, 9:16
  output_format - Image format (default: jpeg) Options: jpeg, png, webp

Environment:
   VVEAI_API_KEY - Your vveai API key (optional, has default)
   VVEAI_BASE_URL - API base URL (optional, default: https://api.vveai.com)
   VVEAI_MODEL   - Model name (optional, default: doubao-seedream-4-5-251128)

Example:
   npx ts-node clawra-selfie.ts "A cyberpunk city" "#art" "Check this out!"
`);
    process.exit(1);
  }

  const [prompt, channel, caption, aspectRatio, outputFormat] = args;

  try {
    const result = await generateAndSend({
      prompt,
      channel,
      caption,
      aspectRatio: aspectRatio as AspectRatio,
      outputFormat: outputFormat as OutputFormat,
    });

    console.log("\n--- Result ---");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`[ERROR] ${(error as Error).message}`);
    process.exit(1);
  }
}

// Export for module use
export {
  generateImage,
  sendViaOpenClaw,
  generateAndSend,
  GrokImagineInput,
  GrokImagineResponse,
  OpenClawMessage,
  GenerateAndSendOptions,
  Result,
};

// Run if executed directly
if (require.main === module) {
  main();
}
