import request from '/api/request.js';

// TODO: 网关前缀需按三养后端实际部署的服务名确认
const prefixUrl = 'mes-main/';

export default {
	// 展示称重记录：查询已装载的物料记录
	// 参数：id 批次/产线id、type 包装类型（3单包 4多包 5料包，如 "3,4,5"）、equipCode 设备名称
	// 返回数组元素含：id、lotId、palletLabel 设备名称、scanLabel 标签、materialName 物料名称、
	//              materialCode 物料编号、actualWt 数量、unit 单位
	searchRecord: (params) => {
		return request({
			url: `${prefixUrl}weight/label/searchRecord`,
			method: 'GET',
			data: params || {}
		});
	},
	// 修改加载数量：卸载后回写记录
	// payload：id 记录id、actualWt 原数量-修改后数量（需要传的值）
	updateLabel: (payload) => {
		return request({
			url: `${prefixUrl}weight/label/update`,
			method: 'PUT',
			data: payload
		});
	}
};
