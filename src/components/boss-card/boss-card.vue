<!-- BOSS 卡片组件 -->
<template>
  <view class="boss-card" :class="{ 'is-defeated': defeated }">
    <!-- 状态徽章 -->
    <view class="boss-card__status-badge">
      <text class="boss-card__status-icon">{{ statusIcon }}</text>
      <text class="boss-card__status-text">{{ statusText }}</text>
    </view>

    <!-- 倒计时 -->
    <view v-if="remainingTime" class="boss-card__timer">
      <text class="boss-card__timer-text">⏰ {{ remainingTime }}</text>
    </view>

    <!-- BOSS 主体 -->
    <view class="boss-card__hero">
      <text class="boss-card__emoji">{{ bossEmoji }}</text>
    </view>

    <!-- BOSS 信息 -->
    <view class="boss-card__info">
      <view class="boss-card__title-row">
        <text class="boss-card__name">{{ name }}</text>
        <view v-if="difficulty" class="boss-card__difficulty-inline">
          <text class="boss-card__difficulty-inline-text">{{ difficulty }}</text>
        </view>
      </view>
      <text v-if="story" class="boss-card__story">{{ story }}</text>
    </view>

    <!-- HP 条 -->
    <view class="boss-card__hp">
      <view class="boss-card__hp-bar">
        <view
          class="boss-card__hp-fill"
          :style="{ width: hpPercent + '%', background: hpGradient }"
        />
      </view>
      <text class="boss-card__hp-text">{{ currentHp }} / {{ maxHp }}</text>
    </view>

    <!-- 攻击系数 -->
    <view v-if="attackRatio && attackRatio !== 1" class="boss-card__multiplier">
      <text class="boss-card__multiplier-text">×{{ attackRatio.toFixed(1) }}</text>
    </view>

    <!-- 击杀奖励 -->
    <view v-if="killRewardCoins" class="boss-card__kill-reward">
      <text class="boss-card__kill-reward-text">🎁 击杀奖励: {{ killRewardCoins }} 金币</text>
    </view>

  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface BossCardProps {
  name: string;
  emoji: string;
  currentHp: number;
  maxHp: number;
  status: "active" | "draft" | "defeated" | "expired";
  difficulty?: string;
  story?: string;
  attackRatio?: number;
  killRewardCoins?: number;
  endTime?: string;
}

const props = defineProps<BossCardProps>();

// 血量百分比
const hpPercent = computed(() => {
  if (props.maxHp <= 0) return 0;
  return Math.round((props.currentHp / props.maxHp) * 100);
});

// 是否被击败
const defeated = computed(() => props.status === "defeated");

// 状态文本和图标
const statusInfo = computed(() => {
  switch (props.status) {
    case "active":
      return { icon: "⚔️", text: "战斗中" };
    case "draft":
      return { icon: "📋", text: "草稿" };
    case "defeated":
      return { icon: "💀", text: "已击败" };
    case "expired":
      return { icon: "⏰", text: "已过期" };
    default:
      return { icon: "", text: "" };
  }
});

const statusIcon = computed(() => statusInfo.value.icon);
const statusText = computed(() => statusInfo.value.text);

// HP 条渐变色
const hpGradient = computed(() => {
  if (defeated.value) return 'linear-gradient(to right, #ff716c, #ff716c)';
  return 'linear-gradient(to right, #00b894, #6ad6ff)';
});

// 剩余时间
const remainingTime = computed(() => {
  if (!props.endTime || props.status !== "active") return "";
  try {
    const end = new Date(props.endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "已过期";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}天${hours}时`;
    if (hours > 0) return `${hours}时`;
    return `${Math.floor(diff / (1000 * 60))}分`;
  } catch {
    return "";
  }
});

const bossEmoji = computed(() => props.emoji || "🐉");
</script>

<style lang="scss" scoped>
.boss-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 24rpx;
  background: $bg-card;
  border-radius: 24rpx;
  overflow: hidden;

  &.is-defeated {
    border-color: rgba($accent-red, 0.3);
  }

  &__status-badge {
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 6rpx 16rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 12rpx;
  }

  &__status-icon {
    font-size: 20rpx;
    margin-right: 4rpx;
  }

  &__status-text {
    font-size: 20rpx;
    font-weight: 600;
    color: $text-primary;
  }

  &__timer {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
  }

  &__timer-text {
    font-size: 20rpx;
    color: $accent-gold;
  }

  &__hero {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
  }

  &__emoji {
    font-size: 120rpx;
    line-height: 1;
  }

  &__info {
    width: 100%;
    margin-bottom: 20rpx;
  }

  &__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    flex: 1;
    font-size: 32rpx;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 4rpx;
  }

  &__difficulty-inline {
    padding: 4rpx 16rpx;
    background: rgba(168, 85, 247, 0.8);
    border-radius: 8rpx;
    flex-shrink: 0;
    margin-left: 16rpx;
  }

  &__difficulty-inline-text {
    font-size: 20rpx;
    font-weight: 700;
    color: #fff;
  }

  &__story {
    display: block;
    font-size: 22rpx;
    color: $text-secondary;
    max-width: 500rpx;
  }

  &__hp {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-bottom: 12rpx;
  }

  &__hp-bar {
    flex: 1;
    height: 24rpx;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12rpx;
    overflow: hidden;
  }

  &__hp-fill {
    height: 100%;
    border-radius: 12rpx;
    transition: width 0.5s ease;
  }

  &__hp-text {
    font-size: 22rpx;
    font-weight: 600;
    color: $text-primary;
    margin-left: 12rpx;
    flex-shrink: 0;
  }

  &__multiplier {
    display: flex;
    align-items: center;
    padding: 4rpx 16rpx;
    background: rgba($accent-orange, 0.2);
    border-radius: 8rpx;
    margin-bottom: 8rpx;
  }

  &__multiplier-text {
    font-size: 22rpx;
    font-weight: 700;
    color: $accent-orange;
  }

  &__kill-reward {
    display: flex;
    justify-content: flex-start;
    margin-top: 8rpx;
  }

  &__kill-reward-text {
    font-size: 22rpx;
    color: $accent-gold;
  }
}

</style>
