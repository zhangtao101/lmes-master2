<template>
	<view class="trolley-query-page">
		<!-- 1. 查询条件 -->
		<view class="query-card">
			<uv-form :model="form" :border-bottom="false" :label-width="110" label-position="left">
				<uv-form-item :label="$t('sanyan.trolleyCodeLabel')">
					<view class="input-row">
						<uv-input v-model="form.cartCode" :placeholder="$t('sanyan.trolleyCodePlaceholder')"
							:clearable="true" confirm-type="search"
							custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onCartCodeConfirm" />
						<view class="scan-btn" @click="onScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
		</view>

		<!-- 2. 台车批次详情（只读，文本展示） -->
		<view class="detail-card">
			<scroll-view v-if="detail" scroll-y class="detail-body">
				<uv-form :model="detail" :border-bottom="false" :label-width="110" label-position="left">
					<uv-form-item :label="$t('sanyan.workSheetCode')">
						<text class="detail-value">{{ detail.workSheetCode || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.subLineCodeLabel')">
						<text class="detail-value">{{ detail.lineCode || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.subLineNameLabel')">
						<text class="detail-value">{{ detail.lineName || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.productCode')">
						<text class="detail-value">{{ detail.productCode || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.productName')">
						<text class="detail-value">{{ detail.productName || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.lotIdLabel')">
						<text class="detail-value">{{ detail.lotId || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.produceDateLabel')">
						<text class="detail-value">{{ detail.lotCreateTime || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.validDateLabel')">
						<text class="detail-value">{{ detail.validDate || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.sapSeqLabel')">
						<text class="detail-value">{{ detail.sapSeq || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.numberLabel')">
						<text class="detail-value">{{ detail.number != null ? detail.number : '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.equipLoaderLabel')">
						<text class="detail-value">{{ detail.equipCode || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.opUserLabel')">
						<text class="detail-value">{{ detail.opUser || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.trolleyCodeLabel')">
						<text class="detail-value">{{ detail.cartCode || '--' }}</text>
					</uv-form-item>
				</uv-form>
			</scroll-view>
			<view class="empty-state" v-else>
				<text>{{ loading ? $t('sanyan.loading') : (queried ? $t('common.noData') : $t('sanyan.queryHint')) }}</text>
			</view>
		</view>

		<!-- 3. 底部按钮 -->
		<view class="button-wrapper">
			<button class="action-btn" @click="onReset">{{$t('sanyan.init')}}</button>
			<button class="action-btn primary" :class="{ disabled: !canUnload }" @click="onUnload">
				<uni-icons v-if="unloading" type="spinner-cycle" size="18" class="loading-icon"></uni-icons>
				<text>{{$t('sanyan.unloadBtn')}}</text>
			</button>
		</view>
	</view>
</template>

<script>
	import packingApi from '/api/sanyang/vegetablePacking.js';
	import scanCode from '/common/scan.js';
	import showBeautyToast from '@/common/beautyToast.js';

	export default {
		data() {
			return {
				// 查询条件（仅台车编码）
				form: {
					cartCode: '' // 台车编码
				},
				detail: null, // 台车批次详情
				loading: false, // 查询中
				queried: false, // 是否已发起过查询
				unloading: false // 卸载提交中
			}
		},
		computed: {
			// 是否可卸载：已查询到台车批次信息且无请求进行中
			canUnload: function() {
				return this.detail != null && !this.unloading;
			}
		},
		// 页面进入后自动执行一次查询
		onLoad: function() {
			// this.onQuery();
		},
		methods: {
			// 台车编码回车确认：扫码枪回车极快，延迟 200ms 再取值，避免拿到不完整数据
			onCartCodeConfirm: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.form.cartCode) {
						_this.onQuery();
					}
				}, 200);
			},
			// 扫码：扫码结果回填输入框后直接查询
			onScan: function() {
				const _this = this;
				scanCode().then(function(code) {
					_this.form.cartCode = code;
					_this.onQuery();
				}).catch(function(err) {
					showBeautyToast({
						title: err || _this.$t('sanyan.scanFail'),
						icon: 'none'
					});
				});
			},
			// 查询
			onQuery: function() {
				this.detail = null;
				this.queried = true;
				this.fetchDetail();
			},
			// 拉取台车批次详情
			fetchDetail: function() {
				const _this = this;
				if (_this.loading) return;
				_this.loading = true;
				const cartCode = _this.form.cartCode ? _this.form.cartCode.trim() : '';
				packingApi.queryLotDetail({
					cartCode: cartCode
				}).then(function(res) {
					_this.loading = false;
					if (res.code == 200) {
						const data = res.data;
						let obj = null;
						if (Array.isArray(data)) {
							obj = data.length ? data[0] : null;
						} else if (data && Array.isArray(data.results)) {
							obj = data.results.length ? data.results[0] : null;
						} else if (data && typeof data === 'object') {
							obj = data;
						}
						_this.detail = obj;
					} else {
						_this.detail = null;
						uni.showToast({
							title: res.msg || _this.$t('sanyan.fail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.loading = false;
					_this.detail = null;
					uni.showToast({
						title: _this.$t('sanyan.netError'),
						icon: 'none'
					});
				});
			},
			// 初始化：清空条件后重新查询
			onReset: function() {
				this.form = {
					cartCode: ''
				};
				this.onQuery();
			},

			// ========== 卸载 ==========

			// 卸载：需已查询到台车信息，二次确认后提交
			onUnload: function() {
				const _this = this;
				if (_this.unloading) return;
				if (!_this.detail || !_this.detail.cartCode) {
					uni.showToast({
						title: _this.$t('sanyan.noCartCodeTip'),
						icon: 'none'
					});
					return;
				}
				// 二次确认，避免误触直接卸载
				uni.showModal({
					title: _this.$t('common.confirm'),
					content: _this.$t('sanyan.unloadConfirmTip'),
					success: function(modalRes) {
						if (!modalRes.confirm) return;
						_this.submitUnload(_this.detail.cartCode);
					}
				});
			},
			// 提交卸载请求：成功后清空台车信息，回到初始状态便于继续扫码
			submitUnload: function(cartCode) {
				const _this = this;
				if (_this.unloading) return;
				_this.unloading = true;
				packingApi.cartUnloading({
					cartCode: cartCode
				}).then(function(res) {
					_this.unloading = false;
					if (res.code == 200) {
						uni.showToast({
							title: _this.$t('sanyan.unloadSuccess'),
							icon: 'success'
						});
						_this.detail = null;
						_this.form = {
							cartCode: ''
						};
						_this.queried = false;
					} else {
						uni.showToast({
							title: res.msg || _this.$t('sanyan.unloadFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.unloading = false;
					uni.showToast({
						title: _this.$t('sanyan.unloadFail'),
						icon: 'none'
					});
				});
			}
		}
	}
</script>

<style lang="less" scoped>
	.trolley-query-page {
		height: 95vh;
		box-sizing: border-box;
		padding-bottom: 160rpx;
		background: #f5f7fa;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* 查询区 */
	.query-card {
		flex-shrink: 0;
		margin: 20rpx 24rpx 0;
		padding: 16rpx 24rpx 0;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

		/* 输入框 + 扫码按钮 */
		.input-row {
			width: 100%;
			display: flex;
			align-items: center;
			gap: 16rpx;

			.scan-btn {
				flex-shrink: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 6rpx;
				height: 38px;
				box-sizing: border-box;
				padding: 0 24rpx;
				border-radius: 12rpx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				font-size: 24rpx;
				box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.35);

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.25);
				}
			}
		}
	}

	/* 详情区 */
	.detail-card {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		margin: 20rpx 24rpx 0;
		padding: 16rpx 24rpx 0;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

		.detail-body {
			flex: 1;
			min-height: 0;
		}

		.detail-value {
			font-size: 28rpx;
			color: #303133;
			word-break: break-all;
			line-height: 1.4;
		}

		.empty-state {
			flex: 1;
			padding: 80rpx 30rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #999;
		}
	}

	/* 底部按钮区 */
	.button-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 20rpx 30rpx;
		display: flex;
		gap: 20rpx;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

		.action-btn {
			flex: 1;
			height: 88rpx;
			line-height: 88rpx;
			padding: 0;
			border-radius: 44rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12rpx;
			font-size: 28rpx;
			font-weight: 500;
			background: #f0f0f0;
			color: #999;
			box-shadow: none;

			&::after {
				border: none;
			}

			&.primary {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
				}
			}

			&:not(.disabled):active {
				transform: translateY(2rpx);
			}

			&.disabled {
				opacity: 0.5;
			}

			.loading-icon {
				animation: spin 1s linear infinite;
			}
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}
</style>
