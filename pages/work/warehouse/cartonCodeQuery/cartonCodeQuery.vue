<template>
	<view class="carton-query-container">
		<view class="box-header">
			<view class="icon"></view>
			<text class="title">箱码查询</text>
		</view>
		<view class="box-body">
			<!-- 箱码输入区域 -->
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<uni-icons type="home" color="#fff" size="18"></uni-icons>
						<text>箱码：{{packingCode || '待输入'}}</text>
					</view>
					<view class="right">
						<view class="action-btn scan-btn" @click="onScanPackingCode">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>请扫描</text>
						</view>
					</view>
				</view>
				<view class="search-box">
					<input
						class="search-input"
						v-model="packingInput"
						placeholder="请输入箱码后按回车查询"
						@confirm="onPackingInputConfirm"
					/>
					<view class="search-btn" @click="onScanPackingCode">
						<uni-icons type="scan" color="#fff" size="18"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 查询结果展示 -->
			<view class="warehouse-info" v-if="queryResult.length > 0">
				<view class="header">
					<view class="left">
						<uni-icons type="list" color="#fff" size="18"></uni-icons>
						<text class="title">查询结果</text>
					</view>
					<view class="right result-count">
						<text>共 {{queryResult.length}} 条记录</text>
					</view>
				</view>
				<view class="table-wrapper">
					<view class="table-row table-header">
						<view class="table-cell" style="flex: 1.2;">料号</view>
						<view class="table-cell" style="flex: 1.5;">物料名称</view>
						<view class="table-cell" style="flex: 0.8;">数量</view>
						<view class="table-cell" style="flex: 0.6;">单位</view>
						<view class="table-cell" style="flex: 1.2;">批次号</view>
						<view class="table-cell" style="flex: 1.2;">工单号</view>
						<view class="table-cell" style="flex: 1;">储位</view>
					</view>
					<view class="table-row" v-for="(item, index) in queryResult" :key="index">
						<view class="table-cell" style="flex: 1.2;">{{item.materialCode}}</view>
						<view class="table-cell" style="flex: 1.5;">{{item.materialName}}</view>
						<view class="table-cell highlight" style="flex: 0.8;">{{item.number}}</view>
						<view class="table-cell" style="flex: 0.6;">{{item.unit}}</view>
						<view class="table-cell" style="flex: 1.2;">{{item.batchCode}}</view>
						<view class="table-cell" style="flex: 1.2;">{{item.worksheetCode}}</view>
						<view class="table-cell" style="flex: 1;">{{item.warehouseAreaCode}}</view>
					</view>
				</view>
				<!-- 卡片式布局 - 窄屏友好 -->
				<view class="card-list">
					<view class="card-item" v-for="(item, index) in queryResult" :key="'card-' + index">
						<view class="card-row">
							<text class="card-label">料号</text>
							<text class="card-value">{{item.materialCode}}</text>
						</view>
						<view class="card-row">
							<text class="card-label">物料名称</text>
							<text class="card-value">{{item.materialName}}</text>
						</view>
						<view class="card-row">
							<text class="card-label">数量</text>
							<text class="card-value highlight">{{item.number}} {{item.unit}}</text>
						</view>
						<view class="card-row">
							<text class="card-label">批次号</text>
							<text class="card-value">{{item.batchCode || '-'}}</text>
						</view>
						<view class="card-row">
							<text class="card-label">工单号</text>
							<text class="card-value">{{item.worksheetCode || '-'}}</text>
						</view>
						<view class="card-row">
							<text class="card-label">储位</text>
							<text class="card-value">{{item.warehouseAreaCode || '-'}}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="warehouse-info" v-else-if="hasSearched">
				<view class="empty-state">
					<template v-if="loading">
						<view class="loading-spinner"></view>
						<text>查询中...</text>
					</template>
					<template v-else>
						<view class="empty-icon-wrapper">
							<uni-icons type="list" size="64" color="#e0e0e0"></uni-icons>
						</view>
						<text>暂无查询结果</text>
						<text class="sub-text">请输入正确的箱码进行查询</text>
					</template>
				</view>
			</view>

			<!-- 未搜索状态 -->
			<view class="warehouse-info" v-else>
				<view class="empty-state">
					<view class="empty-icon-wrapper">
						<uni-icons type="search" size="64" color="#e0e0e0"></uni-icons>
					</view>
					<text>请输入箱码进行查询</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import { getStorageDetailByCode } from '/api/warehouse/ctuCartonPicking';
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				packingCode: '', // 箱码
				packingInput: '', // 箱码输入
				queryResult: [], // 查询结果列表
				loading: false, // 加载状态
				hasSearched: false // 是否已搜索
			}
		},
		onLoad() {
			// 监听扫码枪
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan')
					uni.$on('scan', function(code) {
						_this.handleScanCode(code);
					})
				}
			})
		},
		destroyed: function() {
			plus.key.removeEventListener('keydown');
		},
		methods: {
			// 扫描箱码
			onScanPackingCode: function() {
				const _this = this;
				scanCode().then((code) => {
					_this.packingCode = code;
					_this.queryCartonInfo();
				}).catch(err => {
					showBeautyToast({
						title: err,
						icon: 'warn'
					})
				});
			},

			// 箱码手动输入确认
			onPackingInputConfirm: function() {
				const code = this.packingInput.trim();
				this.packingInput = ''; // 回车后清空输入框
				if (!code) {
					showBeautyToast({
						title: '请输入箱码',
						icon: 'warn'
					});
					return;
				}
				this.packingCode = code;
				this.queryCartonInfo();
			},

			// 处理扫码枪扫描
			handleScanCode: function(code) {
				this.packingCode = code;
				this.queryCartonInfo();
			},

			// 查询箱码信息
			queryCartonInfo: async function() {
				if (!this.packingCode || !this.packingCode.trim()) {
					return;
				}

				this.hasSearched = true;
				this.loading = true;
				this.queryResult = [];

				try {
					const resp = await getStorageDetailByCode(this.packingCode.trim());
					console.log('箱码查询结果:', resp);
					this.loading = false;

					if (resp.code == 200) {
						this.queryResult = resp.data || [];
						if (this.queryResult.length === 0) {
							showBeautyToast({
								title: '暂无查询结果',
								icon: 'warn'
							});
						}
					} else {
						showBeautyToast({
							title: resp.msg || '查询失败',
							icon: 'error'
						});
					}
				} catch (error) {
					this.loading = false;
					console.error(error);
					showBeautyToast({
						title: '查询失败,请重试',
						icon: 'error'
					});
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.carton-query-container {
		background: #f5f7fa;
		min-height: 100vh;
		padding-bottom: 30rpx;
	}

	.box-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 40rpx 30rpx;
		text-align: center;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			width: 200rpx;
			height: 200rpx;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 50%;
			top: -50rpx;
			right: -50rpx;
		}

		.icon {
			margin-bottom: 20rpx;
		}

		.title {
			font-size: 36rpx;
			font-weight: bold;
			color: #fff;
			text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
		}
	}

	.box-body {
		padding: 30rpx;
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

			.left {
				display: flex;
				align-items: center;
				gap: 16rpx;

				.title {
					color: #fff;
					font-size: 28rpx;
					font-weight: bold;
				}

				text {
					color: #fff;
					font-size: 28rpx;
					font-weight: 500;
				}
			}

			.right {
				display: flex;
				gap: 12rpx;

				.action-btn {
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

					&.scan-btn {
						background: rgba(102, 126, 234, 0.6);
					}
				}

				.result-count {
					background: rgba(255, 255, 255, 0.2);
					padding: 8rpx 16rpx;
					border-radius: 16rpx;

					text {
						color: #fff;
						font-size: 24rpx;
					}
				}
			}
		}

		.search-box {
			padding: 30rpx;
			display: flex;
			align-items: center;
			gap: 16rpx;
			border-bottom: 1rpx solid #f0f0f0;

			.search-input {
				flex: 1;
				padding: 24rpx;
				border: 2rpx solid #e0e0e0;
				border-radius: 12rpx;
				font-size: 28rpx;
				background: #fff !important;
				color: #333;

				&:focus {
					border-color: #667eea;
					box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
				}
			}

			.search-btn {
				width: 80rpx;
				height: 80rpx;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				border-radius: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				&:active {
					transform: scale(0.95);
					opacity: 0.9;
				}
			}
		}

		.table-wrapper {
			padding: 20rpx;

			.table-row {
				display: flex;
				align-items: center;
				padding: 20rpx 16rpx;
				border-bottom: 1rpx solid #f0f0f0;

				&.table-header {
					background: #f8f9fb;
					border-radius: 12rpx;
					font-weight: bold;

					.table-cell {
						color: #667eea;
						font-size: 26rpx;
					}
				}

				.table-cell {
					font-size: 26rpx;
					padding: 0 8rpx;
					word-break: break-all;
					color: #333;
					min-width: 0;
					overflow: hidden;
					text-overflow: ellipsis;

					&.highlight {
						font-weight: bold;
						color: #667eea;
					}
				}
			}
		}

		.card-list {
			display: none; // 默认隐藏,在窄屏时显示
		}

		// 窄屏适配
		@media screen and (max-width: 768px) {
			.table-wrapper {
				display: none; // 隐藏表格
			}

			.card-list {
				display: block; // 显示卡片列表
				padding: 20rpx;
			}

			.card-item {
				background: #f8f9fb;
				border-radius: 16rpx;
				padding: 24rpx;
				margin-bottom: 20rpx;
				border: 1rpx solid #e0e0e0;

				.card-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 16rpx 0;
					border-bottom: 1rpx solid #e0e0e0;

					&:last-child {
						border-bottom: none;
						padding-bottom: 0;
					}

					.card-label {
						font-size: 26rpx;
						color: #999;
						font-weight: 500;
						flex-shrink: 0;
						width: 140rpx;
					}

					.card-value {
						font-size: 28rpx;
						color: #333;
						text-align: right;
						flex: 1;
						word-break: break-all;
						margin-left: 16rpx;

						&.highlight {
							font-weight: bold;
							color: #667eea;
						}
					}
				}
			}
		}

		.empty-state {
			padding: 100rpx 40rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 24rpx;

			.empty-icon-wrapper {
				width: 140rpx;
				height: 140rpx;
				background: #f8f9fb;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 10rpx;
				border: 2rpx dashed #e0e0e0;
			}

			text {
				font-size: 30rpx;
				color: #606266;
				font-weight: 500;

				&.sub-text {
					font-size: 26rpx;
					color: #909399;
					font-weight: normal;
				}
			}

			.loading-spinner {
				width: 60rpx;
				height: 60rpx;
				border: 6rpx solid #f3f3f3;
				border-top: 6rpx solid #667eea;
				border-radius: 50%;
				animation: spin 1s linear infinite;
			}
		}
	}
</style>
