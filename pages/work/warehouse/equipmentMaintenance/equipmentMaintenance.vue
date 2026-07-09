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

		<!-- 状态 Tab -->
		<view class="status-tabs">
			<view
				class="tab-item"
				:class="{ active: currentStatus === 'PENDING' }"
				@click="onStatusChange('PENDING')"
			>
				<text>待执行</text>
			</view>
			<view
				class="tab-item"
				:class="{ active: currentStatus === 'DONE' }"
				@click="onStatusChange('DONE')"
			>
				<text>已完成</text>
			</view>
		</view>

		<!-- 搜索框 -->
		<view class="search-bar">
			<input
				class="search-input"
				:value="searchKey"
				@input="onSearchInput"
				placeholder="输入计划名称/设备编码/模具编码搜索"
				placeholder-style="color:#bbb;"
			/>
			<view class="search-clear" v-if="searchKey" @click="onClearSearch">
				<uni-icons type="clear" size="16" color="#999"></uni-icons>
			</view>
			<view class="search-scan" @click="onScanCode">
				<uni-icons type="scan" size="18" color="#fff"></uni-icons>
			</view>
		</view>

		<!-- 任务列表 -->
		<view class="task-list" v-if="filteredTaskList.length > 0">
			<view class="task-card" v-for="(task, index) in filteredTaskList" :key="index" @click="onTaskClick(task)">
				<view class="task-header">
					<view class="task-title-wrapper">
						<text class="task-title">{{ task.taskTypeName || '设备保养' }}</text>
					</view>
					<view class="task-status-badge" :class="currentStatus === 'PENDING' ? 'pending' : 'done'">
						<text>{{ currentStatus === 'PENDING' ? '待执行' : '已完成' }}</text>
					</view>
				</view>
				<view class="task-body">
					<view class="task-row">
						<text class="label">计划名称</text>
						<text class="value">{{ task.planName || '--' }}</text>
					</view>
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
					<view class="task-row">
						<text class="label">任务时间</text>
						<text class="value">{{ task.taskTime || '--' }}</text>
					</view>
				</view>
				<view class="task-footer">
					<uni-icons type="arrowright" size="16" color="#667eea"></uni-icons>
					<text>{{ currentStatus === 'PENDING' ? '进入保养' : '查看详情' }}</text>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else-if="!loading && filteredTaskList.length === 0">
			<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
			<text>{{ searchKey ? '无匹配结果' : '暂无' + (currentStatus === 'PENDING' ? '待执行' : '已完成') + '任务' }}</text>
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
import equipmentSpotCheckApi from '/api/warehouse/equipmentSpotCheck.js'
import scanCode from '/common/scan.js'
import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				currentAssetType: 'EQUIP',
				currentStatus: 'PENDING',
				taskList: [],
				searchKey: '',
				loading: false,
				_searchTimer: null
			}
		},
		computed: {
			filteredTaskList() {
				const key = (this.searchKey || '').trim().toLowerCase()
				if (!key) return this.taskList
				return this.taskList.filter(task => {
					const fields = [
						task.planName,
						task.equipmentCode,
						task.equipmentName,
						task.moldCode,
						task.moldName,
						task.taskTypeName
					]
					return fields.some(f => f && f.toLowerCase().includes(key))
				})
			}
		},
		onLoad() {
			this.loadTaskList()
		},
		onShow() {
			this.loadTaskList()
		},
		onUnload() {
			clearTimeout(this._searchTimer)
		},
		methods: {
			onAssetTypeChange(type) {
				if (this.currentAssetType === type) return
				this.currentAssetType = type
				this.loadTaskList()
			},

			onStatusChange(status) {
				if (this.currentStatus === status) return
				this.currentStatus = status
				this.loadTaskList()
			},

			onSearchInput(e) {
				const val = e.detail.value || e.target.value || ''
				clearTimeout(this._searchTimer)
				this._searchTimer = setTimeout(() => {
					this.searchKey = val
				}, 300)
			},

			onClearSearch() {
				clearTimeout(this._searchTimer)
				this.searchKey = ''
			},

			// 扫码搜索
			onScanCode() {
				const _this = this;
				scanCode().then((code) => {
					_this.searchKey = code;
				}).catch(err => {
					showBeautyToast({
						title: err || '扫码失败',
						icon: 'none'
					});
				});
			},

			loadTaskList() {
				this.loading = true
				const params = {
					status: this.currentStatus,
					assetType: this.currentAssetType
				}
				equipmentSpotCheckApi.getMaintenanceTaskList(params).then(resp => {
					this.loading = false
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data
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
				uni.navigateTo({
					url: `/pages/work/warehouse/equipmentMaintenance/equipmentMaintenanceDetails?taskId=${task.taskId}`
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

	// ==================== 状态 Tab ====================
	.status-tabs {
		display: flex;
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 24rpx 0;
			font-size: 28rpx;
			color: #666;
			position: relative;
			transition: all 0.25s;

			&.active {
				color: #667eea;
				font-weight: bold;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 60rpx;
					height: 6rpx;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border-radius: 3rpx;
				}
			}
		}
	}

	// ==================== 搜索框 ====================
	.search-bar {
		display: flex;
		align-items: center;
		background: #fff;
		border-radius: 16rpx;
		padding: 8rpx 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.search-input {
			flex: 1;
			height: 64rpx;
			font-size: 26rpx;
			color: #333;
		}

		.search-clear {
			flex-shrink: 0;
			padding: 10rpx;
		}

		.search-scan {
			flex-shrink: 0;
			width: 80rpx;
			height: 80rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 12rpx;
			margin-left: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
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
				background: rgba(255, 255, 255, 0.25);
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
