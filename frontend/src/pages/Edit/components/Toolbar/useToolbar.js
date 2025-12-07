import appStore from "@/stores";
import emitter from "@/utils/eventBus.js";
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  RollbackIcon,
  RollfrontIcon,
  BrushIcon,
  TreeSquareDotVerticalIcon,
  GitMergeIcon,
  DeleteIcon,
  ImageIcon,
  CrookedSmileIcon,
  LinkIcon,
  PenIcon,
  TagIcon,
  AppIcon,
  MapConnectionIcon,
  PiIcon,
  AttachIcon,
  Transform1Icon,
  TextboxIcon,
  LogoAdobeIllustrateIcon,
  SaveIcon,
  FileImportIcon,
  FileExportIcon,
} from "tdesign-icons-vue-next";
import { getData } from "@/api";
import { LoadingPlugin } from "tdesign-vue-next";
import { t } from "@/locales";

/**
 * 工具栏相关信息hooks
 * 封装工具栏按钮的状态管理、事件处理和禁用条件逻辑
 */
export default function useToolbar(btnList) {
  const activeNodes = ref([]);
  const backEnd = ref(true);
  const forwardEnd = ref(true);
  const readonly = ref(false);
  const isInPainter = ref(false); // 格式刷

  const fileTreeVisible = ref(false);
  const rootDirName = ref("");
  const fileTreeExpand = ref(true);
  const waitingWriteToLocalFile = ref(false);
  const isFullDataFile = ref(false);

  let fileHandle = null;

  const hasRoot = computed(() => {
    return activeNodes.value.findIndex((node) => node.isRoot) !== -1;
  });
  // 概要
  const hasGeneralization = computed(() => {
    return activeNodes.value.findIndex((node) => node.isGeneralization) !== -1;
  });
  // 注释
  const annotationRightHasBtn = computed(() => {
    const index = btnList.findIndex((item) => {
      return item === "annotation";
    });
    return index !== -1 && index < btnList.length - 1;
  });

  /** 左侧按钮列表 */
  const leftBtnList = computed(() => [
    {
      name: "back",
      icon: RollbackIcon,
      label: "回退",
      disabled: appStore.isReadonly || backEnd.value,
      handler: () => emitter.emit("execCommand", "BACK"),
    },
    {
      name: "forward",
      icon: RollfrontIcon,
      label: "前进",
      disabled: appStore.isReadonly || forwardEnd.value,
      handler: () => emitter.emit("execCommand", "FORWARD"),
    },
    {
      name: "painter",
      icon: BrushIcon,
      label: "格式刷",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      active: isInPainter.value,
      handler: () => emitter.emit("startPainter"),
    },
    {
      name: "siblingNode",
      icon: TreeSquareDotVerticalIcon,
      label: "同级节点",
      disabled:
        activeNodes.value.length <= 0 ||
        hasRoot.value ||
        hasGeneralization.value,
      handler: () => emitter.emit("execCommand", "INSERT_NODE"),
    },
    {
      name: "childNode",
      icon: GitMergeIcon,
      label: "子节点",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      handler: () => emitter.emit("execCommand", "INSERT_CHILD_NODE"),
    },
    {
      name: "deleteNode",
      icon: DeleteIcon,
      label: "删除节点",
      disabled: activeNodes.value.length <= 0,
      handler: () => emitter.emit("execCommand", "REMOVE_NODE"),
    },
    {
      name: "image",
      icon: ImageIcon,
      label: "图片",
      disabled: activeNodes.value.length <= 0,
      handler: () => emitter.emit("showNodeImage"),
    },
    {
      name: "icon",
      icon: CrookedSmileIcon,
      label: "图标",
      disabled: activeNodes.value.length <= 0,
      handler: () => showNodeIconSidebar,
    },
    {
      name: "link",
      icon: LinkIcon,
      label: "超链接",
      disabled: activeNodes.value.length <= 0,
      handler: () => emitter.emit("showNodeLink"),
    },
    {
      name: "note",
      icon: PenIcon,
      label: "备注",
      disabled: activeNodes.value.length <= 0,
      handler: () => emitter.emit("showNodeNote"),
    },
    {
      name: "tag",
      icon: TagIcon,
      label: "标签",
      disabled: activeNodes.value.length <= 0,
      handler: () => emitter.emit("showNodeTag"),
    },
    {
      name: "summary",
      icon: AppIcon,
      label: "概要",
      disabled:
        activeNodes.value.length <= 0 ||
        hasRoot.value ||
        hasGeneralization.value,
      handler: () => emitter.emit("execCommand", "ADD_GENERALIZATION"),
    },
    {
      name: "associativeLine",
      icon: MapConnectionIcon,
      label: "关联线",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      handler: () => emitter.emit("createAssociativeLine"),
    },
    {
      name: "formula",
      icon: PiIcon,
      label: "公式",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      handler: () => showFormulaSidebar,
    },
    // {
    //   name: "attachment",
    //   icon: AttachIcon,
    //   label: "附件",
    //   disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
    //   handler: () => selectAttachmentFile,
    // },
    {
      name: "outerFrame",
      icon: Transform1Icon,
      label: "外框",
      disabled: activeNodes.value.length <= 0 || hasGeneralization.value,
      handler: () => emitter.emit("execCommand", "ADD_OUTER_FRAME"),
    },
    // {
    //   name: "annotation",
    //   icon: TextboxIcon,
    //   label: "注释",
    //   handler: () => onSetAnnotation,
    // },
    {
      name: "ai",
      icon: LogoAdobeIllustrateIcon,
      label: "AI",
      disabled: hasGeneralization.value,
      //TODO ai功能待实现
      handler: () => {},
    },
  ]);

  /** 右侧按钮列表 */
  const rightBtnList = computed(() => [
    {
      name: "saveLocalFile",
      icon: SaveIcon,
      label: "另存为",
      handler: saveLocalFile,
    },
    {
      name: "showImport",
      icon: FileImportIcon,
      label: "导入",
      handler: () => emitter.emit("showImport"),
    },
    {
      name: "showExport",
      icon: FileExportIcon,
      label: "导出",
      handler: () => emitter.emit("showExport"),
    },
  ]);

  /** 显示节点图标侧边栏 */
  const showNodeIconSidebar = () => {
    emitter.emit("close_node_icon_toolbar");
    appStore.setActiveSidebar("nodeIconSidebar");
  };
  /** 打开公式侧边栏 */
  const showFormulaSidebar = () => appStore.setActiveSidebar("formulaSidebar");
  /** 选择附件 */
  const selectAttachmentFile = () =>
    emitter.emit("selectAttachment", activeNodes.value);
  /** 设置标记 */
  const onSetAnnotation = (...args) =>
    emitter.emit("execCommand", "SET_NOTATION", activeNodes.value, ...args);
  /** AI生成整体 */
  const aiCreate = () => emitter.emit("ai_create_all");

  /**
   * 监听模式切换
   * @param {string} mode - 模式名称，'readonly' 或其他
   */
  const onModeChange = (mode) => appStore.setIsReadonly(mode === "readonly");
  /**
   * 监听节点激活
   * !官方vue2版本中这个回调接收两个参数，vue3中只接收到第二个，并且未激活时是[null]，官方是[]
   * @param {Array} args - 事件参数，this（节点实例）、activeNodeList（当前激活的所有节点列表）
   */
  const onNodeActive = (...args) => {
    activeNodes.value = args[0] === null ? [] : args;
  };

  /**
   * 监听前进后退
   * @param {number} index - activeHistoryIndex（当前在历史数据数组里的索引）
   * @param {number} len - length（当前历史数据数组的长度）
   */
  const onBackForward = (index, len) => {
    console.log("onBackForward", index, len);
    backEnd.value = index <= 0;
    forwardEnd.value = index >= len - 1;
  };
  /** 开始格式刷 */
  const onPainterStart = () => (isInPainter.value = true);
  /** 结束格式刷 */
  const onPainterEnd = () => (isInPainter.value = false);

  /** 写入本地文件 */
  const writeLocalFile = async (content) => {
    if (!fileHandle || !appStore.isHandleLocalFile) {
      waitingWriteToLocalFile.value = false;
      return;
    }
    if (!isFullDataFile.value) {
      content = content.root;
    }
    let string = JSON.stringify(content);
    const writable = await fileHandle.createWritable();
    await writable.write(string);
    await writable.close();
    waitingWriteToLocalFile.value = false;
  };
  /** 另存为 */
  const saveLocalFile = async () => await createLocalFile(getData());
  /** 创建本地文件 */
  const createLocalFile = async (content) => {
    try {
      let _fileHandle = await window.showSaveFilePicker({
        types: [
          {
            description: "",
            accept: { "application/json": [".smm"] },
          },
        ],
        suggestedName: t("toolbar.defaultFileName"),
      });
      if (!_fileHandle) {
        return;
      }
      const loading = LoadingPlugin({
        text: t("toolbar.creatingTip"),
      });
      fileHandle = _fileHandle;
      appStore.setIsHandleLocalFile(true);
      isFullDataFile.value = true;
      await writeLocalFile(content);
      await readFile();
      loading.hide();
    } catch (error) {
      console.error(error);
      if (error.toString().includes("aborted")) {
        return;
      }
      MessagePlugin.warning(t("toolbar.notSupportTip"));
    }
  };

  let timer = null;
  /** 监听本地文件读写 */
  const onWriteLocalFile = (content) => {
    clearTimeout(timer);
    if (fileHandle && appStore.isHandleLocalFile) {
      waitingWriteToLocalFile.value = true;
    }
    timer = setTimeout(() => {
      writeLocalFile(content);
    }, 1000);
  };
  /** 节点备注双击处理 */
  const onNodeNoteDblclick = (node, e) => {
    e.stopPropagation();
    emitter.emit("showNodeNote", node);
  };

  const setEventHandler = () => {
    emitter.on("mode_change", onModeChange);
    emitter.on("node_active", onNodeActive);
    emitter.on("back_forward", onBackForward);
    emitter.on("painter_start", onPainterStart);
    emitter.on("painter_end", onPainterEnd);
    emitter.on("node_note_dblclick", onNodeNoteDblclick);
    emitter.on("write_local_file", onWriteLocalFile);
  };
  const removeEventHandler = () => {
    emitter.off("mode_change", onModeChange);
    emitter.off("node_active", onNodeActive);
    emitter.off("back_forward", onBackForward);
    emitter.off("painter_start", onPainterStart);
    emitter.off("painter_end", onPainterEnd);
    emitter.off("node_note_dblclick", onNodeNoteDblclick);
    emitter.off("write_local_file", onWriteLocalFile);
  };

  // 暴露需要的值和方法
  return {
    leftBtnList,
    rightBtnList,
    // 状态
    activeNodes,
    backEnd,
    forwardEnd,
    isInPainter,
    hasRoot,
    hasGeneralization,
    annotationRightHasBtn,

    // 方法
    showNodeIconSidebar,
    showFormulaSidebar,
    selectAttachmentFile,
    onSetAnnotation,
    aiCreate,
    setEventHandler,
    removeEventHandler,
  };
}
