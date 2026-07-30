<template>
  <view class="create-family-page">
    <!-- 背景装饰 -->
    <view class="bg-layer bg-cyan" />

    <scroll-view scroll-y class="scroll-area">
      <!-- 标题区域 -->
      <view class="hero-section">
        <text class="hero-emoji">🎮</text>
        <text class="hero-title">开启你的家庭征途</text>
        <text class="hero-desc">作为领航者开启全新据点</text>
      </view>

      <!-- 表单卡片 -->
      <view v-if="!createdInviteCode" class="form-card">
        <view class="input-group">
          <text class="input-label">家庭名称</text>
          <view class="input-wrapper" :class="{ 'is-focused': familyNameFocused }">
            <view class="input-prefix">
              <text class="input-prefix__icon">🏠</text>
            </view>
            <input
              v-model="familyName"
              class="input-field"
              placeholder="例如：勇敢者之家"
              placeholder-class="input-placeholder"
              maxlength="20"
              @focus="familyNameFocused = true"
              @blur="familyNameFocused = false"
            />
          </view>
        </view>

        <view class="input-group">
          <text class="input-label">家长密钥</text>
          <view class="input-wrapper" :class="{ 'is-focused': parentKeyFocused }">
            <view class="input-prefix">
              <text class="input-prefix__icon">🔑</text>
            </view>
            <input
              v-model="parentKey"
              class="input-field"
              type="text"
              placeholder="请输入6位家长密钥"
              placeholder-class="input-placeholder"
              @focus="parentKeyFocused = true"
              @blur="parentKeyFocused = false"
            />
          </view>
        </view>

        <!-- 错误提示 -->
        <view v-if="errorMsg" class="error-tip">
          <text class="error-tip__icon">⚠️</text>
          <text class="error-tip__text">{{ errorMsg }}</text>
        </view>

        <!-- 创建按钮 -->
        <view class="create-btn" :class="{ 'is-loading': isLoading }" @tap="handleCreate">
          <view v-if="isLoading" class="loading-spinner" />
          <text v-else class="create-btn__text">开启冒险</text>
        </view>
      </view>

      <!-- 创建成功 -->
      <view v-else class="success-card">
        <text class="success-emoji">🎉</text>
        <text class="success-title">家庭创建成功！</text>

        <view class="invite-code-card">
          <text class="invite-code-label">你的邀请码</text>
          <view class="invite-code-value">
            <text class="invite-code-text">{{ createdInviteCode }}</text>
            <view class="copy-btn" @tap="copyCode">
              <text class="copy-btn__icon">📋</text>
            </view>
          </view>
          <text class="invite-code-hint">将此码分享给家人，让他们加入你的家庭</text>
        </view>

        <view class="enter-btn" @tap="goHome">
          <text class="enter-btn__text">进入家庭主页</text>
          <text class="enter-btn__icon">🏠</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { showToast } from "@/utils/toast";
import { NETWORK_ERROR_DEFAULT } from "@/config/errors";

const authStore = useAuthStore();

const familyName = ref("");
const parentKey = ref("");
const familyNameFocused = ref(false);
const parentKeyFocused = ref(false);
const isLoading = ref(false);
const errorMsg = ref("");
const createdInviteCode = ref("");

async function handleCreate() {
  if (!familyName.value.trim()) {
    errorMsg.value = "请输入家庭名称";
    return;
  }
  if (!parentKey.value.trim()) {
    errorMsg.value = "请输入家长密钥";
    return;
  }

  errorMsg.value = "";
  isLoading.value = true;
  try {
    const success = await authStore.createFamily(parentKey.value.trim(), familyName.value.trim());
    if (success) {
      // 从 store 中获取邀请码
      createdInviteCode.value = authStore.user.value?.inviteCode || "";
      showToast("家庭创建成功！", "success");
    } else {
      errorMsg.value = authStore.error.value || "创建失败，请重试";
    }
  } catch (e) {
    errorMsg.value = NETWORK_ERROR_DEFAULT;
  } finally {
    isLoading.value = false;
  }
}

function copyCode() {
  if (createdInviteCode.value) {
    uni.setClipboardData({
      data: createdInviteCode.value,
      success() {
        showToast("邀请码已复制", "success");
      },
    });
  }
}

function goHome() {
  // 根据角色跳转到对应的首页
  // 注意：parent/child 首页尚未配置为 tabBar 页面，使用 reLaunch 替换整个页面栈
  if (authStore.isParent) {
    uni.reLaunch({ url: "/pages/parent/home/index" });
  } else {
    uni.reLaunch({ url: "/pages/child/home/index" });
  }
}
</script>

<style lang="scss" scoped>
.create-family-page {
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
    ellipse at 50% 30%,
    rgba(106, 214, 255, 0.1) 0%,
    transparent 60%
  );
}

.scroll-area {
  height: 100vh;
  padding: 0 32rpx;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60rpx;
  margin-bottom: 48rpx;
}

.hero-emoji {
  font-size: 72rpx;
  margin-bottom: 24rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 800;
  color: $text-primary;
  text-align: center;
  margin-bottom: 8rpx;
}

.hero-desc {
  font-size: 24rpx;
  color: $text-secondary;
  text-align: center;
}

.form-card {
  padding: 40rpx 32rpx;
  background: rgba(22, 23, 46, 0.85);
  border-radius: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.35);
}

.input-group {
  margin-bottom: 32rpx;
}

.input-label {
  display: block;
  margin-bottom: 8rpx;
  margin-left: 8rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: $accent-cyan;
  letter-spacing: 1rpx;
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

.error-tip {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8rpx;
  margin-bottom: 16rpx;
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

.create-btn {
  display: flex;
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

.success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx;
}

.success-emoji {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.success-title {
  font-size: 40rpx;
  font-weight: 800;
  color: $text-primary;
  margin-bottom: 48rpx;
}

.invite-code-card {
  width: 100%;
  padding: 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  border: 2rpx solid rgba(106, 214, 255, 0.2);
  margin-bottom: 48rpx;
}

.invite-code-label {
  display: block;
  font-size: 20rpx;
  font-weight: 600;
  color: $text-secondary;
  letter-spacing: 1rpx;
  margin-bottom: 16rpx;
  text-align: center;
}

.invite-code-value {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.invite-code-text {
  font-size: 48rpx;
  font-weight: 800;
  color: $accent-cyan;
  letter-spacing: 8rpx;
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;
  padding: 8rpx;
  background: rgba(106, 214, 255, 0.1);
  border-radius: 8rpx;
}

.copy-btn__icon {
  font-size: 28rpx;
}

.invite-code-hint {
  font-size: 22rpx;
  color: $text-secondary;
  text-align: center;
  line-height: 1.6;
}

.enter-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  background: $accent-orange;
  border-radius: 44rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 53, 0.3);
  transition: transform 0.15s ease;

  &:active {
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
</style>
