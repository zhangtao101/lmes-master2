import request from '/api/request.js';

const prefixUrl = '/mes-wms/'

export default {
	/**
	 * 获取待执行任务列表
	 * @param {number} pageSize - 页面展示数量
	 * @param {number} pageNum - 页码
	 */
	getTodoList: (pageSize, pageNum) => {
		return request({
			url: `${prefixUrl}wms/stocktaking/listTodoByParam`,
			method: "GET",
			data: {
				pageSize,
				pageNum
			}
		});
	},

	/**
	 * 根据任务ID获取对应的盘点料号清单
	 * @param {string|number} id - 执行任务id
	 */
	getMaterialListById: (id) => {
		return request({
			url: `${prefixUrl}wms/stocktaking/listMaterialById/${id}`,
			method: "GET",
			data: {}
		});
	},

	/**
	 * 根据任务ID和料号获取对应的盘点明细
	 * @param {number} recordId - 盘点任务ID
	 * @param {string} materialCode - 料号
	 */
	getStocktakingDetail: (recordId, materialCode) => {
		return request({
			url: `${prefixUrl}wms/stocktaking/listStocktakingDetail`,
			method: "GET",
			data: {
				recordId,
				materialCode
			}
		});
	},

	/**
	 * 盘点标签扫码
	 * @param {string} labelCode - 盘点时扫码的标签
	 */
	scanLabelCode: (labelCode) => {
		return request({
			url: `${prefixUrl}wms/stocktaking/scanLabelCode`,
			method: "GET",
			data: {
				labelCode
			}
		});
	},

	/**
	 * 盘点明细保存
	 * @param {Array} details - 盘点明细列表
	 * @param {number} recordId - 盘点任务ID
	 * @param {string} taskCode - 盘点任务号
	 */
	saveStocktakingDetail: (details, recordId, taskCode) => {
		return request({
			url: `${prefixUrl}wms/stocktaking/saveStocktakingDetail`,
			method: "POST",
			data: {
				details,
				recordId,
				taskCode
			}
		});
	}
}
