// composables/useEventHandlers.js
import { onMounted, onBeforeUnmount } from 'vue'
import emitter from '@/utils/eventBus'

export default function useEventHandlers(mindMapRef) {
  // 处理文本编辑开始
  const handleStartTextEdit = () => {
    if (mindMapRef.value) {
      mindMapRef.value.renderer.startTextEdit()
    }
  }
  
  // 处理文本编辑结束
  const handleEndTextEdit = () => {
    if (mindMapRef.value) {
      mindMapRef.value.renderer.endTextEdit()
    }
  }
  
  // 处理创建关联线
  const handleCreateLineFromActiveNode = () => {
    if (mindMapRef.value) {
      mindMapRef.value.associativeLine.createLineFromActiveNode()
    }
  }
  
  // 处理启动画笔
  const handleStartPainter = () => {
    if (mindMapRef.value) {
      mindMapRef.value.painter.startPainter()
    }
  }
  
  // 处理窗口大小调整
  const handleResize = () => {
    if (mindMapRef.value) {
      mindMapRef.value.resize()
    }
  }
  
  // 绑定事件
  const bindEvents = () => {
    emitter.on('execCommand', execCommand)
    emitter.on('paddingChange', onPaddingChange)
    emitter.on('export', exportMap)
    emitter.on('setData', setData)
    emitter.on('startTextEdit', handleStartTextEdit)
    emitter.on('endTextEdit', handleEndTextEdit)
    emitter.on('createAssociativeLine', handleCreateLineFromActiveNode)
    emitter.on('startPainter', handleStartPainter)
    emitter.on('node_tree_render_end', handleHideLoading)
    emitter.on('showLoading', handleShowLoading)
    emitter.on('localStorageExceeded', onLocalStorageExceeded)
    
    window.addEventListener('resize', handleResize)
    emitter.on('showDownloadTip', showDownloadTip)
  }
  
  // 解绑事件
  const unbindEvents = () => {
    emitter.off('execCommand', execCommand)
    emitter.off('paddingChange', onPaddingChange)
    emitter.off('export', exportMap)
    emitter.off('setData', setData)
    emitter.off('startTextEdit', handleStartTextEdit)
    emitter.off('endTextEdit', handleEndTextEdit)
    emitter.off('createAssociativeLine', handleCreateLineFromActiveNode)
    emitter.off('startPainter', handleStartPainter)
    emitter.off('node_tree_render_end', handleHideLoading)
    emitter.off('showLoading', handleShowLoading)
    emitter.off('localStorageExceeded', onLocalStorageExceeded)
    
    window.removeEventListener('resize', handleResize)
    emitter.off('showDownloadTip', showDownloadTip)
  }
  
  return {
    handleStartTextEdit,
    handleEndTextEdit,
    handleCreateLineFromActiveNode,
    handleStartPainter,
    handleResize,
    bindEvents,
    unbindEvents
  }
}