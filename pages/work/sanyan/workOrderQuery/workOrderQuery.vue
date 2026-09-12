<template>
	<view class="work-query-page">
		<!-- 1. 查询条件 -->
		<view class="query-card">
			<uv-form :model="form" :border-bottom="false" :label-width="110" label-position="left">
				<uv-form-item :label="$t('sanyan.dateLabel')">
					<view class="date-select" @click="openCalendar">
						<text :class="form.startTime ? 'value' : 'placeholder'">
							{{ form.startTime || $t('sanyan.datePlaceholder') }}
						</text>
						<uv-icon name="calendar" size="16" color="#c0c4cc"></uv-icon>
					</view>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.lineLabel')">
					<view class="input-row">
						<uv-input v-model="form.lineName" :placeholder="$t('sanyan.linePlaceholder')" :clearable="true"
							confirm-type="search" custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onLineNameConfirm" />
						<view class="scan-btn" @click="onScan('lineName')">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
				<uv-form-item :label="$t('sanyan.productLabel')">
					<view class="input-row">
						<uv-input v-model="form.productName" :placeholder="$t('sanyan.productPlaceholder')" :clearable="true"
							confirm-type="search" custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onProductNameConfirm" />
						<view class="scan-btn" @click="onScan('productName')">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
		</view>

		<!-- 2. 工单（作业指示）列表 -->
		<view class="list-card">
			<template v-if="rows.length">
				<!-- 表头与表体：横向滚动查看完整列 -->
				<scroll-view scroll-x class="table-hscroll">
					<view class="table-hinner">
						<view class="table-row table-header">
							<view class="table-cell" style="flex: 1.5;">{{$t('sanyan.worksheetCodea')}}</view>
							<view class="table-cell" style="flex: 1;">{{$t('sanyan.lineCode')}}</view>
							<view class="table-cell" style="flex: 1.2;">{{$t('sanyan.lineName')}}</view>
							<view class="table-cell" style="flex: 1.6;">{{$t('sanyan.productName')}}</view>
							<view class="table-cell" style="flex: 1;">{{$t('sanyan.productCode')}}</view>
							<view class="table-cell" style="flex: 1.1;">{{$t('sanyan.planDateStart')}}</view>
							<view class="table-cell" style="flex: 1.3;">{{$t('sanyan.workSheetCode')}}</view>
							<view class="table-cell" style="flex: 1;">{{$t('sanyan.indicateBatch')}}</view>
						</view>
						<scroll-view scroll-y class="table-body">
							<view class="table-row" v-for="(row, index) in rows" :key="row.id || index">
								<view class="table-cell" style="flex: 1.5;">{{row.workSheetCode || '--'}}</view>
								<view class="table-cell" style="flex: 1;">{{row.lineCode || '--'}}</view>
								<view class="table-cell" style="flex: 1.2;">{{row.lineName || '--'}}</view>
								<view class="table-cell" style="flex: 1.6;">{{row.productName || '--'}}</view>
								<view class="table-cell" style="flex: 1;">{{row.productCode || '--'}}</view>
								<view class="table-cell" style="flex: 1.1;">{{row.planDateStart || '--'}}</view>
								<view class="table-cell" style="flex: 1.3;">{{row.workSheetCode || '--'}}</view>
								<view class="table-cell highlight" style="flex: 1;">{{row.indicateBatch != null ? row.indicateBatch : '--'}}</view>
							</view>
							<view class="list-tip" v-if="loading">{{$t('sanyan.loading')}}</view>
						</scroll-view>
					</view>
				</scroll-view>
				<!-- 上一页 / 页码输入跳转 / 下一页 -->
				<view class="pager-bar">
					<view class="pager-btn" :class="{ disabled: loading || page.pageNum <= 1 }" @click="onPrevPage">
						{{$t('sanyan.prevPage')}}
					</view>
					<view class="pager-info">
						<input class="pager-input" type="number" v-model="jumpNum" @confirm="onJumpPage" />
						<text class="pager-num">/ {{ pageCount }}</text>
						<text v-if="total > 0" class="pager-total">{{$t('sanyan.totalLabel')}}{{ total }}</text>
					</view>
					<view class="pager-btn" :class="{ disabled: loading || !hasNextPage() }" @click="onNextPage">
						{{$t('sanyan.nextPage')}}
					</view>
				</view>
			</template>
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

		<!-- 日期选择 -->
		<uv-datetime-picker ref="datePicker" mode="date" :value="pickerValue" @confirm="onDateConfirm"></uv-datetime-picker>
	</view>
</template>

