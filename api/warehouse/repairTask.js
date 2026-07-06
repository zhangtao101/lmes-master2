import request from '/api/request.js';

const prefixUrl = '/mes-equip/';
// const prefixUrl = '/mes-equip-test/';

export default {
	// ==================== 报修单管理 ====================

	// APP 提交报修单（设备/模具）
	submitRepairRequest: (data) => {
		return request({
			url: `${prefixUrl}app/repair/submit`,
			method: 'POST',
			data: data
		});
	},

	// ==================== 维修任务管理 ====================

	// APP 查询我的维修任务列表
	getMyRepairTasks: (params) => {
		return request({
			url: `${prefixUrl}app/repair/task-list`,
			method: 'GET',
			data: params
		});
	},

	// APP 查询维修任务详情
	getRepairTaskDetail: (params) => {
		return request({
			url: `${prefixUrl}app/repair/detail`,
			method: 'GET',
			data: params
		});
	},

	// APP 维修提交（维修处理页确认提交）
	submitRepairReport: (data) => {
		return request({
			url: `${prefixUrl}app/repair/repair-submit`,
			method: 'POST',
			data: data
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
	}
};
