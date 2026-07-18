# LMES 国际化（i18n）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 LMES（uni-app Vue3，仅 App 平台）改造为支持简体中文（默认）/ 英文 / 韩文三语，语言由 `manifest.json` 的 `locale` 字段手动固定。

**Architecture:** 采用 uni-app 官方两套并列机制——代码层用 `vue-i18n`（`main.js` 挂载，`$t()` 取词）处理 `.vue` 页面内文案；配置层用根目录 `locale/` 文件夹 + `%%` 占位处理 `pages.json`/`tabBar`/`manifest.json`。三语言文件 `locale/{zh-Hans,en,ko}.json` 作为单一数据源同时被两套机制引用，按命名空间（`app.*` / `tab.*` / `pages.*` / `<模块>.*`）组织 key。

**Tech Stack:** uni-app (Vue3, `createSSRApp`) + `vue-i18n@9.x`（经 HBuilderX 插件市场导入 `uni_modules`）+ HBuilderX 工程（无 npm）。

## Global Constraints

- 目标语言：`zh-Hans`（默认）/ `en` / `ko`，对应 `locale/zh-Hans.json`、`locale/en.json`、`locale/ko.json`。
- 语言固定方式：`manifest.json` 顶层 `"locale"` 字段（值 `zh-Hans`/`en`/`ko`），**不做运行时切换、无 App 内语言入口**。
- 运行平台：**仅 App（Android/iOS）**；tabBar `%%` 原生国际化可用，不考虑微信小程序。
- 依赖：`vue-i18n` 当前不在工程内，须先经 HBuilderX 插件市场导入 `vue-i18n@9.x` 到 `uni_modules`，之后 `import { createI18n } from 'vue-i18n'`。
- 代码风格：沿用项目现有规范（`.then()` 链式、必要时 `const _this = this`），**仅替换中文文案，不重构业务逻辑**。
- 两套系统独立：`pages.json`/`tabBar`/`manifest` 用 `"%key%"`；`.vue` 页面内用 `$t('key')`，勿混淆。
- 后端接口返回的中文状态/类型数据（v1）不处理，属数据非 UI。

---

## File Structure

**新建：**
- `locale/zh-Hans.json` — 简体中文词条（单一数据源，含 `app.*`/`tab.*`/`pages.*`/各页面内 key）
- `locale/en.json` — 英文词条（同 key 结构）
- `locale/ko.json` — 韩文词条（同 key 结构）

**修改：**
- `main.js` — `#ifdef VUE3` 块内挂载 `createI18n`（`locale` 读取 `manifest.json`）
- `manifest.json` — 顶层加 `"locale"`；`name` 改用 `"%app.name%"`
- `pages.json` — `globalStyle.navigationBarTitleText` → `"%app.title%"`；每个页面 `navigationBarTitleText` → `"%pages.<模块>.<页>%"`；启用 tabBar 并 `text` → `"%tab.<名>%"`
- `pages/login/login.vue` — 文案 `$t()` 化
- `pages/work/work.vue` — 菜单项 `name` `$t()` 化
- `pages/index/index.vue`、`pages/message/message.vue`、`pages/profile/profile.vue` — 文案 `$t()` 化
- `pages/work/produce/worksheeton/worksheeton.vue` — 代表页全量 `$t()` 化（模板）
- 其余 72 个 `.vue` 页面 — 按 Phase 3+ 逐模块 `$t()` 化

---

## Phase 0 — 基础设施

### Task 1: 导入 vue-i18n 依赖

**Files:**
- 工程依赖（非文件编辑）

**Interfaces:**
- 无（前置条件）

- [ ] **Step 1: 通过 HBuilderX 插件市场导入 vue-i18n**
  在 HBuilderX 中：右键项目 →「插件市场」→ 搜索 `vue-i18n` → 导入（版本 `9.x`，如 `9.1.9`），安装到 `uni_modules`。
  预期：工程 `uni_modules/vue-i18n/` 目录存在，`import { createI18n } from 'vue-i18n'` 可解析。
- [ ] **Step 2: 验证可解析**
  在 `main.js` 顶部临时加 `import { createI18n } from 'vue-i18n'`，HBuilderX 不报红即成功；随后在 Task 2 正式使用。

> 注：若插件市场导入失败，退路为初始化 npm（`package.json` 加 `vue-i18n@9.1.9` 后 `npm install`），但优先插件市场方案。

- [ ] **Step 3: Commit**
```bash
git add -A
git commit -m "chore: 导入 vue-i18n 依赖(uni_modules)"
```

### Task 2: 创建三语言词条文件（基础层）

**Files:**
- Create: `locale/zh-Hans.json`
- Create: `locale/en.json`
- Create: `locale/ko.json`

**Interfaces:**
- Produces: 全局可被 `main.js` 与 `pages.json` 引用的词条（`app.*`、`tab.*`、`pages.*`）。后续所有页面内 key 追加到同文件。

