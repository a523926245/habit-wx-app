/**
 * 扭蛋系统模型
 * 对应 Flutter 端的 GachaConfig, MagicBox, BoxOpeningResult, Voucher
 */

/** 扭蛋档位 */
export type GachaTier = 1 | 2 | 3 | 4;

/** 扭蛋来源 */
export type GachaSource = 'boss_drop' | 'shop_purchase';

/** 扭蛋结果类型 */
export type OpeningResultType = 'coins' | 'voucher';

export interface GachaConfig {
  tier: GachaTier;
  name: string;
  emoji: string;
  shopPrice: number;
  coinMin: number;
  coinMax: number;
  voucherCopperRate: number;
  voucherSilverRate: number;
  voucherGoldRate: number;
  voucherLegendaryRate: number;
}

export interface MagicBox {
  id: number;
  tier: GachaTier;
  source: GachaSource;
  bossId?: number;
  opened: boolean;
  createdAt: string;
  // JOIN 查询结果
  name: string;
  emoji: string;
  shopPrice: number;
}

export interface BoxOpeningResult {
  resultType: OpeningResultType;
  coinsReward: number;
  voucherTier?: number;
  voucherTierName?: string;
  voucherEmoji?: string;
}

export interface Voucher {
  id: number;
  tier: GachaTier;
  status: 'unused' | 'used';
  source: string;
  usedItemId?: number;
  usedItemName?: string;
  usedItemEmoji?: string;
  createdAt: string;
}

// ==================== 解析函数 ====================

export function parseGachaConfig(data: Record<string, unknown>): GachaConfig {
  return {
    tier: ((data.tier as GachaTier) || 1) as GachaTier,
    name: (data.name as string) || '',
    emoji: (data.emoji as string) || '🎡',
    shopPrice: (data.shop_price ?? data.shopPrice ?? 0) as number,
    coinMin: (data.coin_min ?? data.coinMin ?? 0) as number,
    coinMax: (data.coin_max ?? data.coinMax ?? 0) as number,
    voucherCopperRate: Number(data.voucher_copper_rate ?? 0),
    voucherSilverRate: Number(data.voucher_silver_rate ?? 0),
    voucherGoldRate: Number(data.voucher_gold_rate ?? 0),
    voucherLegendaryRate: Number(data.voucher_legendary_rate ?? 0),
  };
}

export function parseMagicBox(data: Record<string, unknown>): MagicBox {
  return {
    id: data.id as number,
    tier: ((data.tier as GachaTier) || 1) as GachaTier,
    source: ((data.source as GachaSource) || 'boss_drop') as GachaSource,
    bossId: data.boss_id as number | undefined,
    opened: ((data.opened ?? 0) as number) === 1,
    createdAt: (data.created_at ?? data.createdAt ?? '') as string,
    name: (data.name as string) || '扭蛋',
    emoji: (data.emoji as string) || '🎡',
    shopPrice: (data.shop_price ?? data.shopPrice ?? 0) as number,
  };
}

export function parseBoxOpeningResult(data: Record<string, unknown>): BoxOpeningResult {
  return {
    resultType: (data.resultType ?? data.result_type ?? 'coins') as OpeningResultType,
    coinsReward: (data.coinsReward ?? data.coins_reward ?? 0) as number,
    voucherTier: data.voucherTier as number | undefined,
    voucherTierName: data.voucherTierName as string | undefined,
    voucherEmoji: data.voucherEmoji as string | undefined,
  };
}

export function parseVoucher(data: Record<string, unknown>): Voucher {
  return {
    id: data.id as number,
    tier: ((data.tier as GachaTier) || 1) as GachaTier,
    status: ((data.status as 'unused' | 'used') || 'unused') as 'unused' | 'used',
    source: (data.source as string) || 'magic_box',
    usedItemId: data.used_item_id as number | undefined,
    usedItemName: data.used_item_name as string | undefined,
    usedItemEmoji: data.used_item_emoji as string | undefined,
    createdAt: (data.created_at ?? data.createdAt ?? '') as string,
  };
}

// ==================== 辅助常量 ====================

/** 扭蛋档位配置 */
export const GACHA_TIER_CONFIG: Record<GachaTier, { name: string; emoji: string; shopPrice: number }> = {
  1: { name: '青铜扭蛋', emoji: '🔤', shopPrice: 30 },
  2: { name: '白银扭蛋', emoji: '⚪', shopPrice: 80 },
  3: { name: '黄金扭蛋', emoji: '🟡', shopPrice: 200 },
  4: { name: '钻石扭蛋', emoji: '💎', shopPrice: 500 },
};

/** 兑换券档位名称 */
export const VOUCHER_TIER_NAMES: Record<GachaTier, string> = {
  1: '青铜券',
  2: '白银券',
  3: '黄金券',
  4: '传说券',
};

/** 兑换券档位表情 */
export const VOUCHER_TIER_EMOJIS: Record<GachaTier, string> = {
  1: '🔤',
  2: '⚪',
  3: '🟡',
  4: '💎',
};
