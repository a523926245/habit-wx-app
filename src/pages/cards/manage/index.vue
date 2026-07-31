<!-- 卡牌管理 - 勇者乐园深色赛博朋克主题 -->
<template>
  <view class="card-manage">
    <!-- Tab 选项卡 -->
    <view v-if="!isMultiSelect" class="card-manage__tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="tab.key"
        class="card-manage__tab"
        :class="{ 'card-manage__tab--active': tabIndex === index }"
        @tap="switchTab(index)"
      >
        <text class="card-manage__tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 卡片列表 -->
    <scroll-view scroll-y class="card-manage__list">
      <view v-if="isLoading && cards.length === 0" class="card-manage__loading">
        <view class="card-manage__spinner" />
      </view>
      <view v-else-if="filteredCards.length === 0" class="card-manage__empty">
        <text class="card-manage__empty-emoji">📇</text>
        <text class="card-manage__empty-title">还没有卡牌</text>
        <text class="card-manage__empty-desc">点击右下角 ＋ 创建第一张卡牌吧！</text>
      </view>
      <view v-else class="card-manage__items">
        <view
          v-for="card in filteredCards"
          :key="card.id"
          class="card-manage__item"
          :class="{ 'card-manage__item--expired': card.status === 'inactive' }"
          :style="{ borderLeftColor: getTypeColor(card.type) }"
          @tap="handleCardTap(card)"
          @longpress="handleLongPress(card)"
        >
          <!-- 多选 checkbox -->
          <view v-if="isMultiSelect" class="card-manage__checkbox">
            <view
              class="card-manage__checkbox-circle"
              :class="{ 'card-manage__checkbox-circle--checked': selectedIds.has(card.id) }"
              @tap.stop="toggleSelect(card.id)"
            >
              <view v-if="selectedIds.has(card.id)" class="card-manage__checkbox-check" />
            </view>
          </view>

          <!-- 图标 -->
          <view class="card-manage__item-icon" :style="{ borderColor: getTypeColor(card.type) + '40' }">
            <image
              v-if="card.coverType === 'image'"
              class="card-manage__item-cover"
              :src="card.coverValue"
              mode="aspectFill"
            />
            <text v-else class="card-manage__item-emoji">{{ card.coverValue }}</text>
          </view>

          <!-- 信息 -->
          <view class="card-manage__item-content">
            <view class="card-manage__item-header">
              <text class="card-manage__item-title" :style="{ color: card.status === 'inactive' ? '#a9a9c2' : '#e8e8f0' }">
                {{ card.title }}
              </text>
              <view
                v-if="card.status === 'inactive'"
                class="card-manage__item-badge card-manage__item-badge--expired"
              >
                <text class="card-manage__item-badge-text">已过期</text>
              </view>
              <view
                v-else
                class="card-manage__item-badge"
                :style="{ borderColor: getTypeColor(card.type) + '40' }"
              >
                <text class="card-manage__item-badge-text" :style="{ color: getTypeColor(card.type) }">
                  {{ getTypeLabel(card.type) }}
                </text>
              </view>
            </view>

            <view class="card-manage__item-rewards">
              <view class="card-manage__reward-tag">
                <text class="card-manage__reward-icon">🪙</text>
                <text class="card-manage__reward-value">{{ card.coinReward }}</text>
              </view>
              <view class="card-manage__reward-tag card-manage__reward-tag--damage">
                <text class="card-manage__reward-icon">⚔️</text>
                <text class="card-manage__reward-value">{{ card.bossDamage }}</text>
              </view>
              <view v-if="card.repeatDays && card.repeatDays.length > 0" class="card-manage__repeat-tag">
                <text class="card-manage__repeat-text">{{ card.repeatDays.join(', ') }}</text>
              </view>
            </view>

            <view v-if="card.expireDate" class="card-manage__item-expire">
              <text class="card-manage__expire-icon">📅</text>
              <text class="card-manage__expire-text">截至 {{ card.expireDate }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部多选操作栏 -->
    <view v-if="isMultiSelect && selectedIds.size > 0" class="card-manage__batch-bar">
      <button class="card-manage__batch-btn" @tap="confirmBatchDelete">
        删除 ({{ selectedIds.size }})
      </button>
    </view>

    <!-- 悬浮创建按钮 -->
    <view v-if="!isMultiSelect" class="card-manage__fab" @tap="goToEdit">
      <text class="card-manage__fab-icon">＋</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCardStore } from "@/stores/card";
