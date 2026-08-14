<template>
	<view class="ware-house-container">
		<view class="box-body">
			<!-- 查询条件 -->
			<view class="query-form">
				<view class="query-row">
					<text class="query-label">{{ $t('warehouse.produceDate') }}</text>
					<view class="query-input" @click="openCalendar">
						{{ queryDate || $t('warehouse.produceDate') }}
					</view>
				</view>
				<view class="query-row">
					<text class="query-label">{{ $t('warehouse.lineName') }}</text>
					<input class="query-input" v-model="lineId" :placeholder="$t('warehouse.lineName')" />
				</view>
				<view class="query-row">
					<text class="query-label">{{ $t('warehouse.productCode') }}</text>
					<view class="query-input-row">
						<input class="query-input" v-model="productCode" :placeholder="$t('warehouse.productCode')"
							@confirm="onQuery" />
						<view class="scan-btn" @click="onProductScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<!-- 查询结果（列表） -->
			<scroll-view class="result-scroll" scroll-x="true" v-if="workOrderList && workOrderList.length > 0">
				<view class="result-list">
					<view class="result-header">
						<view class="result-cell">{{ $t('warehouse.worksheetCode') }}</view>
						<view class="result-cell">{{ $t('warehouse.lineName') }}</view>
						<view class="result-cell">{{ $t('warehouse.productCode') }}</view>
						<view class="result-cell">{{ $t('warehouse.finishNumber') }}</view>
						<view class="result-cell">{{ $t('warehouse.status') }}</view>
					</view>
					<view class="result-row" v-for="(item, index) in workOrderList" :key="index">
						<view class="result-cell">{{ item.workSheetCode }}</view>
						<view class="result-cell">{{ item.lineName }}</view>
						<view class="result-cell">{{ item.productCode }}</view>
						<view class="result-cell">{{ item.workSheetFinishNumber }}</view>
						<view class="result-cell">{{ formatStatus(item.status) }}</view>
					</view>
				</view>
			</scroll-view>
			<view class="result-empty" v-else>
				{{ $t('warehouse.workOrderEmpty') }}
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="operator-button">
			<button type="primary" size="mini" @click="onQuery">{{ $t('warehouse.query') }}</button>
			<button size="mini" @click="onReset">{{ $t('common.reset') }}</button>
		</view>

		<!-- 日期选择弹窗 -->
		<uv-datetime-picker ref="datetimePicker" mode="date" :value="defaultDate" @confirm="onDateConfirm"></uv-datetime-picker>
	</view>
</template>

