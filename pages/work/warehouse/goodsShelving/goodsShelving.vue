<template>
	<view class="ware-house-container">
		<!-- 模式选择页面 -->
		<view class="mode-selector" v-if="!shelvingMode">
			<view class="mode-header">
				<text class="mode-title">{{$t('warehouse.selectShelvingMode')}}</text>
			</view>
			<view class="mode-list">
				<view class="mode-item" @click="onModeSwitch('normal')">
					<uni-icons type="list" color="#667eea" size="28"></uni-icons>
					<text>{{$t('warehouse.shelvingNormal')}}</text>
				</view>
				<view class="mode-item" @click="onModeSwitch('smart')">					<uni-icons type="list" color="#667eea" size="28"></uni-icons>
					<uni-icons type="list" color="#667eea" size="28"></uni-icons>
					<text>{{$t('warehouse.shelvingSmart')}}</text>
				</view>
			</view>
		</view>

		<!-- 正常页面内容 -->
		<view class="box-body" v-else>
			<!-- 单据扫码区 -->
			<view class="section-card">
				<view class="card-header">
					<view class="header-left">
						<uni-icons type="paperplane-filled" color="#fff" size="18"></uni-icons>
						<text class="header-title">{{$t('warehouse.formScanTitle')}}</text>
					</view>
				</view>
				<view class="card-content">
					<view class="input-row">
						<view class="input-group">
							<uni-icons type="paperplane" color="#667eea" size="18"></uni-icons>
							<uni-easyinput
								v-model="formCode"
								:inputBorder="false"
								placeholderStyle="color: #999;"
								:placeholder="$t('warehouse.scanOrInputForm')"
								@confirm="onFormCodeConfirm"
								class="main-input"
							></uni-easyinput>
						</view>
						<view class="scan-btn" @click="onFormCodeScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('warehouse.scan')}}</text>
						</view>
					</view>
					<!-- 订单信息 -->
					<view class="order-info" v-if="orderLoaded">
						<view class="table-wrapper">
							<view class="table-row table-header">
								<view class="table-cell" style="flex: 1.5;">{{$t('warehouse.tagCode')}}</view>
								<view class="table-cell" style="flex: 1.5;">{{$t('warehouse.code')}}</view>
								<view class="table-cell" style="flex: 2;">{{$t('warehouse.materialName')}}</view>
								<view class="table-cell" style="flex: 1;">{{$t('warehouse.qty')}}</view>
								<view class="table-cell" style="flex: 1;">{{$t('warehouse.status')}}</view>
							</view>
							<view class="table-row" v-for="item in materialList" :key="item.labelCode">
								<view class="table-cell" style="flex: 1.5;">{{item.labelCode || '--'}}</view>
								<view class="table-cell" style="flex: 1.5;">{{item.materialCode || '--'}}</view>
								<view class="table-cell" style="flex: 2;">{{item.materialName || '--'}}</view>
								<view class="table-cell highlight" style="flex: 1;">{{item.number || '--'}}</view>
								<view class="table-cell" style="flex: 1;" :class="item.finishFlag == -1 ? 'text-warn' : 'text-success'">
									{{item.finishFlag == -1 ? $t('warehouse.notShelved') : $t('warehouse.shelved')}}
								</view>
							</view>
						</view>
					</view>
					<view class="empty-info" v-if="!orderLoaded && formCode">
						<text class="empty-text">{{$t('warehouse.clickScanOrEnterForm')}}</text>
					</view>
				</view>
			</view>

			<!-- 上架扫码区 -->
			<view class="section-card">
				<view class="card-header">
					<view class="header-left">
						<uni-icons type="scan" color="#fff" size="18"></uni-icons>
						<text class="header-title">{{$t('warehouse.shelvingScanTitle')}}</text>
					</view>
				</view>
				<view class="card-content">
					<view class="input-row">
						<view class="input-group">
							<uni-icons type="home-filled" color="#667eea" size="18"></uni-icons>
							<uni-easyinput
								v-model="storageCode"
								:inputBorder="false"
								placeholderStyle="color: #999;"
								:placeholder="$t('warehouse.scanOrInputShelf')"
								@confirm="onStorageCodeConfirm"
								class="main-input"
							></uni-easyinput>
						</view>
						<view class="scan-btn" @click="onStorageCodeScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('warehouse.scan')}}</text>
						</view>
					</view>
					<view class="input-row" v-if="labelInputEnabled">
						<view class="input-group">
							<uni-icons type="gift-filled" color="#667eea" size="18"></uni-icons>
							<uni-easyinput
								v-model="labelCode"
								:inputBorder="false"
								:focus="labelFocusFlag"
								placeholderStyle="color: #999;"
								:placeholder="$t('warehouse.scanOrInputLabel')"
								@confirm="onLabelCodeConfirm"
								class="main-input"
							></uni-easyinput>
						</view>
						<view class="scan-btn" @click="onLabelCodeScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('warehouse.scan')}}</text>
						</view>
					</view>
					<!-- 智能模式亮灯提示 -->
					<view class="light-tip" v-if="shelvingMode === 'smart' && storageCode && !lightSuccess && !lightLoading">
						<text>{{$t('warehouse.pressEnterLight')}}</text>
					</view>
					<view class="light-tip loading" v-if="lightLoading">
						<uni-icons type="spinner-cycle" size="16" color="#667eea" class="loading-icon"></uni-icons>
						<text>{{$t('warehouse.lightingLoading')}}</text>
					</view>
					<view class="add-btn-wrapper-inner" v-if="labelInputEnabled">
						<button class="add-btn" :class="{ disabled: isChecking }" @click="onCheckAndAdd" :disabled="isChecking">
							<text>{{ isChecking ? $t('warehouse.checking') : $t('warehouse.checkAndAdd') }}</text>
						</button>
					</view>
				</view>
			</view>

			<!-- 本次扫码列表 -->
			<view class="section-card" v-if="scanList.length > 0">
				<view class="card-header">
					<view class="header-left">
						<uni-icons type="list-check" color="#fff" size="18"></uni-icons>
						<text class="header-title">{{$t('warehouse.scanListTitle')}}</text>
					</view>
					<view class="header-right">
						<text class="count-badge">{{scanList.length}}</text>
					</view>
				</view>
				<view class="card-content no-padding">
					<view class="scan-item" v-for="(item, index) in scanList" :key="index">
						<view class="item-index">
							<text class="index-circle">{{index + 1}}</text>
						</view>
						<view class="item-info">
							<view class="item-row">
								<text class="item-label">{{$t('warehouse.tagCode')}}</text>
								<text class="item-value">{{item.labelCode || '--'}}</text>
							</view>
							<view class="item-row">
								<text class="item-label">{{$t('warehouse.code')}}</text>
								<text class="item-value">{{item.materialCode || '--'}}</text>
							</view>
							<view class="item-row">
								<text class="item-label">{{$t('warehouse.materialName')}}</text>
								<text class="item-value">{{item.materialName || '--'}}</text>
							</view>
							<view class="item-row">
								<text class="item-label">{{$t('warehouse.qty')}}</text>
								<text class="item-value">{{item.packageNumber || '--'}}</text>
							</view>
						</view>
						<view class="item-action">
							<view class="delete-btn" @click="onRemoveScanItem(index)">
								<uni-icons type="trash-filled" color="#ff4d4f" size="18"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部确认按钮 -->
		<view class="submit-btn-wrapper" v-if="scanList.length > 0">
			<button class="submit-btn" :class="{ disabled: isSubmitting }" @click="onSubmit" :disabled="isSubmitting">
				<text>{{ isSubmitting ? $t('warehouse.submittingText') : $t('warehouse.confirmShelving') }}</text>
			</button>
		</view>

		<!-- 加载遮罩 -->
		<view class="loading-mask" v-if="isLoading">
			<view class="loading-content">
				<uni-icons type="spinner-cycle" size="40" color="#667eea" class="loading-icon"></uni-icons>
				<text class="loading-text">{{$t('warehouse.loadingDots')}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import goodsShelvingApi from '/api/warehouse/goodsShelving.js'
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				// 模式：空=未选择, normal=货架上架, smart=智能货架上架
				shelvingMode: '',
				// 智能模式亮灯成功标志
				lightSuccess: false,
				lightLoading: false,

				// 单据号
				formCode: '',
				materialList: [],
				orderLoaded: false,

				// 上架扫码
				storageCode: '',
				labelCode: '',
				labelFocusFlag: false,

				// 本次扫码列表
				scanList: [],

				// 状态
				isChecking: false,
				isSubmitting: false,
				isLoading: false
			}
		},
		computed: {
			// 标签码输入是否可用
			labelInputEnabled() {
				if (this.shelvingMode === 'smart') {
					return this.lightSuccess;
				}
				return !!this.storageCode;
			}
		},
		onLoad() {
			const _this = this;
			// 硬件扫码枪监听
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
		methods: {
			// 模式切换
			onModeSwitch(mode) {
				this.shelvingMode = mode;
				// 切换模式时重置所有状态
				this.formCode = '';
				this.materialList = [];
				this.orderLoaded = false;
				this.storageCode = '';
				this.labelCode = '';
				this.scanList = [];
				this.lightSuccess = false;
				this.lightLoading = false;
			},

			// 硬件扫码枪处理 - 根据上下文分发
			handleHardwareScan(code) {
				if (!this.orderLoaded && !this.formCode) {
					// 第一扫：识别为单据号
					this.formCode = code;
					this.loadOrder();
				} else if (this.shelvingMode === 'smart') {
					// 智能模式：先填货架码，亮灯成功后填标签码
					if (!this.storageCode) {
						this.storageCode = code;
						this.onStorageCodeConfirm();
					} else if (this.lightSuccess) {
						this.labelCode = code;
						this.onCheckAndAdd();
					}
				} else {
					// 普通模式：先填货架码，再填标签码
					if (!this.storageCode) {
						this.storageCode = code;
					} else {
						this.labelCode = code;
						if (this.storageCode) {
							this.onCheckAndAdd();
						}
					}
				}
			},

			// 单据号扫码
			onFormCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.formCode = code;
					_this.loadOrder();
				}).catch(err => {
					showBeautyToast({ title: err || _this.$t('warehouse.scanFail'), icon: 'none' });
				});
			},

			// 单据号回车确认
			onFormCodeConfirm() {
				const _this = this;
				setTimeout(function() {
					if (_this.formCode) {
						_this.loadOrder();
					}
				}, 200);
			},

			// 加载单据信息
			loadOrder() {
				if (!this.formCode) {
					showBeautyToast({ title: this.$t('warehouse.inputForm'), icon: 'none' });
					return;
				}
				this.isLoading = true;
				this.orderLoaded = false;
				this.materialList = [];
				this.scanList = [];
				this.storageCode = '';
				this.labelCode = '';
				this.lightSuccess = false;
				this.lightLoading = false;
				goodsShelvingApi.getByFormCode(this.formCode).then(resp => {
					this.isLoading = false;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data;
						if (Array.isArray(data) && data.length > 0) {
							this.materialList = data;
							this.orderLoaded = true;
						} else {
							showBeautyToast({ title: this.$t('warehouse.noFormInfo'), icon: 'none' });
						}
					} else {
						showBeautyToast({ title: resp.msg || this.$t('warehouse.queryFailed'), icon: 'none' });
					}
				}).catch(() => {
					this.isLoading = false;
					showBeautyToast({ title: this.$t('warehouse.queryFailed'), icon: 'none' });
				});
			},

			// 货架码扫码
			onStorageCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.storageCode = code;
					// 智能模式扫码后自动触发亮灯
					if (_this.shelvingMode === 'smart') {
						_this.onTriggerLight();
					}
				}).catch(err => {
					showBeautyToast({ title: err || _this.$t('warehouse.scanFail'), icon: 'none' });
				});
			},

			// 货架码回车
			onStorageCodeConfirm() {
				const _this = this;
				setTimeout(function() {
					if (!_this.storageCode) return;
					// 智能模式：调用亮灯接口
					if (_this.shelvingMode === 'smart') {
						_this.onTriggerLight();
					}
				}, 200);
			},

			// 智能模式触发亮灯
			onTriggerLight() {
				if (this.lightLoading) return;
				if (!this.formCode) {
					showBeautyToast({ title: this.$t('warehouse.scanFormFirst'), icon: 'none' });
					return;
				}
				this.lightLoading = true;
				this.lightSuccess = false;
				goodsShelvingApi.getOutLight(this.formCode, this.storageCode).then(resp => {
					this.lightLoading = false;
					if (resp.code == 200 || resp.code == '200') {
						this.lightSuccess = true;
						showBeautyToast({ title: this.$t('warehouse.lightSuccessScanLabel'), icon: 'success' });
						// 自动聚焦到标签码输入
						this.$nextTick(() => {
							this.labelFocusFlag = true;
						});
					} else {
						showBeautyToast({ title: resp.msg || this.$t('warehouse.lightFail'), icon: 'none' });
					}
				}).catch(() => {
					this.lightLoading = false;
					showBeautyToast({ title: this.$t('warehouse.lightFail'), icon: 'none' });
				});
			},

			// 标签码扫码
			onLabelCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.labelCode = code;
					// 如果货架码也有值，自动校验
					if (_this.storageCode) {
						_this.onCheckAndAdd();
					}
				}).catch(err => {
					showBeautyToast({ title: err || _this.$t('warehouse.scanFail'), icon: 'none' });
				});
			},

			// 标签码回车
			onLabelCodeConfirm() {
				const _this = this;
				setTimeout(function() {
					if (_this.storageCode) {
						_this.onCheckAndAdd();
					}
				}, 200);
			},

			// 校验并添加到列表
			onCheckAndAdd() {
				if (this.isChecking) return;

				if (!this.formCode) {
					showBeautyToast({ title: this.$t('warehouse.scanFormFirst'), icon: 'none' });
					return;
				}
				if (!this.storageCode) {
					showBeautyToast({ title: this.$t('warehouse.scanOrInputShelf'), icon: 'none' });
					return;
				}
				if (!this.labelCode) {
					showBeautyToast({ title: this.$t('warehouse.scanOrInputLabel'), icon: 'none' });
					return;
				}

				// 检查是否已存在相同标签码
				const exists = this.scanList.find(item => item.labelCode === this.labelCode);
				if (exists) {
					showBeautyToast({ title: this.$t('warehouse.labelAlreadyScanned'), icon: 'none' });
					return;
				}

				this.isChecking = true;
				goodsShelvingApi.checkLabelCode(this.formCode, this.labelCode, this.storageCode).then(resp => {
					this.isChecking = false;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data;
						this.scanList.push({
							labelCode: data.labelCode || this.labelCode,
							materialCode: data.materialCode || '',
							materialName: data.materialName || '',
							packageNumber: data.packageNumber || data.number || 0,
							batchCode: data.batchCode || '',
							storageCode: this.storageCode,
							_data: data
						});
						showBeautyToast({ title: this.$t('warehouse.checkSuccess'), icon: 'success' });
						// 清空标签码并重新聚焦，准备下一次扫码
						this.labelCode = '';
						this.labelFocusFlag = false;
						this.$nextTick(() => {
							this.labelFocusFlag = true;
						});
					} else {
						showBeautyToast({ title: resp.msg || this.$t('warehouse.checkFail'), icon: 'none' });
					}
				}).catch(() => {
					this.isChecking = false;
					showBeautyToast({ title: this.$t('warehouse.checkFail'), icon: 'none' });
				});
			},

			// 删除扫码列表项
			onRemoveScanItem(index) {
				this.scanList.splice(index, 1);
			},

			// 数量变更
			onQtyChange(index) {
				// v-model 已自动更新，此处可做额外处理（如最小值校验）
				const item = this.scanList[index];
				if (item.packageNumber < 0) {
					item.packageNumber = 0;
				}
			},

			// 确认上架
			onSubmit() {
				if (this.isSubmitting) return;

				if (this.scanList.length === 0) {
					showBeautyToast({ title: this.$t('warehouse.scanAddMaterialFirst'), icon: 'none' });
					return;
				}

				// 取第一条的 materialCode 和 storageCode
				const firstItem = this.scanList[0];
				const labelCodes = this.scanList.map(item => ({
					labelCode: item.labelCode,
					number: item.packageNumber || item.number || 0
				}));

				this.isSubmitting = true;
				goodsShelvingApi.insert(
					this.formCode,
					labelCodes,
					firstItem.materialCode,
					firstItem.storageCode,
					this.shelvingMode === 'smart' ? 1 : -1
				).then(resp => {
					this.isSubmitting = false;
					if (resp.code == 200 || resp.code == '200') {
						showBeautyToast({ title: this.$t('warehouse.shelvingSuccess'), icon: 'success' });
						// 清空扫描列表，重新加载单据信息
						this.scanList = [];
						this.loadOrder();
					} else {
						console.log(resp);
						showBeautyToast({ title: resp.msg || this.$t('warehouse.shelvingFail'), icon: 'none' });
					}
				}).catch((error) => {
					console.log(error);
					this.isSubmitting = false;
					showBeautyToast({ title: this.$t('warehouse.shelvingFail'), icon: 'none' });
				});
			}
		}
	}
