/**
 * BOSS 模型
 * 对应 Flutter 端的 Boss + BossDamageEntry
 */

export interface Boss {
  id: number;
  familyId: number;
  name: string;
  emoji: string;
  maxHp: number;
  currentHp: number;
  weekStart: string;
  status: BossStatus;
  story?: string;
  attackRatio: number;
  killRewardCoins: number;
  endTime?: string;
  repeatable: boolean;
  respawnHours: number;
  attackLimitPerDay: number;
  createdAt?: string;
  level?: number;
  levelId?: number;
  difficulty?: string;
  levelColor?: string;
  rewardItems?: string;
  gachaTier: number; // 1-4
}

export interface BossDamageEntry {
  userId: number;
  nickname: string;
  avatar?: string;
  totalDamage: number;
  hitCount: number;
  rankTier?: string;
}

export type BossStatus = 'draft' | 'active' | 'defeated' | 'expired';

// ==================== 解析函数 ====================

export function parseBoss(data: Record<string, unknown>): Boss {
  return {
    id: data.id as number,
    familyId: (data.family_id ?? data.familyId ?? 0) as number,
    name: (data.name as string) || '神秘BOSS',
    emoji: (data.emoji as string) || '🐉',
    maxHp: (data.max_hp ?? data.maxHp ?? 1000) as number,
    currentHp: (data.current_hp ?? data.currentHp ?? 1000) as number,
    weekStart: (data.week_start ?? data.weekStart ?? '') as string,
    status: ((data.status as BossStatus) || 'active') as BossStatus,
    story: data.story as string | undefined,
    attackRatio: ((data.attack_ratio ?? data.attackRatio) as number) ?? 1.0,
    killRewardCoins: (data.kill_reward_coins ?? 100) as number,
    endTime: data.end_time as string | undefined,
    repeatable: ((data.repeatable ?? 0) as number) === 1,
    respawnHours: (data.respawn_hours ?? 0) as number,
    attackLimitPerDay: (data.attack_limit_per_day ?? 0) as number,
    createdAt: data.created_at as string | undefined,
    level: data.level as number | undefined,
    levelId: data.level_id as number | undefined,
    difficulty: (data.difficulty ?? data.level_name) as string | undefined,
    levelColor: data.level_color as string | undefined,
    rewardItems: data.reward_items as string | undefined,
    gachaTier: (data.gacha_tier as number) ?? 1,
  };
}

export function parseBossDamageEntry(data: Record<string, unknown>): BossDamageEntry {
  return {
    userId: (data.user_id ?? data.userId ?? 0) as number,
    nickname: (data.nickname as string) || '未知',
    avatar: data.avatar as string | undefined,
    totalDamage: (data.total_damage ?? data.totalDamage ?? 0) as number,
    hitCount: (data.hit_count ?? data.hitCount ?? 0) as number,
    rankTier: (data.rank_tier ?? data.rankTier) as string | undefined,
  };
}

// ==================== 辅助计算 ====================

/** 血量百分比 0.0-1.0 */
export function getHpPercent(boss: Boss): number {
  return boss.maxHp > 0 ? boss.currentHp / boss.maxHp : 0;
}

/** 已造成的伤害 */
export function getDamageDealt(boss: Boss): number {
  return boss.maxHp - boss.currentHp;
}

/** 是否已被击败 */
export function isDefeated(boss: Boss): boolean {
  return boss.currentHp <= 0;
}

/** 是否为活跃状态 */
export function isActive(boss: Boss): boolean {
  return boss.status === 'active';
}

/** BOSS 难度显示标签（4级：新手~史诗） */
export const BOSS_DIFFICULTY_LABELS: Record<string, string> = {
  '新手': '新手',
  '普通': '普通',
  '困难': '困难',
  '史诗': '史诗',
};

/** 扭蛋档位显示 */
export const GACHA_TIER_LABELS: Record<number, string> = {
  1: '🟤 青铜扭蛋',
  2: '⚪ 白银扭蛋',
  3: '🟡 黄金扭蛋',
  4: '💎 传说扭蛋',
};
