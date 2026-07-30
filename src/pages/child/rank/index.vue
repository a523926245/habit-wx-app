<!-- 孩子排行榜页面 -->
<template>
  <view class="child-rank-page">
    <scroll-view scroll-y class="page-scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
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

      <!-- 排行榜列表 -->
      <view class="ranking-section">
        <!-- 加载中 -->
        <view v-if="isLoading" class="loading-wrap">
          <view class="loading-spinner" />
        </view>

        <!-- 空状态 -->
        <empty-state
          v-else-if="leaderboard.length === 0"
          emoji="🏅"
          title="暂无排行数据"
        />

        <!-- 排行列表 -->
        <view v-else class="ranking-list">
          <view
            v-for="(entry, index) in leaderboard"
            :key="entry.userId"
            class="ranking-item"
            :class="'rank-' + (index + 1)"
          >
            <!-- 排名 -->
            <view class="ranking-item__rank">
              <text v-if="index === 0" class="ranking-item__medal">🥇</text>
              <text v-else-if="index === 1" class="ranking-item__medal">🥈</text>
              <text v-else-if="index === 2" class="ranking-item__medal">🥉</text>
              <text v-else class="ranking-item__num">{{ index + 1 }}</text>
            </view>

            <!-- 头像 -->
            <view class="ranking-item__avatar">
              <text class="ranking-item__avatar-text">{{ entry.nickname.charAt(0) }}</text>
            </view>

            <!-- 信息 -->
            <view class="ranking-item__info">
              <text class="ranking-item__name">{{ truncateName(entry.nickname) }}</text>
              <text class="ranking-item__tier">{{ getRankTierLabel(entry.rankTier) }}</text>
            </view>

            <!-- 徽章 -->
            <view v-if="index < 3" class="ranking-item__badge">
              <text class="ranking-item__badge-text">{{ badgeText(index) }}</text>
            </view>

            <!-- 分数 -->
            <view class="ranking-item__score">
              <text class="ranking-item__score-val">{{ currentDim === 'score' ? entry.rankScore : entry.coins }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 占位，防止内容被固定底部导航遮挡 -->
    </scroll-view>

    <!-- 自定义底部导航栏 -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import CustomTabBar from "@/custom-tab-bar/index.vue";
import { useRankStore } from "@/stores/rank";
import { showToast } from "@/utils/toast";
import EmptyState from "@/components/empty-state/empty-state.vue";
import { getRankTierLabel } from "@/config/game";

const rankStore = useRankStore();

const currentTab = ref(0);
const isRefreshing = ref(false);
const tabs = ["积分榜", "金币榜"];

const currentDim = computed(() => (currentTab.value === 0 ? "score" : "coins"));
const leaderboard = computed(() => {
  return currentTab.value === 0
    ? rankStore.scoreLeaderboard.value
    : rankStore.coinsLeaderboard.value;
});
const isLoading = computed(() => rankStore.isLoading.value);

function onTabChange(index: number) {
  currentTab.value = index;
}

function truncateName(name: string): string {
  if (name.length <= 5) return name;
  return name.slice(0, 5) + "...";
}

function badgeText(index: number): string {
  switch (index) {
    case 0:
      return "冠军";
    case 1:
      return "亚军";
    case 2:
      return "季军";
    default:
      return "";
  }
}

async function onRefresh() {
  isRefreshing.value = true;
  try {
    await rankStore.loadLeaderboard();
  } catch {
    showToast("刷新失败", "error");
  } finally {
    isRefreshing.value = false;
  }
}

onMounted(() => {
  rankStore.loadLeaderboard();
});
</script>

<style lang="scss" scoped>
.child-rank-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-scroll {
  height: 100vh;
  padding-bottom: 100rpx;
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

.ranking-section {
  padding: 0 32rpx;
  margin-top: 32rpx;
}

.ranking-list {
  display: flex;
  flex-direction: column;
}

.ranking-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 32rpx;
  margin-bottom: 24rpx;
  background: $bg-card;
  border-radius: 16rpx;
  border: 2rpx solid $border-subtle;
  border-left: 6rpx solid transparent;

  &.rank-1 {
    border-left-color: $accent-cyan;
    box-shadow: 0 4rpx 16rpx rgba(106, 214, 255, 0.15);
  }
  &.rank-2 {
    border-left-color: $accent-orange;
  }
  &.rank-3 {
    border-left-color: $accent-gold;
  }

  &__rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56rpx;
    height: 56rpx;
    flex-shrink: 0;
  }

  &__medal {
    font-size: 36rpx;
  }

  &__num {
    font-size: 24rpx;
    font-weight: 700;
    color: $text-secondary;
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    margin-right: 12rpx;
    background: rgba($accent-cyan, 0.1);
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__avatar-text {
    font-size: 28rpx;
    font-weight: 700;
    color: $accent-cyan;
  }

  &__info {
    flex: 1;
    min-width: 0;
    padding: 0 16rpx;
  }

  &__name {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tier {
    display: block;
    font-size: 20rpx;
    color: $text-secondary;
  }

  &__badge {
    flex-shrink: 0;
    margin-right: 12rpx;
  }

  &__badge-text {
    padding: 4rpx 12rpx;
    font-size: 18rpx;
    font-weight: 600;
    border-radius: 8rpx;
    background: rgba($accent-cyan, 0.15);
    color: $accent-cyan;
  }

  &__score {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
  }

  &__score-val {
    font-size: 28rpx;
    font-weight: 700;
    color: $accent-cyan;
  }
}

.bottom-safe {
  height: 0;
}
</style>
