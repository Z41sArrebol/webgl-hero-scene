/**
 * 从 src/scenes/moonshotScene.ts 导出纯 JSON 文件，供原生 JS 示例（非 React 场景）使用。
 * 保持单一数据源，避免仓库里出现两份内容不一致的场景。
 *
 * 用法：npm run export:scene
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const SOURCE = 'src/scenes/moonshotScene.ts'
const TARGET = 'examples/vanilla/scene.json'

const source = readFileSync(SOURCE, 'utf8')
const declaration = source.match(/export const MOONSHOT_SCENE(?::\s*string)?\s*=\s*/)
if (!declaration) throw new Error(`${SOURCE} 里找不到 MOONSHOT_SCENE 声明`)

const rest = source.slice(declaration.index + declaration[0].length)
const literal = rest.match(/^"(?:[^"\\]|\\.)*"/)
if (!literal) throw new Error('导出的场景不是合法的字符串字面量')

// 先还原字符串字面量（得到内层 JSON 文本），再解析成对象
const scene = JSON.parse(JSON.parse(literal[0]))
if (!Array.isArray(scene.history)) throw new Error('场景里没有 history 图层数组')

const json = JSON.stringify(scene)
mkdirSync(dirname(TARGET), { recursive: true })
writeFileSync(TARGET, json)

console.log(
  `已生成 ${TARGET}：${scene.history.length} 个图层，${(json.length / 1024).toFixed(1)} KB`,
)
