# AGENTS.md

## 项目概述

**LMES**（Lightweight MES）是一个面向工厂车间的移动端**制造执行系统**，覆盖生产管理、质量管理、仓储管理、设备管理和 Andon（安灯）管理五大业务领域。

- **应用名称**: MES 管理系统
- **当前版本**: 1.0.4
- **运行平台**: Android / iOS / 微信小程序
- **构建工具**: HBuilderX

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | **Vue 3**（兼容 Vue 2） |
| 跨端框架 | **UniApp**（一套代码多端运行） |
| CSS 预处理 | Less + SCSS（`uni.scss`） |
| UI 组件库 | uni-ui 官方组件 + uv-ui 社区组件 |
| 自定义组件 | `i-table`（表格）、`toast`（消息提示） |
| 原生能力 | Barcode（扫码）、Bluetooth（蓝牙打印） |
| 字体图标 | iconfont（阿里图标库） |

---

## 目录结构

```
lmes-master2/
├── api/                          # API 接口层
│   ├── request.js                # 核心请求封装（uni.request）
│   ├── home.js                   # 登录、菜单 API
│   ├── produce/
│   │   └── produce.js            # 生产管理 API
│   └── warehouse/                # 仓储管理 API（9 个文件）
│       ├── material.js           # 物料出入库/退货
│       ├── product.js            # 成品出入库/发货
│       ├── moldMounting.js       # 模具上下模/工序报工
│       ├── transfer.js           # 调拨
│       ├── goodsShelving.js      # 货物上架/下架
│       ├── inventoryTask.js      # 盘点任务
│       ├── ctuCartonPicking.js   # CTO 箱拣选
│       ├── equipmentSpotCheck.js # 设备点检
│       ├── equipmentRepairRequest.js # 设备报修
│       └── repairTask.js         # 维修任务
├── common/                       # 公共工具
│   ├── util.js                   # 工具函数（日期、编码识别）
│   ├── enum.js                   # 枚举常量
│   ├── scan.js                   # 扫码封装
│   ├── toast.js                  # Toast 组件调用
│   ├── beautyToast.js            # 美化 Toast
│   ├── update.js                 # App 整包更新
│   └── printerTool.js            # 蓝牙打印
├── components/                   # 自定义组件
│   ├── i-table/i-table.vue       # 表格组件
│   └── toast/toast.vue           # Toast 组件
├── pages/                        # 页面目录
│   ├── login/login.vue           # 登录
│   ├── index/index.vue           # 主页
│   ├── work/work.vue             # 作业中心（功能总入口）
│   │   ├── produce/              # 生产管理（11 个页面）
│   │   ├── quality/              # 质量管理（4 个页面）
│   │   ├── warehouse/            # 仓储管理（28 个页面）
│   │   ├── device/               # 设备管理（5 个页面）
│   │   └── andon/                # Andon 管理（4 个页面）
│   ├── message/message.vue       # 消息
│   └── profile/profile.vue       # 个人中心
├── static/                       # 静态资源
│   ├── images/                   # 图标资源
│   ├── font/                     # iconfont 字体图标
│   └── styles/
│       ├── common.less           # 全局公共样式
│       ├── warehouse.less        # 仓储模块样式
│       └── warehouse-common.less # 仓储公共样式
├── uni_modules/                  # UniApp 插件模块
├── App.vue                       # 应用入口
├── main.js                       # 入口 JS
├── pages.json                    # 路由配置（56 个页面）
├── manifest.json                 # 应用配置
└── index.html                    # Web 端入口
```

---

## API 架构

### 请求封装

`api/request.js` 基于 `uni.request` 统一封装：
- 自动携带 `Authorization` 头（从 storage 读取）
- 401 自动跳转登录页
- 默认超时 60 秒

### 后端微服务路由

| 前缀 | 服务 | 用途 |
|------|------|------|
| `/mes-user` | 用户服务 | 登录认证、用户信息、菜单 |
| `/mes-main` | 核心业务 | 生产管理、工单、报工、投料 |
| `/mes-equip` | 设备服务 | 点检、保养、模具操作 |
| `/mes-wms` | 仓储服务 | 出入库、拣货、盘点、调拨 |

### API 调用规范

```javascript
import someApi from '/api/warehouse/someModule.js'

// 推荐使用 .then() 链式调用
someApi.getData(params).then(res => {
    if (res.code == '200') {
        // 处理数据
    }
}).catch(() => {
    // 错误处理
})
```

