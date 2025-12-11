<template>
  <t-dialog
    v-model:visible="dialogVisible"
    :title="$t('export.title')"
    width="800px"
    placement="center"
    :confirmLoading="loading"
    :closeBtn="false"
    :header="false"
    :footer="false"
    :dialogStyle="{ padding: '0', overflowY: 'hidden' }"
    destroyOnClose
    @onClose="cancel"
  >
    <div class="exportContainer">
      <!-- 导出类型选择 -->
      <div class="downloadTypeSelectBox">
        <!-- 类型列表 -->
        <div class="downloadTypeList customScrollbar">
          <div
            v-for="item in downTypeList"
            :key="item.type"
            class="downloadTypeItem"
            :class="{ active: exportType === item.type }"
            @click="exportType = item.type"
          >
            <div
              class="typeIcon"
              :class="[item.type]"
            ></div>
            <div class="name">{{ item.name }}</div>
            <div class="icon checked el-icon-check"></div>
          </div>
        </div>
        <!-- 类型内容 -->
        <div class="downloadTypeContent">
          <!-- 文件名称输入 -->
          <div class="nameInputBox">
            <div class="nameInput">
              <span class="name">{{ $t("export.filename") }}</span>
              <t-input v-model="fileName" />
            </div>
            <span
              class="closeBtn el-icon-close"
              @click="cancel"
            ></span>
          </div>
          <!-- 配置 -->
          <div class="contentBox customScrollbar">
            <div class="contentRow">
              <div class="contentName">{{ $t("export.format") }}</div>
              <div class="contentValue info">
                {{ currentTypeData ? "." + currentTypeData.type : "" }}
              </div>
            </div>
            <div class="contentRow">
              <div class="contentName">{{ $t("export.desc") }}</div>
              <div class="contentValue info">
                {{ currentTypeData ? currentTypeData.desc : "" }}
              </div>
            </div>
            <div class="contentRow">
              <div class="contentName">{{ $t("export.options") }}</div>
              <div
                class="contentValue info"
                v-if="noOptions"
              >
                无
              </div>
              <div
                class="contentValue"
                v-else
              >
                <div
                  class="valueItem"
                  v-show="['smm', 'json'].includes(exportType)"
                >
                  <t-checkbox v-model="widthConfig">
                    {{ $t("export.include") }}
                  </t-checkbox>
                </div>
                <div
                  class="valueItem"
                  v-show="['svg', 'png', 'pdf'].includes(exportType)"
                >
                  <div
                    class="valueSubItem"
                    v-if="['png'].includes(exportType)"
                  >
                    <span class="name">{{ $t("export.format") }}</span>
                    <t-radio :checked="true">{{ imageFormat }}</t-radio>
                  </div>
                  <div class="valueSubItem">
                    <span class="name">{{ $t("export.paddingX") }}</span>
                    <t-input
                      style="width: 200px"
                      v-model="paddingX"
                      @change="onPaddingChange"
                    ></t-input>
                  </div>
                  <div class="valueSubItem">
                    <span class="name">{{ $t("export.paddingY") }}</span>
                    <t-input
                      style="width: 200px"
                      v-model="paddingY"
                      @change="onPaddingChange"
                    ></t-input>
                  </div>
                  <div class="valueSubItem">
                    <span class="name">{{ $t("export.addFooterText") }}</span>
                    <t-input
                      style="width: 200px"
                      v-model="extraText"
                      :placeholder="$t('export.addFooterTextPlaceholder')"
                    ></t-input>
                  </div>
                  <div class="valueSubItem">
                    <t-checkbox
                      v-show="['png', 'pdf'].includes(exportType)"
                      v-model="isTransparent"
                    >
                      {{ $t("export.isTransparent") }}
                    </t-checkbox>
                  </div>
                  <div class="valueSubItem">
                    <t-checkbox
                      v-show="showFitBgOption"
                      v-model="isFitBg"
                    >
                      {{ $t("export.isFitBg") }}
                    </t-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 按钮 -->
          <div class="btnList">
            <t-button
              variant="outline"
              @click="cancel"
            >
              {{ $t("dialog.cancel") }}
            </t-button>
            <t-button
              type="primary"
              @click="confirm"
            >
              {{ $t("export.confirm") }}
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </t-dialog>
</template>

<script setup>
import { downTypeList } from "@/config";
import appStore from "@/stores";
import emitter from "@/utils/eventBus";
import { computed, ref } from "vue";

const dialogVisible = ref(false);
const exportType = ref("png");
const fileName = ref("思维导图大师");
const widthConfig = ref(true);
const isTransparent = ref(false);
const loading = ref(false);
const loadingText = ref("");
const paddingX = ref(10);
const paddingY = ref(10);
const extraText = ref("");
const isMobile = ref(false);
const isFitBg = ref(true);
const imageFormat = ref("png");

const currentTypeData = computed(() => {
  return downTypeList.find((item) => item.type === exportType.value);
});

const showFitBgOption = computed(() => {
  return ["png", "pdf"].includes(exportType.value) && !isTransparent.value;
});

const noOptions = computed(() => {
  return ["md", "xmind", "txt", "xlsx", "mm"].includes(exportType.value);
});

