<!-- 家长首页 - 勇者乐园深色赛博朋克主题 -->
<template>
  <view class="parent-home">
    <!-- 自定义导航栏（无返回按钮） -->
    <view class="parent-home__navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <text class="parent-home__navbar-title">勇者乐园</text>
    </view>

    <!-- 下拉刷新 -->
    <scroll-view
      scroll-y
      class="parent-home__scroll"
      :style="{ marginTop: (statusBarHeight + 42) + 'px' }"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
    >
      <view v-if="!hasFamily" class="parent-home__no-family">
        <text class="parent-home__no-family-emoji">🏠</text>
        <text class="parent-home__no-family-title">你还没有加入家庭</text>
        <text class="parent-home__no-family-desc">创建一个新家庭，或用邀请码加入已有的家庭</text>
        <button class="parent-home__join-btn" @tap="goToChooseFamily">创建/加入家庭</button>
      </view>

      <view v-else>
        <!-- 今日概览 -->
        <view class="parent-home__section">
          <view class="parent-home__section-header">
            <text class="parent-home__section-title">📋 今日概览</text>
          </view>
          <view class="parent-home__overview-card">
            <view v-if="childrenLoading" class="parent-home__loading">
              <view class="parent-home__spinner" />
            </view>
            <view v-else-if="children.length === 0" class="parent-home__empty-child">
              <text class="parent-home__empty-emoji">👶</text>
              <text class="parent-home__empty-text">还没有孩子</text>
            </view>
            <view v-else class="parent-home__children-list">
              <view
                v-for="child in children"
                :key="child.id"
                class="parent-home__child-card"
                @tap="showChildDetail(child)"
              >
                <view class="parent-home__child-avatar" :style="{ borderColor: getChildTierColor(child.completionRate) }">
                  <text class="parent-home__child-avatar-text" :style="{ color: getChildTierColor(child.completionRate) }">
                    {{ getFirstChildLetter(child.nickname) }}
                  </text>
                </view>
                <view class="parent-home__child-info">
                  <view class="parent-home__child-name-row">
                    <text class="parent-home__child-name">{{ truncate(child.nickname, 5) }}</text>
                    <view class="parent-home__child-rate-badge" :style="{ borderColor: getChildTierColor(child.completionRate) }">
                      <text class="parent-home__child-rate-text" :style="{ color: getChildTierColor(child.completionRate) }">
                        {{ getTodayStats(child.today) }}
                      </text>
                    </view>
                  </view>
                  <view class="parent-home__child-stats-row">
                    <view v-if="getChildTypeStat(child.byType, 'daily')" class="parent-home__mini-stat">
                      <text class="parent-home__mini-stat-text" :style="{ color: getStatColor(getChildTypeStat(child.byType, 'daily')) }">
                        ☀️ {{ getChildTypeStat(child.byType, 'daily') }}
                      </text>
                    </view>
                    <view v-if="getChildTypeStat(child.byType, 'weekly')" class="parent-home__mini-stat">
                      <text class="parent-home__mini-stat-text" :style="{ color: getStatColor(getChildTypeStat(child.byType, 'weekly')) }">
                        🗓 {{ getChildTypeStat(child.byType, 'weekly') }}
                      </text>
                    </view>
                    <view v-if="getChildTypeStat(child.byType, 'monthly')" class="parent-home__mini-stat">
                      <text class="parent-home__mini-stat-text" :style="{ color: getStatColor(getChildTypeStat(child.byType, 'monthly')) }">
                        📆 {{ getChildTypeStat(child.byType, 'monthly') }}
                      </text>
                    </view>
                    <view v-if="child.dailyFullAttendance" class="parent-home__mini-stat">
                      <text class="parent-home__mini-stat-text parent-home__mini-stat--gold">⭐ 全勤</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 快捷入口 -->
        <view class="parent-home__section">
          <view class="parent-home__section-header">
            <text class="parent-home__section-title">⚡ 快捷入口</text>
          </view>
          <view class="parent-home__grid">
            <view
              v-for="entry in quickEntries"
              :key="entry.label"
              class="parent-home__grid-item"
              @tap="goTo(entry.url)"
            >
              <view class="parent-home__grid-icon" :style="{ borderColor: entry.color + '40' }">
                <text class="parent-home__grid-icon-text" :style="{ color: entry.color }">{{ entry.icon }}</text>
              </view>
              <text class="parent-home__grid-label">{{ entry.label }}</text>
            </view>
          </view>
        </view>
      </view>
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
import { useBossStore } from "@/stores/boss";
import { getChildrenProgress } from "@/api/auth";

const authStore = useAuthStore();
const cardStore = useCardStore();
const bossStore = useBossStore();

// 状态栏高度（用于自定义导航栏适配不同机型）
const statusBarHeight = ref(0);

interface ChildInfo {
  id: number;
  nickname: string;
  completionRate: number;
  dailyFullAttendance: boolean;
  today: Record<string, unknown>;
  byType: Record<string, Record<string, unknown>>;
}

const children = ref<ChildInfo[]>([]);
const childrenLoading = ref(true);
const isRefreshing = ref(false);

const hasFamily = computed(() => authStore.hasFamily);

const quickEntries = [
  { icon: "⚔️", label: "BOSS管理", url: "/pages/boss-manage/index", color: "#6ad6ff" },
  { icon: "🎴", label: "卡牌管理", url: "/pages/cards/manage/index", color: "#a855f7" },
  { icon: "👨‍👩‍👧‍👦", label: "家庭管理", url: "/pages/family-manage/index", color: "#00b894" },
  { icon: "🏪", label: "商城管理", url: "/pages/shop/index", color: "#ff6b35" },
  { icon: "📝", label: "兑换记录", url: "/pages/shop/redemptions/index", color: "#f0dc2b" },
  { icon: "✅", label: "我的待办", url: "/pages/pending/index", color: "#6ad6ff" },
];

