<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon"></view>
			<text class="title">CTU纸箱拣货</text>
		</view>
		<view class="box-body">
			<!-- 箱码输入区域 -->
			<view class="warehouse-info">
				<view class="header">
					<view class="header-content">
						<view class="left">
							<uni-icons type="home" color="#fff" size="18"></uni-icons>
							<text>箱码：{{packingCode || '待输入'}}</text>
						</view>
						<view class="right">
							<view class="action-btn" @click="createLabel">
								<uni-icons type="settings" color="#fff" size="16"></uni-icons>
								<text>生成箱码</text>
							</view>
						</view>
					</view>
				</view>
			<view class="scan-input-row">
				<input class="scan-input" v-model="packingInput" placeholder="请输入或扫描箱码" @confirm="onPackingInputConfirm" />
				<view class="scan-btn" @click="onScanPackingCode">
					<uni-icons type="scan" color="#fff" size="16"></uni-icons>
				</view>
			</view>
			</view>

			<!-- 拣货详情表格 -->
			<view class="warehouse-info" v-if="packingCode">
				<view class="header">
					<view class="left">
						<uni-icons type="list" color="#fff" size="18"></uni-icons>
						<text class="title">拣货详情</text>
					</view>
					<view class="right refresh-btn" @click="reloadTable">
						<uni-icons type="refreshempty" color="#fff" size="16"></uni-icons>
					</view>
				</view>
				<view class="table-wrapper" v-if="rows && rows.length > 0">
					<view class="table-row table-header">
						<view class="table-cell" style="flex: 1.5;">料号</view>
						<view class="table-cell" style="flex: 2;">物料名称</view>
						<view class="table-cell" style="flex: 1;">数量</view>
					</view>
					<view class="table-row" v-for="(row, index) in rows" :key="index">
						<view class="table-cell" style="flex: 1.5;">{{row.materialCode}}</view>
						<view class="table-cell" style="flex: 2;">{{row.materialName}}</view>
						<view class="table-cell highlight" style="flex: 1;">{{row.number}}</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<template v-if="spin.code">
						<view class="loading-spinner"></view>
						<text>加载中...</text>
					</template>
					<template v-else>
						<view class="empty-icon-wrapper">
							<uni-icons type="list" size="64" color="#e0e0e0"></uni-icons>
						</view>
						<text>暂无拣货详情</text>
						<text class="sub-text">请扫描箱码获取数据</text>
					</template>
				</view>
			</view>

			<!-- 操作按钮区域 -->
			<view class="warehouse-info" v-if="packingCode">
				<view class="header">
					<view class="left">
						<uni-icons type="bars" color="#fff" size="18"></uni-icons>
						<text class="title">拣货操作</text>
					</view>
				</view>
				<view class="operation-buttons">
					<button class="operation-btn primary" @click="handlePickingAction">
						<uni-icons type="compose" size="18"></uni-icons>
						<text>拣货作业</text>
					</button>
					<button class="operation-btn danger" @click="finishPicking">
						<uni-icons type="checkmarkempty" size="18"></uni-icons>
						<text>完成拣货</text>
					</button>
				</view>
			</view>
		</view>

		<!-- 拣货操作弹窗 -->
		<uni-popup ref="pickingDrawer" type="bottom" :safe-area="false">
			<view class="drawer-content">
				<view class="drawer-header">
					<text class="drawer-title">拣货作业</text>
					<view class="close-btn" @click="closePickingDrawer">
						<uni-icons type="close" size="20" color="#fff"></uni-icons>
					</view>
				</view>
				<scroll-view scroll-y class="drawer-body">
					<view class="form-item">
						<text class="form-label">箱码</text>
						<input class="form-input" v-model="formData.packingCode" disabled />
					</view>
					<view class="form-item">
						<text class="form-label">是否有标签</text>
						<radio-group @change="onLabelTypeChange">
							<label class="radio-item">
								<radio value="1" :checked="formData.isLabel === 1" />
								<text>有</text>
							</label>
							<label class="radio-item">
								<radio value="0" :checked="formData.isLabel === 0" />
								<text>无</text>
							</label>
						</radio-group>
					</view>
					<!-- 有标签模式 -->
					<view class="form-item" v-if="formData.isLabel === 1">
						<text class="form-label">物料标签</text>
						<input class="form-input" v-model="formData.labelCode" placeholder="请输入标签码" @confirm="queryLabelInfo" />
					</view>
					<!-- 无标签模式 -->
					<view class="form-item" v-if="formData.isLabel === 0">
						<text class="form-label">料号</text>
						<view class="picker-wrapper" @click="showMaterialPicker">
							<input class="form-input" v-model="formData.materialName" placeholder="请选择物料" disabled />
							<uni-icons type="arrowdown" size="16" color="#999"></uni-icons>
						</view>
					</view>
					<view class="form-item">
						<text class="form-label">物料编码</text>
						<input class="form-input" v-model="formData.materialCode" disabled />
					</view>
					<view class="form-item">
						<text class="form-label">物料特征</text>
						<view class="feature-display">
							<input class="form-input" v-model="formData.materialDescription" placeholder="请选择物料特征" disabled />
							<button class="view-btn" @click="showFeatureDrawer">查看/选择</button>
						</view>
					</view>
					<view class="form-item">
						<text class="form-label">数量</text>
						<input class="form-input" v-model="formData.number" type="number" placeholder="请输入数量" />
					</view>
					<view class="form-item">
						<text class="form-label">单位</text>
						<input class="form-input" v-model="formData.unit" disabled />
					</view>
					<view class="form-item">
						<text class="form-label">工单号</text>
						<input class="form-input" v-model="formData.worksheetCode" placeholder="请输入工单号" />
					</view>
					<view class="form-item">
						<text class="form-label">班别</text>
						<input class="form-input" v-model="formData.classType" placeholder="请输入班别" />
					</view>
					<view class="form-item">
						<text class="form-label">线别</text>
						<input class="form-input" v-model="formData.lineType" placeholder="请输入线别" />
					</view>
					<view class="form-item">
						<text class="form-label">批次号</text>
						<input class="form-input" v-model="formData.batchCode" placeholder="请输入批次号" />
					</view>
				</scroll-view>
				<view class="drawer-footer">
					<button class="drawer-btn cancel" @click="closePickingDrawer">取消</button>
					<button class="drawer-btn confirm" @click="submitPicking">确认</button>
				</view>
			</view>
		</uni-popup>

		<!-- 物料选择弹窗 -->
		<uni-popup ref="materialPicker" type="bottom" :safe-area="false">
			<view class="drawer-content material-picker-drawer">
				<view class="drawer-header">
					<text class="drawer-title">物料选择</text>
					<view class="close-btn" @click="closeMaterialPicker">
						<uni-icons type="close" size="20" color="#fff"></uni-icons>
					</view>
				</view>
				<view class="search-box">
					<input
						class="search-input"
						v-model="materialSearchKeyword"
						placeholder="请输入料号或物料名称后按回车搜索"
						@confirm="onMaterialSearchConfirm"
					/>
				</view>
				<scroll-view scroll-y class="drawer-body">
					<view class="material-list">
						<view class="material-item" 
							v-for="(item, index) in filteredMaterialList" 
							:key="index"
							@click="selectMaterial(item)">
							<view class="material-code">{{item.materialCode}}</view>
							<view class="material-name">{{item.materialName}}</view>
						</view>
					</view>
					<view class="empty-state" v-if="filteredMaterialList.length === 0">
						<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
						<text>暂无匹配物料</text>
					</view>
				</scroll-view>
			</view>
		</uni-popup>

		<!-- 物料特征弹窗 -->
		<uni-popup ref="featureDrawer" type="bottom" :safe-area="false">
			<view class="drawer-content feature-drawer">
				<view class="drawer-header">
					<text class="drawer-title">物料特征选择</text>
					<view class="close-btn" @click="closeFeatureDrawer">
						<uni-icons type="close" size="20" color="#fff"></uni-icons>
					</view>
				</view>
				<scroll-view scroll-y class="drawer-body">
					<view class="feature-list">
						<view class="feature-item" 
							v-for="(item, index) in materialCharacteristics" 
							:key="index"
							:class="{ active: formData.materialDescriptionId === item.id }"
							@click="selectFeature(item)">
							<view class="feature-id">ID: {{item.id}}</view>
							<view class="feature-desc">{{formatDescription(item.description)}}</view>
						</view>
					</view>
					<view class="empty-state" v-if="materialCharacteristics.length === 0">
						<uni-icons type="inbox" size="60" color="#ccc"></uni-icons>
						<text>暂无物料特征</text>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import {
		getDetailByCode,
		getDetailByLabelCode,
		packingInfoCreate,
		productPackingStart,
		productPackingFinish,
		productPackingIn,
		materialFeatureGetByMaterialCodeWith,
		getByMaterialCodeAndName
	} from '/api/warehouse/ctuCartonPicking';
	import showBeautyToast from '@/common/beautyToast.js'

	export default {
		data() {
			return {
				packingCode: '', // 箱码
				packingInput: '', // 箱码输入
				rows: [], // 拣货详情列表
				spin: {
					code: false
				},
				// 拣货操作表单数据
				formData: {
					packingCode: '',
					isLabel: 0, // 0:无标签, 1:有标签
					labelCode: '',
					materialCode: '',
					materialName: '',
					materialDescriptionId: '',
					materialDescription: '',
					number: '',
					unit: '',
					worksheetCode: '',
					classType: '',
					lineType: '',
					batchCode: ''
				},
				materialList: [], // 物料列表
				materialSearchKeyword: '', // 物料搜索关键词
				filteredMaterialList: [], // 过滤后的物料列表
				materialCharacteristics: [], // 物料特征列表
				isPicking: false // 是否正在拣货
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
		onShow() {
			if (this.packingCode) {
				this.reloadTable();
			}
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
					_this.reloadTable();
				}).catch(err => {
					showBeautyToast({
						title: err,
						icon: 'warn'
					})
				});
			},

		// 箱码手动输入确认
		onPackingInputConfirm: function() {
			this.packingInput = '';
			const _this = this;
			setTimeout(function() {
				const code = _this.packingInput.trim();
				_this.packingInput = '';
				if (!code) {
					showBeautyToast({
						title: '请输入箱码',
						icon: 'warn'
					});
					return;
				}
				_this.packingCode = code;
				_this.reloadTable();
			}, 200);
		},

			// 处理扫码枪扫描
			handleScanCode: function(code) {
				this.packingCode = code;
				this.reloadTable();
			},

			// 重新加载表格数据
			reloadTable: async function() {
				if (!this.packingCode) return;
				
				this.spin.code = true;
				try {
					const resp = await getDetailByCode(this.packingCode);
					this.spin.code = false;
					if (resp.code == 200) {
						this.rows = resp.data || [];
					} else {
						showBeautyToast({
							title: resp.msg,
							icon: 'error'
						})
					}
				} catch (error) {
					this.spin.code = false;
					console.error(error);
				}
			},

			// 生成箱码
			createLabel: async function() {
				try {
					const resp = await packingInfoCreate();
					console.log('resp', resp);
					if (resp.code == 200) {
						this.packingCode = resp.data.packingCode;
						this.reloadTable();
						showBeautyToast({
							title: '箱码生成成功',
							icon: 'success'
						})
					} else {
						showBeautyToast({
							title: resp.msg || resp.message,
							icon: 'error'
						})
					}
				} catch (error) {
					console.error(error);
				}
			},

			// 拣货作业按钮点击
			handlePickingAction: function() {
				if (this.isPicking) {
					this.openPickingDrawer();
				} else {
					this.startPicking();
				}
			},

			// 开始拣货
			startPicking: async function() {
				if (!this.packingCode) {
					showBeautyToast({
						title: '请先输入箱码',
						icon: 'warn'
					});
					return;
				}

				try {
					const resp = await productPackingStart(this.packingCode);
					if (resp.code == 200) {
						this.isPicking = true;
						this.openPickingDrawer();
						showBeautyToast({
							title: '开始拣货成功',
							icon: 'success'
						})
					} else {
						showBeautyToast({
							title: resp.msg || resp.message,
							icon: 'error'
						})
					}
				} catch (error) {
					console.error(error);
				}
			},

			// 完成拣货
			finishPicking: async function() {
				if (!this.packingCode) {
					showBeautyToast({
						title: '请先输入箱码',
						icon: 'warn'
					});
					return;
				}

				uni.showModal({
					title: '确认',
					content: '是否确认拣货完成?',
					success: async (res) => {
						if (res.confirm) {
							try {
								const resp = await productPackingFinish(this.packingCode);
								if (resp.code == 200) {
									this.packingCode = '';
									this.rows = [];
									this.isPicking = false;
									showBeautyToast({
										title: '拣货完成成功',
										icon: 'success'
									})
								} else {
									showBeautyToast({
										title: resp.msg,
										icon: 'error'
									})
								}
							} catch (error) {
								console.error(error);
							}
						}
					}
				});
			},

			// 打开拣货操作弹窗
			openPickingDrawer: function() {
				this.resetFormData();
				this.$refs.pickingDrawer.open();
			},

			// 关闭拣货操作弹窗
			closePickingDrawer: function() {
				this.$refs.pickingDrawer.close();
			},

			// 重置表单数据
			resetFormData: function() {
				this.formData = {
					packingCode: this.packingCode,
					isLabel: 0,
					labelCode: '',
					materialCode: '',
					materialName: '',
					materialDescriptionId: '',
					materialDescription: '',
					number: '',
					unit: '',
					worksheetCode: '',
					classType: '',
					lineType: '',
					batchCode: ''
				};
				this.materialCharacteristics = [];
			},

			// 标签类型切换
			onLabelTypeChange: function(e) {
				this.formData.isLabel = parseInt(e.detail.value);
				this.formData.labelCode = '';
				this.formData.materialCode = '';
				this.formData.materialName = '';
				this.formData.materialDescriptionId = '';
				this.formData.materialDescription = '';
				this.formData.number = '';
				this.formData.unit = '';
				this.materialCharacteristics = [];
			},

			// 显示物料选择弹窗
			showMaterialPicker: function() {
				this.materialSearchKeyword = '';
				this.filteredMaterialList = [];
				this.$refs.materialPicker.open();
			},

			// 关闭物料选择弹窗
			closeMaterialPicker: function() {
				this.$refs.materialPicker.close();
			},

			// 物料搜索(回车触发查询)
			onMaterialSearch: function(e) {
				const keyword = e.detail.value;
				this.materialSearchKeyword = keyword;
				// 不自动查询,等待用户回车
			},

			// 物料搜索回车事件
		onMaterialSearchConfirm: function() {
			const _this = this;
			setTimeout(function() {
				const keyword = _this.materialSearchKeyword.trim();
				if (!keyword) {
					_this.filteredMaterialList = [];
					showBeautyToast({
						title: '请输入搜索关键词',
						icon: 'warn'
					});
					return;
				}

				// 调用接口查询
				_this.queryMaterialByCode(keyword);
			}, 200);
		},

			// 选择物料
			selectMaterial: function(item) {
				console.log('选择物料:', item);
				this.closeMaterialPicker();
				// 使用 $nextTick 确保弹窗关闭后再更新数据
				this.$nextTick(() => {
					this.$set(this.formData, 'materialCode', item.materialCode);
					this.$set(this.formData, 'materialName', item.materialName);
					if (item.unit) {
						this.$set(this.formData, 'unit', item.unit);
					}
					this.queryMaterialFeatures(item.materialCode);
					console.log('formData更新后:', this.formData);
				});
			},

			// 根据标签码查询物料信息
		queryLabelInfo: function() {
			const _this = this;
			setTimeout(async function() {
				if (!_this.formData.labelCode) {
					showBeautyToast({
						title: '请输入标签码',
						icon: 'warn'
					});
					return;
				}

				try {
					const resp = await getDetailByLabelCode(_this.formData.labelCode);
					if (resp.code == 200) {
						Object.assign(_this.formData, resp.data);
						if (resp.data.materialDescription) {
							_this.materialCharacteristics = [{
								id: resp.data.materialDescriptionId,
								description: resp.data.materialDescription
							}];
						}
					} else {
						showBeautyToast({
							title: resp.msg,
							icon: 'error'
						})
					}
				} catch (error) {
					console.error(error);
				}
			}, 200);
		},

			// 根据料号查询物料
			queryMaterialByCode: async function(materialCode) {
				try {
					const resp = await getByMaterialCodeAndName(materialCode);
					console.log(resp)
					if (resp.code == 200 && resp.data.results) {
						this.materialList = resp.data.results.map(item => ({
							...item,
							label: `${item.materialName}(${item.materialCode})`
						}));
						this.filteredMaterialList = [...this.materialList];
					} else if (!resp.data || resp.data === null || resp.data === undefined) {
						this.filteredMaterialList = [];
						showBeautyToast({
							title: '暂无匹配的物料',
							icon: 'warn'
						});
					}
				} catch (error) {
					console.error(error);
					this.filteredMaterialList = [];
					showBeautyToast({
						title: '查询失败,请重试',
						icon: 'error'
					});
				}
			},

			// 查询物料特征
			queryMaterialFeatures: async function(materialCode) {
				try {
					const resp = await materialFeatureGetByMaterialCodeWith(materialCode);
					console.log(resp)
					if (resp.code == 200) {
						this.materialCharacteristics = resp.data.list.map(item => ({
							...item,
							description: item.description ? JSON.parse(item.description) : {}
						}));
					}
				} catch (error) {
					console.error(error);
				}
			},

			// 显示物料特征弹窗
			showFeatureDrawer: function() {
				this.$refs.featureDrawer.open();
			},

			// 关闭物料特征弹窗
			closeFeatureDrawer: function() {
				this.$refs.featureDrawer.close();
			},

			// 格式化特征描述
			formatDescription: function(desc) {
				if (typeof desc === 'string') {
					return desc;
				}
				if (typeof desc === 'object') {
					return JSON.stringify(desc);
				}
				return '';
			},

			// 选择物料特征
			selectFeature: function(item) {
				console.log('选择物料特征:', item);
				if (this.formData.isLabel === 0) {
					this.closeFeatureDrawer();
					// 使用 $nextTick 确保弹窗关闭后再更新数据
					this.$nextTick(() => {
						const description = typeof item.description === 'object'
							? JSON.stringify(item.description)
							: item.description;
						this.$set(this.formData, 'materialDescriptionId', item.id);
						this.$set(this.formData, 'materialDescription', description);
						console.log('formData更新后:', this.formData);
					});
				}
			},

			// 提交拣货作业
			submitPicking: async function() {
				// 表单验证
				if (!this.formData.packingCode) {
					showBeautyToast({
						title: '箱码不能为空',
						icon: 'warn'
					});
					return;
				}
				if (this.formData.isLabel === 1 && !this.formData.labelCode) {
					showBeautyToast({
						title: '物料标签不能为空',
						icon: 'warn'
					});
					return;
				}
				if (!this.formData.materialCode) {
					showBeautyToast({
						title: '料号不能为空',
						icon: 'warn'
					});
					return;
				}
				if (!this.formData.materialDescriptionId) {
					showBeautyToast({
						title: '物料特征不能为空',
						icon: 'warn'
					});
					return;
				}
				if (!this.formData.number) {
					showBeautyToast({
						title: '数量不能为空',
						icon: 'warn'
					});
					return;
				}

				try {
					const resp = await productPackingIn(this.formData);
					if (resp.code == 200) {
						this.closePickingDrawer();
						this.reloadTable();
						showBeautyToast({
							title: '拣货作业成功',
							icon: 'success'
						})
					} else {
						showBeautyToast({
							title: resp.msg,
							icon: 'error'
						})
					}
				} catch (error) {
					console.error(error);
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

	.ware-house-container {
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

	.scan-input-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx 30rpx;
		background: #fff;

		.scan-input {
			flex: 1;
			height: 72rpx;
			line-height: 72rpx;
			padding: 0 24rpx;
			background: #f5f7fa;
			border-radius: 12rpx;
			font-size: 28rpx;
			border: 2rpx solid #e0e0e0;
		}

		.scan-btn {
			width: 72rpx;
			height: 72rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 12rpx;
			flex-shrink: 0;
		}
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

			.header-content {
				display: flex;
				flex-direction: column;
				gap: 16rpx;
				width: 100%;
			}

			.left {
				display: flex;
				align-items: center;
				gap: 16rpx;
				min-width: 0;
				width: 100%;

				.title {
					color: #fff;
					font-size: 28rpx;
					font-weight: bold;
				}

				text {
					color: #fff;
					font-size: 28rpx;
					font-weight: 500;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}

			.right {
				display: flex;
				justify-content: flex-end;
				gap: 12rpx;

				.action-btn {
					background: rgba(255, 255, 255, 0.2);
					padding: 12rpx 20rpx;
					border-radius: 32rpx;
					display: inline-flex;
					align-items: center;
					gap: 8rpx;
					white-space: nowrap;

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

		.table-wrapper {
			padding: 20rpx;

			.table-row {
				display: flex;
				align-items: center;
				padding: 16rpx 12rpx;
				border-bottom: 1rpx solid #f0f0f0;

				&.table-header {
					background: #f8f9fb;
					border-radius: 12rpx;
					font-weight: bold;

					.table-cell {
						color: #667eea;
						font-size: 24rpx;
					}
				}

				.table-cell {
					font-size: 24rpx;
					padding: 0 6rpx;
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

		// 窄屏适配
		@media screen and (max-width: 768px) {
			.header {
				padding: 20rpx;

				.header-content {
					gap: 12rpx;
				}

				.left {
					font-size: 26rpx;

					text {
						font-size: 26rpx;
					}
				}

				.right {
					.action-btn {
						padding: 10rpx 16rpx;

						text {
							font-size: 22rpx;
						}
					}
				}
			}

			.table-wrapper {
				padding: 12rpx;

				.table-row {
					padding: 12rpx 8rpx;
					font-size: 22rpx;

					&.table-header {
						.table-cell {
							font-size: 22rpx;
						}
					}

					.table-cell {
						font-size: 22rpx;
						padding: 0 4rpx;
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

		.operation-buttons {
			padding: 20rpx;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16rpx;

			.operation-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				padding: 24rpx;
				border-radius: 16rpx;
				font-size: 26rpx;
				font-weight: 500;
				background: #f8f9fb;
				color: #666;
				border: none;

				&.primary {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					color: #fff;
				}

				&.danger {
					background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
					color: #fff;
				}

				&:active {
					transform: scale(0.98);
				}
			}
		}
	}

	// 弹窗样式
	.drawer-content {
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		max-height: 80vh;
		margin: 0 30rpx;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		&.feature-drawer {
			max-height: 60vh;
		}

		&.material-picker-drawer {
			max-height: 70vh;
		}

		.search-box {
			padding: 24rpx 30rpx;
			background: #f8f9fb;
			border-bottom: 1rpx solid #e0e0e0;

			.search-input {
				width: 100%;
				padding: 24rpx;
				border: 1rpx solid #e0e0e0;
				border-radius: 12rpx;
				font-size: 28rpx;
				background: #fff;
			}
		}

		.drawer-header {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			padding: 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-radius: 24rpx 24rpx 0 0;

			.drawer-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #fff;
			}

			.close-btn {
				padding: 8rpx;
				background: rgba(255, 255, 255, 0.2);
				border-radius: 50%;
			}
		}

		.drawer-body {
			flex: 1;
			padding: 30rpx;
			overflow-y: auto;
			box-sizing: border-box;

			&:empty {
				display: none;
			}

			.form-item {
				margin-bottom: 30rpx;

				.form-label {
					display: block;
					font-size: 28rpx;
					color: #333;
					margin-bottom: 16rpx;
					font-weight: 500;
				}

				.form-input {
					width: 100%;
					padding: 24rpx;
					border: 1rpx solid #e0e0e0;
					border-radius: 12rpx;
					font-size: 28rpx;
					background: #fff !important;
					color: #333;

					&:disabled {
						background: #f0f0f0 !important;
						color: #999 !important;
						border-color: #e0e0e0 !important;
						opacity: 1 !important;
						cursor: not-allowed;
					}

					&:not(:disabled):focus {
						border-color: #667eea;
						box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
					}
				}

				.picker-wrapper {
					position: relative;
					display: flex;
					align-items: center;
					gap: 16rpx;

					.form-input {
						padding-right: 60rpx;
					}
				}

				.feature-display {
					display: flex;
					gap: 16rpx;

					.form-input {
						flex: 1;
						min-width: 0;
					}

					.view-btn {
						padding: 24rpx;
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						color: #fff;
						border-radius: 12rpx;
						font-size: 24rpx;
						border: none;
						white-space: nowrap;
					}
				}

				.radio-item {
					display: flex;
					align-items: center;
					gap: 12rpx;
					margin-right: 30rpx;

					text {
						font-size: 28rpx;
						color: #333;
					}
				}
			}

			.material-list {
				.material-item {
					background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
					border: 2rpx solid #e0e0e0;
					border-radius: 20rpx;
					padding: 28rpx 32rpx;
					margin-bottom: 20rpx;
					box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
					transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
					position: relative;
					overflow: hidden;

					&::before {
						content: '';
						position: absolute;
						left: 0;
						top: 0;
						bottom: 0;
						width: 6rpx;
						background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
						opacity: 0;
						transition: opacity 0.3s ease;
					}

					&:active {
						transform: scale(0.98);
						box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.15);
					}

					&:active::before {
						opacity: 1;
					}

					.material-code {
						font-size: 30rpx;
						font-weight: 600;
						color: #667eea;
						margin-bottom: 16rpx;
						font-family: 'Arial', monospace;
						letter-spacing: 0.5rpx;
					}

					.material-name {
						font-size: 28rpx;
						color: #555;
						line-height: 1.6;
						word-break: break-all;
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

			.feature-list {
				.feature-item {
					background: #f8f9fb;
					border: 2rpx solid #e0e0e0;
					border-radius: 16rpx;
					padding: 24rpx;
					margin-bottom: 16rpx;

					&.active {
						border-color: #667eea;
						background: rgba(102, 126, 234, 0.05);
					}

					&:active {
						transform: scale(0.99);
					}

					.feature-id {
						font-size: 24rpx;
						color: #999;
						margin-bottom: 12rpx;
					}

					.feature-desc {
						font-size: 26rpx;
						color: #333;
						word-break: break-all;
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

		.drawer-footer {
			padding: 30rpx;
			border-top: 1rpx solid #f0f0f0;
			display: flex;
			gap: 20rpx;

			.drawer-btn {
				flex: 1;
				padding: 28rpx;
				border-radius: 48rpx;
				font-size: 28rpx;
				font-weight: 500;
				border: none;

				&.cancel {
					background: #f0f0f0;
					color: #999;
				}

				&.confirm {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					color: #fff;
				}
			}
		}
	}
</style>
