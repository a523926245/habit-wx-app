/**
 * 认证状态管理
 * 对应 Flutter 端的 AuthProvider
 */
import { ref, computed, type ComputedRef } from "vue";
import * as api from "@/api/auth";
import * as storage from "@/utils/storage";
import type { User } from "@/models/user";
import { NETWORK_ERROR_DEFAULT, getAppMessage } from "@/config/errors";

// ==================== 类型定义 ====================

interface AppError {
  message?: string;
  errmsg?: string;
}

// ==================== 状态 ====================

const user = ref<User | null>(null);
const token = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// ==================== 计算属性 ====================

export const isLoggedIn:ComputedRef<boolean> = computed(() => !!user.value && !!token.value);
export const hasFamily:ComputedRef<boolean> = computed(() => !!user.value && user.value!.familyId > 0);
export const isParent:ComputedRef<boolean> = computed(() => user.value?.role === "parent");
export const isChild: ComputedRef<boolean> = computed(() => user.value?.role === "child");

// ==================== 初始化：恢复本地登录态 ====================

async function init() {
  try {
    const savedToken = storage.getStorageSync<string>(storage.STORAGE_KEYS.AUTH_TOKEN);
    const savedUser = storage.getStorageSync<string>(storage.STORAGE_KEYS.CURRENT_USER);

    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);

      // 验证 token 是否有效
      const result = await validateToken();
      if (!result) {
        // token 无效，清除本地状态
        clearLocal();
      }
    }
  } catch (e) {
    console.error("[auth] 恢复登录态失败:", e);
    clearLocal();
  }
}

