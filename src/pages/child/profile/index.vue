<!-- 孩子个人资料页面 -->
<template>
  <view class="child-profile-page">
    <scroll-view scroll-y class="page-scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 角色头像 -->
      <view class="profile-avatar">
        <view class="profile-avatar__circle" @tap="showAvatarPicker">
          <image
            v-if="avatar"
            :src="avatar"
            class="profile-avatar__image"
            mode="aspectFill"
          />
          <text v-else class="profile-avatar__text">{{ avatarLetter }}</text>
        </view>
        <view class="profile-avatar__badge" @tap="showAvatarPicker">
          <text class="profile-avatar__badge-icon">📷</text>
        </view>
      </view>

      <!-- 昵称编辑 -->
      <view class="profile-nickname" @tap="showNicknameDialog">
        <text class="profile-nickname__text">{{ nickname }}</text>
        <text class="profile-nickname__edit">✏️</text>
      </view>

      <!-- 段位 -->
      <view class="profile-tier">
        <text class="profile-tier__text">{{ rankTierText }}</text>
      </view>

      <!-- 统计卡片 -->
      <view class="stats-grid">
        <view class="stats-grid__item" @tap="goCoins">
          <text class="stats-grid__icon">💰</text>
          <text class="stats-grid__value">{{ coins }}</text>
          <text class="stats-grid__label">金币</text>
        </view>
        <view class="stats-grid__item">
          <text class="stats-grid__icon">🏆</text>
          <text class="stats-grid__value">{{ rankScore }}</text>
          <text class="stats-grid__label">积分</text>
        </view>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-section">
        <text class="menu-section__title">英雄成长志</text>
        <view class="menu-list">
          <view class="menu-item" @tap="goCoins">
            <text class="menu-item__icon">💰</text>
            <text class="menu-item__text">金币明细</text>
            <text class="menu-item__arrow">›</text>
          </view>
          <view class="menu-item" @tap="goRedemptions">
            <text class="menu-item__icon">🎁</text>
            <text class="menu-item__text">兑换记录</text>
            <text class="menu-item__arrow">›</text>
          </view>
          <view class="menu-item" @tap="goCheckin">
            <text class="menu-item__icon">📅</text>
            <text class="menu-item__text">签到日历</text>
            <text class="menu-item__arrow">›</text>
          </view>
          <view class="menu-item" @tap="goMagicBox">
            <text class="menu-item__icon">🎡</text>
            <text class="menu-item__text">我的扭蛋</text>
            <text class="menu-item__arrow">›</text>
          </view>
          <view class="menu-item" @tap="goVouchers">
            <text class="menu-item__icon">🎫</text>
            <text class="menu-item__text">我的兑换券</text>
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
import { EMOJI_OPTIONS, getRankTierLabel } from "@/config/game";
import { useAuthStore } from "@/stores/auth";
import { showToast } from "@/utils/toast";
import { chooseImage } from "@/utils/image";
import http from "@/api/request";

const authStore = useAuthStore();

const isRefreshing = ref(false);
const uploading = ref(false);

const user = computed(() => authStore.user.value);
const nickname = computed(() => user.value?.nickname || "");
const coins = computed(() => user.value?.coins ?? 0);
const rankScore = computed(() => user.value?.rankScore ?? 0);
const rankTier = computed(() => user.value?.rankTier || "bronze");
const avatar = computed(() => user.value?.avatar);

const avatarLetter = computed(() => {
  if (avatar.value) return "";
  const n = nickname.value;
  return n ? n.charAt(0).toUpperCase() : "?";
});

const rankTierText = computed(() => {
  return getRankTierLabel(rankTier.value);
});

/** 头像选择器：拍照 / 相册 / Emoji */
function showAvatarPicker() {
  uni.showActionSheet({
    itemList: ["拍照", "从相册选择", "使用Emoji"],
    success: async (res) => {
      if (res.tapIndex === 0 || res.tapIndex === 1) {
        // 拍照或相册
        await handleUploadAvatar();
      } else if (res.tapIndex === 2) {
        // Emoji
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
    itemList: EMOJI_OPTIONS.slice(0, 10),
    success(res) {
      showToast("头像已更换", "success");
    },
  });
}

// 昵称编辑
function showNicknameDialog() {
  uni.showModal({
    title: "修改昵称",
    content: nickname.value,
    editable: true,
    success(res) {
      if (res.confirm && res.content) {
        handleRename(res.content.trim());
      }
    },
  });
}

async function handleRename(newName: string) {
  if (!newName) {
    showToast("昵称不能为空", "warning");
    return;
  }
  try {
    const result = await authStore.updateProfile?.(newName);
    if (result !== false) {
      showToast("昵称已更新", "success");
    }
  } catch {
    showToast("更新失败", "error");
  }
}

// 退出登录
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

// 页面跳转
function goCoins() {
  uni.navigateTo({ url: "/pages/coins/index" });
}

function goRedemptions() {
  uni.navigateTo({ url: "/pages/shop/redemptions/index" });
}

function goCheckin() {
  uni.navigateTo({ url: "/pages/checkin-calendar/index" });
}

function goMagicBox() {
  uni.navigateTo({ url: "/pages/magic-box/index" });
}

function goVouchers() {
  uni.navigateTo({ url: "/pages/voucher/index" });
}

async function onRefresh() {
  isRefreshing.value = true;
  try {
    await authStore.refreshUser();
  } catch {
    showToast("刷新失败", "error");
  } finally {
    isRefreshing.value = false;
  }
}

onMounted(() => {
  // 可以在这里加载更多数据
});
</script>

<style lang="scss" scoped>
.child-profile-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-scroll {
  height: 100vh;
  padding-bottom: 100rpx;
}

/* ===== 头像 ===== */
.profile-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0 20rpx;
}

.profile-avatar__circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 120rpx;
  background: rgba($accent-cyan, 0.15);
  border-radius: 50%;
  border: 4rpx solid rgba($accent-cyan, 0.3);
  overflow: hidden;
}

.profile-avatar__image {
  width: 100%;
  height: 100%;
}

.profile-avatar__text {
  font-size: 56rpx;
  font-weight: 700;
  color: $accent-cyan;
}

.profile-avatar__badge {
  position: absolute;
  bottom: 20rpx;
  right: calc(50% - 70rpx);
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border-radius: 50%;
  border: 2rpx solid rgba($accent-cyan, 0.5);
}

.profile-avatar__badge-icon {
  font-size: 20rpx;
}

/* ===== 昵称 ===== */
.profile-nickname {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
}

.profile-nickname__text {
  font-size: 36rpx;
  font-weight: 800;
  color: $text-primary;
  margin-right: 12rpx;
}

.profile-nickname__edit {
  font-size: 28rpx;
}

/* ===== 段位 ===== */
.profile-tier {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 0 24rpx;
}

.profile-tier__text {
  font-size: 24rpx;
  font-weight: 600;
  color: $accent-gold;
}

/* ===== 统计网格 ===== */
.stats-grid {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  padding: 0 32rpx;
  margin-bottom: 32rpx;
}

.stats-grid__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background: $bg-card;
  border-radius: 20rpx;
  border: 2rpx solid $border-subtle;
}

.stats-grid__icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.stats-grid__value {
  font-size: 32rpx;
  font-weight: 800;
  color: $accent-cyan;
  margin-bottom: 4rpx;
}

.stats-grid__label {
  font-size: 22rpx;
  color: $text-secondary;
}

/* ===== 菜单区 ===== */
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
    background: rgba($accent-cyan, 0.05);
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

/* ===== 退出登录 ===== */
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
