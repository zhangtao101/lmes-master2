import request from '/api/request.js';

const prefixUrl = '/mes-wms/'

export default {
	/**
	 * 根据单号获取对应库存明细
	 * @param {string} formCode - 单据号
	 */
	listFormDetail: (formCode) => {
		return request({
			url: `${prefixUrl}api/app/materialstock/listFormDetail`,
			method: "GET",
			data: {
				formCode
			}
		});
	},

	/**
	 * 根据料号获取库存明细
	 * @param {string} materialCode - 料号
	 */
	listByMaterialCode: (materialCode) => {
		return request({
			url: `${prefixUrl}api/app/materialstock/listByMaterialCode`,
			method: "GET",
			data: {
				materialCode
			}
		});
	}
}
