---
name: lmes-uniapp-development
description: LMES 仓库管理系统 uni-app 开发规范。当开发仓库管理相关页面（物料入库/出库/调拨/退货、成品入库/出库/调拨/退货、拣货作业等）时使用此技能。涉及扫码功能、API 调用规范、页面模板、组件使用等。
---

# LMES 仓库管理系统开发规范

## 1. 项目概述

**项目类型**: uni-app 移动端应用
**技术栈**: Vue 2 + JavaScript + Less
**主要功能**: 仓库物料/成品管理（入库、出库、调拨、退库、退货、拣货作业）

## 2. 目录结构规范

```
项目根目录/
├── api/                      # API 服务层
│   ├── request.js           # 请求封装（基于 uni.request）
│   ├── home.js              # 首页接口
│   ├── produce/             # 生产相关接口
│   └── warehouse/           # 仓库相关接口
│       ├── material.js      # 物料接口
│       ├── product.js       # 成品接口
│       └── ctuCartonPicking.js
├── common/                   # 公共工具
│   ├── enum.js              # 枚举常量定义
│   ├── util.js              # 工具函数
│   ├── scan.js              # 扫码功能封装
│   ├── beautyToast.js       # 美化提示组件
│   ├── toast.js             # 基础提示
│   └── printerTool.js       # 打印工具
├── components/              # 公共组件
├── pages/                   # 页面
│   ├── work/               # 作业模块
│   │   └── warehouse/      # 仓库页面
│   │       ├── materialin/ # 物料入库
│   │       ├── materialout/
│   │       ├── materildb/   # 物料调拨
│   │       ├── materialback/
│   │       ├── materialreturn/
│   │       ├── cpin/        # 成品入库
│   │       ├── cpout/
│   │       ├── cpdb/        # 成品调拨
│   │       ├── cpback/
│   │       ├── cpreturn/
│   │       ├── inboundPicking/  # 入库拣货
│   │       ├── outboundPicking/  # 出库拣货
│   │       └── operationPage/    # 作业操作页
│   ├── login/
│   ├── index/
│   └── scan/
└── static/
    └── styles/
        ├── warehouse.less   # 仓库页面公共样式
        └── warehouse-common.less
```

## 3. API 服务规范

### 3.1 请求封装 (request.js)

- 基于 `uni.request` 封装 Promise 请求
- 自动携带 `Authorization` Token（从 storage 获取）
- 401 响应自动跳转登录页
- 基础路径: `http://192.168.0.60:8050/`

```javascript
import request from '/api/request.js';

// GET 请求
request({
    url: 'mes-wms/api/app/enout/listFormDetail',
    method: 'GET',
    data: params
});

// POST 请求
request({
    url: `${prefixUrl}enterForm`,
    method: 'POST',
    data: labelList
});
```

### 3.2 API 文件命名与结构

- 文件名使用小写 + 功能命名: `material.js`, `product.js`
- 使用 `prefixUrl` 定义接口前缀
- 统一使用 ES6 箭头函数 + 对象简写

```javascript
// api/warehouse/material.js
import request from '/api/request.js';
const prefixUrl = 'mes-main/wms/warehouseForm/material/'

export default {
    getWarehoueInfo: (wareLocationCode) => {
        return request({
            url: `${prefixUrl}wareLocation`,
            method: "GET",
            data: { wareLocationCode }
        });
    },
    // 更多接口...
};
```

### 3.3 接口响应处理规范

**必须验证接口返回状态**:

```javascript
const resp = await material.getWarehoueInfo(code);
if (resp.code == 200) {
    this.warehouse = resp.data;
    // 继续处理
} else {
    uni.showToast({
        title: resp.msg,
        icon: 'none'
    })
}
```

**禁止直接使用接口返回数据而不验证**:

```javascript
// ❌ 错误
this.warehouse = resp.data;

// ✅ 正确
if (resp.code == 200) {
    this.warehouse = resp.data;
}
```

## 4. 页面开发规范

### 4.1 仓库页面模板结构

```vue
<template>
    <view class="ware-house-container">
        <view class="box-header">
            <view class="icon"></view>
            <text class="title">页面标题</text>
        </view>
        <view class="box-body">
            <!-- 库位信息区 -->
            <view class="warehouse-info">
                <view class="header">
                    <view class="left">
                        <uni-icons type="home" color="#fff" size="18"></uni-icons>
                        <text>库位：{{wareLocationCode}}</text>
                    </view>
                </view>
                <!-- 扫码输入框 -->
                <view class="scan-input-row">
                    <input class="scan-input" v-model="locationInput" 
                           placeholder="请输入或扫描库位" @confirm="onLocationInputConfirm" />
                    <view class="scan-btn" @click="onLocationScan">
                        <uni-icons type="scan" color="#fff" size="16"></uni-icons>
                    </view>
                </view>
                <!-- 仓库信息展示 -->
                <view class="body">
                    <view class="left">
                        <text>所属仓库</text>
                        <text>{{warehouse.wareLocationName}}</text>
                    </view>
                    <view class="right">
                        <text>所属库区</text>
                        <text>{{warehouse.wareAreaName}}</text>
                    </view>
                </view>
            </view>
            <!-- 详情列表区 -->
            <view class="warehouse-detail">
                <!-- 标签列表 -->
            </view>
        </view>
        <view class="operator-button">
            <button type="primary" size="mini" @click="onSubmit">确认提交</button>
        </view>
    </view>
</template>
```

### 4.2 扫码功能实现

**扫码按钮方法**:

