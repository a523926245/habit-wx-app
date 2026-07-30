<!-- 任务卡片组件 -->
<template>
  <view
    class="task-card"
    :class="[`status-${status}`, { 'is-clickable': clickable }]"
    @tap="handleTap"
  >
    <!-- 左侧表情图标 -->
    <view class="task-card__icon">
      <text class="task-card__emoji">{{ emoji }}</text>
    </view>

    <!-- 中间内容区 -->
    <view class="task-card__content">
      <text class="task-card__title">{{ title }}</text>
      <view v-if="rewardInfo" class="task-card__reward">
        <text class="task-card__reward-text">+{{ rewardInfo.coins }} 💰</text>
        <text v-if="rewardInfo.damage" class="task-card__reward-text task-card__reward-text--damage">
          +{{ rewardInfo.damage }} ⚔️
        </text>
      </view>
    </view>

    <!-- 右侧状态徽章 -->
    <view class="task-card__badge">
      <text class="task-card__badge-text" :class="badgeClass">{{ badgeText }}</text>
    </view>

    <!-- 提交/撤回按钮（仅 submitted/rejected 状态） -->
    <view v-if="status === 'submitted'" class="task-card__action">
      <button class="task-card__btn task-card__btn--secondary" @tap.stop="handleRetract">
        撤回
      </button>
    </view>
    <view v-if="status === 'rejected'" class="task-card__action">
      <button class="task-card__btn task-card__btn--primary" @tap.stop="handleResubmit">
        重新提交
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface TaskCardProps {
  emoji: string;
  title: string;
  coinReward: number;
  bossDamage?: number;
  status: "pending" | "submitted" | "approved" | "rejected";
  clickable?: boolean;
}

const props = withDefaults(defineProps<TaskCardProps>(), {
  emoji: "⭐",
  title: "",
  coinReward: 0,
  bossDamage: 0,
  clickable: false,
});

const emit = defineEmits<{
  tap: [assignmentId: number];
  retract: [assignmentId: number];
  resubmit: [assignmentId: number];
}>();

// 状态徽章文本
const badgeText = computed(() => {
  switch (props.status) {
    case "pending":
      return "待完成";
    case "submitted":
      return "审核中";
    case "approved":
      return "已通过";
    case "rejected":
      return "未通过";
  }
});

// 徽章样式类
const badgeClass = computed(() => {
  switch (props.status) {
    case "approved":
      return "is-approved";
    case "rejected":
      return "is-rejected";
    case "submitted":
      return "is-submitted";
    default:
      return "";
  }
});

// 奖励信息
const rewardInfo = computed(() => {
  if (props.coinReward > 0 || (props.bossDamage ?? 0) > 0) {
    return { coins: props.coinReward, damage: props.bossDamage };
  }
  return null;
});

function handleTap() {
  if (props.clickable) {
    emit("tap", 0); // assignmentId 由父组件传递
  }
}

function handleRetract() {
  emit("retract", 0);
}

function handleResubmit() {
  emit("resubmit", 0);
}
</script>

<style lang="scss" scoped>
.task-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
  background: $bg-card;
  border-radius: 20rpx;
  border: 2rpx solid $border-subtle;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &.is-clickable {
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }

  /* 状态边框色 */
  &.status-approved {
    border-color: rgba($accent-green, 0.4);
    box-shadow: 0 4rpx 16rpx rgba(0, 184, 148, 0.1);
  }
  &.status-rejected {
    border-color: rgba($accent-red, 0.4);
    box-shadow: 0 4rpx 16rpx rgba(255, 113, 108, 0.1);
  }
  &.status-submitted {
    border-color: rgba($accent-gold, 0.4);
    box-shadow: 0 4rpx 16rpx rgba(240, 220, 43, 0.1);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80rpx;
    height: 80rpx;
    flex-shrink: 0;
  }

  &__emoji {
    font-size: 48rpx;
  }

  &__content {
    flex: 1;
    min-width: 0;
    padding: 0 16rpx;
  }

  &__title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 6rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__reward {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12rpx;
  }

  &__reward-text {
    font-size: 22rpx;
    color: $accent-orange;
    font-weight: 500;
  }

  &__reward-text--damage {
    color: $accent-cyan;
  }

  &__badge {
    flex-shrink: 0;
    margin-left: 8rpx;
  }

  &__badge-text {
    display: inline-block;
    padding: 4rpx 16rpx;
    font-size: 22rpx;
    font-weight: 600;
    border-radius: 12rpx;
    background: rgba($text-secondary, 0.2);
    color: $text-secondary;

    &.is-approved {
      background: rgba($accent-green, 0.15);
      color: $accent-green;
    }

    &.is-rejected {
      background: rgba($accent-red, 0.15);
      color: $accent-red;
    }

    &.is-submitted {
      background: rgba($accent-gold, 0.15);
      color: $accent-gold;
    }
  }

  &__action {
    flex-shrink: 0;
    margin-left: 12rpx;
  }

  &__btn {
    padding: 8rpx 20rpx;
    font-size: 22rpx;
    font-weight: 600;
    border-radius: 12rpx;
    border: none;
    line-height: 1.4;

    &--primary {
      background: $accent-cyan;
      color: $bg-primary;
    }

    &--secondary {
      background: rgba($accent-orange, 0.15);
      color: $accent-orange;
    }
  }
}
</style>
