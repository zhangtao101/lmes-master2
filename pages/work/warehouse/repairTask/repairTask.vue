<template>
	<view class="ware-house-container">
	<view class="box-body">
		<!-- 资产类型选择 -->
		<view class="asset-type-bar">
			<view
				class="asset-type-item"
				:class="{ active: currentAssetType === 'EQUIP' }"
				@click="onAssetTypeChange('EQUIP')"
			>
				<text>设备</text>
			</view>
			<view
				class="asset-type-item"
				:class="{ active: currentAssetType === 'MOLD' }"
				@click="onAssetTypeChange('MOLD')"
			>
				<text>模具</text>
			</view>
		</view>

		<!-- 搜索框 -->
		<view class="search-bar">
			<input
				class="search-input"
				v-model="searchKey"
				placeholder="输入关键字搜索"
				placeholder-style="color:#bbb;"
				@confirm="onSearch"
			/>
			<view class="search-btn" @click="onSearch">
				<text>查询</text>
			</view>
		</view>

		<!-- 任务列表 -->
		<view class="task-list" v-if="taskList.length > 0">
			<view class="task-card" v-for="(task, index) in taskList" :key="index" @click="onTaskClick(task)">
				<view class="task-header">
					<view class="task-title-wrapper">
						<text class="task-title">{{ task.repairCode || '维修任务' }}</text>
					</view>
					<view class="task-status-badge" :class="getStatusClass(task.status)">
						<text>{{ getStatusText(task.status) }}</text>
					</view>
				</view>
				<view class="task-body">
					<view class="task-row" v-if="task.equipmentCode">
						<text class="label">设备编码</text>
						<text class="value">{{ task.equipmentCode }}</text>
					</view>
					<view class="task-row" v-if="task.equipmentName">
						<text class="label">设备名称</text>
						<text class="value">{{ task.equipmentName }}</text>
					</view>
					<view class="task-row" v-if="task.moldCode">
						<text class="label">模具编码</text>
						<text class="value">{{ task.moldCode }}</text>
					</view>
					<view class="task-row" v-if="task.moldName">
						<text class="label">模具名称</text>
						<text class="value">{{ task.moldName }}</text>
					</view>
					<view class="task-row" v-if="task.repairType">
						<text class="label">报修类型</text>
						<text class="value">{{ task.repairType }}</text>
					</view>
					<view class="task-row" v-if="task.repairItem">
						<text class="label">报修事项</text>
						<text class="value">{{ task.repairItem }}</text>
					</view>
					<view class="task-row">
						<text class="label">报修时间</text>
						<text class="value">{{ task.createTime || '--' }}</text>
					</view>
				</view>
				<view class="task-footer">
					<uni-icons type="arrowright" size="16" color="#667eea"></uni-icons>
					<text>{{ task.status === 'DONE' ? '查看详情' : '进入维修' }}</text>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else-if="!loading && taskList.length === 0">
			<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
			<text>{{ searchKey ? '无匹配结果' : '暂无维修任务' }}</text>
		</view>
	</view>

	<!-- 加载遮罩 -->
	<view class="loading-mask" v-if="loading">
		<view class="loading-content">
			<uni-icons type="spinner-cycle" size="40" color="#667eea" class="loading-icon"></uni-icons>
			<text class="loading-text">加载中...</text>
		</view>
	</view>
	</view>
</template>

<script>
	import repairTaskApi from '/api/warehouse/repairTask.js'
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				currentAssetType: 'EQUIP',
				taskList: [],
				searchKey: '',
				loading: false
			}
		},
		onLoad() {
			this.loadTaskList()
		},
		onShow() {
			this.loadTaskList()
		},
		methods: {
			onAssetTypeChange(type) {
				if (this.currentAssetType === type) return
				this.currentAssetType = type
				this.loadTaskList()
			},

			onSearch() {
				this.loadTaskList()
			},

			getStatusClass(status) {
				switch (status) {
					case 'WAITING':
						return 'pending'
					case 'PROCESSING':
						return 'repairing'
					case 'PAUSED':
						return 'done'
					default:
						return 'pending'
				}
			},

			getStatusText(status) {
				switch (status) {
					case 'WAITING':
						return '待维修'
					case 'PROCESSING':
						return '维修中'
					case 'PAUSED':
						return '已完成'
					default:
						return '未知'
				}
			},

			loadTaskList() {
				this.loading = true
				const params = {
					assetType: this.currentAssetType
				}
				if (this.searchKey && this.searchKey.trim()) {
					params.keyword = this.searchKey.trim()
				}
				repairTaskApi.getMyRepairTasks(params).then(resp => {
					console.log('resp', resp)
					this.loading = false
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data?.results
						this.taskList = Array.isArray(data) ? data : []
					} else {
						this.taskList = []
						showBeautyToast({
							title: resp.msg || '加载失败',
							icon: 'none'
						})
					}
				}).catch(() => {
					this.loading = false
					this.taskList = []
					showBeautyToast({
						title: '加载失败',
						icon: 'none'
					})
				})
			},

			onTaskClick(task) {
				// 跳转到维修任务详情页（待创建）
				uni.navigateTo({
					url: `/pages/work/warehouse/repairTask/repairTaskDetails?taskId=${task.id || task.taskId}`
				})
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

	// ==================== 资产类型选择器 ====================
	.asset-type-bar {
		display: flex;
		background: #fff;
		border-radius: 16rpx;
		padding: 8rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.asset-type-item {
			flex: 1;
			text-align: center;
			padding: 16rpx 0;
			border-radius: 12rpx;
			font-size: 26rpx;
			color: #666;
			transition: all 0.25s;

			&.active {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				font-weight: 500;
				box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
			}
		}
	}

	// ==================== 搜索框 ====================
	.search-bar {
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 16rpx;
		padding: 8rpx 8rpx 8rpx 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.search-input {
			flex: 1;
			height: 64rpx;
			font-size: 26rpx;
			color: #333;
		}

		.search-btn {
			flex-shrink: 0;
			padding: 12rpx 30rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 12rpx;
			margin-left: 16rpx;

			text {
				font-size: 26rpx;
				color: #fff;
				font-weight: 500;
			}

			&:active {
				opacity: 0.85;
			}
		}
	}

	// ==================== 任务列表 ====================
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

		.task-title-wrapper {
			flex: 1;
			min-width: 0;

			.task-title {
				font-size: 30rpx;
				font-weight: bold;
				color: #fff;
			}
		}

		.task-status-badge {
			padding: 8rpx 20rpx;
			border-radius: 20rpx;
			font-size: 22rpx;
			font-weight: 500;
			flex-shrink: 0;

			&.pending {
				background: rgba(255, 193, 7, 0.25);
				color: #fff;
			}

			&.repairing {
				background: rgba(33, 150, 243, 0.25);
				color: #fff;
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
				flex-shrink: 0;
			}

			.value {
				font-size: 26rpx;
				color: #333;
				font-weight: 500;
				text-align: right;
				flex: 1;
				margin-left: 20rpx;
				word-break: break-all;
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

	// ==================== 空状态 ====================
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

	// ==================== 加载遮罩 ====================
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
