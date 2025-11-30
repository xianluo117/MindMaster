<!-- pages/Edit/Edit.vue -->
<template>
  <div
    class="editContainer"
    @dragenter.stop.prevent="onDragenter"
    @dragleave.stop.prevent
    @dragover.stop.prevent
    @drop.stop.prevent
  >
    <div class="mindMapRef" id="mindMapRef" ref="mindMapRef"></div>

    <!-- UI组件 -->
    <template v-for="component in uiComponents" :key="component.name">
      <component
        :is="component.component"
        v-if="shouldRenderComponent(component)"
        :mindMap="mindMap"
        :data="component.data"
        :configData="component.configData"
      />
    </template>

    <!-- 拖拽遮罩 -->
    <div
      class="dragMask"
      v-if="showDragMask"
      @dragleave.stop.prevent="onDragleave"
      @dragover.stop.prevent
      @drop.stop.prevent="onDrop"
    >
      <div class="dragTip">{{ t('edit.dragTip') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import appStore from '@/stores'
import emitter from '@/utils/eventBus'
import useTranslation from '@/hooks/useTranslation'

// 导入所有UI组件
import Count from '../Count/index.vue'
// import Navigator from './components/Navigator.vue'
import NavigatorToolbar from '../NavigatorToolbar/index.vue'
// import OutlineSidebar from './components/OutlineSidebar.vue'
// import Style from './components/Style.vue'
// import BaseStyle from './components/BaseStyle.vue'
// import AssociativeLineStyle from './components/AssociativeLineStyle.vue'
// import Theme from './components/Theme.vue'
// import Structure from './components/Structure.vue'
// import ShortcutKey from './components/ShortcutKey.vue'
// import Contextmenu from './components/Contextmenu.vue'
// import RichTextToolbar from './components/RichTextToolbar.vue'
// import NodeNoteContentShow from './components/NodeNoteContentShow.vue'
// import NodeImgPreview from './components/NodeImgPreview.vue'
// import SidebarTrigger from './components/SidebarTrigger.vue'
// import Search from './components/Search.vue'
// import NodeIconSidebar from './components/NodeIconSidebar.vue'
// import NodeIconToolbar from './components/NodeIconToolbar.vue'
// import OutlineEdit from './components/OutlineEdit.vue'
// import Scrollbar from './components/Scrollbar.vue'
// import FormulaSidebar from './components/FormulaSidebar.vue'
// import NodeOuterFrame from './components/NodeOuterFrame.vue'
// import NodeTagStyle from './components/NodeTagStyle.vue'
// import Setting from './components/Setting.vue'
// import NodeImgPlacementToolbar from './components/NodeImgPlacementToolbar.vue'
// import NodeNoteSidebar from './components/NodeNoteSidebar.vue'
// import AiCreate from './components/AiCreate.vue'
// import AiChat from './components/AiChat.vue'

// 导入composables
import useMindMap from './useMindMap'
import usePlugins from './usePlugins'
import useDragImport from './useDragImport'
import useEventHandlers from './useEventHandlers'

const t = useTranslation()
const route = useRoute()

// refs
const mindMapRef = ref(null)

// 使用composables
const {
  mindMap,
  mindMapData,
  mindMapConfig,
  loadData,
  initMindMap,
  manualSave,
  setData,
  execCommand,
  exportMap,
  reRender,
  destroy,
} = useMindMap(mindMapRef)

const { addRichTextPlugin, removeRichTextPlugin, addScrollbarPlugin, removeScrollbarPlugin } =
  usePlugins(mindMap)

const { showDragMask, onDragenter, onDragleave, onDrop } = useDragImport()

const {
  handleStartTextEdit,
  handleEndTextEdit,
  handleCreateLineFromActiveNode,
  handleStartPainter,
  handleResize,
  bindEvents,
  unbindEvents,
} = useEventHandlers(mindMap)

// UI组件列表
const uiComponents = computed(() => [
  { component: Count, name: 'count', condition: !appStore.localConfig.isZenMode },
//   { component: Navigator, name: 'navigator', condition: true },
  {
    component: NavigatorToolbar,
    name: 'navigatorToolbar',
    condition: !appStore.localConfig.isZenMode,
  },
//   { component: OutlineSidebar, name: 'outlineSidebar', condition: true },
//   { component: Style, name: 'style', condition: !appStore.localConfig.isZenMode },
//   {
//     component: BaseStyle,
//     name: 'baseStyle',
//     condition: true,
//     data: mindMapData.value,
//     configData: mindMapConfig.value,
//   },
//   { component: AssociativeLineStyle, name: 'associativeLineStyle', condition: true },
//   { component: Theme, name: 'theme', condition: true, data: mindMapData.value },
//   { component: Structure, name: 'structure', condition: true },
//   { component: ShortcutKey, name: 'shortcutKey', condition: true },
//   { component: Contextmenu, name: 'contextmenu', condition: true },
//   { component: RichTextToolbar, name: 'richTextToolbar', condition: true },
//   { component: NodeNoteContentShow, name: 'nodeNoteContentShow', condition: true },
//   { component: NodeImgPreview, name: 'nodeImgPreview', condition: true },
//   { component: SidebarTrigger, name: 'sidebarTrigger', condition: !appStore.localConfig.isZenMode },
//   { component: Search, name: 'search', condition: true },
//   { component: NodeIconSidebar, name: 'nodeIconSidebar', condition: true },
//   { component: NodeIconToolbar, name: 'nodeIconToolbar', condition: true },
//   { component: OutlineEdit, name: 'outlineEdit', condition: true },
//   { component: Scrollbar, name: 'scrollbar', condition: appStore.localConfig.isShowScrollbar },
//   { component: FormulaSidebar, name: 'formulaSidebar', condition: true },
//   { component: NodeOuterFrame, name: 'nodeOuterFrame', condition: true },
//   { component: NodeTagStyle, name: 'nodeTagStyle', condition: true },
//   { component: Setting, name: 'setting', condition: true, configData: mindMapConfig.value },
//   { component: NodeImgPlacementToolbar, name: 'nodeImgPlacementToolbar', condition: true },
//   { component: NodeNoteSidebar, name: 'nodeNoteSidebar', condition: true },
//   { component: AiCreate, name: 'aiCreate', condition: appStore.localConfig.enableAi },
//   { component: AiChat, name: 'aiChat', condition: appStore.localConfig.enableAi },
])

// 判断是否应该渲染组件
const shouldRenderComponent = (component) => {
  return mindMap.value && component.condition
}

// 检查是否有文件URL
const hasFileURL = () => {
  const fileURL = route.query.fileURL
  if (!fileURL) return false
  return /\.(smm|json|xmind|md|xlsx)$/.test(fileURL)
}

// 初始化
const init = () => {
  loadData()
  const fileUrlExists = hasFileURL()
  initMindMap(fileUrlExists)

  // 加载插件
  if (appStore.localConfig.openNodeRichText) addRichTextPlugin()
  if (appStore.localConfig.isShowScrollbar) addScrollbarPlugin()

  // 如果应用被接管，抛出事件传递思维导图实例
  if (window.takeOverApp) {
    emitter.emit('app_inited', mindMap.value)
  }

  // 解析url中的文件
  if (fileUrlExists) {
    emitter.emit('handle_file_url')
  }
}

// 生命周期钩子
onMounted(() => {
  // showLoading()
  init()
  bindEvents()
})

onBeforeUnmount(() => {
  unbindEvents()
  destroy()
})

// 暴露给模板的方法
Object.assign(window, {
  execCommand,
  setData,
  exportMap,
  reRender,
})
</script>

<style lang="less" scoped>
.editContainer {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .dragMask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3999;

    .dragTip {
      pointer-events: none;
      font-weight: bold;
    }
  }

  .mindMapRef {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
