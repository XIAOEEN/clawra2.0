# Clawra 2.0 🎭

<p align="center">
  <strong>English</strong> | <a href="#中文介绍">中文</a>
</p>

---

## English

Clawra 2.0 is an AI-powered selfie generation skill for OpenClaw agents. It creates personalized portraits based on Chinese astrology (Bazi) and MBTI personality types, enabling your AI agent to have a unique visual identity.

### ✨ Features

- **🎨 Personalized Portrait Generation**: Creates unique reference images based on birth date and MBTI
- **🔮 Chinese Astrology Integration**: Calculates Bazi (八字) and Five Elements (五行) to determine facial features
- **🧠 MBTI Personality Mapping**: 16 personality types influence expression and vibe
- **📸 Smart Selfie Modes**: Mirror selfies for outfits, direct selfies for portraits
- **💬 Multi-Platform Messaging**: Send selfies to Discord, Telegram, WhatsApp, Slack, etc.

### 🚀 Quick Start

```bash
npx clawra2.0@latest
```

### 🎭 Generate Your Personalized Portrait

```bash
# Using npx
npx clawra2.0 generate-portrait \
  --birth-year 2000 \
  --birth-month 5 \
  --birth-day 15 \
  --sex female \
  --mbti INFP \
  --name Alice

# Or npm script
npm run generate-portrait -- \
  --birth-year 2000 \
  --birth-month 5 \
  --birth-day 15 \
  --sex female \
  --mbti INFP
```

### 📋 How It Works

1. **Birth Date** → Calculates Bazi (八字) and determines Five Elements distribution
2. **Five Elements Mapping** → Maps elements to facial features:
   - Dominant element → Eyes, Hairstyle
   - Secondary element → Face shape, Nose
   - Tertiary element → Eyebrows, Lips, Ears
3. **MBTI Influence** → Adds personality-based expression and vibe
4. **AI Generation** → Creates unique portrait using VVEAI API

### 🎯 Five Elements Facial Features

| Element | Eyes | Face Shape | Nose | Hairstyle (Female) |
|---------|------|------------|------|-------------------|
| **Metal (金)** | Sharp, narrow | Angular, defined | High, straight | Short, chic |
| **Wood (木)** | Long, clear | Oval, graceful | High, curved | Long, straight |
| **Water (水)** | Round, full | Round, youthful | Low, rounded | Waves, long |
| **Fire (火)** | Big, bright | Diamond-shaped | High, short | Bold, curly |
| **Earth (土)** | Square, steady | Square, reliable | Wide, flat | Bun, ponytail |

### 🔧 Configuration

```bash
# Required
export VVEAI_API_KEY="your-api-key"

# Optional
export VVEAI_BASE_URL="https://api.vveai.com"
export VVEAI_MODEL="doubao-seedream-4-5-251128"
```

---

<p align="center">
  <a href="#english">English</a> | <strong>中文</strong>
</p>

---

## 中文介绍

Clawra 2.0 是一个为 OpenClaw AI 代理设计的智能自拍生成技能。它基于中国八字命理和 MBTI 人格类型创建个性化画像，让你的 AI 助手拥有独特的视觉形象。

### ✨ 功能特性

- **🎨 个性化画像生成**: 根据出生日期和 MBTI 生成独特的参考图片
- **🔮 八字命理融合**: 计算八字和五行来决定面部特征
- **🧠 MBTI 人格映射**: 16种人格类型影响表情和气质
- **📸 智能自拍模式**: 镜子自拍展示穿搭，直拍模式展示肖像
- **💬 多平台消息**: 发送自拍照到 Discord、Telegram、WhatsApp、Slack 等平台

### 🚀 快速开始

```bash
npx clawra2.0@latest
```

### 🎭 生成你的个性化画像

```bash
# 使用 npx
npx clawra2.0 generate-portrait \
  --birth-year 2000 \
  --birth-month 5 \
  --birth-day 15 \
  --sex female \
  --mbti INFP \
  --name 爱丽丝

# 或使用 npm 脚本
npm run generate-portrait -- \
  --birth-year 2000 \
  --birth-month 5 \
  --birth-day 15 \
  --sex female \
  --mbti INFP
```

### 📋 工作原理

1. **出生日期** → 计算八字，确定五行分布
2. **五行映射** → 将五行映射到面部特征：
   - 主元素 → 眼睛、发型
   - 次元素 → 脸型、鼻子
   - 第三元素 → 眉毛、嘴唇、耳朵
3. **MBTI 影响** → 添加基于人格类型的表情和气质
4. **AI 生成** → 使用 VVEAI API 创建独特画像

### 🎯 五行面部特征对照表

| 五行 | 眼睛 | 脸型 | 鼻子 | 发型（女） |
|------|------|------|------|-----------|
| **金** | 狭长锐利 | 棱角分明 | 高挺笔直 | 齐耳短发 |
| **木** | 修长清澈 | 鹅蛋脸 | 高而微弯 | 黑长直 |
| **水** | 圆润饱满 | 娃娃脸 | 低平圆钝 | 大波浪 |
| **火** | 大而明亮 | 菱形脸 | 高而短 | 夸张烫发 |
| **土** | 偏方稳重 | 方圆脸 | 宽厚方正 | 低盘发 |

### 🧬 MBTI 气质对照

| MBTI 类型 | 表情特征 | 整体气质 |
|-----------|----------|----------|
| INTJ | 深邃冷静，眼神锐利 | 知性高冷，神秘感 |
| INFP | 梦幻朦胧，眼神柔和 | 文艺清新，诗意感 |
| ENFP | 灿烂明媚，月牙眼 | 元气满满，快乐小狗 |
| ESTP | 玩世不恭，眼神挑衅 | 痞帅/辣妹，野性美 |
| ISTJ | 稳重内敛，眼神务实 | 可靠踏实，禁欲系 |
| ESFJ | 热情友好，眼神温暖 | 社交达人，亲和力强 |

### 🔧 配置说明

```bash
# 必需
export VVEAI_API_KEY="你的API密钥"

# 可选
export VVEAI_BASE_URL="https://api.vveai.com"
export VVEAI_MODEL="doubao-seedream-4-5-251128"
```

### 📁 项目结构

```
clawra/
├── bin/
│   └── cli.js              # CLI 安装器
├── src/
│   ├── config/
│   │   └── wuxing_features.json  # 五行特征映射
│   ├── generators/
│   │   ├── portrait_generator.ts # 画像生成器
│   │   └── image_generator.ts    # VVEAI API 客户端
│   ├── utils/
│   │   └── bazi_calculator.ts    # 八字计算器
│   └── index.ts            # 主入口
├── skill/                  # OpenClaw 技能
├── scripts/                # 辅助脚本
├── README.md
└── package.json
```

### 💡 使用示例

安装完成后，你的 AI 代理可以响应：

```
"给我发自拍"
"Send me a selfie"
"穿牛仔帽拍一张"
"你现在在做什么？"
"展示你在咖啡店的样子"
```

### 🔑 API 配置

默认使用 VVEAI API：
- **基础URL**: `https://api.vveai.com`
- **模型**: `doubao-seedream-4-5-251128`

需要在环境变量中设置 `VVEAI_API_KEY`。

---

## License / 许可证

MIT © [XIAOEEN](https://github.com/XIAOEEN)

---

<p align="center">
  Made with ❤️ and ☯️
</p>
</content>
