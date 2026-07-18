<template>
	<view class="ware-house-container">
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<uni-icons type="home" color="#fff" size="18"></uni-icons>
							<text>{{ $t('warehouse.formNo') }}</text>
							<uni-easyinput 
								v-model="wareLocationCode" 
								:inputBorder="false"
								placeholderStyle="color: #999;"
								@confirm="onManualInput"
								class="warehouse-input"
							></uni-easyinput>
						</view>
					</view>
					<view class="right" @click="onLocationScan">
						<uni-icons type="scan" color="#fff" size="16"></uni-icons>
						<text>{{ $t('warehouse.pleaseScan') }}</text>
					</view>
				</view>
				<view class="table-wrapper" v-if="rows && rows.length > 0">
					<view class="table-row table-header">
						<view class="table-cell" style="flex: 1.5;">{{ $t('warehouse.code') }}</view>
						<view class="table-cell" style="flex: 2;">{{ $t('warehouse.materialName') }}</view>
						<view class="table-cell" style="flex: 1;">{{ $t('warehouse.formQty') }}</view>
						<view class="table-cell" style="flex: 1;">{{ $t('warehouse.outQty') }}</view>
					</view>
					<scroll-view scroll-y class="table-body">
						<view class="table-row" v-for="(row, index) in rows" :key="index"
							:class="{ active: formDetailId === row.id }" @click="tTableClick({ row })">
							<view class="table-cell" style="flex: 1.5;">{{row.materialCode}}</view>
							<view class="table-cell" style="flex: 2;">{{row.materialName}}</view>
							<view class="table-cell highlight" style="flex: 1;">{{row.number}}</view>
							<view class="table-cell success" style="flex: 1;">{{row.stockNumber}}</view>
						</view>
					</scroll-view>
				</view>
				<view class="empty-state" v-else>
					<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
					<text>{{spin.code ? $t('warehouse.loadingDots') : $t('warehouse.noData')}}</text>
				</view>
				</view>
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose" color="#fff" size="16"></uni-icons>
						<text class="title">{{ $t('warehouse.shelfDetail') }}</text>
						<text class="count">({{details.length}})</text>
					</view>
					<view class="right refresh-btn" @click="queryDetails">
						<uni-icons type="refreshempty" color="#fff" size="16"></uni-icons>
					</view>
				</view>
				<view class="detail-list" v-if="details.length > 0">
					<view class="detail-card" v-for="(detail, index) in details" :key="index">
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.code') }}：</text>
								<text class="value">{{detail.materialCode || '--'}}</text>
							</view>
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.materialName') }}：</text>
								<text class="value">{{detail.materialName || '--'}}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.batchCode') }}：</text>
								<text class="value">{{detail.batchCode || '--'}}</text>
							</view>
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.labelNo') }}：</text>
								<text class="value">{{detail.labelCode || '--'}}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.locationNo') }}：</text>
								<text class="value">{{detail.locationCode || '--'}}</text>
							</view>
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.storageNo') }}：</text>
								<text class="value">{{detail.storageCode || '--'}}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.areaNo') }}：</text>
								<text class="value">{{detail.wareAreaCode || '--'}}</text>
							</view>
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.warehouseNameLabel') }}：</text>
								<text class="value">{{detail.warehouseName || '--'}}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">{{ $t('warehouse.stockQty') }}：</text>
								<text class="value">{{detail.number == null ? '--' : detail.number}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
					<text>{{ $t('warehouse.noShelfDetail') }}</text>
				</view>
			</view>
		</view>
		<view class="button-wrapper">
			<button class="action-btn primary" :class="{ disabled: !formDetailId }" @click="onSubmit">
				<uni-icons type="arrowright" size="18"></uni-icons>
				<text>{{ $t('warehouse.pickingWork') }}</text>
			</button>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import materialNotAgv from '/api/warehouse/materialNotAgv';
	import {
		CodeType
	} from "/common/enum.js"
	import {
		getCodeType
	} from '/common/util.js'
	import showBeautyToast from '@/common/beautyToast.js'


	export default {
		data() {
			return {
				wareLocationCode: '',
				rows: undefined,
				details: [],
				formDetailId: '',
				spin: {
					code: false,
				}
			}
		},
		onLoad() {
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan') // 每次进来先 移除全局自定义事件监听器
					uni.$on('scan', function(code) {
						//扫码成功后的回调，你可以写自己的逻辑代码在这里
						const codeType = getCodeType(code);
						if (codeType == CodeType.KQ) {
							_this.loadWarehouseInfo(code);
						} else {
							uni.showToast({
								title: _this.$t('warehouse.tagInvalid'),
								icon: 'none'
							});
						}
					})

				}
			})
		},
		onShow() {
			if (this.formDetailId) {
				this.queryDetails();
			}
		},
		destroyed: function() {
			plus.key.removeEventListener('keydown');
		},
		methods: {
			onManualInput: function() {
				const _this = this;
				setTimeout(function() {
					if (_this.wareLocationCode) {
						_this.loadWarehouseInfo(_this.wareLocationCode);
					}
				}, 200);
			},
			loadWarehouseInfo: async function(code) {
				this.wareLocationCode = code;
				this.spin.code = true;
				const resp = await materialNotAgv.listFormDetail({
					formCode: code
				});
				this.spin.code = false;
				if (resp.code == 200) {
					this.rows = resp.data;
				} else {
					showBeautyToast({
						title: resp.msg || resp.error,
						icon: 'error'
					})
					this.wareLocationCode = '';
				}
			},
			onLocationScan: function() {
				const _this = this;
				scanCode().then((code) => {
					_this.loadWarehouseInfo(code);
				}).catch(err => {
					console.log(err)
					showBeautyToast({
						title: err,
						icon: 'warn'
					})
				});
			},
			onSubmit: async function() {
				if (!this.formDetailId) {
					showBeautyToast({
						title: this.$t('warehouse.selectOutItemFirst'),
						icon: 'warn'
					});
					return;
				}
				uni.navigateTo({
					url: '/pages/work/warehouse/operationPage/operationPageNotAGV/operationPageNotAGV?formDetailId=' + this.formDetailId +'&type=-1'
				});
			},
			tTableClick: function({
				row,
				target
			}) {
				if (row) {
					this.formDetailId = row.id;
					this.queryDetails()
				} else if (!target) {
					this.formDetailId = '';
				}
			},
			queryDetails: async function() {
				const row = this.rows.find(function(r) { return r.id === this.formDetailId; }.bind(this));
				if (!row) {
					this.details = [];
					return;
				}
				const resp = await materialNotAgv.listDetailByMaterialCode({
					materialCode: row.materialCode
				});
				if (resp.code == 200) {
					this.details = resp.data || [];
				} else {
					this.details = [];
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";

	.ware-house-container {
		background: #f5f7fa;
		min-height: 100vh;
		padding-bottom: 120rpx;
	}

	.box-body {
		padding: 20rpx;
	}

	.warehouse-info {
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		margin-bottom: 30rpx;

		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 20rpx;

			.left {
				display: flex;
				align-items: center;
				gap: 16rpx;
				flex: 1;
				min-width: 0;

				.input-group {
					display: flex;
					align-items: center;
					gap: 16rpx;
					flex: 1;
					min-width: 0;

					text {
						color: #fff;
						font-size: 28rpx;
						font-weight: 500;
						white-space: nowrap;
					}

					.warehouse-input {
						flex: 1;
						min-width: 0;
						background: rgba(255, 255, 255, 0.2);
						border-radius: 16rpx;
						padding: 16rpx 20rpx;

						::v-deep .uni-easyinput__content {
							background: transparent !important;
							padding: 0 !important;
							height: auto !important;
							min-height: auto !important;
						}

						::v-deep .uni-easyinput__content-input {
							font-size: 28rpx;
							color: #fff;
						}

						::v-deep .uni-easyinput__placeholder-class {
							color: rgba(255, 255, 255, 0.85);
						}
					}
				}

				text {
					color: #fff;
					font-size: 28rpx;
					font-weight: 500;
				}
			}

			.right {
				background: rgba(255, 255, 255, 0.2);
				padding: 12rpx 24rpx;
				border-radius: 32rpx;
				display: flex;
				align-items: center;
				gap: 8rpx;

				text {
					color: #fff;
					font-size: 24rpx;
				}

				&:active {
					background: rgba(255, 255, 255, 0.3);
				}
			}
		}

				.table-wrapper {
			padding: 20rpx;

			.table-body {
				max-height: 480rpx;
			}

			.table-row {
				display: flex;
				align-items: center;
				padding: 20rpx 16rpx;
				border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);

				&.table-header {
					background: #f8f9fb;
					border-radius: 12rpx;
					font-weight: bold;

					.table-cell {
						color: #667eea;
						font-size: 26rpx;
					}
				}

				&:not(.table-header) {
					&:active {
						background: rgba(255, 255, 255, 0.3);
					}

					&.active {
						background: rgba(255, 255, 255, 0.4);
						border-left: 4rpx solid #667eea;
					}

					.table-cell {
						color: #333;
					}
				}

				.table-cell {
					font-size: 26rpx;
					padding: 0 8rpx;
					word-break: break-all;

					&.highlight {
						font-weight: bold;
						color: #667eea;
					}

					&.success {
						font-weight: bold;
						color: #52c41a;
					}
				}
			}
		}

		.empty-state {
			padding: 80rpx 40rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 20rpx;

			text {
				font-size: 28rpx;
				color: #999;
			}
		}
	}

	.warehouse-detail {
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

		.header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.left {
				display: flex;
				align-items: center;
				gap: 12rpx;

				.title {
					font-size: 28rpx;
					font-weight: 500;
					color: #fff;
				}

				.count {
					font-size: 24rpx;
					color: rgba(255, 255, 255, 0.8);
				}
			}

			.refresh-btn {
				padding: 8rpx;
				border-radius: 50%;
				transition: all 0.3s;

				&:active {
					opacity: 0.6;
					transform: scale(0.95);
				}
			}
		}

		.detail-list {
			padding: 20rpx;
		}

		.detail-card {
			background: #f8f9fb;
			border-radius: 16rpx;
			padding: 24rpx;
			margin-bottom: 16rpx;
			border: 2rpx solid #e8eaf0;

			&:last-child {
				margin-bottom: 0;
			}

			.detail-row-group {
				display: flex;
				gap: 20rpx;
				margin-bottom: 12rpx;

				&:last-child {
					margin-bottom: 0;
				}

				.detail-row {
					flex: 1;
					display: flex;
					align-items: center;

					.label {
						font-size: 24rpx;
						color: #999;
						min-width: 100rpx;
					}

					.value {
						font-size: 26rpx;
						color: #333;
						font-weight: 500;
						flex: 1;
						word-break: break-all;
					}
				}
			}
		}

		.empty-state {
			padding: 80rpx 40rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 20rpx;

			text {
				font-size: 28rpx;
				color: #999;
			}
		}
	}

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
			height: 96rpx;
			border-radius: 48rpx;
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

			&.primary {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
				box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
				}
			}

			&:not(.disabled) {
				&:active {
					transform: translateY(2rpx);
				}
			}

			&.disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}
</style>
