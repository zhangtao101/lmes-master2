import request from '/api/request.js';

const prefixUrl = '/mes-equip/';
// const prefixUrl = '/mes-equip-test/';

export default {
	// ==================== 任务清单 ====================

	// APP 点检任务清单（设备/模具）
	getInspectionTaskList: (params) => {
		return request({
			url: `${prefixUrl}equip/plan/app/inspection/task-list`,
			method: 'GET',
			data: params
		});
	},

	// APP 保养任务清单（设备/模具）
	getMaintenanceTaskList: (params) => {
		return request({
			url: `${prefixUrl}equip/plan/app/maintenance/task-list`,
			method: 'GET',
			data: params
		});
	},

	// ==================== 点检 ====================

	// APP 提交点检结果
	submitInspection: (data) => {
		return request({
			url: `${prefixUrl}equip/plan/app/inspection/submit`,
			method: 'POST',
			data: data
		});
	},

	// APP 点检任务详情（待执行/已完成）
	getInspectionDetail: (params) => {
		return request({
			url: `${prefixUrl}equip/plan/app/inspection/detail`,
			method: 'GET',
			data: params
		});
	},

	// ==================== 保养 ====================

	// APP 提交保养结果
	submitMaintenance: (data) => {
		return request({
			url: `${prefixUrl}equip/plan/app/maintenance/submit`,
			method: 'POST',
			data: data
		});
	},

	// APP 保养任务详情（待执行/已完成）
	getMaintenanceDetail: (params) => {
		return request({
			url: `${prefixUrl}equip/plan/app/maintenance/detail`,
			method: 'GET',
			data: params
		});
	}
};
