<template>
	<view class="device-check-container">
		<view class="check-device">
			<uni-icons style="margin-right:10rpx" color="#676767" custom-prefix="iconfont" type="icon-xianshiqi"
				size="18"></uni-icons>
			<text class="label">设备编号：</text>
			<text class="value label">1</text>
			<text class="label">设备名称：</text>
			<text class="value label">2设备名称设备名称</text>
			<text class="label">保养计划编号：</text>
			<text class="value label">3</text>
		</view>
		<view class="splitor"></view>
		<view class="check-item-container">
			<view class="check-item">
				<text class="item-left">
					1、保养项1
				</text>
				<text class="item-right">
					范围值：0~6.5
				</text>
			</view>
			<view class="check-item">
				<text class="item-left">
					目测、记录数值、听声
				</text>
				<view class="item-right">
					<uni-easyinput type="digit" v-model="check_item1" :clearable="false"></uni-easyinput>
				</view>
			</view>
		</view>
		<view class="splitor"></view>
		<view class="check-item-container">
			<view class="check-item">
				<text class="item-left">
					2、保养项2
				</text>
				<text class="item-right">
					范围值：0~6.5
				</text>
			</view>
			<view class="check-item">
				<text class="item-left">
					目测、记录数值、手动调整
				</text>
				<view class="item-right">
					<uni-easyinput type="digit" v-model="check_item1" :clearable="false"></uni-easyinput>
				</view>
			</view>
		</view>
		<view class="splitor"></view>
		<view class="check-item-container">
			<view class="check-item">
				<text class="item-left">
					3、保养项3
				</text>
				<text class="item-right">
					操作完成
				</text>
			</view>
			<view class="check-item">
				<text class="item-left">
					完成调试手动检测相关按钮
				</text>
				<view class="item-right">
					<switch style="transform:scale(0.8)" checked color="#4cd964" />
				</view>
			</view>
		</view>
		<view class="splitor"></view>
		<view class="check-item-container">
			<view class="check-item">
				<text class="item-left">
					4、保养项4
				</text>
				<text class="item-right">
					操作完成
				</text>
			</view>
			<view class="check-item">
				<text class="item-left">
					目测、记录数值、手动调整
				</text>
				<view class="item-right">
					<button type="primary" size="mini">{{ $t('common.uploadImage') }}</button>
					<!-- <switch style="transform:scale(0.8)" checked color="#4cd964" /> -->
				</view>
			</view>
		</view>
		<view class="splitor"></view>
		<view class="check-pass">
			<view class="check-item">
				<text class="item-left">
					保养结果：
				</text>
				<view>
					<uni-easyinput></uni-easyinput>
					<!-- <switch style="transform:scale(0.8)" checked color="#4cd964" /> -->
				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini">{{ $t('common.confirm') }}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				check_item1: 0,
				check_item2: 0,
			}
		},
		methods: {

		}
	}
</script>

<style lang="less" scoped>
	.device-check-container {
		padding: 20rpx 0;

		& .check-device {
			padding: 20rpx;
			padding-bottom: 0;
			display: flex;
			align-items: center;
			flex-wrap: wrap;

			& .label {
				margin-bottom: 15rpx;
			}

			& .value {
				margin-right: 20rpx;
				color: var(--uni-text-color);
			}

		}

		& .check-item {
			display: flex;
			align-items: center;
			padding: 10rpx 20rpx;

			& .item-left {
				flex: 1;
			}

			& .item-right {
				width: 200rpx;
				text-align: center;
			}
		}

		& .check-pass {
			border: 1px solid var(--uni-border-color);
			margin: 30rpx 40rpx;
			padding: 20rpx;
		}
	}
</style>