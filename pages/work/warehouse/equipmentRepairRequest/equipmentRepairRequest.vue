<template>
	<view class="ware-house-container">
	<view class="box-body">
		<!-- 资产类型选择 -->
		<view class="asset-type-bar">
			<view
				class="asset-type-item"
				:class="{ active: assetType === 'EQUIP' }"
				@click="onAssetTypeChange('EQUIP')"
			>
				<text>设备报修</text>
			</view>
			<view
				class="asset-type-item"
				:class="{ active: assetType === 'MOLD' }"
				@click="onAssetTypeChange('MOLD')"
			>
				<text>模具报修</text>
			</view>
		</view>

		<!-- 扫码区域 -->
		<view class="scan-section">
			<view class="scan-btn" @click="onScanCode">
				<uni-icons type="scan" size="24" color="#667eea"></uni-icons>
				<text>扫码获取{{ assetType === 'EQUIP' ? '设备' : '模具' }}信息</text>
			</view>
			<view class="manual-input" v-if="assetType === 'EQUIP'">
				<input
					class="input-field"
					v-model="equipmentCode"
					placeholder="手动输入设备编码"
					@confirm="onQueryEquipment"
				/>
				<view class="query-btn" @click="onQueryEquipment">
					<text>查询</text>
				</view>
			</view>
			<view class="manual-input" v-else>
				<input
					class="input-field"
					v-model="moldCode"
					placeholder="手动输入模具编码"
					@confirm="onQueryMold"
				/>
				<view class="query-btn" @click="onQueryMold">
					<text>查询</text>
				</view>
			</view>
		</view>

		<!-- 基本信息展示 -->
		<view class="info-card" v-if="assetInfo.id">
			<view class="info-header">
				<text class="info-title">{{ assetType === 'EQUIP' ? '设备信息' : '模具信息' }}</text>
			</view>
			<view class="info-body">
				<view class="info-row" v-if="assetInfo.equipmentCode || assetInfo.moldCode">
					<text class="label">{{ assetType === 'EQUIP' ? '设备编码' : '模具编码' }}</text>
					<text class="value">{{ assetInfo.equipmentCode || assetInfo.moldCode }}</text>
				</view>
				<view class="info-row" v-if="assetInfo.equipmentName || assetInfo.moldName">
					<text class="label">{{ assetType === 'EQUIP' ? '设备名称' : '模具名称' }}</text>
					<text class="value">{{ assetInfo.equipmentName || assetInfo.moldName }}</text>
				</view>
				<view class="info-row" v-if="assetInfo.statusName">
					<text class="label">状态</text>
					<text class="value">{{ assetInfo.statusName }}</text>
				</view>
				<view class="info-row" v-if="assetInfo.currentStatusName">
					<text class="label">业务状态</text>
					<text class="value">{{ assetInfo.currentStatusName }}</text>
				</view>
			</view>
		</view>

		<!-- 报修填报 -->
		<view class="form-section">
			<view class="section-title">报修信息</view>
			
			<view class="form-card">
				<view class="form-row">
					<text class="form-label">报修类型</text>
					<picker
						class="form-picker"
						:value="repairTypeIndex"
						:range="repairTypeList"
						range-key="configName"
						@change="onRepairTypeChange"
					>
						<view class="picker-value">
							<text>{{ repairTypeIndex >= 0 ? repairTypeList[repairTypeIndex].configName : '请选择报修类型' }}</text>
							<uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-row">
					<text class="form-label">报修事项</text>
					<picker
						class="form-picker"
						:value="repairItemIndex"
						:range="repairItemList"
						range-key="configName"
						@change="onRepairItemChange"
					>
						<view class="picker-value">
							<text>{{ repairItemIndex >= 0 ? repairItemList[repairItemIndex].configName : '请选择报修事项' }}</text>
							<uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="form-row">
					<text class="form-label">受理周期(小时)</text>
					<input
						class="form-input"
						type="number"
						v-model="acceptPeriod"
						placeholder="请输入受理周期"
					/>
				</view>

				<view class="form-row column">
					<text class="form-label">报修内容</text>
					<textarea
						class="form-textarea"
						v-model="repairContent"
						placeholder="请输入报修内容"
					/>
				</view>
			</view>
		</view>
	</view>

	<!-- 底部按钮 -->
	<view class="bottom-bar">
		<view class="btn-reset" @click="onReset">
			<text>重置</text>
		</view>
		<view class="btn-submit" @click="onSubmit">
			<text>确认提交</text>
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
	import equipmentRepairRequestApi from '/api/warehouse/equipmentRepairRequest.js'
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				assetType: 'EQUIP', // EQUIP-设备报修, MOLD-模具报修
				equipmentCode: '',
				moldCode: '',
				assetInfo: {},
				repairTypeList: [],
				repairTypeIndex: -1,
				repairItemList: [],
				repairItemIndex: -1,
				acceptPeriod: '',
				repairContent: '',
				loading: false,
				submitting: false
			}
		},
		onLoad() {
			this.loadBaseConfig()
		},
		methods: {
			// 加载基础配置
			loadBaseConfig() {
				// 加载报修类型
				equipmentRepairRequestApi.getBaseConfigList({
					configType: 'REPAIR_TYPE',
					status: 'ACTIVE'
				}).then(res => {
					if (res.code == 200 || res.code == '200') {
						this.repairTypeList = res.data || []
					}
				}).catch(() => {
					showBeautyToast({
						title: '加载报修类型失败',
						icon: 'none'
					})
				})

				// 加载报修事项
				equipmentRepairRequestApi.getBaseConfigList({
					configType: 'REPAIR_ITEM',
					status: 'ACTIVE'
				}).then(res => {
					if (res.code == 200 || res.code == '200') {
						this.repairItemList = res.data || []
					}
				}).catch(() => {
					showBeautyToast({
						title: '加载报修事项失败',
						icon: 'none'
					})
				})
			},

			// 资产类型切换
			onAssetTypeChange(type) {
				this.assetType = type
				this.resetAssetInfo()
			},

			// 扫码
			onScanCode() {
				uni.scanCode({
					scanType: ['barCode', 'qrCode'],
					success: (res) => {
						const code = res.result
						if (this.assetType === 'EQUIP') {
							this.equipmentCode = code
							this.onQueryEquipment()
						} else {
							this.moldCode = code
							this.onQueryMold()
						}
					},
					fail: () => {
						showBeautyToast({
							title: '扫码失败',
							icon: 'none'
						})
					}
				})
			},

			// 查询设备信息
			onQueryEquipment() {
				const _this = this;
				setTimeout(function() {
					if (!_this.equipmentCode) {
						showBeautyToast({
							title: '请输入设备编码',
							icon: 'none'
						})
						return
					}

					_this.loading = true
					equipmentRepairRequestApi.getEquipmentByCode({
						equipmentCode: _this.equipmentCode
					}).then(res => {
						console.log('res', res)
						_this.loading = false
						if (res.code == 200 || res.code == '200') {
							_this.assetInfo = res.data || {}
						} else {
							showBeautyToast({
								title: res.msg || '查询设备信息失败',
								icon: 'none'
							})
						}
					}).catch(() => {
						_this.loading = false
						showBeautyToast({
							title: '查询设备信息失败',
							icon: 'none'
						})
					})
				}, 200);
			},

			// 查询模具信息
			onQueryMold() {
				const _this = this;
				setTimeout(function() {
					if (!_this.moldCode) {
						showBeautyToast({
							title: '请输入模具编码',
							icon: 'none'
						})
						return
					}

					_this.loading = true
					equipmentRepairRequestApi.getMoldByCode({
						moldCode: _this.moldCode
					}).then(res => {
						_this.loading = false
						if (res.code == 200 || res.code == '200') {
							_this.assetInfo = res.data || {}
						} else {
							showBeautyToast({
								title: res.msg || '查询模具信息失败',
								icon: 'none'
							})
						}
					}).catch(() => {
						_this.loading = false
						showBeautyToast({
							title: '查询模具信息失败',
							icon: 'none'
						})
					})
				}, 200);
			},

			// 报修类型选择
			onRepairTypeChange(e) {
				this.repairTypeIndex = e.detail.value
			},

			// 报修事项选择
			onRepairItemChange(e) {
				this.repairItemIndex = e.detail.value
			},

			// 重置
			onReset() {
				this.resetAssetInfo()
				this.repairTypeIndex = -1
				this.repairItemIndex = -1
				this.acceptPeriod = ''
				this.repairContent = ''
			},

			// 重置资产信息
			resetAssetInfo() {
				this.equipmentCode = ''
				this.moldCode = ''
				this.assetInfo = {}
			},

			// 获取操作人名称
			getOperatorName() {
				const user = uni.getStorageSync('user')
				return user?.name || user?.realName || user?.user_name || ''
			},

			// 提交
			onSubmit() {
				// 验证
				if (!this.assetInfo.id) {
					showBeautyToast({
						title: '请先选择或扫码获取' + (this.assetType === 'EQUIP' ? '设备' : '模具') + '信息',
						icon: 'none'
					})
					return
				}

				if (this.repairTypeIndex < 0) {
					showBeautyToast({
						title: '请选择报修类型',
						icon: 'none'
					})
					return
				}

				if (this.repairItemIndex < 0) {
					showBeautyToast({
						title: '请选择报修事项',
						icon: 'none'
					})
					return
				}

				if (!this.repairContent) {
					showBeautyToast({
						title: '请输入报修内容',
						icon: 'none'
					})
					return
				}

				if (this.submitting) return
				this.submitting = true

				const submitData = {
					assetType: this.assetType,
					repairType: this.repairTypeList[this.repairTypeIndex].configCode,
					repairItem: this.repairItemList[this.repairItemIndex].configName,
					repairContent: this.repairContent
				}

				// 受理周期（小时转分钟）
				if (this.acceptPeriod) {
					submitData.acceptPeriod = Number(this.acceptPeriod) * 60
				}

				// 根据资产类型传对应的编码和名称
				if (this.assetType === 'EQUIP') {
					submitData.equipmentCode = this.assetInfo.equipmentCode || ''
					submitData.equipmentName = this.assetInfo.equipmentName || ''
				} else {
					submitData.moldCode = this.assetInfo.moldCode || ''
					submitData.moldName = this.assetInfo.moldName || ''
				}

				equipmentRepairRequestApi.submitRepairRequest(submitData).then(res => {
					this.submitting = false
					if (res.code == 200 || res.code == '200') {
						showBeautyToast({
							title: '提交成功',
							icon: 'success'
						})
						// 提交成功后重置当前页面，不返回上一页
						setTimeout(() => {
							this.onReset()
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

	// ==================== 资产类型选择 ====================
	.asset-type-bar {
		display: flex;
		background: #fff;
		border-radius: 0 0 20rpx 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		margin-bottom: 20rpx;

		.asset-type-item {
			flex: 1;
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #666;
			position: relative;
			transition: all 0.3s;

			&.active {
				color: #667eea;
				font-weight: 600;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 60rpx;
					height: 4rpx;
					background: #667eea;
					border-radius: 2rpx;
				}
			}
		}
	}

	// ==================== 扫码区域 ====================
	.scan-section {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

		.scan-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			height: 80rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 16rpx;
			color: #fff;
			font-size: 28rpx;
			font-weight: 500;
			margin-bottom: 20rpx;

			&:active {
				opacity: 0.85;
			}
		}

		.manual-input {
			display: flex;
			gap: 16rpx;

			.input-field {
				flex: 1;
				height: 64rpx;
				border: 1rpx solid #e8e8e8;
				border-radius: 10rpx;
				padding: 0 16rpx;
				font-size: 26rpx;
				color: #333;
				box-sizing: border-box;
			}

			.query-btn {
				width: 120rpx;
				height: 64rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #667eea;
				border-radius: 10rpx;
				color: #fff;
				font-size: 26rpx;

				&:active {
					opacity: 0.85;
				}
			}
		}
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

		.info-title {
			font-size: 30rpx;
			font-weight: bold;
			color: #fff;
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

	// ==================== 报修填报 ====================
	.form-section {
		margin-bottom: 20rpx;
	}

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

	.form-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.form-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 0;

		&:not(:last-child) {
			border-bottom: 1rpx solid #f5f5f5;
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
		}

		.form-label {
			font-size: 26rpx;
			color: #666;
			flex-shrink: 0;
		}

		.form-picker {
			flex: 1;
			margin-left: 20rpx;

			.picker-value {
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 64rpx;
				border: 1rpx solid #e8e8e8;
				border-radius: 10rpx;
				padding: 0 16rpx;
				font-size: 26rpx;
				color: #333;
				box-sizing: border-box;
			}
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
			height: 200rpx;
			border: 1rpx solid #e8e8e8;
			border-radius: 10rpx;
			padding: 14rpx 16rpx;
			font-size: 26rpx;
			color: #333;
			box-sizing: border-box;
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
