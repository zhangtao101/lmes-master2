<template>
	<view class="ware-house-container">
		<view class="box-body">
			<view class="task-list" v-if="taskList.length > 0">
				<view class="task-card" v-for="(task, index) in taskList" :key="index" @click="onTaskClick(task)">
					<view class="task-header">
						<view class="task-code-wrapper">
							<text class="task-code">{{task.taskCode || '--'}}</text>
						</view>
						<view class="task-status" :class="statusClass(task.status)">
							<text>{{task.statusName || task.status || '--'}}</text>
						</view>
					</view>
					<view class="task-body">
						<view class="task-row">
							<text class="label">{{$t('warehouse.inventoryTaskNo')}}</text>
							<text class="value">{{task.taskCode || task.typeName || '--'}}</text>
						</view>
						<view class="task-row">
							<text class="label">{{$t('warehouse.inventoryPlanNo')}}</text>
							<text class="value">{{task.stocktakingCode || task.typeName || '--'}}</text>
						</view>
						<view class="task-row">
							<text class="label">{{$t('warehouse.inventoryPlanName')}}</text>
							<text class="value">{{task.stocktakingName || task.typeName || '--'}}</text>
						</view>
						<view class="task-row">
							<text class="label">{{$t('warehouse.inventoryStatus')}}</text>
							<text class="value status-text" :class="taskStateClass(task.taskState)">{{formatTaskState(task.taskState)}}</text>
						</view>
					</view>
					<view class="task-footer">
						<uni-icons type="arrowright" size="16" color="#667eea"></uni-icons>
						<text>{{$t('warehouse.enterInventory')}}</text>
					</view>
				</view>
			</view>
			<view class="empty-state" v-else-if="!loading">
				<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
				<text>{{$t('warehouse.noPendingTask')}}</text>
			</view>
			<view class="load-more" v-if="taskList.length > 0">
				<text v-if="loadingMore" class="loading-text">
					<uni-icons type="spinner-cycle" size="14" color="#999" class="spin-icon"></uni-icons>
					{{$t('warehouse.loadingDots')}}
				</text>
				<text v-else-if="!hasMore" class="no-more">{{$t('warehouse.noMore')}}</text>
			</view>
		</view>

		<!-- 加载遮罩 -->
		<view class="loading-mask" v-if="loading">
			<view class="loading-content">
				<uni-icons type="spinner-cycle" size="40" color="#667eea" class="loading-icon"></uni-icons>
				<text class="loading-text">{{$t('warehouse.loadingDots')}}</text>
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
				taskList: [],
				loading: false,
				loadingMore: false,
				pageNum: 1,
				pageSize: 10,
				hasMore: true
			}
		},
		onLoad() {
			this.loadTaskList();
		},
		onShow() {
			this.loadTaskList();
		},
		onReachBottom() {
			if (this.hasMore && !this.loadingMore) {
				this.loadMore();
			}
		},
		methods: {
			loadTaskList() {
				this.loading = true;
				this.pageNum = 1;
				inventoryTaskApi.getTodoList(this.pageSize, this.pageNum).then(resp => {
					this.loading = false;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data.list;
						if (Array.isArray(data)) {
							this.taskList = data;
							this.hasMore = data.length >= this.pageSize;
						} else if (data && data.records) {
							this.taskList = data.records;
							this.hasMore = data.current < data.pages;
						} else {
							this.taskList = [];
							this.hasMore = false;
						}
					} else {
						showBeautyToast({
							title: resp.msg || this.$t('warehouse.loadFail'),
							icon: 'none'
						});
					}
				}).catch(() => {
					this.loading = false;
					showBeautyToast({
						title: this.$t('warehouse.loadFail'),
						icon: 'none'
					});
				});
			},
			loadMore() {
				this.loadingMore = true;
				this.pageNum++;
				inventoryTaskApi.getTodoList(this.pageSize, this.pageNum).then(resp => {
					this.loadingMore = false;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data;
						let newList = [];
						if (Array.isArray(data)) {
							newList = data;
						} else if (data && data.records) {
							newList = data.records;
							this.hasMore = data.current < data.pages;
						} else {
							this.hasMore = false;
						}
						if (newList.length === 0) {
							this.hasMore = false;
						}
						this.taskList = [...this.taskList, ...newList];
					} else {
						this.pageNum--;
						showBeautyToast({
							title: resp.msg || this.$t('warehouse.loadFail'),
							icon: 'none'
						});
					}
				}).catch(() => {
					this.loadingMore = false;
					this.pageNum--;
				});
			},
		onTaskClick(task) {
			uni.navigateTo({
				url: '/pages/work/warehouse/inventoryTask/inventoryOperation' +
					'?recordId=' + task.id +
					'&taskCode=' + encodeURIComponent(task.taskCode || '') +
					'&stocktakingCode=' + encodeURIComponent(task.stocktakingCode || '') +
					'&stocktakingName=' + encodeURIComponent(task.stocktakingName || '') +
					'&taskState=' + (task.taskState != null ? task.taskState : '')
			});
		},
			statusClass(status) {
				if (!status) return '';
				if (status === '待执行' || status === 'PENDING' || status === 'TODO') return 'pending';
				if (status === '执行中' || status === 'IN_PROGRESS') return 'progress';
				if (status === '已完成' || status === 'DONE' || status === 'FINISHED') return 'done';
				return '';
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
		padding-bottom: 40rpx;
	}

	.task-list {
		padding: 0;
	}

	.task-card {
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		transition: all 0.2s;

		&:active {
			transform: scale(0.98);
			box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.06);
		}
	}

	.task-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 24rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.task-code-wrapper {
			flex: 1;
			min-width: 0;

			.task-code {
				font-size: 30rpx;
				font-weight: bold;
				color: #fff;
			}
		}

		.task-status {
			padding: 8rpx 20rpx;
			border-radius: 20rpx;
			font-size: 22rpx;
			font-weight: 500;
			flex-shrink: 0;

			&.pending {
				background: rgba(255, 255, 255, 0.25);
				color: #fff;
			}

			&.progress {
				background: rgba(82, 196, 26, 0.2);
				color: #52c41a;
				border: 1rpx solid rgba(82, 196, 26, 0.4);
			}

			&.done {
				background: rgba(255, 255, 255, 0.15);
				color: rgba(255, 255, 255, 0.7);
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

	.task-footer {
		padding: 16rpx 30rpx;
		background: #f8f9fb;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		border-top: 1rpx solid #f0f0f0;

		text {
			font-size: 24rpx;
			color: #667eea;
		}
	}

	.empty-state {
		padding: 120rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;

		text {
			font-size: 28rpx;
			color: #999;
		}
	}

	.load-more {
		padding: 30rpx;
		text-align: center;

		text {
			font-size: 24rpx;
			color: #999;
		}

		.spin-icon {
			animation: spin 1s linear infinite;
			display: inline-block;
			vertical-align: middle;
			margin-right: 8rpx;
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
