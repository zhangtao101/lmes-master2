<template>
	<view class="wiq-wrapper">
		<!-- 底部弹层 -->
		<uv-popup ref="wiqPopup" mode="bottom" bgColor="#f5f7fa" :round="24" :closeOnClickOverlay="false"
			custom-style="height: 90vh; padding: 24rpx; box-sizing: border-box;">
			<view class="wiq-body">
				<!-- 标题 -->
				<view class="wiq-title">{{$t('sanyan.wiqTitle')}}</view>

				<!-- 1. 查询条件 -->
				<view class="wiq-card">
					<uv-form :model="form" :border-bottom="false" :label-width="110" label-position="left">
						<uv-form-item :label="$t('sanyan.dateLabel')">
							<view class="range-select" @click="openCalendar">
								<text :class="rangeText ? 'value' : 'placeholder'">
									{{ rangeText || $t('sanyan.rangePlaceholder') }}
								</text>
								<uv-icon name="calendar" size="16" color="#c0c4cc"></uv-icon>
							</view>
						</uv-form-item>
						<uv-form-item :label="$t('sanyan.lineLabel')">
							<view class="input-row">
								<uv-input v-model="form.lineCode" :placeholder="$t('sanyan.lineCodePlaceholder')"
									:clearable="true" confirm-type="search"
									custom-style="flex: 1; height: 38px; box-sizing: border-box;"
									@confirm="onLineCodeConfirm" />
								<view class="scan-btn" @click="onScan('lineCode')">
									<uni-icons type="scan" color="#fff" size="16"></uni-icons>
									<text>{{$t('sanyan.scan')}}</text>
								</view>
							</view>
						</uv-form-item>
					</uv-form>
					<view class="wiq-actions">
						<view class="wiq-btn" @click="onReset">{{$t('common.reset')}}</view>
						<view class="wiq-btn primary" :class="{ disabled: loading }" @click="onQuery">
							{{$t('sanyan.query')}}
						</view>
					</view>
				</view>

				<!-- 2. 工单列表（点击行单选）：表头与表体统一定宽，超出屏宽时横向滚动 -->
				<view class="wiq-table">
					<scroll-view scroll-x class="table-hscroll">
						<view class="table-hinner">
							<!-- 表头 -->
							<view class="row row-head">
								<view class="cell cell-no">{{$t('sanyan.noLabel')}}</view>
								<view class="cell cell-date">{{$t('sanyan.planDateStart')}}</view>
								<view class="cell cell-code">{{$t('sanyan.worksheetCodea')}}</view>
								<view class="cell cell-qty">{{$t('sanyan.indicateBatch')}}</view>
								<view class="cell cell-line">{{$t('sanyan.lineLabel')}}</view>
								<view class="cell cell-pcode">{{$t('sanyan.productLabel')}}</view>
								<view class="cell cell-pname">{{$t('sanyan.productName')}}</view>
							</view>
							<!-- 表体 -->
							<scroll-view scroll-y class="table-body">
								<template v-if="rows.length">
									<view class="row row-data" v-for="(row, index) in rows" :key="row.id || index"
										:class="{ selected: isSelected(row) }" @click="onRowClick(row)">
										<view class="cell cell-no">{{ (page.pageNum - 1) * page.pageSize + index + 1 }}</view>
										<view class="cell cell-date">{{ row.planDateStart || '--' }}</view>
										<view class="cell cell-code">{{ row.workSheetCode || '--' }}</view>
										<view class="cell cell-qty highlight">{{ row.indicateBatch != null ? row.indicateBatch : '--' }}</view>
										<view class="cell cell-line">{{ row.lineName || '--' }}</view>
										<view class="cell cell-pcode">{{ row.productCode || '--' }}</view>
										<view class="cell cell-pname">{{ row.productName || '--' }}</view>
									</view>
									<view class="row-tip" v-if="loading">{{$t('sanyan.loading')}}</view>
								</template>
								<view class="row-empty" v-else>
									<text>{{ loading ? $t('sanyan.loading') : (queried ? $t('common.noData') : $t('sanyan.queryHint')) }}</text>
								</view>
							</scroll-view>
						</view>
					</scroll-view>
				</view>

				<!-- 3. 分页 -->
				<view class="pager-bar" v-if="rows.length">
					<view class="pager-btn" :class="{ disabled: loading || page.pageNum <= 1 }" @click="onPrevPage">
						{{$t('sanyan.prevPage')}}
					</view>
					<view class="pager-info">
						<text class="pager-num">{{ page.pageNum }} / {{ pageCount }}</text>
						<text v-if="total > 0" class="pager-total">{{$t('sanyan.totalLabel')}}{{ total }}</text>
					</view>
					<view class="pager-btn" :class="{ disabled: loading || !hasNextPage() }" @click="onNextPage">
						{{$t('sanyan.nextPage')}}
					</view>
				</view>

				<!-- 4. 底部按钮 -->
				<view class="footer-bar">
					<view class="footer-btn" @click="onCancel">{{$t('sanyan.cancelBtn')}}</view>
					<view class="footer-btn primary" :class="{ disabled: !selectedRow || loading }" @click="onSelect">
						{{$t('sanyan.selectBtn')}}
					</view>
				</view>
			</view>
		</uv-popup>

		<!-- 日期范围选择日历 -->
		<uv-calendars ref="rangeCalendar" mode="range" :startText="$t('sanyan.calendarStart')"
			:endText="$t('sanyan.calendarEnd')" color="#667eea" confirmColor="#667eea" :round="24"
			:date="calendarDate" @confirm="onRangeConfirm"></uv-calendars>
	</view>
