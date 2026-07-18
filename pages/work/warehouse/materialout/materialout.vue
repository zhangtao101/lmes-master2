<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">{{ $t('pages.warehouse.materialout') }}</text>
		</view>
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<uni-icons type="home" color="#fff" size="18"></uni-icons>
						<text>{{ $t('warehouse.requisition') }}{{formCode}}</text>
					</view>
				</view>
			<view class="scan-input-row">
				<input class="scan-input" v-model="formInput" :placeholder="$t('warehouse.requisitionPlaceholder')" @confirm="onFormInputConfirm" />
				<view class="scan-btn" @click="onFormScan">
					<uni-icons type="scan" color="#fff" size="16"></uni-icons>
				</view>
			</view>
				<view class="body-header" v-if="formData.details && formData.details.length > 0">
					<view class="body-header-row body-header-title">
						<view class="body-header-cell">{{ $t('warehouse.materialCode') }}</view>
						<view class="body-header-cell">{{ $t('produce.worksheetoff.materialName') }}</view>
						<view class="body-header-cell">{{ $t('warehouse.waitReceiveQty') }}</view>
						<view class="body-header-cell">{{ $t('warehouse.receivedQty') }}</view>
					</view>
					<view class="body-header-row" v-for="form in formData.details" :key="form.id">
						<view class="body-header-cell">{{form.materialCode}}</view>
						<view class="body-header-cell">{{form.materialName}}</view>
						<view class="body-header-cell">{{form.applyNumber}}</view>
						<view class="body-header-cell">{{form.receiveNumber}}</view>
					</view>
				</view>
			</view>

			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose"></uni-icons>
						<text class="title">{{ $t('warehouse.outboundDetail') }}</text>
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
							<text>{{ $t('warehouse.labelCode') }}</text>
							<text class="value">{{label.labelCode}}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.materialCode') }}</text>
							<text class="value">{{label.materialCode }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="right">
							<text>{{ $t('produce.worksheetoff.materialName') }}</text>
							<text class="value">{{label.materialName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('produce.touliao.supplier') }}</text>
							<text class="value">{{label.manufacturerName }}</text>
						</view>
					</view>
					<view class="label-item">
						<!-- <view class="left">
							<text>{{ $t('warehouse.materialSpec') }}</text>
							<text class="value">--</text>
						</view> -->
						<view class="right">
							<text>{{ $t('produce.touliao.materialUnit') }}</text>
							<text class="value">{{label.unit }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.packageQty') }}</text>
							<text class="value">{{label.packageNumber }}</text>
						</view>
						<view class="right">
							<text>{{ $t('warehouse.receiveQty') }}</text>
							<uni-number-box :max="label.packageNumber"
								v-model="takeCount[`takecount_${label.labelCode}`]"></uni-number-box>
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
	import material from "/api/warehouse/material.js";
	import {
		OperateType,
		OutType
	} from "/common/enum.js";
	import scanCode from '/common/scan.js';
	import {
		getCodeType
	} from "/common/util.js"
	export default {
		data() {
			return {
				formCode: "",
				formData: {},
				labelList: [],
				takeCount: {},
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
								title: this.$t('warehouse.tagInvalid')
							});
						} else if (codeType == CodeType.WL_Label) {
							_this.loadLabelInfo(code);
						} else {
							_this.loadStoreRequisitionInfo(code);
						}
					})
				}
			})
		},
		destroyed: function() {
			plus.key.removeEventListener('keydown');
		},
		methods: {
			loadStoreRequisitionInfo: async function(code) {
				this.formCode = code;
				const res = await material.storeRequisitionInfo(this.formCode);
				if (res.code == 200) {
					this.formData = res.data
			} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}

		},
			loadLabelInfo: async function(code) {
				//动态生成响应式变量
				this.takeCount[`takecount_${code}`] = 0;
				const res = await material.getLabelInfo(code, OperateType.materialOut, this.formCode);
				console.log(res)
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
			// 领料单扫码
			onFormScan: function() {
				const _this = this;
				scanCode().then((code) => {
					_this.formInput = code;
					_this.loadStoreRequisitionInfo(code);
				}).catch(err => {
					uni.showToast({
						title: this.$t('warehouse.error')
					})
				});
			},
		// 领料单输入框回车确认
		onFormInputConfirm: function() {
			this.formInput = '';
			const _this = this;
			setTimeout(function() {
				const code = _this.formInput.trim();
				_this.formInput = '';
				if (code) {
					_this.loadStoreRequisitionInfo(code);
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
						title: this.$t('warehouse.error')
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
				console.log(code);
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
				let canSubmit = true;
				this.labelList.forEach(label => {
					if (_this.takeCount[`takecount_${label.labelCode}`] <= 0) {
						canSubmit = false;
						uni.showToast({
							title: this.$t('warehouse.receiveQtyTip')
						})
						return;
					}
					_labelList.push({
						outType: OutType.common,
						labelCode: label.labelCode,
						number: _this.takeCount[`takecount_${label.labelCode}`]
					})
				});
				if (canSubmit) {
					const res = await material.outForm(this.formCode, _labelList);
					if (res.code == 200) {
						uni.showToast({
							title: this.$t('warehouse.outboundSuccess')
						});
						this.formCode = '';
						this.formData = {};
						this.labelList = [];
						this.takeCount = {};
					} else {
						uni.showToast({
							title: res.msg
						});
					}
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

			&.header-row {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-radius: 12rpx;
				margin-bottom: 8rpx;

				.body-header-cell {
					color: #fff;
					font-weight: bold;
				}
			}
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
