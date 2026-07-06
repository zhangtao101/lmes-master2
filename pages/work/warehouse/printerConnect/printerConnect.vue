<template>
	<view class="print-container">
		<view class="section">
			<view class="section-title">搜索打印机</view>
			<view class="btn-row">
				<button class="action-btn" :class="{ loading: isSearching }" :disabled="isSearching" @click="searchBluetooth">
					{{ isSearching ? '搜索中...' : '搜索蓝牙' }}
				</button>
				<button class="action-btn" :class="{ loading: isSearching }" :disabled="isSearching" @click="searchBluetoothAll">
					{{ isSearching ? '搜索中...' : '搜索全部蓝牙' }}
				</button>
				<button class="action-btn" :class="{ loading: isSearching }" :disabled="isSearching" @click="searchWifi">
					{{ isSearching ? '搜索中...' : '搜索WiFi' }}
				</button>
			</view>
		</view>

		<view class="section" v-if="deviceList && deviceList.length > 0">
			<view class="section-title">选择打印机</view>
			<view class="device-list">
				<view 
					class="device-item" 
					v-for="(item, index) in deviceList" 
					:key="index"
					:class="{ active: selectedIndex === index }"
					@click="selectDevice(index)"
				>
					<text>{{ item.name || '未知设备' }}</text>
					<text class="address">{{ item.address || '' }}</text>
				</view>
			</view>

			<view class="btn-row">
				<button class="action-btn primary" :disabled="selectedIndex === null || isConnecting" @click="connectPrinter">
					{{ isConnecting ? '连接中...' : isConnected ? '已连接' : '连接打印机' }}
				</button>
			</view>
		</view>

		<view class="tips" v-if="!isConnected">
			<text>提示：连接成功后将自动返回继续打印。</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, onUnmounted } from 'vue'
	import {
		getJcapi,
		searchBluetoothDevicesWithName,
		searchBluetoothDevices,
		searchWifiDevices,
		connectPrinterByDevice,
		getPrinterConnectedEventName,
		isSessionPrinterConnected
	} from '/common/printerTool.js'

	// 触发页面加载时即初始化 SDK（内部已做单例处理）
	getJcapi()

	const printerNames = ['N11', 'N41', 'B1', 'K3', 'D11', 'N110', 'N410', 'M110', 'M410', '精臣', 'NIIMBOT']

	const deviceList = ref([])
	const selectedIndex = ref(null)
	const currentDevice = ref(null)
	const isConnecting = ref(false)
	const isSearching = ref(false)
	const isConnected = ref(isSessionPrinterConnected())

	const eventName = getPrinterConnectedEventName()

	let onConnectedHandler = null

	onMounted(() => {
		onConnectedHandler = () => {
			isConnected.value = true
		}
		try {
			uni.$on(eventName, onConnectedHandler)
		} catch (e) {
			// ignore
		}
	})

	onUnmounted(() => {
		try {
			if (onConnectedHandler) uni.$off(eventName, onConnectedHandler)
		} catch (e) {
			// ignore
		}
	})

	const searchBluetooth = async () => {
		deviceList.value = []
		selectedIndex.value = null
		currentDevice.value = null
		isSearching.value = true
		try {
			const list = await searchBluetoothDevicesWithName({ name: printerNames })
			deviceList.value = list
			uni.showToast({ title: list.length ? `找到 ${list.length} 个打印机` : '未找到打印机，请尝试搜索全部蓝牙', icon: 'none' })
		} catch (e) {
			uni.showToast({ title: '搜索蓝牙失败', icon: 'none' })
		} finally {
			isSearching.value = false
		}
	}

	const searchBluetoothAll = async () => {
		deviceList.value = []
		selectedIndex.value = null
		currentDevice.value = null
		isSearching.value = true
		try {
			const list = await searchBluetoothDevices()
			deviceList.value = list
			uni.showToast({ title: list.length ? `找到 ${list.length} 个设备` : '未找到蓝牙设备', icon: 'none' })
		} catch (e) {
			uni.showToast({ title: '搜索蓝牙失败', icon: 'none' })
		} finally {
			isSearching.value = false
		}
	}

	const searchWifi = async () => {
		deviceList.value = []
		selectedIndex.value = null
		currentDevice.value = null
		isSearching.value = true
		try {
			const list = await searchWifiDevices()
			deviceList.value = list
			uni.showToast({ title: list.length ? `找到 ${list.length} 个设备` : '未找到WiFi设备', icon: 'none' })
		} catch (e) {
			uni.showToast({ title: '搜索WiFi失败', icon: 'none' })
		} finally {
			isSearching.value = false
		}
	}

	const selectDevice = (index) => {
		selectedIndex.value = index
		currentDevice.value = deviceList.value[index]
	}

	const connectPrinter = async () => {
		if (!currentDevice.value) {
			uni.showToast({ title: '请选择打印机', icon: 'none' })
			return
		}
		isConnecting.value = true
		try {
			await connectPrinterByDevice(currentDevice.value)
			isConnected.value = true
			uni.showToast({ title: '连接成功', icon: 'success' })

			// 连接成功后返回：调用方已在等待事件，会自动继续打印
			uni.navigateBack()
		} catch (e) {
			uni.showToast({ title: '连接失败', icon: 'error' })
		} finally {
			isConnecting.value = false
		}
	}
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

		&.loading {
			background: #e0e0e0;
			color: #999;
		}
	}

	.device-list {
		max-height: 400rpx;
		overflow-y: auto;
		margin-bottom: 20rpx;
	}

	.device-item {
		padding: 24rpx;
		background: #f8f9fb;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
		border: 2rpx solid transparent;

		&:active {
			background: #e8eaf0;
		}

		&.active {
			border-color: #667eea;
			background: rgba(102, 126, 234, 0.1);
		}

		text {
			display: block;
			font-size: 28rpx;
			color: #333;

			&.address {
				font-size: 24rpx;
				color: #999;
				margin-top: 8rpx;
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