import { useAuthStore } from "@/stores/auth";
import { getCards, batchDeleteCards, deleteCard } from "@/api/cards";
import { parseTaskCard } from "@/models/card";
import type { TaskCard } from "@/models/card";
import { EMOJI_OPTIONS, CARD_TYPE_LABELS } from "@/config/game";

const cardStore = useCardStore();
const authStore = useAuthStore();

const isMultiSelect = ref(false);
const selectedIds = ref(new Set<number>());
const tabIndex = ref(0);
const isLoading = ref(false);

const tabs = [
  { key: "daily", label: "每日任务" },
  { key: "weekly", label: "每周任务" },
  { key: "monthly", label: "每月任务" },
];

const cards = ref<TaskCard[]>([]);

const activeCards = computed(() =>
  cards.value.filter((c) => c.status === "active")
);

const filteredCards = computed(() => {
  const currentTab = tabs[tabIndex.value].key;
  return activeCards.value.filter((c) => c.type === currentTab);
});

const isParent = computed(() => authStore.isParent);

onMounted(() => {
  loadCards();
});

async function loadCards() {
  isLoading.value = true;
  try {
    const result = await cardStore.loadAll();
    // cards 由 store 管理，直接从 store 取
    cards.value = [];
    // 从 store 的 allAssignments 中提取卡牌
    // 简化：直接调用 API
    const cardsResult = await getCards();
    if (cardsResult.success && cardsResult.data?.cards) {
      cards.value = cardsResult.data.cards.map((c: any) => parseTaskCard(c as Record<string, unknown>));
    }
  } catch {
    uni.showToast({ title: "加载失败", icon: "none" });
  } finally {
    isLoading.value = false;
  }
}

function switchTab(index: number) {
  tabIndex.value = index;
}

function handleCardTap(card: TaskCard) {
  if (isMultiSelect.value) {
    toggleSelect(card.id);
  } else if (isParent.value && card.status !== "inactive") {
    uni.navigateTo({ url: `/pages/cards/edit/index?id=${card.id}` });
  }
}

function handleLongPress(card: TaskCard) {
  if (card.status === "inactive" || !isParent.value) return;
  isMultiSelect.value = true;
  selectedIds.value = new Set([card.id]);
}

function exitMultiSelect() {
  isMultiSelect.value = false;
  selectedIds.value = new Set();
}

function toggleSelect(id: number) {
  const next = new Set(selectedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedIds.value = next;
}

function selectAll() {
  if (selectedIds.value.size === filteredCards.value.length) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(filteredCards.value.map((c) => c.id));
  }
}

