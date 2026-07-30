<template>
  <view class="splash-page">
    <!-- 背景装饰 -->
    <view class="bg-layer bg-cyan" />
    <view class="bg-layer bg-orange" />

    <view class="splash-content">
      <text class="splash-logo">⚔️</text>
      <text class="splash-title">勇者乐园</text>
      <view class="splash-loader" />
      <text class="splash-hint">正在加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

/**
 * 启动页加载逻辑
 * 初始化认证状态，根据登录状态跳转到对应页面
 */
onLoad(async () => {
  // 初始化认证状态（含 token 验证）
  await authStore.init();

  // 根据登录状态和角色跳转
  if (authStore.isLoggedIn) {
    const role = authStore.user.value?.role;
    const hasFamily = authStore.hasFamily;

    if (role === "parent") {
      if (hasFamily) {
        // 家长端：跳转 tabBar 首页
        uni.switchTab({ url: "/pages/parent/home/index" });
      } else {
        // 家长端：无家庭，跳转选择家庭页
        uni.redirectTo({ url: "/pages/family/choose-family/index" });
      }
    } else if (role === "child") {
      if (hasFamily) {
        // 孩子端：跳转 tabBar 首页
        uni.switchTab({ url: "/pages/child/home/index" });
      } else {
        // 孩子端：无家庭，跳转选择家庭页
        uni.redirectTo({ url: "/pages/family/choose-family/index" });
      }
    } else {
      // 未知角色，跳转登录页
      uni.redirectTo({ url: "/pages/login/login" });
    }
  } else {
    // 未登录，跳转登录页
    uni.redirectTo({ url: "/pages/login/login" });
  }
});
</script>

<style lang="scss" scoped>
.splash-page {
  position: relative;
  min-height: 100vh;
  background: $bg-primary;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.splash-logo {
  font-size: 96rpx;
  line-height: 1;
}

.splash-title {
  font-size: 44rpx;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: 2rpx;
}

.splash-loader {
  width: 48rpx;
  height: 48rpx;
  margin-top: 16rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.15);
  border-top-color: $accent-cyan;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.splash-hint {
  font-size: 22rpx;
  color: $text-disabled;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
