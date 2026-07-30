/**
 * 签到 API
 * 对应 Flutter 端的 checkin_provider
 */
import request from "@/api/request";

/**
 * 获取签到状态
 * GET /api/checkin/status
 */
export async function getCheckinStatus() {
  return request.get<{
    status: {
      userId: number;
      date: string;
      hasAllDailyApproved: boolean;
      streakDays: number;
    };
  }>("/checkin/status");
}

/**
 * 获取签到日历
 * GET /api/checkin/calendar?year=2026&month=7
 */
export async function getCheckinCalendar(year?: number, month?: number) {
  const parts: string[] = [];
  if (year) parts.push(`year=${year}`);
  if (month) parts.push(`month=${month}`);
  const qs = parts.length > 0 ? `?${parts.join("&")}` : "";
  return request.get<{
    calendar: {
      userId: number;
      year: number;
      month: number;
      records: Record<string, boolean>;
      currentStreak: number;
      bestStreak: number;
    };
  }>(`/checkin/calendar${qs}`);
}

/**
 * 获取签到配置（家长）
 * GET /api/checkin/config
 */
export async function getCheckinConfig() {
  return request.get<{
    isDefault: boolean;
    config: {
      percent: number;
      coins: number;
      title: string;
      emoji: string;
      sortOrder: number;
    }[];
  }>("/checkin/config");
}

/**
 * 更新签到配置（家长）
 * PUT /api/checkin/config
 */
export async function updateCheckinConfig(config: unknown[]) {
  return request.put<{ message: string }>("/checkin/config", { config });
}

/**
 * 恢复默认配置（家长）
 * DELETE /api/checkin/config
 */
export async function resetCheckinConfig() {
  return request.delete<{ message: string }>("/checkin/config");
}
