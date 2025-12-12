/**
 * 应用配置文件 - 集中管理全局环境变量和配置信息
 */
export const appConfig = {
  // 应用名称和版本信息
  appNameCn: import.meta.env.VITE_APP_NAME_CN,
  appNameEn: import.meta.env.VITE_APP_NAME_EN,
  appVer: import.meta.env.VITE_APP_VERSION,

  // 作者和部门信息
  author: import.meta.env.VITE_AUTHOR,
  department: import.meta.env.VITE_DEPARTMENT,

  // 可以在这里添加更多全局配置项
  baseUrl: import.meta.env.VITE_BASE_URL || "/",

  // API相关配置
  api: {
    timeout: 10000,
    retryCount: 3,
  },
};

// 下载类型列表
export const downTypeList = [
  {
    name: "图片",
    type: "png",
    icon: "iconPNG",
    desc: "常用图片格式，适合查看分享",
  },
  {
    name: "SVG",
    type: "svg",
    icon: "iconSVG",
    desc: "怎么放大都很清晰，要用浏览器打开",
  },
  {
    name: "PDF",
    type: "pdf",
    icon: "iconpdf",
    desc: "适合查看浏览和打印",
  },
  {
    name: "Markdown",
    type: "md",
    icon: "iconmarkdown",
    desc: "最流行的笔记格式，用纯文字加标识符定义不同格式文本",
  },
  {
    name: "XMind",
    type: "xmind",
    icon: "iconxmind",
    desc: "XMind软件格式",
  },
  {
    name: "Txt",
    type: "txt",
    icon: "iconTXT",
    desc: "纯文本文件",
  },
  // {
  //   name: "Excel",
  //   type: "xlsx",
  //   icon: "iconfile-excel",
  //   desc: "表格文本形式，可用Excel软件编辑",
  // },
  // {
  //   name: "FreeMind",
  //   type: "mm",
  //   icon: "iconfreemind",
  //   desc: "FreeMind软件格式",
  // },
  {
    name: "JSON",
    type: "json",
    icon: "iconjson",
    desc: "流行的数据交换格式，可用于再次导入",
  },
];
