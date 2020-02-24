<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
//导入echarts
import echarts from "echarts";
export default {
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: "用户来源"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3"
            }
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ]
      }
    };
  },
  created() {},
  mounted() {
    this.echartList();
  },
  methods: {
    async echartList() {
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById("main"));

      const { data: res } = await this.$http.get("reports/type/1");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      // 指定图表的配置项和数据
      //合并
      const result = this.merge(res.data, this.options);
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(result);
    },
    // 手动封装loadash的merge合并效果
    isObject(value) {
      const type = typeof value;
      return value !== null && (type === "object" || type === "function");
    },
    //手动封装loadash的merge合并效果
    merge(source, other) {
      if (!this.isObject(source) || !this.isObject(other)) {
        return other === undefined ? source : other;
      }
      // 合并两个对象的 key，另外要区分数组的初始值为 []
      return Object.keys({
        ...source,
        ...other
      }).reduce(
        (acc, key) => {
          // 递归合并 value
          acc[key] = this.merge(source[key], other[key]);
          return acc;
        },
        Array.isArray(source) ? [] : {}
      );
    }
  }
};
</script>

<style lang="less" scoped>
</style>