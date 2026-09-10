<template>
	<view class="material-query-page">
		<!-- 1. 查询条件 -->
		<view class="query-card">
			<uv-form :model="form" :border-bottom="false" :label-width="110" label-position="left">
				<uv-form-item :label="$t('sanyan.labelCodeLabel')">
					<view class="input-row">
						<uv-input v-model="form.labelCode" :placeholder="$t('sanyan.labelCodePlaceholder')"
							:clearable="true" confirm-type="search"
							custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onLabelCodeConfirm" />
						<view class="scan-btn" @click="onScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
		</view>

		<!-- 2. 物料详情（只读，文本展示） -->
		<view class="detail-card">
			<scroll-view v-if="detail" scroll-y class="detail-body">
				<uv-form :model="detail" :border-bottom="false" :label-width="110" label-position="left">
					<uv-form-item :label="$t('sanyan.labelCodeLabel')">
						<text class="detail-value">{{ detail.labelCode || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.materialCodeLabel')">
						<text class="detail-value">{{ detail.materialCode || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.materialNameLabel')">
						<text class="detail-value">{{ detail.materialName || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.manufacturerLabel')">
						<text class="detail-value">{{ detail.manufacturerName || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.numberLabel')">
						<text class="detail-value">{{ detail.number != null ? detail.number : '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.operateDateLabel')">
						<text class="detail-value">{{ detail.operateDate || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.validDateLabel')">
						<text class="detail-value">{{ detail.validDate || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.produceDateLabel')">
						<text class="detail-value">{{ detail.produceDate || '--' }}</text>
					</uv-form-item>
					<uv-form-item :label="$t('sanyan.warehouseLabel')">
						<text class="detail-value">{{ detail.warehouseName || '--' }}</text>
					</uv-form-item>
				</uv-form>
			</scroll-view>
			<view class="empty-state" v-else>
				<text>{{ loading ? $t('sanyan.loading') : (queried ? $t('common.noData') : $t('sanyan.queryHint')) }}</text>
			</view>
		</view>

		<!-- 3. 底部按钮 -->
		<view class="button-wrapper">
			<button class="action-btn" @click="onReset">{{$t('common.reset')}}</button>
			<button class="action-btn primary" :class="{ disabled: loading }" @click="onQuery">
				<uni-icons type="search" size="18"></uni-icons>
				<text>{{$t('sanyan.query')}}</text>
			</button>
		</view>
	</view>
</template>

<script>
	import materialQueryApi from '/api/sanyang/weighPalletLoad.js';
	import scanCode from '/common/scan.js';
	import showBeautyToast from '@/common/beautyToast.js';

	export default {
		data() {
			return {
				// 查询条件（uv-form 展示字段）
				form: {
					labelCode: '' // 物料lot编号
				},
				detail: null, // 物料详情
				loading: false, // 查询中
				queried: false // 是否已发起过查询
			}
		},
		// 页面进入后自动执行一次查询
		onLoad: function() {
			this.onQuery();
		},
		methods: {
			// 物料 lot 编号回车确认：扫码枪回车极快，延迟 200ms 再取值，避免拿到不完整数据
			onLabelCodeConfirm: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.form.labelCode) {
						_this.onQuery();
					}
				}, 200);
			},
			// 扫码：扫码结果回填输入框后直接查询
			onScan: function() {
				const _this = this;
				scanCode().then(function(code) {
					_this.form.labelCode = code;
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
			// 拉取物料详情
			fetchDetail: function() {
				const _this = this;
				if (_this.loading) return;
				_this.loading = true;
				const labelCode = _this.form.labelCode ? _this.form.labelCode.trim() : '';
				materialQueryApi.searchLotMaterial(labelCode).then(function(res) {
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
			// 重置：清空条件后重新查询
			onReset: function() {
				this.form = {
					labelCode: ''
				};
				this.onQuery();
			}
		}
	}
</script>

<style lang="less" scoped>
	.material-query-page {
		height: 100vh;
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
		}
	}
</style>
