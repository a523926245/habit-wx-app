/**
 * 配置/Dashboard API
 * 对应 Flutter 端的 dashboard + 各种配置接口
 */
import request from "@/api/request";

/**
 * Dashboard 总览（验证 token）
 * GET /api/dashboard/overview
 */
export async function getDashboardOverview() {
  return request.get<{
    coins: number;
    rankScore: number;
    rankTier: string;
  }>("/dashboard/overview");
}

/**
 * Dashboard 趋势数据
 * GET /api/dashboard/trends
 */
export async function getDashboardTrends(params?: {
  year?: number;
  month?: number;
}) {
  const parts: string[] = [];
  if (params?.year) parts.push(`year=${params.year}`);
  if (params?.month) parts.push(`month=${params.month}`);
  const qs = parts.length > 0 ? `?${parts.join("&")}` : "";
  return request.get<{
    coins: unknown[];
    rankScores: unknown[];
    trends: unknown[];
  }>(`/dashboard/trends${qs}`);
}

/**
 * Dashboard 金币统计
 * GET /api/dashboard/coins
 */
export async function getDashboardCoins(params?: {
  year?: number;
  month?: number;
}) {
  const parts: string[] = [];
  if (params?.year) parts.push(`year=${params.year}`);
  if (params?.month) parts.push(`month=${params.month}`);
  const qs = parts.length > 0 ? `?${parts.join("&")}` : "";
  return request.get<{
    totalEarn: number;
    totalSpend: number;
    currentBalance: number;
    month: string;
  }>(`/dashboard/coins${qs}`);
}

/**
 * 更新用户信息
 * PUT /api/auth/profile
 */
export async function updateProfile(params: {
  nickname?: string;
}) {
  return request.post<{
    token: string;
    user: unknown;
  }>("/auth/profile", params);
}

/**
 * 上传头像
 * POST /api/auth/avatar
 */
export async function uploadAvatar(filePath: string) {
  return request.upload<{ avatar: string }>("/auth/avatar", filePath);
}
