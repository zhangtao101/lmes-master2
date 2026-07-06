import request from '/api/request.js';

 const prefixUrl = '/mes-wms';
//const prefixUrl = '/mes-wms-tset';

/**
 * 获取CTU箱拣选详情
 * @param packingCode 箱码
 */
export function getDetailByCode(packingCode) {
	return request({
		url: `${prefixUrl}/human/packing/getDetailByCode`,
		method: 'GET',
		data: {
			packingCode
		}
	});
}

/**
 * 根据标签获取入库装箱明细信息
 * @param labelCode 标签码
 */
export function getDetailByLabelCode(labelCode) {
	return request({
		url: `${prefixUrl}/human/packing/getDetailByLabelCode`,
		method: 'GET',
		data: {
			labelCode
		}
	});
}

/**
 * 拆箱
 * @param params 参数
 */
export function productPackingOut(params) {
	return request({
		url: `${prefixUrl}/human/packing/productPackingOut`,
		method: 'PUT',
		data: params
	});
}

/**
 * 箱码生成
 */
export function packingInfoCreate() {
	return request({
		url: `${prefixUrl}/human/packing/packingInfoCreate`,
		method: 'GET',
		data: {}
	});
}

/**
 * 开始CTU箱拣选
 * @param packingCode 箱码
 */
export function productPackingStart(packingCode) {
	return request({
		url: `${prefixUrl}/human/packing/productPackingStart`,
		method: 'PUT',
		data: {
			packingCode
		}
	});
}

/**
 * 完成CTU箱拣选
 * @param packingCode 箱码
 */
export function productPackingFinish(packingCode) {
	return request({
		url: `${prefixUrl}/human/packing/productPackingFinish`,
		method: 'PUT',
		data: {
			packingCode
		}
	});
}

/**
 * 装箱
 * @param params 参数对象
 */
export function productPackingIn(params) {
	return request({
		url: `${prefixUrl}/human/packing/productPackingIn`,
		method: 'POST',
		data: params
	});
}

/**
 * 根据物料编码查询物料特征
 * @param materialCode 物料编码
 */
export function materialFeatureGetByMaterialCodeWith(materialCode) {
	return request({
		url: `${prefixUrl}/base/materialFeature/getByMaterialCodeWithPage`,
		method: 'GET',
		data: {
			materialCode
		}
	});
}

/**
 * 根据物料编码查询物料列表
 * @param materialCode 物料编码
 */
export function getByMaterialCodeAndName(materialCode) {
	return request({
		url: `${prefixUrl}/base/materialInfo/getByMaterialCodeAndName`,
		method: 'GET',
		data: {
			materialCode
		}
	});
}


/**
 *  箱码查询
 * @param packingCode 箱码
 */
export function getStorageDetailByCode(packingCode) {
	return request({
		url: `${prefixUrl}/human/packing/getStorageDetailByCode`,
		method: 'GET',
		data: {
			packingCode
		}
	});
}