- [ ] **Step 1: 写入 `locale/zh-Hans.json`**
```json
{
  "app.name": "MES 管理系统",
  "app.title": "MES 管 理 系 统",
  "tab.home": "主页",
  "tab.work": "作业",
  "tab.message": "消息",
  "tab.profile": "我的",
  "login.accountPlaceholder": "请输入用户名",
  "login.passwordPlaceholder": "请输入密码",
  "login.submit": "登录",
  "login.submitting": "登录中...",
  "login.empty": "用户名或密码不能为空！",
  "login.fail": "登录失败，请检查用户名和密码",
  "login.netError": "登录失败，请检查网络连接",
  "work.produce": "生产管理",
  "work.quality": "质量管理",
  "work.warehouse": "仓储管理",
  "work.device": "设备管理",
  "work.andon": "andon管理",
  "index.unreadMsg": "未读消息",
  "index.more": "更多>>",
  "index.todo": "待办任务",
  "index.loginFirst": "请先登录！",
  "profile.title": "我的",
  "message.title": "message",
  "common.pass": "合格",
  "common.fail": "不合格",
  "common.onlineSuccess": "上线成功",
  "common.scan": "请扫描",
  "common.scanOrSelect": "扫描或选择",
  "common.check": "校验",
  "common.confirmIn": "确认进站",
  "ws.process": "工序：",
  "ws.equipment": "设备：",
  "ws.workSheet": "工单号：",
  "ws.productCode": "产品编号：",
  "ws.productName": "产品名称：",
  "ws.planQty": "计划数量：",
  "ws.onlineQty": "上线数量：",
  "ws.userCheck": "人员校验：",
  "ws.equipCheck": "设备点检：",
  "ws.materialCheck": "物料校验：",
  "ws.paramCheck": "参数校验：",
  "ws.checkResult": "校验结果：",
  "pages.produce.worksheeton": "工单进站",
  "pages.produce.worker": "人员上工",
  "pages.produce.devicecheck": "设备点检",
  "pages.produce.worksheetoff": "工单下线",
  "pages.produce.baogong": "生产报工",
  "pages.produce.touliao": "物料投料",
  "pages.produce.attendance": "产线考勤",
  "pages.produce.mujukuaihuan": "模具快换",
  "pages.produce.blpjilu": "不良品记录",
  "pages.produce.blpkuaixiu": "不良品快修",
  "pages.produce.fpkuailu": "废品快录",
  "pages.quality.iqccheck": "IQC检测",
  "pages.quality.ipqccheck": "IPQC(首件检)",
  "pages.quality.fqccheck": "FQC检验",
  "pages.quality.oqccheck": "OQC检验",
  "pages.warehouse.materialin": "物料入库",
  "pages.warehouse.materialout": "物料出库",
  "pages.warehouse.materialreturn": "物料退货",
  "pages.warehouse.materialback": "物料退库",
  "pages.warehouse.materildb": "物料调拨",
  "pages.warehouse.cpin": "成品入库",
  "pages.warehouse.cpsend": "成品发货",
  "pages.warehouse.cpreturn": "成品退货",
  "pages.warehouse.cpback": "成品退库",
  "pages.warehouse.cpdb": "成品调拨",
  "pages.warehouse.devicebaoxiu": "设备报修",
  "pages.warehouse.devicerepair": "设备维修",
  "pages.warehouse.shangliao": "物料上料",
  "pages.warehouse.worksheetout": "工单出站",
  "pages.warehouse.workeroff": "人员下工",
  "pages.warehouse.xialiao": "物料下料",
  "pages.warehouse.zhuanyi": "物料转移",
  "pages.device.pendingworklist": "设备待作业列表",
  "pages.device.baoyang": "设备保养",
  "pages.device.biangeng": "设备稼动变更",
  "pages.andon.pendinglist": "andon待作业列表",
  "pages.andon.trigger": "andon触发",
  "pages.andon.wentipanding": "andon问题判定",
  "pages.andon.wentiprocess": "andon问题处理",
  "pages.warehouse.inboundPicking": "入库拣货",
  "pages.warehouse.outboundPicking": "出库拣货",
  "pages.warehouse.operationPage": "拣货作业",
  "pages.warehouse.ctuCartonPicking": "CTO箱拣选",
  "pages.warehouse.ctuOutboundPicking": "CTO出仓拣选",
  "pages.warehouse.cartonCodeQuery": "箱码查询",
  "pages.warehouse.printTest": "打印测试",
  "pages.warehouse.printerConnect": "打印机连接",
  "pages.warehouse.transfer": "调拨",
  "pages.warehouse.agvtransfer": "调拨作业",
  "pages.warehouse.moldMounting": "模具上模",
  "pages.warehouse.moldDismounting": "模具下模",
  "pages.warehouse.inventoryTask": "盘点任务",
  "pages.warehouse.inventoryOperation": "盘点作业",
  "pages.warehouse.inventoryDetail": "盘点明细",
  "pages.warehouse.goodsShelving": "货物上架",
  "pages.warehouse.goodsUnshelving": "货物下架",
  "pages.warehouse.processFeeding": "工序上料",
  "pages.warehouse.processReport": "工序报工",
  "pages.warehouse.equipmentSpotCheck": "设备点检",
  "pages.warehouse.equipmentMaintenance": "设备保养",
  "pages.warehouse.equipmentSpotCheckDetail": "设备点检",
  "pages.warehouse.equipmentMaintenanceDetails": "保养详情",
  "pages.warehouse.equipmentRepairRequest": "设备报修",
  "pages.warehouse.repairTask": "维修任务",
  "pages.warehouse.repairTaskDetails": "维修详情",
  "pages.warehouse.inboundPickingNotAGV": "入库拣货",
  "pages.warehouse.outboundPickingNotAGV": "出库拣货",
  "pages.warehouse.operationPageNotAGV": "拣货详情"
}
```

