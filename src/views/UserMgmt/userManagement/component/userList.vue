<template>
  <el-table
    :data="tableData"
    height="680"
    >
    <!-- <el-table-column label="序号" type="index" width="50"></el-table-column> -->
    <el-table-column
      v-for="(item, index) in params"
      :prop="item.prop"
      :label="item.title"
      :key="index">
    </el-table-column>
    <el-table-column
      label="操作"
      align="center"
      width="80">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="light" content="编辑" placement="top-start">
          <span v-if="editable" @click="handleClickEdit(scope.$index)" style="cursor:pointer; margin-right:10px" class="el-icon-edit"></span>
        </el-tooltip>
        <el-tooltip class="item" effect="light" content="删除" placement="top-start">
          <span v-if="deletable" @click="handleClickDelete(scope.$index)" style="cursor:pointer" class="el-icon-delete">
        </span>
        </el-tooltip>
        <el-tooltip class="item" effect="light" content="查看" placement="top-start">
          <span v-if="viewable" @click="handleClickView(scope.$index)" style="cursor:pointer" class="el-icon-view"></span>
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
  export default {
    props: {
      params: undefined,
      tableData: undefined,
      editable: true,
      deletable: true,
      viewable: false
    },
    data () {
      return {
        deleteImg: require('../assets/images/delete.png'),
        editImg: require('../assets/images/edit.png')
      }
    },
    methods: {
      handleClickDelete (row) {
        this.$emit('listenDeleteEvent', row)
        console.log('userlist 删除' + row + '行')
      },
      handleClickEdit (row) {
        this.$emit('listenEditEvent', this.tableData[row])
        console.log('userlist 编辑' + row + '行')
      },
      handleClickView (row) {
        this.$emit('listenViewEvent', this.tableData[row])
        console.log('userlist 查看' + row + '行')
      }
    },
    created () {
        // alert('gridlist created!!!!')
    }
  }
</script>
