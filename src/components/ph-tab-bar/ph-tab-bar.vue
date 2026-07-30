<!-- 自定义 Tab 切换组件 -->
<template>
  <view class="custom-tab-bar">
    <view
      v-for="(tab, index) in tabs"
      :key="index"
      class="custom-tab-bar__item"
      :class="{ 'is-active': activeIndex === index }"
      @tap="handleTap(index)"
    >
      <text class="custom-tab-bar__text">{{ tab }}</text>
      <view v-if="activeIndex === index" class="custom-tab-bar__indicator" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

export interface CustomTabBarProps {
  tabs: string[];
  defaultIndex?: number;
}

const props = withDefaults(defineProps<CustomTabBarProps>(), {
  tabs: () => [],
  defaultIndex: 0,
});

const emit = defineEmits<{
  change: [index: number];
}>();

const activeIndex = ref(props.defaultIndex);

// 监听外部变化
watch(
  () => props.defaultIndex,
  (val) => {
    activeIndex.value = val;
  }
);

function handleTap(index: number) {
  if (index !== activeIndex.value) {
    activeIndex.value = index;
    emit("change", index);
  }
}
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8rpx;
  margin-bottom: 24rpx;
  background: rgba($bg-secondary, 0.8);
  border-radius: 16rpx;
  border: 1rpx solid $border-subtle;
}

.custom-tab-bar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.2s ease;
  position: relative;

  &.is-active {
    background: rgba($accent-cyan, 0.15);
    box-shadow: 0 0 12rpx rgba(106, 214, 255, 0.2);
  }
}

.custom-tab-bar__text {
  font-size: 26rpx;
  font-weight: 500;
  color: $text-secondary;
  transition: color 0.2s ease;

  .custom-tab-bar__item.is-active & {
    color: $accent-cyan;
    font-weight: 700;
  }
}

.custom-tab-bar__indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32rpx;
  height: 4rpx;
  background: $accent-cyan;
  border-radius: 2rpx;
  box-shadow: 0 0 8rpx rgba(106, 214, 255, 0.4);
}
</style>
