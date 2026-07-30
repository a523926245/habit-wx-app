/**
 * 商城 API
 * 对应 Flutter 端的 shop_provider
 */
import request from "@/api/request";
import type { ShopItem, Redemption } from "@/models/shop";
import { parseShopItem, parseRedemption } from "@/models/shop";

/**
 * 获取商城商品列表
 * GET /api/shop/items
 */
export async function getShopItems() {
  return request.get<{ items: ShopItem[] }>("/shop/items");
}

/**
 * 添加商品（家长）
 * POST /api/shop/items
 */
export async function createShopItem(params: {
  name: string;
  description?: string;
  price: number;
  emoji?: string;
  tier?: string;
  item_type?: string;
  gacha_tier?: number;
}) {
  return request.post<{ item: ShopItem }>("/shop/items", params);
}

/**
 * 编辑商品（家长）
 * PUT /api/shop/items/:id
 */
export async function updateShopItem(
  id: number,
  params: Record<string, unknown>
) {
  return request.put<{ item: ShopItem }>(`/shop/items/${id}`, params);
}

/**
 * 删除商品（家长，软删除）
 * DELETE /api/shop/items/:id
 */
export async function deleteShopItem(id: number) {
  return request.delete<{ message: string }>(`/shop/items/${id}`);
}

/**
 * 兑换普通商品
 * POST /api/shop/redeem
 */
export async function redeemItem(itemId: number) {
  return request.post<{ redemption: Redemption; message: string }>(
    "/shop/redeem",
    { item_id: itemId }
  );
}

/**
 * 兑换扭蛋商品
 * POST /api/shop/redeem-gacha
 */
export async function redeemGachaItem(itemId: number) {
  return request.post<{
    box: { id: number; tier: number };
    message: string;
  }>("/shop/redeem-gacha", { item_id: itemId });
}

/**
 * 确认兑换（家长）
 * POST /api/shop/confirm/:id
 */
export async function confirmRedemption(id: number) {
  return request.post<{ message: string }>(`/shop/confirm/${id}`);
}

/**
 * 拒绝兑换（家长）
 * POST /api/shop/reject/:id
 */
export async function rejectRedemption(id: number) {
  return request.post<{ message: string }>(`/shop/reject/${id}`);
}

/**
 * 获取兑换记录
 * GET /api/shop/redemptions
 */
export async function getShopRedemptions(params?: {
  user_id?: number;
  year?: number;
  month?: number;
}) {
  const parts: string[] = [];
  if (params?.user_id) parts.push(`user_id=${params.user_id}`);
  if (params?.year) parts.push(`year=${params.year}`);
  if (params?.month) parts.push(`month=${params.month}`);
  const qs = parts.length > 0 ? `?${parts.join("&")}` : "";
  return request.get<{ redemptions: Redemption[] }>(
    `/shop/redemptions${qs}`
  );
}
