<template>
	<view class="unload-page">
		<!-- 1. 查询区域 -->
		<view class="query-card">
			<uv-form :model="form" :border-bottom="false" :label-width="130" label-position="left">
				<!-- 作业指示编号：不可输入，点击铅笔图标弹出作业指示选择（仅用于子产线查询） -->
				<uv-form-item :label="$t('sanyan.worksheetCodea')">
					<view class="pick-field">
						<uv-input class="pick-input" v-model="form.workSheetCode" :readonly="true"
							:placeholder="$t('sanyan.wsPlaceholder')" />
						<view class="pick-icon" @click="openWorksheetPicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
				<!-- 子产线：不可输入，点击铅笔图标弹出产线设备选择，选中行的 equipCode 作为 equipCode -->
				<uv-form-item :label="$t('sanyan.subLineLabel')">
					<view class="pick-field">
						<uv-input class="pick-input" v-model="form.lineName" :readonly="true"
							:placeholder="$t('sanyan.subLinePlaceholder')" />
						<view class="pick-icon" @click="openLinePicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
				<!-- 设备：不可输入，点击铅笔图标弹出设备选择，选中行的 equipmentCode 作为 palletLabel，选择后查询装载记录 -->
				<uv-form-item :label="$t('sanyan.equipLabel')">
					<view class="pick-field">
						<uv-input class="pick-input" v-model="form.equipName" :readonly="true"
							:placeholder="$t('sanyan.equipPlaceholder')" />
						<view class="pick-icon" @click="openEquipPicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
		</view>

		<!-- 2. 物料记录列表（点击行选中；表头与表体统一定宽，超出屏宽时横向滚动） -->
		<view class="list-card">
			<scroll-view scroll-x class="table-hscroll">
				<view class="table-hinner">
					<view class="table-row table-header">
						<view class="table-cell cell-label">{{$t('sanyan.labelIdLabel')}}</view>
						<view class="table-cell cell-equip">{{$t('sanyan.palletizerCodeCol')}}</view>
						<view class="table-cell cell-mname">{{$t('sanyan.materialNameCol')}}</view>
						<view class="table-cell cell-mcode">{{$t('sanyan.materialCodeCol')}}</view>
						<view class="table-cell cell-qty">{{$t('sanyan.numberLabel')}}</view>
						<view class="table-cell cell-unit">{{$t('sanyan.unitLabel')}}</view>
					</view>
					<scroll-view scroll-y class="table-body">
						<template v-if="rows.length">
							<view class="table-row table-data"
								:class="{ selected: selectedRow && selectedRow.id === row.id }"
								v-for="row in rows" :key="row.id" @click="onRowSelect(row)">
								<view class="table-cell cell-label highlight">{{row.scanLabel || '--'}}</view>
								<view class="table-cell cell-equip">{{row.equipCode || '--'}}</view>
								<view class="table-cell cell-mname">{{row.materialName || '--'}}</view>
								<view class="table-cell cell-mcode">{{row.materialCode || '--'}}</view>
								<view class="table-cell cell-qty">{{row.actualWt != null ? row.actualWt : '--'}}</view>
								<view class="table-cell cell-unit">{{row.unit || '--'}}</view>
							</view>
							<view class="list-tip" v-if="loadingList">{{$t('sanyan.loading')}}</view>
						</template>
						<view class="empty-state" v-else>
							<text>{{ loadingList ? $t('sanyan.loading') : $t('sanyan.noRecordTip') }}</text>
						</view>
					</scroll-view>
				</view>
			</scroll-view>
		</view>

		<!-- 3. 托盘数量输入 + 底部按钮 -->
		<view class="bottom-wrapper">
			<view class="qty-row">
				<text class="qty-label">{{$t('sanyan.palletQtyLabel')}}</text>
				<uv-input v-model="form.palletQty" type="digit" :placeholder="$t('sanyan.palletQtyPlaceholder')"
					:disabled="!selectedRow" :clearable="true" 
					custom-style="flex: 1; height: 38px; box-sizing: border-box;" />
			</view>
			<view class="qty-tip" v-if="qtyTip">{{ qtyTip }}</view>
			<view class="button-wrapper">
				<button class="action-btn" :class="{ disabled: submitting }" @click="onInitialize">
					{{$t('sanyan.init')}}
				</button>
				<button class="action-btn primary" :disabled="!canUnload" :class="{ disabled: !canUnload }"
					@click="onUnload">
					<uni-icons v-if="submitting" type="spinner-cycle" size="18" class="loading-icon"></uni-icons>
					<text>{{$t('sanyan.unloadBtn')}}</text>
				</button>
			</view>
		</view>

		<!-- 作业指示 / 子产线 / 设备 选择弹层 -->
		<work-instruction-query ref="worksheetPicker" :process-type="2" @select="onWorksheetSelect">
		</work-instruction-query>
		<line-equip-query ref="linePicker" :work-sheet-id="workSheetId" @select="onLineSelect"></line-equip-query>
		<equipment-query ref="equipPicker" @select="onEquipSelect"></equipment-query>
	</view>
