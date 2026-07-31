<!-- 我的待办 - 审核孩子提交的卡牌 + 兑换确认 -->
<template>
  <view class="pending">
    <!-- Tab 选项卡 -->
    <view class="pending__tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="pending__tab"
        :class="{ 'pending__tab--active': currentTab === index }"
        @tap="switchTab(index)"
      >
        <text class="pending__tab-text">{{ tab.label }} ({{ tab.count }})</text>
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view scroll-y class="pending__content" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <!-- 任务审核 Tab -->
      <view v-if="currentTab === 0">
        <view v-if="cardLoading && pendingCards.length === 0" class="pending__loading">
          <view class="pending__spinner" />
        </view>
        <view v-else-if="pendingCards.length === 0" class="pending__empty">
          <text class="pending__empty-emoji">🎉</text>
          <text class="pending__empty-title">没有待审核的任务</text>
          <text class="pending__empty-desc">孩子们完成任务后，这里会出现</text>
        </view>
        <view v-else class="pending__items">
          <view v-for="item in pendingCards" :key="item.id" class="pending__card">
            <!-- 金币奖励徽章 -->
            <view class="pending__card-reward-badge">
              <text class="pending__card-reward-text">+{{ item.coin_reward }}</text>
            </view>

            <view class="pending__card-body">
              <!-- 孩子信息 -->
              <view class="pending__card-child">
                <view class="pending__card-avatar">
                  <text class="pending__card-avatar-text">{{ getFirstChildLetter(item.child_name) }}</text>
                </view>
                <view class="pending__card-child-info">
                  <text class="pending__card-child-name">{{ item.child_name }}</text>
                  <text class="pending__card-child-date">{{ item.assigned_date }} 提交了申请</text>
                </view>
              </view>

              <!-- 任务内容 -->
              <view class="pending__card-task">
                <view class="pending__card-task-header">
                  <image
                    v-if="item.cover_type === 'image'"
                    class="pending__card-task-cover"
                    :src="item.cover_value"
                    mode="aspectFill"
                  />
                  <text v-else class="pending__card-task-emoji">{{ item.cover_value }}</text>
                  <text class="pending__card-task-title">{{ item.title }}</text>
                </view>
                <view v-if="item.submission_note" class="pending__card-note">
                  <text>"{{ item.submission_note }}"</text>
                </view>
              </view>

              <!-- BOSS伤害 -->
              <view class="pending__card-damage">
                <view class="pending__card-damage-badge">
                  <text class="pending__card-damage-icon">🔥</text>
                  <text class="pending__card-damage-value">{{ item.boss_damage }}</text>
                </view>
              </view>

              <!-- 操作按钮 -->
              <view class="pending__card-actions">
                <view class="pending__card-btn pending__card-btn--reject" @tap="handleReject(item)">
                  <text class="pending__card-btn-icon">✕</text>
                  <text class="pending__card-btn-text">驳回</text>
                </view>
                <view class="pending__card-btn pending__card-btn--approve" @tap="handleApprove(item)">
                  <text class="pending__card-btn-icon">✓</text>
                  <text class="pending__card-btn-text">批准</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 兑换确认 Tab -->
      <view v-if="currentTab === 1">
        <view v-if="redemptionLoading && pendingRedemptions.length === 0" class="pending__loading">
          <view class="pending__spinner" />
        </view>
        <view v-else-if="pendingRedemptions.length === 0" class="pending__empty">
          <text class="pending__empty-emoji">🎁</text>
          <text class="pending__empty-title">没有待确认的兑换</text>
          <text class="pending__empty-desc">孩子们兑换奖品后，这里会出现</text>
        </view>
        <view v-else class="pending__items">
          <view v-for="item in pendingRedemptions" :key="item.id" class="pending__redemption">
            <view class="pending__redemption-body">
              <!-- 物品信息 -->
              <view class="pending__redemption-header">
                <view class="pending__redemption-emoji">
                  <text>{{ item.item_emoji || '🎁' }}</text>
                </view>
                <view class="pending__redemption-info">
                  <text class="pending__redemption-name">{{ item.item_name }}</text>
                  <text class="pending__redemption-user">{{ item.user_name }} · {{ item.created_at?.substring(0, 10) }}</text>
                </view>
                <view class="pending__redemption-price">
                  <text class="pending__redemption-price-value">{{ item.price }}</text>
                </view>
              </view>

              <!-- 操作按钮 -->
              <view class="pending__redemption-actions">
                <view class="pending__redemption-btn pending__redemption-btn--reject" @tap="handleRejectRedemption(item)">
                  <text class="pending__redemption-btn-icon">✕</text>
                  <text class="pending__redemption-btn-text">拒绝</text>
                </view>
                <view class="pending__redemption-btn pending__redemption-btn--confirm" @tap="handleConfirmRedemption(item)">
                  <text class="pending__redemption-btn-icon">✓</text>
                  <text class="pending__redemption-btn-text">确认</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCardStore } from "@/stores/card";
