<template>
	<view class="ware-house-container">
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<uni-icons type="home" color="#fff" size="18"></uni-icons>
							<text>{{$t('warehouse.storageCodeColon')}}</text>
							<uni-easyinput v-model="wareLocationCode" :inputBorder="false"
								placeholderStyle="color: #999;" @confirm="onManualInput"
								class="warehouse-input"></uni-easyinput>
						</view>
					</view>
					<view class="right" @click="onLocationScan">
						<uni-icons type="scan" color="#fff" size="16"></uni-icons>
						<text>{{$t('warehouse.pleaseScan')}}</text>
					</view>
				</view>
				<view class="info-grid">
					<view class="info-item">
						<view class="label">{{$t('warehouse.code')}}</view>
						<view class="value">{{warehouse.materialCode || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">{{$t('warehouse.materialName')}}</view>
						<view class="value">{{warehouse.materialName || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">{{$t('warehouse.demandQty')}}</view>
						<view class="value highlight">{{warehouse.formNumber || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">{{ type == 1 ? $t('warehouse.inQty') : $t('warehouse.pickupQty') }}</view>
						<view class="value success">{{warehouse.opNumber || '--'}}</view>
					</view>
				</view>
			</view>
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose" color="#fff" size="16"></uni-icons>
						<text class="title"> {{ type == 1 ? $t('warehouse.inDetail') : $t('warehouse.outDetail') }}</text>
						<text class="count">({{labelList.length}})</text>
					</view>
				</view>
				<view class="label-list" v-if="labelList.length > 0">
					<view class="label-card" v-for="(labelInfo, index) in labelList" :key="index">
						<view class="card-header">
							<view class="left">
								<view class="index">{{index + 1}}</view>
								<view class="label-code-wrapper">
									<uni-easyinput v-model="labelInfo.labelCode" :inputBorder="false"
										placeholderStyle="color: #999;" @confirm="onLabelManualInput(labelInfo)"
										:disabled="!wareLocationCode" class="label-input"
										:class="{ disabled: !wareLocationCode }"
										:placeholder="$t('warehouse.labelCodePlaceholder2')"></uni-easyinput>
								</view>
							</view>
							<view class="scan-btn" :class="{ disabled: !wareLocationCode }"
								@click="onLabelScan(labelInfo)">
								<uni-icons type="scan" size="16"></uni-icons>
								<text>{{ $t('common.scan') }}</text>
							</view>
						</view>
						<view class="card-body">
							<view class="info-row-group">
								<view class="info-row">
								<text class="label">{{$t('warehouse.code')}}：</text>
								<text class="value">{{labelInfo.materialCode || '--'}}</text>
							</view>
							<view class="info-row">
								<text class="label">{{$t('warehouse.materialName')}}：</text>
								<text class="value">{{labelInfo.materialName || '--'}}</text>
							</view>
						</view>
						<view class="info-row-group">
							<view class="info-row">
								<text class="label">{{$t('warehouse.batchCode')}}：</text>
								<text class="value">{{labelInfo.batchCode || '--'}}</text>
							</view>
							<view class="info-row">
								<text class="label">{{$t('warehouse.qtyColon')}}</text>
									<input class="uni-input number-input" type="digit" v-model="labelInfo.number"
										:placeholder="$t('warehouse.qtyInputPlaceholder')" />
								</view>
							</view>
						</view>
						<view class="card-footer">
							<view class="delete-btn" @click="removeLabel(index)">
								<uni-icons type="trash" size="20" color="#fff"></uni-icons>
								<text>{{$t('warehouse.delete')}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
					<text>{{$t('warehouse.noDetail')}}</text>
				</view>
				<view class="add-btn-wrapper">
					<button class="add-btn" @click="addRow">
						<uni-icons type="plus" size="16" color="#fff"></uni-icons>
						<text>{{ type == 1 ? $t('warehouse.addInItem') : $t('warehouse.addOutItem') }}</text>
					</button>
				</view>
			</view>
		</view>
		<view class="submit-btn-wrapper">
			<button class="submit-btn" type="primary" :class="{ disabled: isSubmitting || isReturning }"
				@click="shelfReturn">
				<uni-icons type="loop" size="18"></uni-icons>
				<text>{{ isReturning ? $t('warehouse.returning') : $t('warehouse.shelfReturn') }}</text>
			</button>
			<button class="submit-btn" type="primary" :class="{ disabled: isSubmitting || isReturning }"
				@click="onSubmit">
				<uni-icons type="checkmarkempty" size="18"></uni-icons>
				<text>{{ isSubmitting ? $t('warehouse.returning') : $t('warehouse.confirmSubmit') }}</text>
			</button>
		</view>
		<view class="loading-mask" v-if="isLoading">
			<view class="loading-content">
				<uni-icons type="spinner-cycle" size="40" color="#667eea" class="loading-icon"></uni-icons>
				<text class="loading-text">{{$t('warehouse.loading')}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import material from '/api/warehouse/material';
	import {
		CodeType
	} from "/common/enum.js"
	import {
		retriveLogicalWarehouse,
		getCodeType
	} from '/common/util.js'
	import showBeautyToast from '@/common/beautyToast.js'
	export default {
		data() {
			return {
				wareLocationCode: '',
				lcCode: '',
				warehouse: {},
				labelList: [],
				formDetailId: "",
				type: 1,
				isSubmitting: false,
				isReturning: false,
				isLoading: false,
			}
		},
		onLoad(options) {
			this.formDetailId = options.formDetailId;
			this.type = options.type;
			this.lcCode = options.lcCode;
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan') // 每次进来先 移除全局自定义事件监听器
					uni.$on('scan', function(code) {
						//扫码成功后的回调，你可以写自己的逻辑代码在这里
						const codeType = getCodeType(code);
						if (codeType == CodeType.KQ) {
							_this.loadWarehouseInfo(code);
						} else if (codeType == CodeType.WL_Label) {
							_this.loadLabelInfo(code, _this.currentLabelItem || {});
						} else {
							showBeautyToast({
								title: this.$t('warehouse.tagInvalid'),
								icon: 'error'
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
			onManualInput: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.wareLocationCode) {
						_this.loadWarehouseInfo(_this.wareLocationCode);
					}
				}, 200);
			},
			loadWarehouseInfo: async function(code) {
				this.isLoading = true;
				this.wareLocationCode = code;
				const resp = await material.getDetailByStorageCode({
					storageCode: this.wareLocationCode,
					formDetailId: this.formDetailId
				});
				this.isLoading = false;
				if (resp.code == 200) {
					this.warehouse = resp.data;
				} else {
					showBeautyToast({
						title: resp.msg,
						icon: 'error'
					})
				}

			},
			loadLabelInfo: async function(labelCode, item) {
				this.isLoading = true;
				const params = {
					formDetailId: this.formDetailId,
					storageCode: this.wareLocationCode,
					labelCode,
				};
				const res = await (this.type == 1 ? material.getEnterDetailByLabelCode(params) : material
					.getOutDetailByLabelCode(params));
				this.isLoading = false;

				if (res.code == 200) {
					const {
						data
					} = res;
					item.labelCode = data.labelCode;
					item.materialCode = data.materialCode;
					item.materialName = data.materialName;
					item.batchCode = data.batchCode;
					item.number = data.number;
				} else {
					showBeautyToast({
						title: res.msg,
						icon: 'error'
					})
				}
			},
			onLabelManualInput(item) {
				const _this = this;
				setTimeout(function() {
					_this.loadLabelInfo(item.labelCode, item);
				}, 200);
			},
			onLocationScan: function() {
				const _this = this;
				// _this.loadWarehouseInfo("KQ001-1");
				scanCode().then((code) => {
					_this.loadWarehouseInfo(code);
				}).catch(err => {
					showBeautyToast({
						title: err,
						icon: 'warn'
					})
				});
			},
			onLabelScan: function(item) {
				if (!this.wareLocationCode) {
					showBeautyToast({
						title: this.$t('warehouse.scanLocationFirst'),
						icon: 'warn'
					});
					return;
				}
				const _this = this;
				scanCode().then((labelCode) => {
					_this.loadLabelInfo(labelCode, item)
				}).catch(err => {
					showBeautyToast({
						title: err,
						icon: 'warn'
					})
				});
			},
			onSubmit: async function() {
				// 防止重复点击
				if (this.isSubmitting || this.isReturning) {
					return;
				}

				// 验证储位码
				if (!this.wareLocationCode) {
					showBeautyToast({
						title: this.$t('warehouse.scanStorageFirst'),
						icon: 'warn'
					})
					return;
				}
				// 验证明细数据
				if (this.labelList.length === 0) {
					showBeautyToast({
						title: this.$t('warehouse.addDetailFirst'),
						icon: 'warn'
					})
					return;
				}
				// 验证每个明细的完整性和数量
				for (let i = 0; i < this.labelList.length; i++) {
					const label = this.labelList[i];
					if (!label.labelCode) {
						showBeautyToast({
							title: this.$t('warehouse.detailNoLabel', { index: i + 1 }),
							icon: 'warn'
						})
						return;
					}
					if (!label.number || label.number <= 0) {
						showBeautyToast({
							title: this.$t('warehouse.detailInvalidQty', { index: i + 1 }),
							icon: 'warn'
						})
						return;
					}
				}

				// 开始提交
				this.isSubmitting = true;
				const _labelList = [];
				this.labelList.forEach(label => {
					_labelList.push({
						labelCode: label.labelCode,
						number: label.number
					})
				})
				const params = {
					formDetailId: this.formDetailId,
					storageCode: this.wareLocationCode,
					opType: this.type, // 1: 放入; -1: 取出,
					labelCodes: _labelList
				};

				try {
					const res = await material.labelEnout(params);

					if (res.code == 200) {
						showBeautyToast({
							title: this.type == 1 ? this.$t('warehouse.inboundSuccess') : this.$t('warehouse.outboundSuccess'),
							icon: 'success'
						})
						// 清空当前页面数据
						this.wareLocationCode = '';
						this.warehouse = {};
						this.labelList = [];
					} else {
						showBeautyToast({
							title: res.msg,
							icon: 'error'
						})
					}
				} finally {
					this.isSubmitting = false;
				}
			},
			shelfReturn: async function() {
				// 防止重复点击
				if (this.isSubmitting || this.isReturning) {
					return;
				}

				if (!this.wareLocationCode) {
				showBeautyToast({
					title: this.$t('warehouse.scanStorageFirst'),
					icon: 'warn'
				})
					return;
				}

				// 开始回库
				this.isReturning = true;
				try {
					const res = await material.returnContainer({
						formDetailId: this.formDetailId,
						storageCode: this.wareLocationCode,
						lcCode: this.lcCode,
					});
					if (res.code == 200) {
						showBeautyToast({
							title: this.$t('warehouse.shelfReturnSuccess'),
							icon: 'success'
						})
						// 清空当前页面数据
						this.wareLocationCode = '';
						this.warehouse = {};
						this.labelList = [];
					} else {
						showBeautyToast({
							title: res.msg,
							icon: 'error'
						})
					}
				} finally {
					this.isReturning = false;
				}
			},
			addRow: function() {
				this.labelList.push({})
			},
			removeLabel: function(index) {
				this.labelList.splice(index, 1)
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";

	.ware-house-container {
		background: #f5f7fa;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	.box-body {
		padding: 20rpx;
	}

	.warehouse-info {
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		margin-bottom: 30rpx;

		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 20rpx;

			.left {
				display: flex;
				align-items: center;
				gap: 16rpx;
				flex: 1;
				min-width: 0;

				.input-group {
					display: flex;
					align-items: center;
					gap: 16rpx;
					flex: 1;
					min-width: 0;

					text {
						color: #fff;
						font-size: 28rpx;
						font-weight: 500;
						white-space: nowrap;
					}

					.warehouse-input {
						flex: 1;
						min-width: 0;
						background: rgba(255, 255, 255, 0.2);
						border-radius: 16rpx;
						padding: 16rpx 20rpx;

						::v-deep .uni-easyinput__content {
							background: transparent !important;
							padding: 0 !important;
							height: auto !important;
							min-height: auto !important;
						}

						::v-deep .uni-easyinput__content-input {
							font-size: 28rpx;
							color: #fff;
						}

						::v-deep .uni-easyinput__placeholder-class {
							color: rgba(255, 255, 255, 0.85);
						}
					}
				}

				text {
					color: #fff;
					font-size: 28rpx;
					font-weight: 500;
				}
			}

			.right {
				background: rgba(255, 255, 255, 0.2);
				padding: 12rpx 24rpx;
				border-radius: 32rpx;
				display: flex;
				align-items: center;
				gap: 8rpx;

				text {
					color: #fff;
					font-size: 24rpx;
				}

				&:active {
					background: rgba(255, 255, 255, 0.3);
				}
			}
		}

		.info-grid {
			padding: 30rpx;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 30rpx;

			.info-item {
				background: #f8f9fb;
				padding: 24rpx;
				border-radius: 16rpx;

				.label {
					font-size: 24rpx;
					color: #999;
					margin-bottom: 12rpx;
				}

				.value {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
					word-break: break-all;

					&.highlight {
						color: #667eea;
						font-weight: bold;
					}

					&.success {
						color: #52c41a;
						font-weight: bold;
					}

					&.number {
						font-size: 32rpx;
					}
				}
			}
		}
	}

	.warehouse-detail {
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 30rpx;

			.left {
				display: flex;
				align-items: center;
				gap: 12rpx;

				.title {
					font-size: 28rpx;
					font-weight: 500;
					color: #fff;
				}

				.count {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.8);
				}
			}
		}

		.label-list {
			padding: 20rpx;
		}

		.label-card {
			background: #f8f9fb;
			border-radius: 16rpx;
			margin-bottom: 20rpx;
			overflow: hidden;
			border: 2rpx solid #e8eaf0;
			transition: all 0.3s;

			&:last-child {
				margin-bottom: 0;
			}

			.card-header {
				background: #fff;
				padding: 24rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 20rpx;
				border-bottom: 1rpx solid #e8eaf0;

				.left {
					display: flex;
					align-items: center;
					gap: 16rpx;
					flex: 1;
					min-width: 0;

					.index {
						width: 48rpx;
						height: 48rpx;
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						color: #fff;
						font-size: 20rpx;
						font-weight: bold;
						flex-shrink: 0;
					}

					.label-code-wrapper {
						flex: 1;
						min-width: 0;

						.label-input {
							background: #f8f9fb;
							border-radius: 12rpx;
							padding: 12rpx 16rpx;

							&.disabled {
								opacity: 0.5;
								background: #e0e0e0;
							}

							::v-deep .uni-easyinput__content {
								background: transparent !important;
								padding: 0 !important;
								height: auto !important;
								min-height: auto !important;
							}

							::v-deep .uni-easyinput__content-input {
								font-size: 26rpx;
								color: #333;
							}

							::v-deep .uni-easyinput__placeholder-class {
								color: rgba(153, 153, 153, 0.85);
							}
						}
					}
				}

				.scan-btn {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					padding: 12rpx 24rpx;
					border-radius: 24rpx;
					display: flex;
					align-items: center;
					gap: 8rpx;
					color: #fff;
					font-size: 24rpx;
					flex-shrink: 0;

					&:active {
						opacity: 0.8;
					}

					&.disabled {
						opacity: 0.5;
						background: #ccc;
					}
				}
			}

			.card-body {
				padding: 24rpx;

				.info-row-group {
					display: flex;
					gap: 20rpx;
					margin-bottom: 12rpx;

					&:last-child {
						margin-bottom: 0;
					}

					.info-row {
						flex: 1;
						display: flex;
						align-items: center;

						.label {
							font-size: 24rpx;
							color: #999;
							min-width: 100rpx;
						}

						.value {
							font-size: 26rpx;
							color: #333;
							flex: 1;
							word-break: break-all;

							&.number {
								font-weight: bold;
								color: #667eea;
							}
						}

						.number-input {
							flex: 1;
							height: 60rpx;
							padding: 0 16rpx;
							background: #fff;
							border: 2rpx solid #667eea;
							border-radius: 8rpx;
							font-size: 26rpx;
							color: #667eea;
							font-weight: bold;

							&::placeholder {
								color: #ccc;
							}
						}
					}
				}
			}

			.card-footer {
				padding: 16rpx 24rpx;
				background: #fff;
				display: flex;
				justify-content: flex-end;
				border-top: 1rpx dashed #e0e0e0;

				.delete-btn {
					display: flex;
					align-items: center;
					gap: 8rpx;
					padding: 12rpx 32rpx;
					background: linear-gradient(135deg, #ff4d4f 0%, #d9363e 100%);
					border-radius: 32rpx;
					color: #fff;
					font-size: 24rpx;
					box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);

					&:active {
						transform: scale(0.96);
						opacity: 0.9;
					}
				}
			}
		}

		.empty-state {
			padding: 80rpx 40rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 20rpx;

			text {
				font-size: 28rpx;
				color: #999;
			}
		}

		.add-btn-wrapper {
			padding: 20rpx;

			.add-btn {
				width: 100%;
				height: 88rpx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-radius: 44rpx;
				border: none;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12rpx;
				color: #fff;
				font-size: 28rpx;
				font-weight: 500;
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
				}
			}
		}
	}

	.submit-btn-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 20rpx 30rpx;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
		display: flex;
		gap: 20rpx;

		.submit-btn {
			flex: 1;
			height: 96rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 48rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			color: #fff;
			font-size: 28rpx;
			font-weight: bold;
			box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
			transition: all 0.3s;

			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
			}

			&.disabled {
				opacity: 0.6;
				cursor: not-allowed;
				pointer-events: none;
			}

			&:last-child {
				background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
				box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.4);

				&:active {
					box-shadow: 0 4rpx 16rpx rgba(82, 196, 26, 0.4);
				}
			}
		}
	}

	.loading-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;

		.loading-content {
			background: #fff;
			padding: 60rpx 80rpx;
			border-radius: 16rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 20rpx;
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);

			.loading-icon {
				animation: spin 1s linear infinite;
			}

			.loading-text {
				font-size: 28rpx;
				color: #667eea;
				font-weight: 500;
			}
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}
</style>