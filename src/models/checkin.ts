/**
 * 签到系统模型
 * 对应 Flutter 端的 CheckinStatus, CheckinCalendar, CheckinConfig
 */

/** 签到成就里程碑 */
export interface CheckinMilestone {
  percent: number; // 完成比例 (0.1, 0.3, 0.5, 0.7, 1.0)
  coins: number; // 金币奖励
  title: string; // 称号
}

/** 签到配置 */
export interface CheckinConfig {
  milestones: CheckinMilestone[];
}

/** 每日签到状态 */
export interface DailyCheckinRecord {
  userId: number;
  date: string; // YYYY-MM-DD
  hasAllDailyApproved: boolean; // 当天所有 daily 任务是否 approved
  streakDays: number; // 当月连续天数
}

/** 签到日历 */
export interface CheckinCalendar {
  userId: number;
  year: number;
  month: number;
  records: Record<string, boolean>; // date -> hasCheckin
  currentStreak: number; // 当前连续天数
  bestStreak: number; // 最佳连续天数
}

/** 每日任务进度（用于签到判断） */
export interface DailyProgress {
  total: number; // 当日 daily 任务总数
  completed: number; // 已通过数量
  rate: number; // 完成率 0-1
}

/** 月度复盘数据 */
export interface MonthlyReview {
  userId: number;
  year: number;
  month: number;
  totalDays: number; // 当月总天数
  activeDays: number; // 有任务的天数
  fullAttendanceDays: number; // 全勤天数
  avgCompletionRate: number; // 平均完成率
  dailyDetails: DailyDetail[]; // 每日明细
}

export interface DailyDetail {
  date: string;
  total: number;
  completed: number;
  rate: number;
  status: 'green' | 'orange' | 'red'; // 绿/橙/红
}

// ==================== 解析函数 ====================

export function parseDailyCheckinRecord(data: Record<string, unknown>): DailyCheckinRecord {
  return {
    userId: (data.user_id ?? data.userId ?? 0) as number,
    date: (data.date as string) || '',
    hasAllDailyApproved: ((data.has_all_daily_approved ?? data.hasAllDailyApproved ?? 0) as number) === 1,
    streakDays: (data.streak_days ?? data.streakDays ?? 0) as number,
  };
}

export function parseCheckinCalendar(data: Record<string, unknown>): CheckinCalendar {
  const records: Record<string, boolean> = {};
  const rawRecords = data.records ?? data.raw_records;
  if (rawRecords && typeof rawRecords === 'object') {
    const obj = rawRecords as Record<string, unknown>;
    for (const [key, val] of Object.entries(obj)) {
      records[key] = ((val as number) ?? 0) === 1;
    }
  }

  return {
    userId: (data.user_id ?? data.userId ?? 0) as number,
    year: (data.year as number) || new Date().getFullYear(),
    month: (data.month as number) || new Date().getMonth() + 1,
    records,
    currentStreak: (data.current_streak ?? data.currentStreak ?? 0) as number,
    bestStreak: (data.best_streak ?? data.bestStreak ?? 0) as number,
  };
}

export function parseMonthlyReview(data: Record<string, unknown>): MonthlyReview {
  const dailyDetailsRaw = data.daily_details ?? data.dailyDetails;
  const dailyDetails: DailyDetail[] = [];
  if (Array.isArray(dailyDetailsRaw)) {
    for (const d of dailyDetailsRaw as Record<string, unknown>[]) {
      const rate = Number(d.rate ?? 0);
      dailyDetails.push({
        date: (d.date as string) || '',
        total: (d.total as number) || 0,
        completed: (d.completed as number) || 0,
        rate,
        status: rate >= 1 ? 'green' : rate >= 0.5 ? 'orange' : 'red',
      });
    }
  }

  return {
    userId: (data.user_id ?? data.userId ?? 0) as number,
    year: (data.year as number) || new Date().getFullYear(),
    month: (data.month as number) || new Date().getMonth() + 1,
    totalDays: (data.total_days ?? data.totalDays ?? 0) as number,
    activeDays: (data.active_days ?? data.activeDays ?? 0) as number,
    fullAttendanceDays: (data.full_attendance_days ?? data.fullAttendanceDays ?? 0) as number,
    avgCompletionRate: Number(data.avg_completion_rate ?? data.avgCompletionRate ?? 0),
    dailyDetails,
  };
}

/** 签到里程碑默认配置 */
export const DEFAULT_CHECKIN_MILESTONES: CheckinMilestone[] = [
  { percent: 0.1, coins: 20, title: '初露锋芒 ✨' },
  { percent: 0.3, coins: 50, title: '小有成就 ⚡' },
  { percent: 0.5, coins: 100, title: '坚持不懈 🔥' },
  { percent: 0.7, coins: 200, title: '习惯养成 💪' },
  { percent: 1.0, coins: 500, title: '完美月度 🏆' },
];
