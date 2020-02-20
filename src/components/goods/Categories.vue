<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i class="el-icon-error" style="color: red" v-if="scope.row.cat_deleted"></i>
          <i class="el-icon-success" style="color: lightgreen" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateFormClose">
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="80px"
      >
        <!-- 添加分类的表单 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options绑定数据源 -->
          <!-- props指定配置对象 -->
          <el-cascader
            clearable
            change-on-select
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询商品分类列表参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //数据总条数
      total: 0,
      //商品分类列表
      cateList: [],
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 将当前列定义为模板列
          type: "template",
          //表示当前模板列使用的名称
          template: "isok"
        },
        {
          label: "排序",
          // 将当前列定义为模板列
          type: "template",
          //表示当前模板列使用的名称
          template: "order"
        },
        {
          label: "操作",
          // 将当前列定义为模板列
          type: "template",
          //表示当前模板列使用的名称
          template: "opt"
        }
      ],
      //添加分类对话框是否显示
      addCateDialogVisible: false,
      //添加分类表单
      addCateForm: {
        //分类名称
        cat_name: "",
        //父级分类ID
        cat_pid: 0,
        //默认分类层级是一级分类
        cat_level: 0
      },
      //添加分类表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器选中的父级分类id数组
      selectedKeys: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      //赋值数据列表
      this.cateList = res.data.result;
      // 赋值总条数
      this.total = res.data.total;
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getCateList();
    },
    //添加分类
    showAddCateDialog() {
      //获取父级分类数据列表
      this.getParentCateList();
      // 展示对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.parentCateList = res.data;
    },
    //监听选择项发生改变
    parentCateChange(keys) {
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      //如果selectedKeys的length大于0则去数组最后一位作为父级ID
      if(this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }
    },
    //确认添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        //重新加载商品分类
        this.getCateList()
        // 关闭对话框
        this.addCateDialogVisible = false
      })
    },
    //关闭添加分类重置表单
    addCateFormClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
    }
  }
};
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>