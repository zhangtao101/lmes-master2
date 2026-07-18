<template>
	<view class="transfer-container">
		<!-- 调拨方式选择 -->
		<view class="floor-selector" v-if="!transferType">
			<view class="floor-header">
				<text class="floor-title">{{ $t('warehouse.selectTransferType') }}</text>
			</view>
			<view class="floor-list">
				<view class="floor-item" @click="selectTransferType('1')">
					<text>{{ $t('warehouse.innerTransfer') }}</text>
				</view>
				<view class="floor-item" @click="selectTransferType('2')">
					<text>{{ $t('warehouse.crossFloorTransfer') }}</text>
				</view>
			</view>
		</view>

		<!-- 主内容 -->
		<template v-else>
			<view class="box-header">
				<view class="icon"></view>
				<text class="title">{{ $t('warehouse.transferQuery') }}</text>
			</view>
			<view class="box-body">
				<!-- 货架码输入区域 -->
				<view class="warehouse-info">
					<view class="header">
						<view class="left">
							<uni-icons type="home" color="#fff" size="18"></uni-icons>
							<text>{{ $t('warehouse.shelfCode') }}{{ shelfCode || $t('warehouse.pendingInput') }}</text>
						</view>
						<view class="right">
							<view class="action-btn scan-btn" @click="onScanCode">
								<uni-icons type="scan" color="#fff" size="16"></uni-icons>
								<text>{{ $t('common.scan') }}</text>
							</view>
						</view>
					</view>
					<view class="search-box">
						<input
							class="search-input"
							v-model="codeInput"
							:placeholder="$t('warehouse.shelfPlaceholder')"
							@confirm="onInputConfirm"
						/>
						<view class="search-btn" @click="onScanCode">
							<uni-icons type="scan" color="#fff" size="18"></uni-icons>
						</view>
					</view>
				</view>

				<!-- 查询结果展示 -->
				<view class="warehouse-info" v-if="hasSearched && queryResult">
					<view class="header">
						<view class="left">
							<uni-icons type="list" color="#fff" size="18"></uni-icons>
							<text class="title">{{ $t('warehouse.shelfInfo') }}</text>
						</view>
						<view class="right result-count">
							<text>{{ shelfInfo.statusName }}</text>
						</view>
					</view>

					<!-- 货架基本信息 -->
					<view class="info-section">
						<view class="info-row">
							<text class="info-label">{{ $t('warehouse.shelfNo') }}</text>
							<text class="info-value">{{ shelfInfo.rqCode || '-' }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">{{ $t('warehouse.locationCodeLabel') }}</text>
							<text class="info-value">{{ shelfInfo.locationCode || '-' }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">{{ $t('warehouse.status') }}</text>
							<text class="info-value" :class="shelfInfo.statusName === '在库' ? 'status-in' : 'status-out'">
								{{ shelfInfo.statusName || '-' }}
							</text>
						</view>
					</view>

					<!-- 物料列表 -->
					<view class="material-section" v-if="materialList.length > 0">
						<view class="section-title">
							<text>{{ $t('warehouse.materialDetail') }}</text>
							<text class="count">{{ $t('warehouse.materialCount', { count: materialList.length }) }}</text>
						</view>
						<view class="material-list">
							<view class="material-item" v-for="(item, index) in materialList" :key="index">
								<view class="material-grid">
									<view class="material-row">
										<text class="material-label">{{ $t('warehouse.tagCode') }}</text>
										<text class="material-value">{{ item.labelCode || '-' }}</text>
									</view>
									<view class="material-row">
										<text class="material-label">{{ $t('warehouse.code') }}</text>
										<text class="material-value">{{ item.materialCode || '-' }}</text>
									</view>
								</view>
								<view class="material-grid">
									<view class="material-row">
										<text class="material-label">{{ $t('warehouse.materialName') }}</text>
										<text class="material-value">{{ item.materialName || '-' }}</text>
									</view>
									<view class="material-row">
										<text class="material-label">{{ $t('warehouse.batchCode') }}</text>
										<text class="material-value">{{ item.batchCode || '-' }}</text>
									</view>
								</view>
								<view class="material-grid">
									<view class="material-row">
										<text class="material-label">{{ $t('warehouse.qty') }}</text>
										<text class="material-value highlight">{{ item.number }}</text>
									</view>
									<view class="material-row">
										<text class="material-label">{{ $t('warehouse.storage') }}</text>
										<text class="material-value">{{ item.storageCode || '-' }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view class="warehouse-info" v-else-if="hasSearched">
					<view class="empty-state">
						<template v-if="loading">
							<view class="loading-spinner"></view>
							<text>{{ $t('warehouse.querying') }}</text>
						</template>
						<template v-else>
							<view class="empty-icon-wrapper">
								<uni-icons type="list" size="64" color="#e0e0e0"></uni-icons>
							</view>
							<text>{{ $t('warehouse.noResult') }}</text>
							<text class="sub-text">{{ $t('warehouse.correctShelfHint') }}</text>
						</template>
					</view>
				</view>

				<!-- 未搜索状态 -->
				<view class="warehouse-info" v-else>
					<view class="empty-state">
						<view class="empty-icon-wrapper">
							<uni-icons type="search" size="64" color="#e0e0e0"></uni-icons>
						</view>
						<text>{{ $t('warehouse.enterShelfHint') }}</text>
					</view>
				</view>
			</view>

			<!-- 底部按钮 -->
			<view class="bottom-bar" v-if="hasSearched && queryResult">
				<button
					class="btn btn-primary"
					@click="onCallAgv"
					:disabled="!shelfInfo.rqCode"
				>
					{{ $t('warehouse.callAgv') }}
				</button>
				<button
					class="btn btn-secondary"
					@click="onTransfer"
					:disabled="!shelfInfo.rqCode"
				>
					{{ $t('warehouse.transferWork') }}
				</button>
			</view>
		</template>
	</view>
</template>

<script>
import scanCode from '/common/scan.js'
import transferApi from '/api/warehouse/transfer.js'

export default {
	data() {
		return {
			transferType: '',
			shelfCode: '',
			codeInput: '',
			loading: false,
			hasSearched: false,
			queryResult: null,
			shelfInfo: {
				rqCode: '',
				locationCode: '',
				statusName: ''
			},
			materialList: []
		}
	},
	onLoad() {
		const _this = this;
		plus.key.addEventListener("keydown", function(e) {
			if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
				uni.$off('scan')
				uni.$on('scan', function(code) {
					_this.handleScanCode(code);
				})
			}
		})
	},
	destroyed: function() {
		plus.key.removeEventListener('keydown');
	},
	methods: {
		selectTransferType(type) {
			this.transferType = type;
		},

		onScanCode: function() {
			const _this = this;
			scanCode().then((code) => {
				_this.shelfCode = code;
				_this.queryInfo();
			}).catch(err => {
				uni.showToast({
					title: err,
					icon: 'none'
				});
			});
		},

		onInputConfirm: function() {
			const _this = this;
			setTimeout(function() {
				const code = _this.codeInput.trim();
				_this.codeInput = '';
				if (!code) {
					uni.showToast({
						title: _this.$t('warehouse.enterShelfTip'),
						icon: 'none'
					});
					return;
				}
				_this.shelfCode = code;
				_this.queryInfo();
			}, 200);
		},

		handleScanCode: function(code) {
			this.shelfCode = code;
			this.queryInfo();
		},

		queryInfo: async function() {
			if (!this.shelfCode || !this.shelfCode.trim()) {
				return;
			}

			this.hasSearched = true;
			this.loading = true;
			this.queryResult = null;

			try {
				const resp = await transferApi.getDetailByCode(this.shelfCode.trim());
				this.loading = false;
				console.log(resp);
				if (resp.code == '200') {
					this.queryResult = resp.data;
					if (resp.data) {
						this.shelfInfo = {
							rqCode: resp.data.dbRqDto?.rqCode || '',
							locationCode: resp.data.dbRqDto?.locationCode || '',
							statusName: resp.data.dbRqDto?.statusName || ''
						};
						this.materialList = resp.data.shelfList || [];
					}
				} else {
					uni.showToast({
						title: resp.msg || this.$t('warehouse.queryFailed'),
						icon: 'none'
					});
				}
			} catch (error) {
				this.loading = false;
				console.error(error);
				uni.showToast({
					title: this.$t('warehouse.queryFailedRetry'),
					icon: 'none'
				});
			}
		},

		onCallAgv: async function() {
			if (!this.shelfInfo.rqCode || !this.shelfInfo.locationCode) {
				uni.showToast({
					title: this.$t('warehouse.queryShelfFirst'),
					icon: 'none'
				});
				return;
			}

			try {
				uni.showLoading({ title: this.$t('warehouse.calling') });
				const resp = await transferApi.submitDBContainer(
					this.shelfInfo.rqCode,
					this.shelfInfo.locationCode
				);
				uni.hideLoading();

				if (resp.code == '200') {
					uni.showToast({
						title: this.$t('warehouse.agvCallSuccess'),
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: resp.msg || this.$t('warehouse.callFailed'),
						icon: 'none'
					});
				}
			} catch (error) {
				uni.hideLoading();
				uni.showToast({
					title: this.$t('warehouse.callFailed'),
					icon: 'none'
				});
			}
		},

		onTransfer: function() {
			uni.navigateTo({
				url: '/pages/work/warehouse/transfer/agvtransfer'
			});
		}
	}
}
</script>

<style lang="less" scoped>
@import "@/static/styles/warehouse.less";

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.transfer-container {
	background: #f5f7fa;
	min-height: 100vh;
	padding-bottom: 180rpx;
}

.box-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx 30rpx;
	text-align: center;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		width: 200rpx;
		height: 200rpx;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		top: -50rpx;
		right: -50rpx;
	}

	.icon {
		margin-bottom: 20rpx;
	}

	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #fff;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
	}
}

