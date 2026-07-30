<!-- 家长个人资料页面 -->
<template>
  <view class="parent-profile-page">
    <scroll-view scroll-y class="page-scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 用户信息 -->
      <view class="profile-info">
        <view class="profile-info__avatar" @tap="showAvatarPicker">
          <view class="profile-info__avatar-circle">
            <image
              v-if="avatar"
              :src="avatar"
              class="profile-info__avatar-image"
              mode="aspectFill"
            />
            <text v-else class="profile-info__avatar-text">{{ avatarLetter }}</text>
          </view>
          <view class="profile-info__avatar-badge">
            <text class="profile-info__avatar-badge-icon">📷</text>
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
import { showToast } from "@/utils/toast";
import { chooseImage } from "@/utils/image";
import http from "@/api/request";

const authStore = useAuthStore();
const isRefreshing = ref(false);
const uploading = ref(false);

const user = computed(() => authStore.user.value);
const nickname = computed(() => user.value?.nickname || "");
const avatar = computed(() => user.value?.avatar);

const avatarLetter = computed(() => {
  if (avatar.value) return "";
  const n = nickname.value;
  return n ? n.charAt(0).toUpperCase() : "?";
});

/** 头像选择器：拍照 / 相册 / Emoji */
function showAvatarPicker() {
  uni.showActionSheet({
    itemList: ["拍照", "从相册选择", "使用Emoji"],
    success: async (res) => {
      if (res.tapIndex === 0 || res.tapIndex === 1) {
        await handleUploadAvatar();
      } else if (res.tapIndex === 2) {
        showEmojiPicker();
      }
    },
  });
}

/** 选择并上传头像图片 */
async function handleUploadAvatar() {
  const filePath = await chooseImage();
  if (!filePath) return;

  uploading.value = true;
  uni.showLoading({ title: "上传中..." });

  try {
    const result = await http.upload<{ avatar: string }>(
      "/auth/avatar",
      filePath,
      "avatar"
    );

    if (result.success && result.data) {
      authStore.updateAvatar(result.data.avatar);
      showToast("头像已更新", "success");
    } else {
      showToast(result.error || "上传失败", "error");
    }
  } catch {
    showToast("上传异常", "error");
  } finally {
    uploading.value = false;
    uni.hideLoading();
  }
}

/** Emoji 头像选择 */
function showEmojiPicker() {
  uni.showActionSheet({
    itemList: ["😀", "😎", "🥳", "🤩", "💀", "🤖", "👾", "🦸", "🧙", "🦹"],
    success() {
      showToast("头像已更换", "success");
    },
  });
}

function go(url: string) {
  uni.navigateTo({ url });
}

function goCoins() {
  uni.navigateTo({ url: "/pages/coins/index" });
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
    position: relative;
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
    overflow: hidden;
  }

  &__avatar-image {
    width: 100%;
    height: 100%;
  }

  &__avatar-text {
    font-size: 40rpx;
    font-weight: 700;
    color: $accent-orange;
  }

  &__avatar-badge {
    position: absolute;
    bottom: 0;
    right: -4rpx;
    width: 32rpx;
    height: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-card;
    border-radius: 50%;
    border: 2rpx solid rgba($accent-orange, 0.5);
  }

  &__avatar-badge-icon {
    font-size: 16rpx;
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
