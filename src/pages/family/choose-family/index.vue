<template>
  <view class="choose-family-page">
    <!-- 背景装饰 -->
    <view class="bg-layer bg-cyan" />
    <view class="bg-layer bg-orange" />

    <view class="container">
      <!-- 顶部图标 -->
      <view class="hero-icon">🏠</view>
      <text class="hero-title">开启你的</text>
      <text class="hero-accent">家庭</text>
      <text class="hero-title">征途</text>
      <text class="hero-desc">选择你的降临方式，集结你的冒险小队</text>

      <!-- 创建家庭按钮 -->
      <view class="neon-btn neon-btn--cyan" @tap="goCreate">
        <text class="neon-btn__icon">🏗️</text>
        <text class="neon-btn__text">创建家庭</text>
      </view>

      <!-- 加入家庭按钮 -->
      <view class="neon-btn neon-btn--orange" @tap="goJoin">
        <text class="neon-btn__icon">🤝</text>
        <text class="neon-btn__text">加入家庭</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
function goCreate() {
  uni.navigateTo({ url: "/pages/family/create-family/index" });
}

function goJoin() {
  uni.navigateTo({ url: "/pages/join-family/index" });
}
</script>

<style lang="scss" scoped>
.choose-family-page {
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
  font-size: 88rpx;
  margin-bottom: 24rpx;
}

.hero-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.hero-accent {
  font-size: 40rpx;
  font-weight: 800;
  font-style: italic;
  color: $accent-cyan;
  margin-right: 4rpx;
}

.hero-desc {
  margin-top: 12rpx;
  margin-bottom: 64rpx;
  font-size: 24rpx;
  color: $text-secondary;
  text-align: center;
  line-height: 1.6;
}

.neon-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 88rpx;
  margin-bottom: 24rpx;
  border-radius: 44rpx;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }

  &--cyan {
    background: $accent-cyan;
    box-shadow: 0 6rpx 20rpx rgba(106, 214, 255, 0.3);
  }

  &--orange {
    background: $accent-orange;
    box-shadow: 0 6rpx 20rpx rgba(255, 107, 53, 0.3);
  }

  &__icon {
    font-size: 32rpx;
    margin-right: 12rpx;
  }

  &__text {
    font-size: 30rpx;
    font-weight: 800;
    color: $bg-primary;
    letter-spacing: 2rpx;
  }
}
</style>
