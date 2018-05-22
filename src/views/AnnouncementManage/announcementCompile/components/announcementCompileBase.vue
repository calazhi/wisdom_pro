<template>
  <div class="main">
    <el-form label-width="100px" class="demo-ruleForm" :label-position="labelPosition">
      <div class="compile-button">
        <el-button type="primary" @click="publishNoticeAction">提交</el-button>
        <el-button type="primary" @click="cancelPublish">取消</el-button>
      </div>
      <div class="line-top"></div>
      <el-row :gutter="20">
        <el-col :span="6">
       <el-form label-position="left" label-width="80px">
         <el-form-item label="标题:">
           <el-input v-model="noticeform.noticeTitle" :maxlength="128"></el-input>
         </el-form-item>
         <el-form-item label="生效时间:">
           <div class="block">
             <el-date-picker v-model="value4" type="datetimerange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" @change="confirm">
             </el-date-picker>
           </div>
         </el-form-item>
         <el-form-item label="摘要:">
           <el-input type="textarea" v-model="noticeform.noticeSummary" :maxlength="128"></el-input>
         </el-form-item>
         <el-form-item label="指定小区:">
           <el-select v-model="selectCourts" multiple collapse-tags placeholder="请选择" popper-class="elis" value-key="uuid">
             <el-option
               v-for="item in courts"
               :key="item.uuid"
               :value="item"
               :label="item.address"
             >
             </el-option>
           </el-select>
         </el-form-item>
       </el-form>
        </el-col>
        <el-col :span="6" :offset="6">
           <el-form label-position="left" label-width="80px">
             <el-form-item label="缩略图:">
               <el-upload class="upload-demo"
                          drag action="/egc-noticemgmtcomponent/image/setByFormData"
                          :headers="headers"
                          :on-success="uploadSuccess"
                          ref="upload" :limit="1"
                          accept="image/png,image/jpeg,image/jpg,image/bmp"
                          :on-error="uploadFail"
                          :before-upload="beforeUpload"
                          :on-remove="removePic"
               >
                 <i class="el-icon-upload"></i>
                 <div class="el-upload__text">将文件拖到此处，或
                   <em>点击上传</em>
                 </div>
                 <div class="el-upload__tip" slot="tip">支持格式为jpeg、png、bmp格式，最大500kb</div>
               </el-upload>
             </el-form-item>
           </el-form>
        </el-col>
      </el-row>
      <div class="emptybox"></div>
      <el-form-item label="正文:">
          <editor @cont="getContent" :clearEditor="clearEditor"></editor>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Editor from './Editor'