- [ ] **Step 2: 写入 `locale/en.json`**（与 `zh-Hans.json` 同 key）
```json
{
  "app.name": "MES Management System",
  "app.title": "MES Management System",
  "tab.home": "Home",
  "tab.work": "Work",
  "tab.message": "Message",
  "tab.profile": "Profile",
  "login.accountPlaceholder": "Please enter username",
  "login.passwordPlaceholder": "Please enter password",
  "login.submit": "Login",
  "login.submitting": "Logging in...",
  "login.empty": "Username or password cannot be empty!",
  "login.fail": "Login failed, check username and password",
  "login.netError": "Login failed, check network connection",
  "work.produce": "Production Management",
  "work.quality": "Quality Management",
  "work.warehouse": "Warehouse Management",
  "work.device": "Device Management",
  "work.andon": "Andon Management",
  "index.unreadMsg": "Unread Messages",
  "index.more": "More>>",
  "index.todo": "Todo Tasks",
  "index.loginFirst": "Please login first!",
  "profile.title": "Profile",
  "message.title": "message",
  "common.pass": "Pass",
  "common.fail": "Fail",
  "common.onlineSuccess": "Online success",
  "common.scan": "Scan",
  "common.scanOrSelect": "Scan or Select",
  "common.check": "Check",
  "common.confirmIn": "Confirm In",
  "ws.process": "Process:",
  "ws.equipment": "Equipment:",
  "ws.workSheet": "Work Order:",
  "ws.productCode": "Product Code:",
  "ws.productName": "Product Name:",
  "ws.planQty": "Plan Qty:",
  "ws.onlineQty": "Online Qty:",
  "ws.userCheck": "User Check:",
  "ws.equipCheck": "Equipment Check:",
  "ws.materialCheck": "Material Check:",
  "ws.paramCheck": "Param Check:",
  "ws.checkResult": "Check Result:",
  "pages.produce.worksheeton": "Work Order In",
  "pages.produce.worker": "Worker Clock-in",
  "pages.produce.devicecheck": "Equipment Check",
  "pages.produce.worksheetoff": "Work Order Out",
  "pages.produce.baogong": "Production Reporting",
  "pages.produce.touliao": "Material Feeding",
  "pages.produce.attendance": "Line Attendance",
  "pages.produce.mujukuaihuan": "Quick Mold Change",
  "pages.produce.blpjilu": "Defect Quick Record",
  "pages.produce.blpkuaixiu": "Defect Quick Repair",
  "pages.produce.fpkuailu": "Scrap Quick Record",
  "pages.quality.iqccheck": "IQC Inspection",
  "pages.quality.ipqccheck": "IPQC (First Article)",
  "pages.quality.fqccheck": "FQC Inspection",
  "pages.quality.oqccheck": "OQC Inspection",
  "pages.warehouse.materialin": "Material Inbound",
  "pages.warehouse.materialout": "Material Outbound",
  "pages.warehouse.materialreturn": "Material Return",
  "pages.warehouse.materialback": "Material Return to Stock",
  "pages.warehouse.materildb": "Material Transfer",
  "pages.warehouse.cpin": "Finished Goods Inbound",
  "pages.warehouse.cpsend": "Finished Goods Shipping",
  "pages.warehouse.cpreturn": "Finished Goods Return",
  "pages.warehouse.cpback": "Finished Goods Return to Stock",
  "pages.warehouse.cpdb": "Finished Goods Transfer",
  "pages.warehouse.devicebaoxiu": "Equipment Repair Request",
  "pages.warehouse.devicerepair": "Equipment Repair",
  "pages.warehouse.shangliao": "Material Loading",
  "pages.warehouse.worksheetout": "Work Order Outstation",
  "pages.warehouse.workeroff": "Worker Clock-out",
  "pages.warehouse.xialiao": "Material Unloading",
  "pages.warehouse.zhuanyi": "Material Transfer",
  "pages.device.pendingworklist": "Equipment Pending List",
  "pages.device.baoyang": "Equipment Maintenance",
  "pages.device.biangeng": "Equipment Status Change",
  "pages.andon.pendinglist": "Andon Pending List",
  "pages.andon.trigger": "Andon Trigger",
  "pages.andon.wentipanding": "Andon Problem Judgment",
  "pages.andon.wentiprocess": "Andon Problem Handling",
  "pages.warehouse.inboundPicking": "Inbound Picking",
  "pages.warehouse.outboundPicking": "Outbound Picking",
  "pages.warehouse.operationPage": "Picking Operation",
  "pages.warehouse.ctuCartonPicking": "CTO Carton Picking",
  "pages.warehouse.ctuOutboundPicking": "CTO Outbound Picking",
  "pages.warehouse.cartonCodeQuery": "Carton Code Query",
  "pages.warehouse.printTest": "Print Test",
  "pages.warehouse.printerConnect": "Printer Connect",
  "pages.warehouse.transfer": "Transfer",
  "pages.warehouse.agvtransfer": "Transfer Operation",
  "pages.warehouse.moldMounting": "Mold Mounting",
  "pages.warehouse.moldDismounting": "Mold Dismounting",
  "pages.warehouse.inventoryTask": "Inventory Task",
  "pages.warehouse.inventoryOperation": "Inventory Operation",
  "pages.warehouse.inventoryDetail": "Inventory Detail",
  "pages.warehouse.goodsShelving": "Goods Shelving",
  "pages.warehouse.goodsUnshelving": "Goods Unshelving",
  "pages.warehouse.processFeeding": "Process Loading",
  "pages.warehouse.processReport": "Process Reporting",
  "pages.warehouse.equipmentSpotCheck": "Equipment Check",
  "pages.warehouse.equipmentMaintenance": "Equipment Maintenance",
  "pages.warehouse.equipmentSpotCheckDetail": "Equipment Check",
  "pages.warehouse.equipmentMaintenanceDetails": "Maintenance Detail",
  "pages.warehouse.equipmentRepairRequest": "Equipment Repair Request",
  "pages.warehouse.repairTask": "Repair Task",
  "pages.warehouse.repairTaskDetails": "Repair Detail",
  "pages.warehouse.inboundPickingNotAGV": "Inbound Picking",
  "pages.warehouse.outboundPickingNotAGV": "Outbound Picking",
  "pages.warehouse.operationPageNotAGV": "Picking Detail"
}
```

