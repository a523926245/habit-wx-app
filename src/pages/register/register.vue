<template>
  <view class="register-page">
    <!-- 背景装饰 -->
    <view class="bg-layer bg-cyan" />
    <view class="bg-layer bg-orange" />

    <view class="page-body">
      <view class="hero-section">
        <text class="logo-icon">⚔️</text>
        <text class="app-title">勇者乐园</text>
      </view>

      <!-- 注册表单卡片 -->
      <view class="form-card">
        <text class="form-card__title">创建账号</text>
        <text class="form-card__subtitle">加入勇者冒险团</text>

        <view class="form-body">
          <!-- 昵称输入 -->
          <view class="input-group">
            <text class="input-label">勇者称号</text>
            <view class="input-wrapper" :class="{ 'is-focused': nicknameFocused }">
              <view class="input-prefix">
                <text class="input-prefix__icon">🏅</text>
              </view>
              <input
                v-model="nickname"
                class="input-field"
                placeholder="你想让别人怎么称呼你"
                placeholder-class="input-placeholder"
                maxlength="20"
                @focus="nicknameFocused = true"
                @blur="nicknameFocused = false"
              />
            </view>
          </view>

          <!-- 账号输入 -->
          <view class="input-group">
            <text class="input-label">勇者账号</text>
            <view class="input-wrapper" :class="{ 'is-focused': usernameFocused }">
              <view class="input-prefix">
                <text class="input-prefix__icon">👤</text>
              </view>
              <input
                v-model="username"
                class="input-field"
                placeholder="用于登录的账号"
                placeholder-class="input-placeholder"
                @focus="usernameFocused = true"
                @blur="usernameFocused = false"
              />
            </view>
          </view>

          <!-- 密码输入 -->
          <view class="input-group">
            <text class="input-label">通关密语</text>
            <view class="input-wrapper" :class="{ 'is-focused': passwordFocused }">
              <view class="input-prefix">
                <text class="input-prefix__icon">🔒</text>
              </view>
              <input
                v-model="password"
                class="input-field"
                :type="obscurePassword ? 'password' : 'text'"
                placeholder="请输入密码"
                placeholder-class="input-placeholder"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
              />
              <view class="input-suffix" @tap="obscurePassword = !obscurePassword">
                <text class="input-suffix__icon">{{ obscurePassword ? '🙈' : '👁️' }}</text>
              </view>
            </view>
          </view>

          <!-- 密码强度指示条 -->
          <view v-if="password.length > 0" class="strength-indicator">
            <view class="strength-bars">
              <view
                v-for="i in 3"
                :key="i"
                class="strength-bar"
                :class="{ active: i <= strength }"
                :style="{ '--bar-color': strengthColors[strength] }"
              />
            </view>
            <text class="strength-label" :style="{ color: strengthColors[strength] }">
              {{ strengthLabels[strength] }}
            </text>
          </view>

          <!-- 错误提示 -->
          <view v-if="errorMsg" class="error-tip">
            <text class="error-tip__icon">⚠️</text>
            <text class="error-tip__text">{{ errorMsg }}</text>
          </view>

          <!-- 注册按钮 -->
          <view class="register-btn" :class="{ 'is-loading': isLoading }" @tap="handleRegister">
            <view v-if="isLoading" class="loading-spinner" />
            <text v-else class="register-btn__text">创建账号</text>
            <text v-if="!isLoading" class="register-btn__icon">➡️</text>
          </view>

          <!-- 已有账号链接 -->
          <view class="link-row">
            <text class="link-text">已有账号？</text>
            <text class="link-text link-text--accent" @tap="goLogin">去登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { showToast } from "@/utils/toast";
import { NETWORK_ERROR_DEFAULT } from "@/config/errors";

const authStore = useAuthStore();

const nickname = ref("");
const username = ref("");
const password = ref("");
const obscurePassword = ref(true);
const nicknameFocused = ref(false);
const usernameFocused = ref(false);
const passwordFocused = ref(false);
const isLoading = ref(false);
const errorMsg = ref("");

// 密码强度计算
const strength = computed(() => {
  const pwd = password.value.trim();
  if (!pwd) return 0;
  const hasDigit = /\d/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const typeCount = [hasDigit, hasLower, hasUpper, hasSpecial].filter(Boolean).length;
  if (typeCount >= 3 && pwd.length >= 8) return 3; // 强
  if (typeCount >= 2 && pwd.length >= 6) return 2; // 中
  if (pwd.length > 0) return 1; // 弱
  return 0;
});

const strengthLabels = ["", "弱", "中", "强"];
const strengthColors = ["", "#FF716C", "#FF6B35", "#00B894"];

