<template>
	<view class="print-container">
		<view class="section">
			<view class="section-title">{{$t('warehouse.connStatusStep')}}</view>
			<view class="connection-status" :class="{ connected: isConnected }">
				<text>{{ isConnected ? $t('warehouse.printerConnected') : $t('warehouse.printerNotConnected') }}</text>
				<button class="link-btn" @click="goToConnect">{{ isConnected ? $t('warehouse.switchPrinter') : $t('warehouse.goConnect') }}</button>
			</view>
		</view>

		<view class="section">
			<view class="section-title">{{$t('warehouse.printContentStep')}}</view>
			<view class="form-item">
				<text class="label">{{$t('warehouse.labelContent')}}</text>
				<input class="input" v-model="printContent" :placeholder="$t('warehouse.inputPrintContent')" />
			</view>
			<view class="btn-row">
				<button class="action-btn primary" :disabled="!isConnected" @click="doPrint">
					{{ isConnected ? $t('warehouse.printWithAll') : $t('warehouse.connectPrinterFirst') }}
				</button>
			</view>
		</view>

		<view class="tips" v-if="!isConnected">
			<text>{{$t('warehouse.printTip')}}</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
	import {
		getJcapi,
		printWithEnsureConnected,
		getPrinterConnectedEventName,
		isSessionPrinterConnected,
		closePrinter,
		initDrawingBoard,
		drawLabelText,
		drawLabelQrCode,
		drawLabelBarCode,
		generateLabelJson,
		startJob,
		printData,
		LineModeType,
		BarCodeType,
		QrCodeType
	} from '/common/printerTool.js'

	// 调用 getJcapi() 确保 SDK 已初始化
	const { t } = useI18n()
	getJcapi()
	
	// 状态变量
	const isConnected = ref(isSessionPrinterConnected())
	const printContent = ref(t('warehouse.testLabelContent'))

	const eventName = getPrinterConnectedEventName()
	const onConnectedHandler = () => {
		isConnected.value = true
	}

	onMounted(() => {
		// 检查初始连接状态
		isConnected.value = isSessionPrinterConnected()
		try {
			uni.$on(eventName, onConnectedHandler)
		} catch (e) {
			// ignore
		}
	})

	// 跳转到连接页面
	const goToConnect = () => {
		uni.navigateTo({
			url: '/pages/work/warehouse/printerConnect/printerConnect'
		})
	}

	// 打印
	const doPrint = async () => {
		if (!printContent.value) {
			uni.showToast({ title: t('warehouse.inputPrintContent'), icon: 'none' })
			return
		}

		try {
			await printWithEnsureConnected({
				printTask: () => new Promise((resolve, reject) => {
					try {
						// 1. 初始化画板 (60mm x 40mm)
						initDrawingBoard({
							width: 60,
							height: 40
						})

						// 2. 绘制文本（顶部居中）
						drawLabelText({
							x: 15,
							y: 2,
							width: 30,
							height: 8,
							value: printContent.value,
							fontSize: 4,
							rotate: 0,
							lineMode: LineModeType.AutoHeight,
							textAlignHorizontal: 1,
							textAlignVertical: 1
						})

						// 3. 绘制二维码（左侧）
						drawLabelQrCode({
							x: 5,
							y: 12,
							width: 15,
							height: 15,
							value: printContent.value,
							rotate: 0,
							codeType: QrCodeType.QrCode
						})

						// 4. 绘制条形码（右侧，宽度更大一些）
						drawLabelBarCode({
							x: 22,
							y: 12,
							width: 33,
							height: 12,
							value: printContent.value,
							codeType: BarCodeType.Code128,
							fontSize: 3,
							rotate: 0,
							textHeight: 3,
							textPosition: 0
						})

						// 5. 生成绘制数据
						const labelJson = generateLabelJson()

						// 6. 设置打印任务
						startJob({
							totalCount: 1,
							density: 10,
							labelType: 1,
							printMode: 1
						}, function(res) {
							if (res && res.code === 0) {
								// 7. 提交打印数据
								printData(labelJson, {
									printQuantity: 1
								}, function(printRes) {
									if (printRes && printRes.code === 0) {
										resolve(printRes)
									} else {
										reject(printRes || new Error(t('warehouse.printFail')))
									}
								})
							} else {
								reject(res || new Error(t('warehouse.setPrintTaskFail')))
							}
						})
					} catch (err) {
						reject(err)
					}
				})
			})

			uni.showToast({ title: t('warehouse.printSuccess'), icon: 'success' })
		} catch (e) {
			const msg = (e && (e.msg || e.message)) ? (e.msg || e.message) : t('warehouse.unknownError')
			uni.showToast({ title: t('warehouse.printFailed') + msg, icon: 'none' })
		}
	}
	
	// 页面卸载时断开连接
	onUnmounted(() => {
		try {
			uni.$off(eventName, onConnectedHandler)
		} catch (e) {
			// ignore
		}
		if (isConnected.value) closePrinter()
	})
</script>

<style lang="less" scoped>
	.print-container {
		padding: 30rpx;
		background: #f5f7fa;
		min-height: 100vh;
	}

	.section {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.btn-row {
		display: flex;
		gap: 20rpx;
		flex-wrap: wrap;
	}

	.action-btn {
		flex: 1;
		min-width: 200rpx;
		height: 80rpx;
		border-radius: 40rpx;
		border: none;
		background: #f0f0f0;
		color: #666;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		&.primary {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
		}

		&:active {
			opacity: 0.8;
		}

		&[disabled] {
			opacity: 0.5;
		}
	}

	.connection-status {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;
		background: #f8f9fb;
		border-radius: 12rpx;
		border: 2rpx solid #faad14;

		&.connected {
			border-color: #52c41a;
			background: rgba(82, 196, 26, 0.1);
		}

		text {
			font-size: 28rpx;
			color: #faad14;
		}

		&.connected text {
			color: #52c41a;
		}

		.link-btn {
			padding: 12rpx 24rpx;
			background: #667eea;
			color: #fff;
			border-radius: 8rpx;
			font-size: 24rpx;
			border: none;
		}
	}

	.form-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;

		.label {
			font-size: 28rpx;
			color: #333;
			white-space: nowrap;
		}

		.input {
			flex: 1;
			height: 72rpx;
			padding: 0 24rpx;
			background: #f8f9fb;
			border-radius: 12rpx;
			font-size: 28rpx;
			border: 2rpx solid #e8eaf0;

			&:focus {
				border-color: #667eea;
			}
		}
	}

	.tips {
		text-align: center;
		padding: 40rpx;
		color: #999;
		font-size: 28rpx;
	}
</style>
