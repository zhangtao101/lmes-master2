<template>
	<view class="order-on-container">
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-liebiao" size="18"></uni-icons>
			<text class="common-text">当前信息</text>
		</view>
		<view class="content-container">
			<view class="content-item">
				<text class="content-label">
					工序：
				</text>
				<text class="content-value">
					{{workStation.processName}}
				</text>
				<text class="content-label">
					设备：
				</text>
				<text class="content-value">
					{{workStation.equipmentName}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					产品编号：
				</text>
				<text class="content-value">
					{{workSheet.productCode}}
				</text>
				<text class="content-label">
					计划数量：
				</text>
				<text class="content-value">
					{{workSheet.workSheetPlanNumber}}
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
		</view>
		<view class="common-container-header">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
			<text class="common-text">物料上料</text>
			<view class="common-right" @click="onScan">
				扫描
			</view>
		</view>
		<view class="content-container" v-for="item in feedList" :key="item.materialCode">
			<view class="content-item">
				<text class="content-label">
					料号：
				</text>
				<text class="content-value">
					{{item.materialCode}}
				</text>
				<text class="content-label">
					站位：
				</text>
				<text class="content-value">
					{{item.stationCode}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					物料名称：
				</text>
				<text class="content-value">
					{{item.materialName}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					当前数量：
				</text>
				<text class="content-value" :class="{warning:item.feedNumber<item.saveNumber}"
					@click="onOpenJiaoliao(item,item.feedNumber<item.saveNumber)">
					{{item.feedNumber}}
				</text>
				<text class="content-label">
					最小安全数量：
				</text>
				<text class="content-value">
					{{item.safeNumber}}
				</text>
			</view>
		</view>
		<view v-if="jiaoliaoList.length==0">
			<view class="common-container-header">
				<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
				<text class="common-text">扫码记录</text>
				<view class="common-right">

				</view>
			</view>
			<view class="content-container" v-for="item in materialList" :key="item.materialCode">
				<view class="content-item">
					<text class="content-label">
						物料标签：
					</text>
					<text class="content-value">
						{{item.labelCode}}
					</text>
				</view>
				<view class="content-item">
					<text class="content-label">
						料号：
					</text>
					<text class="content-value">
						{{item.materialCode}}
					</text>
					<text class="content-label">
						当前数量：
					</text>
					<text class="content-value">
						{{item.packageNumber}}
					</text>
				</view>
				<view class="content-item">
					<text class="content-label">
						物料名称：
					</text>
					<text class="content-value">
						{{item.materialName}}
					</text>
				</view>
			</view>

		</view>
		<view class="common-container-header" v-if="jiaoliaoList.length">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-erweima" size="18"></uni-icons>
			<text class="common-text">物料叫料</text>
			<view class="common-right">

			</view>
		</view>
		<view class="content-container" v-for="item in jiaoliaoList" :key="item.materialCode">
			<view class="content-item">
				<text class="content-label">
					料号：
				</text>
				<text class="content-value">
					{{item.materialCode}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					物料名称：
				</text>
				<text class="content-value">
					{{item.materialName}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					当前数量：
				</text>
				<text class="content-value">
					{{item.feedNumber}}
				</text>
				<text class="content-label">
					最小安全数量：
				</text>
				<text class="content-value">
					{{item.safeNumber}}
				</text>
			</view>
			<view class="content-item">
				<text class="content-label">
					叫料数量：
				</text>
				<view class="content-value">
					<uni-number-box :max="1000000" v-model="vModel[`takenumber_${item.materialCode}`]"
						:width="100"></uni-number-box>
				</view>
			</view>
		</view>
		<view style="padding-bottom:100rpx;">

		</view>
		<!-- 两个按钮只显示一个，如果存在叫料情况则仅显示叫料按钮 -->
		<view class="operator-button" v-if="jiaoliaoList.length">
			<button type="primary" size="mini" @click="onSureJiaoliao">确认叫料</button>
		</view>
		<view class="operator-button" v-else>
			<button type="primary" size="mini" @click="onSure">
				{{materialList.length?'确认上料':'确认完成'}}
			</button>
		</view>
	</view>
</template>

<script>
	import produce from "/api/produce/produce.js";
	import scanCode from "/common/scan.js";
	export default {
		data() {
			return {
				labelCode: "",
				workStation: {},
				workSheet: {},
				feedList: [],
				jiaoliaoList: [],
				vModel: {},
				materialList: []
			}
		},
		onLoad(params) {
			this.workStation = JSON.parse(decodeURIComponent(params.workStation));
			this.workSheet = JSON.parse(decodeURIComponent(params.workSheet));
			const _this = this;
			plus?.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan') // 每次进来先 移除全局自定义事件监听器
					uni.$on('scan', function(code) {
						this.labelCode = '20210701WL0800';
						//扫码成功后的回调，你可以写自己的逻辑代码在这里
						this.loadMaterialInfo();

					})

				}
			})
		},
		destroyed: function() {
			plus?.key.removeEventListener('keydown');
		},
		onShow() {
			this.loadFeedList();
		},
		methods: {
			loadMaterialInfo: async function() {
				const res = await produce.getMaterialByCode(this.labelCode);
				this.materialList.push(res.data);
			},
			loadFeedList: async function() {
				const res = await produce.getFeedListByCode(this.workSheet.workSheetCode);
				this.feedList = res.data;
			},
			onScan: function() {
				const _this = this;
				// scanCode().then((code) => {
				// _this.labelCode = code;
				// this.loadMaterialInfo();
				// }).catch(err => {
				// 	uni.showToast({
				// 		title: err
				// 	})
				// });
				this.labelCode = "20210701WL0800";
				this.loadMaterialInfo();
			},
			onOpenJiaoliao: function(item, needJl) {
				if (needJl) {
					const exists = this.jiaoliaoList.filter(jl => jl.materialCode == item.materialCode);
					if (exists.length == 0) {
						const jlList = this.feedList.filter(fl => fl.materialCode == item.materialCode);
						this.jiaoliaoList.push(...jlList);
					}

					this.jiaoliaoList.forEach(jl => {
						this.vModel[`takenumber_${jl.materialCode}`] = 0
					})
				}
			},
			onSureJiaoliao: async function() {
				const list = [];
				this.jiaoliaoList.forEach(item => {
					list.push({
						workSheetCode: this.workSheet.workSheetCode,
						materialCode: item.materialCode,
						materialName: item.materialName,
						stouresNumber: this.vModel[`takenumber_${item.materialCode}`]
					});
				})
				const res = await produce.insertStores(list);
				if (res.code === 200) {
					uni.showToast({
						title: "叫料成功"
					});
					this.jiaoliaoList = [];
					const pages = getCurrentPages();
					const prePages = pages.filter(p => p.route == 'pages/work/produce/worksheeton/worksheeton');
					if (prePages.length >= 1) {
						let prePage = prePages[0];
						prePage.$vm['materialValidate'] = false;
					}
					uni.navigateBack()
				} else {
					uni.showToast({
						title: res.msg
					})
				}
			},
			onSure: async function() {
				if (this.materialList.length) { //确认上料
					const list = [];
					this.materialList.forEach(item => {
						list.push({
							labelCode: item.labelCode,
							materialCode: item.materialCode,
							feedNumber: item.packageNumber
						})
					})

					const res = await produce.smkFeedSave(
						this.workStation.equipmentCode,
						this.workSheet.workSheetCode,
						this.$root.currentUser.userName,
						list
					);
					if (res.code == 200) {
						this.loadFeedList();
						this.materialList = [];
						uni.showToast({
							title: "上料完成"
						})
					} else {
						uni.showToast({
							title: res.msg
						})
					}

				} else { //确认完成
					const jlList = this.feedList.filter(fl => fl.feedNumber < fl.saveNumber);
					const pages = getCurrentPages();
					const prePages = pages.filter(p => p.route == 'pages/work/produce/worksheeton/worksheeton');
					if (prePages.length >= 1) {
						let prePage = prePages[0];
						prePage.$vm['materialValidate'] = !jlList.length;
					}
					uni.navigateBack()
				}

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
			margin-bottom: 20rpx;

			& .warning {
				color: var(--uni-color-error);
				font-weight: bold;
			}

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
				}
			}
		}
	}
</style>