<!-- 金币流水 - 查看金币收支明细 -->
<template>
  <view class="coins">
    <!-- 顶部统计 -->
    <view class="coins__summary">
      <view class="coins__summary-balance">
        <text class="coins__summary-label">当前余额</text>
        <text class="coins__summary-value"
          >💰 {{ summary.currentBalance }}</text
        >
      </view>
      <view class="coins__summary-row">
        <view class="coins__summary-item coins__summary-item--earn">
          <text class="coins__summary-item-label">收入</text>
          <text class="coins__summary-item-value"
            >+{{ summary.totalEarn }}</text
          >
        </view>
        <view class="coins__summary-item coins__summary-item--spend">
          <text class="coins__summary-item-label">支出</text>
          <text class="coins__summary-item-value">{{
            summary.totalSpend
          }}</text>
        </view>
      </view>
    </view>

    <!-- 月份选择 -->
    <view class="coins__month-picker">
      <view class="coins__month-btn" @tap="prevMonth">
        <text class="coins__month-btn-text">‹</text>
      </view>
      <text class="coins__month-text"
        >{{ currentYear }}年{{ currentMonth }}月</text
      >
      <view class="coins__month-btn" @tap="nextMonth">
        <text class="coins__month-btn-text">›</text>
      </view>
    </view>

    <!-- 流水列表 -->
    <scroll-view
      scroll-y
      class="coins__scroll"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
    >
      <!-- 加载中 -->
      <view v-if="loading && transactions.length === 0" class="coins__loading">
        <view class="coins__spinner" />
      </view>

      <!-- 空状态 -->
      <view v-else-if="transactions.length === 0" class="coins__empty">
        <text class="coins__empty-emoji">📊</text>
        <text class="coins__empty-title">暂无流水记录</text>
        <text class="coins__empty-desc">完成任务获得金币后会显示在这里</text>
      </view>

      <!-- 流水列表 -->
      <view v-else class="coins__items">
        <view v-for="item in transactions" :key="item.id" class="coins__item">
          <view
            class="coins__item-icon"
            :class="{ 'coins__item-icon--spend': item.amount < 0 }"
          >
            <text>{{ getSourceEmoji(item.source) }}</text>
          </view>
          <view class="coins__item-info">
            <text class="coins__item-desc">{{
              item.description || getSourceLabel(item.source)
            }}</text>
            <text class="coins__item-date">{{
              formatDate(item.createdAt)
            }}</text>
          </view>
          <view
            class="coins__item-amount"
            :class="{ 'coins__item-amount--spend': item.amount < 0 }"
          >
            <text class="coins__item-amount-text"
              >{{ item.amount > 0 ? "+" : "" }}{{ item.amount }}</text
            >
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getTransactions } from "@/api/rank";
import { parseCoinTransaction } from "@/models/shop";
import type { CoinTransaction } from "@/models/shop";
import { getAppMessage } from "@/config/errors";

const loading = ref(false);
const isRefreshing = ref(false);
const transactions = ref<CoinTransaction[]>([]);

const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth() + 1);

/** 统计数据 */
const summary = ref({
  currentBalance: 0,
  totalEarn: 0,
  totalSpend: 0,
});

/** 获取来源图标 */
function getSourceEmoji(source: string): string {
  const emojis: Record<string, string> = {
    card_reward: "⭐",
    full_attendance: "🏆",
    checkin: "📅",
    boss_kill: "⚔️",
    gacha: "🎡",
    shop_purchase: "🛒",
    shop_refund: "💸",
    decay: "📉",
    redemption: "🎫",
  };
  return emojis[source] || "💰";
}

/** 获取来源标签 */
function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    card_reward: "任务奖励",
    full_attendance: "全勤奖励",
    checkin: "签到奖励",
    boss_kill: "BOSS击杀",
    gacha: "扭蛋",
    shop_purchase: "商城购买",
    shop_refund: "商城退款",
    decay: "金币衰减",
    redemption: "兑换券使用",
  };
  return labels[source] || "其他";
}

/** 格式化日期 */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.substring(0, 16).replace("T", " ");
}

/** 上个月 */
function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  loadTransactions();
}

