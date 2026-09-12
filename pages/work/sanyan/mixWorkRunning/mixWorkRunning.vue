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
				<!-- 作业批次数：补录时按该数量生成批次 -->
				<uv-form-item :label="$t('sanyan.batch')">
					<uv-input v-model="form.batch" type="number" :placeholder="$t('sanyan.batchPlaceholder')"
						confirm-type="done" custom-style="height: 38px; box-sizing: border-box;" />
				</uv-form-item>
				<!-- 设备编号：不可输入，点击铅笔图标弹出设备选择 -->
				<uv-form-item :label="$t('sanyan.equipCodeLabel')">
					<view class="ws-field">
						<uv-input class="ws-input" v-model="form.equipCode" :readonly="true"
							:placeholder="$t('sanyan.equipPlaceholder')" />
						<view class="ws-pick" @click="openEquipmentPicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
			<!-- 补录按钮 -->
			<view class="form-actions">
				<button class="add-btn" :class="{ disabled: adding }" :disabled="adding" @click="onAdd">
					<uni-icons v-if="adding" type="spinner-cycle" size="18" class="loading-icon"></uni-icons>
					<text>{{$t('sanyan.addBtn')}}</text>
				</button>
			</view>
		</view>

		<!-- 2. 批次列表（手动勾选） -->
		<view class="list-card">
			<view class="table-row table-header">
				<view class="table-cell cell-check">{{$t('sanyan.selectBtn')}}</view>
				<view class="table-cell cell-lot">{{$t('sanyan.batchLotNo')}}</view>
				<view class="table-cell cell-pallet">{{$t('sanyan.palletNo')}}</view>
				<view class="table-cell cell-batch">{{$t('sanyan.batch')}}</view>
				<view class="table-cell cell-product">{{$t('sanyan.productName')}}</view>
			</view>
			<scroll-view scroll-y class="table-body">
				<template v-if="rows.length">
					<view class="table-row table-data" v-for="row in rows" :key="row.id"
						:class="{ checked: checkedIds[row.id], state2: row.state == 2, state3: row.state == 3 }"
						@click="toggleRow(row)">
						<view class="table-cell cell-check">
							<uv-icon v-if="checkedIds[row.id]" name="checkmark-circle-fill" size="20" color="#667eea"></uv-icon>
							<uv-icon v-else name="checkmark-circle" size="20" color="#dcdfe6"></uv-icon>
						</view>
						<view class="table-cell cell-lot">{{row.lotCode || '--'}}</view>
						<view class="table-cell cell-pallet highlight">{{row.fullLabel || '--'}}</view>
						<view class="table-cell cell-batch">{{row.batch != null ? row.batch : '--'}}</view>
						<view class="table-cell cell-product">{{row.productName || '--'}}</view>
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
			<button class="action-btn primary" :class="{ disabled: !canOperate }" @click="onStart">
				<uni-icons v-if="submitState == 2" type="spinner-cycle" size="18" class="loading-icon"></uni-icons>
				<text>{{$t('sanyan.start')}}</text>
			</button>
			<button class="action-btn danger" :class="{ disabled: !canOperate }" @click="onEnd">
				<uni-icons v-if="submitState == 3" type="spinner-cycle" size="18" class="loading-icon"></uni-icons>
				<text>{{$t('sanyan.end')}}</text>
			</button>
		</view>

		<!-- 作业指示选择弹层 -->
		<work-instruction-query ref="worksheetPicker" :process-type="2" @select="onWorksheetSelect"></work-instruction-query>

		<!-- 设备选择弹层 -->
		<equipment-query ref="equipmentPicker" @select="onEquipmentSelect"></equipment-query>
	</view>
</template>

