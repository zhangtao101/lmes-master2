<template>
	<view class="work-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				生产管理
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in product" :key="item.name">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx;" :src="item.img" mode=""></image>
					<text>{{item.name}}</text>
				</navigator>
			</view>
		</view>
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				质量管理
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in quality" :key="item.name">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx" :src="item.img" mode=""></image>
					<text>{{item.name}}</text>
				</navigator>
			</view>
		</view>
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				仓储管理
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in warehouse" :key="item.name">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx;" :src="item.img" mode=""></image>
					<text>{{item.name}}</text>
				</navigator>
			</view>
		</view>
		<!-- <view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				设备管理
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in devices" :key="item.name">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx;" :src="item.img" mode=""></image>
					<text>{{item.name}}</text>
				</navigator>
			</view>
		</view>
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				andon管理
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in andon" :key="item.name">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx;" :src="item.img" mode=""></image>
					<text>{{item.name}}</text>
				</navigator>
			</view>
		</view> -->
		<scan></scan>
	</view>
</template>

<script>
	import scan from '/pages/scan/scan.vue'
	export default {
		components: {
			scan
		},
		data() {
			return {
				product: Object.freeze([{
						img: '../../static/images/gongdan_online.png',
						name: '工单上线',
						url: '/pages/work/produce/worksheeton/worksheeton'
					},
					// {
					// 	img: "../../static/images/shanggong.png",
					// 	name: "人员上工",
					// 	url: "/pages/work/produce/worker/worker"
					// },
					{
						img: "../../static/images/shebei_dianjian.png",
						name: "设备点检",
						url: "/pages/work/produce/devicecheck/devicecheck"
					},
					{
						img: "../../static/images/gongdan_offline.png",
						name: "工单下线",
						url: "/pages/work/produce/worksheetoff/worksheetoff"
					},
					{
						img: "../../static/images/produce_baogong.png",
						name: "生产报工",
						url: "/pages/work/produce/baogong/baogong"
					},
					{
						img: "../../static/images/wuliaotouliao.png",
						name: "物料投料",
						url: "/pages/work/produce/touliao/touliao"
					},
					{
						img: "../../static/images/kaoqin.png",
						name: "产线考勤",
						url: "/pages/work/produce/attendance/attendance"
					},
					{
						img: "../../static/images/mujukuanhuan.png",
						name: "模具快换",
						url: "/pages/work/produce/mujukuaihuan/mujukuaihuan"
					},
					{
						img: "../../static/images/buliangpin.png",
						name: "不良品记录",
						url: "/pages/work/produce/blpjilu/blpjilu"
					},
					{
						img: "../../static/images/buliangpin_kuaixiu.png",
						name: "不良品快修",
						url: "/pages/work/produce/blpkuaixiu/blpkuaixiu"
					},
					{
						img: "../../static/images/feipinkuailu.png",
						name: "废品快录",
						url: "/pages/work/produce/fpkuailu/fpkuailu"
					}
				]),
				quality: Object.freeze([{
						img: "../../static/images/IQC.png",
						name: "IQC检测",
						url: "/pages/work/quality/iqccheck/iqccheck"
					},
					{
						img: "../../static/images/IPQC-Check.png",
						name: "IPQC检测",
						url: "/pages/work/quality/ipqccheck/ipqccheck"
					},
					{
						img: "../../static/images/FQC.png",
						name: "FQC检测",
						url: "/pages/work/quality/fqccheck/fqccheck"
					},
					{
						img: "../../static/images/OQC.png",
						name: "OQC检测",
						url: "/pages/work/quality/oqccheck/oqccheck"
					},
				]),
				warehouse: Object.freeze([
					// {
					// 	img: "../../static/images/xrk.png",
					// 	name: "入库拣货",
					// 	url: "/pages/work/warehouse/inboundPicking/inboundPickingNotAGV"
					// },
					// {
					// 	img: "../../static/images/xck.png",
					// 	name: "出库拣货",
					// 	url: "/pages/work/warehouse/outboundPicking/outboundPickingNotAGV"
					// },
					{
						img: "../../static/images/xrk.png",
						name: "入库拣货",
						url: "/pages/work/warehouse/inboundPicking/inboundPicking"
					},
					{
						img: "../../static/images/xck.png",
						name: "出库拣货",
						url: "/pages/work/warehouse/outboundPicking/outboundPicking"
					},
					{
						img: "../../static/images/diaobo.png",
						name: "AGV调拨",
						url: "/pages/work/warehouse/transfer/transfer"
					},
					{
						img: "../../static/images/CTOrk.png",
						name: "CTO箱拣选",
						url: "/pages/work/warehouse/ctuCartonPicking/ctuCartonPicking"
					},
					{
						img: "../../static/images/CTOck.png",
						name: "CTO出仓拣选",
						url: "/pages/work/warehouse/ctuOutboundPicking/ctuOutboundPicking"
					},
					{
						img: "../../static/images/xmcx.png",
						name: "箱码查询",
						url: "/pages/work/warehouse/cartonCodeQuery/cartonCodeQuery"
					},
					{
						img: "../../static/images/wuliao_in.png",
						name: "物料入库",
						url: "/pages/work/warehouse/materialin/materialin"
					},
					{
						img: "../../static/images/wuliao_out.png",
						name: "物料出库",
						url: "/pages/work/warehouse/materialout/materialout"
					},
					{
						img: "../../static/images/wuliao_return.png",
						name: "物料退货",
						url: "/pages/work/warehouse/materialreturn/materialreturn"
					},
					{
						img: "../../static/images/wuliao_tuiku.png",
						name: "物料退库",
						url: "/pages/work/warehouse/materialback/materialback"
					},
					{
						img: "../../static/images/wuliao_diaobo.png",
						name: "物料调拨",
						url: "/pages/work/warehouse/materildb/materildb"
					},
					{
						img: "../../static/images/chengpin_in.png",
						name: "成品入库",
						url: "/pages/work/warehouse/cpin/cpin"
					},
					{
						img: "../../static/images/chengpin_fahuo.png",
						name: "成品发货",
						url: "/pages/work/warehouse/cpsend/cpsend"
					},
					{
						img: "../../static/images/chengpin_return.png",
						name: "成品退货",
						url: "/pages/work/warehouse/cpreturn/cpreturn"
					},
					{
						img: "../../static/images/chengpin_tuiku.png",
						name: "成品退库",
						url: "/pages/work/warehouse/cpback/cpback"
					},
					{
						img: "../../static/images/chengpin_diaobo.png",
						name: "成品调拨",
						url: "/pages/work/warehouse/cpdb/cpdb"
					},
					{
						img: "../../static/images/shangjia.png",
						name: "货物上架",
						url: "/pages/work/warehouse/goodsShelving/goodsShelving"
					},
					{
						img: "../../static/images/quhuo.png",
						name: "货物下架",
						url: "/pages/work/warehouse/goodsUnshelving/goodsUnshelving"
					},
					{
						img: "../../static/images/chengpin_diaobo.png",
						name: "盘点任务",
						url: "/pages/work/warehouse/inventoryTask/inventoryTask"
					},
					{
						img: "../../static/images/shangmu.png",
						name: "模具上模",
						url: "/pages/work/warehouse/moldMounting/moldMounting"
					},
					{
						img: "../../static/images/xiamu.png",
						name: "模具下模",
						url: "/pages/work/warehouse/moldDismounting/moldDismounting"
					},
					{
						img: "../../static/images/shangliao.png",
						name: "工序上料",
						url: "/pages/work/warehouse/processFeeding/processFeeding"
					},
					{
						img: "../../static/images/baogong.png",
						name: "工序报工",
						url: "/pages/work/warehouse/processReport/processReport"
					},
					{
						img: "../../static/images/shebeidianjian.png",
						name: "设备点检",
						url: "/pages/work/warehouse/equipmentSpotCheck/equipmentSpotCheck"
					},
					{
						img: "../../static/images/shebeibaoyang.png",
						name: "设备保养",
						url: "/pages/work/warehouse/equipmentMaintenance/equipmentMaintenance"
					},
					{
						img: "../../static/images/baoxiu.png",
						name: "设备报修",
						url: "/pages/work/warehouse/equipmentRepairRequest/equipmentRepairRequest"
					},
					{
						img: "../../static/images/weixiurenwu.png",
						name: "维修任务",
						url: "/pages/work/warehouse/repairTask/repairTask"
					},
					// {
					// 	img: "../../static/images/chengpin_diaobo.png",
					// 	name: "打印测试",
					// 	url: "/pages/work/warehouse/printTest/printTest"
					// },
				]),
				devices: Object.freeze([{
						img: "../../static/images/dengdaizuoye.png",
						name: "待作业设备",
						url: '/pages/work/device/pendingworklist/pendingworklist'
					},
					{
						img: "../../static/images/shebei_baoxiu.png",
						name: "设备报修",
						url: '/pages/work/device/devicebaoxiu/devicebaoxiu'
					},
					{
						img: "../../static/images/shebei_weixiu.png",
						name: "设备维修",
						url: "/pages/work/device/devicerepair/devicerepair"
					},
					{
						img: "../../static/images/biangeng.png",
						name: "稼动变更",
						url: "/pages/work/device/biangeng/biangeng"
					},
				]),
				andon: Object.freeze([{
						img: "../../static/images/daizuoye.png",
						name: "待作业列表",
						url: "/pages/work/andon/pendinglist/pendinglist"
					},
					{
						img: "../../static/images/chufa.png",
						name: "触发",
						url: "/pages/work/andon/trigger/trigger"
					},
				])
			}
		},
		methods: {

		}
	}
</script>

<style lang="less" scoped>
	.work-container {
		padding: 20rpx 30rpx;

		& .work-box {
			padding-top: 30rpx;
			padding-bottom: 20rpx;
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			align-items: center;

			& .work-item {
				flex: 0 1 25%;
				font-size: var(--uni-font-size-sm);
				margin-bottom: 30rpx;

				& :deep(.navigator-wrap) {
					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;

					& image {
						width: 56rpx;
						height: 56rpx;
					}

					& text {
						margin-top: 10rpx;
					}
				}

				& text {
					margin-top: 20rpx;
				}

			}
		}
	}
</style>