function confirmBatchDelete() {
  uni.showModal({
    title: "确认删除",
    content: `确定要删除选中的 ${selectedIds.value.size} 张卡牌吗？\n关联的分配记录也会被删除。`,
    confirmColor: "#e74c3c",
    success: async (res) => {
      if (res.confirm) {
        try {
          const ids = Array.from(selectedIds.value);
          const result = await batchDeleteCards(ids);
          if (result.success) {
            uni.showToast({ title: `已删除 ${ids.length} 张卡牌`, icon: "success" });
            exitMultiSelect();
            await loadCards();
          } else {
            uni.showToast({ title: "删除失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: "删除失败", icon: "none" });
        }
      }
    },
  });
}

function goToEdit() {
  uni.navigateTo({ url: "/pages/cards/edit/index" });
}

function getTypeColor(type: string): string {
  switch (type) {
    case "daily":
      return "#6ad6ff";
    case "weekly":
      return "#ff6b35";
    case "monthly":
      return "#f0dc2b";
    default:
      return "#a9a9c2";
  }
}

function getTypeLabel(type: string): string {
  return CARD_TYPE_LABELS[type as keyof typeof CARD_TYPE_LABELS] || type;
}
</script>

<style lang="scss" scoped>
.card-manage {
  height: 100vh;
  background: $bg-primary;
  display: flex;
  flex-direction: column;

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

  &__list {
    flex: 1;
    padding: 0 0 18rpx;
    overflow-x: hidden;
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
    to { transform: rotate(360deg); }
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
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    padding: 0 32rpx;
  }

  &__item {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    padding: 32rpx;
    background: $bg-card;
    border-radius: 24rpx;
    border-left: 12rpx solid;
  }

  &__item--expired {
    opacity: 0.6;
  }

  &__checkbox {
    padding-right: 24rpx;
    display: flex;
    align-items: flex-start;
    padding-top: 8rpx;
  }

  &__checkbox-circle {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    border: 3rpx solid $accent-cyan;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__checkbox-circle--checked {
    background: $accent-cyan;
  }

  &__checkbox-check {
    width: 20rpx;
    height: 32rpx;
    border-right: 4rpx solid $bg-primary;
    border-bottom: 4rpx solid $bg-primary;
    transform: rotate(45deg) translate(-2rpx, -2rpx);
  }

  &__item-icon {
    width: 128rpx;
    height: 128rpx;
    border-radius: 32rpx;
    border: 4rpx solid;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 24rpx;
    background: rgba(106, 214, 255, 0.05);
  }

  &__item-emoji {
    font-size: 64rpx;
  }

  &__item-cover {
    width: 100%;
    height: 100%;
    border-radius: 28rpx;
  }

  &__item-content {
    flex: 1;
    min-width: 0;
  }

  &__item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__item-title {
    flex: 1;
    font-size: 36rpx;
    font-weight: bold;
    margin-right: 16rpx;
  }

  &__item-badge {
    padding: 6rpx 16rpx;
    border-radius: 16rpx;
    border: 2rpx solid;
    flex-shrink: 0;
  }

  &__item-badge--expired {
    background: rgba(231, 76, 60, 0.1);
    border-color: transparent;
  }

  &__item-badge-text {
    font-size: 22rpx;
    font-weight: bold;
  }

  &__item-rewards {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 24rpx;
  }

  &__reward-tag {
    display: flex;
    align-items: center;
    padding: 8rpx 16rpx;
    border-radius: 12rpx;
    background: rgba(240, 220, 43, 0.1);
  }

  &__reward-tag--damage {
    background: rgba(106, 214, 255, 0.1);
  }

  &__reward-icon {
    font-size: 22rpx;
    margin-right: 4rpx;
  }

  &__reward-value {
    font-size: 26rpx;
    font-weight: bold;
    color: #f0dc2b;
  }

  &__reward-tag--damage &__reward-value {
    color: $accent-cyan;
  }

  &__repeat-tag {
    padding: 6rpx 12rpx;
    border-radius: 12rpx;
    background: rgba(169, 169, 194, 0.1);
  }

  &__repeat-text {
    font-size: 22rpx;
    color: $text-secondary;
  }

  &__item-expire {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
    gap: 8rpx;
  }

  &__expire-icon {
    font-size: 20rpx;
  }

  &__expire-text {
    font-size: 24rpx;
    color: $text-secondary;
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
    z-index: 10;
  }

  &__fab-icon {
    font-size: 56rpx;
    font-weight: 200;
    color: $bg-primary;
    line-height: 1;
  }

  &__batch-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 32rpx;
    background: $bg-secondary;
    border-top: 2rpx solid $border-subtle;
  }

  &__batch-btn {
    width: 100%;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    background: $hp-red;
    border-radius: 24rpx;
    border: none;
  }
}
</style>
