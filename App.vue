<script>
	// #ifdef APP-PLUS
	import appUpdate from '/common/update.js'
	// #endif

	export default {
		onLaunch: function() {
			// console.log('App Launch')
			this.currentUser = uni.getStorageSync("user");
			// console.log(uni.getDeviceInfo())

			// #ifdef APP-PLUS
			// 延迟检查更新，避免影响启动速度
			setTimeout(() => {
				// appUpdate.checkUpdate()
			}, 2000)
			// #endif
		},
		onShow: function() {
			// console.log('App Show')
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style lang="less">
	/*每个页面公共css */
	@import "@/static/styles/common.less";
	@import "@/static/font/iconfont.css";
</style>