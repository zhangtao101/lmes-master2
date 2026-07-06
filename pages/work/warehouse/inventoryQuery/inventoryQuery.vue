<template>
	<view class="warehouse-common-container">
		<view class="warehouse-common-box-body">
			<!-- Tab 切换：单号 / 料号 -->
			<view class="query-tab-bar">
				<view class="tab-item" :class="{ active: queryType === 'formCode' }" @click="switchTab('formCode')">
					<text>单号查询</text>
				</view>
				<view class="tab-item" :class="{ active: queryType === 'materialCode' }" @click="switchTab('materialCode')">
					<text>料号查询</text>
				</view>
			</view>

			<!-- 单号/料号输入框 + 扫码 -->
			<view class="warehouse-common-info">
				<view class="header">
					<view class="left">
						<uni-icons custom-prefix="iconfont" type="icon-tiaoxingma" color="#fff" size="18"></uni-icons>
						<text>{{ queryType === 'formCode' ? '单号' : '料号' }}</text>
					</view>
				</view>
				<view class="scan-input-row">
					<input class="scan-input" v-model="queryInput" :placeholder="queryType === 'formCode' ? '请输入或扫描单号' : '请输入或扫描料号'" @confirm="onInputConfirm" />
					<view class="clear-btn" v-if="queryInput" @click="queryInput = ''">
						<uni-icons type="clear" color="#999" size="18"></uni-icons>
					</view>
					<view class="scan-btn" @click="onScan">
						<uni-icons type="scan" color="#fff" size="16"></uni-icons>
					</view>
				</view>
			</view>

			<!-- 查询结果列表 -->
			<view class="warehouse-common-detail" v-if="results && results.length > 0">
				<view class="header">
					<view class="left">
						<uni-icons type="compose" color="#fff" size="18"></uni-icons>
						<text class="title">库存明细（{{ results.length }}条）</text>
					</view>
				</view>
				<view class="detail-list">
					<view class="detail-card" v-for="(item, index) in results" :key="index">
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">货架储位码</text>
								<text class="value">{{ item.storageCode }}</text>
							</view>
							<view class="detail-row">
								<text class="label">地码</text>
								<text class="value">{{ item.locationCode }}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">货架号</text>
								<text class="value">{{ item.rqCode }}</text>
							</view>
							<view class="detail-row">
								<text class="label">料号</text>
								<text class="value">{{ item.materialCode }}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">标签号</text>
								<text class="value">{{ item.labelCode }}</text>
							</view>
							<view class="detail-row">
								<text class="label">物料名称</text>
								<text class="value">{{ item.materialName }}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">批次号</text>
								<text class="value">{{ item.batchCode }}</text>
							</view>
							<view class="detail-row">
								<text class="label">数量</text>
								<text class="value">{{ item.number }}</text>
							</view>
						</view>
						<view class="detail-row-group">
							<view class="detail-row">
								<text class="label">状态</text>
								<text class="value" :class="{ 'status-in': item.status === 1, 'status-out': item.status === -1 }">{{ item.statusName }}</text>
							</view>
							<view class="detail-row"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="warehouse-common-empty-state" v-else-if="searched && (!results || results.length === 0)">
				<uni-icons type="search" size="48" color="#ccc"></uni-icons>
				<text>暂无数据</text>
			</view>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import inventoryQuery from '/api/warehouse/inventoryQuery.js'

	export default {
		data() {
			return {
				queryType: 'formCode',     // 查询类型：formCode / materialCode
				queryInput: '',            // 输入框内容
				results: [],               // 查询结果列表
				searched: false            // 是否已经查询过
			}
		},
		methods: {
			// 切换 Tab
			switchTab: function(type) {
				this.queryType = type;
				this.queryInput = '';
				this.results = [];
				this.searched = false;
			},

			// 扫码按钮点击
			onScan: function() {
				const _this = this;
				scanCode().then((code) => {
					_this.queryInput = code;
					_this.doQuery(code);
				}).catch(err => {
					uni.showToast({
						title: err,
						icon: 'none'
					})
				});
			},

			// 输入框回车确认
			onInputConfirm: function() {
				const code = this.queryInput.trim();
				if (code) {
					this.doQuery(code);
				}
			},

			// 执行查询
			doQuery: function(code) {
				const _this = this;
				let apiCall;

				if (this.queryType === 'formCode') {
					apiCall = inventoryQuery.listFormDetail(code);
				} else {
					apiCall = inventoryQuery.listByMaterialCode(code);
				}

				apiCall.then(function(resp) {
					if (resp.code == 200) {
						_this.results = resp.data || [];
						_this.searched = true;
						if (_this.results.length === 0) {
							uni.showToast({
								title: '未查询到数据',
								icon: 'none'
							})
						}
					} else {
						_this.results = [];
						_this.searched = true;
						uni.showToast({
							title: resp.msg || '查询失败',
							icon: 'none'
						})
					}
				}).catch(function() {
					_this.results = [];
					_this.searched = true;
					uni.showToast({
						title: '查询失败',
						icon: 'none'
					})
				});
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse-common.less";

	// Tab 切换栏
	.query-tab-bar {
		display: flex;
		background: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
		margin-bottom: 30rpx;

		.tab-item {
			flex: 1;
			text-align: center;
			padding: 28rpx 0;
			font-size: 28rpx;
			color: #666;
			position: relative;
			transition: all 0.3s;

			&.active {
				color: #667eea;
				font-weight: bold;

				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 60rpx;
					height: 6rpx;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border-radius: 3rpx;
				}
			}
		}
	}

	// 扫码输入行
	.scan-input-row {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		gap: 16rpx;
		background: rgba(255, 255, 255, 0.1);

		.scan-input {
			flex: 1;
			height: 72rpx;
			padding: 0 24rpx;
			background: #fff;
			border-radius: 12rpx;
			font-size: 28rpx;
			border: 2rpx solid #e8eaf0;
		}

		.clear-btn {
			width: 40rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}

		.scan-btn {
			width: 72rpx;
			height: 72rpx;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}
	}

	// 状态颜色
	.status-in {
		color: #52c41a !important;
	}

	.status-out {
		color: #faad14 !important;
	}
</style>
