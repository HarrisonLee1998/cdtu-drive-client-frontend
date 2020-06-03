<template>
  <div class="container">
    <template>
      <el-tabs v-model="activeName">
        <el-tab-pane label="文件列表" name="first">
          <GroupFileList />
        </el-tab-pane>
        <el-tab-pane label="组内成员" name="second">
          <GroupUserList />
        </el-tab-pane>
        <el-tab-pane :disabled="!showAttr" label="属性设置" name="third">
          <GroupAttr v-show="showAttr" />
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<script>
import GroupFileList from '~/components/group/GroupFileList'
import GroupUserList from '~/components/group/GroupUserList'
import GroupAttr from '~/components/group/GroupAttr'
export default {
  components: {
    GroupFileList,
    GroupUserList,
    GroupAttr
  },
  data () {
    return {
      activeName: 'first',
      showAttr: false,
      gId: null
    }
  },
  created () {
    const id = this.$route.query.gid
    if (id) {
      this.gId = id
      this.getGroupUser()
    } else {
      this.$router.push('/404')
    }
  },
  methods: {
    getGroupUser () {
      this.$axios.get(`/api/group/user?gId=${this.gId}`)
        .then((res) => {
          console.log(res)
          if (res.data.status === 'OK') {
            const groupUser = res.data.map.groupUser
            if (groupUser.guType < 2) {
              this.showAttr = true
            }
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
</style>
