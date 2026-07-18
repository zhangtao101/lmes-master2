<template>
	<view class="order-on-container">
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-gongdanhao" size="18"></uni-icons>
			<text class="common-text">{{ $t('ws.workSheet') }}</text>
			<view class="common-right" @click="onScan">
				{{ $t('common.scanOrSelect') }}
			</view>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					{{ $t('ws.process') }}
				</text>
				<text class="content-value">
					123
				</text>
				<text class="content-label">
					{{ $t('ws.equipment') }}
				</text>
				<text class="content-value">
					456
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					{{ $t('ws.productCode') }}
				</text>
				<text class="content-value">
				</text>

			</view>
			<view class="content-item">
				<text class="content-label">
					{{ $t('ws.productName') }}
				</text>
				<text class="content-value">
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					{{ $t('ws.planQty') }}
				</text>
				<text class="content-value">
				</text>
				<text class="content-label">
					{{ $t('produce.worksheetoff.offlineQty') }}
				</text>
				<view class="content-value">
					<uni-number-box :max="10000" v-model="offlineNumber"></uni-number-box>
				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
			<text class="common-text">{{ $t('produce.worksheetoff.materialCalib') }}</text>
			<view class="common-right">
				{{ $t('produce.worksheetout.viewDetail') }}
			</view>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					{{ $t('produce.worksheetoff.materialCode') }}
				</text>
				<text class="content-value">
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					{{ $t('produce.worksheetoff.materialName') }}
				</text>
				<text class="content-value">
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					{{ $t('produce.worksheetoff.usedQty') }}
				</text>
				<text class="content-value">
				</text>
				<text class="content-label">
					{{ $t('produce.worksheetoff.actualQty') }}
				</text>
				<view class="content-value">
					<uni-number-box :max="10000" v-model="take_number"></uni-number-box>
				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-2610605" size="18"></uni-icons>
			<text class="common-text">{{ $t('produce.worksheetoff.userTime') }}</text>
			<view class="common-right">
				{{ $t('produce.worksheetout.viewDetail') }}
			</view>
		</view>
		<view class="content-container">
			<view class="content-item">
				<view class="content-label">
					{{ $t('produce.worksheetoff.currentTime') }}
				</view>
				<view class="content-value right">
					<text>{{ $t('produce.worksheetoff.actualTime') }}</text>
					<uni-easyinput style="width: 60px;"></uni-easyinput>
				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-shebeidianjian" size="18"></uni-icons>
			<text class="common-text">{{ $t('produce.worksheetoff.equipTime') }}</text>
			<view class="common-right">
				{{ $t('produce.worksheetout.viewDetail') }}
			</view>
		</view>
		<view class="content-container">
			<view class="content-item">
				<view class="content-label">
					{{ $t('produce.worksheetoff.currentTime') }}
				</view>
				<view class="content-value right">
					<text>{{ $t('produce.worksheetoff.actualTime') }}</text>
					<uni-easyinput style="width: 60px;"></uni-easyinput>
				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini" @click="onConfirmOut">{{ $t('produce.worksheetout.confirm') }}</button>
		</view>
	</view>
</template>

<script>
	import request from "/api/request.js"
	export default {
		data() {
			return {
				offlineNumber: 0,
				scan_code: ""
			}
		},
		methods: {
			onScan: function() {
				//#ifdef MP-WEIXIN
				uni.authorize({
					scope: 'scope.camera',
					success() {
						// 用户同意授权
						this.scanQRCode();
					},
					fail() {
						// 用户拒绝授权
						uni.showToast({
							title: this.$t('common.scanAuthDenied'),
							icon: 'none'
						});
					}
				});
				//#endif
				this.scanQRCode();
			},
			scanQRCode: function() {
				let _this = this;
				uni.scanCode({
					success(res) {
						if (res.result) {
							// 扫描成功，处理二维码内容
							_this.scan_code = res.result;
							uni.showToast({
								title: res.result,
								icon: 'none'
							});
							// 这里可以进行后续操作，如跳转页面、显示信息等
						} else {
							// 扫描失败
							uni.showToast({
								title: this.$t('common.scanFailed'),
								icon: 'none'
							});
						}
					},
					fail() {
						// 调用相机失败
						uni.showToast({
							title: this.$t('common.cameraFailed'),
							icon: 'none'
						});
					}
				});
			},
			onConfirmOut: function() {
				// 确认出站逻辑
			}


		}
	}
</script>

<style lang="less" scoped>
	.order-on-container {
		padding: 20rpx;

		& .content-container {
			color: var(--uni-text-color_second);
			padding-top: 20rpx;
			padding-bottom: 10rpx;

			& .content-item {
				display: flex;
				align-items: center;
				padding: 10rpx 20rpx;
				padding-top: 0;
				position: relative;

				& .right {
					position: absolute;
					right: 20rpx;
				}

				& .content-value {
					flex: 1;
					white-space: pre-wrap;
					word-break: break-all;
					display: flex;
					align-items: center;
				}
			}
		}
	}
</style>
