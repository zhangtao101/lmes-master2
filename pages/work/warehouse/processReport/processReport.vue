<template>
	<view class="process-report-container">
		<view class="box-body">
			<!-- 1. 工单扫码区域 -->
			<view class="scan-section">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<uni-icons type="document" color="#fff" size="18"></uni-icons>
							<text>工单码：</text>
							<uni-easyinput
								v-model="worksheetCode"
								:inputBorder="false"
								placeholderStyle="color: rgba(255,255,255,0.7);"
								@confirm="onWorksheetConfirm"
								class="code-input"
								placeholder="请输入或扫描工单码"
								:disabled="loadingWorksheet"
							></uni-easyinput>
						</view>
					</view>
					<view class="right" :class="{ disabled: loadingWorksheet }" @click="onWorksheetScan">
						<template v-if="loadingWorksheet">
							<uni-icons type="spinner-cycle" color="#fff" size="16" class="loading-icon"></uni-icons>
							<text>加载中</text>
						</template>
						<template v-else>
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>请扫描</text>
						</template>
					</view>
				</view>
				<view class="info-grid" v-if="worksheetInfo.workSheetCode">
					<view class="info-item">
						<view class="label">工单编号</view>
						<view class="value">{{worksheetInfo.workSheetCode || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">工单名称</view>
						<view class="value">{{worksheetInfo.productName || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">计划数量</view>
						<view class="value highlight">{{worksheetInfo.workSheetPlanNumber != null ? worksheetInfo.workSheetPlanNumber : '--'}}</view>
					</view>
				</view>
				<view class="empty-tip" v-else-if="!loadingWorksheet">
					<text>请扫描或输入工单码</text>
				</view>
			</view>

			<!-- 2. 设备号扫码区域 -->
			<view class="scan-section">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<text>设备码：</text>
							<uni-easyinput
								v-model="equipCode"
								:inputBorder="false"
								placeholderStyle="color: rgba(255,255,255,0.7);"
								@confirm="onEquipCodeConfirm"
								class="code-input"
								placeholder="请输入或扫描设备码"
								:disabled="loadingEquip"
							></uni-easyinput>
						</view>
					</view>
					<view class="right" :class="{ disabled: loadingEquip }" @click="onEquipCodeScan">
						<template v-if="loadingEquip">
							<uni-icons type="spinner-cycle" color="#fff" size="16" class="loading-icon"></uni-icons>
							<text>加载中</text>
						</template>
						<template v-else>
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>请扫描</text>
						</template>
					</view>
				</view>
				<view class="info-grid" v-if="equipInfo.equipCode">
					<view class="info-item">
						<view class="label">设备编号</view>
						<view class="value">{{equipInfo.equipCode || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">设备名称</view>
						<view class="value">{{equipInfo.equipName || '--'}}</view>
					</view>
					<view class="info-item">
						<view class="label">当前工序</view>
						<view class="value highlight">{{equipInfo.processName || '--'}}</view>
					</view>
				</view>
				<view class="empty-tip" v-else-if="!loadingEquip">
					<text>请扫描或输入设备码</text>
				</view>
			</view>

			<!-- 3. 基本信息填写 -->
			<view class="scan-section" v-if="equipInfo.equipCode">
				<view class="header">
					<view class="left">
						<uni-icons type="compose" color="#fff" size="18"></uni-icons>
						<text>基本信息填写</text>
					</view>
				</view>
				<view class="report-body">
					<!-- 班别 -->
					<view class="form-item">
						<view class="form-label"><text class="required">*</text>班别</view>
						<view class="form-value">
							<view class="radio-group">
								<view
									class="radio-item"
									:class="{ active: classType === 1 }"
									@click="classType = 1"
								>
									<view class="radio-dot"></view>
									<text>白班</text>
								</view>
								<view
									class="radio-item"
									:class="{ active: classType === 2 }"
									@click="classType = 2"
								>
									<view class="radio-dot"></view>
									<text>晚班</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 作业人数 -->
					<view class="form-item">
						<view class="form-label"><text class="required">*</text>作业人数</view>
						<view class="form-value">
							<uni-easyinput
								v-model="personTime"
								:inputBorder="false"
								type="number"
								placeholderStyle="color: #999;"
								placeholder="请输入作业人数"
								class="form-input"
							></uni-easyinput>
						</view>
					</view>

					<!-- 时间工时 -->
					<view class="form-item">
						<view class="form-label"><text class="required">*</text>时间工时</view>
						<view class="form-value">
							<uni-easyinput
								v-model="equipTime"
								:inputBorder="false"
								type="number"
								placeholderStyle="color: #999;"
								placeholder="请输入时间工时"
								class="form-input"
							></uni-easyinput>
						</view>
					</view>

					<!-- 报工数量 -->
					<view class="form-item">
						<view class="form-label"><text class="required">*</text>报工数量</view>
						<view class="form-value">
							<uni-easyinput
								v-model="reportNumber"
								:inputBorder="false"
								type="number"
								placeholderStyle="color: #999;"
								placeholder="请输入报工数量"
								class="form-input"
							></uni-easyinput>
						</view>
					</view>

					<!-- 当前工时（只读显示） -->
					<view class="form-item" v-if="equipInfo.equipTime != null">
						<view class="form-label">当前工时</view>
						<view class="form-value">
							<text class="display-text">{{equipInfo.equipTime}} 小时</text>
						</view>
					</view>
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
				@click="onSubmit"
				:disabled="!canSubmit"
			>
				<uni-icons type="checkmarkempty" size="18"></uni-icons>
				<text>{{ isSubmitting ? '提交中...' : '确认报工' }}</text>
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
import moldMountingApi from '/api/warehouse/moldMounting.js'
import showBeautyToast from '@/common/beautyToast.js'

export default {
	data() {
		return {
			// 工单扫码
			worksheetCode: '',
			worksheetInfo: {},
			loadingWorksheet: false,

			// 设备扫码
			equipCode: '',
			equipInfo: {},
			loadingEquip: false,

			// 基本信息填写
			classType: 1,       // 班别：1白班 2晚班
			personTime: '',     // 作业人数
			equipTime: '',      // 时间工时
			reportNumber: '',   // 报工数量

			// 状态
			isLoading: false,
			isSubmitting: false
		}
	},
	onLoad() {
		const _this = this;
		// #ifdef APP-PLUS
		plus.key.addEventListener("keydown", function(e) {
			if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
				uni.$off('scan');
				uni.$on('scan', function(code) {
					_this.handleHardwareScan(code);
				});
			}
		});
		// #endif
	},
	destroyed: function() {
		// #ifdef APP-PLUS
		plus.key.removeEventListener('keydown');
		// #endif
	},
	computed: {
		canSubmit() {
			return this.equipInfo.equipCode &&
				this.classType &&
				this.personTime &&
				this.equipTime &&
				this.reportNumber &&
				!this.isSubmitting;
		}
	},
	methods: {
		// 硬件扫码枪处理
		handleHardwareScan(code) {
			if (!this.worksheetCode) {
				this.worksheetCode = code;
				this.loadWorksheet();
			} else if (!this.equipCode) {
				this.equipCode = code;
				this.loadEquipInfo();
			}
		},

		// ========== 工单扫码 ==========
		onWorksheetScan() {
			if (this.loadingWorksheet) return;
			const _this = this;
			scanCode().then(code => {
				_this.worksheetCode = code;
				_this.loadWorksheet();
			}).catch(err => {
				showBeautyToast({ title: err || '扫码失败', icon: 'none' });
			});
		},

		onWorksheetConfirm() {
			const _this = this;
			setTimeout(function() {
				if (_this.worksheetCode) {
					_this.loadWorksheet();
				}
			}, 200);
		},

		loadWorksheet() {
			if (!this.worksheetCode) {
				showBeautyToast({ title: '请输入工单码', icon: 'none' });
				return;
			}
			this.loadingWorksheet = true;
			this.worksheetInfo = {};
			// 清除下游数据
			this.equipCode = '';
			this.equipInfo = {};
			this.personTime = '';
			this.equipTime = '';
			this.reportNumber = '';

			moldMountingApi.getWorksheetByCode(this.worksheetCode).then(resp => {
				this.loadingWorksheet = false;
				if (resp.code == 200 || resp.code == '200') {
					const data = resp.data;
					this.worksheetInfo = Array.isArray(data) ? (data[0] || {}) : (data || {});
					if (!this.worksheetInfo.workSheetCode) {
						showBeautyToast({ title: '未查询到工单信息', icon: 'none' });
					}
				} else {
					showBeautyToast({ title: resp.msg || '工单查询失败', icon: 'none' });
				}
			}).catch(() => {
				this.loadingWorksheet = false;
				showBeautyToast({ title: '工单查询失败', icon: 'none' });
			});
		},

		// ========== 设备扫码 ==========
		onEquipCodeScan() {
			if (this.loadingEquip) return;
			const _this = this;
			scanCode().then(code => {
				_this.equipCode = code;
				_this.loadEquipInfo();
			}).catch(err => {
				showBeautyToast({ title: err || '扫码失败', icon: 'none' });
			});
		},

		onEquipCodeConfirm() {
			const _this = this;
			setTimeout(function() {
				if (_this.equipCode) {
					_this.loadEquipInfo();
				}
			}, 200);
		},

		loadEquipInfo() {
			if (!this.equipCode) {
				showBeautyToast({ title: '请输入设备码', icon: 'none' });
				return;
			}
			if (!this.worksheetCode) {
				showBeautyToast({ title: '请先扫描工单码', icon: 'none' });
				return;
			}
			this.loadingEquip = true;
			this.equipInfo = {};
			this.personTime = '';
			this.equipTime = '';
			this.reportNumber = '';

			moldMountingApi.getBindingByCode(this.equipCode, this.worksheetCode, 2).then(resp => {
				this.loadingEquip = false;
				if (resp.code == 200 || resp.code == '200') {
					this.equipInfo = resp.data || {};
					if (!this.equipInfo.equipCode) {
						showBeautyToast({ title: '未查询到设备信息', icon: 'none' });
					}
				} else {
					showBeautyToast({ title: resp.msg || '设备查询失败', icon: 'none' });
				}
			}).catch(() => {
				this.loadingEquip = false;
				showBeautyToast({ title: '设备查询失败', icon: 'none' });
			});
		},

		// ========== 确认报工 ==========
		onSubmit() {
			if (!this.canSubmit) return;

			const { bindingId, functionId } = this.equipInfo;
			if (!bindingId || !functionId) {
				showBeautyToast({ title: '缺少工序绑定或工步信息', icon: 'none' });
				return;
			}

			this.isSubmitting = true;
			moldMountingApi.outReport({
				classType: this.classType,
				equipTime: Number(this.equipTime),
				personTime: Number(this.personTime),
				reportNumber: Number(this.reportNumber),
				unqualityNumber: 0,
				worksheetCode: this.worksheetCode,
				productCode: this.worksheetInfo.productCode || '',
				productName: this.worksheetInfo.productName || '',
				planNumber: this.worksheetInfo.workSheetPlanNumber || 0,
				bindingId: bindingId,
				functionId: functionId
			}).then(resp => {
				this.isSubmitting = false;
				if (resp.code == 200 || resp.code == '200') {
					showBeautyToast({ title: '报工成功', icon: 'success' });
					this.onReset();
				} else {
					showBeautyToast({ title: resp.msg || '报工失败', icon: 'none' });
				}
			}).catch(() => {
				this.isSubmitting = false;
				showBeautyToast({ title: '报工失败', icon: 'none' });
			});
		},

		// ========== 重置 ==========
		onReset() {
			this.worksheetCode = '';
			this.worksheetInfo = {};
			this.loadingWorksheet = false;
			this.equipCode = '';
			this.equipInfo = {};
			this.loadingEquip = false;
			this.classType = 1;
			this.personTime = '';
			this.equipTime = '';
			this.reportNumber = '';
			this.isSubmitting = false;
			showBeautyToast({ title: '已重置', icon: 'none' });
		}
	}
}
</script>

<style lang="less" scoped>
@import "@/static/styles/warehouse.less";

.process-report-container {
	min-height: 100vh;
	background: #f5f7fa;
	padding-bottom: 160rpx;
}

.box-body {
	padding: 20rpx;
}

/* ========== 扫码区域通用 ========== */
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

			> text {
				color: #fff;
				font-size: 28rpx;
				font-weight: 500;
			}

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
					max-width: 360rpx;

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

				&.highlight {
					color: #667eea;
					font-weight: bold;
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

		.loading-icon {
			animation: spin 1s linear infinite;
			vertical-align: middle;
			margin-right: 8rpx;
		}
	}
}

/* ========== 基本信息填写 ========== */
.report-body {
	padding: 24rpx 30rpx;
}

.form-item {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;

	&:last-child {
		border-bottom: none;
	}

	.form-label {
		width: 160rpx;
		font-size: 28rpx;
		color: #333;
		flex-shrink: 0;

		.required {
			color: #ff4d4f;
			margin-right: 4rpx;
		}
	}

	.form-value {
		flex: 1;
	}

	.display-text {
		font-size: 28rpx;
		color: #667eea;
		font-weight: bold;
	}
}

/* 班别单选 */
.radio-group {
	display: flex;
	gap: 32rpx;
}

.radio-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 8rpx 0;

	.radio-dot {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		border: 3rpx solid #d9d9d9;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	&.active .radio-dot {
		border-color: #667eea;
		background: #667eea;
		box-shadow: inset 0 0 0 5rpx #fff;
	}

	text {
		font-size: 28rpx;
		color: #333;
	}
}

/* 输入框 */
.form-input {
	::v-deep .uni-easyinput__content {
		background: #f5f7fa;
		border: 2rpx solid #e8eaf0;
		border-radius: 8rpx;
		padding: 4rpx 16rpx;
	}

	::v-deep .uni-easyinput__content-input {
		height: 56rpx;
		font-size: 28rpx;
		color: #333;
	}
}

/* ========== 底部按钮 ========== */
.submit-btn-wrapper {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 20%);
	padding: 24rpx 30rpx;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	display: flex;
	gap: 20rpx;

	.reset-btn {
		width: 160rpx;
		height: 96rpx;
		background: #fff;
		border: 2rpx solid #e8eaf0;
		border-radius: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		color: #666;
		font-size: 26rpx;
		flex-shrink: 0;

		&:active {
			background: #f5f7fa;
		}
	}

	.submit-btn {
		flex: 1;
		height: 96rpx;
		background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
		border-radius: 48rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		color: #fff;
		font-size: 30rpx;
		font-weight: bold;
		box-shadow: 0 6rpx 20rpx rgba(82, 196, 26, 0.4);

		&:active:not(.disabled) {
			transform: translateY(2rpx);
			box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.4);
		}

		&.disabled {
			opacity: 0.5;
			background: #ccc;
			box-shadow: none;
		}
	}
}

/* ========== 加载遮罩 ========== */
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
