/**
 * Clawra 用户画像生成器
 * 主入口文件
 */

import { PortraitGenerator, UserProfile, GenerationConfig } from './generators/portrait_generator';
import { generateUserPortrait } from './generators/image_generator';
import * as fs from 'fs';
import * as path from 'path';

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  description?: string;
  userSummary?: object;
  error?: string;
}

/**
 * 生成用户画像和参考图片
 */
export async function createUserPortrait(
  userProfile: UserProfile,
  config: GenerationConfig = {}
): Promise<GenerationResult> {
  try {
    // 创建生成器
    const generator = new PortraitGenerator(userProfile);
    
    // 生成图像提示词
    const prompt = generator.generateImagePrompt(config);
    
    console.log('Generated prompt:');
    console.log(prompt);
    console.log('\nGenerating image...');
    
    // 生成图像
    const imageUrl = await generateUserPortrait(prompt, '1024x1024');
    
    if (!imageUrl) {
      return {
        success: false,
        error: 'Failed to generate image'
      };
    }
    
    // 保存用户信息到本地
    const userData = {
      profile: userProfile,
      summary: generator.getUserSummary(),
      prompt,
      imageUrl,
      generatedAt: new Date().toISOString()
    };
    
    // 确保数据目录存在
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 保存用户数据
    const filename = `user_${userProfile.name || 'anonymous'}_${Date.now()}.json`;
    fs.writeFileSync(
      path.join(dataDir, filename),
      JSON.stringify(userData, null, 2)
    );
    
    return {
      success: true,
      imageUrl,
      description: generator.generateDescription(),
      userSummary: generator.getUserSummary()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 从命令行参数创建用户画像
 */
export async function createPortraitFromCLI(args: string[]): Promise<void> {
  // 解析参数
  const params: Record<string, string> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1] || '';
      if (!value.startsWith('--')) {
        params[key] = value;
        i++;
      }
    }
  }
  
  // 验证必需参数
  if (!params['birth-year'] || !params['birth-month'] || !params['birth-day']) {
    console.log(`
Usage: npx ts-node src/index.ts [options]

Options:
  --birth-year    出生年份 (e.g., 2000)
  --birth-month   出生月份 (1-12)
  --birth-day     出生日期 (1-31)
  --sex           性别 (male/female)
  --mbti          MBTI类型 (e.g., INTJ, ENFP)
  --name          用户名称 (可选)
  --age           生成年龄 (默认22)

Example:
  npx ts-node src/index.ts --birth-year 2000 --birth-month 5 --birth-day 15 --sex female --mbti INFP --name Alice
`);
    process.exit(1);
  }
  
  // 构建用户档案
  const userProfile: UserProfile = {
    birthDate: {
      year: parseInt(params['birth-year']),
      month: parseInt(params['birth-month']),
      day: parseInt(params['birth-day'])
    },
    sex: (params['sex'] as 'male' | 'female') || 'female',
    mbti: params['mbti']?.toUpperCase(),
    name: params['name']
  };
  
  // 生成配置
  const config: GenerationConfig = {
    age: parseInt(params['age'] || '22'),
    includeMbti: true
  };
  
  console.log('Creating portrait for:');
  console.log(`  Name: ${userProfile.name || 'Anonymous'}`);
  console.log(`  Birth: ${userProfile.birthDate.year}-${userProfile.birthDate.month}-${userProfile.birthDate.day}`);
  console.log(`  Sex: ${userProfile.sex}`);
  console.log(`  MBTI: ${userProfile.mbti || 'Not specified'}`);
  console.log('');
  
  // 生成画像
  const result = await createUserPortrait(userProfile, config);
  
  if (result.success) {
    console.log('\n✓ Portrait generated successfully!');
    console.log(`\nImage URL: ${result.imageUrl}`);
    console.log('\nDescription:');
    console.log(result.description);
    console.log('\nUser Summary:');
    console.log(JSON.stringify(result.userSummary, null, 2));
  } else {
    console.error('\n✗ Failed to generate portrait:', result.error);
    process.exit(1);
  }
}

// CLI 入口
if (require.main === module) {
  createPortraitFromCLI(process.argv.slice(2));
}

export { PortraitGenerator, UserProfile, GenerationConfig };
export * from './generators/portrait_generator';
export * from './generators/image_generator';
export * from './utils/bazi_calculator';

