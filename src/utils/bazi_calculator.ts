/**
 * 八字计算工具 - 简化版
 * 根据出生年月日计算五行属性
 */

interface BirthDate {
  year: number;
  month: number;
  day: number;
}

interface WuxingScore {
  jin: number;  // 金
  mu: number;   // 木
  shui: number; // 水
  huo: number;  // 火
  tu: number;   // 土
}

// 天干五行映射
const tianganWuxing: Record<string, string> = {
  '甲': 'mu', '乙': 'mu',
  '丙': 'huo', '丁': 'huo',
  '戊': 'tu', '己': 'tu',
  '庚': 'jin', '辛': 'jin',
  '壬': 'shui', '癸': 'shui'
};

// 地支五行映射
const dizhiWuxing: Record<string, string> = {
  '子': 'shui', '丑': 'tu', '寅': 'mu', '卯': 'mu',
  '辰': 'tu', '巳': 'huo', '午': 'huo', '未': 'tu',
  '申': 'jin', '酉': 'jin', '戌': 'tu', '亥': 'shui'
};

// 天干数组
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支数组
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 计算年柱 (Year Pillar)
 */
function getYearPillar(year: number): [string, string] {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return [tianGan[ganIndex], diZhi[zhiIndex]];
}

/**
 * 计算月柱 (Month Pillar) - 简化版
 */
function getMonthPillar(year: number, month: number): [string, string] {
  const yearGanIndex = (year - 4) % 10;
  const monthGanIndex = (yearGanIndex * 2 + month + 1) % 10;
  const monthZhiIndex = (month + 1) % 12;
  return [tianGan[monthGanIndex], diZhi[monthZhiIndex]];
}

/**
 * 计算日柱 (Day Pillar) - 使用简化公式
 */
function getDayPillar(year: number, month: number, day: number): [string, string] {
  // 简化计算，实际应该用万年历
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const ganIndex = (diffDays + 10) % 10;
  const zhiIndex = (diffDays + 12) % 12;
  return [tianGan[ganIndex], diZhi[zhiIndex]];
}

/**
 * 计算五行分数
 */
export function calculateWuxing(birthDate: BirthDate): WuxingScore {
  const [yearGan, yearZhi] = getYearPillar(birthDate.year);
  const [monthGan, monthZhi] = getMonthPillar(birthDate.year, birthDate.month);
  const [dayGan, dayZhi] = getDayPillar(birthDate.year, birthDate.month, birthDate.day);
  
  const score: WuxingScore = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 };
  
  // 统计天干地支的五行
  const elements = [
    tianganWuxing[yearGan], tianganWuxing[monthGan], tianganWuxing[dayGan],
    dizhiWuxing[yearZhi], dizhiWuxing[monthZhi], dizhiWuxing[dayZhi]
  ];
  
  // 日柱天干权重最高（日元），年柱次之
  const weights = [1.5, 1.0, 2.0, 1.0, 0.8, 0.8];
  
  elements.forEach((element, index) => {
    if (element) {
      score[element as keyof WuxingScore] += weights[index];
    }
  });
  
  // 添加一些基于生日的随机偏移（使结果更有变化）
  const daySum = birthDate.year + birthDate.month + birthDate.day;
  const offsets = [
    Math.sin(daySum) * 0.5,
    Math.cos(daySum) * 0.5,
    Math.sin(daySum * 2) * 0.5,
    Math.cos(daySum * 2) * 0.5,
    Math.sin(daySum * 3) * 0.5
  ];
  
  const keys: (keyof WuxingScore)[] = ['jin', 'mu', 'shui', 'huo', 'tu'];
  keys.forEach((key, index) => {
    score[key] = Math.max(0.5, score[key] + offsets[index]);
  });
  
  return score;
}

/**
 * 获取五行喜忌（最旺和最弱的）
 * 返回三个元素：喜用神[0], 次喜[1], 喜用[2]
 */
export function getWuxingXiji(score: WuxingScore): [string, string, string] {
  const entries = Object.entries(score).sort((a, b) => b[1] - a[1]);
  return [entries[0][0], entries[1][0], entries[2][0]];
}

/**
 * 计算八字字符串
 */
export function calculateBazi(birthDate: BirthDate): string {
  const [yearGan, yearZhi] = getYearPillar(birthDate.year);
  const [monthGan, monthZhi] = getMonthPillar(birthDate.year, birthDate.month);
  const [dayGan, dayZhi] = getDayPillar(birthDate.year, birthDate.month, birthDate.day);
  
  return `${yearGan}${yearZhi} ${monthGan}${monthZhi} ${dayGan}${dayZhi}`;
}

export type { BirthDate, WuxingScore };

