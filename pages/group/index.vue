<template>
  <div class="container">
    <div class="btns">
      <el-button type="primary" @click="dialog.newGroupDialog = true">
        新建共享
      </el-button>
      <div>
        <el-input v-model="id" style="width:100px" />
        <el-button @click="searchGroup">
          搜索
        </el-button>
      </div>
    </div>
    <div class="search-group-result">
      <div v-show="targetGroup !== undefined && targetGroup.id">
        {{ targetGroup.title }} <el-button type="primary" @click="joinGroup">
          申请加入
        </el-button>
      </div>
      <div v-show="targetGroup === undefined">
        没有id为{{ id }}的共享
      </div>
    </div>
    <div class="groups">
      <div v-for="group in groups" :key="group.id" class="group">
        <el-card class="box-card">
          <div class="group-title">
            <img :src="'http://localhost:8080/group/avatar?id=' + group.id">
            <h1>
              <nuxt-link :to="'/group/details?gid=' + group.id +'&path='+ encodeURI('/')">
                {{ group.title }}
              </nuxt-link>
            </h1>
          </div>
          <p>{{ group.biref }}</p>
        </el-card>
      </div>
    </div>
    <div class="dialogs">
      <el-dialog
        title="提示"
        :visible.sync="dialog.newGroupDialog"
        width="30%"
      >
        <div>
          <div class="group-info-field">
            <span class="group-info-filed" />
            <el-input v-model="newGroup.title" placeholder="请输入内容" />
          </div>
          <div class="group-info-field">
            <span class="group-info-field-label">简介</span>
            <el-input
              v-model="newGroup.biref"
              type="textarea"
              autosize
              placeholder="简介"
            />
          </div>
          <div class="group-info-field">
            <el-checkbox v-model="newGroup.isReadable">
              是否可读
            </el-checkbox>
          </div>
          <div class="group-info-field">
            <el-checkbox v-model="newGroup.isWriteable">
              是否可写
            </el-checkbox>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialog.newGroupDialog = false">取 消</el-button>
          <el-button type="primary" @click="saveGroup">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      groups: [],
      newGroup: {
        title: '',
        brief: '',
        isReadable: true,
        isWriteable: true
      },
      dialog: {
        newGroupDialog: false
      },
      id: '',
      targetGroup: {}
    }
  },
  created () {
    this.getGroups()
  },
  methods: {
    getGroups () {
      this.$axios.get('/api/user/group')
        .then((res) => {
          if (res.data.status === 'OK') {
            this.groups = res.data.map.groups
          }
        })
    },
    saveGroup () {
      if (this.checkGroup()) {
        this.$axios.post('/api/group', {
          title: this.newGroup.title,
          brief: this.newGroup.brief,
          isReadable: this.newGroup.isReadable,
          isWriteable: this.newGroup.isWriteable
        })
          .then((res) => {
            if (res.data.status === 'OK') {
              this.$message.success('创建成功')
            } else {
              this.$message.error('创建失败')
            }
          })
      }
    },
    checkGroup () {
      if (this.newGroup.title.trim() === '') {
        this.$message.error('共享名称不能为空')
        return false
      }
      return true
    },
    searchGroup () {
      if (this.id.trim() === '') {
        this.$message.error('id不能为空')
        return
      }
      this.$axios.get('/api/group?gId=' + this.id)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.targetGroup = res.data.map.group
          } else {
            this.targetGroup = undefined
          }
        })
    },
    joinGroup () {
      for (let i = 0; i < this.groups.length; ++i) {
        if (this.groups[i].id === this.targetGroup.id) {
          this.$message.info('您已在当前共享组中')
          return
        }
      }
      this.$axios.post('/api/group/user', {
        gId: this.targetGroup.id
      })
        .then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('申请提交成功')
          } else {
            this.$message.error('申请提交失败')
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 90%;
  margin: 5% auto;
}
.groups{
  display: flex;
  flex-wrap: wrap;
  .group {
    .group-title {
      display: flex;
      align-items: center;
      img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
    width: 300px;
    margin: 20px;
    a {
      text-decoration: none;
      color: #000;
    }
  }
}
.btns {
  display: flex;
  justify-content: space-between;
}
</style>
