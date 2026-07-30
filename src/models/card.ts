/**
 * 任务卡牌模型
 * 对应 Flutter 端的 TaskCard
 */

/** 任务类型 */
export type CardType = 'daily' | 'weekly' | 'monthly';

/** 任务状态 */
export type CardStatus = 'active' | 'inactive';

/** 重复星期 */
export type RepeatDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface TaskCard {
  id: number;
  familyId: number;
  title: string;
  description?: string;
  type: CardType;
  difficulty: number; // 1-5
  coinReward: number;
  bossDamage: number;
  emoji: string;
  repeatDays: RepeatDay[];
  deadline?: string; // HH:MM 格式
  expireDate?: string; // YYYY-MM-DD 格式
  createdBy: number;
  status: CardStatus;
  assigneeScope?: string; // JSON 字符串
  createdAt: string;
}

/** 卡牌分配记录 */
export interface CardAssignment {
  id: number;
  cardId: number;
  userId: number;
  assignedDate: string; // YYYY-MM-DD
  status: AssignmentStatus;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: number;
  submissionNote?: string;
  submissionPhoto?: string;
  // JOIN 查询结果
  cardTitle?: string;
  cardEmoji?: string;
  cardType?: CardType;
  coinReward?: number;
  bossDamage?: number;
}

export type AssignmentStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

/** 扩展的分配记录（含完整卡牌信息） */
export interface AssignmentWithCard extends CardAssignment {
  cardTitle: string;
  cardEmoji: string;
  cardType: CardType;
  coinReward: number;
  bossDamage: number;
}

// ==================== 解析函数 ====================

export function parseTaskCard(data: Record<string, unknown>): TaskCard {
  const repeatDaysRaw = data.repeat_days ?? data.repeatDays;
  let repeatDays: RepeatDay[] = [];
  if (repeatDaysRaw) {
    if (typeof repeatDaysRaw === 'string') {
      repeatDays = repeatDaysRaw
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0) as RepeatDay[];
    } else if (Array.isArray(repeatDaysRaw)) {
      repeatDays = repeatDaysRaw as RepeatDay[];
    }
  }

  return {
    id: data.id as number,
    familyId: (data.family_id ?? data.familyId ?? 0) as number,
    title: (data.title as string) || '',
    description: data.description as string | undefined,
    type: ((data.type as CardType) || 'daily') as CardType,
    difficulty: (data.difficulty as number) ?? 1,
    coinReward: (data.coin_reward ?? data.coinReward ?? 10) as number,
    bossDamage: (data.boss_damage ?? data.bossDamage ?? 10) as number,
    emoji: (data.emoji as string) ?? '⭐',
    repeatDays,
    deadline: data.deadline as string | undefined,
    expireDate: data.expire_date as string | undefined,
    createdBy: (data.created_by ?? data.createdBy ?? 0) as number,
    status: ((data.status as CardStatus) || 'active') as CardStatus,
    assigneeScope: data.assignee_scope as string | undefined,
    createdAt: (data.created_at ?? data.createdAt ?? '') as string,
  };
}

export function parseCardAssignment(data: Record<string, unknown>): CardAssignment {
  return {
    id: data.id as number,
    cardId: (data.card_id ?? data.cardId ?? 0) as number,
    userId: (data.user_id ?? data.userId ?? 0) as number,
    assignedDate: (data.assigned_date ?? data.assignedDate ?? '') as string,
    status: ((data.status as AssignmentStatus) || 'pending') as AssignmentStatus,
    submittedAt: (data.submitted_at ?? data.submittedAt) as string | undefined,
    approvedAt: (data.approved_at ?? data.approvedAt) as string | undefined,
    approvedBy: (data.approved_by ?? data.approvedBy) as number | undefined,
    submissionNote: (data.submission_note ?? data.submissionNote) as string | undefined,
    submissionPhoto: (data.submission_photo ?? data.submissionPhoto) as string | undefined,
    cardTitle: (data.card_title ?? data.cardTitle ?? data.title) as string | undefined,
    cardEmoji: (data.card_emoji ?? data.cardEmoji ?? data.emoji) as string | undefined,
    cardType: (data.type ?? data.cardType) as CardType | undefined,
    coinReward: (data.coin_reward ?? data.coinReward) as number | undefined,
    bossDamage: (data.boss_damage ?? data.bossDamage) as number | undefined,
  };
}

/** 状态判断辅助 */
export function isPending(status: AssignmentStatus): boolean {
  return status === 'pending';
}

export function isSubmitted(status: AssignmentStatus): boolean {
  return status === 'submitted';
}

export function isApproved(status: AssignmentStatus): boolean {
  return status === 'approved';
}

export function isRejected(status: AssignmentStatus): boolean {
  return status === 'rejected';
}

/** 星期映射 */
export const REPEAT_DAY_LABELS: Record<RepeatDay, string> = {
  mon: '周一',
  tue: '周二',
  wed: '周三',
  thu: '周四',
  fri: '周五',
  sat: '周六',
  sun: '周日',
};

/** 任务类型标签 */
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
};
