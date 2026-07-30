/**
 * BOSS API
 * 对应 Flutter 端的 boss_provider
 */
import request from "@/api/request";
import type { Boss, BossDamageEntry } from "@/models/boss";
import { parseBoss, parseBossDamageEntry } from "@/models/boss";

/**
 * 获取当前活跃 BOSS（含今日/本周伤害排行）
 * GET /api/boss/current
 */
export async function getCurrentBoss() {
  return request.get<{
    boss: Boss;
    isNew?: boolean;
    todayRanking: BossDamageEntry[];
    weekRanking: BossDamageEntry[];
  }>("/boss/current");
}

/**
 * 获取 BOSS 列表
 * GET /api/boss/list
 */
export async function getBossList() {
  return request.get<{ bosses: Boss[] }>("/boss/list");
}

/**
 * 获取 BOSS 历史（已击败/过期）
 * GET /api/boss/history
 */
export async function getBossHistory() {
  return request.get<{ bosses: Boss[] }>("/boss/history");
}

/**
 * 获取指定 BOSS 的伤害排行
 * GET /api/boss/:id/ranking
 */
export async function getBossRanking(bossId: number) {
  return request.get<{ ranking: BossDamageEntry[] }>(`/boss/${bossId}/ranking`);
}

/**
 * 创建 BOSS
 * POST /api/boss/create
 */
export async function createBoss(params: {
  name: string;
  emoji?: string;
  maxHp?: number;
  story?: string;
  attackRatio?: number;
  killRewardCoins?: number;
  endTime?: string;
  repeatable?: boolean;
  respawnHours?: number;
  attackLimitPerDay?: number;
  status?: string;
  levelId?: number;
  gachaTier?: number;
}) {
  return request.post<{ boss: Boss }>("/boss/create", params);
}

/**
 * 编辑 BOSS
 * PUT /api/boss/:id
 */
export async function updateBoss(id: number, params: Record<string, unknown>) {
  return request.put<{ boss: Boss }>(`/boss/${id}`, params);
}

/**
 * 删除 BOSS
 * DELETE /api/boss/:id
 */
export async function deleteBoss(id: number) {
  return request.delete<{ message: string }>(`/boss/${id}`);
}

/**
 * 提前结束 BOSS
 * POST /api/boss/:id/end
 */
export async function endBoss(id: number) {
  return request.post<{ boss: Boss; message: string }>(`/boss/${id}/end`);
}

/**
 * 刷新 BOSS 血量（重生）
 * POST /api/boss/:id/refresh
 */
export async function refreshBoss(id: number) {
  return request.post<{ boss: Boss; message: string }>(`/boss/${id}/refresh`);
}
