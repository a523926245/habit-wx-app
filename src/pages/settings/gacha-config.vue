<!-- 扭蛋配置 - 配置扭蛋品级和概率 -->
<template>
  <view class="gacha-config">
    <scroll-view scroll-y class="gacha-config__scroll">
      <!-- 加载中 -->
      <view v-if="loading" class="gacha-config__loading">
        <view class="gacha-config__spinner" />
      </view>

      <view v-else class="gacha-config__content">
        <!-- 配置说明 -->
        <view class="gacha-config__desc">
          <text class="gacha-config__desc-text">配置扭蛋品级的价格和兑换券概率</text>
        </view>

        <!-- 扭蛋列表 -->
        <view class="gacha-config__items">
          <view
            v-for="item in configs"
            :key="item.tier"
            class="gacha-config__card"
          >
            <view class="gacha-config__card-header">
              <text class="gacha-config__card-emoji">{{ item.emoji }}</text>
              <text class="gacha-config__card-name">{{ item.name }}</text>
            </view>

            <view class="gacha-config__card-fields">
              <view class="gacha-config__field">
                <text class="gacha-config__field-label">商城价格</text>
                <input
                  v-model="item.shopPrice"
                  class="gacha-config__input"
                  type="number"
                  placeholder="30"
                />
              </view>
              <view class="gacha-config__field">
                <text class="gacha-config__field-label">金币范围</text>
                <view class="gacha-config__range">
                  <input
                    v-model="item.coinMin"
                    class="gacha-config__input gacha-config__input--small"
                    type="number"
                    placeholder="5"
                  />
                  <text class="gacha-config__range-sep">~</text>
                  <input
                    v-model="item.coinMax"
                    class="gacha-config__input gacha-config__input--small"
                    type="number"
                    placeholder="55"
                  />
                </view>
              </view>
            </view>

            <!-- 兑换券概率 -->
            <view class="gacha-config__card-probs">
              <text class="gacha-config__card-probs-title">兑换券概率</text>
              <view class="gacha-config__prob-row">
                <text class="gacha-config__prob-label">铜券</text>
                <input
                  v-model="item.voucherCopperRate"
                  class="gacha-config__input gacha-config__input--tiny"
                  type="digit"
                  placeholder="0"
                />
                <text class="gacha-config__prob-unit">%</text>
              </view>
              <view class="gacha-config__prob-row">
                <text class="gacha-config__prob-label">银券</text>
                <input
                  v-model="item.voucherSilverRate"
                  class="gacha-config__input gacha-config__input--tiny"
                  type="digit"
                  placeholder="0"
                />
                <text class="gacha-config__prob-unit">%</text>
              </view>
              <view class="gacha-config__prob-row">
                <text class="gacha-config__prob-label">金券</text>
                <input
                  v-model="item.voucherGoldRate"
                  class="gacha-config__input gacha-config__input--tiny"
                  type="digit"
                  placeholder="0"
                />
                <text class="gacha-config__prob-unit">%</text>
              </view>
              <view class="gacha-config__prob-row">
                <text class="gacha-config__prob-label">传说券</text>
                <input
                  v-model="item.voucherLegendaryRate"
                  class="gacha-config__input gacha-config__input--tiny"
                  type="digit"
                  placeholder="0"
                />
                <text class="gacha-config__prob-unit">%</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="gacha-config__footer">
      <button class="gacha-config__save-btn" :disabled="saving" @tap="saveConfig">
        <text>{{ saving ? '保存中...' : '保存配置' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getGachaConfig, updateGachaConfig } from "@/api/magicBox";
import { getAppMessage } from "@/config/errors";

interface GachaConfigItem {
  tier: number;
  name: string;
  emoji: string;
  shopPrice: string;
  coinMin: string;
  coinMax: string;
  voucherCopperRate: string;
  voucherSilverRate: string;
  voucherGoldRate: string;
  voucherLegendaryRate: string;
}

const loading = ref(false);
const saving = ref(false);
const configs = ref<GachaConfigItem[]>([]);

/** 加载配置 */
async function loadConfig() {
  loading.value = true;
  try {
    const result = await getGachaConfig();
    if (result.success && result.data) {
      configs.value = (result.data.configs || []).map((c) => ({
        tier: c.tier,
        name: c.name,
        emoji: c.emoji,
        shopPrice: String(c.shopPrice || c.shop_price || 0),
        coinMin: String(c.coinMin || c.coin_min || 0),
        coinMax: String(c.coinMax || 0),
        voucherCopperRate: String(c.voucherCopperRate || 0),
        voucherSilverRate: String(c.voucherSilverRate || 0),
        voucherGoldRate: String(c.voucherGoldRate || 0),
        voucherLegendaryRate: String(c.voucherLegendaryRate || 0),
      }));
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_STATUS_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 保存配置 */
async function saveConfig() {
  saving.value = true;
  try {
    for (const item of configs.value) {
      await updateGachaConfig(item.tier, {
        shop_price: parseInt(item.shopPrice, 10) || 0,
        coin_min: parseInt(item.coinMin, 10) || 0,
        coin_max: parseInt(item.coinMax, 10) || 0,
        voucher_copper_rate: parseFloat(item.voucherCopperRate) || 0,
        voucher_silver_rate: parseFloat(item.voucherSilverRate) || 0,
        voucher_gold_rate: parseFloat(item.voucherGoldRate) || 0,
        voucher_legendary_rate: parseFloat(item.voucherLegendaryRate) || 0,
      });
    }
    uni.showToast({ title: "保存成功", icon: "success" });
  } catch {
    uni.showToast({ title: getAppMessage("UPDATE_FAILED"), icon: "none" });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadConfig();
});
</script>

<style lang="scss" scoped>
.gacha-config {
  min-height: 100vh;
  background: $bg-primary;
  display: flex;
  flex-direction: column;

  &__scroll {
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
    to {
      transform: rotate(360deg);
    }
  }

  &__content {
    padding: 32rpx;
  }

  &__desc {
    padding: 24rpx;
    background: $bg-card;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    margin-bottom: 32rpx;
  }

  &__desc-text {
    font-size: 26rpx;
    color: $text-secondary;
  }

  /* 扭蛋卡片 */
  &__items {
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

  &__card-emoji {
    font-size: 40rpx;
  }

  &__card-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
  }

  &__card-fields {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 20rpx;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__field-label {
    font-size: 24rpx;
    color: $text-secondary;
    width: 140rpx;
  }

  &__range {
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex: 1;
  }

  &__range-sep {
    font-size: 24rpx;
    color: $text-secondary;
  }

  &__input {
    flex: 1;
    height: 56rpx;
    padding: 0 16rpx;
    background: $bg-surface;
    border-radius: 12rpx;
    border: 2rpx solid $border-subtle;
    font-size: 26rpx;
    color: $text-primary;
    text-align: center;
  }

  &__input--small {
    flex: 1;
  }

  &__input--tiny {
    width: 100rpx;
    flex: none;
  }

  /* 概率配置 */
  &__card-probs {
    border-top: 2rpx solid $border-subtle;
    padding-top: 20rpx;
  }

  &__card-probs-title {
    font-size: 24rpx;
    font-weight: 600;
    color: $text-secondary;
    display: block;
    margin-bottom: 16rpx;
  }

  &__prob-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__prob-label {
    font-size: 24rpx;
    color: $text-secondary;
    width: 100rpx;
  }

  &__prob-unit {
    font-size: 24rpx;
    color: $text-secondary;
  }

  /* 底部保存 */
  &__footer {
    padding: 32rpx;
  }

  &__save-btn {
    width: 100%;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: bold;
    color: $bg-primary;
    background: linear-gradient(135deg, $accent-cyan, #8be4ff);
    border-radius: 28rpx;
    border: none;
  }

  &__save-btn:disabled {
    opacity: 0.6;
  }
}
</style>
