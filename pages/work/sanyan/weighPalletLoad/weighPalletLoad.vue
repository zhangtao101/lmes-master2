<template>
	<view class="weigh-page">
		<!-- 1. 查询区域 -->
		<view class="query-card">
			<uv-form :model="form" :border-bottom="false" :label-width="110" label-position="left">
				<!-- 作业指示编号：不可输入，点击铅笔图标弹出工单选择 -->
				<uv-form-item :label="$t('sanyan.worksheetCodea')">
					<view class="ws-field">
						<uv-input class="ws-input" v-model="form.workSheetCode" :readonly="true"
							:placeholder="$t('sanyan.wsPlaceholder')" />
						<view class="ws-pick" @click="openWorksheetPicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
				<!-- PALLET NO：扫码枪/手动输入回车后自动匹配勾选 -->
				<uv-form-item :label="$t('sanyan.palletNo')">
					<view class="input-row">
						<uv-input v-model="form.palletLabel" :placeholder="$t('sanyan.palletPlaceholder')"
							:clearable="true" confirm-type="search"
							custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onPalletConfirm" />
						<view class="scan-btn" @click="onPalletScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
		</view>

		<!-- 2. 批次列表 -->
		<view class="list-card">
			<view class="table-row table-header">
				<view class="table-cell cell-check">{{$t('sanyan.scanState')}}</view>
				<view class="table-cell cell-lot">{{$t('sanyan.batchLotNo')}}</view>
				<view class="table-cell cell-pallet">{{$t('sanyan.palletNo')}}</view>
			</view>
			<scroll-view scroll-y class="table-body">
				<template v-if="rows.length">
					<view class="table-row table-data" v-for="row in rows" :key="row.id"
						:class="{ checked: checkedIds[row.id], loaded: row.fullUse == 1 }">
						<view class="table-cell cell-check">
							<uv-icon v-if="checkedIds[row.id]" name="checkmark-circle-fill" size="20" color="#667eea"></uv-icon>
							<uv-icon v-else name="checkmark-circle" size="20" color="#dcdfe6"></uv-icon>
						</view>
						<view class="table-cell cell-lot">{{row.lotCode || '--'}}</view>
						<view class="table-cell cell-pallet highlight">{{row.fullLabel || '--'}}</view>
					</view>
					<view class="list-tip" v-if="loadingList">{{$t('sanyan.loading')}}</view>
				</template>
				<view class="empty-state" v-else>
					<text>
						{{ loadingList ? $t('sanyan.loading') : (form.workSheetCode ? $t('common.noData') : $t('sanyan.wsPlaceholder')) }}
					</text>
				</view>
			</scroll-view>
		</view>

		<!-- 3. 底部按钮 -->
		<view class="button-wrapper">
			<button class="action-btn" :class="{ disabled: submitting }" @click="onInitialize">
				{{$t('sanyan.init')}}
			</button>
			<button class="action-btn primary" :class="{ disabled: !canLoad }" @click="onLoad">
				<uni-icons v-if="submitting" type="spinner-cycle" size="18" class="loading-icon"></uni-icons>
				<text>{{$t('sanyan.loadBtn')}}</text>
			</button>
		</view>

		<!-- 作业指示选择弹层 -->
		<work-instruction-query ref="worksheetPicker" :process-type="1" @select="onWorksheetSelect"></work-instruction-query>
	</view>
</template>

