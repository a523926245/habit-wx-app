/**
 * 错误码定义
 * 统一管理后端业务错误码、HTTP 状态码及对应的中文提示
 *
 * 注：API_BASE_URL 从 @/config/api 重导出，供请求层统一使用
 */

import { API_BASE_URL } from "./api";

export { API_BASE_URL };

// ==================== HTTP 状态码 ====================

/** HTTP 成功状态码 */
export const HTTP_OK = 200;

// ==================== 后端业务错误码 ====================

/**
 * 后端统一错误码
 * 对应后端 src/lib/middleware/error-handler.ex（或等效中间件）
 */
export const ErrorCode = {
  /** 成功 */
  SUCCESS: 200,
  /** 参数校验失败 */
  VALIDATION_ERROR: 10001,
  /** 金币不足 */
  INSUFFICIENT_COINS: 10002,
  /** 重复提交 */
  ALREADY_SUBMITTED: 10003,
  /** 家庭已满 */
  FAMILY_FULL: 10004,
  /** 重复操作 */
  DUPLICATE: 10005,
  /** 资源不存在 */
  NOT_FOUND: 10006,
  /** 权限不足 */
  FORBIDDEN: 10007,
  /** 认证失败 / Token 过期 */
  UNAUTHORIZED: 10008,
} as const;

/** 错误码类型（只读，不可重新赋值） */
export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/** 错误码 → 用户友好提示的映射表 */
export const ErrorMessages: Record<ErrorCodeType, string> = {
  [ErrorCode.SUCCESS]: "操作成功",
  [ErrorCode.VALIDATION_ERROR]: "参数错误",
  [ErrorCode.INSUFFICIENT_COINS]: "金币不足",
  [ErrorCode.ALREADY_SUBMITTED]: "请勿重复提交",
  [ErrorCode.FAMILY_FULL]: "家庭已满员",
  [ErrorCode.DUPLICATE]: "操作重复",
  [ErrorCode.NOT_FOUND]: "资源不存在",
  [ErrorCode.FORBIDDEN]: "权限不足",
  [ErrorCode.UNAUTHORIZED]: "登录已过期",
};

/** 业务错误码集合（用于快速判断） */
export const BusinessErrorCodes: Set<ErrorCodeType> = new Set(
  Object.values(ErrorCode) as ErrorCodeType[]
);

// ==================== 网络错误码 ====================

/** 网络/客户端层错误分类 */
export const NetworkError = {
  /** 请求超时 */
  TIMEOUT: "timeout",
  /** 连接失败 */
  FAIL: "fail",
} as const;

export type NetworkErrorType = (typeof NetworkError)[keyof typeof NetworkError];

export const NetworkMessages: Record<NetworkErrorType, string> = {
  [NetworkError.TIMEOUT]: "请求超时",
  [NetworkError.FAIL]: "网络连接失败",
};

/** 通用网络异常提示 */
export const NETWORK_ERROR_DEFAULT = "网络异常，请稍后重试";
/** JSON 解析失败提示 */
export const PARSE_ERROR_MESSAGE = "响应解析失败";
/** 文件上传失败提示 */
export const UPLOAD_ERROR_MESSAGE = "上传失败";

// ==================== 应用级业务错误消息 ====================

/**
 * 应用层业务错误消息
 * Store 和页面中的 fallback 错误提示统一从这里获取
 */
export const AppErrorMessages = {
  // --- Auth ---
  LOGIN_FAILED: "登录失败",
  REGISTER_FAILED: "注册失败",
  CREATE_FAMILY_FAILED: "创建家庭失败",
  JOIN_FAMILY_FAILED: "加入家庭失败",
  UPDATE_FAILED: "更新失败",
  // --- Card ---
  SUBMIT_FAILED: "提交失败",
  UNSUBMIT_FAILED: "撤回失败",
  APPROVE_FAILED: "审核失败",
  REJECT_FAILED: "驳回失败",
  GET_PENDING_FAILED: "获取待审核失败",
  LOAD_TASK_FAILED: "网络异常，加载任务失败",
  // --- Boss ---
  LOAD_BOSS_FAILED: "加载 BOSS 失败",
  LOAD_BOSS_NETWORK_FAILED: "网络异常，加载 BOSS 失败",
  CREATE_BOSS_FAILED: "创建 BOSS 失败",
  UPDATE_BOSS_FAILED: "更新 BOSS 失败",
  END_BOSS_FAILED: "结束 BOSS 失败",
  REFRESH_BOSS_FAILED: "刷新 BOSS 失败",
  DELETE_BOSS_FAILED: "删除 BOSS 失败",
  // --- Shop ---
  LOAD_ITEMS_FAILED: "加载商城失败",
  LOAD_REDEMPTIONS_FAILED: "加载兑换记录失败",
  REDEEM_FAILED: "兑换失败",
  BUY_GACHA_FAILED: "购买扭蛋失败",
  CONFIRM_FAILED: "确认失败",
  REJECT_REDEMPTION_FAILED: "拒绝失败",
  // --- MagicBox ---
  LOAD_BOXES_FAILED: "加载扭蛋失败",
  LOAD_VOUCHERS_FAILED: "加载兑换券失败",
  OPEN_BOX_FAILED: "开扭蛋失败",
  BUY_BOX_FAILED: "购买扭蛋失败",
  // --- Rank ---
  LOAD_LEADERBOARD_FAILED: "加载排行榜失败",
  LOAD_PROGRESS_FAILED: "加载进度失败",
  // --- Checkin ---
  LOAD_STATUS_FAILED: "加载签到状态失败",
  LOAD_CALENDAR_FAILED: "加载签到日历失败",
} as const;

/** 获取应用错误消息 */
export function getAppMessage(key: keyof typeof AppErrorMessages): string {
  return AppErrorMessages[key];
}
