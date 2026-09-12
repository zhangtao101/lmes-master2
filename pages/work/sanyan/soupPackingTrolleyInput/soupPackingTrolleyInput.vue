<template>
	<view class="spt-page">
		<!-- 1. 查询区域 -->
		<view class="query-card">
			<uv-form :model="form" :border-bottom="false" :label-width="110" label-position="left">
				<!-- 线别：不可输入，点击铅笔图标弹出子产线选择（工序编码固定 SCBZ） -->
				<uv-form-item :label="$t('sanyan.lineLabel')">
					<view class="ws-field">
						<uv-input class="ws-input" v-model="form.lineName" :readonly="true"
							:placeholder="$t('sanyan.linePlaceholder')" />
						<view class="ws-pick" @click="openSubLinePicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
				<!-- 作业指示号：不可输入，点击铅笔图标弹出工单选择 -->
				<uv-form-item :label="$t('sanyan.worksheetCodea')">
					<view class="ws-field">
						<uv-input class="ws-input" v-model="form.workSheetCode" :readonly="true"
							:placeholder="$t('sanyan.wsPlaceholder')" />
						<view class="ws-pick" @click="openWorksheetPicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
				<!-- 操作人编号：支持扫码枪回车确认与摄像头扫码，不参与查询，仅用于大车投入 -->
				<uv-form-item :label="$t('sanyan.operatorCodeLabel')">
					<view class="input-row">
						<uv-input v-model="form.operatorCode" :placeholder="$t('sanyan.operatorCodePlaceholder')"
							:clearable="true" confirm-type="search"
							custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onOperatorCodeConfirm" />
						<view class="scan-btn" @click="onScan('operatorCode')">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
				<!-- 大车编号：支持扫码枪回车确认与摄像头扫码，不参与查询，仅用于大车投入 -->
				<uv-form-item :label="$t('sanyan.cartCodeLabel')">
					<view class="input-row">
						<uv-input v-model="form.cartCode" :placeholder="$t('sanyan.cartCodePlaceholder')"
							:clearable="true" confirm-type="search" :focus="cartInputFocus"
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

		<!-- 2. 大车批次绑定记录列表（点击行单选）：表头与表体统一定宽，超出屏宽时横向滚动 -->
		<view class="list-card">
			<scroll-view scroll-x class="table-hscroll">
				<view class="table-hinner">
					<!-- 表头 -->
					<view class="table-row table-header">
						<view class="table-cell cell-no">{{$t('sanyan.noLabel')}}</view>
						<view class="table-cell cell-cart">{{$t('sanyan.cartCodeLabel')}}</view>
						<view class="table-cell cell-line">{{$t('sanyan.subLineNameLabel')}}</view>
						<view class="table-cell cell-pcode">{{$t('sanyan.productLabel')}}</view>
						<view class="table-cell cell-pname">{{$t('sanyan.productName')}}</view>
						<view class="table-cell cell-time">{{$t('sanyan.cartBindTimeLabel')}}</view>
						<view class="table-cell cell-state">{{$t('sanyan.stateLabel')}}</view>
					</view>
					<!-- 表体 -->
					<scroll-view scroll-y class="table-body">
						<template v-if="rows.length">
							<view class="table-row table-data" v-for="(row, index) in rows" :key="row.id || index"
								:class="{ selected: isSelected(row) }" @click="onRowClick(row)">
								<view class="table-cell cell-no">{{ index + 1 }}</view>
								<view class="table-cell cell-cart highlight">{{ row.cartCode || '--' }}</view>
								<view class="table-cell cell-line">{{ row.lineName || row.lineCode || '--' }}</view>
								<view class="table-cell cell-pcode">{{ row.productCode || '--' }}</view>
								<view class="table-cell cell-pname">{{ row.productName || '--' }}</view>
								<view class="table-cell cell-time">{{ row.cartBindWorkSheetTime || '--' }}</view>
								<view class="table-cell cell-state">{{ stateText(row.state) }}</view>
							</view>
							<view class="list-tip" v-if="loadingList">{{$t('sanyan.loading')}}</view>
						</template>
						<view class="empty-state" v-else>
							<text>
								{{ loadingList ? $t('sanyan.loading') : (queried ? $t('common.noData') : $t('sanyan.queryHint')) }}
							</text>
						</view>
					</scroll-view>
				</view>
			</scroll-view>
		</view>

		<!-- 3. 底部按钮 -->
		<view class="button-wrapper">
			<button class="action-btn" :class="{ disabled: loadingList }" @click="onQuery">
				{{$t('sanyan.query')}}
			</button>
			<button class="action-btn primary" :class="{ disabled: !canRemove }" @click="onRemove">
				<uni-icons v-if="submitting" type="spinner-cycle" size="18" class="loading-icon"></uni-icons>
				<text>{{$t('sanyan.removeBtn')}}</text>
			</button>
		</view>

		<!-- 子产线选择弹层（工序编码固定 SCBZ） -->
		<sub-line-query ref="subLinePicker" process-code="SCBZ" @select="onSubLineSelect"></sub-line-query>

		<!-- 工单选择弹层（线别名称仅展示，实际按子产线ID + 指示日期查询） -->
		<worksheet-query ref="worksheetPicker" :line-name="form.lineName" :line-id="form.lineId"
			@select="onWorksheetSelect"></worksheet-query>
	</view>
