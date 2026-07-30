/**
 * BOSS Store
 * 对应 Flutter 端的 boss_provider
 *
 * 管理当前 BOSS 状态、伤害排行、生命周期
 */
import { ref, computed } from "vue";
import * as api from "@/api/boss";
import type { Boss, BossDamageEntry } from "@/models/boss";
import { parseBoss, parseBossDamageEntry, getHpPercent, isDefeated, isActive } from "@/models/boss";
import { getAppMessage } from "@/config/errors";

// ==================== 状态 ====================

const currentBoss = ref<Boss | null>(null);
const allBossesList = ref<Boss[]>([]);
const todayRanking = ref<BossDamageEntry[]>([]);
const weekRanking = ref<BossDamageEntry[]>([]);

const isLoading = ref(false);
const error = ref<string | null>(null);

// ==================== 计算属性 ====================

export const allBosses = computed(() => allBossesList.value);

export const hpPercent = computed(() =>
  currentBoss.value ? getHpPercent(currentBoss.value) : 0
);

export const damageDealt = computed(() =>
  currentBoss.value ? currentBoss.value.maxHp - currentBoss.value.currentHp : 0
);

export const isBossActive = computed(() =>
  currentBoss.value ? isActive(currentBoss.value) : false
);

export const isBossDefeated = computed(() =>
  currentBoss.value ? isDefeated(currentBoss.value) : false
);

export const top3Ranking = computed(() =>
  todayRanking.value.slice(0, 3)
);

// ==================== 初始化 ====================

/**
 * 加载 BOSS 信息（含今日/本周排行）
 */
async function loadBoss() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getCurrentBoss();
    if (result.success && result.data) {
      const bossData = result.data;
      // 解析 BOSS 数据，确保字段名转换正确
      currentBoss.value = parseBoss(bossData.boss as Record<string, unknown>);
      // 解析伤害排行数据
      todayRanking.value = (bossData.todayRanking || []).map((entry: unknown) => 
        parseBossDamageEntry(entry as Record<string, unknown>)
      );
      weekRanking.value = (bossData.weekRanking || []).map((entry: unknown) => 
        parseBossDamageEntry(entry as Record<string, unknown>)
      );
    } else {
      error.value = result.error || getAppMessage("LOAD_BOSS_FAILED");
    }
  } catch {
    error.value = getAppMessage("LOAD_BOSS_NETWORK_FAILED");
  } finally {
    isLoading.value = false;
  }
}

/**
 * 刷新 BOSS 信息
 */
async function refreshBoss() {
  await loadBoss();
}

/**
 * 加载所有 BOSS（家长端管理用）
 */
async function loadAll() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getBossList();
    if (result.success && result.data) {
      allBossesList.value = (result.data.bosses || []).map((b: unknown) => parseBoss(b as Record<string, unknown>));
      // 同步当前 BOSS
      const active = allBossesList.value.find((b) => b.status === "active");
      if (active) {
        currentBoss.value = active;
      }
    } else {
      error.value = result.error || getAppMessage("LOAD_BOSS_FAILED");
    }
  } catch {
    error.value = getAppMessage("LOAD_BOSS_NETWORK_FAILED");
  } finally {
    isLoading.value = false;
  }
}

/**
 * 创建 BOSS
 */
async function createBoss(params: {
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
  error.value = null;
  try {
    const result = await api.createBoss(params);
    if (result.success) {
      await loadAll();
      return true;
    }
    return false;
  } catch {
    error.value = getAppMessage("CREATE_BOSS_FAILED");
    return false;
  }
}

/**
 * 编辑 BOSS
 */
async function updateBoss(id: number, params: Record<string, unknown>) {
  error.value = null;
  try {
    const result = await api.updateBoss(id, params);
    if (result.success) {
      await loadAll();
      return true;
    }
    return false;
  } catch {
    error.value = getAppMessage("UPDATE_BOSS_FAILED");
    return false;
  }
}

/**
 * 结束 BOSS
 */
async function endBoss(id: number) {
  error.value = null;
  try {
    const result = await api.endBoss(id);
    if (result.success) {
      await loadAll();
      return true;
    }
    return false;
  } catch {
    error.value = getAppMessage("END_BOSS_FAILED");
    return false;
  }
}

/**
 * 刷新 BOSS（重置血量）
 */
async function refreshBossState(id: number) {
  error.value = null;
  try {
    const result = await api.refreshBoss(id);
    if (result.success) {
      await loadAll();
      return true;
    }
    return false;
  } catch {
    error.value = getAppMessage("REFRESH_BOSS_FAILED");
    return false;
  }
}

/**
 * 删除 BOSS
 */
async function deleteBoss(id: number) {
  error.value = null;
  try {
    const result = await api.deleteBoss(id);
    if (result.success) {
      await loadAll();
      return true;
    }
    return false;
  } catch {
    error.value = getAppMessage("DELETE_BOSS_FAILED");
    return false;
  }
}

// ==================== 导出 ====================

export function useBossStore() {
  return {
    currentBoss,
    allBosses,
    todayRanking,
    weekRanking,
    hpPercent,
    damageDealt,
    isBossActive,
    isBossDefeated,
    top3Ranking,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadBoss,
    loadAll,
    refreshBoss,
    refreshBossState,
    createBoss,
    updateBoss,
    endBoss,
    deleteBoss,
  };
}
