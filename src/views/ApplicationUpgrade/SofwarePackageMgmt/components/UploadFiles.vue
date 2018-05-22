<template>
    <div id="fileUpload" v-loading="uploadloading">
      <el-upload
          ref="upload"
          class="avatar-uploader"
          :action="uploadUrl"
          drag
          :multiple = "false"
          :limit=2
          :show-file-list="true"
          :on-change="handleOnchange"
          :on-remove="handleOnchange"
          :headers="tokenHeaders"
          :auto-upload="false"
          :file-list="fileList">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传excel文件，且不超过10M</div>
      </el-upload>
      <el-button type="primary" @click="_submitUpload" class="search-btn" style="margin-top: 20px">上传服务器</el-button>
      <el-button type="primary" @click="_callDownTemplate" class="search-btn" style="margin-top: 20px; margin-left: 20px;" icon="el-icon-download">模板下载</el-button>
    </div>
</template>

<script>
import { uploadDependencyExcelFiles, downCfgMgmtTemplate } from '../apis/index'
export default {
  data () {
    return {
      fileList: [],
      uploadUrl: '',
      uploadFiles: new FormData(),
      uploadloading: false
    }
  },
  methods: {
    handleOnchange (file, fileList) {
      if (fileList.length === 2) {
        fileList.shift()
      }
      this.uploadFiles = new FormData()
      if (this.beforeUpload(file)) {
        this.uploadFiles.append('file', fileList[0].raw)
      }
    },
    _submitUpload () {
      this.uploadloading = true
      var fileLength = this.$refs.upload._data.uploadFiles.length
      console.log(fileLength)
      if (fileLength > 0) {
        uploadDependencyExcelFiles(this.uploadFiles)
        .then((res) => {
          this.fileList = []
          this.uploadloading = false
          this.$message({
            message: '上传成功!',
            type: 'success'
          })
        }).catch(
          function (error) {
            // this.$message({
            //   message: error.message,
            //   center: true,
            //   showClose: true,
            //   type: 'error',
            //   duration: 2000
            // })
            console.log(error)
            this.uploadloading = false
          }.bind(this)
        )
      } else {
        this.uploadloading = false
        this.$message({
          message: '请先选择需要上传的模板文件',
          type: 'warning',
          duration: 20000,
          center: true,
          showClose: true
        })
      }
    },

    beforeUpload (file) {
      var Xls = file.name.split('.')
      console.log('Xls[1] --- > ' + Xls)
      const isExcel = (Xls[Xls.length - 1] === 'xls' || Xls[Xls.length - 1] === 'xlsx')
      console.log('Xls[Xls.length - 1] --- > ' + Xls[1])
      const isLt10M = file.size / 1024 / 1024 < 1000
      if (!isExcel) {
        this.$message.error('上传文件只能是 xls/xlsx 格式!')
        this.fileList = []
        return false
      } else if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
        this.fileList = []
        return false
      } else {
        return file
      }
    },
    // handleExceed (files, fileList) {
    //   this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    // },
    _callDownTemplate () {
      console.log('download')
      let tempFlag = 74
      downCfgMgmtTemplate(tempFlag)
        .then(
          function (result) {
          }
        ).catch(
        )
    }
  }
}
</script>

<style scoped>
#fileUpload {
  text-align: center
}
.el-upload-list {
    margin: 0;
    padding: 0;
    list-style: none;
    width: 500px;
    margin-left: 650px;
}
</style>
