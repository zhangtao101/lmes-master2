<template>
	<view class="ware-house-container">
	<view class="box-body">
		<!-- 任务基本信息 -->
		<view class="info-card">
			<view class="info-header">
				<text class="info-title">{{ detailData.repairCode || '维修任务' }}</text>
				<view class="status-badge" :class="readonly ? 'done' : 'pending'">
					<text>{{ readonly ? '已完成' : '待维修' }}</text>
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
				<view class="info-row" v-if="detailData.repairType">
					<text class="label">报修类型</text>
					<text class="value">{{ detailData.repairType }}</text>
				</view>
				<view class="info-row" v-if="detailData.repairItem">
					<text class="label">报修事项</text>
					<text class="value">{{ detailData.repairItem }}</text>
				</view>
				<view class="info-row block" v-if="detailData.repairContent">
					<text class="label">报修内容</text>
					<text class="value">{{ detailData.repairContent }}</text>
				</view>
				<view class="info-row" v-if="readonly && detailData.repairDesc">
					<text class="label">报修描述</text>
					<text class="value">{{ detailData.repairDesc }}</text>
				</view>
				<view class="info-row" v-if="readonly && detailData.createTime">
					<text class="label">报修时间</text>
					<text class="value">{{ detailData.createTime }}</text>
				</view>
			</view>
		</view>

		<!-- 维修信息填写（仅待维修显示） -->
		<template v-if="!readonly">
			<view class="section-title">维修信息</view>
			<view class="form-card">
				<view class="form-row">
					<text class="form-label">维修结果</text>
					<view class="radio-group">
						<view
							class="radio-item"
							:class="{ active: repairResult === 'NORMAL' }"
							@click="repairResult = 'NORMAL'"
						>
							<text>已修复</text>
						</view>
						<view
							class="radio-item"
							:class="{ active: repairResult === 'PARTIAL' }"
							@click="repairResult = 'PARTIAL'"
						>
							<text>部分修复</text>
						</view>
						<view
							class="radio-item abnormal"
							:class="{ active: repairResult === 'FAILED' }"
							@click="repairResult = 'FAILED'"
						>
							<text>未修复</text>
						</view>
					</view>
				</view>
			<view class="form-row column">
				<text class="form-label remark-label">故障原因</text>
				<view v-if="faultCauseCustom" class="custom-input-wrap">
					<input
						class="custom-input"
						v-model="faultRootCause"
						placeholder="请输入故障原因"
					/>
					<view class="custom-back" @click="onBackToPicker">
						<uni-icons type="arrowleft" size="28" color="#667eea"></uni-icons>
						<text>返回选择</text>
					</view>
				</view>
				<view v-else class="select-field" @click="openFaultCausePicker">
					<text class="select-text" :class="{ placeholder: !faultRootCause }">{{ faultRootCause || '请选择故障原因' }}</text>
					<uni-icons type="search" size="30" color="#999" class="select-icon"></uni-icons>
				</view>
			</view>
				<view class="form-row column">
					<text class="form-label remark-label">维修内容</text>
					<textarea class="form-textarea" v-model="repairProject" placeholder="请输入维修内容" />
				</view>
			</view>
		</template>

		<!-- 维修结果查看（已完成显示） -->
		<template v-else>
			<view class="section-title">维修信息</view>
			<view class="form-card readonly-card">
				<view class="form-row remark-row" v-if="detailData.repairResult">
					<text class="form-label remark-label">维修结果</text>
					<text class="form-value remark-value">{{ formatRepairResult(detailData.repairResult) }}</text>
				</view>
				<view class="form-row remark-row" v-if="detailData.faultRootCause">
					<text class="form-label remark-label">故障原因</text>
					<text class="form-value remark-value">{{ detailData.faultRootCause }}</text>
				</view>
				<view class="form-row remark-row" v-if="detailData.repairProject">
					<text class="form-label remark-label">维修内容</text>
					<text class="form-value remark-value">{{ detailData.repairProject }}</text>
				</view>
			</view>
		</template>

		<!-- 故障原因选择弹窗 -->
		<view class="picker-mask" v-if="faultCauseVisible" @click="closeFaultCausePicker">
			<view class="picker-content" @click.stop>
				<view class="picker-header">
					<text class="picker-title">选择故障原因</text>
					<view class="picker-close" @click="closeFaultCausePicker">
						<uni-icons type="close" size="34" color="#999"></uni-icons>
					</view>
				</view>
				<view class="picker-search">
					<input
						class="picker-search-input"
						v-model="faultCauseKeyword"
						placeholder="搜索故障原因"
						@confirm="onFaultCauseSearchConfirm"
						@input="onFaultCauseKeywordInput"
					/>
				</view>
				<scroll-view class="picker-list" scroll-y>
					<view
						v-for="item in faultCauseOptions"
						:key="item.id"
						class="picker-item"
						:class="{ active: faultRootCause === item.configName }"
						@click="onFaultCauseSelect(item)"
					>
						<text>{{ item.configName }}</text>
						<uni-icons v-if="faultRootCause === item.configName" type="checkmark" size="30" color="#667eea"></uni-icons>
					</view>
					<view class="picker-empty" v-if="faultCauseOptions.length === 0">
						<text>暂无数据</text>
					</view>
				</scroll-view>
				<view class="picker-footer">
					<view class="picker-other-btn" :class="{ active: faultCauseCustom }" @click="onFaultCauseCustom">
						<text>其他（手动输入）</text>
					</view>
				</view>
			</view>
		</view>
	</view>

	<!-- 底部按钮（仅待维修显示） -->
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
	import repairTaskApi from '/api/warehouse/repairTask.js'
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				taskId: '',
				readonly: false,
				loading: false,
				submitting: false,
				detailData: {},
				// 维修信息表单
				repairResult: '',
				faultRootCause: '',
				repairProject: '',
				// 故障原因下拉
				faultCauseVisible: false,
				faultCauseOptions: [],
				faultCauseKeyword: '',
				faultCauseTimer: null,
				faultCauseCustom: false,
				faultRootCauseCode: '',
				faultRootCauseSource: ''
			}
		},
		onLoad(options) {
			this.taskId = options.taskId || ''
			this.loadDetail()
		},
		methods: {
			formatRepairResult(result) {
				const resultMap = {
					'NORMAL': '已修复',
					'PARTIAL': '部分修复',
					'FAILED': '未修复'
				}
				return resultMap[result] || result || '--'
			},

			loadDetail() {
				this.loading = true
				const params = {
					taskId: this.taskId
				}
				repairTaskApi.getRepairTaskDetail(params).then(resp => {
					this.loading = false
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data || {}
						this.detailData = data
						this.readonly = data.status === 'DONE'
						
						// 如果是查看模式，填充表单数据
						if (this.readonly) {
							this.repairResult = data.repairResult || ''
							this.faultRootCause = data.faultRootCause || ''
							this.repairProject = data.repairProject || ''
						}
					} else {
						showBeautyToast({
							title: resp.msg || '加载失败',
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
				this.repairResult = ''
				this.faultRootCause = ''
				this.repairProject = ''
				this.faultCauseCustom = false
				this.faultRootCauseCode = ''
				this.faultRootCauseSource = ''
			},

			// ==================== 故障原因下拉 ====================
			openFaultCausePicker() {
				this.faultCauseVisible = true
				this.loadFaultCauseList(this.faultCauseKeyword)
			},

			closeFaultCausePicker() {
				this.faultCauseVisible = false
			},

			loadFaultCauseList(keyword) {
				const _this = this
				repairTaskApi.getFaultCauseList({ keyword: keyword || '' }).then(resp => {
					if (resp.code == 200 || resp.code == '200') {
						_this.faultCauseOptions = resp.data || []
					} else {
						_this.faultCauseOptions = []
					}
				}).catch(() => {
					_this.faultCauseOptions = []
				})
			},

			onFaultCauseSearchConfirm() {
				const _this = this
				setTimeout(function() {
					_this.loadFaultCauseList(_this.faultCauseKeyword)
				}, 200)
			},

			onFaultCauseKeywordInput(e) {
				const _this = this
				const val = e.detail.value
				clearTimeout(this.faultCauseTimer)
				this.faultCauseTimer = setTimeout(function() {
					_this.loadFaultCauseList(val)
				}, 300)
			},

			onFaultCauseSelect(item) {
				this.faultRootCause = item.configName
				this.faultRootCauseCode = item.configCode || ''
				this.faultRootCauseSource = ''
				this.faultCauseCustom = false
				this.faultCauseVisible = false
			},

			onFaultCauseCustom() {
				this.faultCauseCustom = true
				this.faultRootCause = ''
				this.faultRootCauseCode = ''
				this.faultRootCauseSource = '1'
				this.faultCauseVisible = false
			},

			onBackToPicker() {
				this.faultCauseCustom = false
				this.openFaultCausePicker()
			},

			onSubmit() {
				if (!this.repairResult.trim()) {
					showBeautyToast({
						title: '请输入维修结果',
						icon: 'none'
					})
					return
				}
				
				if (!this.faultRootCause.trim()) {
					showBeautyToast({
						title: '请输入故障原因',
						icon: 'none'
					})
					return
				}
				
				if (!this.repairProject.trim()) {
					showBeautyToast({
						title: '请输入维修内容',
						icon: 'none'
					})
					return
				}

				if (this.submitting) return
				this.submitting = true

				const operator = this.getOperatorName()
				const submitData = {
					taskId: this.taskId,
					repairResult: this.repairResult,
					faultRootCause: this.faultRootCause,
					faultRootCauseCode: this.faultRootCauseCode,
					faultRootCauseSource: this.faultRootCauseSource,
					repairProject: this.repairProject,
					operator: operator
				}

				repairTaskApi.submitRepairReport(submitData).then(resp => {
					this.submitting = false
					if (resp.code == 200 || resp.code == '200') {
						showBeautyToast({
							title: '提交成功',
							icon: 'success'
						})
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					} else {
						showBeautyToast({
							title: resp.msg || '提交失败',
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
				background: rgba(255, 193, 7, 0.25);
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

		// 长文本字段（如报修内容）：纵向排列，自动换行
		&.block {
			flex-direction: column;
			align-items: flex-start;

			.label {
				margin-bottom: 8rpx;
			}

			.value {
				text-align: left;
				margin-left: 0;
				line-height: 1.6;
			}
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

	// ==================== 表单卡片 ====================
	.form-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
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

	// ==================== 故障原因下拉选择 ====================
	.select-field {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		box-sizing: border-box;
		height: 64rpx;
		border: 1rpx solid #e8e8e8;
		border-radius: 10rpx;
		padding: 0 16rpx;
		background: #fff;

		.select-text {
			font-size: 26rpx;
			color: #333;
			flex: 1;
			margin-right: 12rpx;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;

			&.placeholder {
				color: #bbb;
			}
		}

		.select-icon {
			flex-shrink: 0;
		}
	}

	// 选择弹窗
	.picker-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		z-index: 1000;

		.picker-content {
			width: 100%;
			background: #fff;
			border-radius: 24rpx 24rpx 0 0;
			max-height: 70vh;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}

		.picker-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 28rpx 30rpx;
			border-bottom: 1rpx solid #f0f0f0;

			.picker-title {
				font-size: 30rpx;
				font-weight: 600;
				color: #222;
			}
		}

		.picker-search {
			padding: 20rpx 30rpx;
			border-bottom: 1rpx solid #f0f0f0;

			.picker-search-input {
				height: 68rpx;
				background: #f5f7fa;
				border-radius: 34rpx;
				padding: 0 28rpx;
				font-size: 26rpx;
				color: #333;
				box-sizing: border-box;
			}
		}

		.picker-list {
			max-height: 50vh;
			padding: 10rpx 0;
		}

		.picker-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 26rpx 30rpx;
			font-size: 28rpx;
			color: #333;
			border-bottom: 1rpx solid #f5f5f5;

			&.active {
				color: #667eea;
				font-weight: 600;
				background: #f9f9ff;
			}
		}

		.picker-footer {
			padding: 20rpx 30rpx;
			border-top: 1rpx solid #f0f0f0;
			background: #fff;
		}

		.picker-other-btn {
			height: 84rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 42rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
			font-size: 28rpx;
			font-weight: 600;
			box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.35);

			&.active {
				opacity: 0.7;
			}

			&:active {
				opacity: 0.85;
			}
		}

		.picker-empty {
			padding: 60rpx 0;
			text-align: center;
			font-size: 26rpx;
			color: #999;
		}
	}

	// ==================== 故障原因自定义输入 ====================
	.custom-input-wrap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		box-sizing: border-box;

		.custom-input {
			flex: 1;
			height: 64rpx;
			border: 1rpx solid #e8e8e8;
			border-radius: 10rpx;
			padding: 0 16rpx;
			font-size: 26rpx;
			color: #333;
			box-sizing: border-box;
			margin-right: 16rpx;
		}

		.custom-back {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: #667eea;
			flex-shrink: 0;
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

	// ==================== 只读卡片 ====================
	.readonly-card {
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
