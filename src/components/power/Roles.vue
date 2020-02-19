<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="rolesDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand" label="展开">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom',i1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="rmRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="rmRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      @close="rmRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="roleName">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRolesList(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="delRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框区域 -->
      <el-dialog
        title="添加角色"
        :visible.sync="rolesDialogVisible"
        width="50%"
        @close="addDialogClose"
      >
        <!-- 主体区域 -->
        <el-form ref="addRolesRef" :model="addRolesForm" :rules="addFormRules" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="rolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框区域 -->
      <el-dialog
        title="修改角色信息"
        :visible.sync="rolesEditDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <!-- 主体区域 -->
        <el-form ref="editRolesRef" :model="editRolesForm" :rules="addFormRules" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="rolesEditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightsDialogClose">
      <!-- 树形控件 -->
      <el-tree ref="treeRef" node-key="id" default-expand-all :default-checked-keys="defKeys" show-checkbox :data="rightsList" :props="treeProps"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      roleList: [],
      //添加角色表单
      addRolesForm: {
        roleName: "",
        roleDesc: ""
      },
      // 要修改的角色信息
      editRolesForm: {},
      //是否显示添加角色对话框
      rolesDialogVisible: false,
      //是否显示修改角色对话框
      rolesEditDialogVisible: false,
      // 添加、修改角色校验规则
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ]
      },
      //控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      //分配权限列表
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      //默认选中的节点Id值数组
      defKeys: [],
      //分配权限的角色ID
      roleId: ''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表数据
    getRolesList() {
      this.$http.get("roles").then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg);
        }
        this.roleList = res.data.data;
      });
    },
    //关闭添加角色后重置
    addDialogClose() {
      this.$refs.addRolesRef.resetFields();
    },
    //修改角色对话框的重置,主要重置校验规则
    editDialogClose() {
      this.$refs.editRolesRef.resetFields();
    },
    // 确认添加角色
    addRoles() {
      this.$refs.addRolesRef.validate(valid => {
        //判断校验是否通过
        if (!valid) return;
        //发送网络请求
        this.$http.post("roles", this.addRolesForm).then(res => {
          if (res.data.meta.status !== 201)
            return this.$message.error(res.data.meta.msg);
          //提示添加成功
          this.$message.success(res.data.meta.msg);
          //重新获取列表数据
          this.getRolesList();
          // 关闭对话框
          this.rolesDialogVisible = false;
        });
      });
    },
    //编辑角色点击
    editRolesList(id) {
      //根据id获取角色列表
      this.$http.get("roles/" + id).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg);
        }
        this.editRolesForm = res.data.data;
      });
      this.rolesEditDialogVisible = true;
    },
    //确认修改角色事件
    editRoles() {
      this.$refs.editRolesRef.validate(valid => {
        if (!valid) return;
        //发送网络请求
        this.$http
          .put("roles/" + this.editRolesForm.roleId, {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          })
          .then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg);
            }
            this.$message.success("修改成功");
            //重新获取数据列表
            this.getRolesList();
            //关闭对话框
            this.rolesEditDialogVisible = false;
          });
      });
    },
    // 删除事件
    delRoles(id) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 发送网络请求
          this.$http.delete("roles/" + id).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error(res.data.meta.msg);
            }
            //重新加载列表
            this.getRolesList();
            this.$message({
              type: "success",
              message: "删除成功!"
            });
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //根据ID删除对应权限
    rmRightById(role, rightId) {
      //提示弹框是否确认删除
      this.$confirm("此操作将永久删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // 发送网络请求
          this.$http
            .delete("roles/" + role.id + "/rights/" + rightId)
            .then(res => {
              if (res.data.meta.status !== 200) {
                return this.$message.error(res.data.meta.msg);
              }
              //重新加载权限数据,并且不回到角色列表页
              role.children = res.data.data;
              this.$message({
                type: "success",
                message: "删除成功!"
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //展示分配权限的对话框
    showSetRightDialog(scope) {
      this.roleId = scope.id
      //获取所有权限的数据
      this.$http.get("rights/tree").then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.status);
        }
        this.rightsList = res.data.data;
        //递归获取三级权限节点的id
        this.getLeafKeys(scope,this.defKeys)
      });
      this.setRightDialogVisible = true;
    },
    //通过递归的形式，获取角色列表下所有三级权限的id，并保存到defKeys中
    getLeafKeys(node,arr) {
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      });
    },
    //分配权限对话框关闭重置列表
    setRightsDialogClose() {
      this.defKeys = []
    },
    //为角色分配权限
    allotRights() {
      const keys = []
      //获取所有被选中节点和半选中节点的ID数组
      keys.push(...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys())
      const idStr = keys.join()
      //发送网络请求
      this.$http.post('roles/' + this.roleId + '/rights',{rids: idStr}).then(res => {
        if(res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        this.$message.success(res.data.meta.msg)
        //重新刷新列表
        this.getRolesList()
        //关闭对话框
        this.setRightDialogVisible = false
      })
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>