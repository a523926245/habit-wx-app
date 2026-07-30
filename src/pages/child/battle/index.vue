<!-- 孩子 BOSS 战场页面 -->
<template>
  <view class="child-battle-page">
    <scroll-view scroll-y class="page-scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 加载中 -->
      <view v-if="isLoading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <!-- 无 BOSS -->
      <empty-state
        v-else-if="!currentBoss"
        emoji="⏳"
        title="等待家长创建 BOSS"
        description="BOSS 即将出现..."
      />

      <!-- BOSS 卡片 -->
      <view v-else class="boss-card" :class="{ 'is-defeated': currentBoss.status === 'defeated' }">
        <!-- 状态徽章 -->
        <view class="boss-card__status">
          <text class="boss-card__status-text">{{ statusText }}</text>
        </view>

        <!-- 倒计时 -->
        <view v-if="remainingTime" class="boss-card__timer">
          <text class="boss-card__timer-text">⏰ {{ remainingTime }}</text>
        </view>

        <!-- BOSS 表情 -->
        <view class="boss-card__hero">
          <text class="boss-card__emoji">{{ currentBoss.emoji }}</text>
          <!-- 难度徽章 -->
          <view v-if="difficultyLabel" class="boss-card__difficulty">
            <text class="boss-card__difficulty-text">{{ difficultyLabel }}</text>
          </view>
        </view>

        <!-- BOSS 信息 -->
        <text class="boss-card__name">{{ currentBoss.name }}</text>
        <text v-if="currentBoss.story" class="boss-card__story">{{ currentBoss.story }}</text>

        <!-- HP 条 -->
        <view class="boss-card__hp">
          <view class="boss-card__hp-bar">
            <view
              class="boss-card__hp-fill"
              :style="{ width: hpPercent + '%', background: hpGradient }"
            />
          </view>
          <text class="boss-card__hp-text">{{ currentBoss.currentHp }} / {{ currentBoss.maxHp }}</text>
        </view>

        <!-- 攻击系数 -->
        <view v-if="currentBoss.attackRatio && currentBoss.attackRatio !== 1" class="boss-card__multiplier">
          <text class="boss-card__multiplier-text">×{{ currentBoss.attackRatio.toFixed(1) }}</text>
        </view>

        <!-- 击杀奖励 -->
        <view v-if="currentBoss.killRewardCoins" class="boss-card__kill-reward">
          <text class="boss-card__kill-reward-text">🎁 击杀奖励: {{ currentBoss.killRewardCoins }} 金币</text>
        </view>
      </view>

      <!-- Tab 切换 -->
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

      <!-- 伤害排行 -->
      <view class="ranking-section">
        <!-- 加载中 -->
        <view v-if="isLoading" class="loading-wrap">
          <view class="loading-spinner" />
        </view>

        <!-- 空排行 -->
        <empty-state
          v-else-if="(currentTab === 0 ? todayRanking : weekRanking).length === 0"
          emoji="🏅"
          title="暂无伤害记录"
          description="完成任务即可对 BOSS 造成伤害"
        />

        <!-- 排行列表 -->
        <view v-else class="ranking-list">
          <view
            v-for="(entry, index) in currentRanking"
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

            <!-- 信息 -->
            <view class="ranking-item__info">
              <text class="ranking-item__name">{{ entry.nickname }}</text>
              <text class="ranking-item__tier">{{ getRankTierLabel(entry.rankTier) }}</text>
            </view>

            <!-- 伤害值 -->
            <view class="ranking-item__damage">
              <text class="ranking-item__damage-val">{{ entry.totalDamage }}</text>
              <text class="ranking-item__damage-label">伤害</text>
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
import { useBossStore } from "@/stores/boss";
import { useAuthStore } from "@/stores/auth";
import { showToast } from "@/utils/toast";
import EmptyState from "@/components/empty-state/empty-state.vue";
import { getRankTierLabel } from "@/config/game";
import { BOSS_DIFFICULTY_LABELS } from "@/models/boss";

