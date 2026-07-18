<template>
	<view class="buliangpin-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">{{ $t('produce.fpkuailu.title') }}
			</view>
		</view>
		<view class="box-content">
			<view class="common-container-header radius">
				<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xianshiqi" size="18"></uni-icons>
				<text class="common-text">{{ $t('ws.workStation') }}{{workStation.clientCode}}</text>
				<view class="common-right" @click="onWrokStationScan">
					{{ $t('common.scan') }}
				</view>
			</view>
			<view class="content-container">
				<view class="content-item">
					<view class="content-label">
						{{ $t('ws.process') }}
					</view>
					<view class="content-value">
						{{workStation.processName}}
					</view>
					<view class="content-label">
						{{ $t('ws.equipment') }}
					</view>
					<view class="content-value">
						{{workStation.equipmentName}}
					</view>
				</view>
				<view class="content-item">

				</view>
			</view>
			<view class="common-container-header radius">
				<uni-icons color="#fff" custom-prefix="iconfont" type="icon-gongdanhao" size="18"></uni-icons>
				<text class="common-text">{{ $t('ws.workSheet') }}{{workSheet.workSheetCode}}</text>
				<view class="common-right" @click="onWorksheetScan">
					{{ $t('common.scanOrSelect') }}
				</view>
			</view>
			<view class="content-container">
				<view class="content-item">
					<view class="content-label">
						{{ $t('ws.productCode') }}
					</view>
					<view class="content-value">
						{{workSheet.productCode}}
					</view>

				</view>
				<view class="content-item">
					<view class="content-label">
						{{ $t('ws.productName') }}
					</view>
					<view class="content-value">
						{{workSheet.productName}}
					</view>
				</view>
				<view class="content-item">
					<view class="content-label">
						{{ $t('ws.planQty') }}
					</view>
					<view class="content-value">
						{{workSheet.workSheetPlanNumber}}
					</view>
					<view class="content-label">
						{{ $t('produce.fpkuailu.wasteQty') }}
					</view>
					<view class="content-value">
						<uni-number-box :max="workSheet.workSheetPlanNumber" v-model="wasteNumber"></uni-number-box>
					</view>
				</view>
			</view>
			<view class="defect-container">
				<view class="defect-header">
					<uni-icons type="compose" size="24"></uni-icons>
				</view>
				<view class="defect-body">
					<view class="defect-item">
						<text class="content-label">{{ $t('produce.blpjilu.defectCode') }}</text>
						<uni-combox :candidates="defectCodeList" :placeholder="$t('produce.blpjilu.defectCodePlaceholder')" :v-model="defectCode"
							@input="onDefectQuery"></uni-combox>
					</view>
					<view class="defect-item">
						<text>{{ $t('produce.blpjilu.defectName') }}</text>
						<text>{{defectName}}</text>
					</view>
				</view>
			</view>
			<view class="operator-button" style="margin-top:20rpx">
				<button type="primary" @click="onSubmit" size="mini">{{ $t('common.confirmSubmit') }}</button>
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
				defectList: [],
				defectCodeList: [],
				wasteNumber: 0,
				defectCode: '',
				defectName: ''
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
			},
			loadDefectInfo: async function() {
				const res = await produce.fuzzyQuery(this.defectCode);
				this.defectCodeList = res.data.map(def => def.defectCode.toLowerCase());
				this.defectList = res.data.filter(def => def.defectCode === this.defectCode);
				if (this.defectList.length) {
					this.defectName = this.defectList[0].defectName;
				}
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
			onDefectQuery: function(val) {
				val = val.toUpperCase();
				this.defectCode = val;
				this.loadDefectInfo();
			},
			onSubmit: async function() {
				if (!this.wasteNumber) {
					uni.showToast({
						title: this.$t('produce.fpkuailu.inputWasteTip')
					})
					return;
				}
				if (!this.defectCode) {
					uni.showToast({
						title: this.$t('produce.fpkuailu.inputWasteTip')
					})
					return;
				}
				const res = await produce.saveWaste(this.workStation.clientCode, this.workSheet
					.workSheetCode, this.defectCode, this.wasteNumber);
				if (res.code == 200) {
					uni.showToast({
						title: this.$t('produce.fpkuailu.success')
					})
					this.workSheet = {};
					this.workStation = {};
					this.defectCode = "";
					this.defectName = "";
					this.wasteNumber = 0;
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
	.buliangpin-container {
		padding: 20rpx;
		background-color: #fff;
		padding-bottom: 100rpx;

		& .box-content {
			padding: 20rpx;
			padding-left: 30rpx;
		}

		& .content-container {
			color: var(--uni-text-color_second);
			padding-top: 20rpx;
			padding-bottom: 10rpx;

			& .content-item {
				display: flex;
				align-items: center;
				padding: 10rpx 0;
				padding-top: 0;
				position: relative;

				& .content-label {
					width: 140rpx;
					margin-left: 20rpx;
				}

				& .content-value {
					color: var(--uni-text-color);
					flex: 1;
				}

				& .right {
					position: absolute;
					right: 20rpx;
				}

			}
		}

		& .defect-container {
			margin-top: 20rpx;

			background-color: var(--uni-color-primary_second);
			border-radius: 20rpx;
			padding: 10rpx;
			padding-bottom: 20rpx;
			color: #fff;

			& .defect-header {
				display: flex;
				justify-content: space-between;
			}

			& .defect-body {
				padding-bottom: 15rpx;
				padding-top: 15rpx;
				border-bottom: 1px solid #fff;

				&:last-child {
					border: none;
				}
			}

			& .defect-item {
				display: flex;
				padding: 0 30rpx;
				align-items: center;
				// width: 400rpx;

				& .uni-combox {
					height: 32rpx;
					line-height: 32rpx;
				}

				& uni-text {
					margin-right: 20rpx;
					width: 200rpx;
				}
			}
		}
	}
</style>
