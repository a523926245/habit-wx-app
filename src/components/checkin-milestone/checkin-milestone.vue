<!-- 签到里程碑组件 -->
<template>
  <view class="checkin-card">
    <!-- 连续签到 -->
    <view class="checkin-card__header">
      <text class="checkin-card__streak">
        🔥 连续签到 <text class="checkin-card__streak-num">{{ streak }}</text> 天
      </text>
    </view>

    <!-- 里程碑时间线 -->
    <view class="checkin-card__milestones">
      <view
        v-for="(milestone, index) in milestones"
        :key="index"
        class="checkin-card__milestone"
        :class="{ 'is-unlocked': isUnlocked(milestone.percent) }"
      >
        <view class="checkin-card__milestone-node">
          <text v-if="isUnlocked(milestone.percent)" class="checkin-card__milestone-check">
            ✓
          </text>
          <text v-else class="checkin-card__milestone-lock">🔒</text>
        </view>

        <!-- 连接线 -->
        <view
          v-if="index < milestones.length - 1"
          class="checkin-card__milestone-line"
          :class="{ 'is-unlocked': isUnlocked(milestones[index + 1].percent) }"
        />

        <view class="checkin-card__milestone-info">
          <text class="checkin-card__milestone-percent">{{ milestone.percent * 100 }}%</text>
          <text class="checkin-card__milestone-coins">+{{ milestone.coins }} 💰</text>
        </view>
      </view>
    </view>

    <!-- 下一目标提示 -->
    <view v-if="nextTarget" class="checkin-card__next-target">
      <text class="checkin-card__next-text">
        下一个目标: 完成 {{ nextTarget }} 可获 {{ nextTargetCoins }} 金币
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface CheckinMilestone {
  percent: number;
  coins: number;
  title: string;
}

export interface CheckinCardProps {
  streak: number;
  milestones: CheckinMilestone[];
  completionRate: number; // 0-1
}

const props = defineProps<CheckinCardProps>();

function isUnlocked(percent: number): boolean {
  return props.completionRate >= percent;
}

const nextTarget = computed(() => {
  const next = props.milestones.find((m) => !isUnlocked(m.percent));
  return next ? `${Math.ceil(next.percent * 100)}%` : "";
});

const nextTargetCoins = computed(() => {
  const next = props.milestones.find((m) => !isUnlocked(m.percent));
  return next ? next.coins : 0;
});
</script>

<style lang="scss" scoped>
.checkin-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: $bg-card;
  border-radius: 24rpx;
  border: 2rpx solid $border-subtle;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.checkin-card__header {
  margin-bottom: 20rpx;
}

.checkin-card__streak {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
}

.checkin-card__streak-num {
  font-size: 32rpx;
  font-weight: 800;
  color: $accent-orange;
}

.checkin-card__milestones {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
}

.checkin-card__milestone {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.checkin-card__milestone-node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  background: rgba($text-secondary, 0.2);
  border-radius: 50%;
  border: 2rpx solid $border-subtle;
}

.checkin-card__milestone-check {
  font-size: 20rpx;
  color: $accent-green;
  font-weight: 700;
}

.checkin-card__milestone-lock {
  font-size: 20rpx;
}

.checkin-card__milestone-line {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  width: 100rpx;
  height: 2rpx;
  background: $border-subtle;
  z-index: 0;
}

.checkin-card__milestone-line.is-unlocked {
  background: $accent-green;
}

.checkin-card__milestone-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8rpx;
}

.checkin-card__milestone-percent {
  font-size: 18rpx;
  font-weight: 600;
  color: $text-secondary;
}

.checkin-card__milestone-coins {
  font-size: 16rpx;
  color: $accent-gold;
}

.checkin-card__next-target {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-subtle;
}

.checkin-card__next-text {
  font-size: 22rpx;
  color: $accent-cyan;
}
</style>