<script>
	import workOrderQuery from '/api/sanyang/workOrderQuery.js';
	import scanCode from '/common/scan.js';
	import showBeautyToast from '@/common/beautyToast.js';

	export default {
		data() {
			return {
				// 查询条件（uv-form 展示字段）
				form: {
					startTime: '', // 作业指示日期
					lineName: '', // 线别
					productName: '' // 品号
				},
				// 分页信息（不在表单中显示）
				page: {
					pageNum: 1,
					pageSize: 10
				},
				total: 0, // 总条数
				pageCount: 1, // 总页数
				jumpNum: '1', // 页码输入框（跳页输入）
				pickerValue: Date.now(), // 日期选择器当前值（时间戳）
				rows: [],
				loading: false, // 查询中
				queried: false // 是否已发起过查询
			}
		},
		// 页面进入后自动执行一次查询
		onLoad: function() {
			this.onQuery();
		},
		watch: {
			// 页码变化时同步输入框内容（上一页/下一页/回退等场景）
			'page.pageNum': function(n) {
				this.jumpNum = String(n);
			}
		},
		methods: {
			// 打开日期选择器
			openCalendar: function() {
				this.$refs.datePicker.open();
			},
			// 日期选择确认，格式化为 YYYY-MM-DD
			onDateConfirm: function(e) {
				console.log('onDateConfirm', e);
				if (e && e.value) {
					const d = new Date(e.value);
					const y = d.getFullYear();
					const m = ('0' + (d.getMonth() + 1)).slice(-2);
					const day = ('0' + d.getDate()).slice(-2);
					this.pickerValue = e.value;
					this.form.startTime = y + '-' + m + '-' + day;
				}
			},
			// 线别回车确认：扫码枪回车极快，延迟 200ms 再取值，避免拿到不完整数据
			onLineNameConfirm: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.form.lineName) {
						_this.onQuery();
					}
				}, 200);
			},
			// 品号回车确认：同上，延迟 200ms 再取值
			onProductNameConfirm: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.form.productName) {
						_this.onQuery();
					}
				}, 200);
			},
			// 扫码：field 为写入的字段名（lineName / productName）
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
			// 查询（重置后查询第一页）
			onQuery: function() {
				this.page.pageNum = 1;
				this.rows = [];
				this.total = 0;
				this.pageCount = 1;
				this.queried = true;
				this.fetchList();
			},
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
			// 页码输入回车跳转：页码限制在 1 ~ 总页数之间
			onJumpPage: function() {
				if (this.loading) return;
				let n = parseInt(this.jumpNum, 10);
				if (isNaN(n)) {
					this.jumpNum = String(this.page.pageNum);
					return;
				}
				if (n < 1) n = 1;
				if (n > this.pageCount) n = this.pageCount;
				this.jumpNum = String(n);
				if (n == this.page.pageNum) return;
				this.page.pageNum = n;
				this.fetchList();
			},
			// 拉取列表
			fetchList: function() {
				const _this = this;
				if (_this.loading) return;
				_this.loading = true;
				const params = {
					pageNum: _this.page.pageNum,
					pageSize: _this.page.pageSize
				};
				if (_this.form.startTime) params.startTime = _this.form.startTime;
				if (_this.form.lineName) params.lineName = _this.form.lineName.trim();
				if (_this.form.productName) params.productName = _this.form.productName.trim();
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
			// 重置：清空条件后重新查询
			onReset: function() {
				this.form = {
					startTime: '',
					lineName: '',
					productName: ''
				};
				this.onQuery();
			}
		}
	}
</script>

<style lang="less" scoped>
	.work-query-page {
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

		.date-select {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: 38px;
			box-sizing: border-box;
			padding: 0 20rpx;
			background: #f5f7fa;
			border: 2rpx solid #dcdfe6;
			border-radius: 12rpx;
			font-size: 28rpx;

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
	}

	/* 列表区 */
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

		/* 横向滚动容器：占满表头与表体可用高度 */
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
			padding: 18rpx 8rpx;
			border-bottom: 2rpx solid #f0f1f5;

			&.table-header {
				flex-shrink: 0;
				background: #f3f4f8;

				.table-cell {
					color: #667eea;
					font-weight: bold;
				}
			}

			&:last-child {
				border-bottom: none;
			}

			.table-cell {
				font-size: 22rpx;
				color: #333;
				padding: 0 4rpx;
				text-align: center;
				word-break: break-all;
				line-height: 1.4;

				&.highlight {
					font-weight: bold;
					color: #667eea;
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
			flex: 1;
			padding: 80rpx 30rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #999;
		}
	}

	/* 分页条 */
	.pager-bar {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 20rpx;
		border-top: 2rpx solid #f0f1f5;
		background: #fff;

		.pager-btn {
			width: 160rpx;
			height: 64rpx;
			line-height: 64rpx;
			text-align: center;
			font-size: 26rpx;
			color: #667eea;
			background: #f3f4f8;
			border-radius: 32rpx;

			&:active {
				background: #e9ecf4;
			}

			&.disabled {
				color: #c0c4cc;
				background: #f7f8fa;
			}
		}

		.pager-info {
			flex: 1;
			min-width: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;

			.pager-input {
				width: 96rpx;
				height: 56rpx;
				padding: 0 8rpx;
				text-align: center;
				font-size: 26rpx;
				font-weight: bold;
				color: #333;
				background: #f5f7fa;
				border: 2rpx solid #dcdfe6;
				border-radius: 8rpx;
			}

			.pager-num {
				font-size: 26rpx;
				font-weight: bold;
				color: #333;
			}

			.pager-total {
				font-size: 22rpx;
				color: #999;
			}
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
