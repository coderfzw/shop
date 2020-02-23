<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert center title="添加商品信息" type="info" show-icon></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏区域 -->
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="selectIds">
              <el-cascader
                v-model="addForm.selectIds"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb,index) in item.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="goods-add-btn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- //上传的图片预览 -->
    <el-dialog title="预览" :visible.sync="previewVisible" width="50%">
      <img class="preview-img" :src="previewPath" alt />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "0",
      //添加商品表单
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 分类数组
        selectIds: [],
        goods_cat: "",
        // 图片数组
        pics: [],
        // 商品内容描述
        goods_introduce: "",
        attrs: []
      },
      //校验规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        selectIds: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      // 分类列表
      cateList: [],
      // 级联选择器配置对象
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      //商品参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      //上传图片的路径
      uploadURL: "http://39.105.182.200:8888/api/private/v1/upload",
      // 图片上传组件的headers请求对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 预览窗口对话框是否显示
      previewVisible: false,
      // 图片预览路径
      previewPath: "",
      //分类选中数组副本
      selectIds_bak: []
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.cateList = res.data;
    },
    // 级联选择器选中项变化
    handleChange() {
      if (this.addForm.selectIds.length !== 3) {
        this.addForm.selectIds = [];
      }
    },
    // tab切换前的钩子
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.selectIds.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    //切换tab
    async tabClick() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.onlyTableData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url.replace(
        "127.0.0.1",
        "39.105.182.200"
      );
      this.previewVisible = true;
    },
    // 关闭图片预览的事件
    handleRemove(file) {
      // 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 送pics中获取对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath);
      // 删除
      this.addForm.pics.splice(i, 1);
    },
    // 监听图片上传成功的钩子
    handleSuccess(res) {
      // 拼接得到一个图片信息对象
      const picInfo = { pic: res.data.tmp_path };
      // 将图片信息对象push到数组
      this.addForm.pics.push(picInfo);
    },
    //确定添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error("请填写必要的表单项！");
        //处理逻辑问题
        // 先把分类选中的id赋值到addForm的goods_cat属性里，然后把selectIds属性删除掉（为了提交请求）
        this.addForm.goods_cat = this.addForm.selectIds.join(",");
        //处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        //处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        this.selectIds_bak = []
        this.selectIds_bak.push(...this.addForm.selectIds)
        delete this.addForm.selectIds
        //发起网络请求
        //商品名称必须是唯一的
        const {data: res} = await this.$http.post('goods',this.addForm)
        if(res.meta.status !== 201) {
          this.addForm.selectIds = []
          this.addForm.selectIds.push(...this.selectIds_bak)
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      });
    }
  },
  computed: {
    cateId() {
      if (this.addForm.selectIds.length === 3) {
        return this.addForm.selectIds[2];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.preview-img {
  width: 100%;
}
.goods-add-btn {
  margin-top: 15px;
}
</style>