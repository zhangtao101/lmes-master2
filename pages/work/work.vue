<template>
	<view class="work-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				{{ $t('work.produce') }}
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in product" :key="item.nameKey">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx;" :src="item.img" mode=""></image>
					<text>{{ $t(item.nameKey) }}</text>
				</navigator>
			</view>
		</view>
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				{{ $t('work.quality') }}
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in quality" :key="item.nameKey">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx" :src="item.img" mode=""></image>
					<text>{{ $t(item.nameKey) }}</text>
				</navigator>
			</view>
		</view>
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				{{ $t('work.warehouse') }}
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in warehouse" :key="item.nameKey">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx;" :src="item.img" mode=""></image>
					<text>{{ $t(item.nameKey) }}</text>
				</navigator>
			</view>
		</view>
		<!-- <view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				{{ $t('work.device') }}
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in devices" :key="item.nameKey">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx;" :src="item.img" mode=""></image>
					<text>{{ $t(item.nameKey) }}</text>
				</navigator>
			</view>
		</view>
		<view class="box-header">
			<view class="icon">
			</view>
			<view class="title">
				{{ $t('work.andon') }}
			</view>
		</view>
		<view class="work-box">
			<view class="work-item" v-for="item in andon" :key="item.nameKey">
				<navigator style="display:flex;flex-direction: column;align-items: center;" :url="item.url">
					<image style="width:56rpx;height:56rpx;" :src="item.img" mode=""></image>
					<text>{{ $t(item.nameKey) }}</text>
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
						nameKey: 'pages.produce.worksheeton',
						url: '/pages/work/produce/worksheeton/worksheeton'
					},
					// {
					// 	img: "../../static/images/shanggong.png",
					// 	nameKey: "pages.produce.worker",
					// 	url: "/pages/work/produce/worker/worker"
					// },
					{
						img: "../../static/images/shebei_dianjian.png",
						nameKey: "pages.produce.devicecheck",
						url: "/pages/work/produce/devicecheck/devicecheck"
					},
					{
						img: "../../static/images/gongdan_offline.png",
						nameKey: "pages.produce.worksheetoff",
						url: "/pages/work/produce/worksheetoff/worksheetoff"
					},
					{
						img: "../../static/images/produce_baogong.png",
						nameKey: "pages.produce.baogong",
						url: "/pages/work/produce/baogong/baogong"
					},
					{
						img: "../../static/images/wuliaotouliao.png",
						nameKey: "pages.produce.touliao",
						url: "/pages/work/produce/touliao/touliao"
					},
					{
						img: "../../static/images/kaoqin.png",
						nameKey: "pages.produce.attendance",
						url: "/pages/work/produce/attendance/attendance"
					},
					{
						img: "../../static/images/mujukuanhuan.png",
						nameKey: "pages.produce.mujukuaihuan",
						url: "/pages/work/produce/mujukuaihuan/mujukuaihuan"
					},
					{
						img: "../../static/images/buliangpin.png",
						nameKey: "pages.produce.blpjilu",
						url: "/pages/work/produce/blpjilu/blpjilu"
					},
					{
						img: "../../static/images/buliangpin_kuaixiu.png",
						nameKey: "pages.produce.blpkuaixiu",
						url: "/pages/work/produce/blpkuaixiu/blpkuaixiu"
					},
					{
						img: "../../static/images/feipinkuailu.png",
						nameKey: "pages.produce.fpkuailu",
						url: "/pages/work/produce/fpkuailu/fpkuailu"
					}
				]),
				quality: Object.freeze([{
						img: "../../static/images/IQC.png",
						nameKey: "pages.quality.iqccheck",
						url: "/pages/work/quality/iqccheck/iqccheck"
					},
					{
						img: "../../static/images/IPQC-Check.png",
						nameKey: "pages.quality.ipqccheck",
						url: "/pages/work/quality/ipqccheck/ipqccheck"
					},
					{
						img: "../../static/images/FQC.png",
						nameKey: "pages.quality.fqccheck",
						url: "/pages/work/quality/fqccheck/fqccheck"
					},
					{
						img: "../../static/images/OQC.png",
						nameKey: "pages.quality.oqccheck",
						url: "/pages/work/quality/oqccheck/oqccheck"
					},
				]),
				warehouse: Object.freeze([
					// {
					// 	img: "../../static/images/xrk.png",
					// 	nameKey: "pages.warehouse.inboundPickingNotAGV",
					// 	url: "/pages/work/warehouse/inboundPicking/inboundPickingNotAGV"
					// },
					// {
					// 	img: "../../static/images/xck.png",
					// 	nameKey: "pages.warehouse.outboundPickingNotAGV",
					// 	url: "/pages/work/warehouse/outboundPicking/outboundPickingNotAGV"
					// },
					{
						img: "../../static/images/xrk.png",
						nameKey: "pages.warehouse.inboundPicking",
						url: "/pages/work/warehouse/inboundPicking/inboundPicking"
					},
					{
						img: "../../static/images/xck.png",
						nameKey: "pages.warehouse.outboundPicking",
						url: "/pages/work/warehouse/outboundPicking/outboundPicking"
					},
					{
						img: "../../static/images/diaobo.png",
						nameKey: "pages.warehouse.transfer",
						url: "/pages/work/warehouse/transfer/transfer"
					},
					{
						img: "../../static/images/CTOrk.png",
						nameKey: "pages.warehouse.ctuCartonPicking",
						url: "/pages/work/warehouse/ctuCartonPicking/ctuCartonPicking"
					},
					{
						img: "../../static/images/CTOck.png",
						nameKey: "pages.warehouse.ctuOutboundPicking",
						url: "/pages/work/warehouse/ctuOutboundPicking/ctuOutboundPicking"
					},
					{
						img: "../../static/images/xmcx.png",
						nameKey: "pages.warehouse.cartonCodeQuery",
						url: "/pages/work/warehouse/cartonCodeQuery/cartonCodeQuery"
					},
					{
						img: "../../static/images/wuliao_in.png",
						nameKey: "pages.warehouse.materialin",
						url: "/pages/work/warehouse/materialin/materialin"
					},
					{
						img: "../../static/images/wuliao_out.png",
						nameKey: "pages.warehouse.materialout",
						url: "/pages/work/warehouse/materialout/materialout"
					},
					{
						img: "../../static/images/wuliao_return.png",
						nameKey: "pages.warehouse.materialreturn",
						url: "/pages/work/warehouse/materialreturn/materialreturn"
					},
					{
						img: "../../static/images/wuliao_tuiku.png",
						nameKey: "pages.warehouse.materialback",
						url: "/pages/work/warehouse/materialback/materialback"
					},
					{
						img: "../../static/images/wuliao_diaobo.png",
						nameKey: "pages.warehouse.materildb",
						url: "/pages/work/warehouse/materildb/materildb"
					},
					{
						img: "../../static/images/chengpin_in.png",
						nameKey: "pages.warehouse.cpin",
						url: "/pages/work/warehouse/cpin/cpin"
					},
					{
						img: "../../static/images/chengpin_fahuo.png",
						nameKey: "pages.warehouse.cpsend",
						url: "/pages/work/warehouse/cpsend/cpsend"
					},
					{
						img: "../../static/images/chengpin_return.png",
						nameKey: "pages.warehouse.cpreturn",
						url: "/pages/work/warehouse/cpreturn/cpreturn"
					},
					{
						img: "../../static/images/chengpin_tuiku.png",
						nameKey: "pages.warehouse.cpback",
						url: "/pages/work/warehouse/cpback/cpback"
					},
					{
						img: "../../static/images/chengpin_diaobo.png",
						nameKey: "pages.warehouse.cpdb",
						url: "/pages/work/warehouse/cpdb/cpdb"
					},
					{
						img: "../../static/images/shangjia.png",
						nameKey: "pages.warehouse.goodsShelving",
						url: "/pages/work/warehouse/goodsShelving/goodsShelving"
					},
					{
						img: "../../static/images/quhuo.png",
						nameKey: "pages.warehouse.goodsUnshelving",
						url: "/pages/work/warehouse/goodsUnshelving/goodsUnshelving"
					},
					{
						img: "../../static/images/chengpin_diaobo.png",
						nameKey: "pages.warehouse.inventoryTask",
						url: "/pages/work/warehouse/inventoryTask/inventoryTask"
					},
					{
						img: "../../static/images/shangmu.png",
						nameKey: "pages.warehouse.moldMounting",
						url: "/pages/work/warehouse/moldMounting/moldMounting"
					},
					{
						img: "../../static/images/xiamu.png",
						nameKey: "pages.warehouse.moldDismounting",
						url: "/pages/work/warehouse/moldDismounting/moldDismounting"
					},
					{
						img: "../../static/images/shangliao.png",
						nameKey: "pages.warehouse.processFeeding",
						url: "/pages/work/warehouse/processFeeding/processFeeding"
					},
					{
						img: "../../static/images/baogong.png",
						nameKey: "pages.warehouse.processReport",
						url: "/pages/work/warehouse/processReport/processReport"
					},
					{
						img: "../../static/images/shebeidianjian.png",
						nameKey: "pages.warehouse.equipmentSpotCheck",
						url: "/pages/work/warehouse/equipmentSpotCheck/equipmentSpotCheck"
					},
					{
						img: "../../static/images/shebeibaoyang.png",
						nameKey: "pages.warehouse.equipmentMaintenance",
						url: "/pages/work/warehouse/equipmentMaintenance/equipmentMaintenance"
					},
					{
						img: "../../static/images/baoxiu.png",
						nameKey: "pages.warehouse.equipmentRepairRequest",
						url: "/pages/work/warehouse/equipmentRepairRequest/equipmentRepairRequest"
					},
					{
						img: "../../static/images/weixiurenwu.png",
						nameKey: "pages.warehouse.repairTask",
						url: "/pages/work/warehouse/repairTask/repairTask"
					},
					// {
					// 	img: "../../static/images/chengpin_diaobo.png",
					// 	nameKey: "pages.warehouse.printTest",
					// 	url: "/pages/work/warehouse/printTest/printTest"
					// },
				]),
				devices: Object.freeze([{
						img: "../../static/images/dengdaizuoye.png",
						nameKey: "pages.device.pendingworklist",
						url: '/pages/work/device/pendingworklist/pendingworklist'
					},
					{
						img: "../../static/images/shebei_baoxiu.png",
						nameKey: "pages.warehouse.devicebaoxiu",
						url: '/pages/work/device/devicebaoxiu/devicebaoxiu'
					},
					{
						img: "../../static/images/shebei_weixiu.png",
						nameKey: "pages.warehouse.devicerepair",
						url: "/pages/work/device/devicerepair/devicerepair"
					},
					{
						img: "../../static/images/biangeng.png",
						nameKey: "pages.device.biangeng",
						url: "/pages/work/device/biangeng/biangeng"
					},
				]),
				andon: Object.freeze([{
						img: "../../static/images/daizuoye.png",
						nameKey: "pages.andon.pendinglist",
						url: "/pages/work/andon/pendinglist/pendinglist"
					},
					{
						img: "../../static/images/chufa.png",
						nameKey: "pages.andon.trigger",
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
