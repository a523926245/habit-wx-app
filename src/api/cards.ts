/**
 * 卡牌/任务 API
 * 对应 Flutter 端的 card_provider + assignments
 */
import request from "@/api/request";
import type {
  TaskCard,
  CardAssignment,
  AssignmentWithCard,
  AssignmentStatus,
} from "@/models/card";
import { parseTaskCard, parseCardAssignment } from "@/models/card";

// ==================== 卡牌 CRUD ====================

/**
 * 获取家庭所有卡牌
 * GET /api/cards
 */
export async function getCards() {
  return request.get<{ cards: TaskCard[] }>("/cards");
}

/**
 * 创建卡牌
 * POST /api/cards
 */
export async function createCard(params: {
  title: string;
  description?: string;
  type: "daily" | "weekly" | "monthly";
  difficulty?: number;
  coinReward?: number;
  bossDamage?: number;
  emoji?: string;
  repeatDays?: string[];
  deadline?: string;
  expireDate?: string;
  assigneeScope?: string;
}) {
  return request.post<{ card: TaskCard }>("/cards", {
    title: params.title,
    description: params.description,
    type: params.type,
    difficulty: params.difficulty ?? 1,
    coin_reward: params.coinReward,
    boss_damage: params.bossDamage,
    emoji: params.emoji,
    repeat_days: params.repeatDays,
    deadline: params.deadline,
    expire_date: params.expireDate,
    assignee_scope: params.assigneeScope,
  });
}

/**
 * 编辑卡牌
 * PUT /api/cards/:id
 */
export async function updateCard(
  id: number,
  params: Partial<{
    title: string;
    description: string;
    type: string;
    difficulty: number;
    coinReward: number;
    bossDamage: number;
    emoji: string;
    repeatDays: string[];
    deadline: string;
    expireDate: string;
    status: string;
    assigneeScope: string;
  }>
) {
  return request.put<{ card: TaskCard }>(`/cards/${id}`, params);
}

/**
 * 停用卡牌
 * DELETE /api/cards/:id
 */
export async function deleteCard(id: number) {
  return request.delete(`/cards/${id}`);
}

/**
 * 批量删除卡牌
 * POST /api/cards/batch-delete
 */
export async function batchDeleteCards(ids: number[]) {
  return request.post<{ message: string; count: number }>("/cards/batch-delete", { ids });
}

// ==================== 按类型查询 ====================

/**
 * 获取每日任务
 * GET /api/cards/daily
 */
export async function getDailyCards(childId?: number) {
  const params = childId ? `?childId=${childId}` : "";
  return request.get<{
    assignments: CardAssignment[];
    stats: { total: number; completed: number; pending: number; submitted: number; rejected: number };
  }>(`/cards/daily${params}`);
}

/**
 * 获取每周任务
 * GET /api/cards/weekly
 */
export async function getWeeklyCards(childId?: number) {
  const params = childId ? `?childId=${childId}` : "";
  return request.get<{
    assignments: CardAssignment[];
    stats: { total: number; completed: number; pending: number; submitted: number; rejected: number };
  }>(`/cards/weekly${params}`);
}

/**
 * 获取每月任务
 * GET /api/cards/monthly
 */
export async function getMonthlyCards(childId?: number) {
  const params = childId ? `?childId=${childId}` : "";
  return request.get<{
    assignments: CardAssignment[];
    stats: { total: number; completed: number; pending: number; submitted: number; rejected: number };
  }>(`/cards/monthly${params}`);
}

/**
 * 获取所有类型任务（一次性加载）
 * 后端返回 snake_case 字段，通过 parseCardAssignment 统一转换为 camelCase
 */
export async function getAllCards(childId?: number) {
  const [daily, weekly, monthly] = await Promise.all([
    getDailyCards(childId),
    getWeeklyCards(childId),
    getMonthlyCards(childId),
  ]);
  return {
    daily: daily.success
      ? daily.data!.assignments.map((a) => parseCardAssignment(a as unknown as Record<string, unknown>))
      : [],
    weekly: weekly.success
      ? weekly.data!.assignments.map((a) => parseCardAssignment(a as unknown as Record<string, unknown>))
      : [],
    monthly: monthly.success
      ? monthly.data!.assignments.map((a) => parseCardAssignment(a as unknown as Record<string, unknown>))
      : [],
    dailyStats: daily.success ? daily.data!.stats : null,
    weeklyStats: weekly.success ? weekly.data!.stats : null,
    monthlyStats: monthly.success ? monthly.data!.stats : null,
  };
}

// ==================== 分配管理 ====================

/**
 * 获取卡牌已分配人
 * GET /api/cards/:id/assignees
 */
export async function getAssignees(cardId: number) {
  return request.get<{ assignees: { id: number; nickname: string }[]; assignee_scope: string | null }>(
    `/cards/${cardId}/assignees`
  );
}

/**
 * 分配卡牌给孩子
 * POST /api/cards/:id/assign
 */
export async function assignCard(
  cardId: number,
  userIds: number[],
  date?: string
) {
  return request.post<{ message: string }>(`/cards/${cardId}/assign`, {
    user_ids: userIds,
    date: date || new Date().toISOString().split("T")[0],
  });
}

// ==================== 任务提交/审核 ====================

/**
 * 提交任务打卡
 * POST /api/assignments/:id/submit
 */
export async function submitAssignment(
  id: number,
  note?: string,
  photo?: string
) {
  return request.post<{ message: string }>(`/assignments/${id}/submit`, {
    note: note || "",
    photo: photo || "",
  });
}

/**
 * 撤回任务提交
 * POST /api/assignments/:id/unsubmit
 */
export async function unsubmitAssignment(id: number) {
  return request.post<{ message: string }>(`/assignments/${id}/unsubmit`);
}

/**
 * 审核通过
 * POST /api/assignments/:id/approve
 */
export async function approveAssignment(id: number) {
  return request.post<{
    message: string;
    coinReward: number;
    bossDamage: number;
    comboText: string;
    bossAttacked: boolean;
    bossDefeated: boolean;
    boxDrops: unknown[];
    bossHp: number;
    bossMaxHp: number;
    attackLimitReached: boolean;
    fullAttendance: boolean;
    streakDays: number;
    bonusCoins: number;
    checkin: unknown;
  }>(`/assignments/${id}/approve`);
}

/**
 * 审核驳回
 * POST /api/assignments/:id/reject
 */
export async function rejectAssignment(id: number, reason?: string) {
  return request.post<{ message: string }>(`/assignments/${id}/reject`, {
    reason: reason || "",
  });
}

/**
 * 获取待审核列表
 * GET /api/cards/pending
 */
export async function getPending() {
  return request.get<{ pending: CardAssignment[] }>("/cards/pending");
}
