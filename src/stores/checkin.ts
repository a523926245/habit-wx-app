/**
 * 签到 Store
 * 对应 Flutter 端的 checkin_provider
 *
 * 管理签到状态、日历数据、连续天数
 */
import { ref, computed } from "vue";
import * as api from "@/api/checkin";
import type { CheckinCalendar, DailyCheckinRecord } from "@/models/checkin";
import { parseDailyCheckinRecord, parseCheckinCalendar } from "@/models/checkin";
import { NETWORK_ERROR_DEFAULT, getAppMessage } from "@/config/errors";

// ==================== 状态 ====================

const checkinStatus = ref<DailyCheckinRecord | null>(null);
const checkinCalendar = ref<CheckinCalendar | null>(null);

const isLoading = ref(false);
const error = ref<string | null>(null);

// ==================== 计算属性 ====================

export const currentStreak = computed(() =>
  checkinStatus.value ? checkinStatus.value.streakDays : 0
);

export const todayHasCheckin = computed(() =>
  checkinStatus.value ? checkinStatus.value.hasAllDailyApproved : false
);

// ==================== 初始化 ====================

/**
 * 加载签到状态
 * 后端返回 snake_case 字段，通过 parseDailyCheckinRecord 统一转换为 camelCase
 */
async function loadStatus() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getCheckinStatus();
    if (result.success && result.data) {
      checkinStatus.value = parseDailyCheckinRecord(
        result.data.status as unknown as Record<string, unknown>
      );
    } else {
      error.value = result.error || getAppMessage("LOAD_STATUS_FAILED");
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 加载签到日历
 * 后端返回 snake_case 字段，通过 parseCheckinCalendar 统一转换为 camelCase
 */
async function loadCalendar(year?: number, month?: number) {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getCheckinCalendar(year, month);
    if (result.success && result.data) {
      checkinCalendar.value = parseCheckinCalendar(
        result.data.calendar as unknown as Record<string, unknown>
      );
    } else {
      error.value = result.error || getAppMessage("LOAD_CALENDAR_FAILED");
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 刷新签到状态
 */
async function refreshStatus() {
  await loadStatus();
}

// ==================== 导出 ====================

export function useCheckinStore() {
  return {
    checkinStatus,
    checkinCalendar,
    currentStreak,
    todayHasCheckin,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadStatus,
    loadCalendar,
    refreshStatus,
  };
}
