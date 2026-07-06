<template>
	<view class="worker-container">
		<view class="work-content">
			<view class="work-item">
				<view class="work-label">
					<uni-icons style="margin-right:10rpx" color="#676767" custom-prefix="iconfont" type="icon-xianshiqi"
						size="18"></uni-icons><text>工位：</text>
				</view>
				<text class="work-value">
					{{workStation.clientCode}}
				</text>
			</view>
			<view class="work-item">
				<view class="work-label">
					<uni-icons style="margin-right:10rpx" color="#676767" custom-prefix="iconfont"
						type="icon-shebeidianjian" size="18"></uni-icons>
					<text>设备：</text>
					<text class="work-value">
						{{workStation.equipmentName}}
					</text>
				</view>
				<text class="work-label">
					工序：
				</text>
				<text class="work-value">
					{{workStation.processName}}
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					工单号：
				</text>
				<text class="work-value">
					{{workSheet.workSheetCode}}
				</text>
				<text class="work-label">
					计划数量：
				</text>
				<text class="work-value">
					{{workSheet.workSheetPlanNumber}}
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					产品编号：
				</text>
				<text class="work-value">
					{{workSheet.productCode}}
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					产品名称：
				</text>
				<text class="work-value">
					{{workSheet.productName}}
				</text>
			</view>
		</view>
		<view class="worker-info">
			<view class="common-container-header">
				<uni-icons color="#fff" custom-prefix="iconfont" type="icon-yuangonghuangye" size="18"></uni-icons>
				<text class="common-text">员工卡号：</text>
				<text class="common-right" @click="onWorknumberScan">
					请扫描或输入
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					员工姓名：
				</text>
				<text class="work-value">
					{{workerInfo.perName}}
				</text>
				<text class="work-label">
					所属岗位：
				</text>
				<text class="work-value">
					{{workerInfo.discription}}
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					上工时间：
				</text>
				<text class="work-value">
					{{opTime}}
				</text>
			</view>
		</view>
		<view class="splitor">
		</view>
		<view class="last-record">
			<text class="record-title">前次记录</text>
			<view class="work-item">
				<text class="work-label">
					上工人员：
				</text>
				<text class="work-value">
					{{upRecord.perName}}
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					上工时间：
				</text>
				<text class="work-value">
					{{upRecord.opTime}}
				</text>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini" @click="onWork">确认上工</button>
		</view>
	</view>
</template>

<script>
	import produce from '/api/produce/produce.js'
	import scanCode from '/common/scan.js'
	import {
		formatDate
	} from '/common/util'
	export default {
		data() {
			return {
				workStation: {},
				workSheet: {},
				workNumber: "",
				workerInfo: {},
				opTime: formatDate(new Date()),
				upRecord: {}
			}
		},
		onLoad(params) {
			this.workStation = JSON.parse(decodeURIComponent(params.workStation));
			this.workSheet = JSON.parse(decodeURIComponent(params.workSheet));
			this.loadLastUpInfo();
			const _this = this;
			plus?.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan') // 每次进来先 移除全局自定义事件监听器
					uni.$on('scan', function(code) {
						//扫码成功后的回调，你可以写自己的逻辑代码在这里
						_this.loadWorkerInfo(code);

					})

				}
			})
		},
		destroyed: function() {
			plus?.key.removeEventListener('keydown');
		},
		methods: {
			loadWorkerInfo: async function(code) {
				this.workNumber = code;
				const res = await produce.getUserInfo(code);
				this.workerInfo = res.data;
			},
			loadLastUpInfo: async function() {
				const res = await produce.getLastUserUpInfo(this.workStation.clientCode);
				this.upRecord = res.data;
			},
			onWorknumberScan: function() {
				const _this = this;
				this.loadWorkerInfo('100005')
				// scanCode().then((code) => {
				// 	_this.loadWorkStationInfo(code);
				// }).catch(err => {
				// 	uni.showToast({
				// 		title: err
				// 	})
				// });
			},
			onWork: async function() {
				this.workNumber = '100005';
				if (!this.workNumber) {
					uni.showToast({
						title: '请扫描或输入员工卡号'
					})
					return;
				}
				const res = await produce.userUp(this.workStation.clientCode, this.workNumber);
				if (res.code === 200) {
					uni.showToast({
						title: "上工成功"
					});
					const pages = getCurrentPages();
					const prePages = pages.filter(p => p.route == 'pages/work/produce/worksheeton/worksheeton');
					if (prePages.length >= 1) {
						let prePage = prePages[0];
						prePage.$vm['userValidate'] = true;
					}

					uni.navigateBack({
						up: true
					})
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
	.worker-container {
		padding: 40rpx;

		& .work-item {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding: 10rpx 0;

			& .work-label {
				margin-left: 10rpx;
				// width: 160rpx;
				// flex: 1;
				text-align: right;
				// font-size: 26rpx;
			}

			& .work-value {
				color: var(--uni-text-color);
				margin-left: 10rpx;
				flex: 1;
			}
		}

		& .last-record {

			& .record-title {
				color: var(--uni-color-error);
				font-weight: 600;
			}

		}

	}
</style>