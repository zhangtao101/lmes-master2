import request from '/api/request.js';

const prefixUrl = '/mes-equip/'
const prefixUrl2 = '/mes-main/'

// 操作类型常量
export const OperationType = {
	INSTALL: 'INSTALL', // 上模
	REMOVE: 'REMOVE'    // 下模
}

export default {
	/**
	 * 按模具编号查询模具详情
	 * @param {string} moldCode - 模具编号
	 */
	getMoldByCode: (moldCode) => {
		return request({
			url: `${prefixUrl}mold/base/byCode`,
			method: "GET",
			data: {
				moldCode
			}
		});
	},

	/**
	 * 上模前校验（模具状态、是否已在机）
	 * @param {string} moldCode - 模具编码
	 * @param {string} equipmentCode - 设备编码
	 * @param {string} workOrderNo - 工单号
	 */
	validateMoldOperation: (moldCode, equipmentCode, workOrderNo) => {
		return request({
			url: `${prefixUrl}mold/operation/validate`,
			method: "POST",
			data: {
				moldCode,
				equipmentCode,
				workOrderNo
			}
		});
	},

	/**
	 * 查询当前在机模具信息
	 * @param {string} equipmentCode - 设备编码
	 */
	getCurrentMoldInfo: (equipmentCode) => {
		return request({
			url: `${prefixUrl}mold/operation/current-info`,
			method: "GET",
			data: {
				equipmentCode
			}
		});
	},

	/**
	 * 上模/下模提交（统一入口）
	 * @param {string} operationType - 操作类型：INSTALL-上模，REMOVE-下模
	 * @param {string} equipmentCode - 设备编码
	 * @param {string} moldCode - 模具编码（上模必填，下模可不传）
	 * @param {string} workOrderNo - 工单号（上模必填，下模可不传）
	 */
	submitMoldOperation: (operationType, equipmentCode, moldCode, workOrderNo) => {
		return request({
			url: `${prefixUrl}mold/operation/submit`,
			method: "POST",
			data: {
				operationType,
				equipmentCode,
				...(moldCode && { moldCode }),
				...(workOrderNo && { workOrderNo })
			}
		});
	},

	/**
	 * 根据工单单号获取工单信息
	 * @param {string} worksheetCode - 工单单号
	 */
	getWorksheetByCode: (worksheetCode) => {
		return request({
			url: `${prefixUrl2}plan/worksheet/getWorksheetByCode/${worksheetCode}`,
			method: "GET",
			data: {}
		});
	},

	/**
	 * 根据设备编码获取设备信息和工序
	 * @param {string} equipCode - 设备编号
	 */
	getEquipBindingByCode: (equipCode) => {
		return request({
			url: `${prefixUrl2}workstation/setRecord/getEquipBindingByCode`,
			method: "GET",
			data: {
				equipCode
			}
		});
	},

	/**
	 * 根据设备编号和工单号获取对应的工序信息
	 * @param {string} equipCode - 设备编号
	 * @param {string} worksheetCode - 工单号
	 * @param {number} opType - 操作类型：1投料作业 2报工作业 3下料作业
	 */
	getBindingByCode: (equipCode, worksheetCode, opType) => {
		return request({
			url: `${prefixUrl2}workstation/setRecord/getBindingByCode`,
			method: "GET",
			data: {
				equipCode,
				worksheetCode,
				opType
			}
		});
	},

	/**
	 * 贴片投料查询
	 * @param {number} functionId - 工步明细ID
	 * @param {number} bindingId - 绑定工序ID
	 * @param {string} worksheetCode - 工单号
	 * @param {string} workstationCode - 工作站编号
	 * @param {number} pageNum - 页码
	 * @param {number} pageSize - 每页展示条数
	 */
	listSmtFeed: (functionId, bindingId, worksheetCode, workstationCode, pageNum, pageSize) => {
		return request({
			url: `${prefixUrl2}workstation/opfunction/listSmtFeed`,
			method: "GET",
			data: {
				functionId,
				bindingId,
				worksheetCode,
				workstationCode,
				pageNum,
				pageSize
			}
		});
	},

	/**
	 * 投料接口
	 * @param {string} workstationCode - 工作站编号
	 * @param {string} worksheetCode - 工单号
	 * @param {number} functionId - 工步明细ID
	 * @param {number} bindingId - 绑定工序ID
	 * @param {string} labelCode - 标签号
	 * @param {string} feedNumber - 投入量
	 * @param {string} materialCode - 料号
	 */
	smtFeed: (workstationCode, worksheetCode, functionId, bindingId, labelCode, feedNumber, materialCode) => {
		return request({
			url: `${prefixUrl2}workstation/opfunction/feed`,
			method: "POST",
			data: {
				workstationCode,
				worksheetCode,
				functionId,
				bindingId,
				labelCode,
				feedNumber,
				materialCode
			}
		});
	},

	/**
	 * 投料标签码校验
	 * @param {string} labelCode - 扫码标签
	 * @param {string} materialCode - 物料编号
	 */
	checkSmtFeed: (labelCode, materialCode) => {
		return request({
			url: `${prefixUrl2}workstation/opfunction/checkSmtFeed`,
			method: "GET",
			data: {
				labelCode,
				materialCode
			}
		});
	},

	/**
	 * 工序报工
	 * @param {object} params - 报工参数
	 * @param {number} params.classType - 班别：1白班 2晚班
	 * @param {number} params.equipTime - 机时
	 * @param {number} params.personTime - 报工人数
	 * @param {number} params.reportNumber - 报工数
	 * @param {number} params.unqualityNumber - 不良品数
	 * @param {string} params.worksheetCode - 工单号
	 * @param {string} params.productCode - 产品编号
	 * @param {string} params.productName - 产品名称
	 * @param {number} params.planNumber - 计划数
	 * @param {number} params.bindingId - 工序绑定ID
	 * @param {number} params.functionId - 工步ID
	 */
	outReport: (params) => {
		return request({
			url: `${prefixUrl2}workstation/opfunction/outReport`,
			method: "POST",
			data: {
				classType: params.classType,
				equipTime: params.equipTime,
				personTime: params.personTime,
				manualReview: params.manualReview || 0,
				manualReviewOfDefects: params.manualReviewOfDefects || 0,
				differenceQuantity: params.differenceQuantity || 0,
				poorQuantityOfDifferences: params.poorQuantityOfDifferences || 0,
				reportNumber: params.reportNumber,
				unqualityNumber: params.unqualityNumber,
				worksheetCode: params.worksheetCode,
				productCode: params.productCode,
				productName: params.productName,
				planNumber: params.planNumber,
				finishNumber: params.finishNumber || 0,
				totalUnqualityNumber: params.totalUnqualityNumber || 0,
				equipQualityNumber: params.equipQualityNumber || 0,
				equipUnqualityNumber: params.equipUnqualityNumber || 0,
				outFlag: params.outFlag || null,
				bindingId: params.bindingId,
				functionId: params.functionId,
				outType: params.outType || null
			}
		});
	}
}
