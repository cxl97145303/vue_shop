<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="roleList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0? 'bdtop': '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[i2 === 0? '': 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag closable type="warning" v-for="(item3) in item2.children" :key="item3.id" @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 添加用户的对话框 -->
            <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
                <!-- 内容主体区域 -->
                <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="addForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <el-input v-model="addForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addrole">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 修改用户的对话框 -->
            <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed">
                <!-- 内容主体区域 -->
                <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                    <el-form-item label="id">
                        <el-input v-model="editForm.roleId" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="editForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="mobile">
                        <el-input v-model="editForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editRoleInfo">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all check-on-click-node :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 所有角色列表数据
            roleList: [],
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: {
                roleName: '',
                roleDesc: ''
            },
            // 添加表单的验证规则对象
            addFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 2, max: 6, message: '用户名的长度在2~6个字符之间', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 2, max: 8, message: '用户名的长度在2~8个字符之间', trigger: 'blur' }
                ]
            },
            // 控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            // 查询到的用户信息对象
            editForm: {},
            editFormRules: [],
            // 编辑表单的验证规则对象
            editFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 2, max: 6, message: '用户名的长度在2~6个字符之间', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' },
                    { min: 2, max: 8, message: '用户名的长度在2~8个字符之间', trigger: 'blur' }
                ]
            },
            // 控制分配权限对话框的显示与隐藏
            setRightDialogVisible: false,
            // 所有权限的数据
            rightsList: [],
            // 树形控件的属性绑定对象
            treeProps: {
                children: 'children',
                label: 'authName'
            },
            // 默认选中的节点id值数组
            defKeys: [],
            // 当前即将分配权限的id
            roleId: ''
        }
    },
    created() {
        this.getRolesList();
    },
    methods: {
        // 获取角色列表
        async getRolesList () {
        const {data: res} = await this.$http.get('/roles');
        
        if(res.meta.status !== 200) {
            return this.$message.error('获取角色列表失败！');
        }

        this.roleList = res.data;
        },
        // 点击按钮添加新用户
        addrole() {
            // 预验证
            this.$refs.addFormRef.validate(async valid => {
                if(!valid) return;
                // 可以发起添加用户的网络请求
                const {data: res} = await this.$http.post('roles', this.addForm);
                if(res.meta.status !== 201) {
                    this.$message.error('添加角色失败，原因：' + res.meta.msg);
                }
                this.$message.success('添加角色成功');
                // 隐藏添加用户的对话框
                this.addDialogVisible = false;
                // 重新获取用户列表的数据
                this.getRolesList();
            })
        },
        // 监听添加用户对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        // 展示编辑角色的对话框
        async showEditDialog(id) {
            const {data: res} = await this.$http.get('roles/' + id);

            if(res.meta.status !== 200) {
                return this.$message.error('获取角色信息失败！');
            }
            
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        // 监听修改用户对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        // 修改用户信息并提交
        editRoleInfo() {
            // 预验证
            this.$refs.editFormRef.validate(async valid => {
                if(!valid) return;

                const {data: res} = await this.$http.put('roles/' + this.editForm.roleId,{
                    roleName: this.editForm.roleName,
                    roleDesc: this.editForm.roleDesc
                });
                
                if(res.meta.status !== 200) {
                    return this.$message.error('更新角色信息失败!');
                }
                // 关闭对话框
                this.editDialogVisible = false;
                // 刷新数据列表
                this.getRolesList();
                // 提示修改成功
                this.$message.success('更新角色信息成功！');
            })
        },
        // 根据id删除对应的角色信息
        async removeRoleById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
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

            const {data: res} = await this.$http.delete('roles/' + id);

            if(res.meta.status !== 200) {
                return this.$message.error('删除角色失败！');
            }
            this.$message.success('删除角色成功！');
            this.getRolesList();
        },
        // 根据id删除对应的权限
        async removeRightById(role,rightId) {
            // 弹框提示用户是否删除
            const confirmResult = await this.$confirm('此操作将永久删除该用户的权限，是否继续？', '提示', {
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

            const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            console.log(res);
            if(res.meta.status !== 200) {
                return this.$message.error('删除角色权限失败！');
            }
            
            this.$message.success('删除角色权限成功！');
            // 使用这条语句会重新渲染整个表格
            // this.getRolesList();
            // 将获取到的角色的children重新赋值
            role.children = res.data;
        },
        // 展示分配权限的对话框
        async showSetRightDialog(role) {
            this.roleId = role.id;
            const {data: res} = await this.$http.get('rights/tree');
            
            if(res.meta.status !== 200) {
                return this.$message.error('获取权限数据失败！');
            }
            // 把获取到的权限数据保存到data中
            this.rightsList = res.data;

            // 在给defKeys赋值前清空原内容
            // this.defKeys = [];
            // 递归获取三级节点的id
            this.getLeafKeys(role, this.defKeys);

            this.setRightDialogVisible = true;
        },
        // 通过递归的形式，获取角色下所有三级权限的id，保存到数组中
        getLeafKeys(node,arr) {
            if(!node.children){
                // 如果当前 node 结点不包含children属性，则是三级节点
                return arr.push(node.id)
            }
            node.children.forEach(item => {
                return this.getLeafKeys(item, arr);
            })
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClosed() {
            this.defKeys = [];
        },
        // 点击为角色分配权限
        async allotRights() {
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ];
            const idStr = keys.join(',');

            const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr});

            if(res.meta.status !== 200) {
                return this.$message.error('分配权限失败！');
            }

            this.$message.success('分配权限成功！');
            this.getRolesList();
            this.setRightDialogVisible = false;
        }
    }
}
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
.vcenter {
    display: flex;
    align-items: center;
}
</style>