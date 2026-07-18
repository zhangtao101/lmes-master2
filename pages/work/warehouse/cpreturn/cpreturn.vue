<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">{{ $t('warehouse.cpReturnTitle') }}</text>
		</view>
		<view class="box-body">
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose"></uni-icons>
						<text class="title">{{ $t('warehouse.returnDetail') }}</text>
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
							<text class="value">--</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.customerName') }}</text>
							<text class="value">--</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.packageNumber') }}</text>
							<text class="value">{{label.number }}</text>
						</view>
						<view class="right">
							<text>{{ $t('warehouse.returnQty') }}</text>
							<text class="value">{{label.number }}</text>
							<!-- <uni-number-box :max="+label.number"
								v-model="returnCount[`returncount_${label.labelCode}`]"></uni-number-box> -->
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
	import scanCode from '/common/scan.js';
	import {
		getCodeType
	} from '/common/util.js'
	export default {
		data() {
			return {
				labelList: [],
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
								title: _this.$t('warehouse.tagInvalid')
							});
						} else if (codeType == CodeType.CP_Label) {
							_this.loadLabelInfo(code);
						} else {
							uni.showToast({
								title: _this.$t('warehouse.tagInvalid')
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
				this.labelList.forEach(label => {
					_labelList.push({
						sortNo: 0,
						productCode: label.productCode,
						productName: label.productName,
						labelCode: label.labelCode,
						number: -label.number,
						createUser: this.$root.currentUser.id,
						createTime: new Date(),
						returnBackType: 1, //固定为1 退货

					})
				});
				const res = await product.returnProduct(_labelList);
				if (res.code == 200) {
					uni.showToast({
						title: _this.$t('warehouse.cpReturnSuccess')
					})
					this.labelList = [];
					this.returnCount = {};
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
