import request from '/api/request.js';

// TODO: 网关前缀需按三养后端实际部署的服务名确认
const prefixUrl = '/mes-main/';

export default {
	// ==================== 工单（作业指示）查询 ====================

	// 分页查询作业指示/工单列表（可传入日期、线别、品号等条件）
	selectByBom: (params) => {
		return request({
			url: `${prefixUrl}workSheet/lot/selectByBom`,
			method: 'GET',
			data: params
		});
	},

	// ==================== 设备（台账）查询 ====================

	// 分页查询设备台账列表：pageNum/pageSize 拼接到 URL，设备编号/设备名称/设备组代码为过滤条件
	getEquipmentList: (params) => {
		return request({
			url: `${prefixUrl}equipment/equipmentLedger/getEquipmentLedgerDTOByParams?pageNum=${params.pageNum || 1}&pageSize=${params.pageSize || 20}`,
			method: 'POST',
			data: {
				equipmentCode: params.equipmentCode || '',
				equipmentName: params.equipmentNameCode || '',
				equipGroupCode: params.equipGroupCode || '',
				equipmentType: params.equipmentType || 1,
			}
		});
	}
};
