<!-- 系统配置 - 配置入口页面 -->
<template>
  <view class="settings">
    <scroll-view scroll-y class="settings__scroll">
      <view class="settings__items">
        <view
          v-for="item in menuItems"
          :key="item.url"
          class="settings__item"
          @tap="goTo(item.url)"
        >
          <view class="settings__item-icon" :style="{ borderColor: item.color + '40' }">
            <text class="settings__item-icon-text" :style="{ color: item.color }">{{ item.icon }}</text>
          </view>
          <view class="settings__item-info">
            <text class="settings__item-name">{{ item.label }}</text>
            <text class="settings__item-desc">{{ item.desc }}</text>
          </view>
          <text class="settings__item-arrow">›</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
/** 菜单项配置 */
const menuItems = [
  {
    icon: "📅",
    label: "签到配置",
    desc: "设置签到里程碑奖励",
    url: "/pages/settings/checkin-config",
    color: "#00b894",
  },
  {
    icon: "⚔️",
    label: "BOSS等级",
    desc: "配置BOSS难度系数",
    url: "/pages/settings/boss-levels",
    color: "#e74c3c",
  },
  {
    icon: "🔥",
    label: "连击加成",
    desc: "设置连续签到加成比例",
    url: "/pages/settings/combo-config",
    color: "#ff6b35",
  },
  {
    icon: "🏅",
    label: "段位配置",
    desc: "管理段位名称和积分门槛",
    url: "/pages/settings/rank-tiers",
    color: "#a855f7",
  },
  {
    icon: "🎡",
    label: "扭蛋配置",
    desc: "配置扭蛋品级和概率",
    url: "/pages/settings/gacha-config",
    color: "#6ad6ff",
  },
];

/** 跳转页面 */
function goTo(url: string) {
  uni.navigateTo({ url });
}
</script>

<style lang="scss" scoped>
.settings {
  min-height: 100vh;
  background: $bg-primary;

  &__scroll {
    height: 100vh;
  }

  &__items {
    padding: 32rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 28rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
  }

  &__item-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: $bg-surface;
  }

  &__item-icon-text {
    font-size: 40rpx;
  }

  &__item-info {
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
  }

  &__item-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
    display: block;
  }

  &__item-desc {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__item-arrow {
    font-size: 32rpx;
    color: $text-secondary;
    flex-shrink: 0;
  }
}
</style>