/** 下个月 */
function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  loadTransactions();
}

/** 加载流水数据 */
async function loadTransactions() {
  loading.value = true;
  try {
    const result = await getTransactions({
      year: currentYear.value,
      month: currentMonth.value,
    });
    if (result.success && result.data) {
      transactions.value = (result.data.transactions || []).map((item) =>
        parseCoinTransaction(item as unknown as Record<string, unknown>),
      );
      if (result.data.summary) {
        summary.value = {
          currentBalance: result.data.summary.currentCoins || 0,
          totalEarn: result.data.summary.totalEarn || 0,
          totalSpend: result.data.summary.totalSpend || 0,
        };
      }
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_STATUS_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 下拉刷新 */
async function handleRefresh() {
  isRefreshing.value = true;
  await loadTransactions();
  isRefreshing.value = false;
}

onMounted(() => {
  loadTransactions();
});
</script>

<style lang="scss" scoped>
.coins {
  min-height: 100vh;
  background: $bg-primary;

  /* 顶部统计 */
  &__summary {
    padding: 32rpx;
    background: linear-gradient(135deg, $bg-card, $bg-secondary);
    border-bottom: 2rpx solid $border-subtle;
  }

  &__summary-balance {
    text-align: center;
    margin-bottom: 32rpx;
  }

  &__summary-label {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-bottom: 8rpx;
  }

  &__summary-value {
    font-size: 56rpx;
    font-weight: bold;
    color: $accent-orange;
  }

  &__summary-row {
    display: flex;
    gap: 24rpx;
  }

  &__summary-item {
    flex: 1;
    padding: 20rpx;
    border-radius: 20rpx;
    text-align: center;
  }

  &__summary-item--earn {
    background: rgba(0, 184, 148, 0.1);
    border: 2rpx solid rgba(0, 184, 148, 0.3);
  }

  &__summary-item--spend {
    background: rgba(231, 76, 60, 0.1);
    border: 2rpx solid rgba(231, 76, 60, 0.3);
  }

  &__summary-item-label {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
  }

  &__summary-item-value {
    font-size: 32rpx;
    font-weight: bold;
    display: block;
    margin-top: 4rpx;
  }

  &__summary-item--earn &__summary-item-value {
    color: $accent-green;
  }

  &__summary-item--spend &__summary-item-value {
    color: $hp-red;
  }

  /* 月份选择 */
  &__month-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32rpx;
    padding: 24rpx 32rpx;
  }

  &__month-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: $bg-card;
    border: 2rpx solid $border-subtle;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__month-btn-text {
    font-size: 32rpx;
    color: $text-primary;
  }

  &__month-text {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
  }

  /* 列表区域 */
  &__scroll {
    height: calc(100vh - 360rpx);
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 80rpx 0;
  }

  &__spinner {
    width: 64rpx;
    height: 64rpx;
    border: 6rpx solid $border-subtle;
    border-top-color: $accent-cyan;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* 空状态 */
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 80rpx;

    &-emoji {
      font-size: 128rpx;
      margin-bottom: 32rpx;
      opacity: 0.6;
    }

    &-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 16rpx;
    }

    &-desc {
      font-size: 28rpx;
      color: $text-secondary;
      text-align: center;
    }
  }

  /* 流水列表 */
  &__items {
    padding: 0 32rpx 32rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: $bg-card;
    border-radius: 24rpx;
    border: 2rpx solid $border-subtle;
  }

  &__item-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: rgba(0, 184, 148, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 32rpx;
  }

  &__item-icon--spend {
    background: rgba(231, 76, 60, 0.1);
  }

  &__item-info {
    flex: 1;
    min-width: 0;
    margin-left: 20rpx;
  }

  &__item-desc {
    font-size: 28rpx;
    font-weight: 500;
    color: $text-primary;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-date {
    font-size: 22rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__item-amount {
    flex-shrink: 0;
    margin-left: 16rpx;
  }

  &__item-amount-text {
    font-size: 32rpx;
    font-weight: bold;
    color: $accent-green;
  }

  &__item-amount--spend &__item-amount-text {
    color: $hp-red;
  }
}
</style>
