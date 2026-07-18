<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">{{ $t('warehouse.cpSendTitle') }}</text>
		</view>
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<uni-icons type="home" color="#fff" size="18"></uni-icons>
						<text>{{ $t('warehouse.shipCode') }}{{shipCode}}</text>
					</view>
				</view>
			<view class="scan-input-row">
				<input class="scan-input" v-model="formInput" :placeholder="$t('warehouse.shipPlaceholder')" @confirm="onFormInputConfirm" />
				<view class="scan-btn" @click="onFormScan">
					<uni-icons type="scan" color="#fff" size="16"></uni-icons>
				</view>
			</view>
			<view class="body-header" v-if="shipList && shipList.length > 0">
				<view class="body-header-row body-header-title">
					<view class="body-header-cell">{{ $t('warehouse.productCode') }}</view>
					<view class="body-header-cell">{{ $t('warehouse.productName') }}</view>
					<view class="body-header-cell">{{ $t('warehouse.waitShipQty') }}</view>
					<view class="body-header-cell">{{ $t('warehouse.shippedQty') }}</view>
				</view>
				<view class="body-header-row" v-for="(ship, idx) in shipList" :key="idx">
					<view class="body-header-cell">{{ship.productCode}}</view>
					<view class="body-header-cell">{{ship.productName}}</view>
					<view class="body-header-cell">{{ship.shipNumber}}</view>
					<view class="body-header-cell">{{ship.hasShipNumber}}</view>
				</view>
			</view>
			</view>

			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose"></uni-icons>
						<text class="title">{{ $t('warehouse.shipDetail') }}</text>
					</view>
				</view>
			<view class="header">
				<view class="left">
					<uni-icons custom-prefix="iconfont" type="icon-tiaoxingma"></uni-icons>
					<text class="label">{{ $t('warehouse.labelColon') }}</text>
				</view>
			</view>
			<view class="scan-input-row">
				<input class="scan-input" v-model="labelInput" :focus="labelFocus" :placeholder="$t('warehouse.labelPlaceholder')" @confirm="onLabelInputConfirm" />
				<view class="scan-btn" @click="onLabelScan">
					<uni-icons type="scan" color="#fff" size="16"></uni-icons>
				</view>
			</view>
				<view class="label-info-container" v-for="label in labelList" :key="label.labelCode">
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.labelNo') }}</text>
							<text class="value">{{label.labelCode}}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.productCode') }}</text>
							<text class="value">{{label.productCode }}</text>
						</view>

					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.productName') }}</text>
							<text class="value">{{label.productName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.planCode') }}</text>
							<text class="value">{{label.planCode }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.customerName') }}</text>
							<text class="value">{{label.customName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.packageNumber') }}</text>
							<text class="value">{{label.number }}</text>
						</view>
						<view class="right">
							<text>{{ $t('warehouse.shipQty') }}</text>
							<text class="value">{{label.number }}</text>
							<!-- <uni-number-box :max="label.number"
								v-model="sendCount[`sendcount_${label.labelCode}`]"></uni-number-box> -->
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini" @click="onSubmit">{{ $t('common.confirmSubmit') }}</button>
		</view>
	</view>
</template>

<script>
	import product from "/api/warehouse/product.js";
	import scanCode from '/common/scan.js'
	import {
		getCodeType
	} from '/common/util.js'
	export default {
		data() {
			return {
				shipCode: "",
				shipList: [],
				labelList: [],
				formInput: '',
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
							uni.showToast({
								title: _this.$t('warehouse.tagInvalid'),
								icon: 'none'
							});
						} else if (codeType == CodeType.CP_Label) {
							_this.loadLabelInfo(code);
						} else {
							_this.loadShipInfo(code);
						}
					})

				}
			})
		},
		destroyed: function() {
			plus.key.removeEventListener('keydown');
		},
		methods: {
			loadShipInfo: async function(code) {
				this.shipCode = code;
				const res = await product.getByShipCode(this.shipCode);
				if (res.code == 200) {
					this.shipList.push(res.data)
				} else {
					uni.showToast({
						title: res.msg,
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
						title: res.msg
					})
				}
				return res;
			},
			// 发货单扫码
			onFormScan: function() {
				const _this = this;
				scanCode().then((code) => {
					_this.formInput = code;
					_this.loadShipInfo(code);
				}).catch(err => {
					uni.showToast({
						title: _this.$t('warehouse.error'),
						icon: 'none'
					})
				});
			},
		// 发货单输入框回车确认
	onFormInputConfirm: function() {
		this.formInput = '';
		const _this = this;
		setTimeout(function() {
			const code = _this.formInput.trim();
			_this.formInput = '';
			if (code) {
				_this.loadShipInfo(code);
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
						title: _this.$t('warehouse.error'),
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
				const _this = this;
				const _labelList = [];
				const _shipCodes = [];
				this.shipList.forEach(ship => {
					_shipCodes.push(ship.shipCode)
				});
				this.labelList.forEach(label => {
					_labelList.push({
						shipCode: "",
						sortNo: 0,
						locationId: 0,
						locationCode: "",
						logicHouseCode: "",
						createUser: this.$root.currentUser.id,
						createTime: new Date(),
						transferFormCode: "",
						productCode: label.productCode,
						productName: label.productName,
						labelCode: label.labelCode,
						number: label.number
					})
				});

				const res = await product.outBound(_shipCodes, _labelList);
				if (res.code == 200) {
					uni.showToast({
						title: _this.$t('warehouse.shipSuccess'),
						icon: 'none'
					})
					this.shipCode = '';
					this.shipList = [];
					this.labelList = [];
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

	.body-header {
		padding: 20rpx 30rpx;
		margin-top: 20rpx;
		background: #fff;

		.body-header-row {
			display: flex;
			padding: 16rpx 0;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			// &.body-header-title {
			// 	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			// 	border-radius: 12rpx;
			// 	margin-bottom: 8rpx;

			// 	.body-header-cell {
			// 		color: #fff;
			// 		font-weight: bold;
			// 	}
			// }
		}

		.body-header-cell {
			flex: 1;
			text-align: center;
			font-size: 26rpx;
			color: #333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			&:first-child {
				text-align: left;
			}

			&:last-child {
				text-align: right;
			}
		}
	}
</style>