- [ ] **Step 3: 写入 `locale/ko.json`**（与 `zh-Hans.json` 同 key）
```json
{
  "app.name": "MES 관리 시스템",
  "app.title": "MES 관 리 시 스 템",
  "tab.home": "홈",
  "tab.work": "작업",
  "tab.message": "메시지",
  "tab.profile": "내 정보",
  "login.accountPlaceholder": "사용자 이름을 입력하세요",
  "login.passwordPlaceholder": "비밀번호를 입력하세요",
  "login.submit": "로그인",
  "login.submitting": "로그인 중...",
  "login.empty": "사용자 이름 또는 비밀번호를 입력하세요!",
  "login.fail": "로그인 실패, 사용자 이름과 비밀번호를 확인하세요",
  "login.netError": "로그인 실패, 네트워크 연결을 확인하세요",
  "work.produce": "생산 관리",
  "work.quality": "품질 관리",
  "work.warehouse": "창고 관리",
  "work.device": "설비 관리",
  "work.andon": "안돈 관리",
  "index.unreadMsg": "읽지 않은 메시지",
  "index.more": "더보기>>",
  "index.todo": "할 일",
  "index.loginFirst": "먼저 로그인하세요!",
  "profile.title": "내 정보",
  "message.title": "message",
  "common.pass": "합격",
  "common.fail": "불합격",
  "common.onlineSuccess": "투입 성공",
  "common.scan": "스캔",
  "common.scanOrSelect": "스캔 또는 선택",
  "common.check": "점검",
  "common.confirmIn": "투입 확인",
  "ws.process": "공정:",
  "ws.equipment": "설비:",
  "ws.workSheet": "작업지시:",
  "ws.productCode": "제품 코드:",
  "ws.productName": "제품 명:",
  "ws.planQty": "계획 수량:",
  "ws.onlineQty": "투입 수량:",
  "ws.userCheck": "작업자 점검:",
  "ws.equipCheck": "설비 점검:",
  "ws.materialCheck": "자재 점검:",
  "ws.paramCheck": "파라미터 점검:",
  "ws.checkResult": "점검 결과:",
  "pages.produce.worksheeton": "작업지시 투입",
  "pages.produce.worker": "작업자 출근",
  "pages.produce.devicecheck": "설비 점검",
  "pages.produce.worksheetoff": "작업지시 종료",
  "pages.produce.baogong": "생산 실적 보고",
  "pages.produce.touliao": "자재 투입",
  "pages.produce.attendance": "라인 근태",
  "pages.produce.mujukuaihuan": "금형 퀵 교환",
  "pages.produce.blpjilu": "불량품 빠른 기록",
  "pages.produce.blpkuaixiu": "불량품 빠른 수리",
  "pages.produce.fpkuailu": "폐기물 빠른 기록",
  "pages.quality.iqccheck": "IQC 검사",
  "pages.quality.ipqccheck": "IPQC(초품 검사)",
  "pages.quality.fqccheck": "FQC 검사",
  "pages.quality.oqccheck": "OQC 검사",
  "pages.warehouse.materialin": "자재 입고",
  "pages.warehouse.materialout": "자재 출고",
  "pages.warehouse.materialreturn": "자재 반품",
  "pages.warehouse.materialback": "자재 재고 반납",
  "pages.warehouse.materildb": "자재 이송",
  "pages.warehouse.cpin": "완제품 입고",
  "pages.warehouse.cpsend": "완제품 출하",
  "pages.warehouse.cpreturn": "완제품 반품",
  "pages.warehouse.cpback": "완제품 재고 반납",
  "pages.warehouse.cpdb": "완제품 이송",
  "pages.warehouse.devicebaoxiu": "설비 수리 요청",
  "pages.warehouse.devicerepair": "설비 수리",
  "pages.warehouse.shangliao": "자재 상차",
  "pages.warehouse.worksheetout": "작업지시 출고",
  "pages.warehouse.workeroff": "작업자 퇴근",
  "pages.warehouse.xialiao": "자재 하차",
  "pages.warehouse.zhuanyi": "자재 이동",
  "pages.device.pendingworklist": "설비 대기 작업 목록",
  "pages.device.baoyang": "설비 보전",
  "pages.device.biangeng": "설비 가동 변경",
  "pages.andon.pendinglist": "안돈 대기 작업 목록",
  "pages.andon.trigger": "안돈 트리거",
  "pages.andon.wentipanding": "안돈 문제 판정",
  "pages.andon.wentiprocess": "안돈 문제 처리",
  "pages.warehouse.inboundPicking": "입고 피킹",
  "pages.warehouse.outboundPicking": "출고 피킹",
  "pages.warehouse.operationPage": "피킹 작업",
  "pages.warehouse.ctuCartonPicking": "CTO 박스 피킹",
  "pages.warehouse.ctuOutboundPicking": "CTO 출고 피킹",
  "pages.warehouse.cartonCodeQuery": "박스 코드 조회",
  "pages.warehouse.printTest": "인쇄 테스트",
  "pages.warehouse.printerConnect": "프린터 연결",
  "pages.warehouse.transfer": "이송",
  "pages.warehouse.agvtransfer": "이송 작업",
  "pages.warehouse.moldMounting": "금형 장착",
  "pages.warehouse.moldDismounting": "금형 해체",
  "pages.warehouse.inventoryTask": "재고 실사 작업",
  "pages.warehouse.inventoryOperation": "재고 실사 작업",
  "pages.warehouse.inventoryDetail": "재고 실사 상세",
  "pages.warehouse.goodsShelving": "상품 진열",
  "pages.warehouse.goodsUnshelving": "상품 철수",
  "pages.warehouse.processFeeding": "공정 상차",
  "pages.warehouse.processReport": "공정 실적 보고",
  "pages.warehouse.equipmentSpotCheck": "설비 점검",
  "pages.warehouse.equipmentMaintenance": "설비 보전",
  "pages.warehouse.equipmentSpotCheckDetail": "설비 점검",
  "pages.warehouse.equipmentMaintenanceDetails": "보전 상세",
  "pages.warehouse.equipmentRepairRequest": "설비 수리 요청",
  "pages.warehouse.repairTask": "수리 작업",
  "pages.warehouse.repairTaskDetails": "수리 상세",
  "pages.warehouse.inboundPickingNotAGV": "입고 피킹",
  "pages.warehouse.outboundPickingNotAGV": "출고 피킹",
  "pages.warehouse.operationPageNotAGV": "피킹 상세"
}
```

