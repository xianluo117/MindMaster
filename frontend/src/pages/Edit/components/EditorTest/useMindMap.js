// composables/useMindMap.js
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import MindMap from 'simple-mind-map'
import emitter from '@/utils/eventBus'
import appStore from '@/stores'
import { getData, getConfig, storeData } from '@/api'
import exampleData from 'simple-mind-map/example/exampleData'
import icon from '@/config/icon'
import handleClipboardText from '@/utils/handleClipboardText'
import imgLoadFailSvg from '@/assets/img/imgLoadFailed.svg'

// 注册插件
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import Watermark from 'simple-mind-map/src/plugins/Watermark.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js'
import ExportXMind from 'simple-mind-map/src/plugins/ExportXMind.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
import Select from 'simple-mind-map/src/plugins/Select.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js'
import NodeImgAdjust from 'simple-mind-map/src/plugins/NodeImgAdjust.js'
import SearchPlugin from 'simple-mind-map/src/plugins/Search.js'
import Painter from 'simple-mind-map/src/plugins/Painter.js'
import Formula from 'simple-mind-map/src/plugins/Formula.js'
import RainbowLines from 'simple-mind-map/src/plugins/RainbowLines.js'
import Demonstrate from 'simple-mind-map/src/plugins/Demonstrate.js'
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js'
import MindMapLayoutPro from 'simple-mind-map/src/plugins/MindMapLayoutPro.js'
import NodeBase64ImageStorage from 'simple-mind-map/src/plugins/NodeBase64ImageStorage.js'
import Themes from 'simple-mind-map-plugin-themes'

MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(Drag)
  .usePlugin(KeyboardNavigation)
  .usePlugin(ExportPDF)
  .usePlugin(ExportXMind)
  .usePlugin(Export)
  .usePlugin(Select)
  .usePlugin(AssociativeLine)
  .usePlugin(NodeImgAdjust)
  .usePlugin(TouchEvent)
  .usePlugin(SearchPlugin)
  .usePlugin(Painter)
  .usePlugin(Formula)
  .usePlugin(RainbowLines)
  .usePlugin(Demonstrate)
  .usePlugin(OuterFrame)
  .usePlugin(MindMapLayoutPro)
  .usePlugin(NodeBase64ImageStorage)

// 注册主题
Themes.init(MindMap)

export default function useMindMap(containerRef) {
  const mindMap = ref(null)
  const mindMapData = ref(null)
  const mindMapConfig = ref({})
  const storeConfigTimer = ref(null)

  // 获取数据
  const loadData = () => {
    mindMapData.value = getData()
    mindMapConfig.value = getConfig() || {}
  }

  // 初始化思维导图
  const initMindMap = (hasFileURL) => {
    let { root, layout, theme, view } = mindMapData.value
    const config = mindMapConfig.value

    // 如果url中存在要打开的文件，使用默认数据
    if (hasFileURL) {
      root = {
        data: {
          text: '根节点',
        },
        children: [],
      }
      layout = exampleData.layout
      theme = exampleData.theme
      view = null
    }

    mindMap.value = new MindMap({
      el: containerRef.value,
      data: root,
      fit: false,
      layout: layout,
      theme: theme.template,
      themeConfig: theme.config,
      viewData: view,
      nodeTextEditZIndex: 1000,
      nodeNoteTooltipZIndex: 1000,
      customNoteContentShow: {
        show: (content, left, top, node) => {
          emitter.emit('showNoteContent', content, left, top, node)
        },
        hide: () => {},
      },
      openRealtimeRenderOnNodeTextEdit: true,
      enableAutoEnterTextEditWhenKeydown: true,
      demonstrateConfig: {
        openBlankMode: false,
      },
      ...(config || {}),
      iconList: [...icon],
      useLeftKeySelectionRightKeyDrag: appStore.localConfig.useLeftKeySelectionRightKeyDrag,
      customInnerElsAppendTo: null,
      customHandleClipboardText: handleClipboardText,
      defaultNodeImage: imgLoadFailSvg,
      initRootNodePosition: ['center', 'center'],
      handleIsSplitByWrapOnPasteCreateNewNode: () => {
        return new Promise((resolve) => {
          // 这里需要处理确认对话框
          resolve(true)
        })
      },
      errorHandler: (code, err) => {
        console.error(err)
      },
      addContentToFooter: () => {
        const text = appStore.extraTextOnExport?.trim()
        if (!text) return null
        const el = document.createElement('div')
        el.className = 'footer'
        el.innerHTML = text
        const cssText = `
          .footer {
            width: 100%;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            color: #979797;
          }
        `
        return {
          el,
          cssText,
          height: 30,
        }
      },
      expandBtnNumHandler: (num) => {
        return num >= 100 ? '…' : num
      },
      beforeDeleteNodeImg: (node) => {
        return new Promise((resolve) => {
          // 处理删除图片确认
          resolve(false)
        })
      },
    })

    // 绑定快捷键
    mindMap.value.keyCommand.addShortcut('Control+s', () => {
      manualSave()
    })

    // 转发事件
    const events = [
      'node_active',
      'data_change',
      'view_data_change',
      'back_forward',
      'node_contextmenu',
      'node_click',
      'draw_click',
      'expand_btn_click',
      'svg_mousedown',
      'mouseup',
      'mode_change',
      'node_tree_render_end',
      'rich_text_selection_change',
      'transforming-dom-to-images',
      'generalization_node_contextmenu',
      'painter_start',
      'painter_end',
      'scrollbar_change',
      'scale',
      'translate',
      'node_attachmentClick',
      'node_attachmentContextmenu',
      'demonstrate_jump',
      'exit_demonstrate',
      'node_note_dblclick',
      'node_mousedown',
    ]

    events.forEach((event) => {
      mindMap.value.on(event, (...args) => {
        emitter.emit(event, ...args)
      })
    })

    // 绑定保存事件
    bindSaveEvent()

    return mindMap.value
  }

  // 绑定保存事件
  const bindSaveEvent = () => {
    emitter.on('data_change', (data) => {
      storeData({ root: data })
    })

    emitter.on('view_data_change', (data) => {
      clearTimeout(storeConfigTimer.value)
      storeConfigTimer.value = setTimeout(() => {
        storeData({
          view: data,
        })
      }, 300)
    })
  }

  // 手动保存
  const manualSave = () => {
    if (mindMap.value) {
      storeData(mindMap.value.getData(true))
    }
  }

  // 设置数据
  const setData = (data) => {
    if (!mindMap.value) return

    let rootNodeData = null
    if (data.root) {
      mindMap.value.setFullData(data)
      rootNodeData = data.root
    } else {
      mindMap.value.setData(data)
      rootNodeData = data
    }
    mindMap.value.view.reset()
    manualSave()
  }

  // 执行命令
  const execCommand = (...args) => {
    if (mindMap.value) {
      mindMap.value.execCommand(...args)
    }
  }

  // 导出
  const exportMap = async (...args) => {
    if (mindMap.value) {
      try {
        // showLoading()
        await mindMap.value.export(...args)
        // hideLoading()
      } catch (error) {
        console.log(error)
        // hideLoading()
      }
    }
  }

  // 重新渲染
  const reRender = () => {
    if (mindMap.value) {
      mindMap.value.reRender()
    }
  }

  // 销毁
  const destroy = () => {
    if (mindMap.value) {
      mindMap.value.destroy()
    }
  }

  return {
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
  }
}
