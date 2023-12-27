#! /usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')
const pkg = require('../package.json')
const downloadGitRepo = require('download-git-repo')
const path = require('path')
const fs = require('fs-extra')
const ora = require('ora')

program.version(`v${pkg.version}`) // 定义当前版本

program.command('create').description('创建一个模版').action(async() => {
  const {projectName, template, author, description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称: '
    },
    {
      type: 'input',
      name: 'author',
      message: '请输入作者: '
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入项目描述: '
    },
    {
      type: 'list',
      name: 'template',
      message: '请选择模版: ',
      choices: [
        {
          name: 'vue-admin',
          value: 'https://github.com/liangshaoqi/vue-template.git',
        },
        {
          name: 'react-admin',
          value: 'https://github.com/liangshaoqi/react-template.git',
        },
      ]
    }
  ])
  // 下载模版
  const dest = path.join(process.cwd(), projectName)
  if (fs.existsSync(dest)) {
    const { isExist } = await inquirer.prompt({
      type: 'confirm',
      name: 'isExist',
      message: '文件夹已存在是否覆盖',
    })
    isExist ? fs.removeSync(dest) : process.exit(1)
  }
  const loading = ora('拉取模版中...').start()
  downloadGitRepo(template, dest, (err) => {
    if (err) {
      loading.fail('拉取失败' + err.message)
      return
    }
    loading.succeed('创建模版成功')

    // 修改拉取下来的模版package.json信息
    const pkgPath = path.join(process.cwd(), projectName, 'package.json')
    // console.log('package.json路径', pkgPath)
    const pkgContent = fs.readFileSync(pkgPath, 'utf-8')
    const pkgJson = JSON.parse(pkgContent)
    pkgJson.name = projectName
    pkgJson.version = '1.0.0'
    pkgJson.author = author
    pkgJson.description = description
    fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2))
  })
})
program.parse(process.argv)