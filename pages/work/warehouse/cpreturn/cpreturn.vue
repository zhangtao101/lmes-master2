<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">成品退货</text>
		</view>
		<view class="box-body">
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose"></uni-icons>
						<text class="title">退货明细</text>
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
				<view class="label-info-container" v-for="label in labelList" :key="label.labelCode">
					<view class="label-item">
						<view class="left">
							<text>标签号</text>
							<text class="value">{{label.labelCode}}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>产品型号</text>
							<text class="value">{{label.productCode }}</text>
						</view>

					</view>
					<view class="label-item">
						<view class="left">
							<text>产品名称</text>
							<text class="value">{{label.productName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>计划号</text>
							<text class="value">--</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>客户名称</text>
							<text class="value">--</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>包装数量</text>
							<text class="value">{{label.number }}</text>
						</view>
						<view class="right">
							<text>退货数量</text>
							<text class="value">{{label.number }}</text>
							<!-- <uni-number-box :max="+label.number"
								v-model="returnCount[`returncount_${label.labelCode}`]"></uni-number-box> -->
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
								title: "标签无效！"
							});
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
						title: '出错啦',
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
						title: '退货成功'
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