<template>
	<view class="ware-house-container">
		<view class="box-body">
			<!-- 查询条件 -->
			<view class="query-form">
				<view class="query-row">
					<text class="query-label">{{ $t('warehouse.labelCode') }}</text>
					<view class="query-input-row">
						<input class="query-input" v-model="labelCode" :placeholder="$t('warehouse.labelCode')"
							@confirm="onQuery" />
						<view class="scan-btn" @click="onLabelScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
						</view>
					</view>
				</view>
			</view>

			<!-- 查询结果（单个对象） -->
			<view class="result-detail" v-if="materialLot && materialLot.labelCode">
				<view class="warehouse-detail">
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.labelCode') }}</text>
							<text class="value">{{ materialLot.labelCode }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.materialCode') }}</text>
							<text class="value">{{ materialLot.materialCode }}</text>
						</view>
						<view class="right">
							<text>{{ $t('warehouse.materialName') }}</text>
							<text class="value">{{ materialLot.materialName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.quantity') }}</text>
							<text class="value">{{ materialLot.quantity }}</text>
						</view>
						<view class="right">
							<text>{{ $t('warehouse.unit') }}</text>
							<text class="value">{{ materialLot.unit }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.warehouseName') }}</text>
							<text class="value">{{ materialLot.warehouseName }}</text>
						</view>
						<view class="right">
							<text>{{ $t('warehouse.supplierName') }}</text>
							<text class="value">{{ materialLot.supplierName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.manufactureDate') }}</text>
							<text class="value">{{ materialLot.manufactureDate }}</text>
						</view>
						<view class="right">
							<text>{{ $t('warehouse.validDate') }}</text>
							<text class="value">{{ materialLot.validDate }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>{{ $t('warehouse.inboundDate') }}</text>
							<text class="value">{{ materialLot.inboundDate }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="result-empty" v-else>
				{{ $t('warehouse.materialQueryEmpty') }}
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="operator-button">
			<button type="primary" size="mini" @click="onQuery">{{ $t('warehouse.query') }}</button>
			<button size="mini" @click="onReset">{{ $t('common.reset') }}</button>
		</view>
	</view>
</template>

<script>
	import workOrderQuery from "/api/warehouse/workOrderQuery.js";
	import scanCode from "/common/scan.js";
	export default {
		data() {
			return {
				labelCode: "",
				materialLot: {}
			}
		},
		onLoad() {
			// 初始化由前端清空条件及列表，不调用后端
			this.onReset();
		},
		methods: {
			onQuery: function() {
				const _this = this;
				setTimeout(() => {
					const code = _this.labelCode ? _this.labelCode.trim() : "";
					if (!code) {
						uni.showToast({
							title: _this.$t('warehouse.queryConditionRequired'),
							icon: 'none'
						});
						return;
					}
					const params = {
						labelCode: code
					};
					workOrderQuery.getMaterialLot(params).then(function(res) {
						if (res.code == 200) {
							_this.materialLot = res.data || {};
							if (!_this.materialLot || !_this.materialLot.labelCode) {
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
				}, 200);
			},
			onReset: function() {
				this.labelCode = "";
				this.materialLot = {};
			},
			onLabelScan: function() {
				const _this = this;
				scanCode().then(function(code) {
					_this.labelCode = code;
					setTimeout(function() {
						_this.onQuery();
					}, 200);
				}).catch(function(err) {
					uni.showToast({
						title: err,
						icon: 'none'
					});
				});
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

	.result-detail {
		margin: 10rpx 30rpx;
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
