<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">物料退货</text>
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
					<text class="label">标签</text>
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
							<text>物料编号</text>
							<text class="value">{{label.materialCode }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>物料名称</text>
							<text class="value">{{label.materialName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>供应商</text>
							<text class="value">{{label.manufacturerName }}</text>
						</view>
					</view>
					<view class="label-item">
						<!-- <view class="left">
							<text>物料规格</text>
							<text class="value">--</text>
						</view> -->
						<view class="right">
							<text>物料单位</text>
							<text class="value">{{label.unit }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>包装数量</text>
							<text class="value">{{label.packageNumber }}</text>
						</view>
						<view class="right">
							<text>退货数量</text>
							<uni-number-box :max="label.packageNumber"
								v-model="returnCount[`returncount_${label.labelCode}`]"></uni-number-box>
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
				labelList: [],
				returnCount: {},
				labelInput: '',
				labelFocus: false
			}
		},
		onLoad() {
			// this.registerBroadcast()
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
						} else if (codeType == CodeType.WL_Label) {
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
				//动态生成响应式变量
				this.returnCount[`returncount_${code}`] = 0;
				const res = await material.getLabelInfo(code, OperateType.materialReturn);
				if (res.code == 200) {
					this.labelList.push(res.data);
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
				let canSubmit = true;
				this.labelList.forEach(label => {
					if (_this.returnCount[`returncount_${label.labelCode}`] <= 0) {
						canSubmit = false;
						uni.showToast({
							title: '退货数量必须大于0'
						})
						return;
					}
					_labelList.push({
						labelCode: label.labelCode,
						number: -_this.returnCount[`returncount_${label.labelCode}`]
					})
				});
				if (canSubmit) {
					const res = await material.returnMaterial(_labelList);
			if (res.code == 200) {
					uni.showToast({
						title: '已退货',
						icon: 'none'
					})
					this.labelList = [];
					this.returnCount = {};
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
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
</style>