- [ ] **Step 4: Commit**
```bash
git add locale/
git commit -m "feat(i18n): 添加三语言基础词条文件"
```

### Task 3: 挂载 i18n 到 main.js

**Files:**
- Modify: `main.js:15-24`（`#ifdef VUE3` 块）

**Interfaces:**
- Consumes: `locale/zh-Hans.json`、`locale/en.json`、`locale/ko.json`、`manifest.json`
- Produces: 全局可用的 `$t()`（模板）/ `this.$t()`（JS）

- [ ] **Step 1: 替换 `#ifdef VUE3` 块**
将 `main.js` 第 15–24 行替换为：
```js
// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import {
	createI18n
} from 'vue-i18n'
import zhHans from './locale/zh-Hans.json'
import en from './locale/en.json'
import ko from './locale/ko.json'
import manifest from './manifest.json'

const messages = {
	'zh-Hans': zhHans,
	en,
	ko
}
const defaultLocale = (manifest && manifest.locale) || uni.getLocale() || 'zh-Hans'
const i18n = createI18n({
	locale: defaultLocale,
	fallbackLocale: 'zh-Hans',
	messages
})

export function createApp() {
	const app = createSSRApp(App)
	app.use(i18n)
	return {
		app
	}
}
// #endif
```

- [ ] **Step 2: 验证**
HBuilderX 中「运行」→「运行到手机或模拟器」，无 `createI18n` 解析报错即成功。
- [ ] **Step 3: Commit**
```bash
git add main.js
git commit -m "feat(i18n): main.js 挂载 createI18n，locale 读取 manifest"
```

### Task 4: manifest.json 固定默认语言

**Files:**
- Modify: `manifest.json`（顶层字段）

**Interfaces:**
- Consumes: 无
- Produces: `main.js` 读取的 `locale` 默认值；`pages.json`/`tabBar` 使用的默认语言

- [ ] **Step 1: 新增 `locale` 字段并国际化 `name`**
在 `manifest.json` 顶层（与 `"name"` 同级）添加 `"locale": "zh-Hans"`，并将 `"name"` 改为 `"%app.name%"`。示例片段：
```json
{
	"name": "%app.name%",
	"appid": ".__UNI__XXXXXX",
	"versionName": "1.0.4",
	"versionCode": "104",
	"locale": "zh-Hans"
}
```
> 改为 `"en"` 或 `"ko"` 即整包切换语言（本任务先保持 `zh-Hans`）。

- [ ] **Step 2: 验证**
「运行到手机」后，应用默认以简中显示（后续改 `locale` 即验证切换）。
- [ ] **Step 3: Commit**
```bash
git add manifest.json
git commit -m "feat(i18n): manifest.json 固定默认语言 locale"
```

### Task 5: pages.json 导航栏标题与 tabBar 国际化

**Files:**
- Modify: `pages.json`（全部 `navigationBarTitleText`、`globalStyle`、`tabBar`）

**Interfaces:**
- Consumes: `locale/*.json` 中 `app.title`、`tab.*`、`pages.*` 词条
- Produces: 配置层国际化的页面标题与底部 tab 文案

**转换规则：** 将每个 `"navigationBarTitleText": "中文"` 替换为 `"navigationBarTitleText": "%pages.<模块>.<页>%"`，key 取自 Task 2 的 `pages.*` 映射（模块名：`produce`/`quality`/`warehouse`/`device`/`andon`；页名取 `pages.json` path 末段，如 `worksheeton`、`./warehouse/materialin/materialin` → `pages.warehouse.materialin`）。

- [ ] **Step 1: 修改 `globalStyle`**
将
```json
"navigationBarTitleText": "MES 管 理 系 统",
```
改为
```json
"navigationBarTitleText": "%app.title%",
```

