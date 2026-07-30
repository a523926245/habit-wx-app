/**
 * 排行/复盘 API
 * 对应 Flutter 端的 rank_provider
 */
import request from "@/api/request";
import type {
  LeaderboardEntry,
  RankTierConfig,
  ChildProgress,
} from "@/models/rank";
import {
  parseLeaderboardEntry,
  parseRankTierConfig,
  parseChildProgress,
} from "@/models/rank";

/**
 * 获取排行榜
 * GET /api/rank/leaderboard
 */
export async function getLeaderboard() {
  return request.get<{ leaderboard: LeaderboardEntry[] }>("/rank/leaderboard");
}

/**
 * 获取孩子进度（家长端）
 * GET /api/rank/children-progress
 */
export async function getChildrenProgress() {
  return request.get<{
    children: ChildProgress[];
    summary: {
      totalTasks: number;
      approved: number;
      submitted: number;
      familyRate: number;
    };
  }>("/rank/children-progress");
}

/**
 * 获取复盘数据
 * GET /api/rank/review?month=YYYY-MM
 */
export async function getReview(month: string) {
  return request.get<{
    month: string;
    children: { id: number; nickname: string }[];
    days: unknown[];
    summary: {
      activeDays: number;
      perfectDays: number;
      avgRate: number;
      byType: Record<string, { total: number; approved: number; rate: number }>;
    };
  }>(`/rank/review?month=${month}`);
}

/**
 * 获取排位历史
 * GET /api/rank/history
 */
export async function getRankHistory() {
  return request.get<{ history: unknown[] }>("/rank/history");
}

/**
 * 获取金币/积分流水
 * GET /api/rank/transactions
 */
export async function getTransactions(params?: {
  user_id?: number;
  year?: number;
  month?: number;
}) {
  const parts: string[] = [];
  if (params?.user_id) parts.push(`user_id=${params.user_id}`);
  if (params?.year) parts.push(`year=${params.year}`);
  if (params?.month) parts.push(`month=${params.month}`);
  const qs = parts.length > 0 ? `?${parts.join("&")}` : "";
  return request.get<{
    transactions: unknown[];
    summary: {
      totalEarn: number;
      totalSpend: number;
      totalRankScore: number;
      currentCoins: number;
      currentRankScore: number;
    };
    month: string;
  }>(`/rank/transactions${qs}`);
}

/**
 * 获取段位配置
 * GET /api/rank-tier-config
 */
export async function getRankTierConfig() {
  return request.get<{
    tiers: RankTierConfig[];
    isDefault: boolean;
  }>("/rank-tier-config");
}
