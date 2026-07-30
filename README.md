# 🎮 勇者乐园（Habit-WX-App）

家庭习惯养成微信小程序，游戏化打 BOSS，让孩子养成好习惯。

## 📱 项目概述

从 Flutter 客户端迁移至 **uni-app Vue3** 技术栈的微信小程序，目标平台：微信小程序。孩子通过完成任务打 BOSS，家长管理任务和审核，让好习惯养成充满乐趣！

## 🚀 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | uni-app Vue3 + TypeScript + Vite |
| 目标平台 | 微信小程序 (mp-weixin) |
| 状态管理 | reactive + composables |
| 网络请求 | uni.request 封装 |
| 本地存储 | uni.storage |
| 样式 | SCSS（深色赛博朋克主题）|

## 📂 功能模块

### 🔒 Phase 1 — 认证与家庭
- 登录 / 注册
- 创建家庭 / 加入家庭 / 选择家庭

### 👶 Phase 2 — 孩子端核心
- 首页（任务列表 + 签到）
- BOSS 战场（完成任务伤害 BOSS）
- 排行榜（PK 进度）
- 商城（奖励兑换）
- 个人中心

### 👨‍💼 Phase 3 — 家长端核心
- 家长首页
- BOSS 战场监控
- 卡牌管理（任务创建/编辑）
- 待办审核（孩子任务确认）
- 个人中心

### ⭐ Phase 4 — 进阶功能
- 家族管理
- 扭蛋系统（幸运抽奖）
- 签到日历
- 兑换券
- 每日复盘
- 金币流水
- 系统配置

## 💾 Git 历史（按特性分组）

```
feat(认证): 实现登录、注册、创建家庭和加入家庭功能
feat(core): 初始化应用主体、路由配置、组件库和通用工具函数
feat(孩子端): 实现孩子端首页、BOSS战场、排行榜、商城和个人中心
feat(家长端): 实现家长端首页、BOSS战场、排行榜、个人资料、卡牌管理和待办审核
feat(boss管理): 添加BOSS管理页面
feat(进阶): 添加BOSS、签到、扭蛋、排行、商城状态管理和数据模型
feat(进阶): 添加请求拦截器、配置API、扭蛋API、家族管理、首页闪屏和全局样式
feat(完善): 补充配置文件、类型声明和依赖锁定文件
feat(完善): 添加pnpm工作区配置
```

## 🛠️ 开发命令

```bash
# 微信小程序开发模式
pnpm dev:mp-weixin

# 微信小程序生产构建
pnpm build:mp-weixin

# H5 调试模式（方便本地预览）
pnpm dev:h5
```

## 🤝 API 后端

后端接口保持不变，Node.js + Express + SQLite：
```
https://3000-yaozhaoyanghabitbat-1gr6hl9igpgqhf1558554-1317484434.ap-shanghai.app.tcloudbase.com/api
```

## 🎨 视觉风格

采用**深色赛博朋克主题**：
- 背景: `#0B0C1F` → `#16172E`
- 强调色: 霓虹青 `#6AD6FF`、霓虹橙 `#FF6B35`
- 卡片背景: `#1A1B3E`
- 文字主色: `#E8E8F0`

---

📄 [产品需求文档](docs/PRODUCT_DOCUMENT.md) | 
📚 [技术文档](docs/TECHNICAL_DOCUMENT.md) | 
📋 [开发计划](docs/DEVELOPMENT_PLAN.md)