- [ ] **Step 2: 修改每个页面 `navigationBarTitleText`**
按 Task 2 的 `pages.*` key 逐条替换。示例（前 3 条）：
```json
{ "path": "pages/login/login", "style": { "navigationBarTitleText": "" } },
{ "path": "pages/work/work", "style": { "enablePullDownRefresh": false } },
{ "path": "pages/index/index", "style": { "enablePullDownRefresh": false } },
...
{ "path": "pages/work/produce/worksheeton/worksheeton", "style": { "navigationBarTitleText": "%pages.produce.worksheeton%" } },
{ "path": "pages/work/produce/worker/worker", "style": { "navigationBarTitleText": "%pages.produce.worker%" } },
...
{ "path": "pages/work/warehouse/materialin/materialin", "style": { "navigationBarTitleText": "%pages.warehouse.materialin%" } }
```
> 逐条将全部 69 个页面按 Task 2 映射改完（含 `pages.work.work` 无需改、登录/主页/消息/我的保持原样）。

- [ ] **Step 3: 启用 tabBar**
将 `pages.json` 中被注释的 `tabBar` 块取消注释，并把 `text` 改为 `%%`：
```json
"tabBar": {
	"color": "#515151",
	"selectedColor": "#007aff",
	"borderStyle": "black",
	"backgroundColor": "#ffffff",
	"fontSize": "14px",
	"list": [{
			"pagePath": "pages/index/index",
			"iconPath": "static/images/index.png",
			"selectedIconPath": "static/images/index_selected.png",
			"text": "%tab.home%"
		}, {
			"pagePath": "pages/work/work",
			"iconPath": "static/images/work.png",
			"selectedIconPath": "static/images/work_selected.png",
			"text": "%tab.work%"
		},
		{
			"pagePath": "pages/message/message",
			"iconPath": "static/images/message.png",
			"selectedIconPath": "static/images/message_selected.png",
			"text": "%tab.message%"
		},
		{
			"pagePath": "pages/profile/profile",
			"iconPath": "static/images/profile.png",
			"selectedIconPath": "static/images/profile_selected.png",
			"text": "%tab.profile%"
		}
	]
}
```

- [ ] **Step 4: 验证（壳层三语）**
将 `manifest.json` 的 `locale` 依次改为 `en` / `ko` 各运行一次，确认各页面导航栏标题与底部 4 个 tab 文案随之变化，然后改回 `zh-Hans`。
- [ ] **Step 5: Commit**
```bash
git add pages.json
git commit -m "feat(i18n): pages.json 导航栏标题与 tabBar 国际化"
```

---

## Phase 1 — 全局壳页

### Task 6: login.vue 文案国际化

**Files:**
- Modify: `pages/login/login.vue`（template 第 8、19、29 行；script 第 50、68、77 行）

**Interfaces:**
- Consumes: `locale` 中 `login.*`
- Produces: 登录页三语文案

- [ ] **Step 1: 替换模板中文**
```html
<uni-easyinput 
	:placeholder="$t('login.accountPlaceholder')" 
	v-model="username" 
	:inputBorder="false"
	placeholderStyle="color: #999;"
></uni-easyinput>
...
<uni-easyinput 
	:placeholder="$t('login.passwordPlaceholder')" 
	type="password" 
	v-model="password" 
	:inputBorder="false"
	placeholderStyle="color: #999;"
></uni-easyinput>
...
<button ...>
	{{isLoading ? $t('login.submitting') : $t('login.submit')}}
</button>
```

- [ ] **Step 2: 替换 JS 中 toast 文案**
```js
if (!this.username || !this.password) {
	uni.showToast({
		title: this.$t('login.empty'),
		icon: 'none',
		duration: 2000
	})
	return;
}
...
	uni.showToast({
		title: res.msg || this.$t('login.fail'),
		duration: 3000,
		mask: true
	})
...
	uni.showToast({
		title: err || this.$t('login.netError'),
		duration: 3000,
		mask: true
	})
```

- [ ] **Step 3: 验证并提交**
运行确认登录页占位符、按钮、空校验、失败提示三语正确。
```bash
git add pages/login/login.vue
git commit -m "feat(i18n): login.vue 文案国际化"
```

### Task 7: work.vue 作业中心菜单国际化

**Files:**
- Modify: `pages/work/work.vue`（template 第 7、22、37、52、67、79 行标题；script 各 `name` 字段）

**Interfaces:**
- Consumes: `locale` 中 `work.*` 与 `pages.*`
- Produces: 作业中心各模块标题与菜单项三语

- [ ] **Step 1: 替换模块标题**
将模板中 `生产管理`/`质量管理`/`仓储管理`/`设备管理`/`andon管理` 改为对应 `$t`：
```html
<view class="title">{{ $t('work.produce') }}</view>
...
<view class="title">{{ $t('work.quality') }}</view>
...
<view class="title">{{ $t('work.warehouse') }}</view>
...
<view class="title">{{ $t('work.device') }}</view>
...
<view class="title">{{ $t('work.andon') }}</view>
```

- [ ] **Step 2: 菜单项 `name` 改用 `$t`**
`work.vue` 菜单数据里的 `name` 为字面中文，需改为 `$t()` 调用。因 `data()` 中返回的是冻结数组，改为在模板用 `item.nameKey` 取词。将每个菜单对象 `name: '工单上线'` 改为 `nameKey: 'pages.produce.worksheeton'` 等（key 取自 Task 2 的 `pages.*`，即该菜单跳转页面对应的导航标题 key），模板改为：
```html
<text>{{ $t(item.nameKey) }}</text>
```
> 例：`{ img: '...', nameKey: 'pages.produce.worksheeton', url: '/pages/work/produce/worksheeton/worksheeton' }`。对 `product`/`quality`/`warehouse`/`devices`/`andon` 全部菜单项按此规则替换（devices/andon 当前被注释，也一并改好备用）。