onMounted(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 0;
  loadData();
});

async function loadData() {
  childrenLoading.value = true;
  try {
    // 加载任务数据
    await Promise.all([
      cardStore.loadAll(),
      bossStore.loadBoss(),
      fetchChildrenProgress(),
    ]);
  } catch {
    // 静默处理
  } finally {
    childrenLoading.value = false;
  }
}

async function handleRefresh() {
  isRefreshing.value = true;
  await loadData();
  isRefreshing.value = false;
}

async function fetchChildrenProgress() {
  try {
    const result = await getChildrenProgress();
    if (result.success && result.data?.children) {
      children.value = result.data.children as unknown as ChildInfo[];
    }
  } catch {
    // 静默处理
  }
}

function getChildTierColor(rate: number): string {
  if (rate >= 80) return "#00b894";
  if (rate >= 50) return "#ff6b35";
  return "#6ad6ff";
}

function getStatColor(stats: string | null): string {
  if (!stats) return "#a9a9c2";
  const parts = stats.split("/");
  if (parts.length === 2) {
    const approved = parseInt(parts[0], 10);
    const total = parseInt(parts[1], 10);
    if (total > 0 && approved >= total) return "#00b894";
    if (approved > 0) return "#ff6b35";
  }
  return "#a9a9c2";
}

function getChildTypeStat(byType: Record<string, Record<string, unknown>> | undefined, type: string): string | null {
  if (!byType?.[type]) return null;
  const stats = byType[type] as Record<string, unknown>;
  const total = stats.total ?? 0;
  const approved = stats.approved ?? 0;
  if (total === 0) return null;
  return `${approved}/${total}`;
}

function getTodayStats(today: Record<string, unknown> | undefined): string {
  if (!today) {
    return "无任务";
  }
  const total = (today.total as number) ?? 0;
  const approved = (today.approved as number) ?? 0;
  return total > 0 ? `${approved}/${total}` : "无任务";
}

function getFirstChildLetter(nickname: string): string {
  return nickname?.charAt(0) ?? "?";
}

function truncate(str: string, len: number): string {
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "..." : str;
}

function goTo(url: string) {
  uni.navigateTo({ url });
}

function goToChooseFamily() {
  uni.redirectTo({ url: "/pages/family/choose-family/index" });
}

function showChildDetail(child: ChildInfo) {
  // TODO: 显示孩子任务详情（底部弹出）
  uni.showToast({ title: `查看 ${child.nickname} 详情`, icon: "none" });
}
</script>

<style lang="scss" scoped>
.parent-home {
  height: 100vh;
  background: $bg-primary;

  &__navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    background: $bg-primary;
    border-bottom: 1rpx solid $border-subtle;
  }

  &__navbar-title {
    font-size: 24rpx;
    color: $text-primary;
  }

  &__scroll {
    height: 100%;
    padding-bottom: 100rpx;
  }

  &__no-family {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 32rpx;

    &-emoji {
      font-size: 128rpx;
      margin-bottom: 32rpx;
    }

    &-title {
      font-size: 40rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 16rpx;
    }

    &-desc {
      font-size: 28rpx;
      color: $text-secondary;
      text-align: center;
      margin-bottom: 64rpx;
    }
  }

  &__join-btn {
    padding: 24rpx 80rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: $bg-primary;
    background: $accent-cyan;
    border-radius: 24rpx;
    border: none;
  }

  &__section {
    padding: 32rpx 32rpx 0;

    &:last-child {
      padding-bottom: 32rpx;
    }

    &-header {
      margin-bottom: 16rpx;
    }

    &-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-primary;
    }
  }

  &__overview-card {
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
    padding: 24rpx;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 40rpx 0;
  }

  &__spinner {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid $border-subtle;
    border-top-color: $accent-cyan;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  &__empty-child {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48rpx 0;

    &-emoji {
      font-size: 48rpx;
      margin-bottom: 16rpx;
    }

    &-text {
      font-size: 28rpx;
      color: $text-secondary;
    }
  }

  &__children-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  &__child-card {
    display: flex;
    align-items: center;
    padding: 32rpx;
    background: $bg-secondary;
    border-radius: 24rpx;
    border-left: 8rpx solid $accent-cyan;
  }

  &__child-avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 32rpx;
    border: 4rpx solid;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(106, 214, 255, 0.1);
  }

  &__child-avatar-text {
    font-size: 48rpx;
    font-weight: bold;
  }

  &__child-info {
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
  }

  &__child-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__child-name {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-primary;
  }

  &__child-rate-badge {
    padding: 4rpx 16rpx;
    border-radius: 16rpx;
    border: 2rpx solid;
    background: rgba(106, 214, 255, 0.1);
    flex-shrink: 0;
  }

  &__child-rate-text {
    font-size: 26rpx;
    font-weight: bold;
  }

  &__child-stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 20rpx;
  }

  &__mini-stat {
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    background: rgba(106, 214, 255, 0.1);
  }

  &__mini-stat-text {
    font-size: 22rpx;
    font-weight: 500;
  }

  &__mini-stat--gold {
    color: #f0dc2b;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
  }

  &__grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 32rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
  }

  &__grid-icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 28rpx;
    border: 4rpx solid;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(106, 214, 255, 0.06);
    margin-bottom: 20rpx;
  }

  &__grid-icon-text {
    font-size: 40rpx;
  }

  &__grid-label {
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
    text-align: center;
  }
}
</style>
