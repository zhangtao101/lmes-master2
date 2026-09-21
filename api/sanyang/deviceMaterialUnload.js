import request from '/api/request.js';

// TODO: 网关前缀需按三养后端实际部署的服务名确认
const prefixUrl = 'mes-main/';

export default {
	// 根据设备编号展示所有加载物料
	// 参数：equipCode 设备编号
	// 返回数组元素含：id、materialName 物料名称、materialCode 物料编号、
	//              actualWt 称重重量、unit 单位、createTime 装载时间
	selectMaterial: (equipCode) => {
		return request({
			url: `${prefixUrl}palletiz/selectMaterial`,
			method: 'GET',
			data: {
				equipCode: equipCode
			}
		});
	},
	// 修改加载数量：卸载后回写记录
	// payload：id 记录id、actualWt 修改后的托盘数量（原值多少无所谓，传修改后的值）
	updateLabel: (payload) => {
		return request({
			url: `${prefixUrl}weight/label/update`,
			method: 'PUT',
			data: payload
		});
	}
};
