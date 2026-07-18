# LMES 国际化（i18n）设计方案

- **日期**：2026-07-18
- **状态**：已评审，待编写实施计划
- **目标平台**：App（Android / iOS）。不考虑微信小程序等平台，tabBar `%%` 原生国际化方案可用。

## 1. 背景与目标

LMES 是一套 uni-app（Vue3）+ HBuilderX 的工厂车间 MES 移动端。当前 78 个 `.vue` 页面、`pages.json` 的导航栏标题、tabBar 文案全部硬编码中文，无国际化能力。

目标：将应用改造为支持 **简体中文（默认）/ 英文 / 韩文** 三语，且语言由 `manifest.json` 手动固定（不做运行时切换）。

## 2. 关键决策（已与用户确认）

| 项 | 决策 |
|----|------|
| 目标语言 | 简中 `zh-Hans`（默认）/ 英文 `en` / 韩文 `ko` |
| 切换方式 | `manifest.json` 顶层 `"locale"` 字段手动固定，无 App 内切换入口 |
| 实施范围 | 分阶段：先基础设施+全局壳，再按业务模块逐批 |
| 依赖引入 | 经 HBuilderX 插件市场导入 `vue-i18n@9.x` 到 `uni_modules`，代码 `import { createI18n } from 'vue-i18n'` |
| 运行平台 | 仅 App（Android/iOS） |

## 3. 架构：两套独立、共源的 i18n 系统

uni-app 国际化有**两套互不相干**的机制，必须同时处理：

### A. 代码层（vue-i18n）
- 作用：所有 `.vue` 页面内中文（按钮、标签、提示、placeholder）。
- 用法：模板 `{{ $t('key') }}`；选项式 API 的 JS 中用 `this.$t('key')`；组合式 API 中用 `useI18n()`。

### B. 配置层（根 `locale/` + `%%` 占位）
- 作用：`pages.json` 的 `navigationBarTitleText`、`tabBar.list.text`、`manifest.json` 的 `name`。
- 用法：根目录建 `locale/` 文件夹，配置项写成 `"%key%"` 形式，运行时按 `locale` 加载对应语言文件。

### 单一数据源
`/locale/zh-Hans.json`、`/locale/en.json`、`/locale/ko.json` 三份文件**同时供 A、B 两套使用**（vue-i18n 在 `main.js` import 这三个 json；`pages.json` 的 `%%` 也读它们）。采用命名空间避免冲突：

```
app.*        // manifest / globalStyle，如 app.title="MES 管理系统"
pages.*      // navigationBarTitleText，如 pages.login.title="登录"
tab.*        // tabBar 文案，如 tab.home="主页"
<模块>.*     // 页面内文案，如 login.account、warehouse.materialin.scan
```

## 4. 关键文件改动

### 4.1 `manifest.json`
顶层新增默认语言字段（即用户要求的"手动设置点"）：
```json
{
  "name": "%app.name%",
  "locale": "zh-Hans"
}
```
改 `en` / `ko` 即切换整包语言。

### 4.2 `main.js`（仅 `#ifdef VUE3` 块）
```js
// #ifdef VUE3
import { createSSRApp } from 'vue'
import { createI18n } from 'vue-i18n'
import zhHans from './locale/zh-Hans.json'
import en from './locale/en.json'
import ko from './locale/ko.json'
import manifest from './manifest.json'

const messages = { 'zh-Hans': zhHans, en, ko }
const defaultLocale = (manifest && manifest.locale) || uni.getLocale() || 'zh-Hans'
const i18n = createI18n({ locale: defaultLocale, fallbackLocale: 'zh-Hans', messages })

export function createApp() {
  const app = createSSRApp(App)
  app.use(i18n)
  return { app }
}
// #endif
```

### 4.3 `pages.json`
- `globalStyle.navigationBarTitleText` → `"%app.title%"`
- 每个页面 `navigationBarTitleText` 中文 → `"%pages.<模块>.<页>%"`
- 启用被注释的 `tabBar`，`text` 改为 `"%tab.<名>%"`

示例：
```json
{
  "pages": [
    { "path": "pages/login/login", "style": { "navigationBarTitleText": "%pages.login.title%" } }
  ],
  "globalStyle": { "navigationBarTitleText": "%app.title%" },
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "iconPath": "static/images/index.png",
        "selectedIconPath": "static/images/index_selected.png", "text": "%tab.home%" }
    ]
  }
}
```

