export const OperateType = {
	materialOut: -1,
	materialDiaobo: 0,
	materialIn: 1,
	materialBack: 2,
	materialReturn: 3
}

export const OutType = {
	lineEdge: 1,
	common: 2
}

export const ReturnType = {
	backHouse: 2,
	defectProductBack: 3
}

export const CodeType = {
	KQ: "KQ",
	WL_Label: "WL",
	CP_Label: "CP",
	Other: 'OT'
}

/**
 * 根据编码获取编码类型
 * @param {string} code - 扫码得到的编码
 * @returns {string} 编码类型
 */
export function getCodeType(code) {
	if (!code) return CodeType.Other;
	code = code.trim().toUpperCase();
	if (code.startsWith('KQ')) return CodeType.KQ;
	if (code.startsWith('WL')) return CodeType.WL_Label;
	if (code.startsWith('CP')) return CodeType.CP_Label;
	return CodeType.Other;
}

export const ParentCode = "GDXXLX";