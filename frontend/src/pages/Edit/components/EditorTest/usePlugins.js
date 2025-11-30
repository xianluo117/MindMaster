// composables/usePlugins.js
import { watch } from 'vue'
import appStore from '@/stores'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import ScrollbarPlugin from 'simple-mind-map/src/plugins/Scrollbar.js'

export default function usePlugins(mindMapRef) {
  // 加载富文本插件
  const addRichTextPlugin = () => {
    if (mindMapRef.value) {
      mindMapRef.value.addPlugin(RichText)
    }
  }

  // 移除富文本插件
  const removeRichTextPlugin = () => {
    if (mindMapRef.value) {
      mindMapRef.value.removePlugin(RichText)
    }
  }

  // 加载滚动条插件
  const addScrollbarPlugin = () => {
    if (mindMapRef.value) {
      mindMapRef.value.addPlugin(ScrollbarPlugin)
    }
  }

  // 移除滚动条插件
  const removeScrollbarPlugin = () => {
    if (mindMapRef.value) {
      mindMapRef.value.removePlugin(ScrollbarPlugin)
    }
  }

  // 监听状态变化
  watch(
    () => appStore.localConfig.openNodeRichText,
    (newVal) => {
      if (newVal) {
        addRichTextPlugin()
      } else {
        removeRichTextPlugin()
      }
    },
  )

  watch(
    () => appStore.localConfig.isShowScrollbar,
    (newVal) => {
      if (newVal) {
        addScrollbarPlugin()
      } else {
        removeScrollbarPlugin()
      }
    },
  )

  return {
    addRichTextPlugin,
    removeRichTextPlugin,
    addScrollbarPlugin,
    removeScrollbarPlugin,
  }
}
