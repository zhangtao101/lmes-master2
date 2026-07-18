<template>
	<view class="ware-house-container">
		<view class="box-body">
			<!-- 货架储位信息 -->
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<uni-icons type="home" color="#fff" size="18"></uni-icons>
							<text>{{ $t('warehouse.shelfStorage') }}：</text>
							<uni-easyinput 
								v-model="storageCode" 
								:inputBorder="false"
								placeholderStyle="color: #999;"
								@confirm="onStorageCodeConfirm"
								class="warehouse-input"
							></uni-easyinput>
						</view>
					</view>
					<view class="right" @click="onStorageScan">
						<uni-icons type="scan" color="#fff" size="16"></uni-icons>
						<text>{{ $t('warehouse.pleaseScan') }}</text>
					</view>
				</view>
				<view class="info-grid">
					<view class="info-item">
						<view class="label">{{ $t('warehouse.shelfCodeLabel') }}</view>
						<view class="value">{{shelfInfo.rqCode || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">{{ $t('warehouse.locationCodeLabel') }}</view>
						<view class="value">{{shelfInfo.locationCode || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">{{ $t('warehouse.shelfStorageNo') }}</view>
						<view class="value">{{shelfInfo.storageCode || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">{{ $t('warehouse.status') }}</view>
						<view class="value" :class="shelfInfo.statusName === '在库' ? 'success' : 'error'">
							{{shelfInfo.statusName || '--'}}
						</view>
					</view>
				</view>
			</view>

			<!-- 标签明细 -->
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose" color="#fff" size="16"></uni-icons>
						<text class="title"> {{ $t('warehouse.labelDetail') }}</text>
						<text class="count">({{labelList.length}})</text>
					</view>
				</view>
				<view class="label-list" v-if="labelList.length > 0">
					<view class="label-card" v-for="(labelInfo, index) in labelList" :key="index">
						<view class="card-header">
							<view class="left">
								<view class="index">{{index + 1}}</view>
								<view class="label-code-wrapper">
									<uni-easyinput 
										v-model="labelInfo.labelCode" 
										:inputBorder="false"
										placeholderStyle="color: #999;"
										@confirm="onLabelManualInput(labelInfo)"
										:disabled="!storageCode"
										class="label-input"
										:class="{ disabled: !storageCode }"
										:placeholder="$t('warehouse.labelCodePlaceholder2')"
									></uni-easyinput>
								</view>
							</view>
							<view class="scan-btn" :class="{ disabled: !storageCode }" @click="onLabelScan(labelInfo)">
								<uni-icons type="scan" size="16"></uni-icons>
								<text>{{ $t('warehouse.scan') }}</text>
							</view>
						</view>
						<view class="card-body">
							<view class="info-row-group">
								<view class="info-row">
									<text class="label">{{ $t('warehouse.code') }}：</text>
									<text class="value">{{labelInfo.materialCode || '--'}}</text>
								</view>
								<view class="info-row">
									<text class="label">{{ $t('warehouse.materialName') }}：</text>
									<text class="value">{{labelInfo.materialName || '--'}}</text>
								</view>
							</view>
							<view class="info-row-group">
								<view class="info-row">
									<text class="label">{{ $t('warehouse.batchCode') }}：</text>
									<text class="value">{{labelInfo.batchCode || '--'}}</text>
								</view>
								<view class="info-row">
									<text class="label">{{ $t('warehouse.qtyColon') }}</text>
									<input class="uni-input number-input" type="digit" v-model="labelInfo.number" :placeholder="$t('warehouse.qtyInputPlaceholder')" />
								</view>
							</view>
						</view>
						<view class="card-footer">
							<view class="delete-btn" @click="removeLabel(index)">
							<uni-icons type="trash" size="20" color="#fff"></uni-icons>
							<text>{{ $t('warehouse.delete') }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
					<text>{{ $t('warehouse.noLabelDetail') }}</text>
				</view>
				<view class="add-btn-wrapper">
					<button class="add-btn" @click="addRow">
						<uni-icons type="plus" size="16" color="#fff"></uni-icons>
						<text>{{ $t('warehouse.addLabel') }}</text>
					</button>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="submit-btn-wrapper">
			<button class="submit-btn" :class="{ disabled: isProcessing }" @click="onTakeOut">
				<uni-icons type="download" size="18"></uni-icons>
				<text>{{ isProcessing ? $t('warehouse.returning') : $t('warehouse.takeOut') }}</text>
			</button>
			<button class="submit-btn btn-success" :class="{ disabled: isProcessing }" @click="onPutIn">
				<uni-icons type="upload" size="18"></uni-icons>
				<text>{{ isProcessing ? $t('warehouse.returning') : $t('warehouse.putIn') }}</text>
			</button>
			<button class="submit-btn btn-warning" :class="{ disabled: isProcessing }" @click="onShelfReturn">
				<uni-icons type="loop" size="18"></uni-icons>
				<text>{{ isProcessing ? $t('warehouse.returning') : $t('warehouse.shelfReturn') }}</text>
			</button>
		</view>

		<!-- 加载遮罩 -->
		<view class="loading-mask" v-if="isLoading">
			<view class="loading-content">
				<uni-icons type="spinner-cycle" size="40" color="#667eea" class="loading-icon"></uni-icons>
				<text class="loading-text">{{ $t('warehouse.loadingDots') }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import transferApi from '/api/warehouse/transfer.js'
	import { CodeType, getCodeType } from '/common/enum.js'

	export default {
		data() {
			return {
				storageCode: '',
				shelfInfo: {
					rqCode: '',
					locationCode: '',
					storageCode: '',
					statusName: ''
				},
				labelList: [],
				isLoading: false,
				isProcessing: false
			}
		},
		onLoad() {
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan')
					uni.$on('scan', function(code) {
						const codeType = getCodeType(code);
						if (codeType == CodeType.KQ) {
							_this.loadShelfInfo(code);
						} else if (codeType == CodeType.WL_Label) {
							_this.loadLabelInfo(code, _this.currentLabelItem || {});
						} else {
							uni.showToast({
								title: this.$t('warehouse.tagInvalid'),
								icon: 'none'
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
			// 货架储位码确认
			onStorageCodeConfirm: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.storageCode) {
						_this.loadShelfInfo(_this.storageCode);
					}
				}, 200);
			},

			// 加载货架信息
			loadShelfInfo: async function(code) {
				this.isLoading = true;
				this.storageCode = code;
				try {
					const resp = await transferApi.getDetailByHjStorageCode(code);
					this.isLoading = false;
					if (resp.code == '200' && resp.data) {
						this.shelfInfo = {
							rqCode: resp.data.rqCode || '',
							locationCode: resp.data.locationCode || '',
							storageCode: resp.data.storageCode || '',
							statusName: resp.data.statusName || ''
						};
					} else {
						uni.showToast({
							title: resp.msg || this.$t('warehouse.loadFail'),
							icon: 'none'
						});
					}
				} catch (e) {
					this.isLoading = false;
					uni.showToast({
						title: this.$t('warehouse.loadFail'),
						icon: 'none'
					});
				}
			},

			// 加载标签信息
			loadLabelInfo: async function(labelCode, item) {
				this.isLoading = true;
				try {
					const resp = await transferApi.getEnterDetailByLabelCode(labelCode);
					console.log(resp);
					this.isLoading = false;
					if (resp.code == '200' && resp.data) {
						const data = resp.data;
						item.labelCode = data.labelCode;
						item.materialCode = data.materialCode;
						item.materialName = data.materialName;
						item.batchCode = data.batchCode;
						item.number = data.number;
						item.descriptionId = data.descriptionId;
					} else {
						uni.showToast({
							title: resp.msg || this.$t('warehouse.loadFail'),
							icon: 'none'
						});
					}
				} catch (e) {
					this.isLoading = false;
					uni.showToast({
						title: this.$t('warehouse.loadFail'),
						icon: 'none'
					});
				}
			},

			// 扫码货架储位
			onStorageScan: function() {
				const _this = this;
				scanCode().then((code) => {
					_this.loadShelfInfo(code);
				}).catch(err => {
					uni.showToast({
						title: err,
						icon: 'none'
					});
				});
			},

			// 标签手动输入
			onLabelManualInput: function(item) {
				const _this = this;
				setTimeout(function() {
					if (!item.labelCode) {
						uni.showToast({
							title: this.$t('warehouse.labelCodePlaceholder'),
							icon: 'none'
						});
						return;
					}
					_this.loadLabelInfo(item.labelCode, item);
				}, 200);
			},

			// 扫码标签
			onLabelScan: function(item) {
				if (!this.storageCode) {
					uni.showToast({
						title: this.$t('warehouse.scanShelfFirst'),
						icon: 'none'
					});
					return;
				}
				const _this = this;
				this.currentLabelItem = item;
				scanCode().then((labelCode) => {
					_this.loadLabelInfo(labelCode, item);
				}).catch(err => {
					uni.showToast({
						title: err,
						icon: 'none'
					});
				});
			},

			// 添加行
			addRow: function() {
				this.labelList.push({});
			},

			// 移除标签
			removeLabel: function(index) {
				this.labelList.splice(index, 1);
			},

			// 验证标签列表
			validateLabels: function() {
				if (!this.storageCode) {
					uni.showToast({
						title: this.$t('warehouse.scanShelfFirst'),
						icon: 'none'
					});
					return false;
				}
				if (this.labelList.length === 0) {
					uni.showToast({
						title: this.$t('warehouse.addLabelFirst'),
						icon: 'none'
					});
					return false;
				}
				for (let i = 0; i < this.labelList.length; i++) {
					const label = this.labelList[i];
					if (!label.labelCode) {
						uni.showToast({
							title: this.$t('warehouse.detailNoLabel', { index: i + 1 }),
							icon: 'none'
						});
						return false;
					}
					if (!label.number || label.number <= 0) {
						uni.showToast({
							title: this.$t('warehouse.detailInvalidQty', { index: i + 1 }),
							icon: 'none'
						});
						return false;
					}
				}
				return true;
			},

			// 取出操作
			onTakeOut: async function() {
				if (this.isProcessing) return;
				if (!this.validateLabels()) return;

				this.isProcessing = true;
				try {
					const labelCodes = this.labelList.map(item => ({
						labelCode: item.labelCode,
						number: parseFloat(item.number)
					}));
					const resp = await transferApi.labelEnout(
						this.shelfInfo.rqCode,
						this.storageCode,
						-1, // 取出
						labelCodes
					);
					if (resp.code == '200') {
						uni.showToast({
							title: this.$t('warehouse.takeOutSuccess'),
							icon: 'success'
						});
						// 清空数据
						this.labelList = [];
						this.storageCode = '';
						this.shelfInfo = {
							rqCode: '',
							locationCode: '',
							storageCode: '',
							statusName: ''
						};
					} else {
						uni.showToast({
							title: resp.msg || this.$t('warehouse.takeOutFail'),
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: this.$t('warehouse.takeOutFail'),
						icon: 'none'
					});
				} finally {
					this.isProcessing = false;
				}
			},

			// 放入操作
			onPutIn: async function() {
				if (this.isProcessing) return;
				if (!this.validateLabels()) return;

				this.isProcessing = true;
				try {
					const labelCodes = this.labelList.map(item => ({
						labelCode: item.labelCode,
						number: parseFloat(item.number)
					}));
					const resp = await transferApi.labelEnout(
						this.shelfInfo.rqCode,
						this.storageCode,
						1, // 放入
						labelCodes
					);
					if (resp.code == '200') {
						uni.showToast({
							title: this.$t('warehouse.putInSuccess'),
							icon: 'success'
						});
						// 清空数据
						this.labelList = [];
						this.storageCode = '';
						this.shelfInfo = {
							rqCode: '',
							locationCode: '',
							storageCode: '',
							statusName: ''
						};
					} else {
						uni.showToast({
							title: resp.msg || this.$t('warehouse.putInFail'),
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: this.$t('warehouse.putInFail'),
						icon: 'none'
					});
				} finally {
					this.isProcessing = false;
				}
			},

			// 货架回撤
			onShelfReturn: async function() {
				if (this.isProcessing) return;
				if (!this.storageCode || !this.shelfInfo.rqCode) {
					uni.showToast({
						title: this.$t('warehouse.scanShelfFirst'),
						icon: 'none'
					});
					return;
				}

				this.isProcessing = true;
				try {
					const resp = await transferApi.submitDBContainer(
						this.shelfInfo.rqCode,
						this.shelfInfo.locationCode
					);
					if (resp.code == '200') {
						uni.showToast({
							title: this.$t('warehouse.shelfReturnSuccess'),
							icon: 'success'
						});
						// 清空数据
						this.labelList = [];
						this.storageCode = '';
						this.shelfInfo = {
							rqCode: '',
							locationCode: '',
							storageCode: '',
							statusName: ''
						};
					} else {
						uni.showToast({
							title: resp.msg || this.$t('warehouse.shelfReturnFail'),
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: this.$t('warehouse.shelfReturnFail'),
						icon: 'none'
					});
				} finally {
					this.isProcessing = false;
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";

	.ware-house-container {
		background: #f5f7fa;
		min-height: 100vh;
		padding-bottom: 140rpx;
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

					&.success {
						color: #52c41a;
						font-weight: bold;
					}

					&.error {
						color: #ff4d4f;
						font-weight: bold;
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

			&:last-child {
				margin-bottom: 0;
			}

			.card-header {
				background: #fff;
				padding: 24rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 16rpx;
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
		background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 20%);
		padding: 24rpx 30rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		display: flex;
		gap: 20rpx;
		justify-content: center;

		.submit-btn {
			flex: 1;
			max-width: 220rpx;
			height: 96rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 48rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			color: #fff;
			font-size: 28rpx;
			font-weight: bold;
			box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
			position: relative;
			overflow: hidden;

			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: -100%;
				width: 100%;
				height: 100%;
				background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
				transition: left 0.5s;
			}

			&:active::before {
				left: 100%;
			}

			&:active {
				transform: translateY(2rpx);
				box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.4);
			}

			&.disabled {
				opacity: 0.5;
				cursor: not-allowed;
				pointer-events: none;
			}

			&.btn-success {
				background: linear-gradient(135deg, #10b981 0%, #059669 100%);
				box-shadow: 0 6rpx 20rpx rgba(16, 185, 129, 0.4);

				&:active {
					box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.4);
				}
			}

			&.btn-warning {
				background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
				box-shadow: 0 6rpx 20rpx rgba(245, 158, 11, 0.4);

				&:active {
					box-shadow: 0 2rpx 8rpx rgba(245, 158, 11, 0.4);
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
