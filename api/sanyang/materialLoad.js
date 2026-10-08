import request from '/api/request.js';

// TODO: 网关前缀需按三养后端实际部署的服务名确认
const prefixUrl = 'mes-main/';

export default {
	// 扫码得到物料：按托盘号（label）查询物料信息
	// 返回：scanLabel 扫进来的标签、materialName 物料名称、materialCode 物料编号、
	//      actualWt 数量、unit 单位
	selectPalletLabel: (label) => {
		return request({
			url: `${prefixUrl}palletiz/selectPalletLabel`,
			method: 'GET',
			data: {
				label: label
			}
		});
	},
	// 物料装载批量保存
	// payload 为数组，元素含：actualWt 加载数量、equipCode 产线选择行的设备编号、
	// materialCode 材料编号、materialName 材料名称、scanLabel 标签、unit 单位、
	// palletLabel 设备编号、packType 包装类型（3单包 4多包 5料包）
	addBatch: (payload) => {
		return request({
			url: `${prefixUrl}weight/label/addBatch`,
			method: 'POST',
			data: payload
		});
	}
};
