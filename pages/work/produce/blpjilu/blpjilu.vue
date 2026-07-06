<template>
	<view class="buliangpin-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">不良品快录
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
					</view>
					<view class="content-value">
						{{workStation.processName}}
					</view>
					<view class="content-label">
						设备：
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
				<text class="common-text">工单号：{{workSheet.workSheetCode}}</text>
				<view class="common-right" @click="onWorksheetScan">
					扫描或选择
				</view>
			</view>
			<view class="content-container">
				<view class="content-item">
					<view class="content-label">
						产品编号：
					</view>
					<view class="content-value">
						{{workSheet.productCode}}
					</view>

				</view>
				<view class="content-item">
					<view class="content-label">
						产品名称：
					</view>
					<view class="content-value">
						{{workSheet.productName}}
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
						不良数量：
					</view>
					<view class="content-value">
						<uni-number-box :max="workSheet.workSheetPlanNumber" v-model="defectNumber"></uni-number-box>
					</view>
				</view>
			</view>
			<view class="defect-container">
				<view class="defect-header">
					<uni-icons type="compose" size="24"></uni-icons>
					<view class="">
						<uni-icons style="margin-right: 20rpx;" color="#fff" type="plus" size="24"
							@click="onAddDefect"></uni-icons>
						<uni-icons color="#fff" type="minus" size="24" @click="onRemoveDefect"></uni-icons>
					</view>
				</view>
				<view class="defect-body" v-for="(defect,idx) in defectDataList">
					<view class="defect-item">
						<text class="content-label">缺陷编号</text>
						<uni-combox :candidates="defectCodeList" placeholder="输入缺陷编号"
							:v-model="defect[`defectCode_${idx+1}`]" @input="onDefectQuery($event,idx)"></uni-combox>
					</view>
					<view class="defect-item">
						<text>缺陷名称</text>
						<text>{{defect[`defectName_${idx+1}`]}}</text>
					</view>
					<view class="defect-item">
						<text>不良数</text>
						<uni-number-box v-model="defect[`defectNumber_${idx+1}`]"></uni-number-box>
					</view>
				</view>
			</view>
			<view class="operator-button" style="margin-top:20rpx">
				<button type="primary" @click="onSubmit" size="mini">确认提交</button>
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
				defectDataList: [{
					defectCode_1: '',
					defectName_1: "",
					defectNumber_1: ''
				}],
				defectNumber: 0,
				defectCode: ''
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
			loadDefectInfo: async function(idx) {
				let defectCode = this.defectDataList[idx][`defectCode_${idx+1}`];
				const res = await produce.fuzzyQuery(defectCode);
				// this.defectList = res.data;
				this.defectCodeList = res.data.map(def => def.defectCode.toLowerCase());
				this.defectList = res.data.filter(def => def.defectCode === defectCode);
				if (this.defectList.length) {
					this.defectDataList[idx][`defectName_${idx+1}`] = this.defectList[0].defectName;
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
			onDefectQuery: function(val, idx) {
				val = val.toUpperCase();
				this.defectDataList[idx][`defectCode_${idx+1}`] = val;
				this.loadDefectInfo(idx);
			},
			onAddDefect: function() {
				const index = this.defectDataList.length + 1;
				const objDefect = {};
				objDefect[`defectCode_${index}`] = '';
				objDefect[`defectName_${index}`] = '';
				objDefect[`defectNumber_${index}`] = '';
				this.defectDataList.push(objDefect)
			},
			onRemoveDefect: function() {
				this.defectDataList.pop();
			},
			onSubmit: async function() {
				const list = [];
				this.defectDataList.forEach((item, idx) => {
					list.push({
						defectCode: item[`defectCode_${idx+1}`],
						defectName: item[`defectName_${idx+1}`],
						defectNumber: item[`defectNumber_${idx+1}`]
					})
				})
				const res = await produce.saveDiscoveryDefect(this.workStation.clientCode, this.workStation
					.processCode, this.workSheet
					.workSheetCode, this.workSheet.subProductCode, this.workSheet.subProductName, this.workSheet
					.productCode, this.workSheet.productName, this.defectNumber, list);
				if (res.code == 200) {
					uni.showToast({
						title: "录入成功"
					})
					this.workSheet = {};
					this.workStation = {};
					this.defectDataList = [];
					this.defectNumber = 0;
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