</template>

<script>
	import vegetablePacking from '/api/sanyang/vegetablePacking.js';
	import scanCode from '/common/scan.js';
	import showBeautyToast from '@/common/beautyToast.js';
	import SubLineQuery from '../utils/subLineQuery.vue';
	import WorksheetQuery from '../utils/worksheetQuery.vue';

	export default {
		name: 'soupPackingTrolleyInput',
		components: {
			SubLineQuery,
			WorksheetQuery
		},
		data() {
			return {
				form: {
					lineCode: '', // 子产线编码（线别选择结果，仅展示用）
					lineName: '', // 子产线名称（线别，仅展示）
					lineId: '', // 子产线ID（线别选择结果，传给工单选择弹层作查询条件）
					workSheetCode: '', // 作业指示号（查询条件，同时作为大车投入的工单号）
					operatorCode: '', // 操作人编号（不参与查询，仅用于大车投入）
					cartCode: '' // 大车编号（不参与查询，仅用于大车投入）
				},
				rows: [], // 大车批次绑定记录
				loadingList: false, // 列表加载中
				queried: false, // 是否已发起过查询
				selectedRow: null, // 当前选中的记录行（单选）
				submitting: false, // 大车投入移除提交中
				inputting: false, // 大车投入提交中
				cartInputFocus: false // 大车编号输入框聚焦标记（提交成功后重新聚焦，便于连续扫码）
			}
		},
		computed: {
			// 是否可执行移除：已选中某条记录且无请求进行中
			canRemove: function() {
				return this.selectedRow != null && !this.submitting;
			}
		},
		methods: {
			// ========== 线别（子产线）选择 ==========

			// 打开子产线选择弹层
			openSubLinePicker: function() {
				this.$refs.subLinePicker && this.$refs.subLinePicker.open();
			},
			// 子产线选择完成：写入线别展示值
			onSubLineSelect: function(row) {
				if (!row) return;
				const changed = this.form.lineId !== row.id;
				this.form.lineCode = row.subLineCode || '';
				this.form.lineName = row.subLineName || row.subLineCode || '';
				this.form.lineId = row.id;
				// 工单按线别过滤：线别确实变更时，原作业指示号已不属于当前线别，清空后重新选择
				if (changed) {
					this.form.workSheetCode = '';
					this.rows = [];
					this.selectedRow = null;
					this.queried = false;
				}
			},

			// ========== 作业指示选择 ==========

			// 打开工单选择弹层
			// 打开工单选择弹层：工单按线别过滤，需先选择线别
			openWorksheetPicker: function() {
				if (!this.form.lineId) {
					uni.showToast({
						title: this.$t('sanyan.selectLineFirstTip'),
						icon: 'none'
					});
					return;
				}
				this.$refs.worksheetPicker && this.$refs.worksheetPicker.open();
			},
			// 工单选择完成：切换工单后清空上一单的列表与选中，并直接按该工单查询
			onWorksheetSelect: function(row) {
				if (!row) return;
				this.form.workSheetCode = row.workSheetCode || '';
				this.rows = [];
				this.selectedRow = null;
				this.queried = false;
				// 选完作业指示号立即查询大车批次绑定记录
				this.onQuery();
			},

			// ========== 操作人编号 / 大车编号（不参与查询，仅用于大车投入） ==========

			// 扫码：field 为写入的字段名（operatorCode / cartCode），扫码完成即尝试提交
			onScan: function(field) {
				const _this = this;
				scanCode().then(function(code) {
					_this.form[field] = code;
					_this.onCartInput();
				}).catch(function(err) {
					showBeautyToast({
						title: err || _this.$t('sanyan.scanFail'),
						icon: 'none'
					});
				});
			},
			// 操作人编号回车确认：扫码枪回车极快，延迟 200ms 再取整，然后把焦点交给大车编号，便于连续扫码
			onOperatorCodeConfirm: function() {
				const _this = this;
				setTimeout(function() {
					_this.form.operatorCode = (_this.form.operatorCode || '').trim();
					// 回车后焦点转到大车编号输入框（大车编号已填时会随即提交，成功后仍聚焦在此）
					_this.focusCartInput();
					_this.onCartInput();
				}, 200);
			},
			// 大车编号回车确认：同上，去掉扫码枪带入的首尾空白后尝试提交
			onCartCodeConfirm: function() {
				const _this = this;
				setTimeout(function() {
					_this.form.cartCode = (_this.form.cartCode || '').trim();
					_this.onCartInput();
				}, 200);
			},

			// ========== 列表查询 ==========

			// 查询：必须已选作业指示（接口仅接收 workSheetCode）
			onQuery: function() {
				const _this = this;
				if (_this.loadingList) return;
				if (!_this.form.workSheetCode) {
					uni.showToast({
						title: _this.$t('sanyan.noWorksheetTip'),
						icon: 'none'
					});
					return;
				}
				_this.queried = true;
				_this.fetchList();
			},
			// 拉取该工单下大车批次绑定记录
			fetchList: function() {
				const _this = this;
				if (_this.loadingList) return;
				_this.loadingList = true;
				_this.rows = [];
				_this.selectedRow = null;
				vegetablePacking.getLoadingLotList(_this.form.workSheetCode).then(function(res) {
					_this.loadingList = false;
					if (res.code == 200) {
						// 接口约定返回数组，同时兼容 { list: [] } 结构
						const data = res.data;
						_this.rows = Array.isArray(data) ? data : ((data && data.list) || []);
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

			// ========== 列表选择 ==========

			// 点击行：单选
			onRowClick: function(row) {
				if (this.loadingList || this.submitting) return;
				this.selectedRow = row;
			},
			// 判断行是否选中（优先用业绩记录id，其次用大车编号）
			isSelected: function(row) {
				if (!this.selectedRow || !row) return false;
				if (this.selectedRow.id != null && row.id != null) {
					return this.selectedRow.id === row.id;
				}
				return this.selectedRow.cartCode != null &&
					this.selectedRow.cartCode === row.cartCode;
			},
			// 状态文本：1 待机 / 2 生产
			stateText: function(state) {
				if (state == 1) return this.$t('sanyan.stateWait');
				if (state == 2) return this.$t('sanyan.stateProc');
				return '--';
			},

			// ========== 大车投入（回车 / 扫码后自动触发） ==========

			// 投入：操作人编号 + 大车编号 + 作业指示号 三项齐全才提交；成功后清空大车编号并刷新列表
			onCartInput: function() {
				const _this = this;
				if (_this.inputting) return;
				// 编号未齐不提交，静默返回（回车与扫码都会触发本方法）
				if (!_this.form.operatorCode) return;
				if (!_this.form.cartCode) return;
				if (!_this.form.workSheetCode) {
					uni.showToast({
						title: _this.$t('sanyan.noWorksheetTip'),
						icon: 'none'
					});
					return;
				}
				_this.inputting = true;
				vegetablePacking.cartInput({
					cartCode: _this.form.cartCode,
					operatorCode: _this.form.operatorCode,
					workSheetCode: _this.form.workSheetCode
				}).then(function(res) {
					_this.inputting = false;
					if (res.code == 200) {
						uni.showToast({
							title: _this.$t('sanyan.cartInputSuccess'),
							icon: 'success'
						});
						// 清空大车编号 + 刷新列表，再把焦点交回大车编号，便于连续扫码投入
						_this.form.cartCode = '';
						_this.onQuery();
						_this.focusCartInput();
					} else {
						uni.showToast({
							title: res.msg || _this.$t('sanyan.cartInputFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.inputting = false;
					uni.showToast({
						title: _this.$t('sanyan.cartInputFail'),
						icon: 'none'
					});
				});
			},
			// 重新聚焦大车编号输入框（focus 需先从 true 变 false 再变 true 才会重新生效）
			focusCartInput: function() {
				const _this = this;
				_this.cartInputFocus = false;
				_this.$nextTick(function() {
					_this.cartInputFocus = true;
				});
			},

			// ========== 底部按钮 ==========

			// 移除：二次确认后按选中记录提交大车投入移除，成功后刷新列表
			onRemove: function() {
				const _this = this;
				if (!_this.canRemove) {
					uni.showToast({
						title: _this.$t('sanyan.noSelectRowTip'),
						icon: 'none'
					});
					return;
				}
				const row = _this.selectedRow;
				if (!row.cartCode) {
					uni.showToast({
						title: _this.$t('sanyan.removeFail'),
						icon: 'none'
					});
					return;
				}
				// 二次确认，避免误触直接移除
				uni.showModal({
					title: _this.$t('common.confirm'),
					content: _this.$t('sanyan.removeConfirmTip'),
					success: function(modalRes) {
						if (!modalRes.confirm) return;
						_this.submitRemove(row);
					}
				});
			},
			// 提交移除请求：按大车编号 + 工作业指示号调用接口
			submitRemove: function(row) {
				const _this = this;
				if (_this.submitting) return;
				_this.submitting = true;
				vegetablePacking.cartInputCancel({
					cartCode: row.cartCode,
					workSheetCode: row.workSheetCode || _this.form.workSheetCode
				}).then(function(res) {
					_this.submitting = false;
					if (res.code == 200) {
						uni.showToast({
							title: _this.$t('sanyan.removeSuccess'),
							icon: 'success'
						});
						_this.selectedRow = null;
						_this.fetchList();
					} else {
						uni.showToast({
							title: res.msg || _this.$t('sanyan.removeFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.submitting = false;
					uni.showToast({
						title: _this.$t('sanyan.removeFail'),
						icon: 'none'
					});
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.spt-page {
		height: 95vh;
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

	/* 大车批次绑定记录列表 */
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

		/* 横向滚动容器：占满列表区可用高度 */
		.table-hscroll {
			flex: 1;
			min-height: 0;
			width: 100%;
		}

		/* 表头 + 表体统一定宽，超出屏宽时左右滚动 */
		.table-hinner {
			display: flex;
			flex-direction: column;
			width: 100%;
			min-width: 1800rpx;
			height: 100%;
		}

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
				flex-shrink: 0;
				height: 100rpx;
				padding: 0 8rpx;
				border-bottom: 2rpx solid #f0f1f5;

				&.selected {
					background: rgba(102, 126, 234, 0.14);

					.table-cell {
						color: #667eea;
						font-weight: bold;
					}
				}
			}
		}

		.table-cell {
			font-size: 24rpx;
			color: #333;
			padding: 0 6rpx;
			text-align: center;
			word-break: break-all;
			line-height: 1.4;
			box-sizing: border-box;

			&.cell-no {
				flex: 0.8;
				color: #909399;
			}

			&.cell-cart {
				flex: 1.8;

				&.highlight {
					color: #667eea;
					font-weight: bold;
				}
			}

			&.cell-line {
				flex: 1.7;
			}

			&.cell-pcode {
				flex: 1.5;
			}

			&.cell-pname {
				flex: 2.6;
			}

			&.cell-time {
				flex: 2.2;
			}

			&.cell-state {
				flex: 1.2;
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
