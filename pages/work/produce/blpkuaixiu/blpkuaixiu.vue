<template>
	<view class="buliangpin-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">不良品快修
			</view>
		</view>
		<view class="box-content">
			<view class="common-container-header radius">
				<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xianshiqi" size="18"></uni-icons>
				<text class="common-text">工位：{{workStation.clientCode}}</text>
				<view class="common-right" @click="onWrokStationScan">
					请扫描
				</view>
			</view>
			<view class="content-container">
				<view class="content-item">
					<view class="content-label">
						工序：
						<text class="content-value">
							{{workStation.processName}}
						</text>
					</view>
				</view>
				<view class="content-item">
					<view class="content-label">
						设备：<text class="content-value">
							{{workStation.equipmentName}}
						</text>
					</view>

				</view>
			</view>
			<view class="common-container-header radius">
				<uni-icons color="#fff" custom-prefix="iconfont" type="icon-gongdanhao" size="18"></uni-icons>
				<text class="common-text">工单号：{{workSheet.workSheetCode}}</text>
				<view class="common-right" @click="onWorksheetScan">
					扫描或选择
				</view>
			</view>
			<view class="content-container">
				<view class="content-item">
					<view class="content-label">
						产品编号：<text class="content-value">
							{{workSheet.productCode}}
						</text>
					</view>
				</view>
				<view class="content-item">
					<view class="content-label">
						产品名称：<text class="content-value">
							{{workSheet.productName}}
						</text>
					</view>
				</view>
				<view class="content-item">
					<view class="content-label">
						计划数量：
					</view>
					<view class="content-value">
						{{workSheet.workSheetPlanNumber}}
					</view>
					<view class="content-label">
						维修数量：
					</view>
					<view class="content-value">
						<uni-number-box :max="10000" v-model="repairCount"></uni-number-box>
					</view>
				</view>
			</view>
			<view class="defect-container">
				<view class="header">
					<view class="">
						<uni-icons type="compose" size="24"></uni-icons>
						<text>载具码：{{vehicleCode}}</text>
					</view>
					<text @click="onVehicleCodeScan">请扫描</text>
				</view>
				<view class="defect-item">
					<text>维修明细</text>
				</view>
				<view class="defect-box">
					<view class="defect-item">
						<text style="min-width: 120rpx;">不良记录:</text>
						<uni-data-select style="max-width: 480rpx;" v-model="value" :localdata="qrCodeList"
							@change="onQrChange"></uni-data-select>
					</view>
					<view class="defect-list">
						<uni-row>
							<uni-col :span="6">缺陷编号</uni-col>
							<uni-col :span="12">缺陷名称</uni-col>
							<uni-col :span="6">不良数</uni-col>
						</uni-row>
						<uni-row style="border-top:1px solid #fff; padding:10rpx 0;"
							v-for="item in defectRecord.detailList" :key="item.defectCode">
							<uni-col :span="6">{{item.defectCode}}</uni-col>
							<uni-col :span="12">{{item.defectName || '&nbsp;'}}</uni-col>
							<uni-col :span="6">{{item.defectNumber}}</uni-col>
						</uni-row>
					</view>
				</view>
				<view class="defect-item">
					<text>维修物料</text>
					<text style="color: #0099ff;" @click="onOpenDetailPop">物料明细</text>
				</view>
				<view class="defect-item">
					<text>维修结果</text>
					<view>
						<radio-group @change="onResultSelect">
							<label class="radio">
								<radio value="1" style="transform: scale(0.7);" />合格
							</label>
							<label class="radio">
								<radio style="transform: scale(0.7);" value="2" />返工
							</label>
							<label class="radio">
								<radio style="transform: scale(0.7);" value="3" />报废
							</label>
						</radio-group>
					</view>
				</view>
			</view>
			<view class="operator-button">
				<button @click="onSubmit" type="primary" size="mini">确认提交</button>
			</view>
		</view>
		<uni-popup background-color="#fff" ref="popup" type="center">
			<view class="bom-pop-container">
				<view class="common-container-header">
					<uni-icons color="#fff" custom-prefix="iconfont" type="icon-gongdanhao" size="18"></uni-icons>
					<text class="common-text">物料明细</text>

				</view>
				<view class="bom-content-container">
					<view class="bom-content-item" v-for="(item,index) in materialList">
						<uni-row>
							<uni-col :span="4">料号：</uni-col>
							<uni-col :span="4">{{item.materialCode}}</uni-col>
							<uni-col :span="6">物料名称：</uni-col>
							<uni-col :span="10">{{item.materialName}}</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="5">转换数：</uni-col>
							<uni-col :span="3">{{item.conversionFaction}}</uni-col>
							<uni-col :span="6">维修用量：</uni-col>
							<uni-col :span="10">
								<uni-number-box :max="10000"
									v-model="vModels[`usecount_${item.materialCode}`]"></uni-number-box>
							</uni-col>
						</uni-row>
					</view>
					<view class="confirm-button">
						<button type="primary" size="mini" @click="onMaterialConfirm">确认</button>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>

