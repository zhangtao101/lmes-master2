<template>
	<view class="table-container">
		<scroll-view class="table-row" scroll-x>
			<table class="table">
				<thead class="table-head">
					<th class="table-head-th table-head-before">\</th>
					<th class="table-head-th" v-for="(item,index) in columns" :key="index">{{ item.title }}</th>
				</thead>
				<tbody class="table-body">
					<tr class="table-tr" :class="{ 'selected': rowIndex==index}" v-for="(row,index) in rows" :key="index"
						@click="handBindClick(row,index)">
						<td class="table-td">{{ (index+1) }}</td>
						<td class="table-td" v-for="(column,jndex) in columns" :key="jndex">{{ row[column.field] }}</td>
					</tr>
				</tbody>
			</table>
		</scroll-view>
	</view>
</template>
<script>	
	export default {
		name: 'i-table',
		data() {
			return {
				rowIndex: -1,
			}
		},
		props: {
			columns: {
				type: Array,
				required: true,
			},
			rows: {
				type: Array,
				required: true,
			},
		},
		methods: {
			handBindClick(row, index) {
				var data = {};
				this.rowIndex = this.rowIndex == -1 ? this.rowIndex = index : this.rowIndex == index ? -1 : index;
				if (this.rowIndex == -1) {} else { data = { row, index } }
				this.$emit('click', data);
			}
		}
	};
</script>
<style>
	.table-container {
		overflow-x: hidden;
	}

	.table-row {
		white-space: nowrap;
		overflow: auto;
		display: flex;
		width: 100%;
	}

	.table {
		border-collapse: collapse;
		width: 100%;
	}

	.table .table-head .table-head-th {
		height: auto;
		border: 1rpx #dedede solid;
		padding: 10rpx 20rpx 10rpx 20rpx;
		text-align: center;
	}

	.table .table-body .table-tr .table-td {
		width: auto;
		height: auto;
		border: 1rpx #dedede solid;
		padding: 10rpx 20rpx 10rpx 20rpx;
		text-align: center;
	}

	.table .table-body .table-tr:nth-child(odd) {
		background-color: transparent;
		/* 设置偶数行颜色 */
	}

	.table .table-body .table-tr.selected {
		/* 设置选中行的背景颜色 */
		background: linear-gradient(to left, #ffcadb, #ffe8c0);
		font-weight: bold;
		color: #5555ff;
	}

	.table-foot .table-foot-th {
		width: 100%;
		height: auto;
		border: 1rpx #dedede solid;
		padding: 10rpx 20rpx 10rpx 20rpx;
		background-color: #f2f2f2;
		text-align: center;
	}
</style>