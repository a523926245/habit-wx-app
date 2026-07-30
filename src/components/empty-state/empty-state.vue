<!-- 空状态组件 -->
<template>
  <view class="app-empty">
    <text class="app-empty__emoji">{{ emoji }}</text>
    <text class="app-empty__title">{{ title }}</text>
    <text v-if="description" class="app-empty__desc">{{ description }}</text>
    <view v-if="showAction" class="app-empty__action">
      <slot name="action" />
    </view>
  </view>
</template>

<script setup lang="ts">
export interface AppEmptyProps {
  emoji?: string;
  title: string;
  description?: string;
  showAction?: boolean;
}

withDefaults(defineProps<AppEmptyProps>(), {
  emoji: "📭",
  title: "",
  description: "",
  showAction: false,
});
</script>

<style lang="scss" scoped>
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.app-empty__emoji {
  font-size: 96rpx;
  margin-bottom: 24rpx;
  opacity: 0.6;
}

.app-empty__title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 8rpx;
}

.app-empty__desc {
  font-size: 24rpx;
  color: $text-disabled;
  text-align: center;
  margin-bottom: 24rpx;
}

.app-empty__action {
  margin-top: 16rpx;
}
</style>
