<template>
	<view class="load-page">
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
				<!-- 子产线：不可输入，点击铅笔图标弹出产线选择，选中行的 id 作为 lotId -->
				<uv-form-item :label="$t('sanyan.subLineLabel')">
					<view class="pick-field">
						<uv-input class="pick-input" v-model="form.lineName" :readonly="true"
							:placeholder="$t('sanyan.subLinePlaceholder')" />
						<view class="pick-icon" @click="openLinePicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
				<!-- 设备：不可输入，点击铅笔图标弹出设备选择，选中行的 equipmentCode 作为 palletLabel -->
				<uv-form-item :label="$t('sanyan.equipLabel')">
					<view class="pick-field">
						<uv-input class="pick-input" v-model="form.equipName" :readonly="true"
							:placeholder="$t('sanyan.equipPlaceholder')" />
						<view class="pick-icon" @click="openEquipPicker">
							<uv-icon name="edit-pen" size="18" color="#667eea"></uv-icon>
						</view>
					</view>
				</uv-form-item>
				<!-- LABELID：扫码枪/手动输入回车后查询物料并加入表格 -->
				<uv-form-item :label="$t('sanyan.labelIdLabel')">
					<view class="input-row">
						<uv-input v-model="form.labelId" :placeholder="$t('sanyan.labelIdPlaceholder')"
							:clearable="true" confirm-type="search"
							custom-style="flex: 1; height: 38px; box-sizing: border-box;"
							@confirm="onLabelConfirm" />
						<view class="scan-btn" @click="onLabelScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>{{$t('sanyan.scan')}}</text>
						</view>
					</view>
				</uv-form-item>
			</uv-form>
		</view>

		<!-- 2. 物料列表（表头与表体统一定宽，超出屏宽时横向滚动） -->
		<view class="list-card">
			<scroll-view scroll-x class="table-hscroll">
				<view class="table-hinner">
					<view class="table-row table-header">
						<view class="table-cell cell-label">{{$t('sanyan.labelIdLabel')}}</view>
						<view class="table-cell cell-mname">{{$t('sanyan.materialNameCol')}}</view>
						<view class="table-cell cell-mcode">{{$t('sanyan.materialCodeCol')}}</view>
						<view class="table-cell cell-qty">{{$t('sanyan.numberLabel')}}</view>
						<view class="table-cell cell-unit">{{$t('sanyan.unitLabel')}}</view>
					</view>
					<scroll-view scroll-y class="table-body">
						<template v-if="rows.length">
							<view class="table-row table-data" v-for="(row, index) in rows" :key="row.scanLabel || index">
								<view class="table-cell cell-label highlight">{{row.scanLabel || '--'}}</view>
								<view class="table-cell cell-mname">{{row.materialName || '--'}}</view>
								<view class="table-cell cell-mcode">{{row.materialCode || '--'}}</view>
								<view class="table-cell cell-qty">{{row.actualWt != null ? row.actualWt : '--'}}</view>
								<view class="table-cell cell-unit">{{row.unit || '--'}}</view>
							</view>
							<view class="list-tip" v-if="loadingList">{{$t('sanyan.loading')}}</view>
						</template>
						<view class="empty-state" v-else>
							<text>{{ loadingList ? $t('sanyan.loading') : $t('sanyan.noLabelIdTip') }}</text>
						</view>
					</scroll-view>
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

		<!-- 作业指示 / 子产线 / 设备 选择弹层 -->
		<work-instruction-query ref="worksheetPicker" :process-type="2" @select="onWorksheetSelect">
		</work-instruction-query>
		<line-query ref="linePicker" :work-sheet-id="workSheetId" @select="onLineSelect"></line-query>
		<equipment-query ref="equipPicker" @select="onEquipSelect"></equipment-query>
	</view>
</template>

