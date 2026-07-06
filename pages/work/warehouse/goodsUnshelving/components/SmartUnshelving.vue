<template>
	<view>
		<!-- 智能货架下架 -->
		<view class="section-card">
			<view class="card-header">
				<view class="header-left">
					<uni-icons type="compose" color="#fff" size="18"></uni-icons>
					<text class="header-title">智能货架下架</text>
				</view>
			</view>
			<view class="card-content">
				<!-- 第一步：货架码 -->
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

				<!-- 第二步：标签码（亮灯成功后显示） -->
				<view class="label-input-row" v-if="lightSuccess">
					<view class="divider"></view>
					<view class="input-row">
						<view class="input-group">
							<uni-icons type="paperplane" color="#52c41a" size="18"></uni-icons>
							<uni-easyinput
								v-model="labelCode"
								:inputBorder="false"
								:focus="labelFocusFlag"
								placeholderStyle="color: #999;"
								placeholder="请扫描或输入标签码"
								@confirm="onLabelCodeConfirm"
								class="main-input"
							></uni-easyinput>
						</view>
						<view class="scan-btn" @click="onLabelCodeScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>扫码</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部取货按钮 -->
		<view class="submit-btn-wrapper" v-if="lightSuccess && labelCode">
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
			formCode: { type: String, default: '' }
		},
		data() {
			return {
				storageCode: '',
				storageFocusFlag: false,
				labelCode: '',
				labelFocusFlag: false,
				lightSuccess: false,
				isSubmitting: false
			}
		},
		mounted() {
			// 自动聚焦货架码
			this.$nextTick(() => {
				this.storageFocusFlag = true;
			});
		},
		methods: {
			// 货架码扫码
			onStorageCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.storageCode = code;
				}).catch(err => {
					showBeautyToast({ title: err || '扫码失败', icon: 'none' });
				});
			},

			// 货架码回车 → 调用亮灯接口
			onStorageCodeConfirm() {
				if (!this.storageCode) return;
				this.callGetOutLight();
			},

			// 调用智能货架亮灯接口
			callGetOutLight() {
				if (!this.storageCode) {
					showBeautyToast({ title: '请扫描或输入货架码', icon: 'none' });
					return;
				}
				goodsShelvingApi.getOutLight(this.formCode, this.storageCode).then(resp => {
					if (resp.code == 200 || resp.code == '200') {
						showBeautyToast({ title: resp.msg || '亮灯成功', icon: 'success' });
						this.lightSuccess = true;
						this.$nextTick(() => {
							this.labelFocusFlag = true;
						});
					} else {
						showBeautyToast({ title: resp.msg || '亮灯失败', icon: 'none' });
					}
				}).catch(() => {
					showBeautyToast({ title: '亮灯失败', icon: 'none' });
				});
			},

			// 标签码扫码
			onLabelCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.labelCode = code;
				}).catch(err => {
					showBeautyToast({ title: err || '扫码失败', icon: 'none' });
				});
			},

			// 标签码回车 → 直接取货
			onLabelCodeConfirm() {
				if (this.labelCode) {
					this.onSubmit();
				}
			},

			// 提交取货
			onSubmit() {
				if (this.isSubmitting) return;
				if (!this.labelCode) {
					showBeautyToast({ title: '请扫描或输入标签码', icon: 'none' });
					return;
				}
				if (!this.storageCode) {
					showBeautyToast({ title: '请扫描或输入货架码', icon: 'none' });
					return;
				}

				this.isSubmitting = true;
				goodsShelvingApi.getOutLabel(
					this.formCode,
					this.labelCode,
					'',
					this.storageCode,
					1
				).then(resp => {
					this.isSubmitting = false;
					if (resp.code == 200 || resp.code == '200') {
						showBeautyToast({ title: resp.msg || '取货成功', icon: 'success' });
						this.$emit('success');
						// 重置，准备下一次
						this.labelCode = '';
						this.lightSuccess = false;
						this.storageCode = '';
						this.$nextTick(() => {
							this.storageFocusFlag = true;
						});
					} else {
						showBeautyToast({ title: resp.msg || '取货失败', icon: 'none' });
					}
				}).catch(() => {
					this.isSubmitting = false;
					showBeautyToast({ title: '取货失败', icon: 'none' });
				});
			},

			// 给父组件调用：外部扫码枪赋值
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
		background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
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

	.label-input-row {
		margin-top: 0;
	}

	.divider {
		height: 1rpx;
		background: #e8eaf0;
		margin: 20rpx 0;
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
