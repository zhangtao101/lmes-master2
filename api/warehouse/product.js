import request from '/api/request.js';
 const prefixUrl = '/mes-main/'
//const prefixUrl = '/mes-main-test/'

export default {
	getProductInfoByLabelCode: (labelCode) => {
		return request({
			url: `${prefixUrl}wms/productRecord/getProductInfoByLabelCode`,
			method: "GET",
			data: {
				labelCode
			}
		});
	},
	inbound: (labelList) => {
		return request({
			url: `${prefixUrl}wms/productRecord/inbound`,
			method: "POST",
			data: labelList
		});
	},
	getByShipCode: (shipCode) => {
		return request({
			url: `${prefixUrl}wms/productRecord/ship/getByShipCode`,
			method: "GET",
			data: {
				shipCode
			}
		});
	},
	outBound: (shipCodes, outBoundRecords) => {
		return request({
			url: `${prefixUrl}wms/productRecord/outbound`,
			method: "POST",
			data: {
				shipCodes,
				outBoundRecords
			}
		});
	},
	returnProduct: (labelList) => {
		return request({
			url: `${prefixUrl}wms/productRecord/returnProduct`,
			method: "POST",
			data: labelList
		});
	},
	returnBackHouse: (formCode, inoutDate, shipCodes, returnBackHouseRecords) => {
		return request({
			url: `${prefixUrl}wms/productRecord/returnBackHouse`,
			method: "POST",
			data: {
				formCode,
				inoutDate,
				shipCodes,
				returnBackHouseRecords
			}
		});
	},
	saveTransfer: (labelList) => {
		return request({
			url: `${prefixUrl}wms/product/transfer/save`,
			// url: `hzsmt-main/wms/product/transfer/save`,
			method: "POST",
			data: labelList
		});
	}
}