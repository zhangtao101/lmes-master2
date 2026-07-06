import request from '/api/request.js';
 const prefixUrl = '/mes-wms/';
//const prefixUrl = '/mes-wms-test/';


export default {
	// 扫码货架号或者储位码获取信息
	getDetailByCode: (code) => {
		return request({
			url: `${prefixUrl}api/app/enout/getDetailByCode`,
			method: "GET",
			data: { code }
		});
	},

	// 调拨扫码货架储位号
	getDetailByHjStorageCode: (HjStorageCode) => {
		return request({
			url: `${prefixUrl}api/app/enout/getDetailByHjStorageCode`,
			method: "GET",
			data: { HjStorageCode }
		});
	},

	// 调拨扫标签码
	getEnterDetailByLabelCode: (labelCode) => {
		return request({
			url: `${prefixUrl}api/app/enout/getDetailByLabelCode`,
			method: "GET",
			data: { labelCode }
		});
	},

	// 呼叫AGV-调拨
	submitDBContainer: (containerCode, storageCode) => {
		return request({
			url: `${prefixUrl}api/app/enout/submitDBContainer`,
			method: "POST",
			data: { containerCode, storageCode }
		});
	},

	// 回撤AGV-调拨
	returnDBContainer: (containerCode, storageCode) => {
		return request({
			url: `${prefixUrl}api/app/enout/returnDBContainer`,
			method: "POST",
			data: { containerCode, storageCode }
		});
	},

	// 取出放入拣货确认操作
	labelEnout: (containerCode, storageCode, opType, labelCodes) => {
		return request({
			url: `${prefixUrl}api/app/enout/labelEnout`,
			method: "POST",
			data: { containerCode, storageCode, opType, labelCodes }
		});
	}
}