import request from '/api/request.js';

// TODO: 网关前缀需按三养后端实际部署的服务名确认
const prefixUrl = 'mes-main/';

export default {
	// 根据工单ID查询该工单下所有批次（lot）信息
	selectByWorkSheetId: (workSheetId) => {
		return request({
			url: `${prefixUrl}workSheet/lot/selectByWorkSheetId/${workSheetId}`,
			method: 'GET'
		});
	},
	// 扫描托盘展示信息（返回 packType：1纸袋 2小包）
	selectMaterial: (palletLabel) => {
		return request({
			url: `${prefixUrl}weight/label/selectMaterial/${palletLabel}`,
			method: 'GET'
		});
	},
	// 物料查询：按物料lot编号（labelCode）查询物料详情
	// 返回：id、labelCode、materialCode、materialName、manufacturerName、
	//      number、operateDate、validDate、produceDate、warehouseName
	searchLotMaterial: (labelCode) => {
		return request({
			url: `${prefixUrl}wms/warehouseRecord/searchLotMaterial`,
			method: 'GET',
			data: {
				labelCode: labelCode
			}
		});
	},
	// 仓库查询（分页）：按品号/仓库筛选物料
	// payload: { pageNum, pageSize, materialCode, warehouseName }
	selectAllMaterial: (payload) => {
		return request({
			url: `${prefixUrl}wms/materialRecord/selectAllMaterial`,
			method: 'GET',
			data: payload
		});
	},
	// 托盘装载/卸载（input：1装载 2卸载）
	loading: (payload) => {
		return request({
			url: `${prefixUrl}weight/label/loading`,
			method: 'PUT',
			data: payload
		});
	},
	// 工单开始/结束（state：2开始 3结束）
	updateStae: (payload) => {
		return request({
			url: `${prefixUrl}workSheet/lot/updateStae`,
			method: 'PUT',
			data: payload
		});
	},
	// 补录：按批次数为工单生成批次（id：工单id、batch：批次数、equipCode：设备编号）
	add: (payload) => {
		return request({
			url: `${prefixUrl}workSheet/lot/add`,
			method: 'POST',
			data: payload
		});
	}
};
