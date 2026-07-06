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
	// 上架校验
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
	getOutLabel: (formCode, labelCode, materialCode, storageCode, opZnFlag) => {
		console.log({
				formCode,
				labelCode,
				materialCode,
				storageCode,
				opZnFlag
			})
		return request({
			url: `${prefixUrl}wms/linehouse/enout/getOutLabel`,
			method: "POST",
			data: {
				formCode,
				labelCode,
				materialCode,
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
	}
}