<script>
	import weighPalletLoadApi from '/api/sanyang/weighPalletLoad.js';
	import WorkInstructionQuery from '../utils/workInstructionQuery.vue';
	import scanCode from '/common/scan.js';
	import showBeautyToast from '@/common/beautyToast.js';

	export default {
		name: 'weighPalletLoad',
		components: {
			WorkInstructionQuery
		},
		data() {
			return {
				form: {
					workSheetCode: '', // 作业指示编号（仅展示）
					palletLabel: '' // PALLET NO（扫码输入，装载用）
				},
				workSheetId: null, // 选中的工单ID（实际查询条件）
				rows: [], // 工单下批次列表
				checkedIds: {}, // 已勾选（扫描到PALLET）的批次，key为批次id
				loadingList: false, // 批次加载中
				submitting: false // 装载提交中
			}
		},
		computed: {
			// 是否可执行装载：有工单、且至少勾选了一行
			canLoad: function() {
				return this.workSheetId != null &&
					this.rows.length > 0 &&
					Object.keys(this.checkedIds).length > 0 &&
					!this.submitting;
			}
		},
		methods: {
			// ========== 作业指示选择 ==========

			// 打开工单选择弹层
			openWorksheetPicker: function() {
				this.$refs.worksheetPicker && this.$refs.worksheetPicker.open();
			},
			// 工单选择完成：赋值并加载该工单下所有批次
			onWorksheetSelect: function(row) {
				if (!row) return;
				const id = row.workSheetId != null ? row.workSheetId : row.id;
				if (id == null) return;
				this.workSheetId = id;
				this.form.workSheetCode = row.workSheetCode || '';
				this.form.palletLabel = '';
				this.checkedIds = {};
				this.fetchLots();
			},

			// ========== 批次列表 ==========

			// 拉取工单下的批次列表
			fetchLots: function() {
				const _this = this;
				if (_this.workSheetId == null) return;
				_this.loadingList = true;
				_this.rows = [];
				_this.checkedIds = {};
				weighPalletLoadApi.selectByWorkSheetId(_this.workSheetId).then(function(res) {
					_this.loadingList = false;
					if (res.code == 200) {
						_this.rows = Array.isArray(res.data) ? res.data : [];
					} else {
						uni.showToast({
							title: res.msg || _this.$t('sanyan.fail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.loadingList = false;
					uni.showToast({
						title: _this.$t('sanyan.netError'),
						icon: 'none'
					});
				});
			},

			// ========== PALLET NO 扫码匹配 ==========

			// PALLET NO 回车确认：扫码枪回车极快，延迟 200ms 再取值，避免拿到不完整数据
			onPalletConfirm: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.form.palletLabel) {
						_this.matchPallet();
					}
				}, 200);
			},

			// PALLET NO 扫码：扫码结果回填输入框后直接执行匹配勾选
			onPalletScan: function() {
				const _this = this;
				scanCode().then(function(code) {
					_this.form.palletLabel = code;
					_this.matchPallet();
				}).catch(function(err) {
					showBeautyToast({
						title: err || _this.$t('sanyan.scanFail'),
						icon: 'none'
					});
				});
			},

			// 扫码/输入托盘号回车：与表格 fullLabel 比对，命中自动勾选该行
			matchPallet: function() {
				const _this = this;
				const code = String(_this.form.palletLabel || '').trim();
				if (!code) return;
				if (_this.workSheetId == null) {
					_this.form.palletLabel = '';
					uni.showToast({
						title: _this.$t('sanyan.noWorksheetTip'),
						icon: 'none'
					});
					return;
				}
				if (!_this.rows.length) {
					_this.form.palletLabel = '';
					uni.showToast({
						title: _this.$t('common.noData'),
						icon: 'none'
					});
					return;
				}
				const target = _this.rows.find(function(r) {
					return r.fullLabel != null && r.fullLabel === code;
				});
				_this.form.palletLabel = '';
				if (!target) {
					uni.showToast({
						title: _this.$t('sanyan.noPalletMatch'),
						icon: 'none'
					});
					return;
				}
				// 该批次已装载过（fullUse=1），不允许再次勾选
				if (target.fullUse == 1) {
					uni.showToast({
						title: _this.$t('sanyan.alreadyLoaded'),
						icon: 'none'
					});
					return;
				}
				const next = Object.assign({}, _this.checkedIds);
				next[target.id] = true;
				_this.checkedIds = next;
			},

			// ========== 底部按钮 ==========

			// 初始化：清除本轮勾选与托盘输入；已选工单则重新拉取最新批次
			onInitialize: function() {
				if (this.submitting) return;
				this.form.palletLabel = '';
				this.checkedIds = {};
				if (this.workSheetId != null) {
					this.fetchLots();
				} else {
					this.form.workSheetCode = '';
					this.rows = [];
				}
			},
			// 装载：勾选的批次按接口格式提交
			onLoad: function() {
				const _this = this;
				if (!_this.canLoad) return;
				const items = _this.rows
					.filter(function(r) {
						return _this.checkedIds[r.id];
					})
					.map(function(r) {
						return {
							input: 1, // 1装载
							lotId: r.id,
							packType: 1, // 1纸袋（与 fullLabel 纸袋托盘对应）
							palletLabel: r.fullLabel
						};
					});
				if (!items.length) {
					uni.showToast({
						title: _this.$t('sanyan.noCheckedTip'),
						icon: 'none'
					});
					return;
				}
				_this.submitting = true;
				weighPalletLoadApi.loading(items).then(function(res) {
					_this.submitting = false;
					if (res.code == 200) {
						_this.checkedIds = {};
						_this.form.palletLabel = '';
						uni.showToast({
							title: _this.$t('sanyan.loadSuccess'),
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res.msg || _this.$t('sanyan.loadFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.submitting = false;
					uni.showToast({
						title: _this.$t('sanyan.loadFail'),
						icon: 'none'
					});
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.weigh-page {
		height: 100vh;
		box-sizing: border-box;
		padding-bottom: 180rpx;
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

		.ws-field {
			flex: 1;
			display: flex;
			align-items: center;

			.ws-input {
				flex: 1;
			}

			.ws-pick {
				flex-shrink: 0;
				margin-left: 12rpx;
				width: 64rpx;
				height: 64rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #f0f1fb;
				border-radius: 12rpx;
			}
		}
	}

	/* 批次列表 */
	.list-card {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		margin: 20rpx 24rpx 0;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

		.table-body {
			flex: 1;
			min-height: 0;
		}

		.table-row {
			display: flex;
			align-items: center;

			&.table-header {
				flex-shrink: 0;
				height: 84rpx;
				background: #f3f4f8;

				.table-cell {
					color: #667eea;
					font-weight: bold;
				}
			}

			&.table-data {
				height: 100rpx;
				flex-shrink: 0;
				padding: 0 8rpx;
				border-bottom: 2rpx solid #f0f1f5;
				transition: background 0.15s;

				&.checked {
					background: rgba(102, 126, 234, 0.14);
				}

				&.loaded {
					background: #dff2e2;
				}
			}
		}

		.table-cell {
			font-size: 26rpx;
			color: #333;
			padding: 0 6rpx;
			text-align: center;
			word-break: break-all;
			line-height: 1.4;
			box-sizing: border-box;

			&.cell-check {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			&.cell-lot {
				flex: 1.4;
			}

			&.cell-pallet {
				flex: 1.8;
				padding-right: 24rpx;

				&.highlight {
					color: #667eea;
					font-weight: bold;
				}
			}
		}

		.list-tip {
			padding: 20rpx 0;
			text-align: center;
			font-size: 24rpx;
			color: #999;
		}

		.empty-state {
			padding: 80rpx 30rpx;
			text-align: center;
			font-size: 26rpx;
			color: #999;
		}
	}

	/* 底部按钮 */
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

				.loading-icon {
					animation: spin 1s linear infinite;
				}
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
