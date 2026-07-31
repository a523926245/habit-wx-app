/**
 * 游戏配置常量
 * 段位、连击加成、任务难度、表情选项等
 */

/** 段位配置 */
export const RANK_TIERS = [
  { name: "青铜", icon: "🥉", minScore: 0 },
  { name: "白银", icon: "🥈", minScore: 100 },
  { name: "黄金", icon: "🥇", minScore: 300 },
  { name: "钻石", icon: "💎", minScore: 600 },
  { name: "传说", icon: "👑", minScore: 1000 },
] as const;

/** 段位英文→中文映射 */
export const RANK_TIER_LABELS: Record<string, string> = {
  bronze: "🥉 青铜",
  silver: "🥈 白银",
  gold: "🥇 黄金",
  diamond: "💎 钻石",
  legendary: "👑 传说",
};

/** 获取段位中文名称 */
export function getRankTierLabel(tier?: string | Record<string, unknown>): string {
  if (!tier) return "🥉 青铜";
  // 如果是对象（后端返回完整段位信息），提取 tier_id 或 name 属性
  if (typeof tier === 'object' && tier !== null) {
    const tierId = tier.tier_id as string;
    const name = tier.name as string;
    if (tierId && RANK_TIER_LABELS[tierId]) {
      return RANK_TIER_LABELS[tierId];
    }
    if (name) {
      return `${tier.emoji || "🥉"} ${name}`;
    }
    return "🥉 青铜";
  }
  return RANK_TIER_LABELS[tier] || "🥉 青铜";
}

/** 连击加成配置（默认） */
export const COMBO_BONUSES = [
  { days: 3, multiplier: 1.1, title: "初露锋芒 ✨" },
  { days: 7, multiplier: 1.2, title: "小有成就 ⚡" },
  { days: 14, multiplier: 1.25, title: "坚持不懈 🔥" },
  { days: 21, multiplier: 1.3, title: "连击大师 💪" },
] as const;

/** 任务难度配置 */
export const DIFFICULTY_CONFIG = {
  1: { label: "简单", coinReward: 5, bossDamage: 4 },
  2: { label: "普通", coinReward: 10, bossDamage: 8 },
  3: { label: "中等", coinReward: 15, bossDamage: 12 },
  4: { label: "困难", coinReward: 25, bossDamage: 20 },
  5: { label: "史诗", coinReward: 40, bossDamage: 30 },
} as const;

/** 表情图标选项（任务卡片可用） */
export const EMOJI_OPTIONS = [
  "⭐",
  "📚",
  "🧹",
  "🦷",
  "🏃",
  "🥗",
  "💤",
  "✍️",
  "🎨",
  "🎵",
  "🧘",
  "💪",
  "🚿",
  "🌱",
  "🔤",
] as const;

/** 任务类型标签 */
export const CARD_TYPE_LABELS: Record<string, string> = {
  daily: "每日",
  weekly: "每周",
  monthly: "每月",
};
