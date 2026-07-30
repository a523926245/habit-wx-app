<!-- 卡牌编辑 - 勇者乐园深色赛博朋克主题 -->
<template>
  <view class="card-edit">
    <view class="card-edit__form">
      <!-- 图标选择 -->
      <view class="card-edit__section">
        <text class="card-edit__section-title">图标</text>
        <view class="card-edit__emoji-grid">
          <view
            v-for="emoji in emojiOptions"
            :key="emoji"
            class="card-edit__emoji-item"
            :class="{ 'card-edit__emoji-item--active': formData.emoji === emoji }"
            @tap="selectEmoji(emoji)"
          >
            <text class="card-edit__emoji-text">{{ emoji }}</text>
          </view>
        </view>
      </view>

      <!-- 任务名称 -->
      <view class="card-edit__section">
        <text class="card-edit__section-title">任务名称</text>
        <input
          v-model="formData.title"
          class="card-edit__input"
          placeholder="例如：晨读30分钟"
          maxlength="50"
        />
      </view>

      <!-- 描述 -->
      <view class="card-edit__section">
        <text class="card-edit__section-title">描述（可选）</text>
        <textarea
          v-model="formData.description"
          class="card-edit__textarea"
          placeholder="具体要求或注意事项"
          maxlength="200"
        />
      </view>

      <!-- 类型 -->
      <view class="card-edit__section">
        <text class="card-edit__section-title">类型</text>
        <view class="card-edit__type-row">
          <view
            v-for="t in typeOptions"
            :key="t.value"
            class="card-edit__type-chip"
            :class="{ 'card-edit__type-chip--active': formData.type === t.value }"
            @tap="selectType(t.value)"
          >
            <text class="card-edit__type-chip-text">{{ t.label }}</text>
          </view>
        </view>
      </view>

      <!-- 有效期（周/月任务） -->
      <view v-if="formData.type === 'weekly' || formData.type === 'monthly'" class="card-edit__section">
        <text class="card-edit__section-title">📅 有效期</text>
        <view class="card-edit__date-row">
          <picker
            mode="date"
            field="date"
            start="2020-01-01"
            end="2030-12-31"
            :value="formData.startDate"
            @change="onStartDateChange"
          >
            <view class="card-edit__date-field">
              <text class="card-edit__date-label">开始日期</text>
              <view class="card-edit__date-value">
                <text class="card-edit__date-icon">📅</text>
                <text class="card-edit__date-text">{{ formData.startDate || '请选择' }}</text>
              </view>
            </view>
          </picker>
          <text class="card-edit__date-arrow">→</text>
          <picker
            mode="date"
            field="date"
            start="2020-01-01"
            end="2030-12-31"
            :value="formData.expireDate"
            @change="onEndDateChange"
          >
            <view class="card-edit__date-field">
              <text class="card-edit__date-label">截止日期</text>
              <view class="card-edit__date-value">
                <text class="card-edit__date-icon">📅</text>
                <text class="card-edit__date-text">{{ formData.expireDate || '请选择' }}</text>
              </view>
            </view>
          </picker>
        </view>
        <text v-if="formData.expireDate" class="card-edit__date-hint">
          {{ formData.type === 'weekly' ? '有效期内每周一自动分配，到期自动过期' : '有效期内每月自动分配，到期自动过期' }}
        </text>
      </view>

      <!-- 难度与奖励 -->
      <view class="card-edit__section">
        <text class="card-edit__section-title">难度与奖励</text>
        <view class="card-edit__presets">
          <view
            v-for="preset in difficultyPresets"
            :key="preset.level"
            class="card-edit__preset"
            :class="{ 'card-edit__preset--active': formData.difficulty === preset.level }"
            @tap="applyPreset(preset.level)"
          >
            <text class="card-edit__preset-label">{{ preset.label }}</text>
          </view>
        </view>

        <!-- 金币奖励 -->
        <view class="card-edit__section">
          <text class="card-edit__section-title">金币奖励</text>
          <input
            v-model="formData.coinReward"
            class="card-edit__input card-edit__input--number"
            type="digit"
            placeholder="金币数"
          />
        </view>

        <!-- BOSS伤害 -->
        <view class="card-edit__section">
          <text class="card-edit__section-title">⚔️ BOSS伤害</text>
          <input
            v-model="formData.bossDamage"
            class="card-edit__input card-edit__input--number"
            type="digit"
            placeholder="伤害值"
          />
        </view>
      </view>

      <!-- 分配给 -->
      <view class="card-edit__section">
        <text class="card-edit__section-title">分配给</text>
        <view v-if="childrenLoading" class="card-edit__loading">加载中...</view>
        <view v-else-if="children.length === 0" class="card-edit__empty-members">暂无孩子成员</view>
        <view v-else class="card-edit__members">
          <view
            v-for="child in children"
            :key="child.id"
            class="card-edit__member"
            @tap="toggleChild(child.id)"
          >
            <view class="card-edit__member-check">
              <view
                class="card-edit__member-check-circle"
                :class="{ 'card-edit__member-check-circle--checked': selectedChildren.has(child.id) }"
              >
                <view v-if="selectedChildren.has(child.id)" class="card-edit__member-check-mark" />
              </view>
            </view>
            <text class="card-edit__member-name">{{ child.nickname || '未命名' }}</text>
          </view>
          <view class="card-edit__member-toggle">
            <text class="card-edit__member-toggle-text" @tap="toggleAllChildren">
              {{ selectedChildren.size === children.length ? '取消全选' : '全选' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="card-edit__footer">
      <button class="card-edit__save-btn" :disabled="saving" @tap="handleSave">
        <view v-if="saving" class="card-edit__save-spinner" />
        <text v-else>{{ isEdit ? '保存修改' : '创建卡牌' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useCardStore } from "@/stores/card";
import { useAuthStore } from "@/stores/auth";
import { getCards, createCard, updateCard, deleteCard, getAssignees, batchDeleteCards } from "@/api/cards";
import { parseTaskCard } from "@/models/card";
import type { TaskCard } from "@/models/card";
import { DIFFICULTY_CONFIG, EMOJI_OPTIONS } from "@/config/game";
import { getMembers } from "@/api/auth";

const cardStore = useCardStore();
const authStore = useAuthStore();

const routeQuery = ref<Record<string, string>>({});

onLoad((query: Record<string, string> | undefined) => {
  if (query) {
    routeQuery.value = query;
  }
});

const isEdit = computed(() => !!routeQuery.value?.id);
const saving = ref(false);

const formData = ref({
  title: "",
  description: "",
  type: "daily" as "daily" | "weekly" | "monthly",
  difficulty: 2,
  emoji: "⭐",
  coinReward: "10",
  bossDamage: "8",
  startDate: "",
  expireDate: "",
});

const difficultyPresets = computed(() => {
  return Object.entries(DIFFICULTY_CONFIG).map(([level, cfg]) => ({
    level: parseInt(level, 10),
    label: cfg.label,
    coin: cfg.coinReward,
    damage: cfg.bossDamage,
  }));
});

const emojiOptions = EMOJI_OPTIONS;

const typeOptions = [
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
];

const children = ref<{ id: number; nickname: string }[]>([]);
const selectedChildren = ref(new Set<number>());
const childrenLoading = ref(true);

onMounted(async () => {
  await loadMembers();
  if (isEdit.value) {
    await loadCardData();
  }
});

async function loadMembers() {
  childrenLoading.value = true;
  try {
    const result = await getMembers();
    if (result.success && result.data?.members) {
      children.value = result.data.members.filter((m: any) => m.role === "child").map((m: any) => ({
        id: m.id,
        nickname: m.nickname || m.username || "未命名",
      }));
      // 默认全选
      if (!isEdit.value) {
        selectedChildren.value = new Set(children.value.map((c) => c.id));
      }
    }
  } catch {
    // 静默处理
  } finally {
    childrenLoading.value = false;
  }
}

async function loadCardData() {
  try {
    const cardId = parseInt(routeQuery.value.id as string, 10);
    const result = await getCards();
    if (result.success && result.data?.cards) {
      const card = result.data.cards.find((c: any) => c.id === cardId);
      if (card) {
        const parsed = parseTaskCard(card as unknown as Record<string, unknown>);
        formData.value = {
          title: parsed.title,
          description: parsed.description || "",
          type: parsed.type,
          difficulty: parsed.difficulty,
          emoji: parsed.emoji,
          coinReward: String(parsed.coinReward),
          bossDamage: String(parsed.bossDamage),
          startDate: "",
          expireDate: parsed.expireDate || "",
        };
        // 加载分配范围
        const assigneeResult = await getAssignees(cardId);
        if (assigneeResult.success && assigneeResult.data?.assignee_scope) {
          const scope = assigneeResult.data.assignee_scope;
          if (scope) {
            try {
              const ids = JSON.parse(scope);
              if (ids.length > 0) {
                selectedChildren.value = new Set(ids);
              }
            } catch {
              // 默认全选
              selectedChildren.value = new Set(children.value.map((c) => c.id));
            }
          }
        }
      }
    }
  } catch {
    uni.showToast({ title: "加载失败", icon: "none" });
  }
}

function selectEmoji(emoji: string) {
  formData.value.emoji = emoji;
}

function selectType(type: string) {
  formData.value.type = type as "daily" | "weekly" | "monthly";
  if (type === "daily") {
    formData.value.startDate = "";
    formData.value.expireDate = "";
  }
}

function applyPreset(level: number) {
  formData.value.difficulty = level;
  const config = DIFFICULTY_CONFIG[level as keyof typeof DIFFICULTY_CONFIG];
  if (config) {
    formData.value.coinReward = String(config.coinReward);
    formData.value.bossDamage = String(config.bossDamage);
  }
}

function toggleChild(id: number) {
  const next = new Set(selectedChildren.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedChildren.value = next;
}

function toggleAllChildren() {
  if (selectedChildren.value.size === children.value.length) {
    selectedChildren.value = new Set();
  } else {
    selectedChildren.value = new Set(children.value.map((c) => c.id));
  }
}

function onStartDateChange(e: any) {
  const { value } = e.detail;
  formData.value.startDate = value;
}

function onEndDateChange(e: any) {
  const { value } = e.detail;
  formData.value.expireDate = value;
}

async function handleSave() {
  if (!formData.value.title.trim()) {
    uni.showToast({ title: "请输入任务名称", icon: "none" });
    return;
  }

  saving.value = true;
  try {
    const scope = buildScope();
    const params = {
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      type: formData.value.type,
      difficulty: formData.value.difficulty,
      emoji: formData.value.emoji,
      coinReward: parseInt(formData.value.coinReward, 10) || formData.value.difficulty * 10,
      bossDamage: parseInt(formData.value.bossDamage, 10) || formData.value.difficulty * 8,
      expireDate: formData.value.expireDate || undefined,
      assigneeScope: scope,
    };

    let result;
    if (isEdit.value) {
      const cardId = parseInt(routeQuery.value.id as string, 10);
      result = await updateCard(cardId, params);
    } else {
      result = await createCard(params);
    }

    if (result?.success) {
      // 分配给孩子
      if (selectedChildren.value.size > 0) {
        const cardId = isEdit.value
          ? parseInt(routeQuery.value.id as string, 10)
          : (result.data?.card?.id ?? 0);
        if (cardId > 0) {
          await assignToChildren(cardId, Array.from(selectedChildren.value));
        }
      } else if (isEdit.value) {
        const cardId = parseInt(routeQuery.value.id as string, 10);
        if (cardId > 0) {
          await assignToChildren(cardId, []);
        }
      }

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

function buildScope(): string | undefined {
  if (selectedChildren.value.size === children.value.length) {
    return undefined; // 全选 = 默认所有孩子
  }
  if (selectedChildren.value.size === 0) {
    return "[]"; // 不分配
  }
  return JSON.stringify(Array.from(selectedChildren.value));
}

async function assignToChildren(cardId: number, userIds: number[]) {
  try {
    const { assignCard } = await import("@/api/cards");
    await assignCard(cardId, userIds);
  } catch {
    // 分配失败不影响主流程
  }
}
</script>

<style lang="scss" scoped>
.card-edit {
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

  /* 表情选择 */
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

  /* 类型选择 */
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
  &__date-row {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    overflow-x: hidden;
  }

  &__date-field {
    flex: 1;
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

  &__date-arrow {
    font-size: 28rpx;
    color: $text-secondary;
    margin-top: 20rpx;
  }

  &__date-hint {
    font-size: 24rpx;
    color: $text-secondary;
    margin-top: 16rpx;
  }

  /* 难度预设 */
  &__presets {
    display: flex;
    gap: 8rpx;
    margin-bottom: 32rpx;
  }

  &__preset {
    flex: 1;
    padding: 16rpx 8rpx;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    background: $bg-card;
    text-align: center;
  }

  &__preset--active {
    background: rgba(106, 214, 255, 0.15);
    border-color: $accent-cyan;
  }

  &__preset-label {
    font-size: 24rpx;
    font-weight: 500;
    color: $text-secondary;
  }

  &__preset--active &__preset-label {
    color: $accent-cyan;
    font-weight: bold;
  }

  /* 分配成员 */
  &__members {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__member {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
  }

  &__member-check {
    padding-right: 20rpx;
  }

  &__member-check-circle {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    border: 3rpx solid $accent-cyan;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__member-check-circle--checked {
    background: $accent-cyan;
  }

  &__member-check-mark {
    width: 16rpx;
    height: 28rpx;
    border-right: 4rpx solid $bg-primary;
    border-bottom: 4rpx solid $bg-primary;
    transform: rotate(45deg) translate(-2rpx, -2rpx);
  }

  &__member-name {
    font-size: 30rpx;
    color: $text-primary;
  }

  &__member-toggle {
    padding: 16rpx 0;
  }

  &__member-toggle-text {
    font-size: 26rpx;
    color: $accent-cyan;
    font-weight: 600;
  }

  &__loading {
    text-align: center;
    padding: 40rpx;
    color: $text-secondary;
  }

  &__empty-members {
    padding: 20rpx 0;
    color: $text-secondary;
    font-size: 26rpx;
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
