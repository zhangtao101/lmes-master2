<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">成品入库</text>
		</view>
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<uni-icons type="home" color="#fff" size="18"></uni-icons>
						<text>库位：{{wareLocationCode}}</text>
					</view>
				</view>
				<view class="scan-input-row">
					<input class="scan-input" v-model="locationInput" placeholder="请输入或扫描库位" @confirm="onLocationInputConfirm" />
					<view class="scan-btn" @click="onLocationScan">
						<uni-icons type="scan" color="#fff" size="16"></uni-icons>
					</view>
				</view>
				<view class="body">
					<view class="left">
						<text>所属仓库</text>
						<text>{{warehouse.wareLocationName}}</text>
					</view>
					<view class="right">
						<text>所属库区</text>
						<text>{{warehouse.wareAreaName}}</text>
					</view>
				</view>
				<view class="body">
					<view class="left">
						<text>物理仓库</text>
						<text>{{warehouse.warehouseName}}</text>
					</view>
					<view class="right">
						<text>逻辑仓库</text>
						<text>{{logicalWarehoueName}}</text>
					</view>
				</view>
			</view>
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose"></uni-icons>
						<text class="title">入库明细</text>
					</view>
				</view>
			<view class="header">
				<view class="left">
					<uni-icons custom-prefix="iconfont" type="icon-tiaoxingma"></uni-icons>
					<text class="label">标签：</text>
				</view>
			</view>
			<view class="scan-input-row">
				<input class="scan-input" v-model="labelInput" :focus="labelFocus" placeholder="请输入或扫描标签" @confirm="onLabelInputConfirm" />
				<view class="scan-btn" @click="onLabelScan">
					<uni-icons type="scan" color="#fff" size="16"></uni-icons>
				</view>
			</view>
				<view class="label-info-container" v-for="labelInfo in labelList" :key="labelInfo.labelCode">
					<view class="label-item">
						<view class="left">
							<text>标签号</text>
							<text class="value">{{labelInfo.labelCode}}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>产品型号</text>
							<text class="value">{{labelInfo.productCode }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>产品名称</text>
							<text class="value">{{labelInfo.productName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>计划号</text>
							<text class="value">{{labelInfo.planCode}}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>客户名称</text>
							<text class="value">{{labelInfo.customerName}}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>包装数量</text>
							<text class="value">{{labelInfo.number }}</text>
						</view>
						<view class="right">
							<text>入库数量</text>
							<text class="value">{{labelInfo.number }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini" @click="onSubmit">确认提交</button>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import material from '/api/warehouse/material';
	import product from '/api/warehouse/product'

	import {
		retriveLogicalWarehouse,
		formatDate,
		getCodeType
	} from '../../../../common/util.js'

	export default {
		data() {
			return {
				wareLocationCode: '',
				warehouse: {},
				labelList: [],
				logicalWarehoueName: "",
				locationInput: '',
				labelInput: '',
				labelFocus: false
			}
		},
		onLoad() {
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan') // 每次进来先 移除全局自定义事件监听器
					uni.$on('scan', function(code) {
						//扫码成功后的回调，你可以写自己的逻辑代码在这里
						const codeType = getCodeType(code);
						if (codeType == CodeType.KQ) {
							_this.loadWarehouseInfo(code);
						} else if (codeType == CodeType.CP_Label) {
							_this.loadLabelInfo(code);
						} else {
							uni.showToast({
								title: "标签无效！"
							});
						}
					})

				}
			})
		},
		destroyed: function() {
			plus.key.removeEventListener('keydown');
		},
		methods: {
			loadWarehouseInfo: async function(code) {
				this.wareLocationCode = code;
				const resp = await material.getWarehoueInfo(this.wareLocationCode);
				if (resp.code == 200) {
					this.warehouse = resp.data;
					let {
						logicalName
					} = retriveLogicalWarehouse(this.warehouse.remark);
					this.logicalWarehoueName = logicalName;
				} else {
					uni.showToast({
						title: resp.msg,
						icon: 'none'
					})
				}
			},
			loadLabelInfo: async function(code) {
				const res = await product.getProductInfoByLabelCode(code);
				if (res.code == 200) {
					this.labelList.push(res.data)
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
				return res;
			},
			// 库位扫码
			onLocationScan: function() {
				const _this = this;
				scanCode().then((code) => {
					_this.locationInput = code;
					_this.loadWarehouseInfo(code);
				}).catch(err => {
					uni.showToast({
						title: err
					})
				});
			},
		// 库位输入框回车确认
	onLocationInputConfirm: function() {
		this.locationInput = '';
		const _this = this;
		setTimeout(function() {
			const code = _this.locationInput.trim();
			_this.locationInput = '';
			if (code) {
				_this.loadWarehouseInfo(code);
			}
		}, 200);
	},
			// 标签扫码
			onLabelScan: function() {
				const _this = this;
				scanCode().then((code) => {
					_this.labelInput = code;
					_this.loadLabelInfo(code);
				}).catch(err => {
					uni.showToast({
						title: err,
						icon: 'none'
					})
				});
			},
		// 标签输入框回车确认
	onLabelInputConfirm: function() {
		this.labelInput = '';
		const _this = this;
		setTimeout(function() {
			const code = _this.labelInput.trim();
			_this.labelInput = '';
			if (code) {
				_this.loadLabelInfo(code).then(function() {
					// 接口调用完成后清空输入框并重新获取焦点
					_this.labelInput = '';
					_this.labelFocus = false;
					_this.$nextTick(function() {
						_this.labelFocus = true;
					});
				});
			}
		}, 200);
	},
			onSubmit: async function() {
				const _labelList = [];
				const _this = this;
				let {
					logicalCode
				} = retriveLogicalWarehouse(_this.warehouse.remark);
				this.labelList.forEach(label => {
					_labelList.push({
						sortNo: "",
						productCode: label.productCode,
						productName: label.productName,
						labelCode: label.labelCode,
						number: label.number,
						locationId: _this.warehouse.warehouseId,
						locationCode: _this.wareLocationCode,
						logicHouseCode: logicalCode,
						createUser: this.$root.currentUser.id,
						createTime: new Date(),
						transferFormCode: ""
					})
				})
				const res = await product.inbound(_labelList);
				if (res.code == 200) {
					uni.showToast({
						title: '入库成功',
						icon: 'none'
					})
					this.wareLocationCode = '';
					this.warehouse = {};
					this.labelList = [];
					this.logicalWarehoueName = "";
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}

			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";
	@import "@/static/styles/warehouse-common.less";

	.scan-input-row {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		gap: 16rpx;
		background: rgba(255, 255, 255, 0.1);

		.scan-input {
			flex: 1;
			height: 72rpx;
			padding: 0 24rpx;
			background: #fff;
			border-radius: 12rpx;
			font-size: 28rpx;
			border: 2rpx solid #e8eaf0;
		}

		.scan-btn {
			width: 72rpx;
			height: 72rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}
	}
</style>