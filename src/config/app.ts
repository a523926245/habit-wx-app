/**
 * 应用级常量
 * 错误码定义在 @/config/errors（ErrorCode）
 */

/** 家长密钥（创建家庭时需要） */
export const PARENT_KEY = "123456";

/** 应用级限制常量 */
export const APP_CONSTANTS = {
  /** 家庭最大成员数 */
  MAX_FAMILY_MEMBERS: 6,
  /** 邀请码长度 */
  INVITE_CODE_LENGTH: 6,
  /** 每日任务上限 */
  DAILY_CARD_LIMIT: 8,
  /** 金币月度衰减百分比 */
  MONTHLY_COIN_DECAY_PERCENT: 20,
} as const;
