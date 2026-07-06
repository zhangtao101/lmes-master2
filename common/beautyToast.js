// uniapp 美化版 Toast 提示工具
let toastTimer = null

/**
 * 统一提示方法
 * @param {Object} options
 * @param {string} options.title - 提示内容
 * @param {string} [options.icon] - 图标类型：'none'（默认）、'success'（成功）
 *
 * 使用说明：
 * - 普通提示：不传 icon，居中显示，持续时间更长
 * - 成功提示：icon: 'success'，居中大图标
 */
const showBeautyToast = (options) => {
	const {
		title = '提示',
		icon = 'none'
	} = options

	// 清除之前的定时器
	if (toastTimer) {
		clearTimeout(toastTimer)
		toastTimer = null
	}

	if (icon === 'success') {
		// 成功提示：居中、大图标、更明显
		uni.showToast({
			title: title,
			icon: 'success',
			duration: 2500,
			position: 'center',
			mask: true
		})
	} else {
		// 普通提示：居中显示，持续时间更长，更明显
		uni.showToast({
			title: title,
			icon: 'none',
			duration: 3000,
			position: 'center',
			mask: true
		})
	}
}

export default showBeautyToast