</template>

<script>
	import materialUnloadApi from '/api/sanyang/materialUnload.js';
	import WorkInstructionQuery from '../utils/workInstructionQuery.vue';
	import LineEquipQuery from '../utils/lineEquipQuery.vue';
	import EquipmentQuery from '../utils/equipmentQuery.vue';

	// 称重记录的包装类型：3单包 4多包 5料包
	const PACK_TYPES = '3,4,5';

	export default {
		name: 'materialUnload',
		components: {
			WorkInstructionQuery,
			LineEquipQuery,
			EquipmentQuery
		},
		data() {
			return {
				form: {
					workSheetCode: '', // 作业指示编号（仅用于子产线查询）
					lineName: '', // 子产线名称（仅展示）
					equipName: '', // 设备名称（仅展示）
					palletQty: '' // 托盘数量（默认为选中行的 actualWt，可修改）
				},
				workSheetId: null, // 选中的作业指示ID（子产线查询条件）
				equipCode: '', // 选中子产线的设备编号（记录查询条件）
				palletLabel: '', // 选中设备的设备编号（记录查询条件 palletLabel）
				rows: [], // 装载记录列表
				selectedRow: null, // 选中的记录行
				loadingList: false, // 记录查询中
				submitting: false // 卸载提交中
			}
		},
		computed: {
			// 托盘数量校验提示：仅在小于0或大于原数量时提示，其余情况不提示
			qtyTip: function() {
				if (!this.selectedRow) return '';
				const raw = String(this.form.palletQty == null ? '' : this.form.palletQty).trim();
				if (raw === '') return '';
				const qty = Number(raw);
				if (isNaN(qty) || qty < 0) return this.$t('sanyan.palletQtyInvalid');
				if (this.selectedRow.actualWt != null && qty > Number(this.selectedRow.actualWt)) {
					return this.$t('sanyan.palletQtyInvalid');
				}
				return '';
			},
			// 是否可执行卸载：已选记录行、托盘数量已填写且合法、未在提交中
			canUnload: function() {
				if (!this.selectedRow || this.submitting) return false;
				const raw = String(this.form.palletQty == null ? '' : this.form.palletQty).trim();
				if (raw === '') return false;
				const qty = Number(raw);
				if (isNaN(qty) || qty < 0) return false;
				if (this.selectedRow.actualWt != null && qty > Number(this.selectedRow.actualWt)) return false;
				return true;
			}
		},
		methods: {
			// ========== 作业指示选择 ==========

			// 打开作业指示选择弹层
			openWorksheetPicker: function() {
				this.$refs.worksheetPicker && this.$refs.worksheetPicker.open();
			},
			// 作业指示选择完成：赋值并清空依赖它的子产线与记录数据
			onWorksheetSelect: function(row) {
				if (!row) return;
				const id = row.workSheetId != null ? row.workSheetId : row.id;
				if (id == null) return;
				this.workSheetId = id;
				this.form.workSheetCode = row.workSheetCode || '';
				this.form.lineName = '';
				this.equipCode = '';
				this.resetList();
			},

			// ========== 子产线选择 ==========

			// 打开子产线选择弹层（需先选择作业指示）
			openLinePicker: function() {
				if (this.workSheetId == null) {
					uni.showToast({
						title: this.$t('sanyan.noWorksheetTip'),
						icon: 'none'
					});
					return;
				}
				this.$refs.linePicker && this.$refs.linePicker.open();
			},
			// 子产线选择完成：选中行的 equipCode 作为 equipCode，若已选设备则重新查询记录
			onLineSelect: function(row) {
				if (!row) return;
				this.equipCode = row.equipCode || '';
				this.form.lineName = row.lineName || row.lineCode || '';
				if (this.palletLabel) {
					this.fetchRecords();
				}
			},

			// ========== 设备选择 ==========

			// 打开设备选择弹层
			openEquipPicker: function() {
				this.$refs.equipPicker && this.$refs.equipPicker.open();
			},
			// 设备选择完成：选中行的 equipmentCode 作为 equipCode，选择后查询装载记录
			onEquipSelect: function(row) {
				if (!row) return;
				this.palletLabel = row.equipmentCode || '';
				this.form.equipName = row.equipmentCode || '';
				this.fetchRecords();
			},

			// ========== 装载记录查询 ==========

			// 查询装载记录：按子产线设备编号、设备编号与作业指示ID查询
			fetchRecords: function() {
				const _this = this;
				if (!_this.palletLabel) {
					uni.showToast({
						title: _this.$t('sanyan.noEquipTip'),
						icon: 'none'
					});
					return;
				}
				_this.loadingList = true;
				materialUnloadApi.searchRecord({
					type: PACK_TYPES,
					palletLabel: _this.palletLabel,
					equipCode: _this.equipCode,
					workSheetId: _this.workSheetId
				}).then(function(res) {
					_this.loadingList = false;
					if (res.code == 200) {
						_this.rows = res.data || [];
						_this.resetList();
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

			// ========== 行选择 ==========

			// 点击行选中：托盘数量默认为该行 actualWt
			onRowSelect: function(row) {
				if (this.submitting) return;
				this.selectedRow = row;
				this.form.palletQty = row.actualWt != null ? String(row.actualWt) : '';
			},

			// ========== 底部按钮 ==========

			// 清空选中行与托盘数量
			resetList: function() {
				this.selectedRow = null;
				this.form.palletQty = '';
			},

			// 初始化：清空作业指示、子产线、设备与记录数据
			onInitialize: function() {
				if (this.submitting) return;
				this.form.workSheetCode = '';
				this.form.lineName = '';
				this.form.equipName = '';
				this.workSheetId = null;
				this.equipCode = '';
				this.palletLabel = '';
				this.rows = [];
				this.resetList();
			},

			// 卸载：传给后台的值为原值 - 修改后的托盘数量
			onUnload: function() {
				const _this = this;
				if (!_this.canUnload) {
					if (_this.qtyTip) {
						uni.showToast({
							title: _this.qtyTip,
							icon: 'none'
						});
					}
					return;
				}
				const qty = Number(_this.form.palletQty);
				const unloadWt = _this.selectedRow.actualWt - qty;
				_this.submitting = true;
				materialUnloadApi.updateLabel({
					id: _this.selectedRow.id,
					actualWt: unloadWt
				}).then(function(res) {
					_this.submitting = false;
					if (res.code == 200) {
						uni.showToast({
							title: _this.$t('sanyan.unloadSuccess'),
							icon: 'success'
						});
						_this.fetchRecords();
					} else {
						uni.showToast({
							title: res.msg || _this.$t('sanyan.unloadFail'),
							icon: 'none'
						});
					}
				}).catch(function() {
					_this.submitting = false;
					uni.showToast({
						title: _this.$t('sanyan.unloadFail'),
						icon: 'none'
					});
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.unload-page {
		height: 95vh;
		box-sizing: border-box;
		padding-bottom: 320rpx;
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

		/* 只读选择框 + 铅笔图标 */
		.pick-field {
			flex: 1;
			display: flex;
			align-items: center;

			.pick-input {
				flex: 1;
			}

			.pick-icon {
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

	/* 物料记录列表 */
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
			min-width: 1200rpx;
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
				height: 100rpx;
				flex-shrink: 0;
				padding: 0 8rpx;
				border-bottom: 2rpx solid #f0f1f5;

				&.selected {
					background: #eef0fd;
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

			&.cell-label {
				flex: 2;

				&.highlight {
					color: #667eea;
					font-weight: bold;
				}
			}

			&.cell-equip {
				flex: 1.2;
			}

			&.cell-mname {
				flex: 1.4;
			}

			&.cell-mcode {
				flex: 1.2;
			}

			&.cell-qty {
				flex: 0.9;
			}

			&.cell-unit {
				flex: 0.8;
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

	/* 托盘数量输入 + 底部按钮 */
	.bottom-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

		.qty-row {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 20rpx;

			.qty-label {
				flex-shrink: 0;
				font-size: 26rpx;
				color: #333;
				font-weight: bold;
			}
		}

		/* 托盘数量不合法时的提示 */
		.qty-tip {
			margin-bottom: 16rpx;
			padding: 12rpx 16rpx;
			border-radius: 8rpx;
			background: #fef0f0;
			font-size: 24rpx;
			color: #f56c6c;
		}

		.button-wrapper {
			display: flex;
			gap: 20rpx;

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
