<template>
	<view class="order-on-container">
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xianshiqi" size="18"></uni-icons>
			<text class="common-text">工位：{{workStation.clientCode}}</text>
			<text class="common-right" @click="onWrokStationScan">
				请扫描
			</text>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					工序：
				</text>
				<text class="content-value">
					{{workStation.processName}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					设备：
				</text>
				<text class="content-value">
					{{workStation.equipmentName}}
				</text>
			</view>
		</view>
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-gongdanhao" size="18"></uni-icons>
			<text class="common-text">工单号：{{workSheet.workSheetCode}}</text>
			<text class="common-right" @click="onWorksheetScan">
				扫描或选择
			</text>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					产品编号：
				</text>
				<text class="content-value">
					{{workSheet.productCode}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					产品名称：
				</text>
				<text class="content-value">
					{{workSheet.productName}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					计划数量：
				</text>
				<text class="content-value">
					{{workSheet.workSheetPlanNumber}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					上线数量：
				</text>
				<view class="content-value">
					<uni-number-box :max="workSheet.workSheetPlanNumber" v-model="onlineNumber"></uni-number-box>
				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-2610605" size="18"></uni-icons>
			<text class="common-text">人员校验：</text>
			<text class="common-right" @click="onToWorker">
				校验
			</text>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					校验结果：
				</text>
				<view class="content-value right" :style="userValidate?'color:#4cd964':'color:#dd524d'">
					<uni-icons v-if="userValidate" color="#4cd964" type="checkbox-filled" size="20"></uni-icons>
					<uni-icons v-else color="#dd524d" type="clear" size="20"></uni-icons>
					{{userValidate? '合格':'不合格'}}

				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-shebeidianjian" size="18"></uni-icons>
			<text class="common-text">设备点检：</text>
			<text class="common-right" @click="onDeviceCheck">
				校验
			</text>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					校验结果：
				</text>
				<view class="content-value right" :style="equipmentValidate?'color:#4cd964':'color:#dd524d'">
					<uni-icons v-if="equipmentValidate" color="#4cd964" type="checkbox-filled" size="20"></uni-icons>
					<uni-icons v-else color="#dd524d" type="clear" size="20"></uni-icons>
					{{equipmentValidate? '合格':'不合格'}}

				</view>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-wuliaoguanli-" size="18"></uni-icons>
			<text class="common-text">物料校验：</text>
			<text class="common-right" @click="onMaterialCheck">
				校验
			</text>
		</view>
		<view class="content-container">
			<view class="content-item">
				<view class="content-label">
					校验结果：
				</view>
				<view class="content-value right" :style="materialValidate?'color:#4cd964':'color:#dd524d'">
					<uni-icons v-if="materialValidate" color="#4cd964" type="checkbox-filled" size="20"></uni-icons>
					<uni-icons v-else color="#dd524d" type="clear" size="20"></uni-icons>
					{{materialValidate? '合格':'不合格'}}

				</view>
			</view>
		</view>
		<view class="common-container-header" v-if="false">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xitongcanshu" size="18"></uni-icons>
			<text class="common-text">参数校验：</text>
			<view class="common-right">
				校验
			</view>
		</view>
		<view class="content-container" v-if="false">
			<view class="content-item">
				<view class="content-label">
					校验结果：
				</view>
				<view class="content-value right" :style="paramsValidate?'color:#4cd964':'color:#dd524d'">
					<uni-icons v-if="paramsValidate" color="#4cd964" type="checkbox-filled" size="20"></uni-icons>
					<uni-icons v-else color="#dd524d" type="clear" size="20"></uni-icons>
					{{paramsValidate? '合格':'不合格'}}

				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini" @click="onWorksheetOn">确认进站</button>
		</view>
	</view>
</template>

<script>
	import produce from '/api/produce/produce.js'
	import scanCode from '/common/scan.js'
	export default {
		data() {
			return {
				onlineNumber: 0,
				workStation: {
					clientCode: "",
					processName: "",
					equipmentName: ""
				},
				workSheet: {
					workSheetCode: "",
					productCode: "",
					productName: "",
					workSheetPlanNumber: 0
				},
				userValidate: false,
				equipmentValidate: false,
				materialValidate: false,
				paramsValidate: false
			}
		},
		onLoad(params) {
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
				const _this = this;
				const res = await produce.getByCode(code);
				this.workStation = res.data;
			},
			loadWorksheetInfo: async function(code) {
				const _this = this;
				const res = await produce.getWorksheetByCode(code);
				this.workSheet = res.data;
				this.loadCheckContent(this.workStation.processCode, this.workSheet.workSheetCode);
			},
			loadCheckContent: async function(processCode, workSheetCode) {
				const res = await produce.getDetailByProcessCodeAndWorkSheetCode(processCode, workSheetCode);
				console.log(res);
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
			onWorksheetOn: async function() {
				const res = await produce.changeWorksheet(this.workSheet.workSheetCode, this.workStation
					.equipmentCode, this
					.workStation.lineId, this.workStation.processCode, 1);
				if (res.code === 200) {
					uni.showToast({
						title: "上线成功"
					});
					this.workSheet = {};
					this.workStation = {};
					this.onlineNumber = 0;
				} else {
					uni.showToast({
						title: res.msg
					})
				}
			},
			onToWorker: function() {
				const that = this;
				uni.navigateTo({
					url: `/pages/work/produce/worker/worker?workStation=${encodeURIComponent(JSON.stringify(that.workStation))}&workSheet=${encodeURIComponent(JSON.stringify(that.workSheet))}`
				})
			},
			onDeviceCheck: function() {
				const that = this;
				uni.navigateTo({
					url: `/pages/work/produce/devicecheck/devicecheck?workStation=${encodeURIComponent(JSON.stringify(that.workStation))}`
				})
			},
			onMaterialCheck: function() {
				uni.navigateTo({
					url: `/pages/work/produce/shangliao/shangliao?workStation=${encodeURIComponent(JSON.stringify(this.workStation))}&workSheet=${encodeURIComponent(JSON.stringify(this.workSheet))}`
				})
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

			}

			& .content-value {
				color: var(--uni-text-color);
				display: flex;
				align-items: center;
			}
		}
	}
</style>