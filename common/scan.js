export default function scanCode() {
	return new Promise((resolve, reject) => {
		uni.scanCode({
			success(res) {
				if (res.result) {
					// 扫描成功，处理二维码内容
					resolve(res.result);
				} else {
					reject('扫描失败');
				}
			},
			fail() {
				reject('调用相机失败');
			}
		});
	})
}