import { getPending } from "@/api/cards";
import { getShopRedemptions, confirmRedemption, rejectRedemption } from "@/api/shop";
import { showToast } from "@/utils/toast";

const cardStore = useCardStore();

interface PendingCard {
  id: number;
  card_id: number;
  child_name: string;
  cover_type: string;
  cover_value: string;
  title: string;
  coin_reward: number;
  boss_damage: number;
  assigned_date: string;
  submission_note?: string;
}

interface PendingRedemption {
  id: number;
  item_name: string;
  item_emoji: string;
  user_name: string;
  price: number;
  created_at: string;
  status?: string;
}

const currentTab = ref(0);
const cardLoading = ref(false);
const redemptionLoading = ref(false);
const isRefreshing = ref(false);
const pendingCards = ref<PendingCard[]>([]);
const pendingRedemptions = ref<PendingRedemption[]>([]);

const tabs = ref([
  { label: "任务审核", count: 0 },
  { label: "兑换申请", count: 0 },
]);

onMounted(() => {
  loadPending();
  loadRedemptions();
});

/**
 * 下拉刷新处理
 */
async function handleRefresh() {
  isRefreshing.value = true;
  try {
    await Promise.all([loadPending(), loadRedemptions()]);
  } finally {
    isRefreshing.value = false;
  }
}

async function loadPending() {
  cardLoading.value = true;
  try {
    const result = await getPending();
    if (result.success && result.data?.pending) {
      pendingCards.value = (result.data.pending as unknown as PendingCard[]).map((item) => ({
        id: item.id,
        card_id: item.card_id ?? 0,
        child_name: (item as any).child_name ?? "未知",
        cover_type: (item as any).cover_type ?? "emoji",
        cover_value: (item as any).cover_value ?? "⭐",
        title: (item as any).title ?? "任务",
        coin_reward: (item as any).coin_reward ?? 0,
        boss_damage: (item as any).boss_damage ?? 0,
        assigned_date: (item as any).assigned_date ?? "",
        submission_note: (item as any).submission_note,
      }));
      tabs.value[0].count = pendingCards.value.length;
    } else if (!result.success) {
      console.error("[pending] 加载待审核任务失败:", result.error);
    }
  } catch (e) {
    console.error("[pending] 加载待审核任务异常:", e);
    showToast("加载任务失败", "error");
  } finally {
    cardLoading.value = false;
  }
}

async function loadRedemptions() {
  redemptionLoading.value = true;
  try {
    const result = await getShopRedemptions();
    if (result.success && result.data?.redemptions) {
      pendingRedemptions.value = (result.data.redemptions as unknown as PendingRedemption[]).filter(
        (r) => r.status === "pending"
      );
      tabs.value[1].count = pendingRedemptions.value.length;
    } else if (!result.success) {
      console.error("[pending] 加载兑换记录失败:", result.error);
    }
  } catch (e) {
    console.error("[pending] 加载待审核兑换异常:", e);
    showToast("加载兑换记录失败", "error");
  } finally {
    redemptionLoading.value = false;
  }
}

