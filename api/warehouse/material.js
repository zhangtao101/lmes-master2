import request from '/api/request.js';
 const prefixUrl = '/mes-main/'
 const prefixUrl2 = '/mes-wms/'
//const prefixUrl = 'mes-main-test/'
//const prefixUrl2 = 'mes-wms-test/'

export default {
	getWarehoueInfo: (wareLocationCode) => {
		return request({
			url: `${prefixUrl}wms/warehouseForm/material/wareLocation`,
			method: "GET",
			data: {
				wareLocationCode
			}
		});
	},
	getLabelInfo: (labelCode, operate, formCode) => {
		return request({
			url: `${prefixUrl}wms/warehouseForm/material/labelCodeInfo`,
			method: "GET",
			data: {
				labelCode,
				operate,
				formCode
			}
		});
	},
	materialIn: (labelList) => {
		return request({
			url: `${prefixUrl}wms/warehouseForm/material/enterForm`,
			method: "POST",
			data: labelList
		});
	},
	storeRequisitionInfo: (formCode) => {
		return request({
			url: `${prefixUrl}wms/warehouseForm/material/storeRequisitionInfo`,
			method: "GET",
			data: {
				formCode
			}
		});
	},
	outForm: (formCode, labelList) => {
		return request({
			url: `${prefixUrl}wms/warehouseForm/material/outForm`,
			method: "POST",
			data: {
				formCode,
				labelList
			}
		});
	},
	returnMaterial: (labelList) => {
		return request({
			url: `${prefixUrl}wms/warehouseForm/material/returnMaterial`,
			method: "POST",
			data: labelList
		});
	},
	returnBackHouse: (formCode, labelList) => {
		return request({
			url: `${prefixUrl}wms/warehouseForm/material/returnBackHouse`,
			method: "POST",
			data: {
				formCode,
				labelList
			}
		});
	},
	transfer: (labelList) => {
		return request({
			url: `${prefixUrl}wms/warehouseForm/material/transfer`,
			method: "POST",
			data: labelList
		});
	},
	listFormDetail: (params) => {
		return request({
			url: `${prefixUrl2}api/app/enout/listFormDetail`,
			method: "GET",
			data: params
		})
	},
	listContainerDetail: (params) => {
		return request({
			url: `${prefixUrl2}api/app/enout/listContainerDetail`,
			method: "GET",
			data: params
		})
	},
	submitContainer: (params) => {
		return request({
			url: `${prefixUrl2}api/app/enout/submitContainer`,
			method: "POST",
			data: params
		})
	},
	getDetailByStorageCode: (params) => {
		return request({
			url: `${prefixUrl2}api/app/enout/getDetailByStorageCode`,
			method: "GET",
			data: params
		})
	},
	getEnterDetailByLabelCode: (params) => {
		return request({
			url: `${prefixUrl2}api/app/enout/getEnterDetailByLabelCode`,
			method: "GET",
			data: params
		})
	},
	getOutDetailByLabelCode: (params) => {
		return request({
			url: `${prefixUrl2}api/app/enout/getOutDetailByLabelCode`,
			method: "GET",
			data: params
		})
	},
	returnContainer: (params) => {
		return request({
			url: `${prefixUrl2}api/app/enout/returnContainer`,
			method: "POST",
			data: params
		})
	},
	labelEnout: (params) => {
		return request({
			url: `${prefixUrl2}api/app/enout/labelEnout`,
			method: "POST",
			data: params
		})
	},
}