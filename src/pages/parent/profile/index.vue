<!-- 家长个人资料页面 -->
<template>
  <view class="parent-profile-page">
    <scroll-view scroll-y class="page-scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 用户信息 -->
      <view class="profile-info">
        <view class="profile-info__avatar">
          <view class="profile-info__avatar-circle">
            <text class="profile-info__avatar-text">{{ avatarLetter }}</text>
          </view>
        </view>
        <view class="profile-info__detail">
          <text class="profile-info__nickname">{{ nickname }}</text>
          <text class="profile-info__role">👨‍💼 家长</text>
        </view>
      </view>

      <!-- 管理菜单 -->
      <view class="menu-section">
        <text class="menu-section__title">管理中心</text>
        <view class="menu-list">
          <view class="menu-item" @tap="go('/pages/cards/manage/index')">
            <text class="menu-item__icon">🎴</text>
            <text class="menu-item__text">卡牌管理</text>
            <text class="menu-item__arrow">›</text>
          </view>
          <view class="menu-item" @tap="go('/pages/boss-manage/index')">
            <text class="menu-item__icon">⚔️</text>
            <text class="menu-item__text">BOSS管理</text>
            <text class="menu-item__arrow">›</text>
          </view>
          <view class="menu-item" @tap="go('/pages/pending/index')">
            <text class="menu-item__icon">✅</text>
            <text class="menu-item__text">我的待办</text>
            <text class="menu-item__arrow">›</text>
          </view>
          <view class="menu-item" @tap="go('/pages/family-manage/index')">
            <text class="menu-item__icon">👨‍👩‍👧‍👦</text>
            <text class="menu-item__text">家庭管理</text>
            <text class="menu-item__arrow">›</text>
          </view>
          <view class="menu-item" @tap="goCoins">
            <text class="menu-item__icon">💰</text>
            <text class="menu-item__text">金币明细</text>
            <text class="menu-item__arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-section">
        <button class="logout-btn" @tap="handleLogout">退出当前账号</button>
      </view>

      <!-- 占位，防止内容被固定底部导航遮挡 -->
    </scroll-view>

    <!-- 自定义底部导航栏 -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import CustomTabBar from "@/custom-tab-bar/index.vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const isRefreshing = ref(false);

const user = computed(() => authStore.user.value);
const nickname = computed(() => user.value?.nickname || "");

const avatarLetter = computed(() => {
  const n = nickname.value;
  return n ? n.charAt(0).toUpperCase() : "?";
});

function go(url: string) {
  uni.navigateTo({ url });
}

function handleLogout() {
  uni.showModal({
    title: "确认退出",
    content: "确定要退出当前账号吗？",
    success(res) {
      if (res.confirm) {
        authStore.logout();
        uni.reLaunch({ url: "/pages/login/login" });
      }
    },
  });
}

async function onRefresh() {
  isRefreshing.value = true;
  try {
    await authStore.refreshUser();
  } finally {
    isRefreshing.value = false;
  }
}

onMounted(() => {});
</script>

<style lang="scss" scoped>
.parent-profile-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-scroll {
  height: 100vh;
}

/* ===== 用户信息（头像 + 昵称左右布局） ===== */
.profile-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 32rpx 32rpx;
  margin-bottom: 32rpx;

  &__avatar {
    flex-shrink: 0;
  }

  &__avatar-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88rpx;
    height: 88rpx;
    background: rgba($accent-orange, 0.15);
    border-radius: 50%;
    border: 3rpx solid rgba($accent-orange, 0.3);
  }

  &__avatar-text {
    font-size: 40rpx;
    font-weight: 700;
    color: $accent-orange;
  }

  &__detail {
    display: flex;
    flex-direction: column;
    margin-left: 32rpx;
  }

  &__nickname {
    font-size: 36rpx;
    font-weight: 800;
    color: $text-primary;
  }

  &__role {
    font-size: 24rpx;
    font-weight: 600;
    color: $accent-orange;
    margin-top: 6rpx;
  }
}

/* ===== 菜单 ===== */
.menu-section {
  padding: 0 32rpx;
}

.menu-section__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 32rpx;
}

.menu-list {
  display: flex;
  flex-direction: column;
  background: $bg-card;
  border-radius: 20rpx;
  border: 2rpx solid $border-subtle;
  overflow: hidden;
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid $border-subtle;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: rgba($accent-orange, 0.05);
  }

  &__icon {
    font-size: 36rpx;
    margin-right: 20rpx;
  }

  &__text {
    flex: 1;
    font-size: 28rpx;
    color: $text-primary;
  }

  &__arrow {
    font-size: 32rpx;
    color: $text-disabled;
  }
}

/* ===== 退出 ===== */
.logout-section {
  padding: 40rpx 32rpx;
}

.logout-btn {
  width: 100%;
  padding: 20rpx 0;
  font-size: 28rpx;
  text-align: center;
  color: $accent-red;
  background: rgba($accent-red, 0.1);
  border-radius: 16rpx;
  border: 1rpx solid rgba($accent-red, 0.2);
}

.bottom-safe {
  height: 0;
}
</style>
