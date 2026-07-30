/**
 * 排行榜模型
 * 对应 Flutter 端的 RankTier, LeaderboardEntry
 */

import type { Tier } from './shop';

/** 排行榜维度 */
export type RankDimension = 'score' | 'coins';

/** 排行榜类型 */
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  nickname: string;
  avatar?: string;
  role: string;
  rankScore: number;
  coins: number;
  rankTier: Tier;
  familyName?: string;
}

/** 段位配置 */
export interface RankTierConfig {
  id: number;
  familyId: number | null;
  name: string;
  icon: string;
  minScore: number;
  isActive: boolean;
  createdAt: string;
}

/** 孩子进度（用于家长端复盘） */
export interface ChildProgress {
  userId: number;
  nickname: string;
  avatar?: string;
  dailyTotal: number;
  dailyCompleted: number;
  weeklyTotal: number;
  weeklyCompleted: number;
  monthlyTotal: number;
  monthlyCompleted: number;
}

// ==================== 解析函数 ====================

export function parseLeaderboardEntry(data: Record<string, unknown>): LeaderboardEntry {
  return {
    rank: (data.rank ?? 0) as number,
    userId: (data.user_id ?? data.userId ?? 0) as number,
    nickname: (data.nickname as string) || '未知',
    avatar: data.avatar as string | undefined,
    role: (data.role as string) || 'child',
    rankScore: (data.rank_score ?? data.rankScore ?? 0) as number,
    coins: (data.coins ?? 0) as number,
    rankTier: ((data.rank_tier ?? data.rankTier ?? 'bronze') as Tier) || 'bronze',
    familyName: (data.family_name ?? data.familyName) as string | undefined,
  };
}

export function parseRankTierConfig(data: Record<string, unknown>): RankTierConfig {
  return {
    id: (data.id as number) || 0,
    familyId: data.family_id as number | null,
    name: (data.name as string) || '',
    icon: (data.icon as string) || '',
    minScore: (data.min_score ?? data.minScore ?? 0) as number,
    isActive: ((data.is_active ?? data.isActive ?? 1) as number) === 1,
    createdAt: (data.created_at ?? data.createdAt ?? '') as string,
  };
}

export function parseChildProgress(data: Record<string, unknown>): ChildProgress {
  return {
    userId: (data.user_id ?? data.userId ?? 0) as number,
    nickname: (data.nickname as string) || '',
    avatar: data.avatar as string | undefined,
    dailyTotal: (data.daily_total ?? data.dailyTotal ?? 0) as number,
    dailyCompleted: (data.daily_completed ?? data.dailyCompleted ?? 0) as number,
    weeklyTotal: (data.weekly_total ?? data.weeklyTotal ?? 0) as number,
    weeklyCompleted: (data.weekly_completed ?? data.weeklyCompleted ?? 0) as number,
    monthlyTotal: (data.monthly_total ?? data.monthlyTotal ?? 0) as number,
    monthlyCompleted: (data.monthly_completed ?? data.monthlyCompleted ?? 0) as number,
  };
}
