<template>
  <div>
    <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
    <el-checkbox-group v-model="checkedCols" @change="handleCheckedColsChange" style="margin-bottom: 15px; margin-top:15px">
      <el-row v-for="(titles, index) in tableTitles" :key="index">
        <el-col :span="4" v-for="(item, index) in titles" :key="index">
          <el-checkbox :label="item.colName"></el-checkbox>
        </el-col>
      </el-row>
    </el-checkbox-group>
    <div style="text-align:center">
      <el-button type="primary" @click="handleSave" class="action-btn" style="margin: 0 auto">保存</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    allTableTitleList: {
      type: Array
    }
  },
  data () {
    return {
      isIndeterminate: false,
      checkAll: false,
      checkedCols: [],
      tableTitleArray: [],
      tableTitles: []
    }
  },
  methods: {
    handleCheckAllChange (val) {
      for (var i = 0; i < this.allTableTitleList.length; i++) {
        this.tableTitleArray[i] = this.allTableTitleList[i].colName
      }
      this.checkedCols = val ? this.tableTitleArray : []
      this.isIndeterminate = false
    },
    handleCheckedColsChange (val) {
      let checkedCount = val.length
      this.checkAll = checkedCount === this.allTableTitleList.length
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.allTableTitleList.length
    },
    handleSave () {
      this.$emit('showColsEvent', this.checkedCols)
    },
    setDefaultColsChecked () {
      this.checkedCols = []
      console.log('-->' + JSON.stringify(this.allTableTitleList))
      for (let i = 0; i < this.allTableTitleList.length; i++) {
        if (this.allTableTitleList[i].showColumn === true) {
          this.checkedCols.push(this.allTableTitleList[i].colName)
        }
      }
      this.tempAllTableTitleList = Object.assign([], this.allTableTitleList)
      // 每行显示6个表头名
      this.tableTitles = []
      var num = 6
      if (this.allTableTitleList.length > num) {
        var tempArray = []
        for (let n = 0; n < this.tempAllTableTitleList.length * num * num; n++) {
          tempArray = this.tempAllTableTitleList.splice(0, num)
          this.tableTitles.push(tempArray)
        }
        console.log('tableTitles arr --->' + JSON.stringify(this.tableTitles))
      }
    }
  },
  watch: {
    allTableTitleList (newValue, oldValue) {
      this.allTableTitleList = newValue
    },
    deep: true
  },
  mounted () {
    this.setDefaultColsChecked()
  }
}
</script>