<script>
	import workOrderQuery from "/api/warehouse/workOrderQuery.js";
	import scanCode from "/common/scan.js";
	import uvDatetimePicker from "@/uni_modules/uv-datetime-picker/components/uv-datetime-picker/uv-datetime-picker.vue";
	export default {
		components: {
			uvDatetimePicker
		},
		data() {
			const d = new Date();
			return {
				queryDate: `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`,
				defaultDate: d.getTime(),
				lineId: "",
				productCode: "",
				workOrderList: []
			}
		},
		onLoad() {
			const _this = this;
			// 初始化由前端清空条件及列表，不调用后端
			_this.onReset();
		},
		methods: {
			openCalendar: function() {
				this.$refs.datetimePicker.open();
			},
			onDateConfirm: function(e) {
				const _this = this;
				// confirm 返回 { value: 时间戳 }
				if (e && e.value) {
					const d = new Date(e.value);
					const y = d.getFullYear();
					const m = ('0' + (d.getMonth() + 1)).slice(-2);
					const day = ('0' + d.getDate()).slice(-2);
					_this.queryDate = y + '-' + m + '-' + day;
				}
			},
			onQuery: function() {
				const _this = this;
				if (!_this.queryDate && !_this.lineId && !_this.productCode) {
					uni.showToast({
						title: _this.$t('warehouse.queryConditionRequired'),
						icon: 'none'
					});
					return;
				}
				const params = {
					produceDate: _this.queryDate,
					lineId: _this.lineId ? Number(_this.lineId) : undefined,
					productCode: _this.productCode ? _this.productCode.trim() : undefined
				};
				workOrderQuery.getWorkOrders(params).then(function(res) {
					if (res.code == 200) {
						_this.workOrderList = res.data || [];
						if (!_this.workOrderList.length) {
							uni.showToast({
								title: _this.$t('common.noData'),
								icon: 'none'
							});
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						});
					}
				}).catch(function() {
					uni.showToast({
						title: _this.$t('warehouse.error'),
						icon: 'none'
					});
				});
			},
			onReset: function() {
				this.queryDate = "";
				this.lineId = "";
				this.productCode = "";
				this.workOrderList = [];
			},
			onProductScan: function() {
				const _this = this;
				scanCode().then(function(code) {
					_this.productCode = code;
					setTimeout(function() {
						_this.onQuery();
					}, 200);
				}).catch(function(err) {
					uni.showToast({
						title: err,
						icon: 'none'
					});
				});
			},
			formatStatus: function(status) {
				const map = {
					1: this.$t('warehouse.statusNotStarted'),
					2: this.$t('warehouse.statusProducing'),
					3: this.$t('warehouse.statusFullDone'),
					4: this.$t('warehouse.statusShortDone'),
					5: this.$t('warehouse.statusUndone')
				};
				return map[status] !== undefined ? map[status] : status;
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";
	@import "@/static/styles/warehouse-common.less";

	.query-form {
		padding: 20rpx 30rpx;
		background: rgba(255, 255, 255, 0.1);

		.query-row {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;

			.query-label {
				width: 200rpx;
				font-size: 28rpx;
				color: #333;
			}

			.query-input {
				flex: 1;
				height: 72rpx;
				line-height: 72rpx;
				padding: 0 24rpx;
				background: #fff;
				border-radius: 12rpx;
				font-size: 28rpx;
				border: 2rpx solid #e8eaf0;
			}

			.query-input-row {
				flex: 1;
				display: flex;
				align-items: center;

				.query-input {
					border-top-right-radius: 0;
					border-bottom-right-radius: 0;
					border-right: none;
				}

				.scan-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 72rpx;
					height: 72rpx;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border-top-right-radius: 12rpx;
					border-bottom-right-radius: 12rpx;
				}
			}
		}
	}

	.result-scroll {
		margin: 20rpx 30rpx;
		white-space: nowrap;
	}

	.result-list {
		display: inline-block;
		min-width: 100%;
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

		.result-header,
		.result-row {
			display: flex;
			align-items: center;
			padding: 24rpx 20rpx;
			width: 100%;
		}

		.result-header {
			font-weight: bold;
			color: #fff;
			font-size: 26rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

			.result-cell {
				color: white;
				text-align: center;
			}
		}

		.result-row {
			border-bottom: 2rpx solid #f2f3f7;
			transition: background 0.2s;

			&:last-child {
				border-bottom: none;
			}

			&:active {
				background: #f6f7fb;
			}
		}

		.result-cell {
			flex: 1;
			min-width: 200rpx;
			width:auto;
			font-size: 26rpx;
			color: #444;
			line-height: 1.4;
			white-space: normal;
			word-break: break-word;
			overflow-wrap: break-word;
			padding: 0 16rpx;
			text-align: center;

			&:not(:last-child) {
				border-right: 2rpx solid #f0f1f5;
			}
		}

		.result-row .result-cell:last-child {
			color: #667eea;
			font-weight: 500;
		}
	}

	.result-empty {
		padding: 80rpx 30rpx;
		text-align: center;
		color: #999;
		font-size: 28rpx;
	}

	.operator-button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 0;

		button {
			width: 48%;
		}

		button[type="primary"] {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: #fff;
		}

		button:not([type="primary"]) {
			background: #fff;
			color: #667eea;
			border: 2rpx solid #667eea;
		}
	}
</style>
