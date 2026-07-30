/**
 * 商城 Store
 * 对应 Flutter 端的 shop_provider
 *
 * 管理商品列表、兑换记录
 */
import { ref, computed } from "vue";
import * as api from "@/api/shop";
import type { ShopItem, Redemption } from "@/models/shop";
import { NETWORK_ERROR_DEFAULT, getAppMessage } from "@/config/errors";

// ==================== 状态 ====================

const shopItems = ref<ShopItem[]>([]);
const redemptions = ref<Redemption[]>([]);

const isLoading = ref(false);
const error = ref<string | null>(null);

// ==================== 初始化 ====================

/**
 * 加载商城商品列表
 */
async function loadItems() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getShopItems();
    if (result.success && result.data) {
      shopItems.value = result.data.items || [];
    } else {
      error.value = result.error || getAppMessage("LOAD_ITEMS_FAILED");
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 加载兑换记录
 */
async function loadRedemptions(params?: {
  user_id?: number;
  year?: number;
  month?: number;
}) {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.getShopRedemptions(params);
    if (result.success && result.data) {
      redemptions.value = result.data.redemptions || [];
    } else {
      error.value = result.error || getAppMessage("LOAD_REDEMPTIONS_FAILED");
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

// ==================== 兑换操作 ====================

/**
 * 兑换普通商品
 */
async function redeemItem(itemId: number): Promise<boolean> {
  error.value = null;
  try {
    const result = await api.redeemItem(itemId);
    if (result.success) {
      await loadItems();
      return true;
    } else {
      error.value = result.error || getAppMessage("REDEEM_FAILED");
      return false;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return false;
  }
}

/**
 * 兑换扭蛋商品
 */
async function redeemGachaItem(itemId: number): Promise<{
  boxId: number;
  tier: number;
} | null> {
  error.value = null;
  try {
    const result = await api.redeemGachaItem(itemId);
    if (result.success && result.data) {
      await loadItems();
      return { boxId: result.data.box.id, tier: result.data.box.tier };
    } else {
      error.value = result.error || getAppMessage("BUY_GACHA_FAILED");
      return null;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return null;
  }
}

/**
 * 确认兑换（家长）
 */
async function confirmRedemption(id: number): Promise<boolean> {
  error.value = null;
  try {
    const result = await api.confirmRedemption(id);
    if (result.success) {
      await loadRedemptions();
      return true;
    } else {
      error.value = result.error || getAppMessage("CONFIRM_FAILED");
      return false;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return false;
  }
}

/**
 * 拒绝兑换（家长）
 */
async function rejectRedemption(id: number): Promise<boolean> {
  error.value = null;
  try {
    const result = await api.rejectRedemption(id);
    if (result.success) {
      await loadRedemptions();
      return true;
    } else {
      error.value = result.error || getAppMessage("REJECT_REDEMPTION_FAILED");
      return false;
    }
  } catch {
    error.value = NETWORK_ERROR_DEFAULT;
    return false;
  }
}

// ==================== 导出 ====================

export function useShopStore() {
  return {
    shopItems,
    redemptions,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadItems,
    loadRedemptions,
    redeemItem,
    redeemGachaItem,
    confirmRedemption,
    rejectRedemption,
  };
}
