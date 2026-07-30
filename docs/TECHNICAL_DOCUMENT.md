# 习惯养成战斗营 - 技术文档

> 版本：v2026-05-30
> 技术栈：Flutter (Dart) + Node.js/Express + SQLite

---

## 一、技术架构总览

```
┌─────────────────────────────────────────────────────┐
│                   Flutter 前端                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Riverpod │  │ GoRouter │  │  Feature Pages   │   │
│  │状态管理    │  │ 路由导航  │  │  Auth/Home/Cards │   │
│  └──────────┘  └──────────┘  │  Boss/Shop/Rank   │   │
│                              │  Checkin/MagicBox  │   │
│  ┌──────────────────────────────────────────────┐ │
│  │           ApiClient (Dio)                    │ │
│  │  + TokenInterceptor + ApiResponseInterceptor │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │           ApiResult<T> (sealed class)        │ │
│  │  ApiSuccess / ApiFailure 模式匹配             │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────┬────────────────────────┘
                           │ HTTP/HTTPS (JSON)
                           ▼
┌─────────────────────────────────────────────────────┐
│                 Node.js 后端 (Express)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Middleware│  │ Routes   │  │ Services/Utils   │   │
│  │ JWT/Auth  │  │ /auth    │  │ checkinService   │   │
│  │ Logger    │  │ /cards   │  │ cardAssign       │   │
│  │ RespWrap  │  │ /boss    │  │ comboCalculator  │   │
│  └──────────┘  │ /shop    │  │ magicBoxLogic    │   │
│               │ /rank    │  │                  │   │
│               │ /checkin │  │                  │   │
│               │ /magicbox│  │                  │   │
│               └──────────┘  └──────────────────┘   │
└──────────────────────────┬────────────────────────┘
                           │ better-sqlite3
                           ▼
┌─────────────────────────────────────────────────────┐
│                   SQLite 数据库                       │
│              20 张业务表 + 索引                       │
└─────────────────────────────────────────────────────┘
```

---

## 二、前端架构（Flutter）

### 2.1 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| flutter_riverpod | ^2.6.1 | 状态管理 |
| dio | ^5.8.0 | HTTP 客户端 |
| go_router | ^14.8.1 | 路由导航 |
| shared_preferences | ^2.5.0 | 本地持久化 |
| json_annotation | ^4.9.0 | JSON 序列化 |
| freezed_annotation | ^2.4.4 | 不可变模型 |
| intl | ^0.20.2 | 国际化/日期格式化 |

### 2.2 目录结构

```
habit_battle/lib/
├── main.dart                    # 入口，ProviderScope
├── app.dart                     # MaterialApp, AppColors, CustomAppBar,
│                                # CustomBottomNavBar, GoRouter 配置
├── core/
│   ├── api_result.dart          # ApiResult<T> sealed class
│   ├── constants/
│   │   ├── app_constants.dart   # API URL, 游戏常量, AppColors
│   │   ├── rank_config.dart     # 段位配置（默认+动态加载）
│   │   └── rank_config_provider.dart
│   ├── network/
│   │   └── api_client.dart      # Dio 单例 + 拦截器
│   ├── widgets/
│   │   ├── custom_dialog.dart   # ConfirmDialog / FormDialog
│   │   └── debounce_button.dart # 防抖/节流按钮
│   ├── utils/
│   │   └── debounce.dart        # Debounce / Throttle / DebounceManager
│   ├── toast.dart               # AppToast 顶部提示
│   └── error_handler.dart       # 错误分类与处理
├── data/
│   ├── models/                  # 数据模型
│   │   ├── user.dart
│   │   ├── card.dart            # TaskCard + CardAssignment
│   │   ├── boss.dart            # Boss + BossDamageEntry
│   │   ├── shop_item.dart       # ShopItem + Redemption
│   │   └── magic_box.dart       # GachaConfig, MagicBox, Voucher...
│   └── providers/               # Riverpod StateNotifier
│       ├── auth_provider.dart
│       ├── card_provider.dart
│       ├── boss_provider.dart
│       ├── checkin_provider.dart
│       ├── magic_box_provider.dart
│       └── rank_config_provider.dart
└── features/                    # 功能页面
    ├── auth/                    # 登录/注册/加入家庭
    ├── home/                    # 家长首页/孩子首页/任务详情
    ├── cards/                   # 卡牌管理/编辑
    ├── boss/                    # BOSS管理
    ├── battle/                  # BOSS战场
    ├── shop/                    # 商城/兑换/商品编辑
    ├── rank/                    # 排行榜/复盘
    ├── coins/                   # 金币流水
    ├── pending/                 # 我的待办（审核）
    ├── family/                  # 家庭管理
    ├── profile/                 # 个人资料
    ├── checkin/                 # 签到日历/状态卡片
    ├── magic_box/               # 扭蛋/兑换券/商城
    └── settings/                # 系统配置
```