- [ ] **Step 3: 验证并提交**
运行确认作业中心模块标题与所有菜单项三语正确。
```bash
git add pages/work/work.vue
git commit -m "feat(i18n): work.vue 作业中心菜单国际化"
```

### Task 8: index.vue 国际化

**Files:**
- Modify: `pages/index/index.vue`（template 第 7、12、15、23、28 行；script 第 48 行）

**Interfaces:**
- Consumes: `locale` 中 `index.*`

- [ ] **Step 1: 替换模板与 JS 中文**
```html
<view class="title">{{ $t('index.unreadMsg') }}</view>
...
未读消息{{item}}  →  {{ $t('index.unreadMsg') }}{{item}}
...
<view class="more">{{ $t('index.more') }}</view>
...
<view class="title">{{ $t('index.todo') }}</view>
...
待办任务{{item}}  →  {{ $t('index.todo') }}{{item}}
```
```js
uni.showToast({ title: this.$t('index.loginFirst') })
```

- [ ] **Step 2: 提交**
```bash
git add pages/index/index.vue
git commit -m "feat(i18n): index.vue 国际化"
```

### Task 9: message.vue / profile.vue 国际化

**Files:**
- Modify: `pages/message/message.vue`（第 3 行）、`pages/profile/profile.vue`（第 3 行）

**Interfaces:**
- Consumes: `locale` 中 `message.title` / `profile.title`

- [ ] **Step 1: 替换**
`message.vue`：`<view>{{ $t('message.title') }}</view>`
`profile.vue`：`<view>{{ $t('profile.title') }}</view>`

- [ ] **Step 2: 提交**
```bash
git add pages/message/message.vue pages/profile/profile.vue
git commit -m "feat(i18n): message/profile 页国际化"
```

---

## Phase 2 — 代表页模板（固化抽取/命名规范）

### Task 10: worksheeton.vue 全量国际化（模板）

**Files:**
- Modify: `pages/work/produce/worksheeton/worksheeton.vue`（template 第 7、13、21、30、32、38、46、54、62、73、84、93、104、113、124、150 行等）

**Interfaces:**
- Consumes: `locale` 中 `common.*`、`ws.*`
- Produces: 可复用的页面内 `$t()` 替换范式，供后续 72 页参照

- [ ] **Step 1: 替换模板可见中文**
```html
<text class="common-right" @click="onWrokStationScan">{{ $t('common.scan') }}</text>
...
<text class="content-label">{{ $t('ws.process') }}</text>
...
<text class="content-label">{{ $t('ws.equipment') }}</text>
...
<text class="common-right" @click="onWorksheetScan">{{ $t('common.scanOrSelect') }}</text>
...
<text class="content-label">{{ $t('ws.productCode') }}</text>
...
<text class="content-label">{{ $t('ws.productName') }}</text>
...
<text class="content-label">{{ $t('ws.planQty') }}</text>
...
<text class="content-label">{{ $t('ws.onlineQty') }}</text>
...
<text class="common-text">{{ $t('ws.userCheck') }}</text>
<text class="common-right" @click="onToWorker">{{ $t('common.check') }}</text>
...
{{ userValidate ? $t('common.pass') : $t('common.fail') }}
...
<text class="common-text">{{ $t('ws.equipCheck') }}</text>
<text class="common-right" @click="onDeviceCheck">{{ $t('common.check') }}</text>
...
<text class="common-text">{{ $t('ws.materialCheck') }}</text>
<text class="common-right" @click="onMaterialCheck">{{ $t('common.check') }}</text>
...
<text class="common-text">{{ $t('ws.paramCheck') }}</text>
...
<text class="content-label">{{ $t('ws.checkResult') }}</text>
...
<button type="primary" size="mini" @click="onWorksheetOn">{{ $t('common.confirmIn') }}</button>
```
> 注意：`工序：`/`:` 等带冒号标签整段替换为 `$t('ws.process')`（词条本身含「：」）。`合格`/`不合格` 在 `v-if/v-else` 两处均替换。

- [ ] **Step 2: 替换 JS 中 toast**
`worksheeton.vue` script 第 251 行 `uni.showToast({ title: "上线成功" })` →
```js
uni.showToast({ title: this.$t('common.onlineSuccess') })
```

- [ ] **Step 3: 验证并提交**
运行「工单进站」页，切换 `manifest.json` 的 `locale` 为 `en`/`ko` 确认整页文案三语正确，改回 `zh-Hans`。
```bash
git add pages/work/produce/worksheeton/worksheeton.vue
git commit -m "feat(i18n): worksheeton.vue 代表页全量国际化(模板)"
```

---

## Phase 3+ — 业务模块逐批

> 以下每个模块任务：对列出的每个 `.vue` 页面，执行「抽取中文 → 在 `locale/zh-Hans.json` 等三文件追加 `<模块>.<页>.<语义>` key（zh-Hans=当前中文，en/ko=翻译）→ 模板/JS 替换为 `$t()`」。**每个页面单独 commit**。翻译规则：en/ko 由执行者在已建立的 `pages.*`/`ws.*`/`common.*` 风格上生成初版（译员后续校对）。不重构业务逻辑，保留 `.then()`/`async` 原样。

### Task 11: produce 模块（其余生产页）

**Files:**
- Modify: `pages/work/produce/worker/worker.vue`、`worksheetoff/worksheetoff.vue`、`baogong/baogong.vue`、`touliao/touliao.vue`、`attendance/attendance.vue`、`mujukuaihuan/mujukuaihuan.vue`、`blpjilu/blpjilu.vue`、`blpkuaixiu/blpkuaixiu.vue`、`fpkuailu/fpkuailu.vue`、`shangliao/shangliao.vue`、`worksheetout/worksheetout.vue`、`workeroff/workeroff.vue`、`xialiao/xialiao.vue`、`zhuanyi/zhuanyi.vue`、`devicecheck/devicecheck.vue`