const bossStore = useBossStore();
const authStore = useAuthStore();

const currentTab = ref(0);
const isRefreshing = ref(false);
const tabs = ["今日伤害", "总伤害"];

const currentBoss = computed(() => bossStore.currentBoss.value);
const todayRanking = computed(() => bossStore.todayRanking.value);
const weekRanking = computed(() => bossStore.weekRanking.value);
const isLoading = computed(() => bossStore.isLoading.value);

// BOSS 难度显示标签（映射后端原始值到中文标签）
const difficultyLabel = computed(() => {
  if (!currentBoss.value?.difficulty) return "";
  return BOSS_DIFFICULTY_LABELS[currentBoss.value.difficulty] || currentBoss.value.difficulty;
});

// HP 百分比
const hpPercent = computed(() => {
  if (!currentBoss.value) return 0;
  return Math.round((currentBoss.value.currentHp / currentBoss.value.maxHp) * 100);
});

// HP 条渐变色
const hpGradient = computed(() => {
  if (!currentBoss.value) return "";
  if (currentBoss.value.status === "defeated") {
    return 'linear-gradient(to right, #ff716c, #ff716c)';
  }
  return 'linear-gradient(to right, #00b894, #6ad6ff)';
});

// 状态文本
const statusText = computed(() => {
  if (!currentBoss.value) return "";
  switch (currentBoss.value.status) {
    case "active":
      return currentBoss.value.currentHp < currentBoss.value.maxHp * 0.3
        ? "⚡ 狂暴状态"
        : "⚔️ 战斗中";
    case "defeated":
      return "💀 已击败";
    case "expired":
      return "⏰ 已过期";
    default:
      return "📋 草稿";
  }
});

// 剩余时间
const remainingTime = computed(() => {
  if (!currentBoss.value || !currentBoss.value.endTime || currentBoss.value.status !== "active") return "";
  try {
    const end = new Date(currentBoss.value.endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "已过期";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}天${hours}时`;
    return `${hours}时`;
  } catch {
    return "";
  }
});

// 当前排行
const currentRanking = computed(() => {
  return currentTab.value === 0 ? todayRanking.value : weekRanking.value;
});

function onTabChange(index: number) {
  currentTab.value = index;
}

async function onRefresh() {
  isRefreshing.value = true;
  try {
    await bossStore.loadBoss();
  } catch {
    showToast("刷新失败", "error");
  } finally {
    isRefreshing.value = false;
  }
}

onMounted(() => {
  bossStore.loadBoss();
});
</script>

<style lang="scss" scoped>
.child-battle-page {
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

/* ===== BOSS 卡片 ===== */
.boss-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 24rpx;
  margin: 32rpx;
  background: $bg-card;
  border-radius: 24rpx;
  border: 2rpx solid $border-subtle;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);

  &.is-defeated {
    border-color: rgba($accent-red, 0.3);
  }

  &__status {
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    padding: 6rpx 16rpx;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 12rpx;
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

  &__difficulty {
    position: absolute;
    bottom: -8rpx;
    right: -8rpx;
    padding: 4rpx 12rpx;
    background: rgba($accent-purple, 0.8);
    border-radius: 8rpx;
  }

  &__difficulty-text {
    font-size: 18rpx;
    font-weight: 700;
    color: #fff;
  }

  &__name {
    display: block;
    font-size: 32rpx;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 4rpx;
  }

  &__story {
    display: block;
    font-size: 22rpx;
    color: $text-secondary;
    text-align: center;
    max-width: 500rpx;
    margin-bottom: 20rpx;
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

  &__kill-reward-text {
    font-size: 22rpx;
    color: $accent-gold;
  }
}

/* ===== 排行区 ===== */
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

  &__damage {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
  }

  &__damage-val {
    font-size: 28rpx;
    font-weight: 700;
    color: $accent-orange;
  }

  &__damage-label {
    font-size: 18rpx;
    color: $text-secondary;
  }
}

.bottom-safe {
  height: 0;
}
</style>
