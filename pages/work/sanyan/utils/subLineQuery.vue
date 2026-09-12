<template>
	<view class="slq-wrapper">
		<!-- 底部弹层 -->
		<uv-popup ref="slqPopup" mode="bottom" bgColor="#f5f7fa" :round="24" :closeOnClickOverlay="false"
			custom-style="height: 90vh; padding: 24rpx; box-sizing: border-box;">
			<view class="slq-body">
				<!-- 标题 -->
				<view class="slq-title">{{$t('sanyan.subLineTitle')}}</view>

				<!-- 子产线列表（点击行单选）：工序编码由父组件传入，不在页面上展示 -->
				<view class="slq-table">
					<!-- 表头 -->
					<view class="row row-head">
						<view class="cell cell-no">{{$t('sanyan.noLabel')}}</view>
						<view class="cell cell-code">{{$t('sanyan.subLineCodeLabel')}}</view>
						<view class="cell cell-name">{{$t('sanyan.subLineNameLabel')}}</view>
					</view>
					<!-- 表体 -->
					<scroll-view scroll-y class="table-body">
						<template v-if="rows.length">
							<view class="row row-data" v-for="(row, index) in rows" :key="row.id || index"
								:class="{ selected: isSelected(row) }" @click="onRowClick(row)">
								<view class="cell cell-no">{{ index + 1 }}</view>
								<view class="cell cell-code highlight">{{ row.subLineCode || '--' }}</view>
								<view class="cell cell-name">{{ row.subLineName || '--' }}</view>
							</view>
							<view class="row-tip" v-if="loading">{{$t('sanyan.loading')}}</view>
						</template>
						<view class="row-empty" v-else>
							<text>{{ loading ? $t('sanyan.loading') : (queried ? $t('common.noData') : $t('sanyan.queryHint')) }}</text>
						</view>
					</scroll-view>
				</view>

				<!-- 底部按钮 -->
				<view class="footer-bar">
					<view class="footer-btn" @click="onCancel">{{$t('sanyan.cancelBtn')}}</view>
					<view class="footer-btn primary" :class="{ disabled: !selectedRow || loading }" @click="onSelect">
						{{$t('sanyan.selectBtn')}}
					</view>
				</view>
			</view>
		</uv-popup>
	</view>
</template>

<script>
	import vegetablePacking from '/api/sanyang/vegetablePacking.js';

	export default {
		name: 'subLineQuery',
		props: {
			// 工序编码（由父组件传入，仅用于查询，不在页面上展示）
			processCode: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				rows: [],
				loading: false, // 查询中
				queried: false, // 是否已发起过查询
				selectedRow: null // 当前选中的子产线行（单选）
			}
		},
		methods: {
			// ========== 暴露给父组件调用 ==========

			// 打开弹层（每次打开清空上次选中，强制重新选择，并立即查询一次）
			open: function() {
				this.selectedRow = null;
				this.$refs.slqPopup && this.$refs.slqPopup.open('bottom');
				this.onQuery();
			},
			// 关闭弹层
			close: function() {
				this.$refs.slqPopup && this.$refs.slqPopup.close();
			},

			// ========== 查询 ==========

			// 查询（接口返回全量数组，无分页，每次直接重新拉取）
			onQuery: function() {
				this.rows = [];
				this.selectedRow = null;
				this.queried = true;
				this.fetchList();
			},

			// ========== 列表选择 ==========

			// 点击行：单选
			onRowClick: function(row) {
				if (this.loading) return;
				this.selectedRow = row;
			},
			// 判断行是否选中（优先用 id，其次用子产线编码）
			isSelected: function(row) {
				if (!this.selectedRow || !row) return false;
				if (this.selectedRow.id != null && row.id != null) {
					return this.selectedRow.id === row.id;
				}
				return this.selectedRow.subLineCode != null &&
					this.selectedRow.subLineCode === row.subLineCode;
			},

			// ========== 数据拉取 ==========

			// 拉取子产线列表（按工序编码查询）
			fetchList: function() {
				const _this = this;
				if (_this.loading) return;
				// 未传入工序编码时不发请求，避免无过滤条件拉到全量子产线
				if (!_this.processCode) {
					_this.rows = [];
					uni.showToast({
						title: _this.$t('sanyan.subLineNoProcess'),
						icon: 'none'
					});
					return;
				}
				_this.loading = true;
				vegetablePacking.searchByProcessCode(_this.processCode).then(function(res) {
					_this.loading = false;
					if (res.code == 200) {
						// 接口约定返回数组，同时兼容 { list: [] } 结构
						const data = res.data;
						_this.rows = Array.isArray(data) ? data : ((data && data.list) || []);
					} else {
						_this.rows = [];
						uni.showToast({
							title: res.msg || _this.$t('sanyan.fail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.loading = false;
					_this.rows = [];
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
	.slq-body {
		height: 100%;
		min-height: 0;
		display: flex;
		flex-direction: column;
		background: #f5f7fa;
		border-radius: 24rpx;
		overflow: hidden;
	}

	/* 标题 */
	.slq-title {
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

	/* 列表区 */
	.slq-table {
		flex: 1;
		min-height: 0;
		margin: 16rpx 20rpx 0;
		display: flex;
		flex-direction: column;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;

		.row {
			display: flex;
			align-items: center;

			&.row-head {
				flex-shrink: 0;
				height: 84rpx;
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

			&.cell-code {
				flex: 1.6;
				padding-right: 12rpx;

				&.highlight {
					color: #667eea;
					font-weight: bold;
				}
			}

			&.cell-name {
				flex: 1.6;
				padding-right: 12rpx;
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
