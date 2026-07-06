import request from '/api/request.js'

/**
 * 检测App更新（仅整包更新）
 */
const appUpdate = {
	/**
	 * 检查更新入口
	 * @param {Boolean} silent 静默检测，不显示"已是最新版本"提示
	 */
	checkUpdate(silent = true) {
		// #ifdef APP-PLUS
		const currentVersion = plus.runtime.version
		const currentVersionCode = plus.runtime.versionCode
		
		request({
			url: 'api/app/version/check',
			method: 'GET',
			data: {
				versionCode: currentVersionCode,
				platform: plus.os.name === 'Android' ? 'android' : 'ios'
			}
		}).then(res => {
			if (res.code == 200 && res.data) {
				const info = res.data
				if (info.versionCode > currentVersionCode) {
					this.showUpdateDialog(info, currentVersion)
				} else if (!silent) {
					uni.showToast({
						title: '已是最新版本',
						icon: 'none'
					})
				}
			} else if (!silent) {
				uni.showToast({
					title: '已是最新版本',
					icon: 'none'
				})
			}
		}).catch(() => {
			if (!silent) {
				uni.showToast({
					title: '检查更新失败',
					icon: 'none'
				})
			}
		})
		// #endif
	},

	/**
	 * 显示更新弹窗
	 */
	showUpdateDialog(info, currentVersion) {
		const isForce = info.forceUpdate == 1
		const updateDesc = info.updateDesc || '发现新版本，请更新后使用'
		const versionName = info.versionName || ''
		
		const content = `当前版本：${currentVersion}\n最新版本：${versionName}\n\n${updateDesc}`
		
		if (isForce) {
			// 强制更新：只显示确认按钮
			uni.showModal({
				title: '版本更新',
				content: content,
				showCancel: false,
				confirmText: '立即更新',
				success: (res) => {
					if (res.confirm) {
						this.downloadApk(info.downloadUrl)
					}
				}
			})
		} else {
			// 普通更新：可选择取消
			uni.showModal({
				title: '版本更新',
				content: content,
				cancelText: '稍后再说',
				confirmText: '立即更新',
				success: (res) => {
					if (res.confirm) {
						this.downloadApk(info.downloadUrl)
					}
				}
			})
		}
	},

	/**
	 * 下载 APK 并安装
	 */
	downloadApk(url) {
		if (!url) {
			uni.showToast({
				title: '下载地址为空',
				icon: 'none'
			})
			return
		}

		// Android：下载 APK 文件并安装
		if (plus.os.name === 'Android') {
			uni.showLoading({
				title: '正在下载更新...',
				mask: true
			})

			const downloadTask = plus.downloader.createDownload(url, {
				filename: '_downloads/update.apk'
			}, (d, status) => {
				uni.hideLoading()
				if (status == 200) {
					plus.runtime.install(d.filename, {
						force: true
					}, () => {
						plus.runtime.restart()
					}, (e) => {
						uni.showToast({
							title: '安装失败: ' + e.message,
							icon: 'none'
						})
					})
				} else {
					uni.showToast({
						title: '下载失败',
						icon: 'none'
					})
				}
			})

			// 监听下载进度
			let lastProgress = 0
			downloadTask.addEventListener('statechanged', (task) => {
				if (task.state == 3 && task.downloadedSize) {
					const progress = parseInt(task.downloadedSize / task.totalSize * 100)
					if (progress > lastProgress) {
						lastProgress = progress
						uni.showLoading({
							title: `下载中 ${progress}%`,
							mask: true
						})
					}
				}
			})

			downloadTask.start()
		} else {
			// iOS：跳转到 App Store
			plus.runtime.openURL(url)
		}
	}
}

export default appUpdate
