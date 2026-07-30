/**
 * 扭蛋系统 API
 * 对应 Flutter 端的 magic_box_provider
 */
import request from "@/api/request";

/**
 * 获取扭蛋配置
 * GET /api/magicbox/config
 */
export async function getGachaConfig() {
  return request.get<{
    configs: {
      tier: number;
      name: string;
      emoji: string;
      shopPrice: number;
      shop_price: number;
      coinMin: number;
      coinMax: number;
      coin_min: number;
      voucherCopperRate: number;
      voucherSilverRate: number;
      voucherGoldRate: number;
      voucherLegendaryRate: number;
    }[];
  }>("/magicbox/config");
}

/**
 * 更新扭蛋配置（家长）
 * PUT /api/magicbox/config/:tier
 */
export async function updateGachaConfig(
  tier: number,
  params: Record<string, unknown>
) {
  return request.put<{ config: unknown }>(`/magicbox/config/${tier}`, params);
}

/**
 * 获取当前用户未开启的扭蛋
 * GET /api/magicbox/boxes
 */
export async function getMagicBoxes() {
  return request.get<{
    boxes: {
      id: number;
      tier: number;
      source: string;
      bossId?: number;
      opened: boolean;
      createdAt: string;
      name: string;
      emoji: string;
      shopPrice: number;
    }[];
  }>("/magicbox/boxes");
}

/**
 * 开启扭蛋
 * POST /api/magicbox/open/:boxId
 */
export async function openMagicBox(boxId: number) {
  return request.post<{
    result: {
      resultType: "coins" | "voucher";
      coinsReward: number;
      voucherTier?: number;
      voucherTierName?: string;
      voucherEmoji?: string;
    };
  }>(`/magicbox/open/${boxId}`);
}

/**
 * 购买扭蛋
 * POST /api/magicbox/buy
 */
export async function buyMagicBox(tier: number) {
  return request.post<{
    box: { id: number; tier: number };
    message: string;
  }>("/magicbox/buy", { tier });
}

/**
 * 获取兑换券库存
 * GET /api/magicbox/vouchers
 */
export async function getVouchers() {
  return request.get<{
    vouchers: {
      id: number;
      tier: number;
      status: string;
      source: string;
      usedItemId?: number;
      usedItemName?: string;
      usedItemEmoji?: string;
      createdAt: string;
    }[];
  }>("/magicbox/vouchers");
}

/**
 * 使用兑换券
 * POST /api/magicbox/vouchers/:id/use
 */
export async function useVoucher(voucherId: number, itemId: number) {
  return request.post<{
    redemption: unknown;
    message: string;
  }>(`/magicbox/vouchers/${voucherId}/use`, { item_id: itemId });
}

/**
 * 获取扭蛋商城
 * GET /api/magicbox/shop
 */
export async function getGachaShop() {
  return request.get<{
    items: {
      tier: number;
      name: string;
      emoji: string;
      shopPrice: number;
      shop_price: number;
      coinMin: number;
      coinMax: number;
      coin_min: number;
      coin_max: number;
      canAfford: boolean;
    }[];
    userCoins: number;
  }>("/magicbox/shop");
}
