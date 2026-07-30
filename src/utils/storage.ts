/**
 * uni.storage 封装
 * 对应 Flutter 端的 SharedPreferences
 */

/** 存储键名 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  CURRENT_USER: "current_user",
  USER_ROLE: "user_role",
} as const;

/**
 * 设置存储
 */
export function setStorageSync<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, JSON.stringify(value));
  } catch (e) {
    console.error("[storage] setStorageSync failed:", e);
  }
}

/**
 * 获取存储
 */
export function getStorageSync<T>(key: string): T | null {
  try {
    const value = uni.getStorageSync(key);
    if (value === "" || value === undefined) return null;
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (e) {
    console.error("[storage] getStorageSync failed:", e);
    return null;
  }
}

/**
 * 移除存储
 */
export function removeStorageSync(key: string): void {
  try {
    uni.removeStorageSync(key);
  } catch (e) {
    console.error("[storage] removeStorageSync failed:", e);
  }
}

/**
 * 清除所有存储
 */
export function clearStorageSync(): void {
  try {
    uni.clearStorageSync();
  } catch (e) {
    console.error("[storage] clearStorageSync failed:", e);
  }
}
