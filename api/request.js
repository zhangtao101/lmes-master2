// 根路径
// const baseURL = 'http://192.168.0.102:8060/'
// const baseURL = 'http://192.168.0.14:8050/'
// const baseURL = 'http://192.168.0.15:8050/'
// const baseURL = 'http://10.10.0.220:8060/'
// const baseURL = 'http://192.168.10.2:8060/'
// const baseURL = 'http://192.168.0.61:8050/'
 const baseURL = 'http://192.168.0.211:8060/'
// const baseURL = 'http://192.168.0.13:8050/'
// const baseURL = 'http://192.168.79.115:8060/'
// const baseURL = 'http://192.168.31.60:8060/'

const request = (o) => {
	const auth = uni.getStorageSync('auth');
	let options = {
		// 请求路径
		url: '',
		// 请求方式
		method: 'GET',
		// 请求参数
		data: {},
		// 请求头
		header: {
			'Authorization': `${auth}`
		},
		// 微信小程序请求时间一般设置为60000
		timeout: 60000
	}
	Object.assign(options, o)
	return new Promise((resolve, reject) => {
		uni.request({
			url: baseURL + '/' + options.url,
			method: options.method,
			data: options.data,
			header: options.header,
			timeout: options.timeout,
			success(res) {
				if (res.data.code == 401) {
					uni.showToast({
						title: res.data.msg
					})
					uni.navigateTo({
						url: '/pages/login/login'
					});
				}
				resolve(res.data)

			},
			fail(err) {
				reject(err)
			}

		})
	})
}
export default request;