import { publishNotice, getArea } from '../apis/index.js'
export default {
  data () {
    return {
      cont: '',
      contLenth: 0,
      clearEditor: false,
      editorContent: '',
      courts: [], // 指定小区
      selectCourts: {}, // 选中的小区
      slPic: '',
      headers: {
        Authorization: localStorage.token,
        FrontType: 'egc-admin-ui'
      },
      labelPosition: 'left',
      value4: ['', ''],
      noticeform: {
        noticeTitle: '',
        courtUuids: ['default'],
        noticeSummary: '',
        noticeContent: '',
        validStartTime: '',
        validEndTime: '',
        noticePublisher: '',
        noticeZoomPicId: ''
      }
    }
  },
  components: {
    Editor
  },
  mounted () {
    // this.$refs.ueditor
  },
  created () {
    this.noticeform.noticePublisher = JSON.parse(window.localStorage.getItem('userInfo')).userName
    this.getArea()
  },
  methods: {
    //  转化为时间戳
    confirm () {
      this.noticeform.validStartTime = Date.parse(this.value4[0]) ? Date.parse(this.value4[0]) : ''
      this.noticeform.validEndTime = Date.parse(this.value4[1]) ? Date.parse(this.value4[1]) : ''
      if (this.noticeform.validEndTime <= this.noticeform.validStartTime) {
        this.$message('结束时间要大于开始时间')
        this.value4[1] = ''
      }
    },
    getContent (data) { // 获取文本编辑器的内容
      this.cont = data.html
      this.contLength = data.length
    },
    // 发布公告
    publishNoticeAction () {
      let that = this
      let title = this.noticeform.noticeTitle
      let cont = this.cont
      this.editorContent = `<!DOCTYPE html><html><head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
            <meta name="screen-orientation" content="portrait"/>
            <meta name="apple-mobile-web-app-capable" content="yes">
            <meta name="format-detection" content="telephone=no">
            <meta name="full-screen" content="yes">
            <meta name="x5-fullscreen" content="true">
          <style>
            *{margin:0;padding:0}
             html{
                font-size: calc(100vw/7.5)
              }
            body{padding:0.59rem 0.55rem;}
            h2{
                font-size:0.42rem;
                margin-bottom:0.39rem;
            }
            h3,h4,h5{
              font-size: 0.34rem;
              margin-bottom:0.2rem;
            }
            p{text-align:justify;width: 100%;height: auto; word-wrap:break-word;word-break:break-all;overflow: hidden;color:#666;font-size:0.34rem;line-height:0.48rem;}
            img{ max-width: 100%;margin:0.18rem 0 0.41rem;}
            img[data-w-e]{ margin:0;}
            li{list-style-position:inside;color:#666;}
          </style>
          </head><body><h2>${title}</h2>${cont}
          </body></html>`
      this.noticeform.noticeContent = this.editorContent
      this.noticeform.noticeZoomPicId = this.slPic
      this.noticeform.courtUuids = this.getCourtsId().length > 0 ? this.getCourtsId() : ['default']
      if (this.contLength <= 2000 && this.noticeform.noticeTitle && this.noticeform.noticeSummary.length >= 50 && this.noticeform.noticeZoomPicId && this.noticeform.validStartTime > new Date().getTime()) {
        let params = this.noticeform
        publishNotice(params)
          .then(result => {
            this.$message({
              onClose: function () {
                that.$router.push('/AnnouncementManage/announcementInquire')
              },
              duration: 2000,
              message: '发布成功'
            })
          })
          .catch(() => {
            console.log('请求失败')
          })
      } else {
        if (!this.noticeform.noticeTitle) {
          this.$message('标题不能为空')
          return false
        } else if (this.noticeform.noticeSummary.length < 50) {
          this.$message('摘要不能少于50字')
          return false
        } else if (this.noticeform.validStartTime < new Date().getTime()) {
          this.$message('有效开始时间不能小于当前时间')
          return false
        } else if (!this.noticeform.noticeZoomPicId) {
          this.$message('请上传一张缩略图')
          return false
        } else if (this.contLength > 2000) {
          this.$message('上传文本内容长度不能超过2000')
        }
      }
    },
    getArea () {
      let params = {}
      getArea(params).then(res => {
        this.courts = res.data.result
      }).catch(err => {
        console.log(err)
      })
    },
    uploadSuccess (data) { // 获取缩略图的id
      this.$message('上传成功')
      this.slPic = data.data
    },
    uploadFail () {
      this.$message('上传失败')
    },
    beforeUpload (file) {
      let size = file.size
      if (size > 500 * 1024) {
        this.$message('上传图片过大')
        return false
      }
    },
    removePic () {
      this.slPic = ''
    },
    getCourtsId () { // 获取选中小区的id
      const _length = this.selectCourts.length
      let ids = []
      for (let i = 0; i < _length; i++) {
        ids.push(this.selectCourts[i].uuid)
      }
      return ids
    },
    cancelPublish () {
      this.noticeform = {
        noticeTitle: '',
        courtUuids: ['default'],
        noticeSummary: '',
        noticeContent: '',
        validStartTime: '',
        validEndTime: '',
        noticePublisher: '',
        noticeZoomPicId: ''
      }
      this.selectCourts = []
      this.clearEditor = !this.clearEditor
      this.value4 = ['', '']
      this.$refs.upload.clearFiles()
    }
  }
}
</script>
<style scoped>
.line-top {
  width: 100%;
  border-top: 1px solid #d3d1cf;
  margin-top: 10px;
  margin-bottom: 50px;
}
.emptybox {
  width: 100%;
  height: 30px;
}
.el-select{
  width:400px!important;
}
</style>
