<template>
    <el-button type="primary" size="small" @click="loadData">加载数据</el-button>
    <el-table
            :data="tableData"
            :height="tableHeight"
            :header-row-style="headerStyle"
            border>
        <el-table-column
                fixed
                label="-"
                type="index">
        </el-table-column>
        <el-table-column
                prop="personName"
                label="用户名"
                width="180">
        </el-table-column>
        <el-table-column
                prop="sex"
                label="性别代码"
                width="180">
        </el-table-column>
        <el-table-column
                prop="sex_text"
                label="标签"
                width="100"
                :filters="[{ text: '男性', value: '男性' }, { text: '女性', value: '女性' }]"
                :filter-method="filterTag"
                filter-placement="bottom-end">
            <template slot-scope="scope">
                <el-tag
                        :type="scope.row.sex_text === '男性' ? 'primary' : 'success'"
                        close-transition>{{scope.row.sex_text}}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column
                prop="dob"

                label="出生日期">
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
                <el-button
                        size="mini"
                        type="primary"
                        @click="handleEdit(scope.$index, scope.row)">编辑
                </el-button>
                <el-button
                        size="mini"
                        type="danger"
                        @click="handleDelete(scope.$index, scope.row)">删除
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</template>