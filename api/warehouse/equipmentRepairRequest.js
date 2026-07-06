import request from '/api/request.js';

const prefixUrl = '/mes-equip/';
// const prefixUrl = '/mes-equip-test/';

export default {
	// ==================== 报修单管理 ====================

	// APP 提交报修单（设备/模具）
	submitRepairRequest: (data) => {
		return request({
			url: `${prefixUrl}equip/repair/request/submit`,
			method: 'POST',
			data: data
		});
	},

	// APP 分页查询报修单列表
	getRepairRequestList: (params) => {
		return request({
			url: `${prefixUrl}equip/repair/request/list-page`,
			method: 'GET',
			data: params
		});
	},

	// APP 查询报修单详情
	getRepairRequestDetail: (params) => {
		return request({
			url: `${prefixUrl}equip/repair/request/${params.id}`,
			method: 'GET',
			data: {}
		});
	},

	// APP 取消报修单
	cancelRepairRequest: (params) => {
		return request({
			url: `${prefixUrl}equip/repair/request/cancel`,
			method: 'POST',
			data: params
		});
	},

	// APP 设置报修单停机状态
	setRepairDowntime: (params) => {
		return request({
			url: `${prefixUrl}equip/repair/downtime/${params.id}`,
			method: 'POST',
			data: {
				isDowntime: params.isDowntime
			}
		});
	},

	// ==================== 设备查询 ====================

	// APP 按编码查询设备信息
	getEquipmentByCode: (params) => {
		return request({
			url: `${prefixUrl}app/equipment/byCode`,
			method: 'GET',
			data: params
		});
	},

	// ==================== 模具查询 ====================

	// APP 按编码查询模具信息
	getMoldByCode: (params) => {
		return request({
			url: `${prefixUrl}mold/base/byCode`,
			method: 'GET',
			data: params
		});
	},

	// ==================== 基础配置 ====================

	// APP 按类型查询基础配置列表（报修类型、紧急程度等）
	getBaseConfigList: (params) => {
		return request({
			url: `${prefixUrl}equip/base-config/list`,
			method: 'GET',
			data: params
		});
	}
};