</template>

<script>
	import produce from '/api/produce/produce.js'
	import scanCode from '/common/scan.js'
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
				defectRecordList: [],
				defectRecord: {},
				qrCodeList: [],
				materialList: [],
				vehicleCode: "",
				qrCode: "",
				vModels: {},
				repairResult: 0,
				repairCount: 0
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
				this.loadDefectList();
				this.loadSubProductList();
			},
			loadDefectList: async function() {
				const res = await produce.getListByWorkSheetCode(this.workSheet.workSheetCode);
				this.defectRecordList = res.data;
				res.data.forEach(code => {
					this.qrCodeList.push({
						value: code.productQrCode,
						text: code.productQrCode
					})
				});
			},
			loadSubProductList: async function() {
				const res = await produce.getSubProductListByWorksheetCode(this.workSheet.workSheetCode);
				this.materialList = res.data;
				this.materialList.forEach(item => {
					this.vModels[`usecount_${item.materialCode}`] = 0;
				})
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
			onVehicleCodeScan: function() {
				this.vehicleCode = 'CPWXZJ-01'
				// scanCode().then((code) => {
				// 	_this.loadWorksheetInfo(code);
				// }).catch(err => {
				// 	uni.showToast({
				// 		title: err
				// 	})
				// });
			},
			onOpenDetailPop: function() {
				this.$refs.popup.open();
			},
			onMaterialConfirm: function() {
				this.$refs.popup.close();
			},
			onQrChange: function(val) {
				this.qrCode = val;
				const result = this.defectRecordList.filter(defect => defect.productQrCode == this.qrCode);
				if (result && result.length > 0)
					this.defectRecord = result[0];
			},
			onResultSelect: function(evt) {
				this.repairResult = evt.detail.value;
			},
			onSubmit: async function() {
				if (!this.repairCount) {
					uni.showToast({
						title: "请输入维修数量"
					})
					return;
				}
				if (!this.vehicleCode) {
					uni.showToast({
						title: "请扫描载具码"
					})
					return;
				}
				if (!this.qrCode) {
					uni.showToast({
						title: "请选择不良记录"
					})
					return;
				}
				if (!this.repairResult) {
					uni.showToast({
						title: "请选择维修结果"
					})
					return;
				}
				const defList = [];
				this.defectRecord.detailList.forEach(def => {
					defList.push({
						defectCode: def.defectCode,
						defectName: def.defectName,
						defectNumber: def.defectNumber,
						location: def.location,
					})
				})
				const mList = [];
				this.materialList.forEach(m => {
					mList.push({
						materialCode: m.materialCode,
						materialName: m.materialName,
						conversionFaction: m.conversionFaction,
						number: this.vModels[`usecount_${m.materialCode}`]

					})
				})
				const res = await produce.saveRepair(this.workStation.clientCode, this.qrCode, this.workSheet
					.workSheetCode, this.repairCount, this
					.defectRecord.discoveryProcessCode, this.vehicleCode, this.repairResult, defList, mList);
				if (res.code == 200) {
					uni.showToast({
						title: '提交成功'
					});
					this.workStation = {};
					this.workSheet = {};
					this.repairCount = 0;
					this.qrCode = "";
					this.vehicleCode = "";
					this.defectRecord = {};
					this.repairResult = 0;
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
				justify-content: space-between;
				align-items: center;
				padding: 10rpx 20rpx;
				padding-top: 0;
				position: relative;

				& .right {
					position: absolute;
					right: 20rpx;
				}

				& .content-value {
					color: var(--uni-text-color);
				}

			}
		}

		& .defect-container {
			margin-top: 20rpx;
			background-color: var(--uni-bg-color-grey-deep);
			border-radius: 20rpx;
			padding: 10rpx;
			color: var(--uni-text-color);

			& .header {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			& .defect-box {
				border-top: 1px solid #fff;
				;
			}

			& .defect-item {
				display: flex;
				padding: 10rpx 20rpx;
				align-items: center;
				// width: 400rpx;

				& uni-text {
					margin-right: 20rpx;
				}
			}

			& .defect-list {
				padding: 10rpx 30rpx;
			}
		}
	}

	.bom-pop-container {
		height: 800rpx;
		width: 100%;
		background-color: #fff;
		position: relative;
		overflow-y: auto;

		& .bom-content-container {
			padding: 30rpx;

			& .bom-content-item {
				padding: 20rpx 0;
				border-bottom: 1px solid #333;
			}
		}

		& .confirm-button {
			text-align: center;
			margin-top: 20rpx;
		}
	}
</style>

<style>
	.uni-col {
		text-align: center;
	}

	.uni-stat__select {
		background-color: #fff;
		font-size: 24rpx;
	}

	:deep(.uni-select__input-box),
	:deep(.uni-select__input-text) {
		max-width: 460rpx !important;
	}
</style>