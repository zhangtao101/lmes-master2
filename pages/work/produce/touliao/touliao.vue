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
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
			<text class="common-text">物料上料</text>
			<view class="common-right" @click="onMaterialScan">
				扫描
			</view>
		</view>
		<view class="baogong-content" style="margin-bottom:20rpx;" v-for="item in materialList"
			:key="item.materialCode">
			<view class="baogong-item">
				<text class="label">
					物料标签：
				</text>
				<text class="value">
					{{item.labelCode}}
				</text>
				<text class="label">
					料号：
				</text>
				<text class="value">
					{{item.materialCode}}
				</text>
			</view>
			<view class="baogong-item">
				<text class="label">
					物料名称：
				</text>
				<text class="value">
					{{item.materialName}}
				</text>
			</view>
			<view class="baogong-item">
				<text class="label">
					当前数量：
				</text>
				<text class="value">
					{{item.packageNumber }}
				</text>
				<text class="label">
					物料单位：
				</text>
				<text class="value">
					{{item.unit }}
				</text>
			</view>
			<view class="baogong-item">
				<text class="label">
					供应商：
				</text>
				<text class="value">
					{{item.manufacturerName }}
				</text>
			</view>
			<view class="baogong-item">
				<text class="label">
					上料数量：
				</text>
				<view class="value">
					<uni-number-box :max="1000000" v-model="vModel[`takenumber_${item.materialCode}`]"
						:width="100"></uni-number-box>
				</view>
			</view>
		</view>
		<view class="bottom-container">
			<!-- <view class="left">
				<uni-icons type="redo"></uni-icons>
				<text>跳转操作</text>
			</view> -->
			<view class="right">
				<button type="primary" size="mini" @click="onSureTouliao">确认投料</button>
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
				bgUser: this.$root.currentUser,
				materialList: [],
				vModel: {}
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
						_this.loadMaterialInfo(code);
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
			loadMaterialInfo: async function(code) {
				const res = await produce.getMaterialByCode(code);
				const exists = this.materialList.filter(item => item.materialCode == res.data.materialCode);
				if (exists.length) {
					uni.showToast({
						title: "不能重复扫描"
					})
					return;
				}
				this.vModel[`takenumber_${res.data.materialCode}`] = 0;
				this.materialList.push(res.data);
			},
			onMaterialScan: function() {
				const _this = this;
				_this.loadMaterialInfo('20210701WL0800');
				// scanCode().then((code) => {
				// 	_this.loadWorkStationInfo(code);
				// }).catch(err => {
				// 	uni.showToast({
				// 		title: err
				// 	})
				// });
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
			onSureTouliao: async function() {
				const list = [];
				this.materialList.forEach(item => {
					list.push({
						labelCode: item.labelCode,
						materialCode: item.materialCode,
						feedNumber: this.vModel[`takenumber_${item.materialCode}`]
					})
				})
				const res = await produce.smkFeedSave(
					this.workStation.equipmentCode,
					this.workSheet.workSheetCode,
					this.$root.currentUser.userName,
					list
				);
				if (res.code == 200) {
					this.materialList = [];
					this.workSheet = {};
					this.workStation = {};
					uni.showToast({
						title: "已投料"
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
	.baogong-container {
		padding: 20rpx;

		& .baogong-content {
			padding: 10rpx 20rpx;
			background-color: #fff;

			& .baogong-item {
				display: flex;
				padding: 10rpx;
				justify-content: space-between;
				align-items: center;


				& .value {
					color: var(--uni-text-color);
					flex: 1;

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