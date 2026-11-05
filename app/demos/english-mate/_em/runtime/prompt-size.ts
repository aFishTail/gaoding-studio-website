/**
 * 主文案字号自适应
 *
 * 单词卡片默认用 --fs-display（88rpx）显得有分量，但表达/语法常常是一整句，
 * 同一个字号会把整张卡撑满、断成四五行的巨型文字。这里按「视觉宽度」分档：
 * 中日韩字符按 2 计（全角），其余按 1 计（半角），再给出对应的字号修饰类。
 */

export type PromptScaleClass = '' | 'word-hero--lg' | 'word-hero--md' | 'word-hero--sm'

const CJK_START = 0x2e80

function visualWidth(text: string): number {
  let width = 0
  for (let i = 0; i < text.length; i += 1) {
    width += text.charCodeAt(i) >= CJK_START ? 2 : 1
  }
  return width
}

/**
 * @param text 卡片正面主文案
 * @returns 追加到 `.word-hero` 上的字号修饰类，短文案返回空串（用默认 88rpx）
 */
export function promptScaleClass(text: string | undefined | null): PromptScaleClass {
  const width = visualWidth(text || '')
  if (width <= 12) return ''
  if (width <= 20) return 'word-hero--lg'
  if (width <= 44) return 'word-hero--md'
  return 'word-hero--sm'
}