---

## 页面路由结构

### 业务模块

| 模块 | 路由前缀 | 页面数 | 说明 |
|------|----------|--------|------|
| 登录 | `pages/login/` | 1 | 用户登录 |
| 主页 | `pages/index/` | 1 | 消息、待办任务 |
| 作业中心 | `pages/work/work` | 1 | 所有功能入口 |
| 生产管理 | `pages/work/produce/` | 11 | 工单、上工、报工、投料、不良品等 |
| 质量管理 | `pages/work/quality/` | 4 | IQC/IPQC/FQC/OQC 检验 |
| 仓储管理 | `pages/work/warehouse/` | 28 | 出入库、拣货、调拨、盘点等 |
| 设备管理 | `pages/work/device/` | 5 | 报修、维修、保养、稼动变更 |
| Andon | `pages/work/andon/` | 4 | 安灯触发、判定、处理 |

---

## 公共工具

| 文件 | 功能 | 主要导出 |
|------|------|---------|
| `common/scan.js` | 扫码 | Promise 包装 `uni.scanCode` |
| `common/util.js` | 工具函数 | 日期格式化、编码类型识别、仓库解析 |
| `common/enum.js` | 枚举 | 操作类型、出库类型、编码类型常量 |
| `common/beautyToast.js` | 提示 | 居中美化 Toast |
| `common/update.js` | 更新 | 整包更新检测、APK 下载安装 |
| `common/printerTool.js` | 打印 | 蓝牙打印机核心模块 |

---

## 编码规范

### 异步调用

使用 `.then()/.catch()` 链式调用，**不使用 `async/await`**。

### this 引用

需保存 `this` 引用的场景使用 `const _this = this`。

### 扫码输入延迟

所有 `@confirm` 方法必须添加 `setTimeout`，详见下方规范。

---

## 仓库页面输入确认延迟规范

### 问题背景

扫码枪输入后，`@confirm` 事件可能比 `v-model` 绑定更早触发，导致输入值尚未更新就开始查询。

### 解决方案

所有仓库页面的 `@confirm` 方法统一使用 `200ms setTimeout` 延迟。

### 代码模式

```javascript
onXxxConfirm() {
    const _this = this;
    setTimeout(function() {
        if (_this.xxxCode) {
            _this.loadXxx();
        }
    }, 200);
},
```

### 已应用文件

| 文件 | 方法 | 说明 |
|------|------|------|
| `moldDismounting/moldDismounting.vue` | `onEquipmentCodeConfirm` | 设备码确认 → 加载设备信息 |
| `goodsUnshelving/goodsUnshelving.vue` | `onFormCodeConfirm` | 单据号确认 → 加载订单 |
| `transfer/transfer.vue` | `onInputConfirm` | 货架号输入 → 查询信息 |
| `transfer/agvtransfer.vue` | `onStorageCodeConfirm` | 储位码确认 → 加载货架 |
| `transfer/agvtransfer.vue` | `onLabelManualInput` | 标签码输入 → 加载标签 |
| `goodsUnshelving/components/SmartUnshelving.vue` | `onStorageCodeConfirm` | 货架码回车 → 亮灯 |
| `goodsUnshelving/components/SmartUnshelving.vue` | `onLabelCodeConfirm` | 标签码回车 → 取货 |
| `goodsUnshelving/components/NormalUnshelving.vue` | `onStorageCodeConfirm` | 货架码回车 → 提交 |
| `goodsShelving/goodsShelving.vue` | `onFormCodeConfirm` | 单据号确认 → 加载订单 |
| `goodsShelving/goodsShelving.vue` | `onStorageCodeConfirm` | 货架码回车 → 亮灯/校验 |
| `goodsShelving/goodsShelving.vue` | `onLabelCodeConfirm` | 标签码回车 → 校验添加 |
| `processReport/processReport.vue` | `onWorksheetConfirm` | 工单确认 → 查询 |
| `processReport/processReport.vue` | `onEquipCodeConfirm` | 设备码确认 → 查询 |
| `equipmentRepairRequest/equipmentRepairRequest.vue` | `onQueryEquipment` | 设备编码 → 查询 |
| `equipmentRepairRequest/equipmentRepairRequest.vue` | `onQueryMold` | 模具编码 → 查询 |

### 新增页面注意事项

新开发的仓库页面中，所有通过 `@confirm` 触发输入查询的方法，**必须**使用相同的 `setTimeout(200ms)` 延迟模式。
