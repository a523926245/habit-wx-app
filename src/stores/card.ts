/**
 * 卡牌/任务 Store
 * 对应 Flutter 端的 card_provider
 *
 * 管理每日/每周/每月任务分配状态
 */
import { ref, computed } from "vue";
import * as api from "@/api/cards";
import type { CardAssignment } from "@/models/card";
import { isPending, isSubmitted, isApproved, isRejected } from "@/models/card";
import { NETWORK_ERROR_DEFAULT, getAppMessage } from "@/config/errors";

// ==================== 状态 ====================

const dailyAssignments = ref<CardAssignment[]>([]);
const weeklyAssignments = ref<CardAssignment[]>([]);
const monthlyAssignments = ref<CardAssignment[]>([]);

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  submitted: number;
  rejected: number;
}

const dailyStats = ref<TaskStats | null>(null);
const weeklyStats = ref<TaskStats | null>(null);
const monthlyStats = ref<TaskStats | null>(null);

const isLoading = ref(false);
const error = ref<string | null>(null);

// ==================== 家长端待审核列表 ====================

/** 待审核列表项 */
interface PendingItem {
  id: number;
  card_id: number;
  child_user_id: number;
  user_id: number;
  emoji: string;
  title: string;
  child_name: string;
  coin_reward: number;
  boss_damage: number;
  assigned_date: string;
  submission_note?: string;
}

const pendingList = ref<PendingItem[]>([]);

// ==================== 计算属性 ====================

export const allAssignments = computed(() =>
  [...dailyAssignments.value, ...weeklyAssignments.value, ...monthlyAssignments.value]
);

export const pendingAssignments = computed(() =>
  allAssignments.value.filter((a) => isPending(a.status))
);

export const submittedAssignments = computed(() =>
  allAssignments.value.filter((a) => isSubmitted(a.status))
);

export const approvedAssignments = computed(() =>
  allAssignments.value.filter((a) => isApproved(a.status))
);

export const rejectedAssignments = computed(() =>
  allAssignments.value.filter((a) => isRejected(a.status))
);

// ==================== 初始化 ====================

/**
 * 加载所有类型任务
 * @param childId 可选，家长查看指定孩子的任务
 */
async function loadAll(childId?: number) {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getAllCards(childId);
    dailyAssignments.value = result.daily;
    weeklyAssignments.value = result.weekly;
    monthlyAssignments.value = result.monthly;
    dailyStats.value = result.dailyStats;
    weeklyStats.value = result.weeklyStats;
    monthlyStats.value = result.monthlyStats;
  } catch {
    error.value = getAppMessage("LOAD_TASK_FAILED");
  } finally {
    isLoading.value = false;
  }
}

/**
 * 刷新用户信息（任务完成后调用）
 */
async function refreshUser() {
  if (dailyAssignments.value.length > 0 || weeklyAssignments.value.length > 0) {
    await loadAll();
  }
}

// ==================== 任务操作 ====================

/**
 * 提交任务打卡
 */
async function submitAssignment(
  id: number,
  note?: string,
  photo?: string
): Promise<boolean> {
  error.value = null;
  try {
    const result = await api.submitAssignment(id, note, photo);
    if (result.success) {
      await loadAll();
      return true;
    } else {
      error.value = result.error || getAppMessage("SUBMIT_FAILED");
      return false;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return false;
  }
}

/**
 * 撤回任务提交
 */
async function unsubmitAssignment(id: number): Promise<boolean> {
  error.value = null;
  try {
    const result = await api.unsubmitAssignment(id);
    if (result.success) {
      await loadAll();
      return true;
    } else {
      error.value = result.error || getAppMessage("UNSUBMIT_FAILED");
      return false;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return false;
  }
}

/**
 * 审核通过
 */
async function approveAssignment(id: number) {
  error.value = null;
  try {
    const result = await api.approveAssignment(id);
    if (result.success) {
      await loadAll();
      return result.data;
    } else {
      error.value = result.error || getAppMessage("APPROVE_FAILED");
      return null;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return null;
  }
}

/**
 * 审核驳回
 */
async function rejectAssignment(id: number, reason?: string) {
  error.value = null;
  try {
    const result = await api.rejectAssignment(id, reason);
    if (result.success) {
      await loadAll();
      return true;
    } else {
      error.value = result.error || getAppMessage("REJECT_FAILED");
      return false;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return false;
  }
}

/**
 * 获取待审核列表（家长）
 */
async function getPendingList() {
  error.value = null;
  try {
    const result = await api.getPending();
    if (result.success) {
      return result.data?.pending || [];
    } else {
      error.value = result.error || getAppMessage("GET_PENDING_FAILED");
      return [];
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return [];
  }
}

/**
 * 加载待审核列表（家长端专用，返回扁平化数据）
 */
async function loadPending() {
  error.value = null;
  try {
    const result = await api.getPending();
    if (result.success && result.data?.pending) {
      pendingList.value = (result.data.pending as unknown as PendingItem[]).map(
        (item) => ({
          id: item.id,
          card_id: item.card_id ?? 0,
          child_user_id: item.child_user_id ?? item.user_id ?? 0,
          user_id: item.user_id ?? 0,
          emoji: item.emoji ?? "⭐",
          title: item.title ?? "任务",
          child_name: item.child_name ?? "未知",
          coin_reward: item.coin_reward ?? 0,
          boss_damage: item.boss_damage ?? 0,
          assigned_date: item.assigned_date ?? "",
          submission_note: item.submission_note,
        })
      );
      return pendingList.value;
    } else {
      error.value = result.error || getAppMessage("GET_PENDING_FAILED");
      return [];
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return [];
  }
}

// ==================== 导出 ====================

export function useCardStore() {
  return {
    dailyAssignments: computed(() => dailyAssignments.value),
    weeklyAssignments: computed(() => weeklyAssignments.value),
    monthlyAssignments: computed(() => monthlyAssignments.value),
    allAssignments,
    pendingAssignments,
    submittedAssignments,
    approvedAssignments,
    rejectedAssignments,
    dailyStats,
    weeklyStats,
    monthlyStats,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    pendingList: computed(() => pendingList.value),
    loadAll,
    refreshUser,
    submitAssignment,
    unsubmitAssignment,
    approveAssignment,
    rejectAssignment,
    getPendingList,
    loadPending,
  };
}
