<template>
	<view class="process-feeding-container">
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

			<!-- 3. 物料清单区域 -->
			<view class="scan-section" v-if="materialList.length > 0">
				<view class="header">
					<view class="left">
						<uni-icons type="list-check" color="#fff" size="18"></uni-icons>
						<text>物料清单</text>
					</view>
					<view class="header-right">
						<text class="count-badge">{{materialList.length}}</text>
					</view>
				</view>
				<view class="material-table">
					<view class="table-row table-header-row">
						<view class="table-cell" style="flex: 2;">料号</view>
						<view class="table-cell" style="flex: 2.5;">物料名称</view>
						<view class="table-cell" style="flex: 1;">站位</view>
						<view class="table-cell" style="flex: 1.2;">BOM用量</view>
						<view class="table-cell" style="flex: 1.2;">已投入量</view>
					</view>
					<view class="table-row"
						v-for="(item, index) in materialList"
						:key="index"
						:class="{ 'row-active': selectedIndex === index }"
						@click="onMaterialSelect(item, index)"
					>
						<view class="table-cell" style="flex: 2;">{{item.materialCode || '--'}}</view>
						<view class="table-cell" style="flex: 2.5;">{{item.materialName || '--'}}</view>
						<view class="table-cell" style="flex: 1;">{{item.location || '--'}}</view>
						<view class="table-cell highlight" style="flex: 1.2;">{{item.auxiliaryDoage != null ? item.auxiliaryDoage : '--'}}</view>
						<view class="table-cell" style="flex: 1.2;" :class="item.feedNumber > 0 ? 'text-success' : 'text-warn'">
							{{item.feedNumber != null ? item.feedNumber : 0}}
						</view>
					</view>
				</view>
				<view class="empty-tip" v-if="materialList.length === 0 && !loadingMaterial">
					<text>暂未加载物料清单</text>
				</view>
			</view>
			<view class="scan-section" v-else-if="worksheetInfo.workSheetCode && equipInfo.equipCode && loadingMaterial">
				<view class="header">
					<view class="left">
						<uni-icons type="list-check" color="#fff" size="18"></uni-icons>
						<text>物料清单</text>
					</view>
				</view>
				<view class="empty-tip">
					<uni-icons type="spinner-cycle" size="16" color="#667eea" class="loading-icon"></uni-icons>
					<text>加载中...</text>
				</view>
			</view>

			<!-- 4. 标签上料区域 -->
			<view class="scan-section" v-if="selectedItem">
				<view class="header">
					<view class="left">
						<uni-icons type="gift" color="#fff" size="18"></uni-icons>
						<text>标签上料</text>
					</view>
				</view>
				<view class="feeding-body">
					<!-- 标签码输入（先输入条码） -->
					<view class="input-row">
						<view class="label-input-group">
							<uni-icons type="scan" color="#667eea" size="16"></uni-icons>
							<uni-easyinput
								v-model="labelCode"
								:inputBorder="false"
								:focus="labelFocusFlag"
								placeholderStyle="color: #999;"
								placeholder="请扫描或输入标签码"
								@confirm="onLabelCodeConfirm"
								class="code-input"
							></uni-easyinput>
						</view>
						<view class="scan-btn" @click="onLabelCodeScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>扫码</text>
						</view>
					</view>
					<!-- 校验状态 -->
					<view class="check-status" v-if="checkStatus === 'loading'">
						<uni-icons type="spinner-cycle" size="16" color="#667eea" class="loading-icon"></uni-icons>
						<text>校验中...</text>
					</view>
					<view class="check-status error" v-if="checkStatus === 'error'">
						<uni-icons type="close" size="18" color="#ff4d4f"></uni-icons>
						<text>{{checkErrorMsg || '校验失败'}}</text>
					</view>
					<!-- 校验成功后显示物料信息 -->
					<view class="selected-info" v-if="checkStatus === 'success'">
						<view class="info-item">
							<view class="label">料号</view>
							<view class="value">{{selectedItem.materialCode || '--'}}</view>
						</view>
						<view class="info-item">
							<view class="label">物料名称</view>
							<view class="value">{{selectedItem.materialName || '--'}}</view>
						</view>
						<view class="info-item">
							<view class="label">上料数量</view>
							<view class="value highlight">{{feedNumber || '--'}}</view>
						</view>
						<view class="check-status success">
							<uni-icons type="checkmarkempty" size="18" color="#52c41a"></uni-icons>
							<text>校验成功</text>
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
				<text>{{ isSubmitting ? '提交中...' : '确认提交' }}</text>
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

			// 物料清单
			materialList: [],
			loadingMaterial: false,
			selectedIndex: -1,
			selectedItem: null,

			// 标签上料
			labelCode: '',
			feedNumber: '',
			labelFocusFlag: false,
			checkStatus: '', // '' | 'loading' | 'success' | 'error'
			checkResult: {},
			checkErrorMsg: '',

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
			return this.selectedItem &&
				this.labelCode &&
				this.feedNumber &&
				this.checkStatus === 'success' &&
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
			} else if (this.selectedItem) {
				this.labelCode = code;
				this.checkLabelCode();
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
			if (this.worksheetCode) {
				this.loadWorksheet();
			}
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
			this.materialList = [];
			this.selectedIndex = -1;
			this.selectedItem = null;
			this.labelCode = '';
			this.feedNumber = '';
			this.checkStatus = '';

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
			if (this.equipCode) {
				this.loadEquipInfo();
			}
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
			this.materialList = [];
			this.selectedIndex = -1;
			this.selectedItem = null;
			this.labelCode = '';
			this.feedNumber = '';
			this.checkStatus = '';

			moldMountingApi.getBindingByCode(this.equipCode, this.worksheetCode, 1).then(resp => {
				this.loadingEquip = false;
				if (resp.code == 200 || resp.code == '200') {
					this.equipInfo = resp.data || {};
					if (this.equipInfo.equipCode) {
						// 工单和设备都加载成功后，自动加载物料清单
						this.loadMaterialList();
					} else {
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

		// ========== 物料清单 ==========
		loadMaterialList() {
			const { functionId, bindingId, workstationCode } = this.equipInfo;
			if (!functionId || !bindingId) {
				showBeautyToast({ title: '缺少工步或绑定信息', icon: 'none' });
				return;
			}
			this.loadingMaterial = true;
			moldMountingApi.listSmtFeed(
				functionId,
				bindingId,
				this.worksheetCode,
				workstationCode,
				1,
				999
			).then(resp => {
				this.loadingMaterial = false;
				if (resp.code == 200 || resp.code == '200') {
					const data = resp.data;
					this.materialList = (data && data.list) ? data.list : [];
				} else {
					showBeautyToast({ title: resp.msg || '物料清单查询失败', icon: 'none' });
				}
			}).catch(() => {
				this.loadingMaterial = false;
				showBeautyToast({ title: '物料清单查询失败', icon: 'none' });
			});
		},

		// 选中物料行
		onMaterialSelect(item, index) {
			this.selectedIndex = index;
			this.selectedItem = item;
			// 切换选中时重置标签上料状态，上料数量需通过扫码校验获取
			this.labelCode = '';
			this.feedNumber = '';
			this.checkStatus = '';
			this.checkResult = {};
			this.checkErrorMsg = '';
			// 自动聚焦标签码输入
			this.$nextTick(() => {
				this.labelFocusFlag = true;
			});
		},

		// ========== 标签上料 ==========
		onLabelCodeScan() {
			const _this = this;
			scanCode().then(code => {
				_this.labelCode = code;
				_this.checkLabelCode();
			}).catch(err => {
				showBeautyToast({ title: err || '扫码失败', icon: 'none' });
			});
		},

		onLabelCodeConfirm() {
			if (this.labelCode) {
				this.checkLabelCode();
			}
		},

		checkLabelCode() {
			if (!this.labelCode) {
				showBeautyToast({ title: '请扫描或输入标签码', icon: 'none' });
				return;
			}
			if (!this.selectedItem || !this.selectedItem.materialCode) {
				showBeautyToast({ title: '请先选择物料', icon: 'none' });
				return;
			}
			this.checkStatus = 'loading';
			this.checkResult = {};
			this.checkErrorMsg = '';

			moldMountingApi.checkSmtFeed(this.labelCode, this.selectedItem.materialCode).then(resp => {
				if (resp.code == 200 || resp.code == '200') {
					this.checkStatus = 'success';
					this.checkResult = resp.data || {};
					// 上料数量取校验返回的 labelNumber
					this.feedNumber = (this.checkResult.labelNumber != null) ? String(this.checkResult.labelNumber) : '';
				} else {
					this.checkStatus = 'error';
					this.checkErrorMsg = resp.msg || '校验失败';
					showBeautyToast({ title: resp.msg || '校验失败', icon: 'none' });
				}
			}).catch(() => {
				this.checkStatus = 'error';
				this.checkErrorMsg = '校验失败';
				showBeautyToast({ title: '校验失败', icon: 'none' });
			});
		},

		// ========== 确认提交 ==========
		onSubmit() {
			if (!this.canSubmit) return;

			const { workstationCode, functionId, bindingId } = this.equipInfo;

			this.isSubmitting = true;
			moldMountingApi.smtFeed(
				workstationCode,
				this.worksheetCode,
				functionId,
				bindingId,
				this.labelCode,
				String(this.feedNumber),
				this.selectedItem.materialCode
			).then(resp => {
				this.isSubmitting = false;
				if (resp.code == 200 || resp.code == '200') {
					showBeautyToast({ title: '上料成功', icon: 'success' });
					// 重新加载物料清单，刷新已投入量
					this.labelCode = '';
					this.feedNumber = '';
					this.checkStatus = '';
					this.checkResult = {};
					this.loadMaterialList();
				} else {
					showBeautyToast({ title: resp.msg || '上料失败', icon: 'none' });
				}
			}).catch(() => {
				this.isSubmitting = false;
				showBeautyToast({ title: '上料失败', icon: 'none' });
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
			this.materialList = [];
			this.loadingMaterial = false;
			this.selectedIndex = -1;
			this.selectedItem = null;
			this.labelCode = '';
			this.feedNumber = '';
			this.checkStatus = '';
			this.checkResult = {};
			this.checkErrorMsg = '';
			this.isSubmitting = false;
			showBeautyToast({ title: '已重置', icon: 'none' });
		}
	}
}
</script>

<style lang="less" scoped>
@import "@/static/styles/warehouse.less";

.process-feeding-container {
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

		.header-right {
			display: flex;
			align-items: center;
		}

		.count-badge {
			background: rgba(255, 255, 255, 0.25);
			color: #fff;
			font-size: 24rpx;
			font-weight: bold;
			padding: 4rpx 16rpx;
			border-radius: 20rpx;
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

/* ========== 物料列表 ========== */
.material-table {
	padding: 0;

	.table-row {
		display: flex;
		align-items: center;
		padding: 16rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		transition: background 0.2s;

		&:last-child {
			border-bottom: none;
		}

		&.row-active {
			background: #e6f0ff;
		}

		.table-cell {
			font-size: 24rpx;
			color: #333;
			word-break: break-all;

			&.highlight {
				color: #667eea;
				font-weight: bold;
			}

			&.text-success {
				color: #52c41a;
			}

			&.text-warn {
				color: #faad14;
			}
		}
	}

	.table-header-row {
		background: #f8f9fb;
		border-radius: 12rpx;
		font-weight: bold;

		.table-cell {
			color: #667eea;
			font-size: 26rpx;
		}
	}
}

/* ========== 标签上料 ========== */
.feeding-body {
	padding: 24rpx 30rpx;
}

.selected-info {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 24rpx;
	padding: 20rpx;
	background: #f5f7fa;
	border-radius: 12rpx;

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

.input-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.label-input-group {
	flex: 1;
	display: flex;
	align-items: center;
	background: #f5f7fa;
	border-radius: 12rpx;
	padding: 0 16rpx;
	border: 2rpx solid #e8eaf0;
	gap: 10rpx;

	.code-input {
		flex: 1;
	}

	::v-deep .uni-easyinput__content {
		background: transparent !important;
		padding: 0 !important;
	}

	::v-deep .uni-easyinput__content-input {
		font-size: 28rpx;
		color: #333;
	}
}

.scan-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	font-size: 24rpx;
	padding: 18rpx 24rpx;
	border-radius: 32rpx;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.35);

	&:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.25);
	}
}

.check-status {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx;
	border-radius: 12rpx;
	font-size: 24rpx;
	color: #999;
	background: #f8f9fb;

	.loading-icon {
		animation: spin 1s linear infinite;
	}

	&.success {
		color: #52c41a;
		background: #f6ffed;
	}

	&.error {
		color: #ff4d4f;
		background: #fff2f0;
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
