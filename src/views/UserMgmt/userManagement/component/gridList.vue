<template>
<!-- <div > -->
  <el-table
    :highlight-current-row="true"
    :data="tableData"
    stripe
    max-height="680"
    style="width:100%"
    >
    <el-table-column
      v-for="(item, index) in params"
      :prop="item.prop"
      :label="item.title"
      :key="index"
      :show-overflow-tooltip="item.showTooltip"
    >
    </el-table-column>
    <el-table-column
      label="操作"
      v-if="showOperation"
      align="center"
      width="100"
      >
      <template slot-scope="scope">
        <el-tooltip class="item" effect="light" content="编辑" placement="top-start">
          <span v-if="editable" @click="handleClickEdit(scope.$index)" style="cursor:pointer; margin-right:10px" class="el-icon-edit"></span>
        </el-tooltip>
        <el-tooltip class="item" effect="light" content="删除" placement="top-start">
          <span v-if="deletable" @click="handleClickDelete(scope.$index)" style="cursor:pointer" class="el-icon-delete"></span>
        </el-tooltip>
        <el-tooltip class="item" effect="light" content="查看" placement="top-start">
          <span v-if="viewable" @click="handleClickView(scope.$index)" style="cursor:pointer" class="el-icon-view"></span>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
<!-- </div> -->
</template>

<script>
  export default {
    name: 'gridList',
    props: {
      params: undefined,
      tableData: undefined,
      editable: false,
      deletable: true,
      viewable: false,
      showOperation: true,
      total: undefined
    },
    data () {
      return {
        deleteImg: require('../assets/images/delete.png'),
        editImg: require('../assets/images/edit.png')
      }
    },
    methods: {
      handleClickDelete (row) {
        this.$confirm('确定删除此项？', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        .then(() => {
          this.$emit('listenToDeleteEvent', this.tableData[row])
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      handleClickEdit (rowIndex) {
        this.$emit('listenToEditEvent', this.tableData[rowIndex])
      },
      handleClickView (rowIndex) {
        this.$emit('listenToViewEvent', this.tableData[rowIndex])
      },
      handleClickSelect (row) {
        this.$emit('listenToClickEvent', this.tableData[row])
      }
    },
    created () {
    }
  }
</script>

<style>

</style>
