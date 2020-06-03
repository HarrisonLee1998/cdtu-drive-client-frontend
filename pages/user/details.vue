<template>
  <div class="container">
    <h1>用户信息修改</h1>
    <!--用户头像上传-->
    <div>
      <el-upload
        class="avatar-uploader"
        action="http://localhost:8080/user/avatar"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
        name="file"
        :data="otherData"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon" />
      </el-upload>
    </div>
    <!--详细信息-->
    <div class="user-info">
      <div class="user-info-field">
        <span class="user-info-label">ID:</span><el-input v-model="user.id" readonly />
      </div>
      <div class="user-info-field">
        <span class="user-info-label">姓名:</span><el-input v-model="user.username" readonly />
      </div>
      <div class="user-info-field">
        <span class="user-info-label">密码:</span><el-input v-model="user.password" />
      </div>
      <div class="user-info-field">
        <span class="user-info-label">邮箱:</span><el-input v-model="user.email" />
      </div>
      <div class="user-info-field">
        <el-input
          v-model="user.brief"
          type="textarea"
          :rows="5"
          placeholder="请输入个人简介"
          autosize
          maxlength="60"
        />
      </div>
    </div>
    <div>
      <el-button type="primary" @click="saveModify">
        保存
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      user: {},
      imageUrl: '',
      otherData: {}
    }
  },
  created () {
    this.user = JSON.parse(JSON.stringify(this.$store.getters['user/getUser']))
    this.imageUrl = `http://localhost:8080/user/avatar?id=${this.user.id}`
  },
  methods: {
    handleAvatarSuccess (res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      window.location.reload()
    },
    beforeAvatarUpload (file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      this.otherData.id = this.user.id
      return isJPG && isLt2M
    },
    saveModify () {
      if (this.checkUser()) {
        this.$axios.patch('/api/user', this.user)
          .then((res) => {
            if (res.data.status === 'OK') {
              this.$message.success('保存成功')
            } else {
              this.$message.error('保存失败')
            }
          })
      }
    },
    checkUser () {
      if (this.user.password && this.user.password.trim() === '') {
        this.$message.error('密码不能为空')
        return false
      }
      if (this.user.email) {
        const reg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/
        if (!reg.test(this.user.email)) {
          this.$message.error('邮箱格式不正确')
          return false
        }
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 90%;
  margin: 5% auto;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.user-info {
  .user-info-field {
    margin: 20px 0;
  }
  .user-info-label {
    display: inline-block;
    width: 100px;
  }
  .el-input,
  .el-textarea__inner {
    width: 30%;
  }
}
</style>