function switchTab(index: number) {
  currentTab.value = index;
}

async function handleApprove(item: PendingCard) {
  uni.showModal({
    title: "确认批准",
    content: `确定批准 "${item.title}" 吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await cardStore.approveAssignment(item.id);
          if (result) {
            uni.showToast({ title: `已批准 "${item.title}"`, icon: "success" });
            await loadPending();
          } else {
            uni.showToast({ title: "操作失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      }
    },
  });
}

async function handleReject(item: PendingCard) {
  uni.showModal({
    title: "确认驳回",
    content: `确定驳回 "${item.title}" 吗？`,
    confirmColor: "#e74c3c",
    success: async (res) => {
      if (res.confirm) {
        try {
          const ok = await cardStore.rejectAssignment(item.id, "未达标");
          if (ok) {
            uni.showToast({ title: `已驳回 "${item.title}"`, icon: "success" });
            await loadPending();
          } else {
            uni.showToast({ title: "操作失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      }
    },
  });
}

async function handleConfirmRedemption(item: PendingRedemption) {
  uni.showModal({
    title: "确认兑换",
    content: `确认给 "${item.user_name}" 兑换 "${item.item_name}" 吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await confirmRedemption(item.id);
          if (result?.success) {
            uni.showToast({ title: `已确认 "${item.item_name}"`, icon: "success" });
            await loadRedemptions();
          } else {
            uni.showToast({ title: "操作失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      }
    },
  });
}

async function handleRejectRedemption(item: PendingRedemption) {
  uni.showModal({
    title: "拒绝兑换",
    content: `拒绝 "${item.user_name}" 的兑换申请吗？`,
    confirmColor: "#e74c3c",
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await rejectRedemption(item.id);
          if (result?.success) {
            uni.showToast({ title: `已拒绝 "${item.item_name}"`, icon: "success" });
            await loadRedemptions();
          } else {
            uni.showToast({ title: "操作失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      }
    },
  });
}

function getFirstChildLetter(name: string): string {
  return name?.charAt(0) ?? "?";
}
</script>

<style lang="scss" scoped>
.pending {
  min-height: 100vh;
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

  &__content {
    flex: 1;
    height: calc(100vh - 140rpx);
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
    padding: 0 32rpx 32rpx;
    display: flex;
    flex-direction: column;
    gap: 32rpx;
  }

  /* 任务审核卡片 */
  &__card {
    position: relative;
    background: $bg-secondary;
    border-radius: 32rpx;
    border: 2rpx solid rgba(106, 214, 255, 0.1);
    overflow: hidden;
  }

  &__card-body {
    padding: 32rpx;
  }

  &__card-reward-badge {
    position: absolute;
    top: 0;
    right: 0;
    padding: 8rpx 24rpx;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 0 32rpx 0 24rpx;
  }

  &__card-reward-text {
    font-size: 24rpx;
    font-weight: bold;
    color: $accent-orange;
    letter-spacing: 1rpx;
  }

  &__card-child {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }

  &__card-avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background: rgba(106, 214, 255, 0.1);
    border: 4rpx solid rgba(106, 214, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__card-avatar-text {
    font-size: 36rpx;
    font-weight: bold;
    color: $accent-cyan;
  }

  &__card-child-info {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__card-child-name {
    font-size: 30rpx;
    font-weight: bold;
    color: $text-primary;
  }

  &__card-child-date {
    font-size: 24rpx;
    color: $text-secondary;
  }

  &__card-task {
    margin-top: 32rpx;
    padding: 28rpx;
    background: $bg-primary;
    border-radius: 24rpx;
  }

  &__card-task-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__card-task-emoji {
    font-size: 44rpx;
  }

  &__card-task-cover {
    width: 56rpx;
    height: 56rpx;
    border-radius: 12rpx;
  }

  &__card-task-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $accent-cyan;
    word-break: break-all;
    overflow-wrap: break-word;
  }

  &__card-note {
    margin-top: 24rpx;
    padding: 20rpx;
    background: $bg-secondary;
    border-radius: 16rpx;
    border: 2rpx solid rgba(169, 169, 194, 0.1);
  }

  &__card-note text {
    font-size: 26rpx;
    color: rgba(232, 232, 240, 0.8);
    font-style: italic;
    word-break: break-all;
    overflow-wrap: break-word;
  }

  &__card-damage {
    margin-top: 32rpx;
  }

  &__card-damage-badge {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 16rpx;
    width: fit-content;
  }

  &__card-damage-icon {
    font-size: 24rpx;
  }

  &__card-damage-value {
    font-size: 26rpx;
    font-weight: bold;
    color: $hp-red;
  }

  &__card-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20rpx;
    margin-top: 32rpx;
  }

  &__card-btn {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx 40rpx;
    border-radius: 24rpx;
  }

  &__card-btn--approve {
    background: $accent-cyan;
    box-shadow: 0 0 30rpx rgba(106, 214, 255, 0.3);
  }

  &__card-btn--reject {
    background: transparent;
    border: 2rpx solid $hp-red;
  }

  &__card-btn-icon {
    font-size: 24rpx;
    font-weight: bold;
  }

  &__card-btn--approve &__card-btn-icon {
    color: $bg-primary;
  }

  &__card-btn--reject &__card-btn-icon {
    color: $hp-red;
  }

  &__card-btn-text {
    font-size: 28rpx;
    font-weight: bold;
  }

  &__card-btn--approve &__card-btn-text {
    color: $bg-primary;
  }

  &__card-btn--reject &__card-btn-text {
    color: $hp-red;
  }

  /* 兑换卡片 */
  &__redemption {
    background: $bg-secondary;
    border-radius: 32rpx;
    border: 2rpx solid rgba(255, 107, 53, 0.2);
    overflow: hidden;
  }

  &__redemption-body {
    padding: 32rpx;
  }

  &__redemption-header {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }

  &__redemption-emoji {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background: rgba(255, 107, 53, 0.1);
    border: 4rpx solid rgba(255, 107, 53, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__redemption-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__redemption-name {
    font-size: 30rpx;
    font-weight: bold;
    color: $text-primary;
    word-break: break-all;
    overflow-wrap: break-word;
  }

  &__redemption-user {
    font-size: 24rpx;
    color: $text-secondary;
  }

  &__redemption-price {
    padding: 8rpx 24rpx;
    border-radius: 20rpx;
    background: rgba(255, 107, 53, 0.1);
    flex-shrink: 0;
  }

  &__redemption-price-value {
    font-size: 28rpx;
    font-weight: bold;
    color: $accent-orange;
  }

  &__redemption-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20rpx;
    margin-top: 32rpx;
  }

  &__redemption-btn {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx 40rpx;
    border-radius: 24rpx;
  }

  &__redemption-btn--confirm {
    background: $accent-cyan;
    box-shadow: 0 0 30rpx rgba(106, 214, 255, 0.3);
  }

  &__redemption-btn--reject {
    background: transparent;
    border: 2rpx solid $hp-red;
  }

  &__redemption-btn-icon {
    font-size: 24rpx;
    font-weight: bold;
  }

  &__redemption-btn--confirm &__redemption-btn-icon {
    color: $bg-primary;
  }

  &__redemption-btn--reject &__redemption-btn-icon {
    color: $hp-red;
  }

  &__redemption-btn-text {
    font-size: 28rpx;
    font-weight: bold;
  }

  &__redemption-btn--confirm &__redemption-btn-text {
    color: $bg-primary;
  }

  &__redemption-btn--reject &__redemption-btn-text {
    color: $hp-red;
  }
}
</style>
