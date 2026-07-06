<template>
	<view class="baogong-container">
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xianshiqi" size="18"></uni-icons>
			<text class="common-text">工位：{{workStation.clientCode}}</text>
			<view class="common-right" @click="onWrokStationScan">
				请扫描
			</view>
		</view>
		<view class="baogong-content">
			<view class="baogong-item">
				<text class="label">工序：</text>
				<text class="value">{{workStation.processName}}</text>
				<text class="label">设备：</text>
				<text class="value">{{workStation.equipmentName}}</text>
			</view>
		</view>
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xianshiqi" size="18"></uni-icons>
			<text class="common-text">模具号：{{steelnet.moldCode}}</text>
			<view class="common-right" @click="onSteelnetScan">
				请扫描
			</view>
		</view>
		<view class="baogong-content">
			<view class="baogong-item">
				<text class="label">模具类型：</text>
				<text class="value">{{steelnet.moldTypeName}}</text>
			</view>
			<view class="baogong-item">
				<text class="label">模具名称：</text>
				<text class="value">{{steelnet.moldName}}</text>
			</view>
			<view class="baogong-item">
				<text class="label">产品编号：</text>
				<text class="value">{{steelnet.productCode}}</text>
			</view>
			<view class="baogong-item">
				<text class="label">产品名称：</text>
				<text class="value">{{steelnet.productName}}</text>
			</view>
		</view>
		<view class="bottom-container">
			<view class="right">
				<button type="primary" size="mini" @click="onSureChange">确认切换</button>
			</view>
		</view>
	</view>
</template>

<script>
	import produce from '/api/produce/produce.js'
	import scanCode from '/common/scan.js';
	export default {
		data() {
			return {
				workStation: {},
				steelnet: {}
			}
		},
		onLoad() {
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan') // 每次进来先 移除全局自定义事件监听器
					uni.$on('scan', function(code) {
						//扫码成功后的回调，你可以写自己的逻辑代码在这里
						_this.loadWorkStationInfo(code);
						this.loadProductInfo(code);
						// const codeType = getCodeType(code);
						// if (codeType == CodeType.KQ) {
						// 	_this.loadWarehouseInfo(code);
						// } else if (codeType == CodeType.WL_Label) {
						// 	_this.loadLabelInfo(code);
						// } else {
						// 	uni.showToast({
						// 		title: "标签无效！"
						// 	});
						// }
					})

				}
			})
		},
		destroyed: function() {
			plus.key.removeEventListener('keydown');
		},
		methods: {
			loadWorkStationInfo: async function(code) {
				const res = await produce.getByCode(code);
				this.workStation = res.data;
			},
			loadProductInfo: async function(code) {
				const res = await produce.getProductInfoBySteelnetCode(code);
				this.steelnet = res.data;
			},
			onWrokStationScan: function() {
				this.loadWorkStationInfo('MNGW-01');
				// scanCode().then((code) => {
				// 	_this.loadWorkStationInfo(code);
				// }).catch(err => {
				// 	uni.showToast({
				// 		title: err
				// 	})
				// });
			},
			onSteelnetScan: function() {
				this.loadProductInfo('MNMJ-01')
				// scanCode().then((code) => {
				// 	_this.loadWorkStationInfo(code);
				// }).catch(err => {
				// 	uni.showToast({
				// 		title: err
				// 	})
				// });
			},
			onSureChange: async function() {
				const res = await produce.changeSteelnet(this.steelnet.moldCode, this.workStation.equipmentCode, this
					.$root.currentUser.userCode);
				if (res.code == 200) {
					uni.showToast({
						title: '切换成功'
					});
					this.workStation = {};
					this.steelnet = {};
				} else {
					uni.showToast({
						title: res.msg
					})
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.baogong-container {
		padding: 20rpx;

		& .baogong-content {
			padding: 30rpx 40rpx;
			background-color: #fff;

			& .baogong-item {
				display: flex;
				padding: 10rpx;
				justify-content: space-between;
				align-items: center;

				& .label {
					width: 140rpx;
				}

				& .value {
					flex: 1;
					color: var(--uni-text-color);

					& span {
						display: flex;
						align-items: center;
					}
				}
			}
		}

		& .scan-box {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			color: var(--uni-text-color-grey);
			align-items: center;
			background: url('/static/images/scan-bg2.jpeg') no-repeat;
			background-position: center;
			height: 500rpx;
			background-color: #fff;
			margin-top: 20rpx;
		}
	}
</style>