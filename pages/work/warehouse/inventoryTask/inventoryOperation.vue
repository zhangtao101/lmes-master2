<template>
	<view class="ware-house-container">
		<view class="box-body">
			<!-- 任务基本信息卡片 -->
			<view class="task-info-card">
				<view class="task-header">
					<view class="task-code-wrapper">
						<text class="task-code">任务信息</text>
					</view>
				</view>
				<view class="task-body">
					<view class="task-row">
						<text class="label">盘点任务号</text>
						<text class="value">{{taskCode || '--'}}</text>
					</view>
					<view class="task-row">
						<text class="label">盘点计划号</text>
						<text class="value">{{stocktakingCode || '--'}}</text>
					</view>
					<view class="task-row">
						<text class="label">盘点计划名称</text>
						<text class="value">{{stocktakingName || '--'}}</text>
					</view>

				</view>
			</view>

			<!-- 料号清单 -->
			<view class="material-section">
				<view class="section-header">
					<view class="left">
						<uni-icons type="list" color="#fff" size="18"></uni-icons>
						<text>料号清单</text>
						<text class="count">({{materialList.length}})</text>
					</view>
				</view>

				<view class="material-list" v-if="materialList.length > 0">
					<view class="material-card" v-for="(item, index) in materialList" :key="index" @click="onMaterialClick(item)">
						<view class="material-header">
							<view class="material-code-wrapper">
								<text class="material-code">{{item.materialCode || '--'}}</text>
							</view>
							<view class="material-status" :class="item.checkState ? 'checked' : 'unchecked'">
								<text>{{item.checkState ? '已盘' : '未盘'}}</text>
							</view>
						</view>
						<view class="material-body">
							<view class="material-row">
								<text class="m-label">物料编号</text>
								<text class="m-value">{{item.materialCode || '--'}}</text>
							</view>
							<view class="material-row">
								<text class="m-label">物料名称</text>
								<text class="m-value">{{item.materialName || '--'}}</text>
							</view>
							<view class="material-row">
								<text class="m-label">在库数量</text>
								<text class="m-value">{{item.stockNumber || '--'}}</text>
							</view>
							<view class="material-row">
								<text class="m-label">盘点数量</text>
								<text class="m-value">{{item.checkNumber || '--'}}</text>
							</view>
							<view class="material-row">
								<text class="m-label">盘点状态</text>
								<text class="m-value">{{item.checkStateName || '--'}}</text>
							</view>
						</view>
						<view class="material-footer">
							<uni-icons type="arrowright" size="16" color="#667eea"></uni-icons>
							<text>进入盘点</text>
						</view>
					</view>
				</view>

				<view class="empty-state" v-else-if="!loadingMaterial">
					<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
					<text>暂无料号</text>
				</view>
			</view>
		</view>

		<!-- 加载遮罩 -->
		<view class="loading-mask" v-if="loadingMaterial">
			<view class="loading-content">
				<uni-icons type="spinner-cycle" size="40" color="#667eea" class="loading-icon"></uni-icons>
				<text class="loading-text">加载中...</text>
			</view>
		</view>
	</view>
</template>

<script>
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
				materialList: [],
				loadingMaterial: false
			}
		},
		onLoad(options) {
			this.recordId = options.recordId || '';
			this.taskCode = decodeURIComponent(options.taskCode || '');
			this.stocktakingCode = decodeURIComponent(options.stocktakingCode || '');
			this.stocktakingName = decodeURIComponent(options.stocktakingName || '');
			this.taskState = options.taskState || null;
			this.loadMaterialList();
		},
		onShow() {
			if (this.recordId) {
				this.loadMaterialList();
			}
		},
		methods: {
			// 加载料号列表
			loadMaterialList() {
				this.loadingMaterial = true;
				inventoryTaskApi.getMaterialListById(this.recordId).then(resp => {
					console.log('resp', resp);
					this.loadingMaterial = false;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data;
						if (Array.isArray(data)) {
							this.materialList = data.map(item => ({
								...item,
								checked: item.checked || false
							}));
						} else {
							this.materialList = [];
						}
					} else {
						showBeautyToast({
							title: resp.msg || '加载料号失败',
							icon: 'none'
						});
					}
				}).catch(() => {
					this.loadingMaterial = false;
					showBeautyToast({
						title: '加载料号失败',
						icon: 'none'
					});
				});
			},

			// 点击料号，跳转到盘点明细页
			onMaterialClick(item) {
				uni.navigateTo({
					url: '/pages/work/warehouse/inventoryTask/inventoryDetail' +
						'?recordId=' + this.recordId +
						'&taskCode=' + encodeURIComponent(this.taskCode || '') +
						'&stocktakingCode=' + encodeURIComponent(this.stocktakingCode || '') +
						'&stocktakingName=' + encodeURIComponent(this.stocktakingName || '') +
						'&taskState=' + (this.taskState != null ? this.taskState : '') +
						'&materialCode=' + (item.materialCode || '') +
						'&materialName=' + (item.materialName || '')
				});
			},

			formatTaskState(state) {
				if (state == null || state === '') return '--';
				const num = Number(state);
				if (num === -1) return '未执行';
				if (num === 1) return '执行中';
				if (num === 2) return '已完成';
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
		padding-bottom: 40rpx;
	}

	.box-body {
		padding: 20rpx;
	}

	// 任务信息卡片
	.task-info-card {
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 30rpx;
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

	// 料号清单区域
	.material-section {

		.section-header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 30rpx;

			.left {
				display: flex;
				align-items: center;
				gap: 12rpx;

				text {
					color: #fff;
					font-size: 28rpx;
					font-weight: 500;
				}

				.count {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.8);
				}
			}
		}

		.material-list {
			padding: 20rpx;
		}

		.material-card {
			background: #f8f9fb;
			border-radius: 16rpx;
			margin-bottom: 16rpx;
			overflow: hidden;
			border: 2rpx solid #e8eaf0;
			transition: all 0.2s;

			&:last-child {
				margin-bottom: 0;
			}

			&:active {
				transform: scale(0.98);
				border-color: #667eea;
			}
		}

		.material-header {
			background: linear-gradient(135deg, #a0a8e0 0%, #9b7db5 100%);
			padding: 20rpx 24rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.material-code-wrapper {
				flex: 1;
				min-width: 0;

				.material-code {
					font-size: 28rpx;
					font-weight: bold;
					color: #fff;
				}
			}

			.material-status {
				padding: 6rpx 18rpx;
				border-radius: 16rpx;
				font-size: 22rpx;
				font-weight: 500;
				flex-shrink: 0;

				&.checked {
					background: rgba(82, 196, 26, 0.2);
					color: #52c41a;
					border: 1rpx solid rgba(82, 196, 26, 0.4);
				}

				&.unchecked {
					background: rgba(255, 255, 255, 0.25);
					color: #fff;
				}
			}
		}

		.material-body {
			padding: 20rpx 24rpx;

			.material-row {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.m-label {
					font-size: 26rpx;
					color: #999;
				}

				.m-value {
					font-size: 26rpx;
					color: #333;
					font-weight: 500;
					text-align: right;
					flex: 1;
					margin-left: 20rpx;
				}
			}
		}

		.material-footer {
			padding: 14rpx 24rpx;
			background: #fff;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			border-top: 1rpx solid #e8eaf0;

			text {
				font-size: 24rpx;
				color: #667eea;
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
