<template>
	<view class="order-off-container">
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xianshiqi" size="18"></uni-icons>
			<text class="common-text">工位：{{workStation.clientCode}}</text>
			<text class="common-right" @click="onWrokStationScan">
				请扫描
			</text>
		</view>
		<view class="order-container">
			<view class="order-item">
				<uni-row>
					<uni-col :span="4">
						<text class="content-label">
							工序：
						</text>
					</uni-col>
					<uni-col :span="8"> <text class="content-value">
							{{workStation.processName}}
						</text></uni-col>
					<uni-col :span="4">
						<text class="content-label">
							设备：
						</text>
					</uni-col>
					<uni-col :span="8">
						<text class="content-value">
							{{workStation.equipmentName}}
						</text>
					</uni-col>
				</uni-row>
			</view>
		</view>
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-gongdanhao" size="18"></uni-icons>
			<text class="common-text">工单号：</text>
			<text class="common-right" @click="onWorksheetScan">
				扫描或选择
			</text>
		</view>
		<view class="order-container">
			<view class="order-item">
				<text class="content-label">
					产品编号：
				</text>
				<text class="content-value">
					{{workSheet.productCode}}
				</text>
			</view>
			<view class="order-item">
				<text class="content-label">
					产品名称：
				</text>
				<text class="content-value">
					{{workSheet.productName}}
				</text>
			</view>
			<view class="order-item">
				<uni-row>
					<uni-col :span="6">
						<text class="content-label">
							计划数量：
						</text>
					</uni-col>
					<uni-col :span="4"><text class="content-value">
							{{workSheet.workSheetPlanNumber}}
						</text></uni-col>
					<uni-col :span="6">
						<text class="content-label">
							下线数量：
						</text>
					</uni-col>
					<uni-col :span="8">
						<uni-number-box v-model="offlineCount" :max="workSheet.workSheetPlanNumber"></uni-number-box>
					</uni-col>
				</uni-row>

			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" type="spinner-cycle" size="18"></uni-icons>
			<text class="common-text">下线类型</text>
			<view class="common-right">
				<picker range-key="wordName" @change="onTypeChange" :value="index" :range="wordList">
					<view class="uni-input">
						<text>选择</text>
					</view>
				</picker>
			</view>
		</view>
		<view class="order-container">
			<view class="order-item">
				<text class="content-label">
					下线类型：
				</text>
				<text class="content-value">
					{{wordList.length?wordList[index]?.wordName:''}}
				</text>
			</view>
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
			<text class="common-text">物料扣料校准</text>
			<view class="common-right">

			</view>
		</view>
		<view class="order-container" v-for="item in feedList" :key="item.materialCode">
			<view class="order-item">
				<uni-row>
					<uni-col :span="6">
						<text class="content-label">
							料号：
						</text>
					</uni-col>
					<uni-col :span="18">
						<text class="content-value">
							{{item.materialCode}}
						</text>
					</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="6">
						<text class="content-label">
							物料名称：
						</text>
					</uni-col>
					<uni-col :span="18">
						<text class="content-value">
							{{item.materialName}}
						</text>
					</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="6"><text class="content-label">
							使用数量：
						</text></uni-col>
					<uni-col :span="4"><text class="content-value">
							{{item.feedNumber}}
						</text></uni-col>
					<uni-col :span="6">
						<text class="content-label">
							实际用量：
						</text>
					</uni-col>
					<uni-col :span="8">
						<uni-number-box v-model="vModels[`actualnumber_${item.materialCode}`]"
							:max="item.feedNumber"></uni-number-box>
					</uni-col>
				</uni-row>
			</view>
		</view>

		<view class="common-container-header" style="margin-top: 20rpx;">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
			<text class="common-text">人员工时</text>
			<view class="common-right">

			</view>
		</view>
		<view class="order-container">
			<uni-row>
				<uni-col :span="6"><text class="content-label">
						当前工时：
					</text></uni-col>
				<uni-col :span="4"><text class="content-value">
						{{currentUserTime}}H
					</text></uni-col>
				<uni-col :span="6">
					<text class="content-label">
						实际工时：
					</text>
				</uni-col>
				<uni-col :span="8">
					<uni-number-box v-model="actualUserTime" :step="0.1"></uni-number-box>
				</uni-col>
			</uni-row>
		</view>

		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
			<text class="common-text">设备工时</text>
			<view class="common-right">

			</view>
		</view>
		<view class="order-container">
			<uni-row>
				<uni-col :span="6"><text class="content-label">
						当前工时：
					</text></uni-col>
				<uni-col :span="4"><text class="content-value">
						{{currentRunTime}}H
					</text></uni-col>
				<uni-col :span="6">
					<text class="content-label">
						实际工时：
					</text>
				</uni-col>
				<uni-col :span="8">
					<uni-number-box v-model="actualRuntime" :step="0.1"></uni-number-box>
				</uni-col>
			</uni-row>
		</view>
		<view style="padding-bottom: 60rpx;">

		</view>
		<view class="operator-button">
			<button type="primary" size="mini" @click="onSureOffline">确认下线</button>
		</view>
	</view>
