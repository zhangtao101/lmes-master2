import {
	CodeType
} from '/common/enum.js'
export function retriveLogicalWarehouse(warehouse) {
	let warehouseInfo = {
		logicalCode: '',
		logicalName: ''
	}
	if (warehouse) {
		let arr_house = warehouse.split('/');
		if (arr_house && arr_house.length >= 2) {
			warehouseInfo.logicalCode = arr_house[0];
			warehouseInfo.logicalName = arr_house[1];
		}
	}

	return warehouseInfo;
}

export function formatDate(dateVal, fmt = 'yyyy-MM-dd hh:mm:ss') {
	if (dateVal) {
		let date = new Date(dateVal);
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
		}
		let o = {
			'M+': date.getMonth() + 1,
			'd+': date.getDate(),
			'h+': date.getHours(),
			'm+': date.getMinutes(),
			's+': date.getSeconds()
		};

		for (let k in o) {
			if (new RegExp(`(${k})`).test(fmt)) {
				let str = o[k] + '';
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
			}
		}
		return fmt;
	}
	return '';

}

function padLeftZero(str) {
	return ('00' + str).substr(str.length);
}

export function getCodeType(code) {
	code = code.toUpperCase()
	let codeType = '';
	if (code.startsWith('KQ') && code.indexOf('-') >= 0) { //库区
		codeType = CodeType.KQ;
	} else if (code.startsWith('BZ')) { //成品标签
		codeType = CodeType.CP_Label;
	} else if (code.indexOf('WL') >= 0) { //物料标签
		codeType = CodeType.WL_Label;
	} else { //领料单或发货单
		codeType = CodeType.Other;
	}
	return codeType;
}