// 表单验证
function validate(): boolean {
  // 昵称
  if (!nickname.value.trim()) {
    errorMsg.value = "请输入勇者称号";
    return false;
  }
  if (nickname.value.trim().length < 2) {
    errorMsg.value = "勇者称号至少2个字符";
    return false;
  }

  // 账号
  const uname = username.value.trim();
  if (!uname) {
    errorMsg.value = "请输入勇者账号";
    return false;
  }
  if (uname.length < 2) {
    errorMsg.value = "账号至少2个字符";
    return false;
  }

  // 密码
  const pwd = password.value;
  if (!pwd) {
    errorMsg.value = "请输入通关密语";
    return false;
  }
  if (pwd.length < 6 || pwd.length > 64) {
    errorMsg.value = "密码长度需为6-64位";
    return false;
  }
  const hasDigit = /\d/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const typeCount = [hasDigit, hasLower, hasUpper, hasSpecial].filter(Boolean).length;
  if (typeCount < 2) {
    errorMsg.value = "密码需至少包含2种字符类型";
    return false;
  }

  errorMsg.value = "";
  return true;
}

async function handleRegister() {
  if (!validate()) return;
  if (isLoading.value) return;

  isLoading.value = true;
  try {
    const success = await authStore.register(
      username.value.trim(),
      password.value,
      nickname.value.trim()
    );
    if (success) {
      showToast("注册成功", "success");
      // 注册成功后跳转到选择家庭页
      setTimeout(() => {
        uni.navigateTo({ url: "/pages/family/choose-family/index" });
      }, 1000);
    } else {
      errorMsg.value = authStore.error.value || "注册失败，请重试";
    }
  } catch (e) {
    errorMsg.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

function goLogin() {
  uni.navigateBack();
}
</script>

<style lang="scss" scoped>
.register-page {
  position: relative;
  min-height: 100vh;
  background: $bg-primary;
  overflow: hidden;
}

.page-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 40rpx 0;
}

.bg-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.bg-cyan {
  background: radial-gradient(
    ellipse at 80% 20%,
    rgba(106, 214, 255, 0.12) 0%,
    transparent 60%
  );
}

.bg-orange {
  background: radial-gradient(
    ellipse at 20% 80%,
    rgba(255, 107, 53, 0.08) 0%,
    transparent 60%
  );
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.logo-icon {
  font-size: 80rpx;
  line-height: 1;
}

.app-title {
  font-size: 56rpx;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: 2rpx;
  line-height: 1;
}

.form-card {
  margin: 0 32rpx;
  padding: 48rpx 36rpx;
  background: rgba(22, 23, 46, 0.85);
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.35);

  &__title {
    display: block;
    text-align: center;
    font-size: 44rpx;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 2rpx;
    margin-bottom: 8rpx;
  }

  &__subtitle {
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: $text-secondary;
    margin-bottom: 36rpx;
  }
}

.form-body {
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 24rpx;
}

.input-label {
  display: block;
  margin-bottom: 8rpx;
  margin-left: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: $text-secondary;
  letter-spacing: -0.5rpx;
}

.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 28rpx;
  height: 88rpx;
  background: $input-bg;
  border-radius: 44rpx;
  transition: box-shadow 0.2s ease;

  &.is-focused {
    box-shadow: 0 0 20rpx rgba(106, 214, 255, 0.2), 0 0 6rpx rgba(106, 214, 255, 0.3);
  }
}

.input-prefix {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
}

.input-prefix__icon {
  font-size: 32rpx;
  opacity: 0.7;
}

.input-field {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: $text-primary;
  background: transparent;
}

.input-placeholder {
  color: $text-disabled;
  font-size: 28rpx;
}

.input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
}

.input-suffix__icon {
  font-size: 32rpx;
  opacity: 0.5;
}

.strength-indicator {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8rpx;
  margin-bottom: 8rpx;
  padding: 0 16rpx;
}

.strength-bars {
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 6rpx;
}

.strength-bar {
  flex: 1;
  height: 8rpx;
  border-radius: 4rpx;
  background: $input-disabled;
  transition: background 0.2s ease;

  &.active {
    background: var(--bar-color);
  }
}

.strength-label {
  font-size: 20rpx;
  font-weight: 600;
  margin-left: 12rpx;
  min-width: 40rpx;
}

.error-tip {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8rpx;
  margin-bottom: 16rpx;
  padding: 0 16rpx;
  height: 56rpx;
  background: rgba(255, 113, 108, 0.1);
  border-radius: 8rpx;
  border: 1rpx solid rgba(255, 113, 108, 0.2);
}

.error-tip__icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.error-tip__text {
  font-size: 22rpx;
  color: $accent-red;
  flex: 1;
}

.register-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  margin-top: 24rpx;
  background: $accent-cyan;
  border-radius: 44rpx;
  box-shadow: 0 6rpx 16rpx rgba(106, 214, 255, 0.3);
  transition: transform 0.15s ease;

  &:active:not(.is-loading) {
    transform: scale(0.97);
  }

  &__text {
    font-size: 30rpx;
    font-weight: 800;
    color: $bg-primary;
    letter-spacing: 2rpx;
  }

  &__icon {
    font-size: 28rpx;
    margin-left: 8rpx;
  }
}

.loading-spinner {
  width: 36rpx;
  height: 36rpx;
  border: 4rpx solid rgba(11, 12, 31, 0.3);
  border-top-color: $bg-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.link-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
}

.link-text {
  font-size: 24rpx;
  color: $text-secondary;

  &--accent {
    color: $accent-orange;
    font-weight: 700;
    margin-left: 8rpx;
  }
}
</style>
