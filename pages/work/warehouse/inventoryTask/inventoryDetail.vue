<template>
	<view class="ware-house-container">
		<view class="box-body">
			<!-- 任务基本信息卡片 -->
			<view class="task-info-card">
				<view class="task-header">
					<view class="task-code-wrapper">
						<text class="task-code">{{ $t('warehouse.taskInfo') }}</text>
					</view>
				</view>
				<view class="task-body">
					<view class="task-row">
						<text class="t-label">{{ $t('warehouse.inventoryTaskNo') }}</text>
						<text class="t-value">{{taskCode || '--'}}</text>
					</view>
					<view class="task-row">
						<text class="t-label">{{ $t('warehouse.inventoryPlanNo') }}</text>
						<text class="t-value">{{stocktakingCode || '--'}}</text>
					</view>
					<view class="task-row">
						<text class="t-label">{{ $t('warehouse.inventoryPlanName') }}</text>
						<text class="t-value">{{stocktakingName || '--'}}</text>
					</view>

				</view>
			</view>

			<!-- 有明细数据 -->
			<view class="detail-section" v-if="detailList.length > 0">
				<view class="section-header">
					<view class="left">
						<uni-icons type="compose" color="#fff" size="16"></uni-icons>
						<text class="title">{{ $t('warehouse.inventoryDetailTitle') }}</text>
						<text class="count">- {{detailList.length}}条</text>
					</view>
				</view>
				<view class="detail-list">
					<view class="detail-card" v-for="(detail, index) in detailList" :key="index">
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="d-label">{{ $t('warehouse.tagCode') }}：</text>
								<text class="d-value">{{detail.labelCode || '--'}}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="d-label">{{ $t('warehouse.locationStorageColon') }}</text>
								<text class="d-value">{{detail.storageCode || '--'}}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="d-label">{{ $t('warehouse.materialCode') }}</text>
								<text class="d-value">{{detail.materialCode || '--'}}</text>
							</view>
							<view class="detail-row">
								<text class="d-label">{{ $t('warehouse.materialName') }}：</text>
								<text class="d-value">{{detail.materialName || '--'}}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="d-label">{{ $t('warehouse.inStockQty') }}：</text>
								<text class="d-value">{{detail.stockNumber != null ? detail.stockNumber : '--'}}</text>
							</view>
							<view class="detail-row">
								<text class="d-label">{{ $t('warehouse.checkQty') }}：</text>
								<input 
									class="qty-input" 
									type="digit" 
									v-model="detail.checkNumber" 
									:placeholder="$t('warehouse.qtyInputPlaceholder')"
									@blur="onQtyChange(detail)"
								/>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="d-label">{{ $t('warehouse.storageCodeColon') }}</text>
								<text class="d-value">{{detail.storageCode || '--'}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 无明细，显示扫码输入区 -->
			<view class="detail-section" v-else-if="!loadingDetail && detailLoaded">
				<view class="section-header">
					<view class="left">
						<uni-icons type="scan" color="#fff" size="16"></uni-icons>
						<text class="title">{{ $t('warehouse.inventoryDetailTitle') }}</text>
					</view>
				</view>
				<view class="label-input-section">
					<view class="input-header">{{ $t('warehouse.scanOrInputLabel') }}</view>
					<view class="input-row">
						<view class="input-group">
							<uni-icons type="scan" color="#667eea" size="18"></uni-icons>
							<uni-easyinput 
								v-model="labelCode" 
								:inputBorder="false"
								placeholderStyle="color: #999;"
								@confirm="onLabelInput"
								class="label-input"
								:placeholder="$t('warehouse.labelCodePlaceholder2')"
							></uni-easyinput>
						</view>
						<view class="scan-btn" @click="onLabelScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{ $t('warehouse.scan') }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载中 -->
			<view class="empty-state" v-else-if="loadingDetail">
				<uni-icons type="spinner-cycle" size="40" color="#667eea" class="spin-icon"></uni-icons>
				<text>{{ $t('warehouse.loadingDots') }}</text>
			</view>
		</view>

		<!-- 底部保存按钮 -->
		<view class="submit-btn-wrapper" v-if="detailList.length > 0">
			<button class="submit-btn" :class="{ disabled: isSubmitting }" @click="onSave" :disabled="isSubmitting">
				<uni-icons type="checkmarkempty" size="18"></uni-icons>
				<text>{{ isSubmitting ? $t('warehouse.submittingText') : $t('warehouse.submit') }}</text>
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
	import inventoryTaskApi from '/api/warehouse/inventoryTask.js'
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				recordId: '',
				taskCode: '',
				stocktakingCode: '',
				stocktakingName: '',
				taskState: null,
				materialCode: '',
				materialName: '',
				detailList: [],
				labelCode: '',
				loadingDetail: false,
				detailLoaded: false,
				isSubmitting: false,
				isLoading: false
			}
		},
		onLoad(options) {
			this.recordId = options.recordId || '';
			this.taskCode = decodeURIComponent(options.taskCode || '');
			this.stocktakingCode = decodeURIComponent(options.stocktakingCode || '');
			this.stocktakingName = decodeURIComponent(options.stocktakingName || '');
			this.taskState = options.taskState || null;
			this.materialCode = options.materialCode || '';
			this.materialName = options.materialName || '';
			this.loadDetail();
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan');
					uni.$on('scan', function(code) {
						_this.handleScanCode(code);
					});
				}
			});
		},
		destroyed: function() {
			plus.key.removeEventListener('keydown');
		},
		methods: {
			// 硬件扫码处理
			handleScanCode(code) {
				if (this.detailList.length === 0 && this.detailLoaded) {
					this.labelCode = code;
					this.loadLabelInfo(code);
				}
			},

			// 加载盘点明细
			loadDetail() {
				this.loadingDetail = true;
				inventoryTaskApi.getStocktakingDetail(this.recordId, this.materialCode).then(resp => {
					this.loadingDetail = false;
					this.detailLoaded = true;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data;
						if (data && Array.isArray(data) && data.length > 0) {
							this.detailList = data.map(item => ({
								...item,
								realQty: item.realQty != null ? item.realQty : item.bookQty
							}));
						} else {
							this.detailList = [];
						}
					} else {
						this.detailList = [];
					}
				}).catch(() => {
					this.loadingDetail = false;
					this.detailLoaded = true;
					this.detailList = [];
					showBeautyToast({
						title: this.$t('warehouse.loadDetailFail'),
						icon: 'none'
					});
				});
			},

			// 扫码按钮
			onLabelScan() {
				scanCode().then((code) => {
					this.labelCode = code;
					this.loadLabelInfo(code);
				}).catch(err => {
					showBeautyToast({
						title: err || this.$t('warehouse.scanFail'),
						icon: 'none'
					});
				});
			},

			// 手动输入标签码确认
			onLabelInput() {
				const _this = this;
				setTimeout(function() {
					if (_this.labelCode) {
						_this.loadLabelInfo(_this.labelCode);
					}
				}, 200);
			},

			// 加载标签信息
			loadLabelInfo(labelCode) {
				if (!labelCode) return;
				this.isLoading = true;
				inventoryTaskApi.scanLabelCode(labelCode).then(resp => {
					this.isLoading = false;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data;
						if (data) {
							const newDetail = Array.isArray(data) ? data : [data];
							this.detailList = newDetail.map(item => ({
								...item,
								realQty: item.realQty != null ? item.realQty : item.bookQty
							}));
							this.labelCode = '';
							showBeautyToast({
								title: this.$t('warehouse.scanSuccess'),
								icon: 'success'
							});
						} else {
							showBeautyToast({
								title: this.$t('warehouse.noLabelInfo'),
								icon: 'none'
							});
						}
					} else {
						showBeautyToast({
							title: resp.msg || this.$t('warehouse.labelQueryFail'),
							icon: 'none'
						});
					}
				}).catch(() => {
					this.isLoading = false;
					showBeautyToast({
						title: this.$t('warehouse.labelQueryFail'),
						icon: 'none'
					});
				});
			},

			// 数量变更
			onQtyChange(detail) {
				// 数量变更时的处理，可扩展
			},

			// 保存明细
			onSave() {
				if (this.isSubmitting) return;
				if (!this.recordId) {
					showBeautyToast({ title: this.$t('warehouse.taskIdMissing'), icon: 'none' });
					return;
				}
				// 校验盘点数量
				const emptyItem = this.detailList.find(item => {
					return item.checkNumber == null || item.checkNumber === '' || String(item.checkNumber).trim() === '';
				});
				if (emptyItem) {
					showBeautyToast({ title: this.$t('warehouse.inputCheckQty'), icon: 'none' });
					return;
				}
				this.isSubmitting = true;
				inventoryTaskApi.saveStocktakingDetail(this.detailList, this.recordId, this.taskCode).then(resp => {
					this.isSubmitting = false;
					if (resp.code == 200 || resp.code == '200') {
						showBeautyToast({
							title: this.$t('warehouse.saveSuccess'),
							icon: 'success'
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 800);
					} else {
						showBeautyToast({
							title: resp.msg || this.$t('warehouse.saveFail'),
							icon: 'none'
						});
					}
				}).catch(() => {
					this.isSubmitting = false;
					showBeautyToast({
						title: this.$t('warehouse.saveFail'),
						icon: 'none'
					});
				});
			},

			formatTaskState(state) {
				if (state == null || state === '') return '--';
				const num = Number(state);
			if (num === -1) return this.$t('warehouse.stateNotExec');
			if (num === 1) return this.$t('warehouse.stateInProgress');
			if (num === 2) return this.$t('warehouse.statusDone');
				return state;
			},

			taskStateClass(state) {
				if (state == null || state === '') return '';
				const num = Number(state);
				if (num === -1) return 'state-pending';
				if (num === 1) return 'state-progress';
				if (num === 2) return 'state-done';
				return '';
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";

	.ware-house-container {
		background: #f5f7fa;
		min-height: 100vh;
		padding-bottom: 160rpx;
	}

	.box-body {
		padding: 20rpx;
	}

	// 任务信息卡片
	.task-info-card {
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.task-header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 24rpx 30rpx;

			.task-code-wrapper {
				.task-code {
					font-size: 30rpx;
					font-weight: bold;
					color: #fff;
				}
			}
		}

		.task-body {
			padding: 24rpx 30rpx;

			.task-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 12rpx 0;

				&:not(:last-child) {
					border-bottom: 1rpx solid #f0f0f0;
				}

				.t-label {
					font-size: 26rpx;
					color: #999;
				}

				.t-value {
					font-size: 26rpx;
					color: #333;
					font-weight: 500;
					text-align: right;
					flex: 1;
					margin-left: 20rpx;

					&.status-text {
						font-weight: bold;

						&.state-pending {
							color: #faad14;
						}

						&.state-progress {
							color: #1890ff;
						}

						&.state-done {
							color: #52c41a;
						}
					}
				}
			}
		}
	}

	// 料号信息卡片
	.material-info-card {
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.info-header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 24rpx 30rpx;

			.code-wrapper {
				.code {
					font-size: 30rpx;
					font-weight: bold;
					color: #fff;
				}
			}
		}

		.info-body {
			padding: 24rpx 30rpx;

			.info-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 12rpx 0;

				.label {
					font-size: 26rpx;
					color: #999;
				}

				.value {
					font-size: 26rpx;
					color: #333;
					font-weight: 500;
					text-align: right;
					flex: 1;
					margin-left: 20rpx;
				}
			}
		}
	}

	// 明细区域
	.detail-section {
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		margin-bottom: 30rpx;

		.section-header {
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

		.detail-list {
			padding: 20rpx;
		}

		.detail-card {
			background: #f8f9fb;
			border-radius: 16rpx;
			padding: 24rpx;
			margin-bottom: 16rpx;
			border: 2rpx solid #e8eaf0;

			&:last-child {
				margin-bottom: 0;
			}

			.detail-row-group {
				display: flex;
				gap: 20rpx;
				margin-bottom: 12rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.detail-row {
					flex: 1;
					display: flex;
					align-items: center;

					.d-label {
						font-size: 24rpx;
						color: #999;
						min-width: 120rpx;
						text-align: right;
					}

					.d-value {
						font-size: 26rpx;
						color: #333;
						font-weight: 500;
						flex: 1;
						word-break: break-all;
					}

					.qty-input {
						flex: 1;
						height: 56rpx;
						padding: 0 16rpx;
						background: #fff;
						border: 2rpx solid #667eea;
						border-radius: 8rpx;
						font-size: 26rpx;
						color: #667eea;
						font-weight: bold;
						text-align: center;

						&::placeholder {
							color: #ccc;
							font-weight: normal;
						}
					}
				}
			}
		}

		// 标签码输入区
		.label-input-section {
			padding: 30rpx;

			.input-header {
				font-size: 26rpx;
				color: #999;
				margin-bottom: 20rpx;
				text-align: center;
			}

			.input-row {
				display: flex;
				align-items: center;
				gap: 16rpx;

				.input-group {
					flex: 1;
					display: flex;
					align-items: center;
					background: #f8f9fb;
					border-radius: 12rpx;
					border: 2rpx solid #e8eaf0;
					padding: 8rpx 20rpx;

					.label-input {
						flex: 1;

						::v-deep .uni-easyinput__content {
							background: transparent !important;
							padding: 0 !important;
							height: auto !important;
							min-height: auto !important;
						}

						::v-deep .uni-easyinput__content-input {
							font-size: 28rpx;
							color: #333;
						}
					}
				}

				.scan-btn {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					padding: 16rpx 28rpx;
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

		.spin-icon {
			animation: spin 1s linear infinite;
		}
	}

	// 保存按钮
	.submit-btn-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 20%);
		padding: 24rpx 30rpx;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
		display: flex;
		justify-content: center;

		.submit-btn {
			flex: 1;
			height: 96rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 48rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			color: #fff;
			font-size: 30rpx;
			font-weight: bold;
			box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);

			&:active:not(.disabled) {
				transform: translateY(2rpx);
				box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.4);
			}

			&.disabled {
				opacity: 0.5;
				background: #ccc;
				box-shadow: none;
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
		z-index: 999;

		.loading-content {
			background: #fff;
			padding: 40rpx 60rpx;
			border-radius: 20rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 20rpx;

			.loading-icon {
				animation: spin 1s linear infinite;
			}

			.loading-text {
				font-size: 28rpx;
				color: #666;
			}
		}
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
