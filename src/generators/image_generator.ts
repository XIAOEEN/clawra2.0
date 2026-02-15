/**
 * 图像生成器
 * 调用 VVEAI API 生成参考图片
 */

const fetch = require('node-fetch');

interface ImageGenerationOptions {
  prompt: string;
  size?: string;  // 1024x1024, 1024x576, 576x1024, etc.
  n?: number;     // 生成图片数量
}

interface GeneratedImage {
  url: string;
  revised_prompt?: string;
}

interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  error?: string;
}

// API 配置
const getApiConfig = () => {
  const apiKey = process.env.VVEAI_API_KEY;
  if (!apiKey) {
    throw new Error('VVEAI_API_KEY environment variable not set');
  }
  return {
    apiKey,
    baseUrl: process.env.VVEAI_BASE_URL || 'https://api.vveai.com',
    model: process.env.VVEAI_MODEL || 'doubao-seedream-4-5-251128'
  };
};

/**
 * 生成图像
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  try {
    const config = getApiConfig();
    const response = await fetch(`${config.baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        prompt: options.prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        images: [],
        error: `API request failed: ${errorText}`
      };
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      images: data.data?.map((item: any) => ({
        url: item.url,
        revised_prompt: item.revised_prompt
      })) || []
    };
  } catch (error) {
    return {
      success: false,
      images: [],
      error: `Image generation failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * 生成用户参考图片
 */
export async function generateUserPortrait(
  prompt: string,
  size: string = '1024x1024'
): Promise<string | null> {
  const result = await generateImage({
    prompt,
    size,
    n: 1
  });
  
  if (result.success && result.images.length > 0) {
    return result.images[0].url;
  }
  
  console.error('Failed to generate portrait:', result.error);
  return null;
}

export type { ImageGenerationOptions, GeneratedImage, ImageGenerationResult };

