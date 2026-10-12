<template>
	<view class="ware-house-container">
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<uni-icons type="home" color="#fff" size="18"></uni-icons>
						<text>{{ $t('warehouse.requisition') }}{{formCode}}</text>
					</view>
				</view>
				<view class="scan-input-row">
					<input class="scan-input" v-model="formInput" :placeholder="$t('warehouse.requisitionPlaceholder')"
						@confirm="onFormInputConfirm" />
					<view class="scan-btn" @click="onFormScan">
						<uni-icons type="scan" color="#fff" size="16"></uni-icons>
					</view>
				</view>
				<view class="body-header" v-if="formData.details && formData.details.length > 0">
					<scroll-view class="body-scroll" scroll-x="true">
						<view class="body-table">
							<view class="body-header-row body-header-title">
								<view class="body-header-cell">{{ $t('warehouse.materialCodeLabel') }}</view>
								<view class="body-header-cell">{{ $t('warehouse.materialName') }}</view>
								<view class="body-header-cell">{{ $t('warehouse.lineHouseNumber') }}</view>
								<view class="body-header-cell">{{ $t('warehouse.lineLockNumber') }}</view>
								<view class="body-header-cell">{{ $t('warehouse.lineTotalNumber') }}</view>
								<view class="body-header-cell">{{ $t('warehouse.waitReceiveQty') }}</view>
								<view class="body-header-cell">{{ $t('warehouse.receivedQty') }}</view>
							</view>
							<scroll-view class="body-scroll-y" scroll-y="true">
								<view class="body-header-row" v-for="form in formData.details" :key="form.id">
									<view class="body-header-cell">{{form.materialCode}}</view>
									<view class="body-header-cell">{{form.materialName}}</view>
									<view class="body-header-cell">{{form.lineHouseNumber}}</view>
									<view class="body-header-cell">{{form.lineLockNumber}}</view>
									<view class="body-header-cell">{{form.lineTotalNumber}}</view>
									<view class="body-header-cell">{{form.applyNumber}}</view>
									<view class="body-header-cell">{{form.receiveNumber}}</view>
								</view>
							</scroll-view>
						</view>
					</scroll-view>
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
					<input class="scan-input" v-model="labelInput" :focus="labelFocus"
						:placeholder="$t('warehouse.labelPlaceholder')" @confirm="onLabelInputConfirm" />
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

	// 线边仓库位固定值
	const LINE_SIDE_LOCATION = 'KQ056-1';

	export default {
		data() {
			return {
				formCode: "",
				formData: {},
				labelList: [],
				takeCount: {},
				formInput: '',
				labelInput: '',
				labelFocus: false,
				// 操作弹窗判定标记：1 需要弹窗选择，-1 不需要弹窗选择
				checkFlag: -1
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
				await this.handleLabelResult(code);
			},
			// 标签信息处理：先按标签判定操作弹窗，再按选择结果处理
			// skipWindow 为 true 时跳过判定（弹窗中已选择直接出库）
			handleLabelResult: async function(code, skipWindow) {
				const _this = this;
				if (!skipWindow) {
					// 根据标签判定操作弹窗：1 表示需要弹窗选择，-1 表示不需要弹窗选择
					const windowRes = await material.checkLabelWindows(code);
					const windowData = (windowRes && windowRes.code == 200 && windowRes.data) ?
						windowRes.data : {};
					_this.checkFlag = windowData.checkFlag != null ? windowData.checkFlag : -1;
					if (_this.checkFlag == 1) {
						// 需要弹窗：由用户选择线边仓调拨或直接出库
						_this.showOutTypeSelector(code, windowData.labelInfo || {});
						return;
					}
				}
				// 无需弹窗或已选择直接出库：拉取标签信息并入列（与原流程一致）
				const res = await material.getLabelInfo(code, OperateType.materialOut, _this.formCode);
				if (res.code == 200) {
					//动态生成响应式变量
					_this.takeCount[`takecount_${code}`] = res.data.packageNumber;
					_this.labelList.push(res.data)
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			},
			// 操作选择弹窗：线边仓调拨 / 直接出库
			showOutTypeSelector: function(code, labelInfo) {
				const _this = this;
				uni.showActionSheet({
					itemList: [_this.$t('warehouse.lineSideTransfer'), _this.$t('warehouse.directOut')],
					success: function(r) {
						if (r.tapIndex === 0) {
							// 线边仓调拨：按标签数量调拨到线边仓
							_this.onLineSideTransfer(code, labelInfo.packageNumber);
						} else {
							// 直接出库：跳过判定，直接拉取标签信息并入列
							_this.handleLabelResult(code, true);
						}
					}
				});
			},
			// 线边仓调拨：标签码 + 标签数量提交调拨接口
			onLineSideTransfer: function(code, packageNumber) {
				const _this = this;
				material.transfer([{
					labelCode: code,
					number: packageNumber,
					wareLocationCode: LINE_SIDE_LOCATION
				}]).then(function(res) {
					if (res.code == 200) {
						uni.showToast({
							title: res.msg || _this.$t('warehouse.diaoboSuccess'),
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res.msg || _this.$t('warehouse.diaoboFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					uni.showToast({
						title: _this.$t('warehouse.diaoboFail'),
						icon: 'none'
					});
				});
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
				const _this = this;
				setTimeout(function() {
					const code = _this.labelInput.trim();
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

		// 横向滚动：表格总宽超出屏幕时可左右滑动
		.body-scroll {
			width: 100%;
			white-space: nowrap;

			.body-table {
				display: inline-block;
				min-width: 100%;
			}

			// 竖向滚动：明细行超出最大高度时可上下滑动
			.body-scroll-y {
				max-height: 480rpx;
			}
		}

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
			min-width: 200rpx;
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