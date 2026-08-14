import request from '/api/request.js';

const prefixUrl = 'mes-equip/';
// const prefixUrl = 'mes-equip-test/';

export default {
	// ==================== 工单查询 ====================

	// APP 按作业指示日期查询工单（线别、品号为可选条件）
	getWorkOrders: (params) => {
		return request({
			url: `${prefixUrl}pda/query/work-orders`,
			method: 'GET',
			data: params
		});
	},

	// ==================== 物料LOT查询 ====================

	// APP 按物料LOT编号/标签码精确查询
	getMaterialLot: (params) => {
		return request({
			url: `${prefixUrl}pda/query/material-lot`,
			method: 'GET',
			data: params
		});
	}
};