<script>
	import weighPalletLoadApi from '/api/sanyang/weighPalletLoad.js';
	import WorkInstructionQuery from '../utils/workInstructionQuery.vue';
	import EquipmentQuery from '../utils/equipmentQuery.vue';

	export default {
		name: 'mixWorkRunning',
		components: {
			WorkInstructionQuery,
			EquipmentQuery
		},
		data() {
			return {
				form: {
					workSheetCode: '', // 作业指示编号（仅展示）
					batch: '', // 作业批次数（补录生成批次用）
					equipCode: '' // 设备编号（补录用）
				},
				workSheetId: null, // 选中的工单ID（实际查询条件）
				rows: [], // 工单下批次列表
				checkedIds: {}, // 手动勾选的批次，key为批次id
				loadingList: false, // 批次加载中
				submitState: null, // 请求中的操作类型：2开始 3结束，null为无请求
				adding: false // 补录请求中
			}
		},
		computed: {
			// 是否可执行开始/结束：有工单、且至少手动勾选了一行
			canOperate: function() {
				return this.workSheetId != null &&
					this.rows.length > 0 &&
					Object.keys(this.checkedIds).length > 0 &&
					this.submitState == null;
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
				this.form.batch = '';
				this.form.equipCode = '';
				this.checkedIds = {};
				this.fetchLots();
			},

			// ========== 设备选择 ==========

			// 打开设备选择弹层
			openEquipmentPicker: function() {
				this.$refs.equipmentPicker && this.$refs.equipmentPicker.open();
			},
			// 设备选择完成：保存设备编号（补录提交 equipCode）
			onEquipmentSelect: function(row) {
				if (!row) return;
				this.form.equipCode = row.equipmentCode || '';
			},

			// ========== 补录（生成批次） ==========

			// 校验并提交：按批次数为当前工单生成批次
			onAdd: function() {
				const _this = this;
				if (_this.adding) return;
				if (_this.workSheetId == null) {
					uni.showToast({
						title: _this.$t('sanyan.wsPlaceholder'),
						icon: 'none'
					});
					return;
				}
				if (!_this.form.equipCode) {
					uni.showToast({
						title: _this.$t('sanyan.equipPlaceholder'),
						icon: 'none'
					});
					return;
				}
				const batch = Number(_this.form.batch);
				if (!Number.isInteger(batch) || batch <= 0) {
					uni.showToast({
						title: _this.$t('sanyan.batchPlaceholder'),
						icon: 'none'
					});
					return;
				}
				_this.adding = true;
				weighPalletLoadApi.add({
					id: _this.workSheetId,
					batch: batch,
					equipCode: _this.form.equipCode
				}).then(function(res) {
					_this.adding = false;
					if (res.code == 200) {
						_this.form.batch = '';
						uni.showToast({
							title: _this.$t('sanyan.addSuccess'),
							icon: 'success'
						});
						// 刷新批次列表，展示新生成的批次
						_this.fetchLots();
					} else {
						uni.showToast({
							title: res.msg || _this.$t('sanyan.addFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.adding = false;
					uni.showToast({
						title: _this.$t('sanyan.addFail'),
						icon: 'none'
					});
				});
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

			// 点击行手动勾选/取消勾选（支持多选）；state==3（已结束）不可选中
			toggleRow: function(row) {
				if (this.submitState != null) return;
				if (!row || row.id == null) return;
				if (row.state == 3) {
					uni.showToast({
						title: this.$t('sanyan.endedNoSelect'),
						icon: 'none'
					});
					return;
				}
				const next = Object.assign({}, this.checkedIds);
				if (next[row.id]) {
					delete next[row.id];
				} else {
					next[row.id] = true;
				}
				this.checkedIds = next;
			},

			// ========== 底部按钮 ==========

			// 开始：仅允许对 state==1（生成）的批次操作，提交 state = 2
			onStart: function() {
				this.updateState(2, 1);
			},
			// 结束：仅允许对 state==2（已开始）的批次操作，提交 state = 3
			onEnd: function() {
				this.updateState(3, 2);
			},
			// 统一提交：将手动勾选的批次id发给工单开始/结束接口
			updateState: function(state, requiredState) {
				const _this = this;
				if (_this.submitState != null) return;
				if (!_this.canOperate) return;
				const ids = Object.keys(_this.checkedIds).map(Number);
				if (!ids.length) {
					uni.showToast({
						title: _this.$t('sanyan.noCheckedTip'),
						icon: 'none'
					});
					return;
				}
				// 前置状态校验：开始要求所选均为 state==1（生成），结束要求均为 state==2（已开始）
				const allMatched = ids.every(function(id) {
					const row = _this.rows.find(function(r) {
						return r.id === id;
					});
					return row != null && row.state === requiredState;
				});
				if (!allMatched) {
					uni.showToast({
						title: _this.$t(state == 2 ? 'sanyan.startNeedState' : 'sanyan.endNeedState'),
						icon: 'none'
					});
					return;
				}
				_this.submitState = state;
				weighPalletLoadApi.updateStae({
					ids: ids,
					state: state
				}).then(function(res) {
					_this.submitState = null;
					if (res.code == 200) {
						_this.checkedIds = {};
						uni.showToast({
							title: _this.$t(state == 2 ? 'sanyan.startSuccess' : 'sanyan.endSuccess'),
							icon: 'success'
						});
						// 刷新列表，展示最新状态
						_this.fetchLots();
					} else {
						uni.showToast({
							title: res.msg || _this.$t(state == 2 ? 'sanyan.startFail' : 'sanyan.endFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.submitState = null;
					uni.showToast({
						title: _this.$t(state == 2 ? 'sanyan.startFail' : 'sanyan.endFail'),
						icon: 'none'
					});
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.weigh-page {
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

		/* 补录按钮 */
		.form-actions {
			display: flex;
			padding: 20rpx 0 24rpx;

			.add-btn {
				flex: 1;
				height: 76rpx;
				line-height: 76rpx;
				padding: 0;
				border-radius: 38rpx;
				border: none;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 12rpx;
				color: #fff;
				font-size: 30rpx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

				&::after {
					border: none;
				}

				&.disabled {
					opacity: 0.5;
				}

				.loading-icon {
					animation: spin 1s linear infinite;
				}
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

				/* 行状态背景：state 2（已开始）绿色、state 3（已结束）灰色 */
				&.state2 {
					background: #dff2e2;
				}

				&.state3 {
					background: #ececec;
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
				flex: 1.4;
				padding-right: 24rpx;

				&.highlight {
					color: #667eea;
					font-weight: bold;
				}
			}

			&.cell-batch {
				flex: 0.9;
			}

			&.cell-product {
				flex: 1.9;
				padding-right: 24rpx;
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
			color: #fff;
			font-size: 30rpx;

			&::after {
				border: none;
			}

			&.primary {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
			}

			&.danger {
				background: linear-gradient(135deg, #ff8a65 0%, #e53935 100%);
				box-shadow: 0 8rpx 24rpx rgba(229, 57, 53, 0.3);
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