### 2.3 状态管理（Riverpod）

所有状态使用 `StateNotifierProvider`，不使用 `autoDispose`（避免路由销毁问题）。

| Provider | 状态类 | 职责 |
|----------|--------|------|
| authProvider | AuthState | 认证状态、用户信息、token |
| cardProvider | CardState | 卡牌列表、任务分配、审核 |
| bossProvider | BossState | BOSS信息、伤害排行、历史 |
| checkinProvider | CheckinState | 签到状态、日历数据 |
| magicBoxProvider | MagicBoxState | 扭蛋库存、兑换券、配置 |
| rankConfigProvider | RankConfigState | 段位配置 |

### 2.4 路由系统

使用 `StatefulShellRoute.indexedStack` 实现底部导航持久化。

**家长端路由树**：
```
/parent          → ParentHomePage (分支0)
/cards           → CardManagePage (分支1, 隐藏)
/battle          → BossBattlePage (分支2)
/rank            → LeaderboardPage (分支3)
/shop            → ShopPage (分支4, 隐藏)
/profile         → ProfileEditPage (分支5)
```

**孩子端路由树**：
```
/child           → ChildHomePage (分支0)
/child-battle    → BossBattlePage (分支1)
/child-rank      → LeaderboardPage (分支2)
/child-shop      → ShopPage (分支3)
/child-profile   → ProfileEditPage (分支4)
```

**独立路由**（不影响底部导航）：
```
/boss-manage, /coins, /pending, /review, /redemptions,
/family-manage, /checkin/calendar, /settings/*,
/magic-box, /my-vouchers, /magic-box-shop, /voucher-use, /gacha-config
```

**认证守卫**：
- 未登录 → 重定向到 `/login`
- 已登录家长 → 重定向到 `/parent`
- 已登录孩子 → 重定向到 `/child`
- 401 未授权 → 自动登出并跳转登录页

### 2.5 网络层

**ApiClient**（Dio 单例）：
- Base URL: `http://180.76.236.224:3000/api`
- 超时: 连接 10s / 接收 10s
- 拦截器链:
  1. **TokenInterceptor**: 自动注入 `Authorization: Bearer <token>`
  2. **ApiResponseInterceptor**: 解析 `{code, msg, data}` 格式

**响应格式**：
```dart
// 成功
ApiSuccess<Response> → result.data  // 业务数据

// 失败
ApiFailure<Response> → result.error  // 错误信息
// 语义判断: isUnauthorized / isDuplicate / isInsufficientCoins / ...
```

**统一错误码**（后端返回 code 字段）：
| code | 含义 |
|------|------|
| 200 | 成功 |
| 10001 | 参数错误 |
| 10005 | 重复操作 |
| 10007 | 权限不足 |
| 10008 | 认证失败 |

### 2.6 核心组件

**CustomDialog**：统一弹框样式
- `ConfirmDialog`：确认类（取消/确认按钮，等宽居中）
- `FormDialog`：表单类（取消/保存按钮，支持禁用保存）

**DebounceButton**：防重复点击
- `ThrottleElevatedButton`：首次立即执行，后续节流（推荐）
- `DebounceElevatedButton`：延迟执行，只执行最后一次

**AppToast**：顶部浮动提示
- success / error / warning / info 四种类型
- 新提示覆盖旧提示，自动消失

---

## 三、后端架构（Node.js）

### 3.1 技术栈

