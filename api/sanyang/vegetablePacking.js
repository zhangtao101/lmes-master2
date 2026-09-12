import request from '/api/request.js';

// TODO: 网关前缀需按三养后端实际部署的服务名确认
const prefixUrl = 'mes-main-sy/';
// const prefixUrl = 'mes-main/';

export default {
	// 子产线查询：按工序编码（processCode）查询子产线列表
	// 返回：id、lineId、lineName、subLineCode、subLineName
	searchByProcessCode: (processCode) => {
		return request({
			url: `${prefixUrl}produce/subLine/searchByProcessCode`,
			method: 'GET',
			data: {
				processCode: processCode
			}
		});
	},
	// 大车批次绑定记录查询：按工单号（workSheetCode）查询该工单下大车已投入的记录
	// 返回数组，元素含：id、workSheetCode、lineCode（子产线编码）、lineName（子产线名称）、
	// cartCode（大车编号）、cartBindWorkSheetTime（大车投入工单时间）、productCode、productName、
	// state（1 wait 待机 / 2 proc 生产）、lotId、lotBindCartTime、cartType、quantity、unit
	getLoadingLotList: (workSheetCode) => {
		return request({
			url: `${prefixUrl}human/packing/getLoadingLotList`,
			method: 'GET',
			data: {
				workSheetCode: workSheetCode
			}
		});
	},
	// 批次 LOT 详情查询：按工单产出 LOT Id（lotId）或台车编码（cartCode）查询批次详情
	// 返回：workSheetCode 工单号、lineCode 子产线编号、lineName 子产线名称、productCode 产品编号、
	// productName 产品名称、lotId 批次Lot Id、lotCreateTime 制造时间、validDate 有效日期、
	// sapSeq SAP序列号、number 数量、equipCode 装载机、opUser 操作人、cartCode 台车编码
	queryLotDetail: (payload = {}) => {
		return request({
			url: `${prefixUrl}human/packing/queryLotDetail`,
			method: 'GET',
			data: {
				lotId: payload.lotId || '',
				cartCode: payload.cartCode || ''
			}
		});
	},
	// 根据大车编码获取大车自身信息
	// 返回：id、cartCode 大车编码、cartName 大车名称、cartType 大车类型、catTypeName 大车类型名称、
	// lotId 批次LOTid、maxLoadQuantity 最大装载量、deleteFlag 是否删除（1删除 -1未删除）、
	// loadFlag 是否装载（1装载 -1未装载）、lockFlag 锁定标记（CLEANING 清洗中/REPAIR 维修/
	// CLEAN END 清洗结束/REPAIR END 维修结束）、quantity 数量、state 状态、stateName 状态说明
	getByCartCode: (cartCode) => {
		return request({
			url: `${prefixUrl}human/packing/getByCartCode`,
			method: 'GET',
			data: {
				cartCode: cartCode || ''
			}
		});
	},
	// 大车投入
	// payload: { cartCode 大车编码, operatorCode 操作人编号, workSheetCode 工单号 }
	// 返回：data 为 null，仅需判断 code
	cartInput: (payload) => {
		return request({
			url: `${prefixUrl}human/packing/cartInput`,
			method: 'POST',
			data: payload
		});
	},
	// 大车投入移除
	// payload: { cartCode 大车编码, workSheetCode 工单号 }
	// 返回：data 为 null，仅需判断 code
	cartInputCancel: (payload) => {
		return request({
			url: `${prefixUrl}human/packing/cartInputCancel`,
			method: 'POST',
			data: payload
		});
	},
	// 大车卸货
	// payload: { cartCode 大车编号 }
	// 返回：data 为 null，仅需判断 code
	cartUnloading: (payload) => {
		return request({
			url: `${prefixUrl}human/packing/cartUnloading`,
			method: 'POST',
			data: payload
		});
	},
	// 台车 LOT 变更
	// payload: { cartCode 变更台车编号, lotId 批次lotID }
	// 返回：data 为 null，仅需判断 code
	cartLotChange: (payload) => {
		return request({
			url: `${prefixUrl}human/packing/cartLotChange`,
			method: 'POST',
			data: payload
		});
	},

	// 条件查询工单列表（三养）
	// lineId：子产线ID；planDateStart / planDateEnd：指示日期区间；workSheetCode：工单号
	// status：指示状态 1 进行中 / 2 已完成；isAsc：1 正序 / -1 倒序
	searchWorksheet: (params = {}) => {
		return request({
			url: `${prefixUrl}plan/worksheet/search`,
			method: 'GET',
			data: {
				lineId: params.lineId || '',
				planDateStart: params.planDateStart || '',
				planDateEnd: params.planDateEnd || '',
				workSheetCode: params.workSheetCode || '',
				status: params.status || '',
				isAsc: params.isAsc || 1,
				pageNum: params.pageNum || 1,
				pageSize: params.pageSize || 10
			}
		});
	},
};