</template>

<script>
	import produce from '/api/produce/produce.js'
	import scanCode from '/common/scan.js'
	import {
		ParentCode
	} from '/common/enum.js';
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
				wordList: [],
				index: -1,
				wordCode: '',
				feedList: [],
				offlineCount: 0,
				currentUserTime: 0,
				currentRunTime: 0,
				actualUserTime: 0,
				actualRuntime: 0,
				vModels: {}
			}
		},
		onLoad() {
			const _this = this;
			this.loadWordList();
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
				this.loadFeedList();
				this.loadUserTime();
				this.loadRunTime();
			},
			loadWordList: async function() {
				const res = await produce.listWordListByParentCode(ParentCode);
				this.wordList = res.data || [];
			},
			loadFeedList: async function() {
				const res = await produce.getFeedListByCode(this.workSheet.workSheetCode);
				this.feedList = res.data;
				this.feedList.forEach(item => {
					this.vModels[`actualnumber_${item.materialCode}`] = 0;
				})
			},
			loadUserTime: async function() {
				const res = await produce.getUserTime(this.workSheet.workSheetCode, this.$root.currentUser.userCode);
				this.currentUserTime = res.data || 0;
			},
			loadRunTime: async function() {
				const res = await produce.getRuntime(this.workSheet.workSheetCode);
				this.currentRunTime = res.data || 0;
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
			onTypeChange: function(e) {
				this.index = e.detail.value;
				this.wordCode = this.wordList[this.index].wordCode;
			},
			onSureOffline: async function() {
				if (!this.workStation.clientCode) {
					uni.showToast({
						title: '请扫描工位'
					})
					return;
				}
				if (!this.workSheet.workSheetCode) {
					uni.showToast({
						title: '请扫描工单号'
					})
					return;
				}

				if (!this.wordCode) {
					uni.showToast({
						title: '请选择下线类型'
					})
					return;
				}

				const list = [];
				this.feedList.forEach(item => {
					list.push({
						materialCode: item.materialCode,
						feedNumber: this.vModels[`actualnumber_${item.materialCode}`]
					})
				})
				let opType = 2;
				this.wordCode == 'WGXX' ? 2 : 3;
				const res = await produce.outPutSmkWorksheet(this.workStation.clientCode, this.workSheet.workSheetCode,
					this
					.offlineCount, opType,
					list, this.actualUserTime, this.actualRuntime, this.$root.currentUser.userCode);
				if (res.code == 200) {
					uni.showToast({
						title: "下线成功"
					})
					this.workSheet = {};
					this.workStation = {};
					this.wordCode = '';
					this.feedList = [];
					this.offlineCount = 0;
					this.actualRuntime = 0;
					this.actualUserTime = 0;
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
	.order-off-container {
		padding: 20rpx;

		& .order-container {
			padding: 10rpx 20rpx;

			& .order-item {
				padding: 5rpx 0;

				& .uni-row {
					margin-bottom: 10rpx;
				}
			}
		}

		& .content-value {
			color: var(--uin-text-color);
			flex: 1;
		}
	}
</style>