| 依赖 | 用途 |
|------|------|
| express | Web 框架 |
| better-sqlite3 | 嵌入式数据库 |
| jsonwebtoken (JWT) | 身份认证 |
| bcrypt | 密码加密 |
| multer | 文件上传（头像） |
| cors | 跨域支持 |

### 3.2 目录结构

```
server/
├── index.js                           # Express 入口
├── src/
│   ├── config.js                      # PARENT_KEY 环境变量
│   ├── database.js                    # 数据库初始化 + 迁移脚本
│   ├── middleware/
│   │   ├── auth.js                    # JWT 认证中间件
│   │   ├── response_wrapper.js        # 统一响应格式 {code, msg, data}
│   │   └── api_logger.js              # API 请求日志（脱敏）
│   ├── routes/
│   │   ├── auth.js                    # 认证 + 家庭管理
│   │   ├── cards.js                   # 卡牌 CRUD + 分配 + 待审核
│   │   ├── assignments.js             # 任务提交/审核/驳回/撤回
│   │   ├── boss.js                    # BOSS 管理 + 攻击 + 排行
│   │   ├── shop.js                    # 商城 + 兑换
│   │   ├── rank.js                    # 排行榜 + 复盘 + 流水
│   │   ├── dashboard.js               # 仪表盘（兼容旧路由）
│   │   ├── checkin.js                 # 签到系统
│   │   ├── magicBox.js                # 扭蛋系统
│   │   ├── bossLevels.js              # BOSS等级配置
│   │   ├── comboConfig.js             # 连击加成配置
│   │   └── rankTierConfig.js          # 段位配置
│   ├── services/
│   │   └── checkinService.js          # 签到业务逻辑
│   ├── utils/
│   │   ├── cardAssign.js              # 卡牌自动分配
│   │   ├── combo.js                   # 连击加成计算
│   │   └── logger.js                  # 结构化日志工具
│   └── migrations/
│       └── add_indexes.js             # 数据库索引优化
```

### 3.3 认证机制

**JWT 流程**：
1. 登录/注册返回 JWT token（30天有效）
2. 载荷：`{id, username, role, family_id}`
3. 签名密钥：`JWT_SECRET` 环境变量
4. 传输：`Authorization: Bearer <token>`
5. 状态变更时重新签发 token（使旧 token 失效）

**中间件链**：
```
authMiddleware → 验证 JWT，挂载 req.user
parentOnly → 检查 req.user.role === 'parent'
childOnly → 检查 req.user.role === 'child'
```

**密码安全**：
- bcrypt 加密，cost factor = 10
- 注册校验：6-64位，至少 2 种字符类型（数字/小写/大写/特殊）
- 强度指示：弱(2种+≥6位) / 中(3种+≥8位) / 强

### 3.4 响应格式

所有接口统一使用 `response_wrapper`：
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": { ... }
}
```

失败时：
```json
{
  "code": 10001,
  "msg": "用户名已存在",
  "data": null
}
```

### 3.5 日志系统

**API 日志中间件**：
- 请求日志：请求ID、时间、方法、URL、IP、参数、认证信息
- 响应日志：状态码、耗时、响应体（自动截断1000字符）
- 敏感字段自动脱敏：password, token, secret, apiKey 等
- 日志级别：DEBUG/INFO/WARN/ERROR（环境变量 `LOG_LEVEL` 控制）

---

## 四、数据库设计

### 4.1 ER 关系图

```
families (1) ───< users (N)
   │                      │
   │                      ├──< card_assignments (N)
   │                      │          │
   │                      │          └──> cards (1)
   │                      │
   │                      └──< boss_damage_log (N)
   │                      │          │
   │                      │          └──> bosses (1)
   │                      │
   │                      └──< coin_transactions (N)
   │                      │
   │                      └──< redemptions (N)
   │                      │          │
   │                      │          └──> shop_items (1)
   │                      │
   │                      └──< vouchers (N)
   │                      │
   │                      └──< magic_boxes (N)
   │
   ├──< cards (N)
   ├──< bosses (N)
   ├──< shop_items (N)
   ├──< checkin_config (N)
   ├──< boss_levels (N)
   ├──< combo_config (N)
   └──< rank_tiers (N)
