<template>
  <div class="originater_dialog originator_dialog">
    <div :class="[closeShow?'pc-candidates':'pc-candidates pc-background']">
      <div class="dialog_content" v-dialog-drag>
        <el-main :class="closeShow ? '' : 'originator-dialog'"
                 :style="closeShow ? { 'padding': '0', 'overflow': 'hidden'} :{ 'position': 'absolute',
                                           'top': dialogTop + 'px',
                                           'left': dialogLeft + 'px' }">
          <div class="top" :class="closeShow ? '' : 'originator-dialog-title'" v-show="!closeShow">{{t('choosePerson.personSelection')}}
            <span style="font-size: 30px;cursor: pointer;float:right;padding-right:5px" @click="close">×</span>
          </div>
          <!-- 离职人员 begin -->
          <div  v-show="activeName == 'second'" class="clearfix" style="position: absolute;right:50px;padding-top:10px;z-index: 1;">
            <el-checkbox @change="onChangeUser" v-model="checked">{{t('choosePerson.departureStaff')}}</el-checkbox>
          </div>
          <!-- 离职人员 end -->
          <el-tabs type="card"
                   @tab-click="handleClick"
                   v-loading="loading"
                   v-model="activeName"
                   :element-loading-text="t('choosePerson.tip01')"
                   element-loading-background="rgba(255, 255, 255, 0.8)">
            <el-tab-pane name="first" :label="t('choosePerson.lately')" icon="iconfont icon-member">
              <!-- 最近 -->
              <div class="candidates-recently">
                <div class="recent">
                  <el-row style="margin-top: 10px;height: 16px;line-height: 16px">
                    <el-col :span="12" style="padding-left: 8px">{{t('choosePerson.recentContacts')}}</el-col>
                    <el-col :span="12" class="clearPe"><span @click="clearLinkman" >{{t('choosePerson.clearContacts')}}</span></el-col>
                  </el-row>
                  <!--多选-->
                  <div v-if="!oneCheck" >
                    <el-row >
                      <el-checkbox :indeterminate="isIndeter" v-model="historyChecked" @change="handleCheckAll" style="padding-top:6px;padding-left:8px;">{{t('button.allElections')}}
                      </el-checkbox>
                    </el-row>
                    <el-row >
                      <el-checkbox-group v-model="selectedPerson" @change="historyCheckedlist">
                        <el-col :span="12"  v-for="item in people" :key="item.oftenUsedVankeId" class="checkson">
                          <el-checkbox :label="item" style="padding-left: 8px" :checked="item.checked">
                            <p> {{item.name}}</p>
                            <p class="category" :title="item.itemLink">{{item.itemLink}}</p>
                          </el-checkbox>
                        </el-col>
                      </el-checkbox-group>
                    </el-row>
                    <!--多选 end-->
                  </div>
                  <!--单选-->
                  <div v-else-if="oneCheck" >
                    <el-checkbox-group  v-model="selectedPerson"  class="historyCheckbox" style="padding-top: 8px">
                      <el-row>
                        <el-col :span="12" v-for="item in people" :key="item.userId" >
                          <el-checkbox-button :label="item" :checked="item.checked">
                            <div class="historyCheckboxContent" @click="historyCheckeds(item)" @dblclick="dbhistory(item)">
                              <h4 class="iconfont icon-personnel icosn"></h4>
                              <div class="historyCheckboxSon">
                                <p class="peoplename"> {{item.name}}</p>
                                <p id="delacate" :title="item.itemLink">{{item.itemLink}}</p>
                              </div>
                            </div>
                          </el-checkbox-button>
                        </el-col>
                      </el-row>
                    </el-checkbox-group>
                  </div>
                  <!--单选end-->
                </div>
                <p v-show="people.length == 0" class="isShow">{{t('choosePerson.tip02')}}</p>
              </div>
            </el-tab-pane>
            <el-tab-pane name="second" :label="t('choosePerson.employee')" icon="el-icon-time">
              <!-- 人员 -->
              <div class="candidates-recently">
                <div class="people">
                  <div class="title  title-border">
                    <!--** 面包屑 begin -->
                    <el-breadcrumb separator-class="el-icon-arrow-right">
                      <el-breadcrumb-item>{{t('choosePerson.home')}}</el-breadcrumb-item>
                      <el-breadcrumb-item :title="tooltipOrganName">{{bread}}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <!--** 面包屑 end -->
                    <!-- 搜索框 -->
                    <span class="rightInput">
                        <el-input v-model="peopleSearch"
                                  prefix-icon="el-icon-search"
                                  :placeholder="t('choosePerson.placeholder01')" size="mini"
                                  @keyup.enter.native="searchPeople">
                        </el-input>
                      </span>
                  </div>
                  <div class="content clearfix">
                    <div class="content-left">
                      <div class="title">
                        <!-- 搜索  begin -->
                        <el-input :placeholder="t('choosePerson.placeholder02')" prefix-icon="el-icon-search"  v-model="organizationSearch" size="mini"> </el-input>
                        <!-- 搜索  end -->
                      </div>
                      <el-tree
                        empty-text=""
                        :expand-on-click-node ="false"
                        :data="organizationData"
                        node-key="orgID"
                        :highlight-current="true"
                        :props="defaultProps"
                        :default-expanded-keys="defaultKeys"
                        :default-checked-keys="defaultKeys"
                        ref="orgTree"
                        @node-click="handleNodeClick"
                        :filter-node-method="filterNode">
                      </el-tree>
                    </div>
                    <div class="content-right">
                      <!-- 复选框 -->
                      <el-checkbox :indeterminate="isIndeterminate"  v-if="!oneCheck" v-model="checkAll" @change="handleCheckAllChange" style="padding-top:6px;padding-left:20px;">{{t('button.allElections')}}</el-checkbox>
                      <!-- 单选 -->
                      <el-checkbox-group class="theRadio" v-if="oneCheck"  v-model="selectedPerson" >
                        <el-checkbox-button v-for="item in personnelList" :label="item" :key="item.userId" :checked="item.checked">
                          <div class="media">
                            <div class="media-body"  @click="clickPerson(item)"  @dblclick="dblclickCheckedCitie(item)">
                              <h4 class="media-heading  iconfont icon-personnel"  v-html="item.name + ((item.accountType !=null && item.accountType !='E')?'<font color=red>【'+item.accountType+'】</font>':'')"></h4>
                              <div style="text-align: left; line-height: 16px; height: 14px;" :title="item.itemLinkToop">{{item.itemLink}}</div>
                            </div>
                          </div>
                        </el-checkbox-button>
                      </el-checkbox-group>
                      <!-- 多选 -->
                      <el-checkbox-group class="mut-check"  v-else v-model="selectedPerson" @change="handleCheckedCitiesChange">
                        <el-checkbox v-for="item in personnelList" :label="item" :key="item.userId" :checked="item.checked">
                          <div class="media">
                            <div class="media-body">
                              <h4 class="media-heading"  v-html="item.name + ((item.accountType !=null && item.accountType !='E')?'<font color=red>【'+item.accountType+'】</font>':'')"></h4>
                              <div style="text-align: left; line-height: 16px; height: 14px;" :title="item.itemLinkToop">{{item.itemLink}}</div>
                            </div>
                          </div>
                        </el-checkbox>
                      </el-checkbox-group>
                      <p v-show="personnelList.length==0" class="isShow" >{{t('choosePerson.placeholder02')}}</p>
                      <p class="load-more" v-show="personnelList.length >= 5 && personnelList.length < total" @click="loadMore()">
                        {{t('choosePerson.placeholder01')}}
                        <i class="el-icon-caret-bottom" style="color: #119cff;"></i>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <div class="addrecently-box" v-bind:class="{ pullup: isActive }" >
              <div class="addrecently">
                <div class="media">
                  <div class="pull"  @click="isActive = !isActive"></div>
                  <ul class="clearfix">
                    <div class="clearBtn" v-show="selectedPerson.length>0" @click="clerarUser"></div>
                    <li v-for="(person, index) in selectedPerson" :key="index">
                      <div class="media-body">
                        <i class="el-icon-circle-close"  @click="deleteUser(index)"></i>
                        <span class="media-heading" >{{  person.name }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="addrecently-footer">
              <!-- TO DO UI中有地址本功能，暂注释-->
              <!-- <a href="#" ><i class="iconfont icon-install"></i><span>设置我的地址本</span></a> -->
              <el-button type="primary" @click="confirmSelect" icon="el-icon-circle-check-outline" size="mini">{{t('button.confirm')}}</el-button>
              <el-button type="primary" @click="close" icon="el-icon-circle-close-outline" size="mini">{{t('button.cancel')}}</el-button>
            </div>
          </el-tabs>
        </el-main>
      </div>
    </div>
  </div>
</template>
<script>
  import request from '@/utils/request'
  import Locale from '../../../src/mixins/locale';
  export default {
    name: 'ChoosePersonComponent',
    mixin: [Locale],
    props: {
      childDataUrl: {
        type: Object,
        required: true
      },
      queryName: '',
      closeShow: false,
      oneCheck: false,
    },
    watch: {
      organizationSearch(val) {
        // 搜索组织
        this.personnelList = []
        this.$refs.orgTree.filter(val)
      },
      peopleSearch(val) {
        this.peopleSearch = val.replace(/\s+/g, '')
        if (val.trim() === '') {
          this.personnelList = []
        }
        if ((!/^[\u3220-\uFA29]+$/.test(val) && val.length >= 2) || (/^[\u3220-\uFA29]+$/.test(val) && val.length >= 1) ) {
          this.searchPeople()
        }
      }
    },
    created() {
      const that = this
      const selectedPerson = []
      // 页面加载 处理回填的 选中数据
      if (that.childDataUrl.selectedPerson) {
        for (const item of that.childDataUrl.selectedPerson) {
          console.log(typeof item)
          // 校验数据格式
          if (typeof item === 'object') {
            item.name = item.value
            const dialogperson = Object.assign({}, item)
            selectedPerson.push(dialogperson)
          }
        }
        that.selectedPerson = selectedPerson
      }
    },
    mounted() {
      // 获取最近联系人
      this.getLatelyContacts()
    },
    data() {
      return {
        dialogTop: (document.documentElement.clientHeight - 526) / 2,
        dialogLeft: (document.documentElement.clientWidth - 610) / 2,
        dialogVisible: true,
        // 已选择人员数组
        selectedPerson: this.selected || [],
        // 控制loading
        loading: false,
        // 最近联系人数据
        people: [],
        // 最近选择的 全选状态
        historyChecked: false,
        // 最近选择的 多选状态
        isIndeter: false,
        // 默认选择 最近
        activeName: 'first',
        // 记录上次 tab name
        historyActiveTabName: 'first',
        // 部门数据
        organizationData: [],
        // 缓存部门数据
        cacheOrganizationData: {
          // 在职
          onJob:[],
          // 不在职
          notJob: []
        },
        // 面包屑 显示部门全路径
        bread: '',
        // 离职人员状态
        checked: false,
        // 人员搜索框 bind 值
        peopleSearch: '',
        // 人员 多选框 全选、反选 状态
        checkAll: false,
        // 人员 多选框 多选 状态
        isIndeterminate: false,
        // 右侧人员数据
        personnelList: [],
        // 部门全名 集合
        orgNames: [],
        // 部门全名显示数据
        tooltipOrganName: '',
        // 组织部门 tree
        defaultProps: {
          id: 'orgID',
          children: 'm_ChildOrg',
          label: 'orgName'
        },
        // 组织部门 tree  默认展开的节点 Id
        defaultKeys:[],
        // 组织部门 搜索框 值
        organizationSearch: '',
        // 控制折叠
        isActive: false,
        // 当前页码
        pageIndex: 0,
        // 总条目数
        total: 0,
        // 每页显示 条目数
        pageSize: 5,
        // 当前选择的 部门
        originatorUser: {
          orgID: '',
          orgName: ''
        }
      }
    },
    methods: {
      // 加载更多
      loadMore() {
        this.pageIndex++
        if (this.checked) {
          // 获取 离职 组织人员 数据
          this.getLeaveUserPage(this.originatorUser.orgID, this.peopleSearch, this.originatorUser.orgName)
        } else {
          // 获取 在职 组织 人员数据
          this.getUserPage(this.peopleSearch, this.originatorUser.orgID, '1', this.originatorUser.orgName)
        }
      },
      /**
       * 查询在职人员  加载更多 分页
       * @param name 用户名 查询条件
       * @param deptId  部门id
       * @param isWork  在职人员查询条件
       * @param linkName 部门全名
       */
      getUserPage(name, deptId, isWork, linkName) {
        this.loading = true
        // 重置  人员的 勾选 状态
        this.checkAll = false
        this.isIndeterminate = false
        request({
          url: `vanke-group-rest/api/getUser?pageIndex=${this.pageIndex}&pageSize=${this.pageSize}`,
          method: 'POST',
          data: {
            name: name,
            deptId: deptId,
            isWork: isWork
          }
        }).then(res => {
          // 追加分页数据
          const list = this.handleToOnJobData(res.result, linkName)
          for (const item of list) {
            this.personnelList.push(item)
          }
          // 设置人员勾选状态
          this.handlePersonnelListChecked()
          this.loading = false
        }).catch(err => {
          this.loading = false
          this.$message.error(`${this.t('choosePerson.error01')}ERROR MESSAGE:${err}`)
        })
      },
      /**
       * 查询离职人员 加载更多 分页
       * @param orgId  部门id
       * @param name 用户名
       * @param linkName 部门全名
       */
      getLeaveUserPage(orgId, name, linkName) {
        this.loading = true
        // 重置  人员的 勾选 状态
        this.checkAll = false
        this.isIndeterminate = false
        // * Unless required by applicable law or agreed to in writing, software
        // * distributed under the License is distributed on an "AS IS" BASIS,
        // * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
        // * See the License for the specific language governing permissions and
        // * limitations under the License.
        request({
          url: `vanke-group-rest/api/getOutUser?pageIndex=${this.pageIndex}&pageSize=${this.pageSize}`,
          method: 'POST',
          data: {
            orgId: orgId,
            name: name
          }
        }).then(res => {
          const list = this.handleToNotJobData(res.result, linkName)
          for (const item of list) {
            this.personnelList.push(item)
          }
          // 设置人员勾选状态
          this.handlePersonnelListChecked()
          this.loading = false
        }).catch(err => {
          this.loading = false
          this.$message.error(`${this.t('choosePerson.error02')}ERROR MESSAGE:${err}`)
        })
      },
      // 获取最近联系人
      getLatelyContacts() {
        this.loading = true
        // 重置 勾选状态
        this.historyChecked = false
        this.isIndeter = false
        this.people = []
        request({
          url: 'vanke-group-rest/api/oftenUser/page',
          method: 'POST',
          data: {}
        }).then(res => {
          // 处理数据
          this.people = this.handleLatelyContactsData(res.oftenUserList)
          // 重新设置勾选状态
          this.setLatelyContactsCheck()
          this.loading = false
        }).catch(err => {
          this.loading = false
          this.$message.error(`${this.t('choosePerson.error03')}ERROR MESSAGE:${err}`)
        })
      },
      /**
       * 处理 最近联系人 数据
       * @param {Array} list 查询的数据
       * @returns {Array} 处理后的数据
       */
      handleLatelyContactsData(list) {
        // 获取所有 已经选择的 人员Id
        const historyUserIds = this.getSelectPersonUserId(this.selectedPerson)
        const data = []

        for (const it of list) {
          let checked = false
          // 筛选已经选中的人员
          if (historyUserIds.indexOf(it.oftenUsedAD) !== -1) {
            checked = true
            // 删除已经存在的数据
            this.delSelectedPerson(it.oftenUsedAD)
          }

          if (it.displayName) {
            data.push({
              'name': it.displayName,
              'itemLink': `${it.deptId}-${it.companyName}`,
              'checked': checked,
              'userId': it.oftenUsedAD,
              'vankeId': it.oftenUsedVankeId
            })
          }
        }
        return data
      },

      // 设置 最近 联系人 勾选状态
      setLatelyContactsCheck() {
        let count = 0
        for (const it of this.people) {
          if (it.checked) {
            count++
          }
        }
        this.historyChecked = count > 0 && count === this.people.length
        this.isIndeter = count > 0 && count < this.people.length
      },

      // 清空最近联系人
      clearLinkman() {
        this.loading = true
        request({
          url: 'vanke-group-rest/api/oftenUser',
          method: 'POST',
          data: {}
        }).then(res => {
          // 重置 勾选状态
          this.historyChecked = false
          this.isIndeter = false
          // 清空数据
          this.people = []
          this.loading = false
        }).catch(err => {
          this.loading = false
          this.$message.error(`${this.t('choosePerson.error04')}ERROR MESSAGE:${err}`)
        })
      },

      // 删除 已经存在的 最近联系人 (应为设置数据 checked = true 会自动添加进去 防止数据重复 )
      delSelectedPerson(userid) {
        for (let i = 0; i < this.selectedPerson.length; i++) {
          if (this.selectedPerson[i].userId === userid) {
            this.selectedPerson.splice(i, 1)
          }
        }
      },
      // 最近联系人 单选
      historyCheckeds(value) {
        const that = this
        that.selectedPerson.splice(0, that.selectedPerson.length - 1)
        that.selectedPerson[0] = value
      },
      // 历史记录 全选、反选
      handleCheckAll(val) {
        this.isIndeter = false
        if (val) {
          // 全选
          for (let i = 0; i < this.people.length; i++) {
            let bool = false
            for (let j = 0; j < this.selectedPerson.length; j++) {
              if (this.selectedPerson[j].userId === this.people[i].userId) {
                bool = true
              }
            }

            if (!bool) {
              this.selectedPerson.push(this.people[i])
            }
          }
        } else {
          // 反选
          for (let i = 0; i < this.people.length; i++) {
            let bool = false
            let index = null
            for (let j = 0; j < this.selectedPerson.length; j++) {
              if (this.selectedPerson[j].userId === this.people[i].userId) {
                bool = true
                index = j
                break
              }
            }

            if (bool) {
              this.selectedPerson.splice(index, 1)
            }
          }
        }
      },

      // 单选双击赋值
      dbhistory(item) {
        this.historyCheckeds(item)
        this.$emit('sureSubmit', { type: 'originator', peoArr: this.selectedPerson })
      },

      // 获取 已经选择的 人员Id
      getSelectPersonUserId() {
        const that = this
        const arrUserId = []
        for (const it of that.selectedPerson) {
          arrUserId.push(it.userId)
        }
        return arrUserId
      },
      /**
       * 查询 在职人员部门 数据
       * getTree
       */
      getTree() {
        const that = this
        that.loading = true
        that.organizationData = []
        request({
          url: `vanke-group-rest/api/${that.childDataUrl.getTree}`,
          method: 'POST',
          data: {
            orgDepId: 'A5A40ECE-0DBD-4F2B-89E8-6BA91B91EBF4'
          }
        }).then(res => {
          that.loading = false
          // 记录缓存
          that.cacheOrganizationData.onJob = res.result
          // 设置在职人员部门数据
          that.setOnJobTreeData(res.result)
        }).catch(err =>{
          that.loading = false
          that.$message.error(`${this.t('choosePerson.error05')}ERROR MESSAGE:${err}`)
        })
      },
      /**
       * 设置在职人员部门数据
       * @param {Array} list 查询的数据
       */
      setOnJobTreeData(list) {
        const that = this
        // 处理树数据
        that.organizationData = this.toTree(list, 'orgID', 'parentOrgID', 'm_ChildOrg')
        // 默认展开第一级
        that.defaultKeys[0] = that.organizationData[0].orgID
      },
      /**
       * 查询离职人员部门
       */
      dimissionDeid() {
        this.loading = true
        this.organizationData = []
        request({
          url: 'vanke-group-rest/api/getOrg',
          method: 'POST',
          data: {}
        }).then(res => {
          this.loading = false
          // 记录缓存
          this.cacheOrganizationData.notJob = res.data.result
          // 设置 不在职人员部门数据
          this.setNotJobTreeData(res.data.result)
        }).catch(err => {
          this.loading = false
          this.$message.error(`${this.t('choosePerson.error05')}ERROR MESSAGE:${err}`)
        })
      },
      /**
       * 设置 不在职人员部门数据
       * @param {Array} list 查询的数据
       */
      setNotJobTreeData(list) {
        const dimissList = []

        for (const item of list) {
          dimissList.push({
            orgID: item.orgid,
            parentOrgID: item.parentOrgId,
            orgName: item.orgName
          })
        }
        this.organizationData = this.toTree(dimissList, 'orgID', 'parentOrgID', 'm_ChildOrg')
        // 默认展开第一级
        this.defaultKeys[0] = this.organizationData[0].orgID
      },
      // 切换tab
      handleClick(tab) {
        const that = this

        switch (tab.name) {
          // 点击最近
          case 'first':
            if (tab.name !== that.historyActiveTabName) {
              // 获取最近联系人
              that.getLatelyContacts()
            }
            that.historyActiveTabName = 'first'
            break
          // 点击人员
          case 'second':
            if (tab.name !== that.historyActiveTabName && that.organizationData.length === 0) {
              // 查询部门组织树的数据
              that.getTree()
            }
            // 重置人员选择 多选框状态
            that.checkAll = false
            that.isIndeterminate = false
            that.personnelList = []
            that.historyActiveTabName = 'second'
            break
        }
      },

      // 新增 最近联系人
      addNewpeople() {
        const that = this
        const add = []
        for (const item of that.selectedPerson) {
          // 判断是否有vankeId字段
          if (item.vankeId) {
            add.push(item.vankeId)
            // 最多增加十个人员
            if (add.length >= 10) { break }
          }
        }
        // 添加 最近选择
        request({
          url: 'vanke-group-rest/api/oftenUser',
          method: 'POST',
          data: {
            oftenUsedVankeId: add
          }
        }).then(res => {

        }).catch(err => {

        })
      },
      // 勾选在职人员
      onChangeUser() {
        const that = this
        // 重置人员选择 多选框状态
        that.checkAll = false
        that.isIndeterminate = false
        // 清空部门搜索框
        that.organizationSearch = ''
        // 清空人员数据
        that.personnelList = []

        if (!that.checked) {
          // 获取 在职 组织 人员数据
          that.onChangeUserToOnJob()
        } else {
          // 获取 离职 组织人员 数据
          that.onChangeUserToNotJob()
        }
      },
      // 获取 在职 组织 人员数据
      onChangeUserToOnJob() {
        const that = this

        // 存在 人员搜索条件
        if (that.peopleSearch.trim() !== '') {
          that.getUser(that.peopleSearch, that.originatorUser.orgID, '1', that.originatorUser.orgName)
        }
        if (that.cacheOrganizationData.onJob.length === 0) {
          // 查询在职人员
          that.getTree()
        } else {
          // 取缓存数据
          // 设置在职人员部门数据
          that.setOnJobTreeData(that.cacheOrganizationData.onJob)
        }
      },
      // 获取 离职 组织人员 数据
      onChangeUserToNotJob() {
        const that = this

        // 存在 人员搜索条件
        if (that.peopleSearch.trim() !== '') {
          // 查询离职人员
          that.getleaveUser(that.originatorUser.orgID, that.peopleSearch, that.originatorUser.orgName)
        }
        if (that.cacheOrganizationData.notJob.length === 0) {
          // 查询离职人员
          that.dimissionDeid()
        } else {
          // 取缓存数据
          // 设置 不在职人员部门数据
          that.setNotJobTreeData(that.cacheOrganizationData.notJob)
        }
      },
      /**
       * 过滤组织选择
       */
      filterNode(value, data) {
        if (!value) return true
        return data.orgName.indexOf(value) !== -1
      },
      /**
       * 查询在职人员
       * @param name 用户名 查询条件
       * @param deptId  部门id
       * @param isWork  在职人员查询条件
       * @param linkName 部门全名
       */
      getUser(name, deptId, isWork, linkName) {
        const that = this
        that.loading = true
        // 重置  人员的 勾选 状态
        that.checkAll = false
        that.isIndeterminate = false
        // 重置分页的 数据
        that.pageIndex = 0 // 当前页码
        that.pageSize = 5 // 每页显示 条目数
        that.total = 0 // 总条目数
        // 重置人员数据
        that.personnelList = []
        request({
          url: `vanke-group-rest/api/getUser?pageIndex=0&pageSize=${that.pageSize}`,
          method: 'POST',
          data: {
            name: name,
            deptId: deptId,
            isWork: isWork
          }
        }).then(res => {
          // 总条目数
          if (res.pageControllerInfo) {
            that.total = res.pageControllerInfo.totalRecordCount
          }
          that.personnelList = that.handleToOnJobData(res.result, linkName)
          // 设置人员勾选状态
          that.handlePersonnelListChecked()
          that.loading = false
        }).catch(err => {
          that.loading = false
          that.$message.error(`${this.t('choosePerson.error01')}ERROR MESSAGE:${err}`)
        })
      },
      // 处理 在职人员 数据
      handleToOnJobData(list, linkName) {
        const that = this
        const data = []
        for (const it of list) {
          let itemLink = ''
          if (!linkName || linkName.trim() === '') {
            itemLink = (it.companyName) ? `${it.companyName}-${it.orgNameFullPath}`:it.orgNameFullPath;
            if (!itemLink) { itemLink = '' }
          } else {
            itemLink = linkName
          }
          const itemLinkToop = itemLink
          if (itemLink.length > 18) {
            itemLink = itemLink.substr(0, 18) + '...'
          }

          let checked = false
          for (let i = 0; i < that.selectedPerson.length; i++) {
            if (that.selectedPerson[i].userId === it.adAccount) {
              checked = true
              that.selectedPerson.splice(i, 1)
              break
            }
          }
          data.push({
            'name': (it.displayName === '0' || it.displayName === '' || it.displayName === null) ? it.userName : it.displayName,
            'itemLink': itemLink,
            'checked': checked,
            'itemLinkToop': itemLinkToop,
            'userId': it.adAccount,
            'accountType': it.accountType,
            'vankeId': it.vankeId
          })
        }
        // 设置人员勾选状态
        that.handlePersonnelListChecked()
        return data
      },
      /**
       * 查询离职人员
       * @param orgId  部门id
       * @param name 用户名
       * @param linkName 部门全名
       */
      getleaveUser(orgId, name, linkName){
        const that = this
        that.loading = true
        // 重置  人员的 勾选 状态
        that.checkAll = false
        that.isIndeterminate = false
        // 重置分页的 数据
        that.pageIndex = 0 // 当前页码
        that.pageSize = 5 // 每页显示 条目数
        that.total = 0 // 总条目数
        // 重置人员数据
        that.personnelList = []
        request({
          url: `vanke-group-rest/api/getOutUser?pageIndex=0&pageSize=${that.pageSize}`,
          method: 'POST',
          data: {
            orgId: orgId,
            name: name
          }
        }).then(res => {
          // 总条目数
          if (res.pageControllerInfo) {
            that.total = res.pageControllerInfo.totalRecordCount
          }
          that.personnelList = that.handleToNotJobData(res.result, linkName)
          // 设置人员勾选状态
          that.handlePersonnelListChecked()
          that.loading = false
        }).catch(err => {
          that.loading = false
          that.$message.error(`${this.t('choosePerson.error02')}ERROR MESSAGE:${err}`)
        })
      },
      // 处理 离职人员 数据
      handleToNotJobData(list, linkName) {
        const that = this
        const data = []
        for (const item of list) {
          const userId = item.userId.slice(item.userId.indexOf('\\') + 2, item.userId.length)
          let checked = false
          for (let i = 0; i < that.selectedPerson.length; i++) {
            if (that.selectedPerson[i].userId === userId) {
              checked = true
              that.selectedPerson.splice(i, 1)
              break
            }
          }
          let itemLink = ''
          if (!linkName || linkName.trim() === '') {
            itemLink = item.orgName
            if (!itemLink) { itemLink = '' }
          } else {
            itemLink = linkName
          }

          const itemLinkToop = itemLink
          if (itemLink.length > 18) {
            itemLink = itemLink.substr(0, 18) + '...'
          }
          data.push({
            'name': item.name,
            'userId': userId,
            'checked': checked,
            'itemLink': itemLink,
            'itemLinkToop': itemLinkToop
          })
        }
        return data
      },
      // 设置人员勾选状态
      handlePersonnelListChecked() {
        const that = this
        let count = 0
        // 获取所有已经选中的人员Id
        const selectUserId = that.getSelectedPersonUserIds()
        for (const it of that.personnelList) {
          // 右侧数据 checked = true || 已经选中的人员Id包涵
          if (it.checked || selectUserId.indexOf(it.userId) > -1) {
            count++
          }
        }
        that.checkAll = count > 0 && count === that.personnelList.length
        that.isIndeterminate = count > 0 && count < that.personnelList.length
      },
      // 搜索人员 模糊查询
      searchPeople() {
        const that = this
        that.isIndeterminate = false // checkbox恢复初始
        if (!that.checked) {
          // 查询在职人员
          that.getUser(that.peopleSearch, that.originatorUser.orgID, '1', that.originatorUser.orgName)
        } else {
          // 查询离职人员
          that.getleaveUser(that.originatorUser.orgID, that.peopleSearch, that.originatorUser.orgName)
        }
      },
      // 关闭 弹窗
      close() {
        this.$emit('hideComponent')
      },
      // 全选/反选
      handleCheckAllChange(val) {
        this.isIndeterminate = false
        if (val) {
          for (let i = 0; i < this.personnelList.length; i++) {
            let bool = false
            for (let j = 0; j < this.selectedPerson.length; j++) {
              if (this.selectedPerson[j].userId === this.personnelList[i].userId) {
                bool = true
              }
            }
            if (!bool) {
              this.selectedPerson.push(this.personnelList[i])
            }
          }
        } else {
          for (let i = 0; i < this.personnelList.length; i++) {
            let bool = false
            let index = null
            for (let j = 0; j < this.selectedPerson.length; j++) {
              if (this.selectedPerson[j].userId === this.personnelList[i].userId) {
                bool = true
                index = j
                break
              }
            }
            if (bool) {
              this.selectedPerson.splice(index, 1)
            }
          }
        }
      },
      // 人员选择  多选
      handleCheckedCitiesChange(val) {
        const count = this.reckonCount(this.personnelList)
        this.checkAll = count > 0 && count === this.personnelList.length
        this.isIndeterminate = count > 0 && count < this.personnelList.length
      },
      // 历史记录单选
      historyCheckedlist(value) {
        const count = this.reckonCount(this.people)
        this.historyChecked = count > 0 && count === this.people.length
        this.isIndeter = count > 0 && count < this.people.length
      },
      // 选择人员 单选
      clickPerson(value) {
        this.selectedPerson.splice(0, this.selectedPerson.length)
        this.selectedPerson.push(value)
      },

      // 单选 双击右侧列表直接选中赋值
      dblclickCheckedCitie(item){
        this.clickPerson(item)
        this.addNewpeople()
        this.$emit('sureSubmit', { type: 'originator', peoArr: this.selectedPerson })
      },
      // 删除人员
      deleteUser(index) {
        const that = this
        that.selectedPerson.splice(index, 1)
        // 最近联系人
        const count = that.reckonCount(that.personnelList)
        that.checkAll = count > 0 && count === that.personnelList.length
        that.isIndeterminate = count > 0 && count < that.personnelList.length
        // 人员选择
        const counts = that.reckonCount(that.people)
        that.historyChecked = counts > 0 && counts === that.people.length
        that.isIndeter = counts > 0 && counts < that.people.length
      },
      // 计算count
      reckonCount(list){
        let count = 0
        const userIds = this.getSelectedPersonUserIds()
        for (const it of list) {
          if (userIds.indexOf(it.userId) > -1) {
            count++
          }
        }
        return count
      },
      // 获取所有被选中人员ID
      getSelectedPersonUserIds(){
        const userIds = []
        for (const it of this.selectedPerson) {
          userIds.push(it.userId)
        }
        return userIds
      },
      // 清除所有勾选人员
      clerarUser() {
        this.selectedPerson.splice(0, this.selectedPerson.length)
        // 重置 最近选择 跟人员的 勾选 状态
        this.isIndeter = false
        this.historyChecked = false
        this.checkAll = false
        this.isIndeterminate = false
      },
      // 选择左侧列表
      handleNodeClick(data, node) {
        const that = this
        that.originatorUser.orgID = data.orgID
        that.orgNames = []
        that.getPrarentNode(node.parent)
        that.originatorUser.orgName = that.disposeOrganName(data.orgName)

        // 获取所有上级节点
        if (!that.checked) {
          // 查询在职人员
          that.getUser(that.peopleSearch, data.orgID, '1', that.originatorUser.orgName)
        } else {
          // 查询离职人员
          that.getleaveUser(data.orgID, that.peopleSearch, that.originatorUser.orgName)
        }
      },
      /**
       * 处理部门全名称
       */
      disposeOrganName(orgName) {
        let organName = ''
        // 获取完整的组织结构名称
        for (const it of this.orgNames){
          organName += `${it.text}-`
        }
        organName += `${orgName}`
        this.tooltipOrganName = organName
        if (organName.length > 27){
          this.bread = organName.substr(0, 27) + '...'
        } else {
          this.bread = organName
        }
        return organName
      },
      // 获取所有上级节点
      getPrarentNode(pNode) {
        if (pNode.data.orgName) {
          this.orgNames.unshift({
            text: `${pNode.data.orgName}`,
            petId: `${pNode.data.orgID}`
          })
        }
        if (pNode.parent) {
          this.getPrarentNode(pNode.parent)
        }
      },
      // 选择人员确定
      confirmSelect() {
        this.addNewpeople()
        this.$emit('sureSubmit', { type: 'originator', peoArr: this.selectedPerson })
      },
      /**
       * list to tree
       * @param {Array} data [数据 ]
       * @param {String} id  [主键 key]
       * @param {String} pid [父级主键 key]
       * @param {String} children [子级 key]
       * @returns
       */

      toTree(data, id, pid, children) {
        if (data === null || data.length === 0) return []
        data.forEach(function(item) {
          delete item[children]
        })
        const map = {}
        data.forEach(function(item) {
          map[item[id]] = item
        })

        const val = []
        data.forEach(function(item) {
          const parent = map[item[pid]]
          if (parent) {
            (parent[children] || (parent[children] = [])).push(item)
          } else {
            val.push(item)
          }
        })
        return val
      }
    },
    computed: {
    }
  }
</script>

<style scoped lang="scss">
  .originater_dialog {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    .isShow{
      text-align: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform:translate(-50%,-50%);
      font-size: 12px;
      color: #606266;
    }
    .title-border {
      border-bottom: 1px solid #c0c0c0;
    }
    .el-dialog__headerbtn{
      top: 15px;
      font-size: 20px;
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background: #717273;
      opacity: .9;

    }

    .pc-candidates {
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 2002;
      background: hsla(0,0%,44%,.46);
      .el-tabs {
        padding: 28px 0;
        .el-tabs__item{
          height: 30px;
          line-height: 30px;
        }
      }
      .dialog_content {
        .top {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          color: #fff;
          height: 50px;
          line-height: 50px;
          background: #38acff;
          background: -webkit-linear-gradient(right, #3dd7fe , #3195f8); /* Safari 5.1 - 6.0 */
          background: -o-linear-gradient(left, #3dd7fe , #3195f8); /* Opera 11.1 - 12.0 */
          background: -moz-linear-gradient(left, #3dd7fe , #3195f8); /* Firefox 3.6 - 15 */
          background: linear-gradient(to left,  #3dd7fe , #3195f8); /* 标准的语法 */
          padding: 0 20px;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        }
      }
    }

    .clearfix:after {
      content: ".";
      display: block;
      height: 0;
      clear: both;
      visibility: hidden
    }

    #pane-1 .el-breadcrumb {
      font-size: 12px;
      padding-top: 16px;
    }

    #pane-0 .el-breadcrumb {
      font-size: 12px;
      padding-top: 16px;
    }
    .candidates-recently .recent{
      height: 369px;
      padding: 5px 20px;
      box-sizing: border-box;
      color: #c0c0c0;
      position: relative;
    }

    .candidates-recently .recent p{
      color: #3f464f;
    }
    .candidates-recently .recent .category{
      width: 245px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #a1a1a1;
    }
    .candidates-recently .recent .clearPe{
      text-align: right;
      color: #20a2ff;
      cursor: pointer;
    }
    .candidates-recently .el-tabs {
      position: relative;
    }

    .candidates-recently .title {
      box-sizing: border-box;
      padding-top: 13px;
      height: 40px;
      font-size: 12px;
      line-height: 40px;
      padding-left: 30px;
      color: #4e4e4e;
      background-color: #f7f7f7;
      position: relative;
      .rightInput {
        position: absolute;
        right: 26px;
        top: -3px;
      }
    }

    .title .el-button {
      position: absolute;
      right: 26px;
      top: 10px;
    }
    .candidates-recently .checkson {
      margin-top: 10px;
    }
    .candidates-recently .content {
      height: 330px;
      display: flex;
      padding: 10px;

      .content-right {
        position: relative;
        .mut-check{
          padding-left: 20px;
          padding-top: 5px;
        }
        .load-more {
          font-size: 12px;
          color: #119cff;
          position: absolute;
          left: 50%;
          -webkit-transform: translateX(-50%);
          -moz-transform: translateX(-50%);
          -ms-transform: translateX(-50%);
          -o-transform: translateX(-50%);
          transform: translateX(-50%);
          &:hover {
            cursor: pointer;
            text-decoration: underline;
          }
        }
      }
    }
    .content .content-right .mut-check .media {
      height: 30px;
      color: #a1a1a1;
      font-size: 12px;
    }
    // .content .content-right  .mut-check .media-object {
    //   width: 40px;
    //   height: 40px;
    //   border-radius: 40px;
    //   background: pink;

    //   position: absolute;
    //   left: 20px;
    //   top: 20px;
    // }
    .content .content-right  .mut-check .media-body {
      padding-left: 8px;
      padding-top: 5px;
      padding-bottom: 5px;
      width: 218px;

      position: absolute;
      left: 20px;
      top: -5px;
    }
    .media-body .media-heading {
      text-align: left;
      font-weight: 100;
      color: #3f464f;
    }
    // 单选调出部门路径调整  bgin
    .content .theRadio .media-body{
      height: 48px;
      padding-left: 45px;
      line-height: 34px;
      & .media-heading {
        height: 26px;
        font-size: 12px;
        &::before{
          // content: ''; //字体图标content占用
          position: absolute;
          top: 8px;
          left:14px;
          height: 40px;
          width: 10%;
        }

        &.icon-personnel:before{
          font-size: 20px;
          color: #6cd0ff;
        }

      }
    }
    //单选调出部门路径调整   end
    .media-body h4, .media-body div {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-checkbox-group > .el-checkbox {
      margin-left: 0;
      padding-bottom: 10px;
    }

    .addrecently  .media {

      // width: 120px;
      width: 100%;
      text-align: center;
      margin-right: 10px;
      padding-top: 10px;
      padding-bottom: 10px;
      float: left;
      line-height: 30px;
    }

    .addrecently .media:last-child {
      margin-right: 0px
    }


    // .addrecently .media-object {
    //   width: 40px;
    //   height: 40px;
    //   border-radius: 40px;
    //   background: pink;
    // }


    .addrecently {
      // border-bottom: 1px solid #c0c0c0;
      overflow: hidden;
    }

    .candidates-organization .title,
    .candidates-recently .title-search {
      height: 50px;
      line-height: 50px;
      padding-left: 30px;
      color: #4e4e4e;
      position: relative;
    }

    .candidates-organization .title .el-breadcrumb,
    .candidates-recently .title-search .el-breadcrumb {
      padding-top: 20px;
    }

    .content-left .el-input {
      width: 250px;

      position: absolute;
      left: 26px;
      top: 0;
    }

    .pc-candidates .el-tabs {
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
      position: relative;

    }
    .pc-candidates .candidates-onthejob {
      /* position:absolute;
      right:26px;
      top:0px; */
      background-color: #ffffff;

    }

    .candidates-organization .content .content-left,
    .candidates-organization .content .content-right {
      height: 270px;
      width: 50%;
      border: 1px solid #e4e7ed;
      box-sizing: border-box;
      padding: 10px;
      overflow: auto;
    }

    .addrecently-footer{
      a{
        color: #1fa2ff;
        position: absolute;
        top:16px;
        left:20px;
        text-decoration: none;

        i{
          font-weight:100;
          font-size:12px;
          padding-right: 5px;
        }

        span{
          text-decoration: underline;
        }
      }
    }

    .addrecently li{
      float: left;
      margin-right: 20px;
    }
  }
</style>
