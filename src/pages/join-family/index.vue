<template>
  <view class="join-family-page">
    <!-- 背景装饰 -->
    <view class="bg-layer bg-cyan" />
    <view class="bg-layer bg-orange" />

    <view class="container">
      <!-- 图标 -->
      <view class="hero-icon">
        <view class="icon-circle">👥</view>
      </view>

      <text class="hero-title">输入家庭邀请码</text>
      <text class="hero-desc">向家人获取邀请码，加入已有领土</text>

      <!-- 邀请码输入 -->
      <view class="code-input-wrapper" :class="{ 'is-focused': codeFocused }">
        <input
          v-model="inviteCode"
          class="code-input"
          type="text"
          placeholder="XXXXXX"
          placeholder-class="code-placeholder"
          maxlength="6"
          @focus="codeFocused = true"
          @blur="codeFocused = false"
        />
      </view>

      <!-- 错误提示 -->
      <view v-if="errorMsg" class="error-tip">
        <text class="error-tip__icon">⚠️</text>
        <text class="error-tip__text">{{ errorMsg }}</text>
      </view>

      <!-- 加入按钮 -->
      <view class="join-btn" :class="{ 'is-loading': isLoading }" @tap="handleJoin">
        <view v-if="isLoading" class="loading-spinner" />
        <text v-else class="join-btn__text">申请进入</text>
      </view>

      <!-- 底部提示 -->
      <view class="footer-tips">
        <view class="tip-row">
          <text class="tip-icon">💡</text>
          <text class="tip-text">家长创建家庭后自动生成邀请码</text>
        </view>
        <view class="tip-row tip-row--accent">
          <text class="tip-text">孩子可以通过邀请码加入哦！</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { showToast } from "@/utils/toast";
import { NETWORK_ERROR_DEFAULT } from "@/config/errors";

const authStore = useAuthStore();

const inviteCode = ref("");
const codeFocused = ref(false);
const isLoading = ref(false);
const errorMsg = ref("");

async function handleJoin() {
  const code = inviteCode.value.trim();
  if (!code) {
    errorMsg.value = "请输入6位邀请码";
    return;
  }

  errorMsg.value = "";
  isLoading.value = true;
  try {
    const success = await authStore.joinFamily(code);
    if (success) {
      showToast("加入成功", "success");
      // 加入成功后会在 App.vue 的路由守卫中自动跳转
    } else {
      errorMsg.value = authStore.error.value || "加入失败，请检查邀请码";
    }
  } catch (e) {
    errorMsg.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.join-family-page {
  position: relative;
  min-height: 100vh;
  background: $bg-primary;
  overflow: hidden;
}

.bg-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.bg-cyan {
  background: radial-gradient(
    ellipse at 50% 50%,
    rgba(106, 214, 255, 0.08) 0%,
    transparent 60%
  );
}

.bg-orange {
  background: radial-gradient(
    ellipse at 50% 80%,
    rgba(255, 107, 53, 0.06) 0%,
    transparent 60%
  );
}

.container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0 32rpx;
}

.hero-icon {
  margin-bottom: 32rpx;
}

.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  border: 2rpx solid rgba(255, 107, 53, 0.2);
  font-size: 56rpx;
}

.hero-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.hero-desc {
  font-size: 24rpx;
  color: $text-secondary;
  margin-bottom: 64rpx;
}

.code-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120rpx;
  background: $bg-card;
  border-radius: 60rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  transition: box-shadow 0.2s ease;

  &.is-focused {
    box-shadow: 0 0 30rpx rgba(255, 107, 53, 0.15);
  }
}

.code-input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 48rpx;
  font-weight: 700;
  color: $accent-orange;
  letter-spacing: 12rpx;
  background: transparent;
}

.code-placeholder {
  font-size: 48rpx;
  color: $text-disabled;
  letter-spacing: 12rpx;
}

.error-tip {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-top: 16rpx;
  margin-bottom: 24rpx;
  padding: 0 32rpx;
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

.join-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  margin-bottom: 64rpx;
  background: $accent-orange;
  border-radius: 44rpx;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 53, 0.3);
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

.footer-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.tip-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}

.tip-icon {
  font-size: 24rpx;
}

.tip-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.tip-row--accent .tip-text {
  color: $accent-cyan;
  font-weight: 700;
}
</style>