.box-body {
	padding: 30rpx;
}

.floor-selector {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	padding: 40rpx 30rpx;

	.floor-header {
		margin-bottom: 60rpx;

		.floor-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}
	}

	.floor-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;

		.floor-item {
			background: #fff;
			border-radius: 24rpx;
			padding: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

			text {
				font-size: 32rpx;
				font-weight: 500;
				color: #667eea;
			}

			&:active {
				background: #f5f7fa;
				transform: scale(0.98);
			}
		}
	}
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

		.left {
			display: flex;
			align-items: center;
			gap: 16rpx;

			.title {
				color: #fff;
				font-size: 28rpx;
				font-weight: bold;
			}

			text {
				color: #fff;
				font-size: 28rpx;
				font-weight: 500;
			}
		}

		.right {
			display: flex;
			gap: 12rpx;

			.action-btn {
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

				&.scan-btn {
					background: rgba(102, 126, 234, 0.6);
				}
			}

			.result-count {
				background: rgba(255, 255, 255, 0.2);
				padding: 8rpx 16rpx;
				border-radius: 16rpx;

				text {
					color: #fff;
					font-size: 24rpx;
				}
			}
		}
	}

	.search-box {
		padding: 30rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.search-input {
			flex: 1;
			padding: 24rpx;
			border: 2rpx solid #e0e0e0;
			border-radius: 12rpx;
			font-size: 28rpx;
			background: #fff !important;
			color: #333;

			&:focus {
				border-color: #667eea;
				box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
			}
		}

		.search-btn {
			width: 80rpx;
			height: 80rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			&:active {
				transform: scale(0.95);
				opacity: 0.9;
			}
		}
	}

	.info-section {
		padding: 30rpx;

		.info-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.info-label {
				font-size: 28rpx;
				color: #999;
				font-weight: 500;
			}

			.info-value {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
			}

			.status-in {
				color: #52c41a;
			}

			.status-out {
				color: #ff4d4f;
			}
		}
	}

	.material-section {
		padding: 30rpx;
		border-top: 1rpx solid #f0f0f0;

		.section-title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 24rpx;

			text {
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
			}

			.count {
				font-size: 24rpx;
				color: #999;
				font-weight: normal;
			}
		}

		.material-list {
			.material-item {
				background: #f8f9fb;
				border-radius: 16rpx;
				padding: 24rpx;
				margin-bottom: 20rpx;
				border: 1rpx solid #e0e0e0;

				&:last-child {
					margin-bottom: 0;
				}

				.material-grid {
					display: flex;
					gap: 20rpx;
					margin-bottom: 16rpx;

					&:last-child {
						margin-bottom: 0;
					}
				}

				.material-row {
					flex: 1;
					display: flex;
					flex-direction: column;
					padding: 16rpx;
					background: #fff;
					border-radius: 12rpx;

					.material-label {
						font-size: 24rpx;
						color: #999;
						font-weight: 500;
						margin-bottom: 8rpx;
					}

					.material-value {
						font-size: 26rpx;
						color: #333;
						font-weight: 500;
						word-break: break-all;

						&.highlight {
							font-weight: bold;
							color: #667eea;
						}
					}
				}
			}
		}
	}

	.empty-state {
		padding: 100rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 24rpx;

		.empty-icon-wrapper {
			width: 140rpx;
			height: 140rpx;
			background: #f8f9fb;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 10rpx;
			border: 2rpx dashed #e0e0e0;
		}

		text {
			font-size: 30rpx;
			color: #606266;
			font-weight: 500;

			&.sub-text {
				font-size: 26rpx;
				color: #909399;
				font-weight: normal;
			}
		}

		.loading-spinner {
			width: 60rpx;
			height: 60rpx;
			border: 6rpx solid #f3f3f3;
			border-top: 6rpx solid #667eea;
			border-radius: 50%;
			animation: spin 1s linear infinite;
		}
	}
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
	padding: 24rpx 30rpx;
	padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
	display: flex;
	gap: 24rpx;

	.btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		border-radius: 44rpx;
		font-size: 30rpx;
		font-weight: bold;

		&.btn-primary {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
		}

		&.btn-secondary {
			background: #fff;
			color: #667eea;
			border: 2rpx solid #667eea;
		}

		&[disabled] {
			opacity: 0.5;
		}
	}
}
</style>