```

### 4.2 表结构详述

#### families（家庭组）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| name | TEXT | NOT NULL | 家庭名称 |
| invite_code | TEXT | UNIQUE NOT NULL | 孩子邀请码（6位大写十六进制） |
| parent_code | TEXT | nullable | 家长密匙（6位大写十六进制） |

#### users（用户）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| family_id | INTEGER | FK families | 所属家庭（null=未加入） |
| username | TEXT | UNIQUE NOT NULL | 登录用户名 |
| password_hash | TEXT | NOT NULL | bcrypt 哈希 |
| role | TEXT | CHECK(parent/child) | 角色 |
| nickname | TEXT | | 昵称 |
| avatar | TEXT | | 头像URL |
| coins | INTEGER | DEFAULT 0 | 金币余额 |
| rank_score | INTEGER | DEFAULT 0 | 排位积分 |
| rank_tier | TEXT | DEFAULT 'bronze' | 段位标识 |

#### cards（卡牌模板）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| family_id | INTEGER | NOT NULL FK | 所属家庭 |
| title | TEXT | NOT NULL | 任务名称 |
| description | TEXT | | 描述 |
| type | TEXT | CHECK(daily/weekly/monthly) | 类型 |
| difficulty | INTEGER | CHECK(1-5) | 难度 |
| coin_reward | INTEGER | DEFAULT 10 | 金币奖励 |
| boss_damage | INTEGER | DEFAULT 10 | BOSS伤害 |
| emoji | TEXT | DEFAULT '⭐' | 表情图标 |
| repeat_days | TEXT | nullable | JSON数组 ['mon','wed'] |
| deadline | TEXT | nullable | 截止日期 |
| expire_date | TEXT | nullable | 过期日期 |
| assignee_scope | TEXT | nullable JSON | 分配范围 |
| status | TEXT | DEFAULT 'active' | 状态 |
| created_by | INTEGER | NOT NULL FK | 创建者 |

#### card_assignments（任务分配实例）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| card_id | INTEGER | NOT NULL FK | 所属卡牌 |
| user_id | INTEGER | NOT NULL FK | 目标用户 |
| assigned_date | DATE | NOT NULL | 分配日期 |
| status | TEXT | DEFAULT 'pending' | pending→submitted→approved/rejected |
| submitted_at | DATETIME | | 提交时间 |
| approved_at | DATETIME | | 审核通过时间 |
| approved_by | INTEGER | FK users | 审核者 |
| submission_note | TEXT | | 提交备注 |
| submission_photo | TEXT | | 提交照片 |

**唯一约束**: `(card_id, user_id, assigned_date)`

#### bosses（BOSS）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| family_id | INTEGER | NOT NULL FK | 所属家庭 |
| name | TEXT | NOT NULL | BOSS名称 |
| emoji | TEXT | DEFAULT '🐉' | 表情 |
| max_hp | INTEGER | NOT NULL | 最大血量 |
| current_hp | INTEGER | NOT NULL | 当前血量 |
| story | TEXT | nullable | 故事背景 |
| attack_ratio | REAL | DEFAULT 1.0 | 伤害系数 |
| kill_reward_coins | INTEGER | DEFAULT 100 | 击杀奖励 |
| end_time | DATETIME | nullable | 结束时间 |
| repeatable | INTEGER | DEFAULT 0 | 可重复挑战 |
| respawn_hours | INTEGER | DEFAULT 0 | 重生间隔 |
| attack_limit_per_day | INTEGER | DEFAULT 0 | 每日攻击限制 |
| status | TEXT | draft/active/defeated/expired | 状态 |
| level_id | INTEGER | FK boss_levels | BOSS等级 |
| gacha_tier | INTEGER | DEFAULT 1 | 掉落扭蛋档位(1-4) |

#### shop_items（商城商品）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| family_id | INTEGER | NOT NULL FK | 所属家庭 |
| name | TEXT | NOT NULL | 奖品名称 |
| price | INTEGER | NOT NULL | 价格（金币） |
| tier | TEXT | bronze/silver/gold/legendary | 段位要求 |
| item_type | TEXT | DEFAULT 'regular' | regular/gacha |
| gacha_tier | INTEGER | nullable | 扭蛋等级 |
| status | TEXT | DEFAULT 'active' | 状态 |

#### redemptions（兑换记录）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| user_id | INTEGER | NOT NULL FK | 兑换用户 |
| item_id | INTEGER | NOT NULL FK | 奖品 |
| status | TEXT | pending/confirmed/rejected | 状态 |
| pay_method | TEXT | DEFAULT 'coins' | coins/voucher/gacha |
| voucher_id | INTEGER | FK vouchers | 关联兑换券 |

#### gacha_config（扭蛋配置）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| tier | INTEGER | UNIQUE 1-4 | 档位 |
| name | TEXT | NOT NULL | 名称 |
| shop_price | INTEGER | NOT NULL | 商城价格 |
| coin_min/max | INTEGER | NOT NULL | 金币范围 |
| voucher_*_rate | REAL | | 各券档位概率 |

#### magic_boxes / box_openings / vouchers（扭蛋三表）
- `magic_boxes`：拥有的扭蛋（来源：boss_drop / shop_purchase）
- `box_openings`：开扭蛋记录（结果：coins 或 voucher）
- `vouchers`：兑换券（状态：unused / used）

#### checkin_config / daily_checkin_records / checkin_rewards（签到三表）
- `checkin_config`：签到奖励配置（百分比+金币）
- `daily_checkin_records`：每日签到记录（月度内连续天数）
- `checkin_rewards`：签到成就奖励记录

#### boss_levels / combo_config / rank_tiers（配置三表）
- 均支持 family_id = NULL（系统默认）或具体 family_id（家庭自定义）
- 软删除机制（is_active 字段）

### 4.3 索引优化

| 索引名 | 表 | 列 | 覆盖查询 |
|--------|------|------|----------|
| idx_ca_user_date | card_assignments | (user_id, assigned_date) | 今日任务/全勤/月度复盘 |
| idx_ca_status | card_assignments | (status) | 待审核列表 |
| idx_cards_family_status | cards | (family_id, status) | 卡牌列表/自动分配 |
| idx_bosses_family_status | bosses | (family_id, status) | 当前BOSS/历史列表 |
| idx_bdl_boss_user | boss_damage_log | (boss_id, user_id, created_at) | 伤害排行/攻击限制 |
| idx_coins_user_time | coin_transactions | (user_id, created_at) | 金币流水/月度汇总 |

---

## 五、核心业务流程

### 5.1 任务审核→奖励发放全流程

```
孩子提交打卡 (POST /assignments/:id/submit)
    → 状态: pending → submitted
    → 记录 submitted_at, submission_note, submission_photo

