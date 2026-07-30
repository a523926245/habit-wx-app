/**
 * 扭蛋系统 Store
 * 对应 Flutter 端的 magic_box_provider
 *
 * 管理扭蛋库存、兑换券、扭蛋配置
 */
import { ref, computed } from "vue";
import * as api from "@/api/magicBox";
import type { MagicBox, Voucher, BoxOpeningResult } from "@/models/magicBox";
import {
  parseMagicBox,
  parseVoucher,
  parseBoxOpeningResult,
} from "@/models/magicBox";
import { NETWORK_ERROR_DEFAULT, getAppMessage } from "@/config/errors";

// ==================== 状态 ====================

const boxes = ref<MagicBox[]>([]);
const vouchers = ref<Voucher[]>([]);

const isLoading = ref(false);
const error = ref<string | null>(null);

// ==================== 初始化 ====================

/**
 * 获取扭蛋库存
 */
async function loadBoxes() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getMagicBoxes();
    if (result.success && result.data) {
      boxes.value = (result.data.boxes || []).map(parseMagicBox);
    } else {
      error.value = result.error || getAppMessage("LOAD_BOXES_FAILED");
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 获取兑换券库存
 */
async function loadVouchers() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getVouchers();
    if (result.success && result.data) {
      vouchers.value = (result.data.vouchers || []).map(parseVoucher);
    } else {
      error.value = result.error || getAppMessage("LOAD_VOUCHERS_FAILED");
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 开启扭蛋
 */
async function openBox(boxId: number): Promise<BoxOpeningResult | null> {
  error.value = null;
  try {
    const result = await api.openMagicBox(boxId);
    if (result.success && result.data) {
      const parsed = result.data.result;
      return parseBoxOpeningResult(parsed);
    } else {
      error.value = result.error || getAppMessage("OPEN_BOX_FAILED");
      return null;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return null;
  }
}

/**
 * 购买扭蛋
 */
async function buyBox(tier: number): Promise<boolean> {
  error.value = null;
  try {
    const result = await api.buyMagicBox(tier);
    if (result.success) {
      await loadBoxes();
      return true;
    } else {
      error.value = result.error || getAppMessage("BUY_BOX_FAILED");
      return false;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return false;
  }
}

/**
 * 刷新所有扭蛋数据
 */
async function refreshAll() {
  await Promise.all([loadBoxes(), loadVouchers()]);
}

// ==================== 导出 ====================

export function useMagicBoxStore() {
  return {
    boxes,
    vouchers,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadBoxes,
    loadVouchers,
    refreshAll,
    openBox,
    buyBox,
  };
}