```javascript
// 扫码
onLocationScan: function() {
    const _this = this;
    scanCode().then((code) => {
        _this.locationInput = code;  // 可选：回显扫码内容
        _this.loadWarehouseInfo(code);
    }).catch(err => {
        uni.showToast({
            title: err,
            icon: 'none'
        })
    });
},

// 输入框回车确认
onLocationInputConfirm: function() {
    const code = this.locationInput.trim();
    this.locationInput = ''; // 回车后清空输入框
    if (code) {
        this.loadWarehouseInfo(code);
    }
},
```

### 4.3 输入框独立变量规范

**输入框必须使用独立 ref 变量**，与业务变量分开：

```javascript
data() {
    return {
        wareLocationCode: '',    // 业务变量：实际库位码
        warehouse: {},           // 业务变量：仓库详情
        locationInput: '',       // 输入框变量：用户输入
        labelInput: '',          // 输入框变量：标签输入
        labelList: [],          // 业务变量：标签列表
    }
}
```

### 4.4 扫码键盘监听（onLoad 中）

```javascript
onLoad() {
    const _this = this;
    plus.key.addEventListener("keydown", function(e) {
        if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
            uni.$off('scan')
            uni.$on('scan', function(code) {
                const codeType = getCodeType(code);
                if (codeType == CodeType.KQ) {
                    _this.loadWarehouseInfo(code);
                } else if (codeType == CodeType.WL_Label) {
                    _this.loadLabelInfo(code);
                } else {
                    uni.showToast({
                        title: "标签无效！",
                        icon: 'none'
                    });
                }
            })
        }
    })
},
destroyed: function() {
    plus.key.removeEventListener('keydown');
},
```

### 4.5 样式引用规范

```vue
<style lang="less" scoped>
    @import "@/static/styles/warehouse.less";
    @import "@/static/styles/warehouse-common.less";
    
    /* 页面特有样式 */
    .scan-input-row {
        display: flex;
        align-items: center;
        padding: 20rpx 30rpx;
        gap: 16rpx;
        background: rgba(255, 255, 255, 0.1);

        .scan-input {
            flex: 1;
            height: 72rpx;
            padding: 0 24rpx;
            background: #fff;
            border-radius: 12rpx;
            font-size: 28rpx;
            border: 2rpx solid #e8eaf0;
        }

        .scan-btn {
            width: 72rpx;
            height: 72rpx;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12rpx;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
</style>
```

## 5. 枚举常量 (enum.js)

### 5.1 操作类型 (OperateType)

```javascript
export const OperateType = {
    materialOut: -1,      // 物料出库
    materialDiaobo: 0,    // 物料调拨
    materialIn: 1,        // 物料入库
    materialBack: 2,      // 物料退库
    materialReturn: 3     // 物料退货
}
```

### 5.2 码类型 (CodeType)

```javascript
export const CodeType = {
    KQ: "KQ",           // 库区码（KQ开头，包含'-'）
    WL_Label: "WL",     // 物料标签（包含'WL'）
    CP_Label: "CP",     // 成品标签（BZ开头）
    Other: 'OT'         // 其他
}
```

## 6. 工具函数 (util.js)

### 6.1 获取逻辑仓库信息

```javascript
import { retriveLogicalWarehouse } from '/common/util.js';

let { logicalCode, logicalName } = retriveLogicalWarehouse(warehouse.remark);
```

### 6.2 获取码类型

```javascript
import { getCodeType } from '/common/util.js';

const codeType = getCodeType(code); // 返回 CodeType 枚举值
```

### 6.3 日期格式化

```javascript
import { formatDate } from '/common/util.js';

formatDate(new Date());           // 默认格式
formatDate(date, 'yyyy-MM-dd');  // 指定格式
```

## 7. 提示规范

### 7.1 uni.showToast 使用

**必须添加 `icon: 'none'` 属性**:

```javascript
uni.showToast({
    title: '操作成功',
    icon: 'none'  // ✅ 必须
})

uni.showToast({
    title: '操作失败',
    icon: 'fail'  // ❌ 不推荐
})
```

### 7.2 showBeautyToast 使用

```javascript
import showBeautyToast from '@/common/beautyToast.js'

showBeautyToast({
    title: '入库成功',
    icon: 'success'
})

showBeautyToast({
    title: '加载失败',
    icon: 'error'
})

showBeautyToast({
    title: '请先选择',
    icon: 'warn'
})
```

## 8. 常见开发任务

### 8.1 创建仓库页面

1. 在 `pages/work/warehouse/` 下创建页面文件夹
2. 在 `api/warehouse/` 下创建对应的 API 服务文件
3. 使用仓库页面模板
4. 实现扫码/输入/提交功能
5. 引用仓库公共样式

### 8.2 新增 API 接口

```javascript
// api/warehouse/material.js
export default {
    // 在此添加新接口
    newApi: (params) => {
        return request({
            url: `mes-wms/api/app/xxx`,
            method: 'GET/POST',
            data: params
        });
    },
};
```

### 8.3 页面跳转与传参

```javascript
// 跳转到作业页
uni.navigateTo({
    url: '/pages/work/warehouse/operationPage/operationPage?formDetailId=' + this.formDetailId + '&type=1'
});

// 接收参数
onLoad(options) {
    const { formDetailId, type } = options;
}
```

## 9. 代码规范

- **变量命名**: 小写驼峰 (`wareLocationCode`)
- **组件引用**: PascalCase (`uni-icons`, `uni-easyinput`)
- **方法命名**: 小写驼峰 (`loadWarehouseInfo`, `onSubmit`)
- **样式隔离**: 必须使用 `scoped`
- **禁止使用**: `async/await`，改用 `.then()` 链式调用
