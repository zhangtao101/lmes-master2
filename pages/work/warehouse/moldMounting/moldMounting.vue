<template>
	<view class="mold-mounting-container">
		<view class="box-body">
			<!-- 模具扫码区域 -->
			<view class="scan-section">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<uni-icons type="settings" color="#fff" size="18"></uni-icons>
							<text>模具码：</text>
							<uni-easyinput 
								v-model="moldCode" 
								:inputBorder="false"
								placeholderStyle="color: #999;"
								@confirm="onMoldCodeConfirm"
								class="code-input"
								placeholder="请输入或扫描模具码"
								:disabled="loadingMold"
							></uni-easyinput>
						</view>
					</view>
					<view class="right" :class="{ disabled: loadingMold }" @click="onMoldScan">
						<template v-if="loadingMold">
							<uni-icons type="spinner-cycle" color="#fff" size="16" class="loading-icon"></uni-icons>
							<text>加载中</text>
						</template>
						<template v-else>
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>请扫描</text>
						</template>
					</view>
				</view>
				<view class="info-grid" v-if="moldInfo.moldCode">
					<view class="info-item">
						<view class="label">模具名称</view>
						<view class="value">{{moldInfo.moldName || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">状态</view>
						<view class="value" :class="moldInfo.status === '在库' ? 'success' : 'error'">
							{{moldInfo.currentStatusName || '--'}}
						</view>
					</view>
				</view>
				<view class="empty-tip" v-else-if="!loadingMold">
					<text>请扫描或输入模具码</text>
				</view>
			</view>

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

			<!-- 工单扫码区域 -->
			<view class="scan-section">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<uni-icons type="document" color="#fff" size="18"></uni-icons>
							<text>工单码：</text>
							<uni-easyinput 
								v-model="workOrderCode" 
								:inputBorder="false"
								placeholderStyle="color: #999;"
								@confirm="onWorkOrderCodeConfirm"
								class="code-input"
								placeholder="请输入或扫描工单码"
								:disabled="loadingWorkOrder"
							></uni-easyinput>
						</view>
					</view>
					<view class="right" :class="{ disabled: loadingWorkOrder }" @click="onWorkOrderScan">
						<template v-if="loadingWorkOrder">
							<uni-icons type="spinner-cycle" color="#fff" size="16" class="loading-icon"></uni-icons>
							<text>加载中</text>
						</template>
						<template v-else>
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>请扫描</text>
						</template>
					</view>
				</view>
				<view class="info-grid" v-if="workOrderInfo.workSheetCode">
					<view class="info-item">
						<view class="label">产品型号</view>
						<view class="value">{{workOrderInfo.productCode || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">产品名称</view>
						<view class="value">{{workOrderInfo.productName || '--'}}</view>
					</view>
				</view>
				<view class="empty-tip" v-else-if="!loadingWorkOrder">
					<text>请扫描或输入工单码</text>
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
							<text class="warning" v-if="validateResult.warning">⚠️ 预警提示</text>
						</view>
					</template>
					<template v-else>
						<view class="result-icon">
							<uni-icons type="help" size="24" color="#999"></uni-icons>
						</view>
						<view class="result-text">
							<text class="message">请完成扫码后自动校验</text>
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
				@click="onConfirmMount"
				:disabled="!canSubmit"
			>
				<uni-icons type="checkmarkempty" size="18"></uni-icons>
				<text>确认上模</text>
			</button>
		</view>

		<!-- 加载遮罩 -->
		<view class="loading-mask" v-if="isLoading">
			<view class="loading-content">
				<uni-icons type="spinner-cycle" size="40" color="#667eea" class="loading-icon"></uni-icons>
				<text class="loading-text">加载中...</text>
			</view>
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
			moldCode: '',
			equipmentCode: '',
			workOrderCode: '',
			moldInfo: {},
			equipmentInfo: {},
			workOrderInfo: {},
			validateResult: null,
			isLoading: false,
			isSubmitting: false,
			loadingMold: false,
			loadingEquipment: false,
			loadingWorkOrder: false
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
			return this.moldCode && this.equipmentCode && this.workOrderCode && 
				   this.validateResult && this.validateResult.valid && !this.isSubmitting;
		},
		validateStatus() {
			if (!this.validateResult) return 'pending';
			if (!this.validateResult.valid) return 'error';
			if (this.validateResult.warning) return 'warning';
			return 'success';
		}
	},
	methods: {
		// 统一扫码处理
		handleScanCode(code) {
			// 根据前缀判断扫码类型
			if (code.startsWith('MOLD') || code.startsWith('MJ')) {
				this.moldCode = code;
				this.loadMoldInfo(code);
			} else if (code.startsWith('EQ') || code.startsWith('HC-')) {
				this.equipmentCode = code;
				this.loadEquipmentInfo(code);
			} else if (code.includes('-') && !code.startsWith('EQ') && !code.startsWith('MOLD')) {
				this.workOrderCode = code;
				this.loadWorkOrderInfo(code);
			} else {
				showBeautyToast({
					title: "无效编码！",
					icon: 'error'
				});
			}
		},

		// 模具扫码
		onMoldScan() {
			if (this.loadingMold) return;
			scanCode().then((code) => {
				this.moldCode = code;
				this.loadMoldInfo(code);
			}).catch(err => {
				showBeautyToast({ title: err, icon: 'none' });
			});
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

		// 工单扫码
		onWorkOrderScan() {
			if (this.loadingWorkOrder) return;
			scanCode().then((code) => {
				this.workOrderCode = code;
				this.loadWorkOrderInfo(code);
			}).catch(err => {
				showBeautyToast({ title: err, icon: 'none' });
			});
		},

		// 模具码确认
		onMoldCodeConfirm() {
			const _this = this;
			setTimeout(function() {
				if (_this.moldCode) {
					_this.loadMoldInfo(_this.moldCode);
				}
			}, 200);
		},

		// 设备码确认
		onEquipmentCodeConfirm() {
			const _this = this;
			setTimeout(function() {
				if (_this.equipmentCode) {
					_this.loadEquipmentInfo(_this.equipmentCode);
				}
			}, 200);
		},

		// 工单码确认
		onWorkOrderCodeConfirm() {
			const _this = this;
			setTimeout(function() {
				if (_this.workOrderCode) {
					_this.loadWorkOrderInfo(_this.workOrderCode);
				}
			}, 200);
		},

		// 加载模具信息
		loadMoldInfo: async function(code) {
			if (!code) return;
			this.loadingMold = true;
			try {
				const resp = await moldMountingApi.getMoldByCode(code);
				if (resp.code == '200' && resp.data) {
					this.moldInfo = resp.data;
					this.checkValidation();
				} else {
					showBeautyToast({ title: resp.msg || '模具信息查询失败', icon: 'none' });
					this.moldInfo = {};
				}
			} catch (error) {
				showBeautyToast({ title: '模具信息查询失败', icon: 'none' });
				this.moldInfo = {};
			} finally {
				this.loadingMold = false;
			}
		},

		// 加载设备信息
		loadEquipmentInfo: async function(code) {
			if (!code) return;
			this.loadingEquipment = true;
			try {
				const resp = await moldMountingApi.getEquipBindingByCode(code);
				if (resp.code == '200' && resp.data) {
					this.equipmentInfo = resp.data;
					this.checkValidation();
				} else {
					showBeautyToast({ title: resp.msg || '设备信息查询失败', icon: 'none' });
					this.equipmentInfo = {};
				}
			} catch (error) {
				showBeautyToast({ title: '设备信息查询失败', icon: 'none' });
				this.equipmentInfo = {};
			} finally {
				this.loadingEquipment = false;
			}
		},

		// 加载工单信息
		loadWorkOrderInfo: async function(code) {
			if (!code) return;
			this.loadingWorkOrder = true;
			try {
				const resp = await moldMountingApi.getWorksheetByCode(code);
				console.log('resp', resp)
				if (resp.code == '200' && resp.data) {
					// 工单接口返回的是数组，取第一个
					this.workOrderInfo = Array.isArray(resp.data) ? resp.data[0] : resp.data;
					this.checkValidation();
				} else {
					showBeautyToast({ title: resp.msg || '工单信息查询失败', icon: 'none' });
					this.workOrderInfo = {};
				}
			} catch (error) {
				showBeautyToast({ title: '工单信息查询失败', icon: 'none' });
				this.workOrderInfo = {};
			} finally {
				this.loadingWorkOrder = false;
			}
		},

		// 校验上模条件
		checkValidation: async function() {
			if (!this.moldCode || !this.equipmentCode || !this.workOrderCode) {
				return;
			}
			try {
				const resp = await moldMountingApi.validateMoldOperation(
					this.moldCode,
					this.equipmentCode,
					this.workOrderCode
				);
				if (resp.code == '200' && resp.data) {
					this.validateResult = resp.data;
				} else {
					showBeautyToast({ title: resp.msg || '校验失败', icon: 'none' });
					this.validateResult = null;
				}
			} catch (error) {
				showBeautyToast({ title: '校验失败', icon: 'none' });
				this.validateResult = null;
			}
		},

		// 确认上模
		onConfirmMount: async function() {
			if (!this.canSubmit) {
				return;
			}
			this.isSubmitting = true;
			try {
				const resp = await moldMountingApi.submitMoldOperation(
					OperationType.INSTALL,
					this.equipmentCode,
					this.moldCode,
					this.workOrderCode
				);
				if (resp.code == '200') {
					showBeautyToast({
						title: '上模成功',
						icon: 'success'
					});
					// 清空表单
					this.resetForm();
				} else {
					showBeautyToast({
						title: resp.msg || '上模失败',
						icon: 'none'
					});
				}
			} catch (error) {
				showBeautyToast({ title: '上模失败', icon: 'none' });
			} finally {
				this.isSubmitting = false;
			}
		},

		// 重置表单
		onReset() {
			this.resetForm();
			showBeautyToast({ title: '已重置', icon: 'none' });
		},

		// 重置表单
		resetForm() {
			this.moldCode = '';
			this.equipmentCode = '';
			this.workOrderCode = '';
			this.moldInfo = {};
			this.equipmentInfo = {};
			this.workOrderInfo = {};
			this.validateResult = null;
		}
	}
}
</script>

<style lang="less" scoped>
@import "@/static/styles/warehouse.less";

.mold-mounting-container {
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

		&.warning {
			background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
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

			.warning {
				font-size: 24rpx;
				color: #faad14;
				font-weight: 500;
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
