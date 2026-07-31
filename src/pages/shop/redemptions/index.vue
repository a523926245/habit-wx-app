<!-- 兑换记录 - 家长端查看所有兑换历史 -->
<template>
  <view class="redemptions">
    <!-- Tab 选项卡 -->
    <view class="redemptions__tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="redemptions__tab"
        :class="{ 'redemptions__tab--active': tabIndex === index }"
        @tap="switchTab(index)"
      >
        <text class="redemptions__tab-text">{{ tab.label }} ({{ tab.count }})</text>
      </view>
    </view>

    <!-- 记录列表 -->
    <scroll-view scroll-y class="redemptions__scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <!-- 加载中 -->
      <view v-if="loading && records.length === 0" class="redemptions__loading">
        <view class="redemptions__spinner" />
      </view>

      <!-- 空状态 -->
      <view v-else-if="filteredRecords.length === 0" class="redemptions__empty">
        <text class="redemptions__empty-emoji">📝</text>
        <text class="redemptions__empty-title">暂无兑换记录</text>
        <text class="redemptions__empty-desc">孩子兑换商品后会显示在这里</text>
      </view>

      <!-- 记录列表 -->
      <view v-else class="redemptions__items">
        <view
          v-for="record in filteredRecords"
          :key="record.id"
          class="redemptions__card"
        >
          <!-- 商品信息 -->
          <view class="redemptions__card-header">
            <view class="redemptions__card-emoji">
              <text>{{ record.itemEmoji || '🎁' }}</text>
            </view>
            <view class="redemptions__card-info">
              <text class="redemptions__card-name">{{ record.itemName || '未知商品' }}</text>
              <text class="redemptions__card-user">{{ record.userNickname || '未知用户' }} · {{ formatDate(record.createdAt) }}</text>
            </view>
            <view class="redemptions__card-price">
              <text class="redemptions__card-price-text">{{ record.itemPrice || 0 }} 💰</text>
            </view>
          </view>

          <!-- 状态徽章 -->
          <view class="redemptions__card-footer">
            <view class="redemptions__status-badge" :style="{ background: getStatusColor(record.status) + '15', borderColor: getStatusColor(record.status) + '40' }">
              <text class="redemptions__status-text" :style="{ color: getStatusColor(record.status) }">{{ getStatusLabel(record.status) }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getShopRedemptions } from "@/api/shop";
import { parseRedemption } from "@/models/shop";
import type { Redemption } from "@/models/shop";
import { getAppMessage } from "@/config/errors";

/** Tab 配置 */
const tabs = ref([
  { label: "全部", key: "all", count: 0 },
  { label: "待确认", key: "pending", count: 0 },
  { label: "已确认", key: "confirmed", count: 0 },
  { label: "已拒绝", key: "rejected", count: 0 },
]);

const tabIndex = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const records = ref<Redemption[]>([]);

/** 过滤后的记录 */
const filteredRecords = computed(() => {
  const key = tabs.value[tabIndex.value].key;
  if (key === "all") {
    return records.value;
  }
  return records.value.filter((r) => r.status === key);
});

/** 获取状态颜色 */
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#ff6b35",
    confirmed: "#00b894",
    rejected: "#e74c3c",
  };
  return colors[status] || "#a9a9c2";
}

/** 获取状态标签 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "待确认",
    confirmed: "已确认",
    rejected: "已拒绝",
  };
  return labels[status] || "未知";
}

/** 格式化日期 */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
}

/** 切换 Tab */
function switchTab(index: number) {
  tabIndex.value = index;
}

/** 加载兑换记录 */
async function loadRecords() {
  loading.value = true;
  try {
    const result = await getShopRedemptions();
    if (result.success && result.data) {
      records.value = (result.data.redemptions || []).map((item) =>
        parseRedemption(item as unknown as Record<string, unknown>)
      );
      // 更新 tab 计数
      tabs.value[0].count = records.value.length;
      tabs.value[1].count = records.value.filter((r) => r.status === "pending").length;
      tabs.value[2].count = records.value.filter((r) => r.status === "confirmed").length;
      tabs.value[3].count = records.value.filter((r) => r.status === "rejected").length;
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_REDEMPTIONS_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 下拉刷新 */
async function handleRefresh() {
  isRefreshing.value = true;
  await loadRecords();
  isRefreshing.value = false;
}

onMounted(() => {
  loadRecords();
});
</script>

<style lang="scss" scoped>
.redemptions {
  min-height: 100vh;
  background: $bg-primary;

  /* Tab 选项卡 */
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
    font-size: 24rpx;
    font-weight: 500;
    color: $text-secondary;
  }

  &__tab--active &__tab-text {
    color: $bg-primary;
    font-weight: bold;
  }

  /* 列表区域 */
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

  /* 空状态 */
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

  /* 记录卡片 */
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
    gap: 20rpx;
  }

  &__card-emoji {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: rgba(255, 107, 53, 0.1);
    border: 3rpx solid rgba(255, 107, 53, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 36rpx;
  }

  &__card-info {
    flex: 1;
    min-width: 0;
  }

  &__card-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-user {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__card-price {
    flex-shrink: 0;
  }

  &__card-price-text {
    font-size: 26rpx;
    font-weight: 600;
    color: $accent-orange;
  }

  /* 状态徽章 */
  &__card-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20rpx;
  }

  &__status-badge {
    padding: 6rpx 16rpx;
    border-radius: 16rpx;
    border: 2rpx solid;
  }

  &__status-text {
    font-size: 22rpx;
    font-weight: 600;
  }
}
</style>