家长审核通过 (POST /assignments/:id/approve)
    → 状态: submitted → approved
    → 记录 approved_by, approved_at
    
    【奖励发放】
    ├── 1. 发放金币 (coin_reward)
    ├── 2. 增加排位积分 (= coin_reward)
    ├── 3. 记录 coin_transactions (source: 'card_reward')
    ├── 4. 计算连击加成 → 攻击 BOSS
    │       ├── 查询连续签到天数
    │       ├── 查找匹配的配置档位
    │       └── 实际伤害 = baseDamage × combo × attackRatio
    ├── 5. 检查全勤奖励
    │       ├── 当天所有 daily 任务是否全部 approved
    │       └── 是 → 发放 20/50/100 金币（按连续天数）
    ├── 6. 触发签到检查
    │       ├── 当天所有 daily 任务全部 approved
    │       └── 是 → 记录签到，更新连续天数，检查成就奖励
    └── 7. 检查 BOSS 是否被击败
            ├── 累计伤害 ≥ current_hp
            └── 是 → 发放击杀奖励 + 扭蛋掉落 + 自动重生
```

### 5.2 自动分配流程

```
每次请求 /dashboard/overview 或 /rank/children-progress
    → 调用 ensureTodayAssignments()
        ├── 查询家庭所有 active 卡牌
        ├── 查询家庭所有 child 用户
        ├── 对每张卡牌：
        │       ├── 检查 assignee_scope（NULL=全部孩子）
        │       ├── 根据卡牌类型计算 assigned_date：
        │       │       daily = 今天
        │       │       weekly = 本周一
        │       │       monthly = 本月1号
        │       └── 不存在则 INSERT pending 记录
        └── 查询 expire_date < today 的卡牌 → 设为 inactive
