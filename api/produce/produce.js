import request from '/api/request.js';

 const MES_MAIN = '/mes-main';
 const MES_USER = '/mes-user';
 const MES_EQUIP = '/mes-equip';
//const MES_MAIN = '/mes-main-test';
//const MES_USER = '/mes-user-test';
//const MES_EQUIP = '/mes-equip-test';

export default {
	getByCode: (code) => {
		return request({
			url: `${MES_MAIN}/produce/interactionPoint/getByCode`,
			method: "GET",
			data: {
				code
			}
		});
	},
	getWorksheetByCode: (worksheetCode) => {
		return request({
			url: `${MES_MAIN}/plan/worksheet/getWorksheetByCode/${worksheetCode}`,
			method: "GET",
			data: {

			}
		});
	},
	getDetailByProcessCodeAndWorkSheetCode: (processCode, workSheetCode) => {
		return request({
			url: `${MES_MAIN}/process/turn/getDetailByProcessCodeAndWorksheetCode`,
			method: "GET",
			data: {
				processCode,
				workSheetCode
			}
		});
	},
	changeWorksheet: (worksheetCode, equipmentCode, lineId, processCode, type) => {
		return request({
			url: `${MES_MAIN}/human/patch/changeWorksheet`,
			method: "POST",
			data: {
				worksheetCode,
				equipmentCode,
				lineId,
				processCode,
				type
			}
		});
	},
	getUserInfo: (workNumber) => {
		return request({
			url: `${MES_USER}/sys/user/${workNumber}`,
			method: "GET",
			data: {

			}
		});
	},
	getLastUserUpInfo: (clientCode) => {
		return request({
			url: `${MES_MAIN}/human/patch/getLastUserUpInfo`,
			method: "GET",
			data: {
				clientCode
			}
		});
	},
	userUp: (clientCode, workNumber) => {
		return request({
			url: `${MES_MAIN}/human/patch/userUp`,
			method: "POST",
			data: {
				clientCode,
				workNumber
			}
		});
	},
	getDetailByEquipCode: (equipCode) => {
		return request({
			url: `${MES_EQUIP}/equipCheckPlan/getDetailByEquipCode/${equipCode}`,
			method: "GET",
			data: {

			}
		});
	},
	saveEquipCheckRecord: (equipmentCode, equipmentName, recordType, maintenanceId, details, result) => {
		return request({
			url: `${MES_EQUIP}/equipCheckRecord/save`,
			method: "POST",
			data: {
				equipmentCode,
				equipmentName,
				recordType,
				maintenanceId,
				details,
				result
			}
		});
	},
	listWordListByParentCode: (parentCode) => {
		return request({
			url: `${MES_USER}/sys/word/listWordListByParentCode/${parentCode}`,
			method: "GET",
			data: {

			}
		});
	},
	worksheetDown: (worksheetCode, equipmentCode, lineId, processCode, typeCode) => {
		return request({
			url: `${MES_MAIN}/human/patch/worksheetDown`,
			method: "POST",
			data: {
				worksheetCode,
				equipmentCode,
				lineId,
				processCode,
				typeCode
			}
		});
	},
	insertWorkReport: (workSheetCode, number, reportUser,
		opType) => {
		return request({
			url: `${MES_MAIN}/report/detail/insertWorkReport`,
			method: "POST",
			data: {
				workSheetCode,
				number,
				reportUser,
				opType
			}
		});
	},
	getMaterialByCode: (materialPlateCode) => {
		return request({
			url: `${MES_MAIN}/human/patch/getMaterialByCode`,
			method: "GET",
			data: {
				materialPlateCode
			}
		});
	},
	feed: (interactionPointCode, equipmentCode, materialPlateCode, materialCode, materialName, feedUser,
		worksheetCode) => {
		return request({
			url: `${MES_MAIN}/human/patch/feed`,
			method: "POST",
			data: {
				interactionPointCode,
				equipmentCode,
				materialPlateCode,
				materialCode,
				materialName,
				feedUser,
				worksheetCode
			}
		});
	},
	changeSteelnet: (steelnetCode, equipmentCode, changeUser) => {
		return request({
			url: `${MES_MAIN}/human/patch/changeSteelnet`,
			method: "POST",
			data: {
				steelnetCode,
				equipmentCode,
				changeUser
			}
		});
	},
	fuzzyQuery: (defectCode) => {
		return request({
			url: `${MES_MAIN}/productdefect/fuzzyQuery`,
			method: "GET",
			data: {
				defectCode
			}
		});
	},
	saveDiscoveryDefect: (clientCode, discoveryProcessCode, worksheetCode, subProductCode, subProductName, productCode,
		productName,
		defectNumber, detailList) => {
		return request({
			url: `${MES_MAIN}/discoveryDefect/save`,
			method: "POST",
			data: {
				clientCode,
				discoveryProcessCode,
				worksheetCode,
				subProductCode,
				subProductName,
				productCode,
				productName,
				defectNumber,
				detailList
			}
		});
	},
	getListByWorkSheetCode: (workSheetCode) => {
		return request({
			url: `${MES_MAIN}/discoveryDefect/getListByWorkSheetCode/${workSheetCode}`,
			method: "GET",
			data: {

			}
		});
	},
	getSubProductListByWorksheetCode: (worksheetCode) => {
		return request({
			url: `${MES_MAIN}/human/repair/getSubProductListByWorksheetCode`,
			method: "GET",
			data: {
				worksheetCode
			}
		});
	},
	saveRepair: (clientCode, qrCode, worksheetCode, number, discoveryProcess, vehicleCode, repairStatus, defectRecords,
		materialRecordList) => {
		return request({
			url: `${MES_MAIN}/human/repair/save`,
			method: "POST",
			data: {
				clientCode,
				qrCode,
				worksheetCode,
				number,
				discoveryProcess,
				vehicleCode,
				repairStatus,
				defectRecords,
				materialRecordList
			}
		});
	},
	saveWaste: (clientCode, workSheetCode, defectCode, wasteNumber) => {
		return request({
			url: `${MES_MAIN}/human/repair/saveWaste`,
			method: "POST",
			data: {
				clientCode,
				workSheetCode,
				defectCode,
				wasteNumber
			}
		});
	},
	getFeedListByCode: (worksheetCode) => {
		return request({
			url: `${MES_MAIN}/human/feed/getFeedListByCode`,
			method: "GET",
			data: {
				worksheetCode
			}
		});
	},
	insertStores: (list) => {
		return request({
			url: `${MES_MAIN}/human/feed/insertStores`,
			method: "POST",
			data: list
		});
	},
	smkFeedSave: (equipCode, workSheetCode, feedUser, feedDetailVMs) => {
		return request({
			url: `${MES_MAIN}/human/feed/smkFeedSave`,
			method: "POST",
			data: {
				equipCode,
				workSheetCode,
				feedUser,
				feedDetailVMs
			}
		});
	},
	getUserTime: (workSheetCode, userCode) => {
		return request({
			url: `${MES_MAIN}/human/patch/getUserTime`,
			method: "GET",
			data: {
				workSheetCode,
				userCode
			}
		});
	},
	getRuntime: (workSheetCode) => {
		return request({
			url: `${MES_MAIN}/human/patch/getRuntime`,
			method: "GET",
			data: {
				workSheetCode
			}
		});
	},
	outPutSmkWorksheet: (equipmentCode, worksheetCode, number, opType, useDetailVMs, personTime, equipTime, opUser) => {
		return request({
			url: `${MES_MAIN}/human/patch/outPutSmkWorksheet`,
			method: "POST",
			data: {
				equipmentCode,
				worksheetCode,
				number,
				opType,
				useDetailVMs,
				personTime,
				equipTime,
				opUser
			}
		});
	},
	getProductInfoBySteelnetCode: (steelnetCode) => {
		return request({
			url: `${MES_MAIN}/human/patch/getProductInfoBySteelnetCode`,
			method: "GET",
			data: {
				steelnetCode
			}
		});
	}
}