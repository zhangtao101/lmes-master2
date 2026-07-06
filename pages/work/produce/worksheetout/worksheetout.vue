<template>
	<view class="order-on-container">
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-gongdanhao" size="18"></uni-icons>
			<text class="common-text">工单号:</text>
			<view class="common-right" @click="onScan">
				请扫描或选择
			</view>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					工序：
				</text>
				<text class="content-value">
					123
				</text>
				<text class="content-label">
					设备：
				</text>
				<text class="content-value">
					456
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					产品编号：
				</text>
				<text class="content-value">
				</text>

			</view>
			<view class="content-item">
				<text class="content-label">
					产品名称：
				</text>
				<text class="content-value">
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					计划数量：
				</text>
				<text class="content-value">
				</text>
				<text class="content-label">
					下线数量：
				</text>
				<view class="content-value">
					<uni-number-box :max="10000" v-model="offlineNumber"></uni-number-box>
				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
			<text class="common-text">物料扣料校准</text>
			<view class="common-right">
				查看明细
			</view>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					料号：
				</text>
				<text class="content-value">
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					物料名称：
				</text>
				<text class="content-value">
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					使用数量：
				</text>
				<text class="content-value">
				</text>
				<text class="content-label">
					实际用量：
				</text>
				<view class="content-value">
					<uni-number-box :max="10000" v-model="take_number"></uni-number-box>
				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-2610605" size="18"></uni-icons>
			<text class="common-text">人员工时</text>
			<view class="common-right">
				查看明细
			</view>
		</view>
		<view class="content-container">
			<view class="content-item">
				<view class="content-label">
					当前工时：
				</view>
				<view class="content-value right">
					<text>实际工时：</text>
					<uni-easyinput style="width: 60px;"></uni-easyinput>
				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-shebeidianjian" size="18"></uni-icons>
			<text class="common-text">设备工时</text>
			<view class="common-right">
				查看明细
			</view>
		</view>
		<view class="content-container">
			<view class="content-item">
				<view class="content-label">
					当前工时：
				</view>
				<view class="content-value right">
					<text>实际工时：</text>
					<uni-easyinput style="width: 60px;"></uni-easyinput>
				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini">确认出站</button>
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
							title: '您拒绝了授权',
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
								title: '扫描失败',
								icon: 'none'
							});
						}
					},
					fail() {
						// 调用相机失败
						uni.showToast({
							title: '调用相机失败',
							icon: 'none'
						});
					}
				});
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