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
			<text class="common-text">工单号：{{workSheet.workSheetCode}}</text>
			<view class="common-right" @click="onWorksheetScan">
				请扫描
			</view>
		</view>
		<view class="baogong-content">
			<view class="baogong-item">
				<text class="label">产品编号：</text>
				<text class="value">{{workSheet.productCode}}</text>
			</view>
			<view class="baogong-item">
				<text class="label">产品名称：</text>
				<text class="value">{{workSheet.productName}}</text>
			</view>
			<view class="baogong-item">
				<text class="label">报工数量</text>
				<text class="value">
					<uni-number-box :max="10000" v-model="bgCount"></uni-number-box>
				</text>
			</view>
		</view>
		<view class="baogong-content second">
			<view class="baogong-item">
				<text class="label">报工人</text>
				<text class="value">{{bgUser.userName}}</text>
			</view>
			<!-- <view class="baogong-item">
				<text class="label">工单/跟踪标签</text>
				<text class="value">
					请扫描或选择
					<uni-icons color="#007aff" type="forward" size="18"></uni-icons>
				</text>
			</view> -->
		</view>
		<view class="bottom-container">
			<view class="left">
				<!-- <uni-icons type="redo"></uni-icons>
				<text>跳转操作</text> -->
			</view>
			<view class="right">
				<button type="primary" size="mini" @click="onBaogong">报工</button>
			</view>
		</view>
	</view>
</template>

<script>
	import produce from '/api/produce/produce.js'
	import scanCode from '/common/scan.js'
	export default {
		data() {
			return {
				workStation: {},
				workSheet: {},
				bgCount: 0,
				bgUser: {}
			}
		},
		onLoad() {
			this.bgUser = uni.getStorageSync("user")
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan') // 每次进来先 移除全局自定义事件监听器
					uni.$on('scan', function(code) {
						//扫码成功后的回调，你可以写自己的逻辑代码在这里
						_this.loadWorkStationInfo(code);
						_this.loadWorksheetInfo(code);
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
			loadWorksheetInfo: async function(code) {
				const res = await produce.getWorksheetByCode(code);
				this.workSheet = res.data;
			},
			onWrokStationScan: function() {
				const _this = this;
				_this.loadWorkStationInfo('MNGW-01');
				// scanCode().then((code) => {
				// 	_this.loadWorkStationInfo(code);
				// }).catch(err => {
				// 	uni.showToast({
				// 		title: err
				// 	})
				// });

			},
			onWorksheetScan: function() {
				const _this = this;
				_this.loadWorksheetInfo('2024052701');
				// scanCode().then((code) => {
				// 	_this.loadWorksheetInfo(code);
				// }).catch(err => {
				// 	uni.showToast({
				// 		title: err
				// 	})
				// });
			},
			onBaogong: async function() {
				if (!this.bgCount) {
					uni.showToast({
						title: '请输入报工数量'
					})
					return;
				}
				const res = await produce.insertWorkReport(this.workSheet.workSheetCode, this.bgCount, this.bgUser
					.userCode, 0);
				if (res.code == 200) {
					uni.showToast({
						title: "报工成功！"
					});
					this.workSheet = {};
					this.workStation = {};
					this.bgCount = 0;
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

				& .value {
					color: var(--uni-text-color);

					& span {
						display: flex;
						align-items: center;
					}
				}
			}

			&.second {
				margin-top: 20rpx;

				& .baogong-item:first-child {
					border-bottom: 1px solid var(--uni-border-color);
					padding-bottom: 20rpx;
				}

				& .baogong-item:last-child {
					padding-top: 20rpx;
				}
			}
		}
	}
</style>