// 方法
const onPaddingChange = () => {
  emitter.emit("paddingChange", {
    exportPaddingX: Number(paddingX.value),
    exportPaddingY: Number(paddingY.value),
  });
};

const cancel = () => {
  dialogVisible.value = false;
};

/** 导出 */
const confirm = () => {
  appStore.setExtraTextOnExport(extraText.value);

  if (exportType.value === "svg") {
    emitter.emit(
      "export",
      exportType.value,
      true,
      fileName.value,
      `* {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }`
    );
  } else if (["smm", "json"].includes(exportType.value)) {
    emitter.emit(
      "export",
      exportType.value,
      true,
      fileName.value,
      widthConfig.value
    );
  } else if (exportType.value === "png") {
    emitter.emit(
      "export",
      imageFormat.value,
      true,
      fileName.value,
      isTransparent.value,
      null,
      isFitBg.value
    );
  } else if (exportType.value === "pdf") {
    emitter.emit(
      "export",
      exportType.value,
      true,
      fileName.value,
      isTransparent.value,
      isFitBg.value
    );
  } else {
    emitter.emit("export", exportType.value, true, fileName.value);
  }

  emitter.emit("notify", {
    title: "导出成功",
    message: "文件已保存到本地",
  });

  cancel();
};

emitter.on("showExport", () => {
  dialogVisible.value = true;
});
</script>

<style lang="less">
.t-dialog {
  .t-dialog__body {
    padding: 0 !important;
  }
}
</style>

<style lang="less" scoped>
.exportContainer {
  width: 100%;
  height: 552px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .downloadTypeSelectBox {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;

    .downloadTypeList {
      width: 208px;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: var(--td-gray-color-3);
      flex-shrink: 0;
      padding: 16px 0;

      .downloadTypeItem {
        width: 100%;
        height: 52px;
        padding: 0 30px;
        overflow: hidden;
        display: flex;
        align-items: center;
        cursor: pointer;

        &.active {
          background-color: #fff;

          .icon {
            &.checked {
              display: block;
            }
          }
        }

        .icon {
          font-size: 25px;
          font-weight: 700;

          &.checked {
            color: #409eff;
            font-size: 20px;
            margin-left: auto;
            display: none;
          }
        }

        .typeIcon {
          margin-right: 18px;
          flex-shrink: 0;
          width: 23px;
          height: 26px;
          background-size: cover;

          &.png {
            background-image: url("@/assets/img/format/2.png");
          }

          &.pdf {
            background-image: url("@/assets/img/format/4.png");
          }

          &.md {
            background-image: url("@/assets/img/format/5.png");
          }

          &.json {
            background-image: url("@/assets/img/format/10.png");
          }

          &.svg {
            background-image: url("@/assets/img/format/3.png");
          }

          &.smm {
            background-image: url("@/assets/img/format/1.png");
          }

          &.xmind {
            background-image: url("@/assets/img/format/6.png");
          }

          &.txt {
            background-image: url("@/assets/img/format/7.png");
          }

          &.mm {
            background-image: url("@/assets/img/format/8.png");
          }

          &.xlsx {
            background-image: url("@/assets/img/format/9.png");
          }
        }

        .name {
          color: #333;
          font-size: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: bold;
        }
      }
    }

    .downloadTypeContent {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .nameInputBox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 67px;
        flex-shrink: 0;
        border-bottom: 1px solid #f2f4f7;
        padding-left: 40px;
        padding-right: 20px;
        padding-top: 16px;

        .nameInput {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          width: 100%;
          font-weight: bold;
          .name {
            margin-right: 10px;
            font-size: 15px;
            color: #000;
            font-weight: bold;
            white-space: nowrap; /* 防止文字换行，确保宽度随内容自适应 */
          }
        }

        .closeBtn {
          font-size: 20px;
          cursor: pointer;
        }
      }

      .contentBox {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 15px 40px;

        .contentRow {
          display: flex;
          font-size: 14px;
          margin-bottom: 20px;

          &:last-of-type {
            margin-bottom: 0;
          }

          .contentName {
            min-width: 40px;
            color: #000;
            flex-shrink: 0;
            font-size: 15px;
            font-weight: bold;
            line-height: 25px;
            margin-right: 12px;
          }

          .contentValue {
            color: #000;
            line-height: 23px;
            border: 1px solid transparent;
            font-size: 14px;

            &.info {
              color: rgb(90, 158, 247);
              background-color: rgb(245, 248, 249);
              border: 1px solid rgb(90, 158, 247);
              border-radius: 5px;
              padding: 0 16px;
            }

            .valueItem {
              .valueSubItem {
                margin-bottom: 12px;
                display: flex;
                align-items: center;

                &:last-of-type {
                  margin-right: 0;
                }

                &.alignCenter {
                  align-items: center;
                }

                .name {
                  margin-right: 12px;
                  min-width: 85px;
                }
              }
            }
          }
        }
      }

      .btnList {
        padding: 0 40px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 20px;
        height: 69px;
        flex-shrink: 0;
        border-top: 1px solid #f2f4f7;
      }
    }
  }
}
</style>
