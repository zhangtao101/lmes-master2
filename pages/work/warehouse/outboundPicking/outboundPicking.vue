<template>
	<view class="ware-house-container">
		<!-- 楼层选择页面 -->
		<view class="floor-selector" v-if="!lcCode">
			<view class="floor-header">
				<text class="floor-title">请选择楼层</text>
			</view>
			<view class="floor-list">
				<view class="floor-item" @click="selectFloor(1)">
					<text>7#4F</text>
				</view>
				<view class="floor-item" @click="selectFloor(2)">
					<text>7#3F</text>
				</view>
				<view class="floor-item" @click="selectFloor(3)">
					<text>3#3F</text>
				</view>
			</view>
		</view>
		<!-- 正常页面内容 -->
		<view class="box-body" v-else>
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<view class="input-group">
							<uni-icons type="home" color="#fff" size="18"></uni-icons>
							<text>单号：</text>
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
						<text>请扫描</text>
					</view>
				</view>
				<view class="table-wrapper" v-if="rows && rows.length > 0">
					<view class="table-row table-header">
						<view class="table-cell" style="flex: 1.5;">料号</view>
						<view class="table-cell" style="flex: 2;">物料名称</view>
						<view class="table-cell" style="flex: 1;">单据数量</view>
						<view class="table-cell" style="flex: 1;">已出库数量</view>
					</view>
					<view class="table-row" v-for="(row, index) in rows" :key="index"
						:class="{ active: formDetailId === row.id }" @click="tTableClick({ row })">
						<view class="table-cell" style="flex: 1.5;">{{row.materialCode}}</view>
						<view class="table-cell" style="flex: 2;">{{row.materialName}}</view>
						<view class="table-cell highlight" style="flex: 1;">{{row.number}}</view>
						<view class="table-cell success" style="flex: 1;">{{row.stockNumber}}</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
					<text>{{spin.code ? '加载中...' : '暂无数据'}}</text>
				</view>
			</view>
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose" color="#fff" size="16"></uni-icons>
						<text class="title">货架明细</text>
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
								<text class="label">货架号：</text>
								<text class="value">{{detail.rqCode || '--'}}</text>
							</view>
							<view class="detail-row">
								<text class="label">货架储位：</text>
								<text class="value">{{detail.storageCode || '--'}}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">所在地码：</text>
								<text class="value">{{detail.locationCode || '--'}}</text>
							</view>
							<view class="detail-row">
								<text class="label">数量：</text>
								<text class="value">{{detail.number || '--'}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
					<text>暂无货架明细</text>
				</view>
			</view>
		</view>
		<view class="button-wrapper" v-if="lcCode">
			<!-- 上面一排：同步单据、单据审核 -->
			<view class="button-row">
				<button class="action-btn" :class="{ disabled: !wareLocationCode }" @click="syncFormCode">
					<uni-icons type="loop" size="18"></uni-icons>
					<text>同步单据</text>
				</button>
				<button class="action-btn warn" :class="{ disabled: !rows || rows.length === 0 }" @click="auditWarehouseRecord">
					<uni-icons type="checkmarkempty" size="18"></uni-icons>
					<text>单据审核</text>
				</button>
			</view>
			<!-- 下面一排：呼叫AGV、拣货作业 -->
			<view class="button-row">
				<button class="action-btn" :class="{ disabled: !formDetailId }" @click="callAGV">
					<uni-icons type="paperplane" size="18"></uni-icons>
					<text>呼叫AGV</text>
				</button>
				<button class="action-btn primary" :class="{ disabled: !formDetailId }" @click="onSubmit">
					<uni-icons type="arrowright" size="18"></uni-icons>
					<text>拣货作业</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import material from '/api/warehouse/material';
	import zeroLoading from '@/uni_modules/zero-loading/components/zero-loading/zero-loading.vue';
	import {
		getCodeType
	} from '/common/util.js'
	import showBeautyToast from '@/common/beautyToast.js'


	export default {
		data() {
			return {
				lcCode: '',
				wareLocationCode: '',
				warehouse: {},
				details: [],
				scanValue: "",
				columns: [{
					title: '料号',
					field: 'materialCode'
				}, {
					title: '物料名称',
					field: 'materialName'
				}, {
					title: '单据数量',
					field: 'number',
				}, {
					title: '已入数量',
					field: 'stockNumber',
				}],
				rows: undefined,
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
								title: "标签无效！",
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
			selectFloor: function(floor) {
				this.lcCode = floor;
			},
			onManualInput: function() {
				if (this.wareLocationCode) {
					this.loadWarehouseInfo(this.wareLocationCode);
				}
			},
			loadWarehouseInfo: async function(code) {
				this.wareLocationCode = code;
				this.spin.code = true;
				const resp = await material.listFormDetail({
					formCode: this.wareLocationCode
				});
				this.spin.code = false;
				if (resp.code == 200) {
					this.rows = resp.data;
				} else {
					showBeautyToast({
						title: resp.msg,
						icon: 'error'
					})
				}
			},
			onLocationScan: function() {
				const _this = this;
				// _this.loadWarehouseInfo("KQ001-1");
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
						title: '请先选择入库项',
						icon: 'warn'
					});
					return;
				}
				uni.navigateTo({
					url: '/pages/work/warehouse/operationPage/operationPage?formDetailId=' + this.formDetailId +'&type=-1'
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
				const resp = await material.listContainerDetail({
					formDetailId: this.formDetailId
				});
				if (resp.code == 200) {
					const {
						shelfDtos
					} = resp.data;
					this.details = [];
					if (shelfDtos) {
						this.details = [
							...shelfDtos,
						];
					}
					} else {
						showBeautyToast({
							title: resp.msg,
							icon: 'error'
						})
					}
			},
			callAGV: async function() {
				if (!this.formDetailId) {
					showBeautyToast({
						title: '请先选择入库项',
						icon: 'warn'
					});
					return;
				}
			const resp = await material.submitContainer({
				formDetailId: this.formDetailId,
				lcCode: this.lcCode,
			})
				if (resp.code == 200) {
					console.log(resp.data)
					this.queryDetails();
					showBeautyToast({
						title: resp.msg,
						icon: 'success'
					})
				} else {
					showBeautyToast({
						title: resp.msg,
						icon: 'error'
					})
				}
			},
			// 同步单据
			syncFormCode: async function() {
				if (!this.wareLocationCode) {
					showBeautyToast({
						title: '请输入单据号',
						icon: 'warn'
					});
					return;
				}

				const resp = await material.syncFormCode({
					formCode: this.wareLocationCode
				});
				if (resp.code == 200) {
					showBeautyToast({
						title: '同步单据成功',
						icon: 'success'
					});
					// 同步成功后重新加载单据信息
					this.loadWarehouseInfo(this.wareLocationCode);
				} else {
					showBeautyToast({
						title: resp.msg || '同步单据失败',
						icon: 'error'
					});
				}
			},
			// 单据审核
			auditWarehouseRecord: async function() {
				if (!this.rows || this.rows.length === 0) {
					showBeautyToast({
						title: '请先查询单据',
						icon: 'warn'
					});
					return;
				}

				// 判断是否需要二次确认
				const needConfirm = this.rows.some(row => row.number != row.stockNumber);

				if (needConfirm) {
					// 需要二次确认
					const _this = this;
					uni.showModal({
						title: '确认审核',
						content: '存在单据数量不等于已出库数量的数据，确认要通过审核吗？',
						confirmText: '确认通过',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								_this.doAudit(1); // 1表示通过
							}
						}
					});
				} else {
					// 直接调用审核接口
					this.doAudit(1); // 1表示通过
				}
			},
			// 执行审核操作
			doAudit: async function(auditState) {
				const resp = await material.auditWarehouseRecord({
					auditState: auditState,
					formId: this.getFormId()
				});
				if (resp.code == 200) {
					showBeautyToast({
						title: '审核成功',
						icon: 'success'
					});
					// 审核成功后清空单号信息
					this.clearFormInfo();
				} else {
					showBeautyToast({
						title: resp.msg || '审核失败',
						icon: 'error'
					});
				}
			},
			// 清空单号信息
			clearFormInfo: function() {
				this.wareLocationCode = '';
				this.rows = undefined;
				this.details = [];
				this.formDetailId = '';
				this.warehouse = {};
			},
			// 获取单据ID
			getFormId: function() {
				return this.rows && this.rows.length > 0 ? this.rows[0].formId || this.rows[0].id : '';
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

	.floor-selector {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding: 40rpx 30rpx;

		.floor-header {
			margin-bottom: 60rpx;

			.floor-title {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
			}
		}

		.floor-list {
			display: flex;
			flex-direction: column;
			gap: 24rpx;

			.floor-item {
				background: #fff;
				border-radius: 24rpx;
				padding: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

				text {
					font-size: 32rpx;
					font-weight: 500;
					color: #667eea;
				}

				&:active {
					background: #f5f7fa;
					transform: scale(0.98);
				}
			}
		}
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
					}

					&.success {
						font-weight: bold;
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
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);

		.button-row {
			display: flex;
			gap: 20rpx;
		}

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

			&.warn {
				background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
				color: #fff;
				box-shadow: 0 8rpx 24rpx rgba(250, 173, 20, 0.3);

				&:active {
					transform: translateY(2rpx);
					box-shadow: 0 4rpx 16rpx rgba(250, 173, 20, 0.3);
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