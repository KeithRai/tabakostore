// 全局业务规则常量（单一数据源，前后端共用）

import type { FeeSettings } from './types'

// 单件商品最多购买数量
export const MAX_PER_ITEM = 20

// 单个订单所有商品合计最多数量
export const MAX_ORDER = 20

// 主页每页显示的商品数量
export const PAGE_SIZE = 20

// 常见国家区号（个人资料页手机号前缀）
export const PHONE_CODES: Array<{ code: string; label: string }> = [
  { code: '+86', label: '中国' },
  { code: '+1', label: '美国' },
  { code: '+81', label: '日本' },
  { code: '+82', label: '韩国' },
  { code: '+852', label: '中国香港' },
  { code: '+886', label: '中国台湾' },
  { code: '+44', label: '英国' },
  { code: '+33', label: '法国' },
  { code: '+49', label: '德国' },
  { code: '+61', label: '澳大利亚' },
  { code: '+65', label: '新加坡' },
  { code: '+66', label: '泰国' },
  { code: '+63', label: '菲律宾' },
  { code: '+60', label: '马来西亚' },
  { code: '+64', label: '新西兰' },
  { code: '+55', label: '巴西' },
  { code: '+7', label: '俄罗斯' },
  { code: '+84', label: '越南' },
  { code: '+62', label: '印度尼西亚' },
  { code: '+91', label: '印度' },
]

// 默认费用设置（后台可调整）
// 运费不固定：由客服确认后告知
export const DEFAULT_FEES: FeeSettings = {
  serviceRate: 0.1, // 服务费：商品合计的 10%
  packingJpy: 300, // 包装费：300 日元
  settlementRate: 0.02, // 国际结算手续费：商品合计的 2%
}
