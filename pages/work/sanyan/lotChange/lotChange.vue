<template>
	<view class="lot-change-page">
		<!-- 1. 批次查询：LOT Id 或 台车编码 查询批次详情 -->
		<view class="section-card">
			<view class="card-title">
				<view class="title-bar"></view>
				<text>{{$t('sanyan.lotQueryTitle')}}</text>
			</view>
			<uv-form :model="form" :border-bottom="false" :label-width="110" label-position="left">
				<uv-form-item :label="$t('sanyan.lotIdLabel')">
					<view class="input-row">
						<uv-input v-model="form.lotId" :placeholder="$t('sanyan.lotIdPlaceholder')"
							:clearable="true" confirm-type="search" :focus="lotInputFocus"
							custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onLotIdConfirm" />
						<view class="scan-btn" @click="onScan('lotId')">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.trolleyCodeLabel')">
					<view class="input-row">
						<uv-input v-model="form.cartCode" :placeholder="$t('sanyan.trolleyCodePlaceholder')"
							:clearable="true" confirm-type="search"
							custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onCartCodeConfirm" />
						<view class="scan-btn" @click="onScan('cartCode')">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
		</view>

		<!-- 2. 批次详情（只读，文本展示） -->
		<view class="section-card detail-card">
			<view class="card-title">
				<view class="title-bar"></view>
				<text>{{$t('sanyan.lotDetailTitle')}}</text>
			</view>
			<uv-form v-if="detail" :model="detail" :border-bottom="false" :label-width="110"
				label-position="left">
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
			<view class="empty-state" v-else>
				<text>
					{{ detailLoading ? $t('sanyan.loading') : (queried ? $t('common.noData') : $t('sanyan.queryHint')) }}
				</text>
			</view>
		</view>

		<!-- 3. 装载目标台车：回车或扫码后查询该台车自身信息 -->
		<view class="section-card">
			<view class="card-title">
				<view class="title-bar"></view>
				<text>{{$t('sanyan.targetTrolleyLabel')}}</text>
			</view>
			<uv-form :model="form" :border-bottom="false" :label-width="110" label-position="left">
				<uv-form-item :label="$t('sanyan.trolleyCodeLabel')">
					<view class="input-row">
						<uv-input v-model="form.targetCartCode" :placeholder="$t('sanyan.targetTrolleyPlaceholder')"
							:clearable="true" confirm-type="search"
							custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onTargetCartConfirm" />
						<view class="scan-btn" @click="onTargetCartScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
		</view>

		<!-- 4. 装载目标台车自身信息（只读，文本展示） -->
		<view class="section-card detail-card">
			<view class="card-title">
				<view class="title-bar"></view>
				<text>{{$t('sanyan.trolleyInfoTitle')}}</text>
			</view>
			<uv-form v-if="cartDetail" :model="cartDetail" :border-bottom="false" :label-width="110"
				label-position="left">
				<uv-form-item :label="$t('sanyan.trolleyCodeLabel')">
					<text class="detail-value">{{ cartDetail.cartCode || '--' }}</text>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.cartNameLabel')">
					<text class="detail-value">{{ cartDetail.cartName || '--' }}</text>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.cartTypeLabel')">
					<text class="detail-value">{{ cartDetail.catTypeName || cartDetail.cartType || '--' }}</text>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.lotIdLabel')">
					<text class="detail-value">{{ cartDetail.lotId || '--' }}</text>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.maxLoadQuantityLabel')">
					<text class="detail-value">{{ cartDetail.maxLoadQuantity != null ? cartDetail.maxLoadQuantity : '--' }}</text>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.numberLabel')">
					<text class="detail-value">{{ cartDetail.quantity != null ? cartDetail.quantity : '--' }}</text>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.loadFlagLabel')">
					<text class="detail-value">{{ loadFlagText(cartDetail.loadFlag) }}</text>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.lockFlagLabel')">
					<text class="detail-value">{{ lockFlagText(cartDetail.lockFlag) }}</text>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.stateLabel')">
					<text class="detail-value">{{ cartDetail.stateName || cartDetail.state || '--' }}</text>
				</uv-form-item>
			</uv-form>
			<view class="empty-state" v-else>
				<text>
					{{ cartLoading ? $t('sanyan.loading') : (cartQueried ? $t('common.noData') : $t('sanyan.queryHint')) }}
				</text>
			</view>
		</view>

		<!-- 5. 底部按钮 -->
		<view class="button-wrapper">
			<button class="action-btn" @click="onInit">{{$t('sanyan.init')}}</button>
			<button class="action-btn primary" :class="{ disabled: !canChange }" @click="onChange">
				<uni-icons v-if="changing" type="spinner-cycle" size="18" class="loading-icon"></uni-icons>
				<text>{{$t('sanyan.changeBtn')}}</text>
			</button>
		</view>
	</view>
</template>

