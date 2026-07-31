<!-- 签到日历 - 可视化签到记录 -->
<template>
  <view class="checkin-calendar">
    <!-- 月份选择 -->
    <view class="checkin-calendar__month-picker">
      <view class="checkin-calendar__month-btn" @tap="prevMonth">
        <text class="checkin-calendar__month-btn-text">‹</text>
      </view>
      <text class="checkin-calendar__month-text">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="checkin-calendar__month-btn" @tap="nextMonth">
        <text class="checkin-calendar__month-btn-text">›</text>
      </view>
    </view>

    <!-- 连续签到统计 -->
    <view class="checkin-calendar__stats">
      <view class="checkin-calendar__stat">
        <text class="checkin-calendar__stat-value">{{ calendar.currentStreak }}</text>
        <text class="checkin-calendar__stat-label">当前连续</text>
      </view>
      <view class="checkin-calendar__stat-divider" />
      <view class="checkin-calendar__stat">
        <text class="checkin-calendar__stat-value">{{ calendar.bestStreak }}</text>
        <text class="checkin-calendar__stat-label">最佳连续</text>
      </view>
    </view>

    <!-- 日历网格 -->
    <view class="checkin-calendar__grid">
      <!-- 星期标题 -->
      <view class="checkin-calendar__weekdays">
        <text v-for="day in weekdays" :key="day" class="checkin-calendar__weekday">{{ day }}</text>
      </view>

      <!-- 日期网格 -->
      <view class="checkin-calendar__days">
        <!-- 空白占位 -->
        <view v-for="n in firstDayOffset" :key="'empty-' + n" class="checkin-calendar__day checkin-calendar__day--empty" />

        <!-- 日期 -->
        <view
          v-for="day in daysInMonth"
          :key="day"
          class="checkin-calendar__day"
          :class="{
            'checkin-calendar__day--checked': isChecked(day),
            'checkin-calendar__day--today': isToday(day),
          }"
        >
          <text class="checkin-calendar__day-text">{{ day }}</text>
          <view v-if="isChecked(day)" class="checkin-calendar__day-dot" />
        </view>
      </view>
    </view>

    <!-- 图例 -->
    <view class="checkin-calendar__legend">
      <view class="checkin-calendar__legend-item">
        <view class="checkin-calendar__legend-dot checkin-calendar__legend-dot--checked" />
        <text class="checkin-calendar__legend-text">已签到</text>
      </view>
      <view class="checkin-calendar__legend-item">
        <view class="checkin-calendar__legend-dot checkin-calendar__legend-dot--today" />
        <text class="checkin-calendar__legend-text">今天</text>
      </view>
      <view class="checkin-calendar__legend-item">
        <view class="checkin-calendar__legend-dot checkin-calendar__legend-dot--unchecked" />
        <text class="checkin-calendar__legend-text">未签到</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getCheckinCalendar } from "@/api/checkin";
import type { CheckinCalendar } from "@/models/checkin";
import { getAppMessage } from "@/config/errors";

const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth() + 1);

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

/** 签到日历数据 */
const calendar = ref<CheckinCalendar>({
  userId: 0,
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  records: {},
  currentStreak: 0,
  bestStreak: 0,
});

/** 当月第一天是星期几（0-6） */
const firstDayOffset = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value - 1, 1);
  return date.getDay();
});

/** 当月天数 */
const daysInMonth = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 0);
  return date.getDate();
});

/** 判断某天是否签到 */
function isChecked(day: number): boolean {
  const dateStr = `${currentYear.value}-${String(currentMonth.value).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return calendar.value.records[dateStr] === true;
}

/** 判断某天是否今天 */
function isToday(day: number): boolean {
  const today = new Date();
  return (
    currentYear.value === today.getFullYear() &&
    currentMonth.value === today.getMonth() + 1 &&
    day === today.getDate()
  );
}

/** 上个月 */
function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  loadCalendar();
}

/** 下个月 */
function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  loadCalendar();
}

/** 加载签到日历 */
async function loadCalendar() {
  try {
    const result = await getCheckinCalendar(currentYear.value, currentMonth.value);
    if (result.success && result.data) {
      const data = result.data.calendar;
      calendar.value = {
        userId: data.userId || 0,
        year: data.year || currentYear.value,
        month: data.month || currentMonth.value,
        records: data.records || {},
        currentStreak: data.currentStreak || 0,
        bestStreak: data.bestStreak || 0,
      };
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_CALENDAR_FAILED"), icon: "none" });
  }
}

onMounted(() => {
  loadCalendar();
});
</script>

<style lang="scss" scoped>
.checkin-calendar {
  min-height: 100vh;
  background: $bg-primary;
  padding: 32rpx;

  /* 月份选择 */
  &__month-picker {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32rpx;
    margin-bottom: 32rpx;
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

  /* 统计 */
  &__stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 48rpx;
    padding: 32rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
    margin-bottom: 32rpx;
  }

  &__stat {
    text-align: center;
  }

  &__stat-value {
    font-size: 48rpx;
    font-weight: bold;
    color: $accent-cyan;
    display: block;
  }

  &__stat-label {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__stat-divider {
    width: 2rpx;
    height: 64rpx;
    background: $border-subtle;
  }

  /* 日历网格 */
  &__grid {
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
    padding: 24rpx;
    margin-bottom: 32rpx;
  }

  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 16rpx;
  }

  &__weekday {
    text-align: center;
    font-size: 24rpx;
    font-weight: 600;
    color: $text-secondary;
    padding: 12rpx 0;
  }

  &__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8rpx;
  }

  &__day {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 16rpx;
    position: relative;
  }

  &__day--empty {
    visibility: hidden;
  }

  &__day-text {
    font-size: 28rpx;
    color: $text-primary;
  }

  &__day--today {
    background: rgba(106, 214, 255, 0.15);
    border: 2rpx solid $accent-cyan;
  }

  &__day--today &__day-text {
    color: $accent-cyan;
    font-weight: bold;
  }

  &__day--checked {
    background: rgba(0, 184, 148, 0.2);
  }

  &__day--checked &__day-text {
    color: $accent-green;
    font-weight: bold;
  }

  &__day-dot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: $accent-green;
    margin-top: 4rpx;
  }

  /* 图例 */
  &__legend {
    display: flex;
    justify-content: center;
    gap: 32rpx;
  }

  &__legend-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  &__legend-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
  }

  &__legend-dot--checked {
    background: $accent-green;
  }

  &__legend-dot--today {
    background: $accent-cyan;
    border: 2rpx solid $accent-cyan;
  }

  &__legend-dot--unchecked {
    background: $border-subtle;
  }

  &__legend-text {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
</style>
