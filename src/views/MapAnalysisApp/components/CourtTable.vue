<template>
  <el-table ref="courttable" :data="tableData" @row-click="onClickRowHandler" @row-dblclick="onDoubleClickHandler" stripe>
    <el-table-column type="expand">
      <template slot-scope="props">
        <el-form label-position="left" inline class="demo-table-expand">
          <el-form-item label="建筑面积">
            <span>{{ props.row.buildArea }} (平米)</span>
          </el-form-item>
          <el-form-item label="占地面积">
            <span>{{ props.row.floorArea }} (平米)</span>
          </el-form-item>
          <el-form-item label="详细地址" class="itemlarge">
            <span>{{ props.row.address }}</span>
          </el-form-item>
        </el-form>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="小区名称">
    </el-table-column>
    <el-table-column prop="houseCount" label="房屋总数">
    </el-table-column>
    <el-table-column prop="homeCount" label="户数总数">
    </el-table-column>
  </el-table>
</template>
<script>
export default {
  name: 'courttable',
  props: {
    tableData: {
      type: Array
    }
  },
  methods: {
    /**
     * @description 双击小区行item，跳转到小区详情页
     * @param {Object} row 小区数据对象
     * @param {Event} e 双击事件
     */
    onDoubleClickHandler: function (row, e) {
      this.$router.push('/mapanalysisapp/courtinfo/' + row.uuid) // courtUuid
    },
    /**
     * @description 单击小区行item，展开或收起该行隐藏的项
     * @param {Object} row 小区数据对象
     * @param {Event} e 双击事件
     */
    onClickRowHandler: function (row, e) {
      if (e.target.className === 'el-icon el-icon-arrow-right') return
      this.$refs['courttable'].toggleRowExpansion(row)
    }
  }
}
</script>
<style scoped>

</style>


