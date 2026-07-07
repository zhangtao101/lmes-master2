<template>
	<view class="mold-dismounting-container">
		<view class="box-body">
			<!-- 设备扫码区域 -->
			<view class="scan-section">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<uni-icons type="shop" color="#fff" size="18"></uni-icons>
							<text>设备码：</text>
							<uni-easyinput 
								v-model="equipmentCode" 
								:inputBorder="false"
								placeholderStyle="color: #999;"
								@confirm="onEquipmentCodeConfirm"
								class="code-input"
								placeholder="请输入或扫描设备码"
								:disabled="loadingEquipment"
							></uni-easyinput>
						</view>
					</view>
					<view class="right" :class="{ disabled: loadingEquipment }" @click="onEquipmentScan">
						<template v-if="loadingEquipment">
							<uni-icons type="spinner-cycle" color="#fff" size="16" class="loading-icon"></uni-icons>
							<text>加载中</text>
						</template>
						<template v-else>
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>请扫描</text>
						</template>
					</view>
				</view>
				<view class="info-grid" v-if="equipmentInfo.equipCode">
					<view class="info-item">
						<view class="label">设备名称</view>
						<view class="value">{{equipmentInfo.equipName || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">工序</view>
						<view class="value">{{equipmentInfo.processName || '--'}}</view>
					</view>
				</view>
				<view class="empty-tip" v-else-if="!loadingEquipment">
					<text>请扫描或输入设备码</text>
				</view>
			</view>

			<!-- 在机模具信息 -->
			<view class="mold-info-section">
				<view class="header">
					<view class="left">
						<uni-icons type="settings" color="#fff" size="16"></uni-icons>
						<text>在机模具信息</text>
					</view>
				</view>
				<view class="mold-detail" v-if="currentMoldInfo.moldCode">
					<view class="info-grid">
						<view class="info-item">
							<view class="label">模具编码</view>
							<view class="value">{{currentMoldInfo.moldCode || '--'}}</view>
						</view>
						<view class="info-item">
							<view class="label">模具名称</view>
							<view class="value">{{currentMoldInfo.moldName || '--'}}</view>
						</view>
						<view class="info-item">
							<view class="label">工单号</view>
							<view class="value success">{{currentMoldInfo.workOrderNo || '--'}}</view>
						</view>
						<view class="info-item">
							<view class="label">上模时间</view>
							<view class="value success">{{currentMoldInfo.installTime || '--'}}</view>
						</view>
					</view>
				</view>
				<view class="empty-tip" v-else>
					<uni-icons type="info" size="24" color="#999"></uni-icons>
					<text>{{currentMoldInfo.message || '设备暂无在机模具'}}</text>
				</view>
			</view>

			<!-- 校验结果区域 -->
			<view class="validate-section">
				<view class="header">
					<view class="left">
						<uni-icons type="checkbox" color="#fff" size="16"></uni-icons>
						<text>校验结果</text>
					</view>
				</view>
				<view class="validate-result" :class="validateStatus">
					<template v-if="validateResult">
						<view class="result-icon">
							<uni-icons 
								:type="validateResult.valid ? 'checkmarkempty' : 'close'" 
								:size="24" 
								:color="validateResult.valid ? '#52c41a' : '#ff4d4f'"
							></uni-icons>
						</view>
						<view class="result-text">
							<text class="message">{{validateResult.message || '--'}}</text>
						</view>
					</template>
					<template v-else>
						<view class="result-icon">
							<uni-icons type="help" size="24" color="#999"></uni-icons>
						</view>
						<view class="result-text">
							<text class="message">请扫描设备查看在机模具</text>
						</view>
					</template>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="submit-btn-wrapper">
			<button 
				class="reset-btn"
				@click="onReset"
			>
				<uni-icons type="refresh" size="18"></uni-icons>
				<text>重置</text>
			</button>
			<button 
				class="submit-btn" 
				:class="{ disabled: !canSubmit }" 
				@click="onConfirmDismount"
				:disabled="!canSubmit"
			>
				<uni-icons type="checkmarkempty" size="18"></uni-icons>
				<text>确认下模</text>
			</button>
		</view>
	</view>
</template>

<script>
import scanCode from '/common/scan.js'
import moldMountingApi, { OperationType } from '/api/warehouse/moldMounting.js'
import showBeautyToast from '@/common/beautyToast.js'

export default {
	data() {
		return {
			equipmentCode: '',
			equipmentInfo: {},
			currentMoldInfo: {},
			validateResult: null,
			isLoading: false,
			isSubmitting: false,
			loadingEquipment: false
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
	computed: {
		canSubmit() {
			return this.equipmentCode && this.validateResult && this.validateResult.valid && !this.isSubmitting;
		},
		validateStatus() {
			if (!this.validateResult) return 'pending';
			if (!this.validateResult.valid) return 'error';
			return 'success';
		}
	},
	methods: {
		// 统一扫码处理
		handleScanCode(code) {
			if (code.startsWith('EQ') || code.startsWith('HC-')) {
				this.equipmentCode = code;
				this.loadEquipmentInfo(code);
			} else {
				showBeautyToast({
					title: "无效编码！",
					icon: 'error'
				});
			}
		},

		// 设备扫码
		onEquipmentScan() {
			if (this.loadingEquipment) return;
			scanCode().then((code) => {
				this.equipmentCode = code;
				this.loadEquipmentInfo(code);
			}).catch(err => {
				showBeautyToast({ title: err, icon: 'none' });
			});
		},

		// 设备码确认
		onEquipmentCodeConfirm() {
			const _this = this;
			setTimeout(function() {
				const code = _this.equipmentCode.trim();
				if (code) {
					_this.loadEquipmentInfo(code);
				}
			}, 200);
		},

		// 加载设备信息
		loadEquipmentInfo: async function(code) {
			if (!code) return;
			this.loadingEquipment = true;
			try {
				// 并行调用设备信息和在机模具信息
				const [equipResp, moldResp] = await Promise.all([
					moldMountingApi.getEquipBindingByCode(code),
					moldMountingApi.getCurrentMoldInfo(code)
				]);
				
				if (equipResp.code == '200' && equipResp.data) {
					this.equipmentInfo = equipResp.data;
				} else {
					showBeautyToast({ title: equipResp.msg || '设备信息查询失败', icon: 'none' });
					this.equipmentInfo = {};
				}

				if (moldResp.code == '200') {
					this.currentMoldInfo = moldResp.data || {};
					this.checkValidation();
				} else {
					this.currentMoldInfo = { message: moldResp.msg || '查询失败' };
					this.validateResult = null;
				}
			} catch (error) {
				showBeautyToast({ title: '设备信息查询失败', icon: 'none' });
				this.equipmentInfo = {};
				this.currentMoldInfo = {};
				this.validateResult = null;
			} finally {
				this.loadingEquipment = false;
			}
		},

		// 校验下模条件
		checkValidation: function() {
			if (!this.equipmentCode) {
				this.validateResult = null;
				return;
			}
			
			// 判断是否有在机模具
			if (this.currentMoldInfo && this.currentMoldInfo.moldCode) {
				this.validateResult = {
					valid: true,
					message: `检测到在机模具：${this.currentMoldInfo.moldCode}`
				};
			} else {
				this.validateResult = {
					valid: false,
					message: '该设备暂无在机模具，无法进行下模操作'
				};
			}
		},

		// 确认下模
		onConfirmDismount: async function() {
			if (!this.canSubmit) {
				return;
			}
			this.isSubmitting = true;
			try {
				const resp = await moldMountingApi.submitMoldOperation(
					OperationType.REMOVE,
					this.equipmentCode,
					this.currentMoldInfo.moldCode,
					''
				);
				if (resp.code == '200') {
					showBeautyToast({
						title: '下模成功',
						icon: 'success'
					});
					this.resetForm();
				} else {
					showBeautyToast({
						title: resp.msg || '下模失败',
						icon: 'none'
					});
				}
			} catch (error) {
				showBeautyToast({ title: '下模失败', icon: 'none' });
			} finally {
				this.isSubmitting = false;
			}
		},

		// 重置
		onReset() {
			this.resetForm();
			showBeautyToast({ title: '已重置', icon: 'none' });
		},

		// 重置表单
		resetForm() {
			this.equipmentCode = '';
			this.equipmentInfo = {};
			this.currentMoldInfo = {};
			this.validateResult = null;
		}
	}
}
</script>

<style lang="less" scoped>
@import "@/static/styles/warehouse.less";

.mold-dismounting-container {
	min-height: 100vh;
	background: #f5f7fa;
	padding-bottom: 160rpx;
}

.box-body {
	padding: 20rpx;
}

.scan-section {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

	.header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 24rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.left {
			display: flex;
			align-items: center;
			gap: 16rpx;

			.input-group {
				display: flex;
				align-items: center;
				gap: 12rpx;

				text {
					color: #fff;
					font-size: 28rpx;
					font-weight: 500;
					white-space: nowrap;
				}

				.code-input {
					flex: 1;
					min-width: 200rpx;
					max-width: 320rpx;

					::v-deep .uni-easyinput__content {
						background: transparent !important;
						padding: 0 !important;
					}

					::v-deep .uni-easyinput__content-input {
						color: #fff;
						font-size: 28rpx;
					}

					::v-deep .uni-easyinput__placeholder-class {
						color: rgba(255, 255, 255, 0.7);
					}
				}
			}
		}

		.right {
			display: flex;
			align-items: center;
			gap: 8rpx;
			background: rgba(255, 255, 255, 0.2);
			padding: 12rpx 24rpx;
			border-radius: 32rpx;

			text {
				color: #fff;
				font-size: 24rpx;
			}

			&:active:not(.disabled) {
				background: rgba(255, 255, 255, 0.3);
			}

			&.disabled {
				opacity: 0.6;
				pointer-events: none;
			}

			.loading-icon {
				animation: spin 1s linear infinite;
			}
		}
	}

	.info-grid {
		padding: 24rpx 30rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;

		.info-item {
			flex: 1;
			min-width: 45%;

			.label {
				font-size: 24rpx;
				color: #999;
				margin-bottom: 8rpx;
			}

			.value {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;

				&.success {
					color: #52c41a;
				}

				&.error {
					color: #ff4d4f;
				}
			}
		}
	}

	.empty-tip {
		padding: 40rpx 30rpx;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;

		text {
			font-size: 26rpx;
			color: #999;
		}
	}
}

.mold-info-section {
	background: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

	.header {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		padding: 24rpx 30rpx;

		.left {
			display: flex;
			align-items: center;
			gap: 12rpx;

			text {
				color: #fff;
				font-size: 28rpx;
				font-weight: 500;
			}
		}
	}

	.mold-detail {
		.info-grid {
			padding: 24rpx 30rpx;
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;

			.info-item {
				flex: 1;
				min-width: 45%;

				.label {
					font-size: 24rpx;
					color: #999;
					margin-bottom: 8rpx;
				}

				.value {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
				}
			}
		}
	}

	.empty-tip {
		padding: 40rpx 30rpx;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;

		text {
			font-size: 26rpx;
			color: #999;
		}
	}
}

.validate-section {
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

	.header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 24rpx 30rpx;

		.left {
			display: flex;
			align-items: center;
			gap: 12rpx;

			text {
				color: #fff;
				font-size: 28rpx;
				font-weight: 500;
			}
		}
	}

	.validate-result {
		padding: 30rpx;
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
		min-height: 100rpx;

		&.success {
			background: linear-gradient(135deg, #f6ffed 0%, #e6fff5 100%);
		}

		&.error {
			background: linear-gradient(135deg, #fff2f0 0%, #ffebe9 100%);
		}

		&.pending {
			background: #f8f9fb;
		}

		.result-icon {
			flex-shrink: 0;
			width: 48rpx;
			height: 48rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.result-text {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 8rpx;

			.message {
				font-size: 28rpx;
				color: #333;
				line-height: 1.5;
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
	gap: 24rpx;

	.reset-btn {
		flex: 1;
		height: 96rpx;
		background: #fff;
		border: 2rpx solid #667eea;
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		color: #667eea;
		font-size: 28rpx;
		font-weight: bold;

		&:active {
			background: #f0f2ff;
			transform: translateY(2rpx);
		}
	}

	.submit-btn {
		flex: 1;
		height: 96rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 48rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);

		&:active:not(.disabled) {
			transform: translateY(2rpx);
			box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
		}

		&.disabled {
			opacity: 0.5;
			background: #ccc;
			box-shadow: none;
		}
	}
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>
