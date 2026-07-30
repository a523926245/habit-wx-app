<!-- BOSS管理 - 勇者乐园深色赛博朋克主题 -->
<template>
  <view class="boss-manage">
    <!-- Tab 选项卡 -->
    <view class="boss-manage__tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="boss-manage__tab"
        :class="{ 'boss-manage__tab--active': tabIndex === index }"
        @tap="switchTab(index)"
      >
        <text class="boss-manage__tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="boss-manage__scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <!-- 已启用 Tab -->
      <view v-if="tabIndex === 0">
        <view v-if="bossStore.isLoading === true && activeBosses.length === 0" class="boss-manage__loading">
          <view class="boss-manage__spinner" />
        </view>
        <view v-else-if="activeBosses.length === 0" class="boss-manage__empty">
          <text class="boss-manage__empty-emoji">⚔️</text>
          <text class="boss-manage__empty-title">暂无启用中的BOSS</text>
          <text class="boss-manage__empty-desc">点击右上角 + 创建一个新的BOSS</text>
        </view>
        <view v-else class="boss-manage__items">
          <view v-for="boss in activeBosses" :key="boss.id" class="boss-manage__card">
            <boss-card
              :name="boss.name"
              :emoji="boss.emoji"
              :current-hp="boss.currentHp"
              :max-hp="boss.maxHp"
              :status="boss.status"
              :difficulty="getDifficultyLabel(boss)"
              :story="boss.story"
              :attack-ratio="boss.attackRatio"
              :kill-reward-coins="boss.killRewardCoins"
              :end-time="boss.endTime"
            />
            <view class="boss-manage__card-actions">
              <view class="boss-manage__boss-btn" @tap="editBoss(boss)">
                <text class="boss-manage__boss-btn-icon">✏️</text>
                <text class="boss-manage__boss-btn-text">编辑</text>
              </view>
              <view class="boss-manage__boss-btn boss-manage__boss-btn--primary" @tap="refreshBoss(boss)">
                <text class="boss-manage__boss-btn-icon">🔄</text>
                <text class="boss-manage__boss-btn-text">重生</text>
              </view>
              <view class="boss-manage__boss-btn boss-manage__boss-btn--danger" @tap="endBoss(boss)">
                <text class="boss-manage__boss-btn-icon">⏹</text>
                <text class="boss-manage__boss-btn-text">结束</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 已击败 Tab -->
      <view v-if="tabIndex === 1">
        <view v-if="bossStore.isLoading === true && defeatedBosses.length === 0" class="boss-manage__loading">
          <view class="boss-manage__spinner" />
        </view>
        <view v-else-if="defeatedBosses.length === 0" class="boss-manage__empty">
          <text class="boss-manage__empty-emoji">🏆</text>
          <text class="boss-manage__empty-title">暂无已击败的BOSS</text>
          <text class="boss-manage__empty-desc">BOSS被击杀后会出现在这里</text>
        </view>
        <view v-else class="boss-manage__items">
          <view v-for="boss in defeatedBosses" :key="boss.id" class="boss-manage__card">
            <boss-card
              :name="boss.name"
              :emoji="boss.emoji"
              :current-hp="boss.currentHp"
              :max-hp="boss.maxHp"
              :status="boss.status"
              :difficulty="getDifficultyLabel(boss)"
              :story="boss.story"
              :attack-ratio="boss.attackRatio"
              :kill-reward-coins="boss.killRewardCoins"
              :end-time="boss.endTime"
            />
            <view class="boss-manage__card-actions">
              <view class="boss-manage__boss-btn boss-manage__boss-btn--primary" @tap="rebirthBoss(boss)">
                <text class="boss-manage__boss-btn-icon">🔄</text>
                <text class="boss-manage__boss-btn-text">重生</text>
              </view>
              <view class="boss-manage__boss-btn boss-manage__boss-btn--danger" @tap="deleteBoss(boss.id)">
                <text class="boss-manage__boss-btn-icon">🗑</text>
                <text class="boss-manage__boss-btn-text">删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 未启用 Tab -->
      <view v-if="tabIndex === 2">
        <view v-if="bossStore.isLoading === true && inactiveBosses.length === 0" class="boss-manage__loading">
          <view class="boss-manage__spinner" />
        </view>
        <view v-else-if="inactiveBosses.length === 0" class="boss-manage__empty">
          <text class="boss-manage__empty-emoji">📝</text>
          <text class="boss-manage__empty-title">暂无未启用的BOSS</text>
          <text class="boss-manage__empty-desc">草稿和已过期的BOSS会出现在这里</text>
        </view>
        <view v-else class="boss-manage__items">
          <view v-for="boss in inactiveBosses" :key="boss.id" class="boss-manage__card">
            <boss-card
              :name="boss.name"
              :emoji="boss.emoji"
              :current-hp="boss.currentHp"
              :max-hp="boss.maxHp"
              :status="boss.status"
              :difficulty="getDifficultyLabel(boss)"
              :story="boss.story"
              :attack-ratio="boss.attackRatio"
              :kill-reward-coins="boss.killRewardCoins"
              :end-time="boss.endTime"
            />
            <view class="boss-manage__card-actions">
              <view class="boss-manage__boss-btn boss-manage__boss-btn--primary" @tap="activateBoss(boss)">
                <text class="boss-manage__boss-btn-icon">▶</text>
                <text class="boss-manage__boss-btn-text">启用</text>
              </view>
              <view class="boss-manage__boss-btn" @tap="editBoss(boss)">
                <text class="boss-manage__boss-btn-icon">✏️</text>
                <text class="boss-manage__boss-btn-text">编辑</text>
              </view>
              <view class="boss-manage__boss-btn boss-manage__boss-btn--danger" @tap="deleteBoss(boss.id)">
                <text class="boss-manage__boss-btn-icon">🗑</text>
                <text class="boss-manage__boss-btn-text">删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 创建按钮 -->
    <view class="boss-manage__fab" @tap="createBoss">
      <text class="boss-manage__fab-icon">＋</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useBossStore } from "@/stores/boss";
