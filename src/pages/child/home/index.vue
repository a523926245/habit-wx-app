<!-- 孩子首页 -->
<template>
  <view class="child-home-page">
    <!-- 下拉刷新 -->
    <scroll-view
      scroll-y
      class="page-scroll"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 用户信息头 -->
      <view class="profile-header">
        <view class="profile-header__user">
          <view class="profile-header__avatar">
            <text class="profile-header__avatar-text">{{ avatarLetter }}</text>
          </view>
          <view class="profile-header__info">
            <text class="profile-header__nickname">{{ nickname }}</text>
            <text v-if="familyName" class="profile-header__family">{{ familyName }}</text>
          </view>
        </view>
        <view class="profile-header__stats">
          <view class="profile-header__stat" @tap="goCoins">
            <text class="profile-header__stat-val">{{ coins }}</text>
            <text class="profile-header__stat-label">💰 金币</text>
          </view>
          <view class="profile-header__divider" />
          <view class="profile-header__stat">
            <text class="profile-header__stat-val">{{ rankTier }}</text>
            <text class="profile-header__stat-label">段位</text>
          </view>
          <view class="profile-header__divider" />
          <view class="profile-header__stat" @tap="goCheckin">
            <text class="profile-header__stat-val">{{ streak }}</text>
            <text class="profile-header__stat-label">🔥 连续签到</text>
          </view>
        </view>
      </view>

      <!-- 签到信息卡片 -->
      <view v-if="checkinStatus" class="checkin-card">
        <view class="checkin-card__header">
          <text class="checkin-card__streak">🔥 连续签到 {{ checkinStatus.streakDays }} 天</text>
        </view>

        <!-- 里程碑 -->
        <view class="checkin-card__milestones">
          <view
            v-for="(m, i) in milestones"
            :key="i"
            class="checkin-card__milestone"
            :class="{ 'is-unlocked': checkinStatus.streakDays >= m.days }"
          >
            <view class="checkin-card__node">
              <text v-if="checkinStatus.streakDays >= m.days" class="checkin-card__check">✓</text>
              <text v-else class="checkin-card__lock">🔒</text>
            </view>
            <text class="checkin-card__milestone-days">{{ m.days }}天</text>
            <text class="checkin-card__milestone-reward">+{{ m.reward }}💰</text>
          </view>
        </view>

        <!-- 下一目标 -->
        <view v-if="nextTarget" class="checkin-card__next">
          <text class="checkin-card__next-text">
            再坚持{{ nextTarget.remaining }}天可获得 {{ nextTarget.reward }}💰！
          </text>
        </view>
      </view>

      <!-- Tab 选项卡 -->
      <view class="tab-bar">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          class="tab-bar__item"
          :class="{ 'tab-bar__item--active': currentTab === index }"
          @tap="onTabChange(index)"
        >
          <text class="tab-bar__text">{{ tab }}</text>
        </view>
      </view>

      <!-- 任务列表 -->
      <view class="task-section">
        <view class="task-section__header">
          <text class="task-section__title">{{ tabTitles[currentTab] }}</text>
          <text class="task-section__summary">{{ summaryText }}</text>
        </view>

        <!-- 加载中 -->
        <view v-if="isLoading && assignments.length === 0" class="loading-wrap">
          <view class="loading-spinner" />
        </view>

        <!-- 空状态 -->
        <empty-state
          v-else-if="assignments.length === 0"
          :emoji="currentTab === 0 ? '😌' : '🎉'"
          :title="currentTab === 0 ? '今天没有任务' : '暂无任务'"
          description="休息一下吧~"
        />

        <!-- 任务卡片列表 -->
        <view v-else class="task-list">
          <view
            v-for="item in assignments"
            :key="item.id"
            class="task-item"
            :class="'status-' + item.status"
            @tap="onTaskTap(item)"
          >
            <!-- 表情图标 -->
            <view class="task-item__icon">
              <image
                v-if="item.cardCoverType === 'image'"
                class="task-item__cover"
                :src="item.cardCoverValue"
                mode="aspectFill"
              />
              <text v-else class="task-item__emoji">{{ item.cardCoverValue || '⭐' }}</text>
            </view>

            <!-- 内容 -->
            <view class="task-item__content">
              <text class="task-item__title">{{ item.cardTitle || '未知任务' }}</text>
              <view class="task-item__reward">
                <text class="task-item__reward-text">+{{ item.coinReward ?? 0 }} 💰</text>
                <text v-if="item.bossDamage" class="task-item__reward-text task-item__reward--damage">
                  +{{ item.bossDamage }} ⚔️
                </text>
              </view>
            </view>

            <!-- 状态徽章 -->
            <view class="task-item__badge">
              <text class="task-item__badge-text" :class="badgeClass(item.status)">
                {{ statusText(item.status) }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区域 -->
      <view class="bottom-safe" />
    </scroll-view>

    <!-- 自定义底部导航栏 -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import CustomTabBar from "@/custom-tab-bar/index.vue";
import { useAuthStore } from "@/stores/auth";
import { useCardStore } from "@/stores/card";
import { useCheckinStore } from "@/stores/checkin";
import { showToast } from "@/utils/toast";
import EmptyState from "@/components/empty-state/empty-state.vue";

const authStore = useAuthStore();
const cardStore = useCardStore();
const checkinStore = useCheckinStore();

const currentTab = ref(0);
const isRefreshing = ref(false);
const tabs = ["今日", "本周", "本月"];

const tabTitles = ["📋 今日任务", "🗓️ 本周任务", "📆 本月任务"];

// 用户信息
const nickname = computed(() => authStore.user.value?.nickname || "");
const familyName = computed(() => authStore.user.value?.familyName || "");
const coins = computed(() => authStore.user.value?.coins ?? 0);
const rankTier = computed(() => {
  const tier = authStore.user.value?.rankTier;
  if (!tier) return "青铜";
  // 如果是对象（后端返回完整段位信息），提取 name 属性
  if (typeof tier === 'object' && tier !== null) {
    return (tier as Record<string, unknown>).name || "青铜";
  }
  return tier;
});
const streak = computed(() => checkinStore.currentStreak);
const avatarLetter = computed(() => {
  const n = nickname.value;
  return n ? n.charAt(0).toUpperCase() : "?";
});

// 当前 tab 的任务列表
const assignments = computed(() => {
  switch (currentTab.value) {
    case 0:
      return cardStore.dailyAssignments.value;
    case 1:
      return cardStore.weeklyAssignments.value;
    case 2:
      return cardStore.monthlyAssignments.value;
    default:
      return cardStore.dailyAssignments.value;
  }
});

const isLoading = computed(() => cardStore.isLoading.value);

// 完成统计
const summaryText = computed(() => {
  const list = assignments.value;
  if (list.length === 0) return "";
  const done = list.filter((a) => a.status === "approved").length;
  return `${done}/${list.length} 完成`;
});

// 签到配置
interface Milestone {
  days: number;
  reward: number;
}
const milestones: Milestone[] = [
  { days: 3, reward: 10 },
  { days: 7, reward: 30 },
  { days: 14, reward: 50 },
  { days: 21, reward: 80 },
  { days: 30, reward: 120 },
];

const nextTarget = computed(() => {
  const current = checkinStore.currentStreak.value;
  const next = milestones.find((m) => m.days > current);
  if (!next) return null;
  return {
    remaining: next.days - current,
    reward: next.reward,
  };
});

// 签到状态
const checkinStatus = computed(() => checkinStore.checkinStatus.value);

// Tab 切换
function onTabChange(index: number) {
  currentTab.value = index;
}

// 状态徽章文本
function statusText(status: string): string {
  switch (status) {
    case "approved":
      return "已完成";
    case "submitted":
      return "审核中";
    case "rejected":
      return "未通过";
    default:
      return "待完成";
  }
}

// 状态徽章样式
function badgeClass(status: string): string {
  switch (status) {
    case "approved":
      return "is-approved";
    case "rejected":
      return "is-rejected";
    case "submitted":
      return "is-submitted";
    default:
      return "";
  }
}

// 任务点击
function onTaskTap(item: { id: number; status: string }) {
  if (item.status === "pending" || item.status === "rejected") {
    showSubmitDialog(item);
  } else if (item.status === "submitted") {
    showRetractDialog(item);
  }
}

// 提交弹框
function showSubmitDialog(item: { id: number; status: string }) {
  const isResubmit = item.status === "rejected";
  uni.showModal({
    title: isResubmit ? "重新提交任务" : "提交任务",
    content: "请填写完成心得（可选）",
    editable: true,
    placeholderText: isResubmit ? "这次我改进了..." : "今天我做到了...",
    success(res) {
      if (res.confirm && res.content !== undefined) {
        handleSubmit(item.id, res.content);
      }
    },
  });
}

// 撤回弹框
function showRetractDialog(item: { id: number }) {
  uni.showModal({
    title: "撤回提交",
    content: "确定要撤回此任务的提交吗？",
    success: (res) => {
      if (res.confirm) {
        (async () => {
          const ok = await cardStore.unsubmitAssignment(item.id);
          if (ok) {
            showToast("已撤回", "info");
          }
        })();
      }
    },
  });
}

// 提交任务
async function handleSubmit(id: number, note: string) {
  const ok = await cardStore.submitAssignment(id, note);
  if (ok) {
    showToast("已提交，等待家长审核！", "success");
  }
}

// 下拉刷新
async function onRefresh() {
  isRefreshing.value = true;
  try {
    await Promise.all([
      cardStore.loadAll(),
      checkinStore.loadStatus(),
      authStore.refreshUser(),
    ]);
  } catch {
    showToast("刷新失败", "error");
  } finally {
    isRefreshing.value = false;
  }
}

// 跳转
function goCoins() {
  uni.navigateTo({ url: "/pages/coins/index" });
}

function goCheckin() {
  uni.navigateTo({ url: "/pages/checkin-calendar/index" });
}

onMounted(() => {
  cardStore.loadAll();
  checkinStore.loadStatus();
});
</script>

<style lang="scss" scoped>
.child-home-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-scroll {
  height: 100vh;
  padding-bottom: 100rpx;
}

/* ===== 用户信息头 ===== */
.profile-header {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  margin: 16rpx 32rpx 0;
  background: linear-gradient(135deg, rgba(26, 27, 62, 0.9), rgba(22, 23, 46, 0.9));
  border-radius: 24rpx 24rpx 0 0;
  border: 2rpx solid rgba($accent-cyan, 0.2);
}

.profile-header__user {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20rpx;
}

.profile-header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  flex-shrink: 0;
  background: rgba($accent-cyan, 0.15);
  border-radius: 50%;
  border: 3rpx solid rgba($accent-cyan, 0.3);
}