</template>

<script>
	import workOrderQuery from '/api/sanyang/workOrderQuery.js';
	import scanCode from '/common/scan.js';
	import showBeautyToast from '@/common/beautyToast.js';

	export default {
		name: 'workInstructionQuery',
		props: {
			// 作业流程类型（不同父页面按各自作业流程传入唯一值，用于过滤作业指示）
			processType: {
				type: Number,
				default: 1
			}
		},
		data() {
			return {
				// 查询条件
				form: {
					timeRange: [], // 日期范围（YYYY-MM-DD 数组）
					lineCode: '' // 线别（产线代码）
				},
				// 分页信息
				page: {
					pageNum: 1,
					pageSize: 10
				},
				total: 0, // 总条数
				pageCount: 1, // 总页数
				rows: [],
				loading: false, // 查询中
				queried: false, // 是否已发起过查询
				selectedRow: null // 当前选中的工单行（单选）
			}
		},
		computed: {
			// 传给日历的默认选中范围（uv-calendars range 模式要求数组必须含起止两天，空数组会触发内部异常）
			calendarDate: function() {
				if (this.form.timeRange && this.form.timeRange.length === 2) {
					return this.form.timeRange;
				}
				return '';
			},
			// 日期范围展示文本
			rangeText: function() {
				if (this.form.timeRange && this.form.timeRange.length === 2) {
					return this.form.timeRange[0] + ' ~ ' + this.form.timeRange[1];
				}
				return '';
			}
		},
		methods: {
			// ========== 暴露给父组件调用 ==========

			// 打开弹层（每次打开清空上次选中，强制重新选择，并立即查询一次）
			open: function() {
				this.selectedRow = null;
				this.$refs.wiqPopup && this.$refs.wiqPopup.open('bottom');
				this.onQuery();
			},
			// 关闭弹层
			close: function() {
				this.$refs.wiqPopup && this.$refs.wiqPopup.close();
			},

			// ========== 查询条件 ==========

			// 打开日历选择日期范围
			openCalendar: function() {
				this.$refs.rangeCalendar && this.$refs.rangeCalendar.open();
			},
			// 日历确定，写入时间范围数组（uv-calendars 回参为对象，取 range.data 首尾两天）
			onRangeConfirm: function(e) {
				const range = e && e.range;
				const data = range && range.data;
				if (data && data.length) {
					this.form.timeRange = [data[0], data[data.length - 1]];
				} else {
					this.form.timeRange = [];
				}
			},
			// 线别回车确认：扫码枪回车极快，延迟 200ms 再取值，避免拿到不完整数据
			onLineCodeConfirm: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.form.lineCode) {
						_this.onQuery();
					}
				}, 200);
			},
			// 扫码：扫码结果回填线别后直接查询
			onScan: function() {
				const _this = this;
				scanCode().then(function(code) {
					_this.form.lineCode = code;
					_this.onQuery();
				}).catch(function(err) {
					showBeautyToast({
						title: err || _this.$t('sanyan.scanFail'),
						icon: 'none'
					});
				});
			},
			// 查询（重置后查询第一页）
			onQuery: function() {
				this.page.pageNum = 1;
				this.rows = [];
				this.total = 0;
				this.pageCount = 1;
				this.selectedRow = null;
				this.queried = true;
				this.fetchList();
			},
			// 重置查询条件
			onReset: function() {
				this.form = {
					timeRange: [],
					lineCode: ''
				};
				this.page.pageNum = 1;
				this.rows = [];
				this.total = 0;
				this.pageCount = 1;
				this.selectedRow = null;
				this.loading = false;
				this.queried = false;
			},

			// ========== 列表选择 ==========

			// 点击行：单选
			onRowClick: function(row) {
				if (this.loading) return;
				this.selectedRow = row;
			},
			// 判断行是否选中（优先用 id，其次用作业指示号）
			isSelected: function(row) {
				if (!this.selectedRow || !row) return false;
				if (this.selectedRow.id != null && row.id != null) {
					return this.selectedRow.id === row.id;
				}
				return this.selectedRow.workSheetCode != null &&
					this.selectedRow.workSheetCode === row.workSheetCode;
			},

			// ========== 分页 ==========

			// 上一页
			onPrevPage: function() {
				if (this.loading || this.page.pageNum <= 1) return;
				this.page.pageNum--;
				this.fetchList();
			},
			// 下一页
			onNextPage: function() {
				if (this.loading || !this.hasNextPage()) return;
				this.page.pageNum++;
				this.fetchList();
			},
			// 是否还有下一页
			hasNextPage: function() {
				return this.page.pageNum < this.pageCount;
			},

			// ========== 数据拉取 ==========

			// 拉取工单列表
			fetchList: function() {
				const _this = this;
				if (_this.loading) return;
				_this.loading = true;
				const params = {
					pageNum: _this.page.pageNum,
					pageSize: _this.page.pageSize,
					processType: _this.processType || undefined
				};
				// timeRange 数组格式化为 startTime / endTime
				if (_this.form.timeRange && _this.form.timeRange.length === 2) {
					params.startTime = _this.form.timeRange[0];
					params.endTime = _this.form.timeRange[1];
				}
				if (_this.form.lineCode) params.lineName = _this.form.lineCode.trim();
				workOrderQuery.selectByBom(params).then(function(res) {
					_this.loading = false;
					if (res.code == 200) {
						const data = res.data || {};
						const list = data.list || [];
						_this.rows = list;
						_this.total = data.total || list.length;
						// 总页数优先取后端 pages，缺失时按总数计算兜底
						const dataPages = Number(data.pages);
						if (dataPages > 0) {
							_this.pageCount = dataPages;
						} else if (_this.total > 0) {
							_this.pageCount = Math.max(1, Math.ceil(_this.total / _this.page.pageSize));
						} else {
							_this.pageCount = list.length >= _this.page.pageSize ? 2 : 1;
						}
						// 末页可能返回空列表，回退页码防止越界
						if (!list.length && _this.page.pageNum > 1) {
							_this.page.pageNum--;
						}
					} else {
						if (_this.page.pageNum > 1) _this.page.pageNum--;
						uni.showToast({
							title: res.msg || _this.$t('sanyan.fail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.loading = false;
					if (_this.page.pageNum > 1) _this.page.pageNum--;
					uni.showToast({
						title: _this.$t('sanyan.netError'),
						icon: 'none'
					});
				});
			},

			// ========== 底部按钮 ==========

			// 选择：回传选中行给父组件
			onSelect: function() {
				if (!this.selectedRow || this.loading) return;
				const row = this.selectedRow;
				this.close();
				this.$emit('select', row);
			},
			// 取消：通知父组件并关闭
			onCancel: function() {
				this.close();
				this.$emit('cancel');
			}
		}
	}
</script>

<style lang="scss" scoped>
	.wiq-body {
		height: 100%;
		min-height: 0;
		display: flex;
		flex-direction: column;
		background: #f5f7fa;
		border-radius: 24rpx;
		overflow: hidden;
	}

	/* 标题 */
	.wiq-title {
		flex-shrink: 0;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		font-size: 32rpx;
		font-weight: 600;
		color: #303133;
	}

	/* 查询区 */
	.wiq-card {
		flex-shrink: 0;
		margin: 16rpx 20rpx 0;
		padding: 8rpx 20rpx 20rpx;
		background: #fff;
		border-radius: 16rpx;

		.range-select {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 38px;
			box-sizing: border-box;
			padding: 0 20rpx;
			background: #f5f7fa;
			border: 2rpx solid #dcdfe6;
			border-radius: 12rpx;
			font-size: 26rpx;

			.value {
				color: #303133;
			}

			.placeholder {
				color: #c0c4cc;
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

		.wiq-actions {
			display: flex;
			gap: 20rpx;
			margin-top: 20rpx;

			.wiq-btn {
				flex: 1;
				height: 72rpx;
				line-height: 72rpx;
				text-align: center;
				font-size: 28rpx;
				color: #999;
				background: #f0f0f0;
				border-radius: 36rpx;

				&.primary {
					color: #fff;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
				}

				&.disabled {
					opacity: 0.5;
				}
			}
		}
	}

	/* 列表区 */
	.wiq-table {
		flex: 1;
		min-height: 0;
		margin: 16rpx 20rpx 0;
		display: flex;
		flex-direction: column;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;

		/* 横向滚动容器：占满弹层内可用高度 */
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
			min-width: 1600rpx;
			height: 100%;
		}

		.row {
			display: flex;
			align-items: center;

			&.row-head {
				flex-shrink: 0;
				background: #f3f4f8;

				.cell {
					color: #667eea;
					font-weight: bold;
				}
			}

			&.row-data {
				flex-shrink: 0;
				height: 92rpx;
				padding: 0 8rpx;
				border-bottom: 2rpx solid #f0f1f5;

				&.selected {
					background: rgba(102, 126, 234, 0.14);

					.cell {
						color: #667eea;
						font-weight: bold;
					}
				}
			}
		}

		.table-body {
			flex: 1;
			min-height: 0;
		}

		.cell {
			font-size: 24rpx;
			color: #333;
			padding: 0 6rpx;
			text-align: center;
			word-break: break-all;
			line-height: 1.4;

			&.cell-no {
				flex: 0.8;
				color: #909399;
			}

			&.cell-date {
				flex: 1.7;
			}

			&.cell-code {
				flex: 2.2;
			}

			&.cell-qty {
				flex: 1.2;

				&.highlight {
					color: #667eea;
					font-weight: bold;
				}
			}

			&.cell-line {
				flex: 1.4;
			}

			&.cell-pcode {
				flex: 1.2;
			}

			&.cell-pname {
				flex: 1.7;
			}
		}

		.row-tip {
			padding: 20rpx 0;
			text-align: center;
			font-size: 24rpx;
			color: #999;
		}

		.row-empty {
			padding: 60rpx 30rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 26rpx;
			color: #999;
		}
	}

	/* 分页条 */
	.pager-bar {
		flex-shrink: 0;
		margin: 16rpx 20rpx 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12rpx 16rpx;
		background: #fff;
		border-radius: 16rpx;

		.pager-btn {
			width: 140rpx;
			height: 56rpx;
			line-height: 56rpx;
			text-align: center;
			font-size: 24rpx;
			color: #667eea;
			background: #f3f4f8;
			border-radius: 28rpx;

			&.disabled {
				color: #c0c4cc;
				background: #f7f8fa;
			}
		}

		.pager-info {
			display: flex;
			align-items: baseline;
			gap: 10rpx;

			.pager-num {
				font-size: 26rpx;
				font-weight: bold;
				color: #333;
			}

			.pager-total {
				font-size: 20rpx;
				color: #999;
			}
		}
	}

	/* 底部按钮 */
	.footer-bar {
		flex-shrink: 0;
		display: flex;
		gap: 20rpx;
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));

		.footer-btn {
			flex: 1;
			height: 88rpx;
			line-height: 88rpx;
			text-align: center;
			font-size: 30rpx;
			color: #666;
			background: #fff;
			border-radius: 44rpx;
			border: 2rpx solid #dcdfe6;
			box-sizing: border-box;

			&.primary {
				color: #fff;
				border: none;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
			}

			&.disabled {
				opacity: 0.5;
			}
		}
	}
</style>
