<template>
	<view class="ware-house-container">
		<!-- 模式选择页面 -->
		<view class="mode-selector" v-if="!unshelvingMode">
			<view class="mode-header">
				<text class="mode-title">请选择下架方式</text>
			</view>
			<view class="mode-list">
				<view class="mode-item" @click="onModeSwitch('normal')">
					<uni-icons type="list" color="#667eea" size="28"></uni-icons>
					<text>货物下架</text>
				</view>
				<view class="mode-item" @click="onModeSwitch('smart')">
					<uni-icons type="list" color="#52c41a" size="28"></uni-icons>
					<text>智能货架下架</text>
				</view>
			</view>
		</view>

		<!-- 正常页面内容 -->
		<view class="box-body" v-else>
			<!-- 单据扫码区 -->
			<view class="section-card">
				<view class="card-header">
					<view class="header-left">
						<uni-icons type="paperplane-filled" color="#fff" size="18"></uni-icons>
						<text class="header-title">单据扫码</text>
					</view>
				</view>
				<view class="card-content">
					<view class="input-row">
						<view class="input-group">
							<uni-icons type="paperplane" color="#667eea" size="18"></uni-icons>
							<uni-easyinput
								v-model="formCode"
								:inputBorder="false"
								placeholderStyle="color: #999;"
								placeholder="请扫描或输入单据号"
								@confirm="onFormCodeConfirm"
								class="main-input"
							></uni-easyinput>
						</view>
						<view class="scan-btn" @click="onFormCodeScan">
							<uni-icons type="scan" color="#fff" size="16"></uni-icons>
							<text>扫码</text>
						</view>
					</view>
					<!-- 订单信息 -->
					<view class="order-info" v-if="orderLoaded">
						<view class="table-wrapper">
							<view class="table-row table-header">
								<view class="table-cell" style="flex: 1.5;">标签码</view>
								<view class="table-cell" style="flex: 1.5;">料号</view>
								<view class="table-cell" style="flex: 2;">物料名称</view>
								<view class="table-cell" style="flex: 1;">数量</view>
								<view class="table-cell" style="flex: 1;">状态</view>
							</view>
							<view class="table-row"
								v-for="item in materialList"
								:key="item.labelCode"
								:class="{ 
									active: unshelvingMode === 'normal' && selectedIndex === item.labelCode,
									clickable: unshelvingMode === 'normal' 
								}"
								@click="onRowSelect(item)"
							>
								<view class="table-cell" style="flex: 1.5;">{{item.labelCode || '--'}}</view>
								<view class="table-cell" style="flex: 1.5;">{{item.materialCode || '--'}}</view>
								<view class="table-cell" style="flex: 2;">{{item.materialName || '--'}}</view>
								<view class="table-cell highlight" style="flex: 1;">{{item.number || '--'}}</view>
								<view class="table-cell" style="flex: 1;" :class="item.finishFlag == -1 ? 'text-warn' : 'text-success'">
									{{item.finishFlag == -1 ? '未上架' : '已上架'}}
								</view>
							</view>
						</view>
					</view>
					<view class="empty-info" v-if="!orderLoaded && formCode">
						<text class="empty-text">点击扫码或按回车键查询单据</text>
					</view>
				</view>
			</view>

			<!-- 货物下架子组件 -->
			<NormalUnshelving
				v-if="unshelvingMode === 'normal' && selectedItem"
				ref="normalChild"
				:formCode="formCode"
				:selectedItem="selectedItem"
				@success="onChildSuccess"
			></NormalUnshelving>

			<!-- 智能货架下架子组件 -->
			<SmartUnshelving
				v-if="unshelvingMode === 'smart' && orderLoaded"
				ref="smartChild"
				:formCode="formCode"
				@success="onChildSuccess"
			></SmartUnshelving>
		</view>

		<!-- 加载遮罩 -->
		<view class="loading-mask" v-if="isLoading">
			<view class="loading-content">
				<uni-icons type="spinner-cycle" size="40" color="#667eea" class="loading-icon"></uni-icons>
				<text class="loading-text">加载中...</text>
			</view>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import goodsShelvingApi from '/api/warehouse/goodsShelving.js'
	import showBeautyToast from '@/common/beautyToast.js'
	import NormalUnshelving from './components/NormalUnshelving.vue'
	import SmartUnshelving from './components/SmartUnshelving.vue'

	export default {
		components: { NormalUnshelving, SmartUnshelving },
		data() {
			return {
			// 模式：空=未选择, normal=货物下架, smart=智能货架下架
			unshelvingMode: '',

				// 单据号
				formCode: '',
				materialList: [],
				orderLoaded: false,

				// 选中行（仅货物下架模式使用）
				selectedIndex: '',
				selectedItem: null,

				// 状态
				isLoading: false
			}
		},
		onLoad() {
			const _this = this;
			// 硬件扫码枪监听
			// #ifdef APP-PLUS
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan');
					uni.$on('scan', function(code) {
						if (!_this.orderLoaded || !_this.formCode) {
							// 未加载单据时，扫码作为单据号
							_this.formCode = code;
							_this.loadOrder();
						} else if (_this.unshelvingMode === 'normal' && _this.selectedItem) {
							// 货物下架模式：有选中行，扫码作为货架码
							const child = _this.$refs.normalChild;
							if (child) {
								child.setStorageCode(code);
							}
						} else if (_this.unshelvingMode === 'smart') {
							// 智能下架模式：扫码作为货架码
							const child = _this.$refs.smartChild;
							if (child) {
								child.setStorageCode(code);
							}
						}
					});
				}
			});
			// #endif
		},
		destroyed: function() {
			// #ifdef APP-PLUS
			plus.key.removeEventListener('keydown');
			// #endif
		},
		methods: {
			// 模式切换
			onModeSwitch(mode) {
				this.unshelvingMode = mode;
				// 切换模式时重置所有状态
				this.formCode = '';
				this.materialList = [];
				this.orderLoaded = false;
				this.selectedIndex = '';
				this.selectedItem = null;
			},

			// 单据号扫码
			onFormCodeScan() {
				const _this = this;
				scanCode().then(code => {
					_this.formCode = code;
					_this.loadOrder();
				}).catch(err => {
					showBeautyToast({ title: err || '扫码失败', icon: 'none' });
				});
			},

			// 单据号回车确认
			onFormCodeConfirm() {
				if (this.formCode) {
					this.loadOrder();
				}
			},

			// 加载单据信息
			loadOrder() {
				if (!this.formCode) {
					showBeautyToast({ title: '请输入单据号', icon: 'none' });
					return;
				}
				this.isLoading = true;
				this.orderLoaded = false;
				this.materialList = [];
				this.selectedIndex = '';
				this.selectedItem = null;
				goodsShelvingApi.getByFormCode(this.formCode).then(resp => {
					this.isLoading = false;
					if (resp.code == 200 || resp.code == '200') {
						const data = resp.data;
						if (Array.isArray(data) && data.length > 0) {
							this.materialList = data;
							this.orderLoaded = true;
						} else {
							showBeautyToast({ title: '未查询到单据信息', icon: 'none' });
						}
					} else {
						showBeautyToast({ title: resp.msg || '查询失败', icon: 'none' });
					}
				}).catch(() => {
					this.isLoading = false;
					showBeautyToast({ title: '查询失败', icon: 'none' });
				});
			},

			// 选中行（仅货物下架模式生效）
			onRowSelect(item) {
				if (this.unshelvingMode !== 'normal') return;
				if (this.selectedIndex === item.labelCode) {
					// 取消选中
					this.selectedIndex = '';
					this.selectedItem = null;
				} else {
					this.selectedIndex = item.labelCode;
					this.selectedItem = item;
				}
			},

			// 子组件操作成功后，重新加载单据
			onChildSuccess() {
				this.loadOrder();
			}
		}
	}