### 4.4 `.vue` 页面（工作量主体，78 个）
- 模板静态中文 → `{{ $t('key') }}`；动态属性如 `:placeholder="$t('key')"`、`:title="$t('key')"`
- JS 中 `uni.showToast({ title: '成功' })` 等 → `this.$t('common.success')`
- 遵循项目现有规范：`.then()` 链式、必要时 `const _this = this`

示例：
```html
<template>
  <view class="container">
    <text>{{ $t('login.title') }}</text>
    <input :placeholder="$t('login.accountPlaceholder')" />
    <button>{{ $t('login.submit') }}</button>
  </view>
</template>
```
```js
uni.showToast({ title: this.$t('common.success'), icon: 'success' })
```

## 5. 语言包文件结构

```
locale/
├── zh-Hans.json   // 简体中文（沿用现有文案）
├── en.json        // 英文（初版由 AI 生成，译员校对）
└── ko.json        // 韩文（初版由 AI 生成，译员校对）
```

`zh-Hans.json` 示例：
```json
{
  "app.name": "MES 管理系统",
  "app.title": "MES 管 理 系 统",
  "tab.home": "主页",
  "tab.work": "作业",
  "tab.message": "消息",
  "tab.profile": "我的",
  "pages.login.title": "登录",
  "login.account": "账号",
  "login.accountPlaceholder": "请输入账号",
  "login.submit": "登录",
  "common.success": "操作成功",
  "common.fail": "操作失败"
}
```

## 6. 分阶段实施计划

### Phase 0 — 基础设施
- 经 HBuilderX 插件市场导入 `vue-i18n@9.x` 到 `uni_modules`
- 创建 `locale/` 三语言文件，先填充 `app.*` / `pages.login.*` / `tab.*` 等壳层 key
- 改 `main.js`（VUE3 块）、`manifest.json`（加 locale）、`pages.json`（全局标题 + tabBar + login 导航栏）
- 真机/模拟器验证：修改 `manifest.json` 的 `locale` 为 `en`/`ko`，确认壳层标题与 tabBar 三语生效

**交付物**：可运行的三语壳层骨架。

### Phase 1 — 全局壳页
- 页面：`login` / `work`(作业中心菜单) / `index` / `message` / `profile`
- 全量抽取中文 → 生成 en/ko 翻译 → 替换为 `$t('key')`

**交付物**：五大壳页完整三语。

### Phase 2~N — 业务模块逐批
每批步骤：抽 key → 译 en/ko → 替换 `$t` → 真机验证。
- 先挑 **1 个代表页**端到端跑通作为模板（建议 `produce/worksheeton` 工单进站），固化抽取/命名规范
- 再按模块批量：
  - produce（11+ 页）
  - warehouse（28+ 页，含子组件 `goodsUnshelving/components/*`）
  - quality（4 页）
  - device（5 页）
  - andon（4 页）

**交付物**：各模块三语文案完整、可运行。

### Phase 末 — 收尾
- 全局搜索遗漏的中文硬编码、`$t` 未覆盖项（如 `uni.showToast` 字面量）
- 三语文案对齐、关键页面截图验证
- 输出 key 命名规范文档（并入本设计文档附录或独立 `i18n-keys.md`）

## 7. 翻译策略
- `zh-Hans`：沿用现有中文文案。
- `en` / `ko`：由 AI 据语义生成初版，用户或译员校对修正。
- 维护一致的 key 命名规范（模块前缀 + 语义），避免重复与歧义。

## 8. 风险与注意事项
- **vue-i18n 当前不在工程内**：须先经插件市场导入，否则 `import` 报错。
- **两套系统独立**：`pages.json`/`tabBar` 用 `%%`，页面内用 `$t()`，勿混淆。
- **后端数据**：接口返回的状态/类型等中文（如"待作业"）属数据非 UI，v1 不处理；后续可用前端字典 `map` 到 i18n（可选，单列阶段）。
- **仅 App 平台**：tabBar `%%` 在微信小程序不支持，但本项目只考虑 App，无碍。
- **无 nvue 页面**：无需 `@dcloudio/uni-i18n` 的 `initVueI18n` 特殊处理。
- **Android 切换语言**：原生层会自动重启应用，属正常行为。

## 9. 验证方式
- 修改 `manifest.json` 的 `locale` 为 `zh-Hans` / `en` / `ko` 分别打包运行
- 检查导航栏标题、tabBar、页面内文案、toast 提示均随语言变化
- 关键流程页（登录、工单进站、物料入库等）三语截图留档