async function validateToken(): Promise<boolean> {
  try {
    const result = await api.getDashboardOverview();
    if (!result.success) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function clearLocal() {
  storage.removeStorageSync(storage.STORAGE_KEYS.AUTH_TOKEN);
  storage.removeStorageSync(storage.STORAGE_KEYS.CURRENT_USER);
  token.value = null;
  user.value = null;
}

// ==================== 认证方法 ====================

/**
 * 登录
 * POST /api/auth/login
 */
async function login(username: string, password: string): Promise<boolean> {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.login(username, password);
    if (result.success && result.data) {
      const { token: newToken, user: newUser } = result.data as {
        token: string;
        user: User;
      };

      token.value = newToken;
      user.value = newUser;

      // 持久化
      storage.setStorageSync(storage.STORAGE_KEYS.AUTH_TOKEN, newToken);
      storage.setStorageSync(storage.STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

      return true;
    } else {
      error.value = result.error || getAppMessage("LOGIN_FAILED");
      return false;
    }
  } catch (e: unknown) {
    const err = e as AppError;
    error.value = err.message || NETWORK_ERROR_DEFAULT;
    return false;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 注册
 * POST /api/auth/register
 */
async function register(username: string, password: string, nickname: string): Promise<boolean> {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.register(username, password, nickname);
    if (result.success && result.data) {
      const { token: newToken, user: newUser } = result.data as {
        token: string;
        user: User;
      };

      token.value = newToken;
      user.value = newUser;

      // 持久化
      storage.setStorageSync(storage.STORAGE_KEYS.AUTH_TOKEN, newToken);
      storage.setStorageSync(storage.STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

      return true;
    } else {
      error.value = result.error || getAppMessage("REGISTER_FAILED");
      return false;
    }
  } catch (e: unknown) {
    const err = e as AppError;
    error.value = err.message || NETWORK_ERROR_DEFAULT;
    return false;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 创建家庭
 * POST /api/auth/create-family
 */
async function createFamily(parentKey: string, familyName: string): Promise<boolean> {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.createFamily(parentKey, familyName);
    if (result.success && result.data) {
      const { token: newToken, user: newUser, family } = result.data as {
        token: string;
        user: User;
        family: { id: number; name: string; inviteCode: string; parentCode: string };
      };

      token.value = newToken;
      user.value = {
        ...newUser,
        familyId: family?.id || 0,
        familyName: family?.name,
        inviteCode: family?.inviteCode,
        parentCode: family?.parentCode,
      };

      // 持久化
      storage.setStorageSync(storage.STORAGE_KEYS.AUTH_TOKEN, newToken);
      storage.setStorageSync(storage.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user.value));

      return true;
    } else {
      error.value = result.error || getAppMessage("CREATE_FAMILY_FAILED");
      return false;
    }
  } catch (e: unknown) {
    const err = e as AppError;
    error.value = err.message || NETWORK_ERROR_DEFAULT;
    return false;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 加入家庭
 * POST /api/auth/join
 */
async function joinFamily(inviteCode: string): Promise<boolean> {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.joinFamily(inviteCode);
    if (result.success && result.data) {
      const { token: newToken, user: newUser, family } = result.data as {
        token: string;
        user: User;
        family: { id: number; name: string; inviteCode: string; parentCode: string };
      };

      token.value = newToken;
      user.value = {
        ...newUser,
        familyId: family?.id || 0,
        familyName: family?.name,
        inviteCode: family?.inviteCode,
        parentCode: family?.parentCode,
      };

      // 持久化
      storage.setStorageSync(storage.STORAGE_KEYS.AUTH_TOKEN, newToken);
      storage.setStorageSync(storage.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user.value));

      return true;
    } else {
      error.value = result.error || getAppMessage("JOIN_FAMILY_FAILED");
      return false;
    }
  } catch (e: unknown) {
    const err = e as AppError;
    error.value = err.message || NETWORK_ERROR_DEFAULT;
    return false;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 登出
 */
async function logout() {
  try {
    await api.logout();
  } catch (e) {
    // 忽略登出请求失败
  } finally {
    clearLocal();
  }
}

/**
 * 清除错误
 */
function clearError() {
  error.value = null;
}

/**
 * 刷新用户信息
 */
async function refreshUser() {
  if (!token.value) return;
  try {
    const result = await api.getDashboardOverview();
    if (result.success && result.data && user.value) {
      const { coins, rankScore, rankTier } = result.data as {
        coins?: number;
        rankScore?: number;
        rankTier?: string | Record<string, unknown>;
      };
      user.value = {
        ...user.value,
        coins: coins ?? user.value.coins,
        rankScore: rankScore ?? user.value.rankScore,
        rankTier: rankTier ?? user.value.rankTier,
      };
      storage.setStorageSync(
        storage.STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(user.value)
      );
    }
  } catch (e) {
    // 刷新失败静默处理
  }
}

/**
 * 更新昵称
 */
async function updateProfile(nickname: string): Promise<boolean> {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await api.updateProfile(nickname);
    if (result.success && result.data && user.value) {
      const { user: newUser } = result.data as { user: User };
      user.value = { ...user.value, nickname: newUser.nickname || nickname };
      storage.setStorageSync(
        storage.STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(user.value)
      );
      return true;
    } else {
      error.value = result.error || getAppMessage("UPDATE_FAILED");
      return false;
    }
  } catch (e: unknown) {
    const err = e as { message?: string };
    error.value = err.message || NETWORK_ERROR_DEFAULT;
    return false;
  } finally {
    isLoading.value = false;
  }
}

/**
 * 更新头像 URL 到本地状态和持久化存储
 * @param avatarUrl 新头像 URL（由后端上传接口返回）
 * @returns 是否更新成功
 */
function updateAvatar(avatarUrl: string): boolean {
  if (!user.value) return false;

  try {
    user.value = { ...user.value, avatar: avatarUrl };
    storage.setStorageSync(
      storage.STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(user.value)
    );
    return true;
  } catch {
    return false;
  }
}

// ==================== 导出 ====================

export function useAuthStore() {
  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isLoggedIn: computed(() => isLoggedIn.value),
    hasFamily: computed(() => hasFamily.value),
    isParent: computed(() => isParent.value),
    isChild: computed(() => isChild.value),
    init,
    login,
    register,
    createFamily,
    joinFamily,
    logout,
    clearError,
    refreshUser,
    updateProfile,
    updateAvatar,
  };
}

// 不在模块顶层调用 init()，避免多次初始化
// init() 应由 App.vue 的 onLaunch 显式调用
