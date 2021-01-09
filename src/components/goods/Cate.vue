<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
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
            <!-- 表格区域 -->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i v-if="scope.row.cat_deleted == false" class="el-icon-success" style="color: lightgreen;"></i>
                    <i v-if="scope.row.cat_deleted == true" class="el-icon-error" style="color: red;"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag type="primary" v-if="scope.row.cat_level == 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level == 1">二级</el-tag>
                    <el-tag type="warning" v-else-if="scope.row.cat_level == 2">三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateInfo(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3,5,10,15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options用来指定数据源 , props用来指定配置对象 -->
                    <!-- @change绑定选择内容发生变化时调用的函数 -->
                    <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑分类的对话框 -->
        <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :model="editCateForm" :rules="editCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类id：">
                    <el-input v-model="editCateForm.cat_id" disabled></el-input>
                </el-form-item>
                <el-form-item label="分类名称：">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data () {
        return {
            // 查询条件
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 商品分类的数据列表，默认为空
            cateList: [],
            // 总数据条数
            total: 0,
            // 为 table 指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template: 'order'
                },
                {
                    label: '操作',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 表示当前这一列使用的模板名称
                    template: 'opt'
                }
            ],
            // 控制添加分类对话框的显示与隐藏
            addCateDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm: {
                // 将要添加的分类的名称
                cat_name: '',
                // 父级分类的id
                cat_pid: 0,
                // 分类的等级，默认要添加的是一级分类
                cat_level: 0
            },
            // 添加分类表单的验证规则对象
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类的名称', trigger: 'blur' }
                ]
            },
            // 父级分类的列表
            parentCateList: [],
            // 指定级联选择器的配置对象
            cascaderProps: {
                expandTrigger: 'hover',
                checkStrictly: true,
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 选中的父级分类的id数组
            selectedKeys: [],
            // 控制编辑分类对话框的显示与隐藏
            editCateDialogVisible: false,
            // 编辑分类的表单数据对象
            editCateForm: {},
            // 添加分类表单的验证规则对象
            editCateFormRules: {}
        }
    },
    created () {
        this.getCateList()
    },
    methods: {
        // 获取商品分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories', {
                params: this.queryInfo
            });
            

            if(res.meta.status !== 200) {
                return this.$message.error('获取商品列表失败！');
            }
            // 把数据列表，赋值给 cateList
            this.cateList = res.data.result;
            // 为总数据条数赋值
            this.total = res.data.total;
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getCateList();
        },
        // 监听pagenum改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getCateList();
        },
        // 点击按钮展示添加分类的对话框
        showAddCateDialog() {
            // 先获取父级分类的数据列表再展示出对话框
            this.getParentCateList();
            this.addCateDialogVisible = true;
        },
        // 获取父级分类的数据列表
        async getParentCateList() {
            const {data: res} = await this.$http.get('categories', {
                params: {
                    type: 2
                }
            });

            if(res.meta.status !== 200) {
                return this.$message.error('获取父级分类数据失败！');
            }

            this.parentCateList = res.data;
        },
        // 选择项发生变化触发这个函数
        parentCateChanged() {
            // 如果selectedKeys 数组中的 length 大于0，证明选中了父级分类
            // 反之，就说明没有选中任何父级分类
            if(this.selectedKeys.length > 0){
                // 父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length;
                return ;
            }else {
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
        },
        // 点击按钮，添加新的分类
        addCate() {
            this.$refs.addCateFormRef.validate(async valid => {
                if(!valid) return
                const {data: res} = await this.$http.post('categories', this.addCateForm)

                if(res.meta.status !== 201) {
                    return this.$message.error('添加分类失败！');
                }
                this.getCateList();
                this.addCateDialogVisible = false;
                this.$message.success('添加分类成功！');
            })
        },
        // 监听对话框的关闭事件，重置表单数据
        addCateDialogClosed() {
            this.$refs.addCateFormRef.resetFields();
            this.selectedKeys = [];
            this.addCateForm.cat_level = 0;
            this.addCateForm.cat_pid = 0;
        },
        // 编辑分类
        async editCateInfo(id) {
            const {data: res} = await this.$http.get('categories/' + id);

            if(res.meta.status !== 200) {
                return this.$message.error('获取分类信息失败！');
            }
            this.editCateForm = res.data;
            this.editCateDialogVisible = true;
        },

        editCateDialogClosed() {
            
        },
        // 点击按钮，更改分类信息
        async editCate() {
            const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, {
                cat_name: this.editCateForm.cat_name
            });

            if(res.meta.status !== 200) {
                return this.$message.error('更新分类信息失败！');
            }

            this.$message.success('更新分类信息成功！');
            this.getCateList();
            this.editCateDialogVisible = false;
        },
        // 根据id删除对应的分类信息
        async removeCateById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该分类，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)

            // 如果用户确认删除，则返回值为字符串 confirm
            // 如果用户取消删除，则返回值为字符串 cancel
            // console.log(confirmResult);
            if(confirmResult !== 'confirm') {
                return this.$message.info('已经取消删除');
            }

            const {data: res} = await this.$http.delete('categories/' + id);

            if(res.meta.status !== 200) {
                return this.$message.error('删除分类失败！');
            }
            this.$message.success('删除分类成功！');
            this.getCateList();
        }
    }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;
}
</style>