```

### 5.3 BOSS 击杀流程

```
伤害累计达到 current_hp
    → 计算击杀阈值 = avg_percent - 5%（最低 5%）
    → 遍历 boss_damage_log：
        ├── 伤害 ≥ 阈值 → 获得 1 个对应品级扭蛋
        └── 最高伤害者（可并列）→ 额外获得 1 个扭蛋
    → 发放 kill_reward_coins 给全员
    → 创建新 BOSS（同参数，新 ID，status=active）
    → 原 BOSS status → defeated
```

### 5.4 金币衰减流程

```
每月自动执行（在 dashboard/trends 中触发）
    → 查询上月有金币的用户
    → 每位用户 coins *= (1 - monthlyCoinDecayPercent/100)
    → 记录 decay 类型的 coin_transaction
```

---

## 六、配置系统

所有配置项均支持**家庭自定义**覆盖**系统默认**：

| 配置项 | 默认值 | 配置入口 | 说明 |
|--------|--------|----------|------|
| 签到奖励 | 5档(10%~100%) | 系统配置 → 签到奖励 | 百分比+金币 |
| 段位 | 5级(青铜~传说) | 系统配置 → 段位 | 积分阈值 |
| BOSS等级 | 4级(新手~史诗) | 系统配置 → BOSS难度 | 血量系数 |
| 连击加成 | 4档(3~21天) | 系统配置 → 连击加成 | 天数+倍率 |
| 扭蛋配置 | 4档(青铜~钻石) | 扭蛋管理 | 价格/概率/范围 |

**配置优先级**：family_id 匹配 → family_id IS NULL（系统默认）

---

## 七、部署与环境

### 7.1 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 后端端口 | 3000 |
| JWT_SECRET | JWT 签名密钥 | habit-battle-secret-key |
| PARENT_KEY | 创建家庭管理员密匙 | 123456 |
| LOG_LEVEL | 日志级别 | INFO |

### 7.2 启动命令

```bash
# 后端
cd server && npm install && npm start

# 前端（Flutter）
cd habit_battle && flutter pub get && flutter run
```

### 7.3 生产环境

- 前端 API URL 指向生产服务器（当前：`http://180.76.236.224:3000/api`）
- SQLite 文件需持久化存储
- 建议配置 HTTPS 和 CORS 白名单

---

## 八、前端→微信小程序映射要点

### 8.1 需要改造的部分

| Flutter 概念 | 小程序对应 | 说明 |
|-------------|-----------|------|
| MaterialApp | Page 路由 | app.dart 中的路由表 → pages.json |
| Riverpod StateNotifier | AppData / 全局变量 | 用 wx.getStorageSync + 事件总线替代 |
| GoRouter | pages.json + navigateTo | 直接映射路由表 |
| Dio | wx.request | 封装请求拦截器 |
| SharedPreferences | wx.setStorageSync | token + user 持久化 |
| StatefulShellRoute | tabBar 配置 | app.json 中配置 tabBar |
| async/await | 原生 Promise | 基本一致 |

### 8.2 需要重写的 UI 组件

| Flutter Widget | 小程序 WXML/WXSS |
|---------------|-------------------|
| CustomAppBar | 自定义导航栏组件 |
| CustomBottomNavBar | tabBar 配置 |
| CustomDialog | 自定义模态框组件 |
| DebounceButton | 按钮防抖逻辑 |
| AppToast | 顶部 toast 组件 |
| 所有页面 | 转为 WXML + WXSS |

### 8.3 数据模型迁移

所有 `data/models/*.dart` 需要转换为小程序的 JSON 数据结构，保持字段一致。

### 8.4 核心逻辑保留

以下后端 API 和业务逻辑**无需改动**，小程序直接调用：
- 所有 `/api/*` 路由
- 认证流程（JWT）
- 任务分配、审核、奖励发放
- BOSS 战斗、扭蛋、签到
- 排行榜、复盘、流水
