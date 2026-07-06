<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">物料入库</text>
		</view>
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<uni-icons type="home" color="#fff"></uni-icons>
						<text>库位：{{wareLocationCode}}</text>

					</view>
					<view class="right" @click="onLocationScan">
						请扫描
					</view>
				</view>
				<view class="body">
					<view class="left">
						<text>料号</text>
						<text>{{warehouse.materialCode }}</text>
					</view>
					<view class="right">
						<text>物料名称</text>
						<text>{{warehouse.materialName }}</text>
					</view>
				</view>
				<view class="body">
					<view class="left">
						<text>单据需求量</text>
						<text>{{warehouse.formNumber }}</text>
					</view>
					<view class="right">
						<text>已入数量</text>
						<text>{{warehouse.opNumber }}</text>
					</view>
				</view>
			</view>
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose"></uni-icons>
						<text class="title">入库明细</text>
					</view>
				</view>
				<view class="label-info-container" v-for="labelInfo in labelList" :key="labelInfo.labelCode">
					<view class="header" style="padding: 0.5rem 1rem;">
						<view class="left">
							<uni-icons custom-prefix="iconfont" type="icon-tiaoxingma"></uni-icons>
							<text class="label">标签号: </text>
							<text class="value"> {{ labelInfo.labelCode }} </text>
						</view>
						<view class="right" @click="onLabelScan(labelInfo)">
							请扫描
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>料号：</text>
							<text class="value">{{labelInfo.materialCode }}</text>
						</view>
						<view class="right">
							<text>物料名称：</text>
							<text class="value">{{labelInfo.materialName }}</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>批次号：</text>
							<text class="value">{{labelInfo.batchCode }}</text>
						</view>
						<view class="right">
							<text>数量：</text>
							<text class="value">{{labelInfo.number }}</text>
						</view>
					</view>
				</view>
				
				<view class="operator-button">
					<button size="mini" style="width: 80%" @click="addRow">新增</button>
				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini" @click="onSubmit">确认提交</button>
		</view>
	</view>
</template>

<script>
	import scanCode from '/common/scan.js'
	import material from '/api/warehouse/material';
	import {
		CodeType
	} from "/common/enum.js"
	import {
		retriveLogicalWarehouse,
		getCodeType
	} from '/common/util.js'
	export default {
		data() {
			return {
				wareLocationCode: '',
				warehouse: {},
				labelList: [],
				formDetailId: "",
			}
		},
		onLoad(options) {
			this.formDetailId = options.formDetailId;
			const _this = this;
			plus.key.addEventListener("keydown", function(e) {
				if (e.keyCode == 102 || e.keyCode == 103 || e.keyCode == 110) {
					uni.$off('scan') // 每次进来先 移除全局自定义事件监听器
					uni.$on('scan', function(code) {
						//扫码成功后的回调，你可以写自己的逻辑代码在这里
						const codeType = getCodeType(code);
						if (codeType == CodeType.KQ) {
							_this.loadWarehouseInfo(code);
						} else if (codeType == CodeType.WL_Label) {
							_this.loadLabelInfo(code, _this.currentLabelItem || {});
						} else {
							uni.showToast({
								title: "标签无效！"
							});
						}
					})

				}
			})
		},
		destroyed: function() {
			plus.key.removeEventListener('keydown');
		},
		methods: {
			loadWarehouseInfo: async function(code) {
				this.wareLocationCode = code;
				const resp = await material.getDetailByStorageCode({
					storageCode: this.wareLocationCode,
					formDetailId: this.formDetailId
				});
				if (resp.code == 200) {
					this.warehouse = resp.data;
				} else {
					uni.showToast({
						title: resp.msg
					})
				}

			},
			loadLabelInfo: async function(labelCode, item) {
				const res = await material.getEnterDetailByLabelCode({
					formDetailId: this.formDetailId,
					storageCode: this.wareLocationCode,
					labelCode,
				});
				if (res.code == 200) {
					const { data } = res;
					item.materialCode = data.materialCode;
					item.materialName = data.materialName;
					item.batchCode = data.batchCode;
					item.number  = data.number ;
					console.log(data);
				} else {
					uni.showToast({
						title: res.msg
					})
				}
			},
			onLocationScan: function() {
				const _this = this;
				// _this.loadWarehouseInfo("KQ001-1");
				scanCode().then((code) => {
					_this.loadWarehouseInfo(code);
				}).catch(err => {
					uni.showToast({
						title: err
					})
				});
			},
			onLabelScan: function(item) {
				const _this = this;
				scanCode().then((labelCode) => {
					item.labelCode = labelCode;
					_this.loadLabelInfo(labelCode, item)
				}).catch(err => {
					uni.showToast({
						title: err
					})
				});
			},
			onSubmit: async function() {
				const _labelList = [];
				const _this = this;
				let {
					logicalCode
				} = retriveLogicalWarehouse(_this.warehouse.remark);
				this.labelList.forEach(label => {
					_labelList.push({
						labelCode: label.labelCode,
						wareLocationCode: _this.wareLocationCode,
						logicalWarehouseCode: logicalCode
					})
				})
				const res = await material.materialIn(_labelList);

				if (res.code == 200) {
					uni.showToast({
						title: '入库成功'
					})
					this.wareLocationCode = '';
					this.warehouse = {};
					this.labelList = [];
				} else {
					uni.showToast({
						title: res.msg
					})
				}
			},
			addRow: function () {
				this.labelList.push({})
			}
		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";
	.operator-button {
		margin-top: 1rem;
	}
</style>