.profile-header__avatar-text {
  font-size: 40rpx;
  font-weight: 700;
  color: $accent-cyan;
}

.profile-header__info {
  display: flex;
  flex-direction: column;
  margin-left: 20rpx;
  min-width: 0;
}

.profile-header__nickname {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-header__family {
  display: block;
  font-size: 22rpx;
  color: $text-secondary;
}

.profile-header__stats {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  padding: 10rpx 0;
}

.profile-header__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-header__stat-val {
  font-size: 28rpx;
  font-weight: 700;
  color: $accent-cyan;
  margin-bottom: 4rpx;
}

.profile-header__stat-label {
  font-size: 20rpx;
  color: $text-secondary;
}

.profile-header__divider {
  width: 1rpx;
  height: 40rpx;
  background: rgba($accent-cyan, 0.2);
}

/* ===== 任务区 ===== */
.task-section {
  padding: 0 32rpx;
  margin-top: 32rpx;
}

.task-section__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
  padding: 0 4rpx;
}

.task-section__title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.task-section__summary {
  font-size: 22rpx;
  color: $text-secondary;
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba($accent-cyan, 0.2);
  border-top-color: $accent-cyan;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tab 选项卡 - 胶囊样式 */
.tab-bar {
  display: flex;
  margin: 32rpx;
  padding: 8rpx;
  background: $bg-card;
  border-radius: 60rpx;
  border: 2rpx solid rgba(106, 214, 255, 0.1);
  flex-shrink: 0;
}

.tab-bar__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  border-radius: 52rpx;
  transition: all 0.2s ease;
}