</script>

<style scoped>
	.ware-house-container {
		min-height: 100vh;
		background: #f5f7fa;
		padding-bottom: 140rpx;
	}

	/* ========== 模式选择页面 ========== */
	.mode-selector {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding: 40rpx 30rpx;
	}

	.mode-header {
		margin-bottom: 60rpx;
	}

	.mode-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.mode-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.mode-item {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.mode-item text {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
	}

	.mode-item:active {
		background: #f5f7fa;
		transform: scale(0.98);
	}

	/* ========== 亮灯提示 ========== */
	.light-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 16rpx 0;
		font-size: 24rpx;
		color: #999;
		margin-top: 8rpx;
	}

	.light-tip.loading {
		color: #667eea;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}

	.box-body {
		padding: 20rpx;
	}

	/* ========== 卡片通用 ========== */
	.section-card {
		background: #fff;
		border-radius: 24rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.card-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.header-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #fff;
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

	.card-content {
		padding: 24rpx 30rpx;
	}

	.card-content.no-padding {
		padding: 0;
	}

	/* ========== 输入行 ========== */
	.input-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.input-row:last-of-type {
		margin-bottom: 0;
	}

	.input-group {
		flex: 1;
		display: flex;
		align-items: center;
		background: #f5f7fa;
		border-radius: 16rpx;
		padding: 0 16rpx;
		border: 2rpx solid #e8eaf0;
		transition: border-color 0.2s;
	}

	.input-group:focus-within {
		border-color: #667eea;
	}

	.main-input {
		flex: 1;
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
	}

	.scan-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.25);
	}

	/* ========== 单据信息 ========== */
	.order-info {
		margin-top: 20rpx;
	}

	.table-wrapper {
		padding: 0;
	}

	.table-row {
		display: flex;
		align-items: center;
		padding: 16rpx 8rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-header {
		background: #f8f9fb;
		border-radius: 12rpx;
		font-weight: bold;
	}

	.table-header .table-cell {
		color: #667eea;
		font-size: 26rpx;
	}

	.table-cell {
		font-size: 24rpx;
		color: #333;
		padding: 0 8rpx;
		word-break: break-all;
	}

	.highlight {
		font-weight: bold;
		color: #667eea;
	}

	.text-warn {
		color: #faad14;
		font-weight: bold;
	}

	.text-success {
		color: #52c41a;
		font-weight: bold;
	}

	.empty-info {
		margin-top: 20rpx;
		text-align: center;
		padding: 30rpx 0;
	}

	.empty-text {
		font-size: 24rpx;
		color: #999;
	}

	/* ========== 校验按钮 ========== */
	.add-btn-wrapper-inner {
		margin-top: 20rpx;
	}

	.add-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		font-size: 26rpx;
		font-weight: 500;
		border: none;
		border-radius: 12rpx;
		padding: 16rpx 0;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.25);
	}

	.add-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 3rpx 10rpx rgba(102, 126, 234, 0.25);
	}

	.add-btn.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	/* ========== 扫码列表 ========== */
	.scan-item {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.scan-item:last-child {
		border-bottom: none;
	}

	.item-index {
		flex-shrink: 0;
		margin-right: 20rpx;
	}

	.index-circle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		font-size: 22rpx;
		font-weight: bold;
	}

	.item-info {
		flex: 1;
	}

	.item-row {
		display: flex;
		align-items: center;
		padding: 4rpx 0;
	}

	.item-label {
		font-size: 22rpx;
		color: #999;
		min-width: 110rpx;
	}

	.item-value {
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
	}

	.qty-input {
		flex: 1;
		height: 48rpx;
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
		background: #f5f7fa;
		border: 2rpx solid #e8eaf0;
		border-radius: 8rpx;
		padding: 0 12rpx;
		text-align: center;
		min-width: 80rpx;
	}

	.item-action {
		flex-shrink: 0;
		margin-left: 16rpx;
	}

	.delete-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff1f0;
		border-radius: 50%;
	}

	.delete-btn:active {
		background: #ffccc7;
	}

	/* ========== 底部提交按钮 ========== */
	.submit-btn-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
		z-index: 100;
	}

	.submit-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		border: none;
		border-radius: 12rpx;
		padding: 18rpx 0;
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
	}

	.submit-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 16rpx rgba(82, 196, 26, 0.3);
	}

	.submit-btn.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	/* ========== 加载遮罩 ========== */
	.loading-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx 60rpx;
		gap: 16rpx;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}

	.loading-text {
		font-size: 26rpx;
		color: #666;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