import type { Boss } from "@/models/boss";
import { BOSS_DIFFICULTY_LABELS } from "@/models/boss";

const bossStore = useBossStore();
const tabIndex = ref(0);
const isRefreshing = ref(false);

const tabs = [
  { label: "已启用" },
  { label: "已击败" },
  { label: "未启用" },
];

const allBossesList = computed(() => bossStore.allBosses.value || []);

const activeBosses = computed(() =>
  allBossesList.value.filter((b: Boss) => b.status === "active")
);

const defeatedBosses = computed(() =>
  allBossesList.value.filter((b: Boss) => b.status === "defeated")
);

const inactiveBosses = computed(() =>
  allBossesList.value.filter((b: Boss) => b.status === "draft" || b.status === "expired")
);

onMounted(() => {
  uni.$on('logined',data => {
    console.log(data)
  })
  bossStore.loadAll();
});

async function handleRefresh() {
  isRefreshing.value = true;
  await bossStore.loadAll();
  isRefreshing.value = false;
}

function switchTab(index: number) {
  tabIndex.value = index;
}

function getDifficultyLabel(boss: Boss): string {
  return BOSS_DIFFICULTY_LABELS[boss.difficulty || "普通"] || "普通";
}

function createBoss() {
  uni.navigateTo({ url: "/pages/boss-manage/edit/index" });
}

function editBoss(boss: Boss) {
  const params = encodeURIComponent(JSON.stringify({ id: boss.id }));
  uni.navigateTo({ url: `/pages/boss-manage/edit/index?params=${params}` });
}

function refreshBoss(boss: Boss) {
  uni.showModal({
    title: "BOSS 重生",
    content: `确定要重生 BOSS "${boss.name}" 吗？血量将重置为 ${boss.maxHp}。`,
    confirmColor: "#6ad6ff",
    success: async (res) => {
      if (res.confirm) {
        const result = await bossStore.refreshBossState(boss.id);
        uni.showToast({ title: result ? "✅ BOSS已重生" : "❌ 操作失败", icon: result ? "success" : "none" });
      }
    },
  });
}