.tab-bar__item--active {
  background: $accent-cyan;
  box-shadow: 0 0 30rpx rgba(106, 214, 255, 0.3);
}

.tab-bar__text {
  font-size: 28rpx;
  font-weight: 500;
  color: $text-secondary;
}

.tab-bar__item--active .tab-bar__text {
  color: $bg-primary;
  font-weight: bold;
}

/* ===== 任务列表 ===== */
.task-list {
  display: flex;
  flex-direction: column;
}

.task-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 32rpx;
  margin-bottom: 24rpx;
  background: $bg-card;
  border-radius: 20rpx;
  border: 2rpx solid $border-subtle;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &.status-approved {
    border-color: rgba($accent-green, 0.4);
  }
  &.status-rejected {
    border-color: rgba($accent-red, 0.4);
  }
  &.status-submitted {
    border-color: rgba($accent-cyan, 0.4);
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

  &__cover {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
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

  &__reward--damage {
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
      background: rgba($accent-cyan, 0.15);
      color: $accent-cyan;
    }
  }
}

/* ===== 签到卡片 ===== */
.checkin-card {
  margin: 32rpx;
  padding: 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  border: 2rpx solid $border-subtle;
}

.checkin-card__header {
  margin-bottom: 20rpx;
}

.checkin-card__streak {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
}

.checkin-card__milestones {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.checkin-card__milestone {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.checkin-card__node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  background: rgba($text-secondary, 0.2);
  border-radius: 50%;
  border: 2rpx solid $border-subtle;
  margin-bottom: 8rpx;
}

.checkin-card__check {
  font-size: 20rpx;
  color: $accent-green;
  font-weight: 700;
}

.checkin-card__lock {
  font-size: 20rpx;
}

.checkin-card__milestone.is-unlocked .checkin-card__node {
  background: linear-gradient(135deg, $accent-orange, $accent-cyan);
  border-color: $accent-orange;
  box-shadow: 0 0 12rpx rgba($accent-orange, 0.5);
}

.checkin-card__milestone.is-unlocked .checkin-card__lock {
  display: none;
}

.checkin-card__milestone.is-unlocked .checkin-card__check {
  color: #fff;
}

.checkin-card__milestone-days {
  font-size: 18rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 2rpx;
}

.checkin-card__milestone.is-unlocked .checkin-card__milestone-days {
  color: $accent-orange;
}

.checkin-card__milestone-reward {
  font-size: 16rpx;
  color: $accent-gold;
}

.checkin-card__next {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-subtle;
}

.checkin-card__next-text {
  font-size: 22rpx;
  color: $accent-cyan;
}

.bottom-safe {
  height: 0;
}
</style>
