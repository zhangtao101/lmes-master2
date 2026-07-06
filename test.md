#1 物料出库 outForm
1. 402 当前用户当前用户无权进行此项操作！！

#2 物料退货 returnMaterial
1. 403 数量必须小于0

#3 物料退库 returnBackHouse
1. 403 数量必须小于0

#4 物料调拨 transfer
1. 500 服务器错误
2. 参数：
```javascript
labelCode: "20210721WL9200"
logicalWareHouseCode: "41-0"
number: 10
wareLocationCode: "KQ001-2"
```

#5 成品入库 inbound
1. 500 条码编号为 BZ202405270001的条码不是合格的条码，不能入库
2. 参数
```javascript
createTime: "2024-05-31T09:22:22.924Z"
createUser: 1
labelCode: "BZ202405270001"
locationCode: "KQ045-1"
locationId: 2
logicHouseCode: "18-1"
number: "50"
productCode: "176037"
productName: "PCBA_B633PM13_53.02.015601_阿尔法_PBF"
sortNo: ""
transferFormCode: ""
```

#6 成品退货 returnProduct
1. 403 数量必须小于0
2. 参数
```js
createTime: "2024-05-31T10:48:03.194Z"
createUser: 1
labelCode: "BZ202405270001"
number: 10
productCode: "176037"
productName: "PCBA_B633PM13_53.02.015601_阿尔法_PBF"
returnBackType: 1
sortNo: 0
```
#6 成品退库 returnBackHouse
1. 403 数量必须小于0
2. 参数
3. 
```js
formCode: ""
inoutDate: "2024-05-31T10:54:52.756Z"
returnBackHouseRecords: [
	createTime: "2024-05-31T10:55:36.026Z"
	createUser: 1
	labelCode: "BZ202405270001"
	locationCode: "KQ045-1"
	logicHouseCode: "18-1"
	number: 1
	productCode: "176037"
	productName: "PCBA_B633PM13_53.02.015601_阿尔法_PBF"
	returnBackType: 1
	shipCode: ""
	sortNo: 0
],
createTime: "2024-05-31T10:54:52.756Z"
createUser: 1
labelCode: "BZ202405270001"
locationCode: "KQ045-1"
logicHouseCode: "18-1"
number: 10
productCode: "176037"
productName: "PCBA_B633PM13_53.02.015601_阿尔法_PBF"
returnBackType: 1
shipCode: ""
sortNo: 0
shipCodes: []
```

#7 成品调拨 transfer/save
1. 返回的库位信息中 逻辑仓库信息为null
2. 请求参数没有 **调拨数量** 相关字段
3. save.param[0].logicalInHouseCode: 调拨后所属仓库不能为空
```js
inLocationCode: "KQ046-1"
labelCode: "BZ202405270001"
logicalInHouseCode: "" //逻辑仓库信息为空
```