**Interfaces:**
- Consumes: `locale` 文件
- Produces: produce 模块三语文案

- [ ] **Step 1: 逐页抽取并替换**
对每个页面：① 列出模板内所有字面中文（标签、按钮、placeholder、toast）；② 在 `locale/*.json` 追加 `produce.<页>.<key>`；③ 替换为 `$t()`。
示例（`worker.vue` 若有「人员上工」标题类文案）：key `produce.worker.title` 已在 `pages.produce.worker` 存在可复用；页内专属文案新增强如 `produce.worker.clockIn`="上工"。
- [ ] **Step 2: 每页 commit**
```bash
git add pages/work/produce/worker/worker.vue locale/
git commit -m "feat(i18n): produce/worker 页国际化"
```
（其余页面同理，逐个提交）
- [ ] **Step 3: 模块验证**
切换 `locale` 运行 produce 各页，确认无残留中文硬编码。

### Task 12: warehouse 模块（28 页 + 子组件）

**Files:**
- Modify: `pages/work/warehouse/` 下全部 28 个主页面 `.vue`，以及 `goodsUnshelving/components/NormalUnshelving.vue`、`goodsUnshelving/components/SmartUnshelving.vue`、`operationPage/operationPage - 副本.vue`（重复文件，确认是否删除）

**Interfaces:**
- Consumes: `locale` 文件
- Produces: warehouse 模块三语文案

- [ ] **Step 1: 逐页抽取并替换**
同 Task 11 模式，key 前缀 `warehouse.<页>.<语义>`。复用 Task 2 已有 `pages.warehouse.*` 作为导航类文案；页内按钮/标签/提示新增加具体 key（如 `warehouse.materialin.scan`="扫描入库单"）。
- [ ] **Step 2: 每页 commit**（逐个提交，子组件随所属主页面一并提交）
- [ ] **Step 3: 模块验证**
切换 `locale` 运行 warehouse 各页，确认无残留中文。

### Task 13: quality / device / andon 模块

**Files:**
- Modify: `pages/work/quality/*`（4 页）、`pages/work/device/*`（5 页，含 `devicerepair/equipmentMaintenance.vue`）、`pages/work/andon/*`（4 页）

**Interfaces:**
- Consumes: `locale` 文件
- Produces: 三个模块三语文案

- [ ] **Step 1: 逐页抽取并替换**
key 前缀 `quality./device./andon.<页>.<语义>`，复用 Task 2 `pages.*` 导航 key。
- [ ] **Step 2: 每页 commit**
- [ ] **Step 3: 模块验证**
切换 `locale` 运行各页，确认无残留中文。

---

## Phase 末 — 收尾

### Task 14: 全局遗漏扫描与三语对齐

**Files:**
- 全局扫描 + `locale/*.json`

**Interfaces:**
- Consumes: 全部已完成页面
- Produces: 无遗漏的国际化工程

- [ ] **Step 1: 搜索残留中文硬编码**
在 `pages/`、`components/` 中搜索未包裹 `$t()` 的中文字面量（重点：`uni.showToast({ title: "..." })`、`placeholder="..."`、`<button>中文</button>`、`:title="..."`）。
- [ ] **Step 2: 补齐遗漏**
对每一处补 key 并替换，三语言文件同步追加。
- [ ] **Step 3: 一致性检查**
确认 `zh-Hans/en/ko` 三文件 key 完全一致（无某语言缺 key；缺则回退 `fallbackLocale: 'zh-Hans'`）。
- [ ] **Step 4: 提交**
```bash
git add -A
git commit -m "chore(i18n): 收尾—遗漏扫描与三语对齐"
```

### Task 15: 真机三语截图验证

- [ ] **Step 1: 分别打包/运行**
将 `manifest.json` 的 `locale` 依次设为 `zh-Hans`/`en`/`ko`，各运行一次覆盖关键路径：登录 → 作业中心 → 工单进站（代表页）→ 物料入库（warehouse 代表）→ 设备点检。
- [ ] **Step 2: 截图留档**
每语言对关键页截图，确认导航栏、tabBar、页面内文案、toast 均随语言变化且排版无溢出。
- [ ] **Step 3: 输出 key 命名规范文档**
在 `docs/superpowers/specs/` 追加 `i18n-keys.md`，记录命名空间约定与新增 key 流程。
- [ ] **Step 4: 提交**
```bash
git add -A
git commit -m "docs(i18n): 补充 key 命名规范与验证截图说明"
```

---

## 自查（Self-Review）

- **Spec 覆盖**：目标语言✓、manifest 固定✓、vue-i18n 依赖✓、两套系统✓、分阶段✓、仅 App✓、后端数据 v1 不处理✓。
- **Placeholder 扫描**：无 TBD/TODO；业务页翻译说明已明确「执行者按风格生成初版」，非占位。
- **类型/命名一致**：`pages.<模块>.<页>` key 在 Task 2（locale）、Task 5（pages.json）、Task 7（work 菜单）三处一致；`ws.*`/`common.*` 在 Task 2 与 Task 10 一致。
- **已知重复/待决**：`operationPage/operationPage - 副本.vue` 为重复文件，Task 12 中提示确认是否删除；`devices`/`andon` 菜单在 `work.vue` 当前被注释，已一并 `$t()` 化备用。
