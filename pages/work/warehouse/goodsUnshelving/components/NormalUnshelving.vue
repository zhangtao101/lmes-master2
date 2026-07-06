<template>
	<view>
		<!-- 下货扫码区 -->
		<view class="section-card" v-if="selectedItem">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="compose" color="#fff" size="18"></uni-icons>
					<text class="header-title">下货扫码</text>
				</view>
			</view>
			<view class="card-content">
				<!-- 选中物料信息 -->
				<view class="selected-material">
					<view class="info-row">
						<text class="info-label">标签码：</text>
						<text class="info-value">{{selectedItem.labelCode || '--'}}</text>
					</view>
					<view class="info-row">
						<text class="info-label">料号：</text>
						<text class="info-value">{{selectedItem.materialCode || '--'}}</text>
					</view>
					<view class="info-row">
						<text class="info-label">物料名称：</text>
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
							placeholder="请扫描或输入货架码"
							@confirm="onStorageCodeConfirm"
							class="main-input"
						></uni-easyinput>
					</view>
					<view class="scan-btn" @click="onStorageCodeScan">
						<uni-icons type="scan" color="#fff" size="16"></uni-icons>
						<text>扫码</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部取货按钮 -->
		<view class="submit-btn-wrapper" v-if="selectedItem">
			<button class="submit-btn" :class="{ disabled: isSubmitting }" @click="onSubmit" :disabled="isSubmitting">
				<text>{{ isSubmitting ? '取货中...' : '货架取货' }}</text>
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
				isSubmitting: false
			}
		},
		watch: {
			selectedItem(val) {
				if (val) {
					this.storageCode = '';
					this.storageFocusFlag = false;
					this.$nextTick(() => {
						this.storageFocusFlag = true;
					});
				}
			}
		},
		methods: {
			onStorageCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.storageCode = code;
				}).catch(err => {
					showBeautyToast({ title: err || '扫码失败', icon: 'none' });
				});
			},

			onStorageCodeConfirm() {
				if (this.storageCode) {
					this.onSubmit();
				}
			},

			onSubmit() {
				if (this.isSubmitting) return;
				if (!this.selectedItem) {
					showBeautyToast({ title: '请先选择要下架的物料', icon: 'none' });
					return;
				}
				if (!this.storageCode) {
					showBeautyToast({ title: '请扫描或输入货架码', icon: 'none' });
					return;
				}

				this.isSubmitting = true;
				goodsShelvingApi.getOutLabel(
					this.formCode,
					this.selectedItem.labelCode,
					this.selectedItem.materialCode,
					this.storageCode,
					-1
				).then(resp => {
					this.isSubmitting = false;
					if (resp.code == 200 || resp.code == '200') {
						showBeautyToast({ title: resp.msg || '取货成功', icon: 'success' });
						this.$emit('success');
						this.storageCode = '';
					} else {
						showBeautyToast({ title: resp.msg || '取货失败', icon: 'none' });
					}
				}).catch(() => {
					this.isSubmitting = false;
					showBeautyToast({ title: '取货失败', icon: 'none' });
				});
			},

			// 给父组件调用：外部扫码枪赋值 storageCode
			setStorageCode(code) {
				this.storageCode = code;
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