<script>
	import materialLoadApi from '/api/sanyang/materialLoad.js';
	import WorkInstructionQuery from '../utils/workInstructionQuery.vue';
	import LineQuery from '../utils/lineQuery.vue';
	import EquipmentQuery from '../utils/equipmentQuery.vue';
	import scanCode from '/common/scan.js';
	import showBeautyToast from '@/common/beautyToast.js';

	// 物料装载的包装类型：3单包 4多包 5料包
	// TODO: 按业务确认物料装载实际使用的包装类型
	const PACK_TYPE = 5;

	export default {
		name: 'materialLoad',
		components: {
			WorkInstructionQuery,
			LineQuery,
			EquipmentQuery
		},
		data() {
			return {
				form: {
					workSheetCode: '', // 作业指示编号（仅用于子产线查询）
					lineName: '', // 子产线名称（仅展示）
					equipName: '', // 设备名称（仅展示）
					labelId: '' // LABELID（扫码输入，查询物料用）
				},
				workSheetId: null, // 选中的作业指示ID（子产线查询条件）
				lotId: null, // 选中子产线的ID（装载提交用）
				palletLabel: '', // 选中设备的设备编号（装载提交用）
				rows: [], // 本次扫描的物料列表
				loadingList: false, // 物料查询中
				submitting: false // 装载提交中
			}
		},
		computed: {
			// 是否可执行装载：已选子产线、已选设备且有扫描数据
			canLoad: function() {
				return this.lotId != null &&
					!!this.palletLabel &&
					this.rows.length > 0 &&
					!this.submitting;
			}
		},
		methods: {
			// ========== 作业指示选择 ==========

			// 打开作业指示选择弹层
			openWorksheetPicker: function() {
				this.$refs.worksheetPicker && this.$refs.worksheetPicker.open();
			},
			// 作业指示选择完成：赋值并清空依赖它的子产线与扫描数据
			onWorksheetSelect: function(row) {
				if (!row) return;
				const id = row.workSheetId != null ? row.workSheetId : row.id;
				if (id == null) return;
				this.workSheetId = id;
				this.form.workSheetCode = row.workSheetCode || '';
				this.form.lineName = '';
				this.lotId = null;
				this.form.labelId = '';
				this.rows = [];
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
			// 子产线选择完成：选中行的 id 作为装载用的 lotId
			onLineSelect: function(row) {
				if (!row) return;
				this.lotId = row.id != null ? row.id : null;
				this.form.lineName = row.lineName || row.lineCode || '';
			},

			// ========== 设备选择 ==========

			// 打开设备选择弹层
			openEquipPicker: function() {
				this.$refs.equipPicker && this.$refs.equipPicker.open();
			},
			// 设备选择完成：选中行的 equipmentCode 作为装载用的 palletLabel
			onEquipSelect: function(row) {
				if (!row) return;
				this.palletLabel = row.equipmentCode || '';
				this.form.equipName = row.equipmentCode || '';
			},

			// ========== LABELID 扫码 ==========

			// LABELID 回车确认：扫码枪回车极快，延迟 200ms 再取值，避免拿到不完整数据
			onLabelConfirm: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.form.labelId) {
						_this.fetchMaterial(_this.form.labelId);
					}
				}, 200);
			},

			// LABELID 扫码：扫码结果回填后直接查询物料
			onLabelScan: function() {
				const _this = this;
				scanCode().then(function(code) {
					_this.form.labelId = code;
					_this.fetchMaterial(code);
				}).catch(function(err) {
					showBeautyToast({
						title: err || _this.$t('sanyan.scanFail'),
						icon: 'none'
					});
				});
			},

			// 查询物料并加入表格
			fetchMaterial: function(label) {
				const _this = this;
				const code = String(label || '').trim();
				_this.form.labelId = '';
				if (!code) return;
				if (_this.lotId == null) {
					uni.showToast({
						title: _this.$t('sanyan.noSubLineTip'),
						icon: 'none'
					});
					return;
				}
				// 同一 LABELID 不重复入列
				const exists = _this.rows.find(function(r) {
					return r.scanLabel === code;
				});
				if (exists) {
					uni.showToast({
						title: _this.$t('sanyan.labelIdScanned'),
						icon: 'none'
					});
					return;
				}
				if (_this.loadingList) return;
				_this.loadingList = true;
				materialLoadApi.selectPalletLabel(code).then(function(res) {
					_this.loadingList = false;
					if (res.code == 200) {
						const data = res.data || {};
						const scanLabel = data.scanLabel || code;
						const duplicate = _this.rows.find(function(r) {
							return r.scanLabel === scanLabel;
						});
						if (duplicate) {
							uni.showToast({
								title: _this.$t('sanyan.labelIdScanned'),
								icon: 'none'
							});
							return;
						}
						_this.rows.push({
							scanLabel: scanLabel,
							materialName: data.materialName || '',
							materialCode: data.materialCode || '',
							actualWt: data.actualWt != null ? data.actualWt : 0,
							unit: data.unit || ''
						});
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

			// ========== 底部按钮 ==========

			// 初始化：清空作业指示、子产线、设备与扫描数据
			onInitialize: function() {
				if (this.submitting) return;
				this.form.workSheetCode = '';
				this.form.lineName = '';
				this.form.equipName = '';
				this.form.labelId = '';
				this.workSheetId = null;
				this.lotId = null;
				this.palletLabel = '';
				this.rows = [];
			},
			// 装载：扫描列表按接口格式批量保存
			onLoad: function() {
				const _this = this;
				if (!_this.canLoad) return;
				const items = _this.rows.map(function(r) {
					return {
						actualWt: r.actualWt,
						lotId: _this.lotId,
						materialCode: r.materialCode,
						materialName: r.materialName,
						scanLabel: r.scanLabel,
						unit: r.unit,
						palletLabel: _this.palletLabel,
						packType: PACK_TYPE
					};
				});
				if (!items.length) {
					uni.showToast({
						title: _this.$t('sanyan.noLabelIdTip'),
						icon: 'none'
					});
					return;
				}
				_this.submitting = true;
				materialLoadApi.addBatch(items).then(function(res) {
					_this.submitting = false;
					if (res.code == 200) {
						_this.rows = [];
						_this.form.labelId = '';
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
	.load-page {
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

	/* 物料列表 */
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
			min-width: 1400rpx;
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
