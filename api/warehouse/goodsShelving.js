import request from '/api/request.js';
const prefixUrl = '/mes-wms/'

export default {
	// 根据单号获取列表清单
	getByFormCode: (formCode) => {
		return request({
			url: `${prefixUrl}wms/linehouse/enout/getByformCode`,
			method: "GET",
			data: {
				formCode
			}
		});
	},
	// 上/下架校验
	checkLabelCode: (formCode, labelCode, storageCode) => {
		return request({
			url: `${prefixUrl}wms/linehouse/enout/checkLabelCode`,
			method: "GET",
			data: {
				formCode,
				labelCode,
				storageCode
			}
		});
	},
	// 确认上架
	insert: (formCode, labelCodes, materialCode, storageCode, opZnFlag) => {
		return request({
			url: `${prefixUrl}wms/linehouse/enout/insert`,
			method: "POST",
			data: {
				formCode,
				labelCodes,
				materialCode,
				storageCode,
				opZnFlag
			}
		});
	},
	// 货架取货（下架）
	getOutLabel: (formCode, labelCodes, storageCode, opZnFlag) => {
		return request({
			url: `${prefixUrl}wms/linehouse/enout/getOutLabel`,
			method: "POST",
			data: {
				formCode,
				labelCodes,
				storageCode,
				opZnFlag
			}
		});
	},
	// 智能货架取货亮灯
	getOutLight: (formCode, storageCode) => {
		return request({
			url: `${prefixUrl}wms/linehouse/enout/getOutLight`,
			method: "GET",
			data: {
				formCode,
				storageCode
			}
		});
	},
	// 智能货架上架亮灯
	getInLight: (formCode, storageCode) => {
		return request({
			url: `${prefixUrl}wms/linehouse/enout/getInLight`,
			method: "GET",
			data: {
				formCode,
				storageCode
			}
		});
	},
	// 手动关闭电子料架事务连接（storageCode：料架编号）
	closeLink: (storageCode) => {
		return request({
			url: `${prefixUrl}wms/linehouse/enout/closeLink`,
			method: "GET",
			data: {
				storageCode
			}
		});
	},
	// 获取上下架待执行任务清单（opType：上架传 1，下架传 -1；formCode：单据号筛选条件，可为空）
	listToDoTask: (opType, formCode) => {
		return request({
			url: `${prefixUrl}wms/linehouse/enout/listToDoTask`,
			method: "GET",
			data: {
				opType,
				formCode
			}
		});
	}
}