function endBoss(boss: Boss) {
  uni.showModal({
    title: "确认结束",
    content: `确定要结束 BOSS "${boss.name}" 吗？结束后将移至「未启用」。`,
    confirmColor: "#ff6b35",
    success: async (res) => {
      if (res.confirm) {
        const result = await bossStore.endBoss(boss.id);
        uni.showToast({ title: result ? "✅ BOSS已结束" : "❌ 操作失败", icon: result ? "success" : "none" });
      }
    },
  });
}

function rebirthBoss(boss: Boss) {
  uni.showModal({
    title: "BOSS 重生",
    content: `将以 "${boss.name}" 为模板创建一个新 BOSS（草稿状态）。`,
    confirmColor: "#00b894",
    success: async (res) => {
      if (res.confirm) {
        uni.showToast({ title: "功能开发中", icon: "none" });
      }
    },
  });
}

function activateBoss(boss: Boss) {
  uni.showModal({
    title: "启用 BOSS",
    content: `确定要启用 BOSS "${boss.name}" 吗？当前启用中的其他 BOSS 将被自动结束。`,
    confirmColor: "#00b894",
    success: async (res) => {
      if (res.confirm) {
        uni.showToast({ title: "功能开发中", icon: "none" });
      }
    },
  });
}

function deleteBoss(id: number) {
  uni.showModal({
    title: "确认删除",
    content: "确定要删除此 BOSS 吗？此操作不可恢复。",
    confirmColor: "#e74c3c",
    success: async (res) => {
      if (res.confirm) {
        const result = await bossStore.deleteBoss(id);
        uni.showToast({ title: result ? "✅ BOSS已删除" : "❌ 操作失败", icon: result ? "success" : "none" });
      }
    },
  });
}
</script>

<style lang="scss" scoped>
.boss-manage {
  min-height: 100vh;
  background: $bg-primary;
  position: relative;

  &__tabs {
    display: flex;
    margin: 32rpx;
    padding: 8rpx;
    background: $bg-card;
    border-radius: 60rpx;
    border: 2rpx solid rgba(106, 214, 255, 0.1);
    flex-shrink: 0;
  }

  &__tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16rpx 0;
    border-radius: 52rpx;
    transition: all 0.2s ease;
  }

  &__tab--active {
    background: $accent-cyan;
    box-shadow: 0 0 30rpx rgba(106, 214, 255, 0.3);
  }

  &__tab-text {
    font-size: 28rpx;
    font-weight: 500;
    color: $text-secondary;
  }

  &__tab--active &__tab-text {
    color: $bg-primary;
    font-weight: bold;
  }

  &__scroll {
    height: calc(100vh - 120rpx);
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

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 160rpx 80rpx;

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

  &__items {
    padding: 0 32rpx 180rpx;
    display: flex;
    flex-direction: column;
    gap: 32rpx;
  }

  /* 卡片整体：boss-card + 操作按钮 */
  &__card {
    background: $bg-card;
    border-radius: 40rpx;
    border: 2rpx solid $border-subtle;
    overflow: hidden;
  }

  &__card-actions {
    display: flex;
    gap: 16rpx;
    padding: 16rpx 24rpx 24rpx;
  }

  &__boss-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 16rpx 24rpx;
    border-radius: 50rpx;
    background: $bg-surface;
    border: 2rpx solid $border-subtle;
  }

  &__boss-btn--primary {
    background: rgba(255, 107, 53, 0.1);
    border-color: rgba(255, 107, 53, 0.3);
  }

  &__boss-btn--danger {
    background: rgba(231, 76, 60, 0.1);
    border-color: rgba(231, 76, 60, 0.3);
  }

  &__boss-btn-icon {
    font-size: 28rpx;
  }

  &__boss-btn-text {
    font-size: 26rpx;
    font-weight: bold;
    color: $text-primary;
  }

  &__boss-btn--primary &__boss-btn-text {
    color: $accent-orange;
  }

  &__boss-btn--danger &__boss-btn-text {
    color: $hp-red;
  }

  /* 悬浮创建按钮 */
  &__fab {
    position: fixed;
    bottom: 40rpx;
    right: 40rpx;
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, $accent-cyan, #8be4ff);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 32rpx rgba(106, 214, 255, 0.3);
    z-index: 100;
  }

  &__fab-icon {
    font-size: 56rpx;
    font-weight: 200;
    color: $bg-primary;
    line-height: 1;
  }
}
</style>
