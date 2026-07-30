/**
 * 排行榜 Store
 * 对应 Flutter 端的 rank_provider
 *
 * 管理积分榜、金币榜、孩子进度
 */
import { ref, computed } from "vue";
import * as api from "@/api/rank";
import type { LeaderboardEntry, ChildProgress } from "@/models/rank";
import { NETWORK_ERROR_DEFAULT, getAppMessage } from "@/config/errors";

// ==================== 状态 ====================

const scoreLeaderboard = ref<LeaderboardEntry[]>([]);
const coinsLeaderboard = ref<LeaderboardEntry[]>([]);
const childrenProgress = ref<ChildProgress[]>([]);

const isLoading = ref(false);
const error = ref<string | null>(null);

// ==================== 初始化 ====================

/**
 * 加载排行榜
 */
async function loadLeaderboard() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getLeaderboard();
    if (result.success && result.data) {
      scoreLeaderboard.value = result.data.leaderboard || [];
      // 金币榜用同一份数据，按 coins 排序
      coinsLeaderboard.value = [...(result.data.leaderboard || [])].sort(
        (a, b) => b.coins - a.coins
      );
    } else {
      error.value = result.error || getAppMessage("LOAD_LEADERBOARD_FAILED");
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 加载孩子进度（家长端）
 */
async function loadChildrenProgress() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getChildrenProgress();
    if (result.success && result.data) {
      childrenProgress.value = result.data.children || [];
    } else {
      error.value = result.error || getAppMessage("LOAD_PROGRESS_FAILED");
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 刷新排行榜
 */
async function refreshLeaderboard() {
  await loadLeaderboard();
}

// ==================== 导出 ====================

export function useRankStore() {
  return {
    scoreLeaderboard,
    coinsLeaderboard,
    childrenProgress,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadLeaderboard,
    loadChildrenProgress,
    refreshLeaderboard,
  };
}
