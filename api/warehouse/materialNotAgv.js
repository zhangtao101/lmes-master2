import request from '/api/request.js';

const prefixUrl = '/mes-wms/';
// const prefixUrl = '/mes-wms-test/';

export default {
	// 根据单号获取明细（入库单/出库单）
	listFormDetail: (params) => {
		return request({
			url: `${prefixUrl}api/app/enout/listFormDetail`,
			method: 'GET',
			data: params
		});
	},

	// 根据料号获取库存明细
	listDetailByMaterialCode: (params) => {
		return request({
			url: `${prefixUrl}api/app/enout/listDetailByMaterialCode`,
			method: 'GET',
			data: params
		});
	},

	// 根据储位号/库位号获取当前单据执行明细
	getDetailByStorageCode: (params) => {
		return request({
			url: `${prefixUrl}api/app/enout/getDetailByStorageCode`,
			method: 'GET',
			data: params
		});
	},

	// 入库拣货标签扫码
	getEnterDetailByParam: (params) => {
		return request({
			url: `${prefixUrl}api/app/enout/getEnterDetailByParam`,
			method: 'GET',
			data: params
		});
	},

	// 出库拣货标签扫码
	getOutDetailByParam: (params) => {
		return request({
			url: `${prefixUrl}api/app/enout/getOutDetailByParam`,
			method: 'GET',
			data: params
		});
	},

	// 标签上下架（opType: 1放入 -1取出）
	labelEnoutInWarehouse: (data) => {
		return request({
			url: `${prefixUrl}api/app/enout/labelEnoutInWarehouse`,
			method: 'POST',
			data: data
		});
	}
};
