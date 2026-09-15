<template>
	<view>
		<!-- 下货扫码区 -->
		<view class="section-card" v-if="selectedItem">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="compose" color="#fff" size="18"></uni-icons>
					<text class="header-title">{{$t('warehouse.pickupScanTitle')}}</text>
				</view>
			</view>
			<view class="card-content">
				<!-- 选中物料信息 -->
				<view class="selected-material">
					<view class="info-row">
						<text class="info-label">{{$t('warehouse.tagCode')}}：</text>
						<text class="info-value">{{selectedItem.labelCode || '--'}}</text>
					</view>
					<view class="info-row">
						<text class="info-label">{{$t('warehouse.code')}}：</text>
						<text class="info-value">{{selectedItem.materialCode || '--'}}</text>
					</view>
					<view class="info-row">
						<text class="info-label">{{$t('warehouse.materialNameColon')}}</text>
						<text class="info-value">{{selectedItem.materialName || '--'}}</text>
					</view>
				</view>
				<view class="divider"></view>
				<view class="input-row">
					<view class="input-group">
						<uni-icons type="home-filled" color="#667eea" size="18"></uni-icons>
						<uni-easyinput
							v-model="storageCode"
							:inputBorder="false"
							:focus="storageFocusFlag"
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

				<!-- 第二步：标签码（货架码录入后显示） -->
				<view class="label-input-row" v-if="storageReady">
					<view class="divider"></view>
					<view class="input-row">
						<view class="input-group">
							<uni-icons type="paperplane" color="#52c41a" size="18"></uni-icons>
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
				</view>
			</view>
		</view>

		<!-- 本次扫码列表 -->
		<view class="section-card" v-if="labelList.length > 0">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="list-check" color="#fff" size="18"></uni-icons>
					<text class="header-title">{{$t('warehouse.scanListTitle')}}</text>
				</view>
				<view class="header-right">
					<text class="count-badge">{{labelList.length}}</text>
				</view>
			</view>
			<view class="card-content no-padding">
				<view class="scan-item" v-for="(item, index) in labelList" :key="index">
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
						<view class="delete-btn" @click="onRemoveLabelItem(index)">
							<uni-icons type="trash-filled" color="#ff4d4f" size="18"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部取货按钮 -->
		<view class="submit-btn-wrapper" v-if="labelList.length > 0">
			<button class="submit-btn" :class="{ disabled: isSubmitting }" @click="onSubmit" :disabled="isSubmitting">
				<text>{{ isSubmitting ? $t('warehouse.pickupLoading') : $t('warehouse.shelfPickup') }}</text>
			</button>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import goodsShelvingApi from '/api/warehouse/goodsShelving.js'
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		props: {
			formCode: { type: String, default: '' },
			selectedItem: { type: Object, default: null }
		},
		data() {
			return {
				storageCode: '',
				storageFocusFlag: false,
				// 货架码已录入，进入标签码扫码步骤
				storageReady: false,
				labelCode: '',
				labelFocusFlag: false,
				// 本次扫码标签列表
				labelList: [],
				isSubmitting: false,
				isChecking: false
			}
		},
		watch: {
			selectedItem(val) {
				// 选中行变化（含取消选中）时清空扫码状态
				this.resetForm();
				if (val) {
					this.$nextTick(() => {
						this.storageFocusFlag = true;
					});
				}
			}
		},
		methods: {
			// 重置扫码状态，准备下一次取货
			resetForm() {
				this.storageCode = '';
				this.storageFocusFlag = false;
				this.storageReady = false;
				this.labelCode = '';
				this.labelFocusFlag = false;
				this.labelList = [];
			},

			// 录入货架码后进入标签码步骤
			toLabelStep() {
				this.storageReady = true;
				this.labelFocusFlag = false;
				this.$nextTick(() => {
					this.labelFocusFlag = true;
				});
			},

			onStorageCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.storageCode = code;
					_this.toLabelStep();
				}).catch(err => {
					showBeautyToast({ title: err || _this.$t('warehouse.scanFail'), icon: 'none' });
				});
			},

			onStorageCodeConfirm() {
				const _this = this;
				setTimeout(function() {
					if (_this.storageCode) {
						_this.toLabelStep();
					}
				}, 200);
			},

			// 标签码扫码：扫到后若货架码已录入则自动校验并加入列表
			onLabelCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.labelCode = code;
					if (_this.storageCode) {
						_this.onLabelCheck();
					}
				}).catch(err => {
					showBeautyToast({ title: err || _this.$t('warehouse.scanFail'), icon: 'none' });
				});
			},

			// 标签码回车 → 校验通过后加入扫码列表
			onLabelCodeConfirm() {
				const _this = this;
				setTimeout(function() {
					if (_this.labelCode) {
						_this.onLabelCheck();
					}
				}, 200);
			},

			// 标签码校验：调用上/下架校验接口，校验通过后加入扫码列表
			onLabelCheck() {
				if (this.isChecking || this.isSubmitting) return;
				if (!this.labelCode) {
					showBeautyToast({ title: this.$t('warehouse.scanOrInputLabel'), icon: 'none' });
					return;
				}
				if (!this.storageCode) {
					showBeautyToast({ title: this.$t('warehouse.scanOrInputShelf'), icon: 'none' });
					return;
				}

				// 检查是否已存在相同标签码
				const exists = this.labelList.find(item => item.labelCode === this.labelCode);
				if (exists) {
					showBeautyToast({ title: this.$t('warehouse.labelAlreadyScanned'), icon: 'none' });
					return;
				}

				this.isChecking = true;
				goodsShelvingApi.checkLabelCode(this.formCode, this.labelCode, this.storageCode).then(resp => {
					this.isChecking = false;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data || {};
						this.labelList.push({
							labelCode: data.labelCode || this.labelCode,
							materialCode: data.materialCode || (this.selectedItem ? this.selectedItem.materialCode : ''),
							materialName: data.materialName || (this.selectedItem ? this.selectedItem.materialName : ''),
							packageNumber: data.packageNumber || data.number || (this.selectedItem ? this.selectedItem.number : 0),
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
			onRemoveLabelItem(index) {
				this.labelList.splice(index, 1);
			},

			// 提交取货：将扫码列表中的标签一次性提交
			onSubmit() {
				if (this.isSubmitting) return;
				if (this.labelList.length === 0) {
					showBeautyToast({ title: this.$t('warehouse.scanAddMaterialFirst'), icon: 'none' });
					return;
				}
				if (!this.storageCode) {
					showBeautyToast({ title: this.$t('warehouse.scanOrInputShelf'), icon: 'none' });
					return;
				}

				// 组装标签列表
				const firstItem = this.labelList[0];
				const labelCodes = this.labelList.map(item => ({
					labelCode: item.labelCode,
					number: item.packageNumber || item.number || 0
				}));

				this.isSubmitting = true;
				goodsShelvingApi.getOutLabel(
					this.formCode,
					labelCodes,
					firstItem.storageCode || this.storageCode,
					-1
				).then(resp => {
					this.isSubmitting = false;
					if (resp.code == 200 || resp.code == '200') {
						showBeautyToast({ title: resp.msg || this.$t('warehouse.pickupSuccess'), icon: 'success' });
						this.$emit('success');
						// 重置，准备下一次
						this.resetForm();
						this.$nextTick(() => {
							this.storageFocusFlag = true;
						});
					} else {
						showBeautyToast({ title: resp.msg || this.$t('warehouse.pickupFail'), icon: 'none' });
					}
				}).catch(() => {
					this.isSubmitting = false;
					showBeautyToast({ title: this.$t('warehouse.pickupFail'), icon: 'none' });
				});
			},

			// 给父组件调用：硬件扫码枪扫码，按当前步骤路由到货架码或标签码
			setScanCode(code) {
				if (!this.storageReady) {
					this.setStorageCode(code);
				} else {
					this.setLabelCode(code);
				}
			},

			// 给父组件调用：外部扫码枪赋值 storageCode
			setStorageCode(code) {
				this.storageCode = code;
				this.toLabelStep();
			},

			// 给父组件调用：外部扫码枪赋值 labelCode 并校验入列
			setLabelCode(code) {
				this.labelCode = code;
				this.onLabelCheck();
			}
		}
	}
</script>

<style scoped>
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

	.card-content {
		padding: 24rpx 30rpx;
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.input-group {
		flex: 1;
		display: flex;
		align-items: center;
		background: #f5f7fa;
		border-radius: 16rpx;
		padding: 0 16rpx;
		border: 2rpx solid #e8eaf0;
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

	.selected-material {
		background: #f8f9fb;
		border-radius: 12rpx;
		padding: 16rpx 20rpx;
		margin-bottom: 16rpx;
	}

	.info-row {
		display: flex;
		align-items: center;
		padding: 6rpx 0;
	}

	.info-label {
		font-size: 24rpx;
		color: #999;
	}

	.info-value {
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
	}

	.divider {
		height: 1rpx;
		background: #e8eaf0;
		margin-bottom: 16rpx;
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

	.card-content.no-padding {
		padding: 0;
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
		background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
		border: none;
		border-radius: 12rpx;
		padding: 18rpx 0;
		box-shadow: 0 4rpx 12rpx rgba(9, 88, 217, 0.3);
	}

	.submit-btn.disabled {
		opacity: 0.6;
		pointer-events: none;
	}
</style>
