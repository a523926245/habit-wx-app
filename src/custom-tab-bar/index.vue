<!-- 自定义底部导航栏（替代微信小程序原生 tabBar）
  根据 authStore.user.role 动态显示家长端或孩子端的 tab 项 -->
<template>
  <view class="custom-tab-bar">
    <view
      v-for="(tab, index) in visibleTabs"
      :key="tab.pagePath"
      class="custom-tab-bar__item"
      :class="{ 'is-active': currentIndex === index }"
      @tap="onTabTap(index)"
    >
      <image
        class="custom-tab-bar__icon"
        :src="currentIndex === index ? tab.selectedIconPath : tab.iconPath"
        mode="aspectFit"
      />
      <text class="custom-tab-bar__text">{{ tab.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { activeTabIndex } from "@/utils/tab-state";

const authStore = useAuthStore();

// 直接引用模块级共享 ref，所有 custom-tab-bar 实例共享同一个对象
const currentIndex = activeTabIndex;

// 所有 tab 配置（家长端 + 孩子端合并）
const allTabs = computed(() => {
  const role = authStore.user.value?.role;
  if (role === "parent") {
    return parentTabs;
  }
  return childTabs;
});

const visibleTabs = computed(() => allTabs.value);

// 家长端 tab
const parentTabs = [
  {
    pagePath: "/pages/parent/home/index",
    text: "主页",
    iconPath: "/static/tab/home.png",
    selectedIconPath: "/static/tab/home-active.png",
  },
  {
    pagePath: "/pages/parent/battle/index",
    text: "战斗",
    iconPath: "/static/tab/battle.png",
    selectedIconPath: "/static/tab/battle-active.png",
  },
  {
    pagePath: "/pages/parent/rank/index",
    text: "排行",
    iconPath: "/static/tab/rank.png",
    selectedIconPath: "/static/tab/rank-active.png",
  },
  {
    pagePath: "/pages/parent/profile/index",
    text: "我的",
    iconPath: "/static/tab/profile.png",
    selectedIconPath: "/static/tab/profile-active.png",
  },
];

// 孩子端 tab
const childTabs = [
  {
    pagePath: "/pages/child/home/index",
    text: "主页",
    iconPath: "/static/tab/home.png",
    selectedIconPath: "/static/tab/home-active.png",
  },
  {
    pagePath: "/pages/child/battle/index",
    text: "战斗",
    iconPath: "/static/tab/battle.png",
    selectedIconPath: "/static/tab/battle-active.png",
  },
  {
    pagePath: "/pages/child/rank/index",
    text: "排行",
    iconPath: "/static/tab/rank.png",
    selectedIconPath: "/static/tab/rank-active.png",
  },
  {
    pagePath: "/pages/child/shop/index",
    text: "商城",
    iconPath: "/static/tab/shop.png",
    selectedIconPath: "/static/tab/shop-active.png",
  },
  {
    pagePath: "/pages/child/profile/index",
    text: "我的",
    iconPath: "/static/tab/profile.png",
    selectedIconPath: "/static/tab/profile-active.png",
  },
];

function onTabTap(index: number) {
  if (index === currentIndex.value) return;
  const tab = allTabs.value[index];
  if (!tab) return;

  // 写入共享 ref，所有页面的 tab bar 实例都会响应式更新
  currentIndex.value = index;
  uni.switchTab({ url: tab.pagePath });
}
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: $bg-secondary;
  border-top: 1rpx solid $border-subtle;
  z-index: 9999;
}

.custom-tab-bar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  height: 100%;
  transition: all 0.2s ease;

  &.is-active {
    .custom-tab-bar__text {
      color: $accent-cyan;
      font-weight: 700;
    }
  }
}

.custom-tab-bar__icon {
  width: 44rpx;
  height: 44rpx;
  opacity: 0.6;
}

.is-active .custom-tab-bar__icon {
  opacity: 1;
}

.custom-tab-bar__text {
  font-size: 20rpx;
  color: $text-secondary;
  transition: color 0.2s ease;
}
</style>
