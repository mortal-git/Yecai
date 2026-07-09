<template>
  <div class="md-body" v-html="rendered"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{ content: string }>()

marked.setOptions({
  breaks: true,
  gfm: true
})

const rendered = computed(() => {
  if (!props.content) return ''
  const html = marked.parse(props.content) as string
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target']
  })
})
</script>

<style scoped>
.md-body {
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
  word-break: break-word;
}
.md-body :deep(h1),
.md-body :deep(h2),
.md-body :deep(h3),
.md-body :deep(h4) {
  margin: 12px 0 8px;
  font-weight: 600;
  line-height: 1.4;
}
.md-body :deep(h1) { font-size: 18px; }
.md-body :deep(h2) { font-size: 16px; }
.md-body :deep(h3) { font-size: 15px; }
.md-body :deep(p) { margin: 8px 0; }
.md-body :deep(ul),
.md-body :deep(ol) {
  margin: 8px 0;
  padding-left: 22px;
}
.md-body :deep(li) { margin: 4px 0; }
.md-body :deep(code) {
  background: #f4f4f5;
  padding: 1px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #d63384;
}
.md-body :deep(pre) {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 12px 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
  font-size: 13px;
  line-height: 1.55;
}
.md-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: 13px;
}
.md-body :deep(blockquote) {
  border-left: 3px solid #d0d7de;
  margin: 10px 0;
  padding: 4px 12px;
  color: #57606a;
  background: #f6f8fa;
}
.md-body :deep(table) {
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 13px;
  width: auto;
}
.md-body :deep(th),
.md-body :deep(td) {
  border: 1px solid #e4e7ed;
  padding: 6px 12px;
  text-align: left;
}
.md-body :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}
.md-body :deep(a) {
  color: #409eff;
  text-decoration: none;
}
.md-body :deep(a:hover) { text-decoration: underline; }
.md-body :deep(hr) {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 16px 0;
}
</style>