<script>
	import vegetablePacking from '/api/sanyang/vegetablePacking.js';
	import scanCode from '/common/scan.js';
	import showBeautyToast from '@/common/beautyToast.js';

	export default {
		name: 'lotChange',
		data() {
			return {
				// 查询条件：LOT Id 或 台车编码，二者其一即可查到批次详情；装载目标台车为变更目标
				form: {
					lotId: '', // 批次 Lot Id（查询条件）
					cartCode: '', // 台车编码（查询条件）
					targetCartCode: '' // 装载目标台车编码（变更目标）
				},
				detail: null, // 批次详情
				cartDetail: null, // 装载目标台车自身信息
				detailLoading: false, // 批次详情查询中
				cartLoading: false, // 目标台车信息查询中
				queried: false, // 是否已发起过批次查询
				cartQueried: false, // 是否已发起过目标台车查询
				changing: false, // LOT 变更提交中
				lotInputFocus: false // LOT Id 输入框聚焦标记（初始化/变更成功后重新聚焦，便于连续扫码）
			}
		},
		computed: {
			// 是否可变更：已查到批次详情（含 lotId）+ 已查到目标台车信息 + 无请求进行中
			canChange: function() {
				return !!(this.detail && this.detail.lotId && this.cartDetail && this.cartDetail
					.cartCode && !this.changing);
			}
		},
		methods: {
			// ========== 批次查询（LOT Id / 台车编码） ==========

			// LOT Id 回车确认：扫码枪回车极快，延迟 200ms 再取值，避免拿到不完整数据
			onLotIdConfirm: function() {
				const _this = this;
				setTimeout(function() {
					_this.form.lotId = (_this.form.lotId || '').trim();
					_this.onQuery();
				}, 200);
			},
			// 台车编码回车确认：同上
			onCartCodeConfirm: function() {
				const _this = this;
				setTimeout(function() {
					_this.form.cartCode = (_this.form.cartCode || '').trim();
					_this.onQuery();
				}, 200);
			},
			// 扫码：field 为写入的字段名（lotId / cartCode），扫码结果回填后直接查询
			onScan: function(field) {
				const _this = this;
				scanCode().then(function(code) {
					_this.form[field] = code;
					_this.onQuery();
				}).catch(function(err) {
					showBeautyToast({
						title: err || _this.$t('sanyan.scanFail'),
						icon: 'none'
					});
				});
			},
			// 查询：LOT Id 与 台车编码 任一有值即可查询，两者都为空才提示；两个都填则都传给接口
			onQuery: function() {
				const _this = this;
				if (_this.detailLoading) return;
				const lotId = (_this.form.lotId || '').trim();
				const cartCode = (_this.form.cartCode || '').trim();
				if (!lotId && !cartCode) {
					uni.showToast({
						title: _this.$t('sanyan.lotQueryNeedTip'),
						icon: 'none'
					});
					return;
				}
				_this.detail = null;
				_this.queried = true;
				_this.fetchDetail({
					lotId: lotId,
					cartCode: cartCode
				});
			},
			// 拉取批次详情：lotId / cartCode 均为可选查询条件，有值就带上
			fetchDetail: function(payload) {
				const _this = this;
				if (_this.detailLoading) return;
				_this.detailLoading = true;
				vegetablePacking.queryLotDetail(payload).then(function(res) {
					_this.detailLoading = false;
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
					_this.detailLoading = false;
					_this.detail = null;
					uni.showToast({
						title: _this.$t('sanyan.netError'),
						icon: 'none'
					});
				});
			},

			// ========== 装载目标台车 ==========

			// 装载目标台车回车确认：延迟 200ms 再取值后查询
			onTargetCartConfirm: function() {
				const _this = this;
				setTimeout(function() {
					_this.form.targetCartCode = (_this.form.targetCartCode || '').trim();
					_this.onCartQuery();
				}, 200);
			},
			// 扫码装载目标台车：回填后直接查询
			onTargetCartScan: function() {
				const _this = this;
				scanCode().then(function(code) {
					_this.form.targetCartCode = code;
					_this.onCartQuery();
				}).catch(function(err) {
					showBeautyToast({
						title: err || _this.$t('sanyan.scanFail'),
						icon: 'none'
					});
				});
			},
			// 查询装载目标台车自身信息
			onCartQuery: function() {
				const _this = this;
				const cartCode = (_this.form.targetCartCode || '').trim();
				if (!cartCode) {
					uni.showToast({
						title: _this.$t('sanyan.noTargetTrolleyTip'),
						icon: 'none'
					});
					return;
				}
				_this.cartDetail = null;
				_this.cartQueried = true;
				_this.fetchCartDetail(cartCode);
			},
			// 拉取装载目标台车自身信息
			fetchCartDetail: function(cartCode) {
				const _this = this;
				if (_this.cartLoading) return;
				_this.cartLoading = true;
				vegetablePacking.getByCartCode(cartCode).then(function(res) {
					_this.cartLoading = false;
					if (res.code == 200 && res.data) {
						_this.cartDetail = res.data;
					} else {
						_this.cartDetail = null;
						uni.showToast({
							title: res.msg || _this.$t('sanyan.fail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.cartLoading = false;
					_this.cartDetail = null;
					uni.showToast({
						title: _this.$t('sanyan.netError'),
						icon: 'none'
					});
				});
			},
			// 是否装载：1 已装载 / -1 未装载
			loadFlagText: function(loadFlag) {
				if (loadFlag == 1) return this.$t('sanyan.loadFlagYes');
				if (loadFlag == -1) return this.$t('sanyan.loadFlagNo');
				return '--';
			},
			// 锁定标记：CLEANING 清洗中 / REPAIR 维修 / CLEAN END 清洗结束 / REPAIR END 维修结束
			lockFlagText: function(lockFlag) {
				if (!lockFlag) return this.$t('sanyan.lockFlagNone');
				const map = {
					'CLEANING': 'sanyan.lockFlagCleaning',
					'REPAIR': 'sanyan.lockFlagRepair',
					'CLEAN END': 'sanyan.lockFlagCleanEnd',
					'REPAIR END': 'sanyan.lockFlagRepairEnd'
				};
				return map[lockFlag] ? this.$t(map[lockFlag]) : lockFlag;
			},

			// ========== 底部按钮 ==========

			// 初始化：清空查询条件与详情，回到初始状态并聚焦 LOT Id，便于下一次扫码
			onInit: function() {
				this.form = {
					lotId: '',
					cartCode: '',
					targetCartCode: ''
				};
				this.detail = null;
				this.cartDetail = null;
				this.queried = false;
				this.cartQueried = false;
				this.focusLotInput();
			},
			// LOT 变更：需已查到批次详情（lotId）与目标台车信息，二次确认后提交
			onChange: function() {
				const _this = this;
				if (_this.changing) return;
				if (!_this.detail || !_this.detail.lotId) {
					uni.showToast({
						title: _this.$t('sanyan.noLotDetailTip'),
						icon: 'none'
					});
					return;
				}
				const inputCode = (_this.form.targetCartCode || '').trim();
				if (!inputCode) {
					uni.showToast({
						title: _this.$t('sanyan.noTargetTrolleyTip'),
						icon: 'none'
					});
					return;
				}
				// 输入框内容与已查到的台车信息不一致（改过但未回车/扫码），先重新查询，避免用旧信息变更
				if (!_this.cartDetail || _this.cartDetail.cartCode !== inputCode) {
					_this.onCartQuery();
					return;
				}
				// 二次确认，避免误触直接变更
				uni.showModal({
					title: _this.$t('common.confirm'),
					content: _this.$t('sanyan.changeConfirmTip'),
					success: function(modalRes) {
						if (!modalRes.confirm) return;
						_this.submitChange();
					}
				});
			},
			// 提交 LOT 变更：成功后直接调用初始化方法，清空条件与详情便于下一次扫码
			submitChange: function() {
				const _this = this;
				if (_this.changing) return;
				_this.changing = true;
				vegetablePacking.cartLotChange({
					cartCode: _this.cartDetail.cartCode,
					lotId: _this.detail.lotId
				}).then(function(res) {
					_this.changing = false;
					if (res.code == 200) {
						uni.showToast({
							title: _this.$t('sanyan.changeSuccess'),
							icon: 'success'
						});
						_this.onInit();
					} else {
						uni.showToast({
							title: res.msg || _this.$t('sanyan.changeFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.changing = false;
					uni.showToast({
						title: _this.$t('sanyan.changeFail'),
						icon: 'none'
					});
				});
			},
			// 重新聚焦 LOT Id 输入框（focus 需先从 true 变 false 再变 true 才会重新生效）
			focusLotInput: function() {
				const _this = this;
				_this.lotInputFocus = false;
				_this.$nextTick(function() {
					_this.lotInputFocus = true;
				});
			}
		}
	}
</script>

<style lang="less" scoped>
	.lot-change-page {
		min-height: 100vh;
		box-sizing: border-box;
		padding-bottom: 180rpx;
		background: #f5f7fa;
	}

	/* 区块卡片 */
	.section-card {
		margin: 20rpx 24rpx 0;
		padding: 0 24rpx 16rpx;
		background: #fff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

		.card-title {
			display: flex;
			align-items: center;
			gap: 12rpx;
			padding: 24rpx 0 8rpx;
			font-size: 28rpx;
			font-weight: bold;
			color: #303133;

			.title-bar {
				width: 8rpx;
				height: 28rpx;
				border-radius: 4rpx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			}
		}

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

		.detail-value {
			font-size: 28rpx;
			color: #303133;
			word-break: break-all;
			line-height: 1.4;
		}

		.empty-state {
			padding: 60rpx 30rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 26rpx;
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
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
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
			color: #666;
			font-size: 30rpx;
			background: #f0f0f0;

			&::after {
				border: none;
			}

			&.primary {
				color: #fff;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
			}

			.loading-icon {
				animation: spin 1s linear infinite;
			}

			&.disabled {
				opacity: 0.5;
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