</script>

<style scoped>
	.ware-house-container {
		min-height: 100vh;
		background: #f5f7fa;
		padding-bottom: 140rpx;
	}

	.box-body {
		padding: 20rpx;
	}

	/* ========== 模式选择页面 ========== */
	.mode-selector {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		padding: 40rpx 30rpx;
	}

	.mode-header {
		margin-bottom: 60rpx;
	}

	.mode-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.mode-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.mode-item {
		background: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.mode-item text {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
	}

	.mode-item:active {
		background: #f5f7fa;
		transform: scale(0.98);
	}

	/* ========== 卡片通用 ========== */
	.section-card {
		background: #fff;
		border-radius: 24rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.card-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.header-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #fff;
	}

	.card-content {
		padding: 24rpx 30rpx;
	}

	/* ========== 输入行 ========== */
	.input-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.input-group {
		flex: 1;
		display: flex;
		align-items: center;
		background: #f5f7fa;
		border-radius: 16rpx;
		padding: 0 16rpx;
		border: 2rpx solid #e8eaf0;
		transition: border-color 0.2s;
	}

	.input-group:focus-within {
		border-color: #667eea;
	}

	.main-input {
		flex: 1;
	}

	.scan-btn {
		display: flex;
		align-items: center;
		gap: 6rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: #fff;
		font-size: 24rpx;
		padding: 18rpx 24rpx;
		border-radius: 32rpx;
		flex-shrink: 0;
		box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.35);
	}

	.scan-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.25);
	}

	/* ========== 单据信息表格 ========== */
	.order-info {
		margin-top: 20rpx;
	}

	.table-wrapper {
		padding: 0;
	}

	.table-row {
		display: flex;
		align-items: center;
		padding: 16rpx 8rpx;
		border-bottom: 1rpx solid #f0f0f0;
		transition: background 0.2s;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-header {
		background: #f8f9fb;
		border-radius: 12rpx;
		font-weight: bold;
	}

	.table-header .table-cell {
		color: #667eea;
		font-size: 26rpx;
	}

	.table-row.clickable:active {
		background: #f5f7fa;
	}

	.table-row.active {
		background: #e6f0ff;
		border-left: 4rpx solid #667eea;
	}

	.table-cell {
		font-size: 24rpx;
		color: #333;
		padding: 0 8rpx;
		word-break: break-all;
	}

	.highlight {
		font-weight: bold;
		color: #667eea;
	}

	.text-warn {
		color: #faad14;
		font-weight: bold;
	}

	.text-success {
		color: #52c41a;
		font-weight: bold;
	}

	.empty-info {
		margin-top: 20rpx;
		text-align: center;
		padding: 30rpx 0;
	}

	.empty-text {
		font-size: 24rpx;
		color: #999;
	}

	/* ========== 加载遮罩 ========== */
	.loading-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: #fff;
		border-radius: 20rpx;
		padding: 40rpx 60rpx;
		gap: 16rpx;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}

	.loading-text {
		font-size: 26rpx;
		color: #666;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
