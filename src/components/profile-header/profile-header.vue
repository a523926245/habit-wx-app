<!-- 用户信息头组件 -->
<template>
  <view class="profile-header">
    <!-- 头像 -->
    <view class="profile-header__avatar">
      <text class="profile-header__avatar-text">{{ avatarLetter }}</text>
    </view>

    <!-- 用户信息 -->
    <view class="profile-header__info">
      <text class="profile-header__nickname">{{ nickname }}</text>
      <text v-if="familyName" class="profile-header__family">
        {{ familyName }}
      </text>
    </view>

    <!-- 统计数据行 -->
    <view class="profile-header__stats">
      <view class="profile-header__stat-item">
        <text class="profile-header__stat-value">{{ coins }}</text>
        <text class="profile-header__stat-label">💰 金币</text>
      </view>
      <view class="profile-header__stat-divider" />
      <view class="profile-header__stat-item">
        <text class="profile-header__stat-value">{{ rankTier }}</text>
        <text class="profile-header__stat-label">段位</text>
      </view>
      <view class="profile-header__stat-divider" />
      <view class="profile-header__stat-item">
        <text class="profile-header__stat-value">{{ streak }}</text>
        <text class="profile-header__stat-label">连续签到</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface ProfileHeaderProps {
  nickname: string;
  familyName?: string;
  coins: number;
  rankTier: string;
  streak: number;
  avatarLetter?: string;
}

const props = withDefaults(defineProps<ProfileHeaderProps>(), {
  familyName: "",
  rankTier: "青铜",
  streak: 0,
  avatarLetter: "",
});

const avatarLetter = computed(() => {
  if (props.avatarLetter) return props.avatarLetter;
  return props.nickname.charAt(0);
});
</script>

<style lang="scss" scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: $bg-card;
  border-radius: 24rpx;
  border: 2rpx solid $border-subtle;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.profile-header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 16rpx;
  background: rgba($accent-cyan, 0.15);
  border-radius: 50%;
  border: 3rpx solid rgba($accent-cyan, 0.3);
}

.profile-header__avatar-text {
  font-size: 40rpx;
}

.profile-header__info {
  margin-bottom: 20rpx;
}

.profile-header__nickname {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.profile-header__family {
  display: block;
  font-size: 22rpx;
  color: $text-secondary;
}

.profile-header__stats {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-subtle;
}

.profile-header__stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-header__stat-value {
  font-size: 28rpx;
  font-weight: 700;
  color: $accent-cyan;
  margin-bottom: 4rpx;
}

.profile-header__stat-label {
  font-size: 20rpx;
  color: $text-secondary;
}

.profile-header__stat-divider {
  width: 1rpx;
  height: 40rpx;
  background: $border-subtle;
}
</style>
