<template>
	<view class="ware-house-container">
	<view class="box-body">
		<!-- 任务基本信息 -->
		<view class="info-card">
			<view class="info-header">
				<text class="info-title">{{ detailData.planName || detailData.taskTypeName || '设备保养' }}</text>
				<view class="status-badge" :class="readonly ? 'done' : 'pending'">
					<text>{{ readonly ? '已完成' : '待执行' }}</text>
				</view>
			</view>
			<view class="info-body">
				<view class="info-row" v-if="detailData.equipmentCode">
					<text class="label">设备编码</text>
					<text class="value">{{ detailData.equipmentCode }}</text>
				</view>
				<view class="info-row" v-if="detailData.equipmentName">
					<text class="label">设备名称</text>
					<text class="value">{{ detailData.equipmentName }}</text>
				</view>
				<view class="info-row" v-if="detailData.moldCode">
					<text class="label">模具编码</text>
					<text class="value">{{ detailData.moldCode }}</text>
				</view>
				<view class="info-row" v-if="detailData.moldName">
					<text class="label">模具名称</text>
					<text class="value">{{ detailData.moldName }}</text>
				</view>
				<view class="info-row" v-if="readonly && detailData.recordNo">
					<text class="label">记录单号</text>
					<text class="value">{{ detailData.recordNo }}</text>
				</view>
				<view class="info-row" v-if="readonly && detailData.executedTime">
					<text class="label">执行时间</text>
					<text class="value">{{ detailData.executedTime }}</text>
				</view>
			</view>
		</view>

		<!-- 保养项列表 -->
		<view class="section-title">保养项</view>
		<view class="item-card" v-for="(item, index) in formItems" :key="index">
			<view class="item-info">
				<view class="item-name-row">
					<text class="item-index">{{ index + 1 }}.</text>
					<text class="item-name">{{ item.itemName || '--' }}</text>
				</view>
				<view class="item-desc" v-if="item.itemDescription">
					<text class="desc-label">保养说明：</text>
					<text class="desc-text">{{ item.itemDescription }}</text>
				</view>
			</view>
			<!-- 待执行：可编辑 -->
			<view class="item-form" v-if="!readonly">
				<view class="form-row">
					<text class="form-label">完成状态</text>
					<view class="radio-group">
						<view
							class="radio-item"
							:class="{ active: item.isCompleted === 1 }"
							@click="item.isCompleted = 1"
						>
							<text>已完成</text>
						</view>
						<view
							class="radio-item abnormal"
							:class="{ active: item.isCompleted === 0 }"
							@click="item.isCompleted = 0"
						>
							<text>未完成</text>
						</view>
					</view>
				</view>
				<view class="form-row">
					<text class="form-label">执行结果</text>
					<view class="radio-group">
						<view
							class="radio-item"
							:class="{ active: item.executeResult === 'SUCCESS' }"
							@click="item.executeResult = 'SUCCESS'"
						>
							<text>正常</text>
						</view>
						<view
							class="radio-item abnormal"
							:class="{ active: item.executeResult === 'FAIL' }"
							@click="item.executeResult = 'FAIL'"
						>
							<text>异常</text>
						</view>
					</view>
				</view>
				<view class="form-row">
					<text class="form-label">实际耗时(分钟)</text>
					<input class="form-input" type="number" v-model="item.actualMinutes" placeholder="请输入耗时" />
				</view>
				<view class="form-row column remark-row">
					<text class="form-label remark-label">备注</text>
					<textarea class="form-textarea" v-model="item.remark" placeholder="请输入备注" />
				</view>
			</view>
			<!-- 已完成：只读 -->
			<view class="item-form readonly" v-else>
				<view class="form-row">
					<text class="form-label">完成状态</text>
					<text class="form-value">{{ item.isCompleted === 1 ? '已完成' : '未完成' }}</text>
				</view>
				<view class="form-row">
					<text class="form-label">执行结果</text>
					<text class="form-value" :class="item.executeResult === 'FAIL' ? 'abnormal-text' : 'normal-text'">
						{{ item.executeResult === 'SUCCESS' ? '正常' : item.executeResult === 'FAIL' ? '异常' : '--' }}
					</text>
				</view>
				<view class="form-row" v-if="item.actualMinutes !== null && item.actualMinutes !== undefined">
					<text class="form-label">实际耗时</text>
					<text class="form-value">{{ item.actualMinutes }} 分钟</text>
				</view>
				<view class="form-row remark-row" v-if="item.remark">
					<text class="form-label remark-label">备注</text>
					<text class="form-value remark-value">{{ item.remark }}</text>
				</view>
			</view>
		</view>

		<!-- 总体结果 -->
		<view class="section-title">总体结果</view>
		<view class="overall-card">
			<view class="form-row">
				<text class="form-label">保养结果</text>
				<view class="radio-group" v-if="!readonly">
					<view
						class="radio-item"
						:class="{ active: overallResult === 'SUCCESS' }"
						@click="overallResult = 'SUCCESS'"
					>
						<text>正常</text>
					</view>
					<view
						class="radio-item abnormal"
						:class="{ active: overallResult === 'FAIL' }"
						@click="overallResult = 'FAIL'"
					>
						<text>异常</text>
					</view>
				</view>
				<text class="form-value" v-else :class="overallResult === 'FAIL' ? 'abnormal-text' : 'normal-text'">
					{{ overallResult === 'SUCCESS' ? '正常' : overallResult === 'FAIL' ? '异常' : '--' }}
				</text>
			</view>
			<view class="form-row column remark-row" v-if="!readonly || overallRemark">
				<text class="form-label remark-label">执行备注</text>
				<textarea
					v-if="!readonly"
					class="form-textarea"
					v-model="overallRemark"
					placeholder="请输入备注"
				/>
				<text class="form-value remark-value" v-else>{{ overallRemark }}</text>
			</view>
		</view>
	</view>

	<!-- 底部按钮（仅待执行显示） -->
	<view class="bottom-bar" v-if="!readonly">
		<view class="btn-reset" @click="onReset">
			<text>重置</text>
		</view>
		<view class="btn-submit" :class="{ 'btn-disabled': submitting }" @click="!submitting && onSubmit()">
			<text>{{ submitting ? '提交中...' : '确认提交' }}</text>
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
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				taskId: '',
				assetType: '',
				status: '',
				readonly: true,
				loading: false,
				submitting: false,
				detailData: {},
				formItems: [],
				overallResult: 'SUCCESS',
				overallRemark: ''
			}
		},
		onLoad(options) {
			this.taskId = options.taskId || ''
			this.loadDetail()
		},
		methods: {
			loadDetail() {
				this.loading = true
				equipmentSpotCheckApi.getMaintenanceDetail({ taskId: this.taskId }).then(res => {
					console.log(res);
					this.loading = false
					if (res.code == 200 || res.code == '200') {
						const data = res.data || {}
						this.detailData = data
						this.assetType = (data.taskType || '').startsWith('MOLD') ? 'MOLD' : 'EQUIP'
						this.status = data.status || 'PENDING'
						this.readonly = data.readonly !== false
						this.formItems = (data.items || []).map(item => ({
							...item,
							isCompleted: item.isCompleted !== undefined ? item.isCompleted : 1,
							executeResult: item.executeResult || 'SUCCESS',
							actualMinutes: item.actualMinutes !== undefined ? item.actualMinutes : '',
							remark: item.remark || ''
						}))
						this.overallResult = data.overallResult || 'SUCCESS'
						this.overallRemark = data.remark || ''
					} else {
						showBeautyToast({
							title: res.msg || '加载失败',
							icon: 'none'
						})
					}
				}).catch(() => {
					this.loading = false
					showBeautyToast({
						title: '加载失败',
						icon: 'none'
					})
				})
			},

			getOperatorName() {
				const user = uni.getStorageSync('user')
				return user?.name || user?.realName || user?.user_name || ''
			},

			onReset() {
				this.overallResult = 'SUCCESS'
				this.overallRemark = ''
				this.formItems = this.formItems.map(item => ({
					...item,
					isCompleted: 1,
					executeResult: 'SUCCESS',
					actualMinutes: '',
					remark: ''
				}))
			},

			onSubmit() {
				const hasEmpty = this.formItems.some(item => item.isCompleted === undefined || !item.executeResult)
				if (hasEmpty) {
					showBeautyToast({
						title: '请填写所有保养项的完成状态和执行结果',
						icon: 'none'
					})
					return
				}
				if (!this.overallResult) {
					showBeautyToast({
						title: '请选择总体结果',
						icon: 'none'
					})
					return
				}

				if (this.submitting) return
				this.submitting = true

				const operator = this.getOperatorName()
				const submitData = {
					assetType: this.assetType,
					planId: this.detailData.planId,
					operator: operator,
					maintenanceResult: this.overallResult,
					executeRemark: this.overallRemark,
					details: this.formItems.map(item => {
						const detail = {
							isCompleted: item.isCompleted,
							executeResult: item.executeResult,
							actualMinutes: item.actualMinutes ? Number(item.actualMinutes) : 0,
							remark: item.remark || ''
						}
						// 根据资产类型传对应的明细ID
						if (this.assetType === 'EQUIP') {
							detail.schemeDetailId = item.schemeDetailId
						} else {
							detail.planDetailId = item.planDetailId
						}
						detail.sequenceNo = item.sequenceNo
						return detail
					})
				}
				// 按assetType拼装资产字段
				if (this.assetType === 'EQUIP') {
					submitData.equipmentCode = this.detailData.equipmentCode || ''
					submitData.equipmentName = this.detailData.equipmentName || ''
				} else {
					submitData.moldCode = this.detailData.moldCode || ''
					submitData.moldName = this.detailData.moldName || ''
				}

				equipmentSpotCheckApi.submitMaintenance(submitData).then(res => {
					this.submitting = false
					if (res.code == 200 || res.code == '200') {
						showBeautyToast({
							title: '提交成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						showBeautyToast({
							title: res.msg || '提交失败',
							icon: 'none'
						})
					}
				}).catch(() => {
					this.submitting = false
					showBeautyToast({
						title: '提交失败',
						icon: 'none'
					})
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
		padding-bottom: 140rpx;
	}

	// ==================== 基本信息卡片 ====================
	.info-card {
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 20rpx;
	}

	.info-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 24rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.info-title {
			font-size: 30rpx;
			font-weight: bold;
			color: #fff;
			flex: 1;
			min-width: 0;
		}

		.status-badge {
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

	.info-body {
		padding: 24rpx 30rpx;
	}

	.info-row {
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

	// ==================== 分区标题 ====================
	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #222;
		padding: 24rpx 0 16rpx 24rpx;
		border-left: 6rpx solid #667eea;
		background-color: #f9f9ff;
		margin: 20rpx 0 10rpx 0;
		border-radius: 0 8rpx 8rpx 0;
	}

	// ==================== 保养项卡片 ====================
	.item-card {
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 16rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.item-info {
		padding: 24rpx 24rpx 0 24rpx;
	}

	.item-name-row {
		display: flex;
		align-items: flex-start;

		.item-index {
			font-size: 28rpx;
			color: #667eea;
			font-weight: bold;
			flex-shrink: 0;
			margin-right: 8rpx;
		}

		.item-name {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
			flex: 1;
		}
	}

	.item-desc {
		margin-top: 12rpx;
		display: flex;

		.desc-label {
			font-size: 24rpx;
			color: #999;
			flex-shrink: 0;
		}

		.desc-text {
			font-size: 24rpx;
			color: #666;
			flex: 1;
		}
	}

	.item-form {
		margin-top: 20rpx;
		border-top: 1rpx solid #f5f5f5;
		padding: 20rpx 24rpx;

		&.readonly {
			.form-value {
				font-size: 26rpx;
				color: #333;
				font-weight: 500;

				&.normal-text {
					color: #52c41a;
				}

				&.abnormal-text {
					color: #ff4d4f;
				}
			}
		}
	}

	.form-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8rpx 0;

		&:not(:last-child) {
			margin-bottom: 16rpx;
		}

		&.column {
			flex-direction: column;
			align-items: flex-start;

			.form-label {
				margin-bottom: 12rpx;
			}

			.form-textarea {
				width: 100%;
				box-sizing: border-box;
			}

			.form-value {
				width: 100%;
			}
		}

		.form-label {
			font-size: 26rpx;
			color: #666;
			flex-shrink: 0;
		}

		.form-input {
			flex: 1;
			height: 64rpx;
			border: 1rpx solid #e8e8e8;
			border-radius: 10rpx;
			padding: 0 16rpx;
			font-size: 26rpx;
			color: #333;
			margin-left: 20rpx;
			box-sizing: border-box;
		}

		.form-textarea {
			width: 100%;
			height: 140rpx;
			border: 1rpx solid #e8e8e8;
			border-radius: 10rpx;
			padding: 14rpx 16rpx;
			font-size: 26rpx;
			color: #333;
			box-sizing: border-box;
		}
	}

	// ==================== 单选组 ====================
	.radio-group {
		display: flex;
		gap: 0;

		.radio-item {
			padding: 10rpx 28rpx;
			border: 2rpx solid #e8e8e8;
			font-size: 24rpx;
			color: #666;
			transition: all 0.2s;

			&:first-child {
				border-radius: 10rpx 0 0 10rpx;
			}

			&:last-child {
				border-radius: 0 10rpx 10rpx 0;
			}

			&.active {
				background: #667eea;
				border-color: #667eea;
				color: #fff;
			}

			&.abnormal.active {
				background: #ff4d4f;
				border-color: #ff4d4f;
			}
		}
	}

	// ==================== 总体结果卡片 ====================
	.overall-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.form-value {
			font-size: 26rpx;
			color: #333;
			font-weight: 500;

			&.normal-text {
				color: #52c41a;
			}

			&.abnormal-text {
				color: #ff4d4f;
			}
		}
	}

	// ==================== 备注区域样式 ====================
	.remark-row {
		background-color: #f9f9f9;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-top: 12rpx;
		border-left: 4rpx solid #faad14;
	}

	.remark-label {
		font-weight: 600;
		color: #333;
	}

	.remark-value {
		color: #555;
		line-height: 1.6;
		margin-top: 8rpx;
		display: block;
	}

	// ==================== 底部按钮 ====================
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		background: #fff;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
		gap: 24rpx;
		z-index: 100;
	}

	.btn-reset {
		flex: 1;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 16rpx;
		border: 2rpx solid #d9d9d9;
		background: #fff;
		font-size: 30rpx;
		color: #666;
		transition: all 0.2s;

		&:active {
			background: #f5f5f5;
		}
	}

	.btn-submit {
		flex: 2;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 16rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
		box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.35);

		&:active {
			opacity: 0.85;
		}

		&.btn-disabled {
			opacity: 0.6;
			box-shadow: none;

			&:active {
				opacity: 0.6;
			}
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
