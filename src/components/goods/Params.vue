<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" :closable="false" type="warning" show-icon></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="seletedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="seletedCateKeys.length !== 3"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyList" border stripe>
            <el-table-column type="expand" label="展开">
              <template v-slot="scope">
                <el-tag
                  @close="handleClose(index,scope.row)"
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ 添加标签</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="rmParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="seletedCateKeys.length !== 3"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyList" border stripe>
            <el-table-column type="expand" label="展开">
              <template v-slot="scope">
                <el-tag
                  @close="handleClose(index,scope.row)"
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ 添加标签</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="rmParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框区域 -->
    <el-dialog
      :title="'添加'+ titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 添加参数的表单 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框区域 -->
    <el-dialog
      :title="'修改'+ titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 修改参数的表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      //级联选择器双向绑定到的数组
      seletedCateKeys: [],
      // 被激活的页签名称
      activeName: "many",
      //动态参数列表
      manyList: [],
      // 静态参数列表
      onlyList: [],
      //添加对话框是否显示
      addDialogVisible: false,
      //添加参数表单
      addForm: {
        attr_name: ""
      },
      // 添加参数校验规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入活动名称", trigger: "blur" }
        ]
      },
      // 是否显示修改对话框
      editDialogVisible: false,
      // 修改对话框对应的表单
      editForm: {}
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.cateList = res.data;
    },
    //级联选择器变化的函数
    handleChange() {
      this.getParamsData();
    },
    //tab标签点击事件
    handleTabClick() {
      this.getParamsData();
    },
    // 获取参数的列表数据
    async getParamsData() {
      if (this.seletedCateKeys.length !== 3) {
        this.seletedCateKeys = [];
        this.manyList = []
        this.onlyList = []
        return;
      }
      //根据所选分类的id和和当前所处的面板获取对应的参数
      const { data: res } = await this.$http.get(
        "categories/" + this.cateId + "/attributes",
        { params: { sel: this.activeName } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      res.data.forEach(item => {
        item.inputVisible = false;
        item.inputValue = "";
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
      });
      if (this.activeName === "many") {
        this.manyList = res.data;
      } else {
        this.onlyList = res.data;
      }
    },
    //添加参数对话框关闭
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    // 确认添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories/" + this.cateId + "/attributes",
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },
    // 点击按钮展示修改的对话框
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get(
        "categories/" + this.cateId + "/attributes/" + id
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.editForm = res.data;
    },
    //关闭修改对话框重置表单
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    //确定修改对话框按钮
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" +
            this.editForm.cat_id +
            "/attributes/" +
            this.editForm.attr_id,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    //根据id删除对应的参数项
    rmParams(id) {
      this.$confirm("此操作将永久删除该参数, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            "categories/" + this.cateId + "/attributes/" + id
          );
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.getParamsData();
          this.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 文本框失去焦点或按下了enter
    handleInputConfirm(row) {
      // 清除空格无效数据
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      //发起网络请求
      this.saveAttrVals(row);
    },
    // 点击按钮显示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // $nextTick方法的作用 就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除标签
    handleClose(index, row) {
      row.attr_vals.splice(index, 1);
      this.saveAttrVals(row)
    },
    //删除标签的网络请求
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.$message.success(res.meta.msg);
    }
  },
  computed: {
    // 当前选中的三级分类id值
    cateId() {
      if (this.seletedCateKeys.length === 3) return this.seletedCateKeys[2];
      return null;
    },
    //动态计算标题文本
    titleText() {
      if (this.activeName === "many") return "动态参数";
      return "静态属性";
    }
  }
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>