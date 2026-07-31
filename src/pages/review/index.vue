<!-- 每日复盘 - 月历视图 + 月度汇总 -->
<template>
  <view class="review">
    <!-- 月份选择 -->
    <view class="review__month-picker">
      <view class="review__month-btn" @tap="prevMonth">
        <text class="review__month-btn-text">‹</text>
      </view>
      <text class="review__month-text">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="review__month-btn" @tap="nextMonth">
        <text class="review__month-btn-text">›</text>
      </view>
    </view>

    <!-- 月度汇总 -->
    <view class="review__summary">
      <view class="review__summary-item">
        <text class="review__summary-value">{{ summary.activeDays }}</text>
        <text class="review__summary-label">活跃天数</text>
      </view>
      <view class="review__summary-divider" />
      <view class="review__summary-item">
        <text class="review__summary-value review__summary-value--gold">{{ summary.perfectDays }}</text>
        <text class="review__summary-label">全勤天数</text>
      </view>
      <view class="review__summary-divider" />
      <view class="review__summary-item">
        <text class="review__summary-value review__summary-value--cyan">{{ Math.round(summary.avgRate * 100) }}%</text>
        <text class="review__summary-label">平均完成率</text>
      </view>
    </view>

    <!-- 孩子列表 -->
    <scroll-view scroll-y class="review__scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <!-- 加载中 -->
      <view v-if="loading" class="review__loading">
        <view class="review__spinner" />
      </view>

      <!-- 空状态 -->
      <view v-else-if="children.length === 0" class="review__empty">
        <text class="review__empty-emoji">📊</text>
        <text class="review__empty-title">暂无数据</text>
        <text class="review__empty-desc">孩子完成任务后会生成复盘数据</text>
      </view>

      <!-- 孩子复盘列表 -->
      <view v-else class="review__items">
        <view
          v-for="child in children"
          :key="child.id"
          class="review__card"
        >
          <view class="review__card-header">
            <view class="review__card-avatar">
              <text class="review__card-avatar-text">{{ child.nickname?.charAt(0) || '?' }}</text>
            </view>
            <text class="review__card-name">{{ child.nickname }}</text>
          </view>

          <!-- 月历视图 -->
          <view class="review__calendar">
            <view
              v-for="(day, index) in calendarDays"
              :key="index"
              class="review__calendar-day"
              :class="{
                'review__calendar-day--green': day.status === 'green',
                'review__calendar-day--orange': day.status === 'orange',
                'review__calendar-day--red': day.status === 'red',
              }"
            >
              <text class="review__calendar-day-text">{{ day.day }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getReview } from "@/api/rank";
import { getAppMessage } from "@/config/errors";

const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth() + 1);

const loading = ref(false);
const isRefreshing = ref(false);

interface ChildReview {
  id: number;
  nickname: string;
}

interface CalendarDay {
  day: number;
  status: "green" | "orange" | "red" | "empty";
}

const children = ref<ChildReview[]>([]);
const calendarDays = ref<CalendarDay[]>([]);

const summary = ref({
  activeDays: 0,
  perfectDays: 0,
  avgRate: 0,
});

/** 上个月 */
function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  loadReview();
}

/** 下个月 */
function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  loadReview();
}

/** 加载复盘数据 */
async function loadReview() {
  loading.value = true;
  try {
    const monthStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, "0")}`;
    const result = await getReview(monthStr);
    if (result.success && result.data) {
      children.value = result.data.children || [];
      if (result.data.summary) {
        summary.value = {
          activeDays: result.data.summary.activeDays || 0,
          perfectDays: result.data.summary.perfectDays || 0,
          avgRate: result.data.summary.avgRate || 0,
        };
      }

      // 生成日历天数
      const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate();
      const days: CalendarDay[] = [];
      const daysData = (result.data.days || []) as Record<string, unknown>[];

      for (let d = 1; d <= daysInMonth; d++) {
        const dayStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayData = daysData.find((item) => item.date === dayStr);
        let status: "green" | "orange" | "red" | "empty" = "empty";

        if (dayData) {
          const rate = Number(dayData.rate || 0);
          if (rate >= 1) {
            status = "green";
          } else if (rate >= 0.5) {
            status = "orange";
          } else {
            status = "red";
          }
        }

        days.push({ day: d, status });
      }

      calendarDays.value = days;
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_PROGRESS_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 下拉刷新 */
async function handleRefresh() {
  isRefreshing.value = true;
  await loadReview();
  isRefreshing.value = false;
}

onMounted(() => {
  loadReview();
});
</script>

<style lang="scss" scoped>
.review {
  min-height: 100vh;
  background: $bg-primary;

  /* 月份选择 */
  &__month-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32rpx;
    padding: 32rpx;
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

  /* 汇总统计 */
  &__summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32rpx;
    padding: 32rpx;
    margin: 0 32rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
  }

  &__summary-item {
    text-align: center;
    flex: 1;
  }

  &__summary-value {
    font-size: 40rpx;
    font-weight: bold;
    color: $text-primary;
    display: block;
  }

  &__summary-value--gold {
    color: $accent-gold;
  }

  &__summary-value--cyan {
    color: $accent-cyan;
  }

  &__summary-label {
    font-size: 22rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__summary-divider {
    width: 2rpx;
    height: 48rpx;
    background: $border-subtle;
  }

  /* 列表区域 */
  &__scroll {
    height: calc(100vh - 320rpx);
    margin-top: 32rpx;
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

  /* 复盘卡片 */
  &__items {
    padding: 0 32rpx 32rpx;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  &__card {
    padding: 28rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
  }

  &__card-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  &__card-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: rgba(106, 214, 255, 0.1);
    border: 2rpx solid rgba(106, 214, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__card-avatar-text {
    font-size: 28rpx;
    font-weight: bold;
    color: $accent-cyan;
  }

  &__card-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
  }

  /* 日历视图 */
  &__calendar {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
  }

  &__calendar-day {
    width: 64rpx;
    height: 64rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-surface;
  }

  &__calendar-day--green {
    background: rgba(0, 184, 148, 0.3);
  }

  &__calendar-day--orange {
    background: rgba(255, 107, 53, 0.3);
  }

  &__calendar-day--red {
    background: rgba(231, 76, 60, 0.3);
  }

  &__calendar-day-text {
    font-size: 22rpx;
    color: $text-primary;
  }
}
</style>
