/**
 * 商城模型
 * 对应 Flutter 端的 ShopItem + Redemption
 */

/** 商品类型 */
export type ItemType = 'regular' | 'gacha';

/** 兑换状态 */
export type RedemptionStatus = 'pending' | 'confirmed' | 'rejected';

/** 段位要求 */
export type Tier = 'bronze' | 'silver' | 'gold' | 'legendary';

export interface ShopItem {
  id: number;
  familyId: number;
  name: string;
  description?: string;
  price: number;
  emoji: string;
  tier: Tier;
  status: 'active' | 'inactive';
  itemType: ItemType;
  gachaTier?: number;
  createdBy: number;
  createdAt: string;
}

export interface Redemption {
  id: number;
  userId: number;
  itemId: number;
  status: RedemptionStatus;
  confirmedBy?: number;
  createdAt: string;
  // JOIN 查询结果
  itemName?: string;
  itemEmoji?: string;
  itemPrice?: number;
  userNickname?: string;
}

export interface CoinTransaction {
  id: number;
  userId: number;
  familyId: number;
  amount: number;
  balance: number;
  source: CoinSource;
  description?: string;
  createdAt: string;
}

export type CoinSource =
  | 'card_reward' // 任务奖励
  | 'full_attendance' // 全勤
  | 'checkin' // 签到
  | 'boss_kill' // BOSS击杀
  | 'gacha' // 扭蛋
  | 'shop_purchase' // 商城购买
  | 'shop_refund' // 商城退款
  | 'decay' // 衰减
  | 'redemption'; // 兑换券使用

// ==================== 解析函数 ====================

export function parseShopItem(data: Record<string, unknown>): ShopItem {
  return {
    id: data.id as number,
    familyId: (data.family_id ?? data.familyId ?? 0) as number,
    name: (data.name as string) || '',
    description: data.description as string | undefined,
    price: (data.price as number) || 0,
    emoji: (data.emoji as string) || '🎁',
    tier: ((data.tier as Tier) || 'bronze') as Tier,
    status: ((data.status as 'active' | 'inactive') || 'active') as 'active' | 'inactive',
    itemType: ((data.item_type ?? data.itemType) as ItemType) || 'regular',
    gachaTier: data.gacha_tier as number | undefined,
    createdBy: (data.created_by ?? data.createdBy ?? 0) as number,
    createdAt: (data.created_at ?? data.createdAt ?? '') as string,
  };
}

export function parseRedemption(data: Record<string, unknown>): Redemption {
  return {
    id: data.id as number,
    userId: (data.user_id ?? data.userId ?? 0) as number,
    itemId: (data.item_id ?? data.itemId ?? 0) as number,
    status: ((data.status as RedemptionStatus) || 'pending') as RedemptionStatus,
    confirmedBy: data.confirmed_by as number | undefined,
    createdAt: (data.created_at ?? data.createdAt ?? '') as string,
    itemName: (data.item_name ?? data.name) as string | undefined,
    itemEmoji: (data.item_emoji ?? data.emoji) as string | undefined,
    itemPrice: (data.item_price ?? data.price) as number | undefined,
    userNickname: (data.user_nickname ?? data.nickname) as string | undefined,
  };
}

export function parseCoinTransaction(data: Record<string, unknown>): CoinTransaction {
  return {
    id: data.id as number,
    userId: (data.user_id ?? data.userId ?? 0) as number,
    familyId: (data.family_id ?? data.familyId ?? 0) as number,
    amount: (data.amount as number) || 0,
    balance: (data.balance as number) || 0,
    source: ((data.source as CoinSource) || 'card_reward') as CoinSource,
    description: data.description as string | undefined,
    createdAt: (data.created_at ?? data.createdAt ?? '') as string,
  };
}
