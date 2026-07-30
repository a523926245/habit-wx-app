<!-- BOSS编辑 - 勇者乐园深色赛博朋克主题 -->
<template>
  <view class="boss-edit">
    <view class="boss-edit__form">
      <!-- Emoji 选择 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">BOSS形象</text>
        <view class="boss-edit__emoji-grid">
          <view
            v-for="emoji in emojiOptions"
            :key="emoji"
            class="boss-edit__emoji-item"
            :class="{ 'boss-edit__emoji-item--active': formData.emoji === emoji }"
            @tap="formData.emoji = emoji"
          >
            <text class="boss-edit__emoji-text">{{ emoji }}</text>
          </view>
        </view>
      </view>

      <!-- BOSS名称 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">BOSS名称</text>
        <input
          v-model="formData.name"
          class="boss-edit__input"
          placeholder="例如：暗影巨龙"
          maxlength="30"
        />
      </view>

      <!-- 最大血量 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">最大血量</text>
        <input
          v-model="formData.maxHp"
          class="boss-edit__input boss-edit__input--number"
          type="number"
          placeholder="1000"
        />
      </view>

      <!-- 难度 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">难度等级</text>
        <view class="boss-edit__type-row">
          <view
            v-for="(label, key) in difficultyLabels"
            :key="key"
            class="boss-edit__type-chip"
            :class="{ 'boss-edit__type-chip--active': formData.difficulty === key }"
            @tap="formData.difficulty = key"
          >
            <text class="boss-edit__type-chip-text">{{ label }}</text>
          </view>
        </view>
      </view>

      <!-- 背景故事 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">背景故事（可选）</text>
        <textarea
          v-model="formData.story"
          class="boss-edit__textarea"
          placeholder="这只BOSS的来历..."
          maxlength="200"
        />
      </view>

      <!-- 攻击倍率 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">攻击倍率</text>
        <input
          v-model="formData.attackRatio"
          class="boss-edit__input boss-edit__input--number"
          type="digit"
          placeholder="1.0"
        />
      </view>

      <!-- 击杀奖励金币 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">击杀奖励金币</text>
        <input
          v-model="formData.killRewardCoins"
          class="boss-edit__input boss-edit__input--number"
          type="number"
          placeholder="100"
        />
      </view>

      <!-- 结束时间 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">结束时间（可选）</text>
        <picker
          mode="date"
          field="date"
          start="2020-01-01"
          end="2030-12-31"
          :value="formData.endTime"
          @change="onEndDateChange"
        >
          <view class="boss-edit__date-field">
            <text class="boss-edit__date-label">到期自动变为未启用</text>
            <view class="boss-edit__date-value">
              <text class="boss-edit__date-icon">📅</text>
              <text class="boss-edit__date-text">{{ formData.endTime || '不设置' }}</text>
            </view>
          </view>
        </picker>
      </view>

      <!-- 状态 -->
      <view class="boss-edit__section">
        <text class="boss-edit__section-title">状态</text>
        <view class="boss-edit__type-row">
          <view
            v-for="s in statusOptions"
            :key="s.value"
            class="boss-edit__type-chip"
            :class="{ 'boss-edit__type-chip--active': formData.status === s.value }"
            @tap="formData.status = s.value"
          >
            <text class="boss-edit__type-chip-text">{{ s.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="boss-edit__footer">
      <button class="boss-edit__save-btn" :disabled="saving" @tap="handleSave">
        <view v-if="saving" class="boss-edit__save-spinner" />
        <text v-else>{{ isEdit ? '保存修改' : '创建BOSS' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useBossStore } from "@/stores/boss";
import { getBossList } from "@/api/boss";
import { parseBoss, BOSS_DIFFICULTY_LABELS } from "@/models/boss";

const bossStore = useBossStore();

const routeQuery = ref<Record<string, string>>({});

onLoad((query: Record<string, string> | undefined) => {
  if (query) {
    try {
      routeQuery.value = JSON.parse(decodeURIComponent(query.params || "{}"));
    } catch {
      routeQuery.value = {};
    }
  }
});

const isEdit = computed(() => !!routeQuery.value?.id);
const saving = ref(false);

const formData = ref({
  emoji: "🐉",
  name: "",
  maxHp: "1000",
  difficulty: "普通",
  story: "",
  attackRatio: "1.0",
  killRewardCoins: "100",
  endTime: "",
  status: "draft",
});

/** BOSS emoji选项 */
const emojiOptions = ["🐉", "🧟", "🤖", "👹", "🦂", "🐍", "🦇", "🕷️", "🐺", "🐻", "🗡️", "👾", "🦊", "🐲", "🐙"];

/** 难度标签映射 */
const difficultyLabels: Record<string, string> = BOSS_DIFFICULTY_LABELS;

/** 状态选项 */
const statusOptions = [
  { value: "draft", label: "草稿" },
  { value: "active", label: "启用" },
];

onMounted(async () => {
  if (isEdit.value) {
    await loadBossData();
  }
});

/** 加载BOSS数据（编辑模式） */
async function loadBossData() {
  try {
    const bossId = parseInt(routeQuery.value.id as string, 10);
    const result = await getBossList();
    if (result.success && result.data?.bosses) {
      const raw = result.data.bosses.find((b: { id: number }) => b.id === bossId);
      if (raw) {
        const boss = parseBoss(raw as Record<string, unknown>);
        formData.value = {
          emoji: boss.emoji,
          name: boss.name,
          maxHp: String(boss.maxHp),
          difficulty: boss.difficulty || "普通",
          story: boss.story || "",
          attackRatio: String(boss.attackRatio),
          killRewardCoins: String(boss.killRewardCoins),
          endTime: boss.endTime || "",
          status: boss.status,
        };
      }
    }
  } catch {
    uni.showToast({ title: "加载失败", icon: "none" });
  }
}

function onEndDateChange(e: { detail: { value: string } }) {
  formData.value.endTime = e.detail.value;
}

/** 保存BOSS */
async function handleSave() {
  if (!formData.value.name.trim()) {
    uni.showToast({ title: "请输入BOSS名称", icon: "none" });
    return;
  }

  saving.value = true;
  try {
    const params = {
      name: formData.value.name.trim(),
      emoji: formData.value.emoji,
      maxHp: parseInt(formData.value.maxHp, 10) || 1000,
      difficulty: formData.value.difficulty,
      story: formData.value.story.trim() || undefined,
      attackRatio: parseFloat(formData.value.attackRatio) || 1.0,
      killRewardCoins: parseInt(formData.value.killRewardCoins, 10) || 100,
      endTime: formData.value.endTime || undefined,
      status: formData.value.status,
    };

    let success = false;
    if (isEdit.value) {
      const bossId = parseInt(routeQuery.value.id as string, 10);
      success = await bossStore.updateBoss(bossId, params);
    } else {
      success = await bossStore.createBoss(params);
    }

    if (success) {
      uni.showToast({ title: isEdit.value ? "保存成功" : "创建成功", icon: "success" });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({ title: "操作失败", icon: "none" });
    }
  } catch {
    uni.showToast({ title: "操作失败", icon: "none" });
  } finally {
    saving.value = false;
  }
}
</script>

<style lang="scss" scoped>
.boss-edit {
  min-height: 100vh;
  background: $bg-primary;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  &__form {
    padding: 32rpx;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  &__section {
    margin-bottom: 48rpx;
    box-sizing: border-box;
  }

  &__section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 32rpx;
  }

  /* Emoji 网格 */
  &__emoji-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    overflow-x: hidden;
  }

  &__emoji-item {
    width: 96rpx;
    height: 96rpx;
    flex: 0 0 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24rpx;
    border: 3rpx solid $border-subtle;
    background: $bg-card;
    transition: all 0.2s;
  }

  &__emoji-item--active {
    background: rgba(106, 214, 255, 0.15);
    border-color: $accent-cyan;
  }

  &__emoji-text {
    font-size: 48rpx;
  }

  /* 输入框 */
  &__input {
    width: 100%;
    max-width: 100%;
    height: 88rpx;
    padding: 0 28rpx;
    background: $bg-card;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    font-size: 30rpx;
    color: $text-primary;
    box-sizing: border-box;
  }

  &__input--number {
    text-align: center;
  }

  &__textarea {
    width: 100%;
    max-width: 100%;
    height: 120rpx;
    padding: 20rpx 28rpx;
    background: $bg-card;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    font-size: 30rpx;
    color: $text-primary;
    box-sizing: border-box;
  }

  /* 类型/状态选择 */
  &__type-row {
    display: flex;
    gap: 16rpx;
    overflow-x: auto;
  }

  &__type-chip {
    flex-shrink: 0;
    padding: 12rpx 32rpx;
    border-radius: 40rpx;
    border: 2rpx solid $border-subtle;
    background: $bg-card;
  }

  &__type-chip--active {
    background: rgba(106, 214, 255, 0.15);
    border-color: $accent-cyan;
  }

  &__type-chip-text {
    font-size: 28rpx;
    font-weight: 500;
    color: $text-secondary;
  }

  &__type-chip--active &__type-chip-text {
    color: $accent-cyan;
    font-weight: bold;
  }

  /* 日期选择 */
  &__date-field {
    padding: 20rpx;
    background: $bg-card;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
  }

  &__date-label {
    font-size: 22rpx;
    color: $text-secondary;
  }

  &__date-value {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-top: 8rpx;
  }

  &__date-icon {
    font-size: 22rpx;
  }

  &__date-text {
    font-size: 26rpx;
    color: $text-primary;
  }

  /* 底部保存按钮 */
  &__footer {
    padding: 32rpx;
    box-sizing: border-box;
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
    background: linear-gradient(135deg, $accent-cyan, #8be4ff, $accent-cyan);
    border-radius: 28rpx;
    border: none;
    box-shadow: 0 8rpx 32rpx rgba(106, 214, 255, 0.3);
  }

  &__save-btn:disabled {
    opacity: 0.6;
  }

  &__save-spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid rgba(11, 12, 31, 0.3);
    border-top-color: $bg-primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
}
</style>
