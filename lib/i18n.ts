export type Lang = 'en' | 'zh' | 'ja'

export const LANG_LIST: Lang[] = ['en', 'zh', 'ja']

export const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  zh: '中文',
  ja: '日本語',
}

const en = {
  // 导航栏
  shop: 'Shop',
  cart: 'Cart',
  contactUs: 'Contact Us',
  myOrders: 'My Orders',
  logIn: 'Log in',
  signUp: 'Sign up',
  logOut: 'Log out',
  // 首页
  welcomeTitle: 'Welcome to TabakoStore 🧸',
  welcomeSub:
    'Fun toys shipped worldwide. Pay by WeChat Pay / Alipay via our customer service.',
  noProducts: 'No products yet.',
  // 商品卡片 / 商品页
  details: 'Details',
  addToCart: 'Add to cart',
  inStock: '{n} in stock',
  outOfStock: 'Out of stock',
  noImage: 'No image',
  // 购物车
  yourCart: 'Your Cart',
  cartEmpty: 'Your cart is empty.',
  browseProducts: 'Browse products',
  product: 'Product',
  price: 'Price',
  qty: 'Qty',
  subtotal: 'Subtotal',
  remove: 'Remove',
  total: 'Total',
  proceedToCheckout: 'Proceed to Checkout',
  paymentNote:
    'Payment: WeChat Pay / Alipay via customer service. Credit card via PayPal coming soon.',
  // 登录
  loginTitle: 'Log in',
  email: 'Email',
  password: 'Password',
  loggingIn: 'Logging in…',
  noAccount: 'No account?',
  // 注册
  signupTitle: 'Sign up',
  passwordMin: 'Password (min. 6 characters)',
  signingUp: 'Signing up…',
  haveAccount: 'Already have an account?',
  checkEmail: 'Please check your email to verify your account.',
  // 结算
  checkoutTitle: 'Checkout',
  orderSummary: 'Order summary',
  shippingInfo: 'Shipping information',
  fullName: 'Full name *',
  country: 'Country *',
  countryPlaceholder: 'e.g. United States',
  address: 'Address *',
  addressPlaceholder: 'Street, city, postal code',
  phone: 'Phone (optional)',
  paymentMethod: 'Payment method',
  payWechat: 'WeChat Pay / Alipay',
  payWechatDesc: 'pay via customer service chat',
  payCard: 'Credit / Debit Card',
  payCardDesc: 'via PayPal (coming soon)',
  fillRequired: 'Please fill in all required (*) fields.',
  placeOrder: 'Place Order',
  placingOrder: 'Placing order…',
  // 支付弹窗
  orderPlaced: 'Order placed! 🎉',
  orderNumber: 'Order number',
  howToPay: 'How to pay',
  howToPay1: 'Click the button below to open our customer service chat.',
  howToPay2: 'Send the agent your order number.',
  howToPay3:
    'Pay by WeChat Pay or Alipay as the agent instructs.',
  howToPay4: 'We will confirm your payment and ship the order.',
  cardComingSoon: 'Credit / debit card payment via PayPal is coming soon.',
  openChat: 'Open Customer Service Chat',
  close: 'Close',
  // 我的订单
  noOrders: 'No orders yet.',
  startShopping: 'Start shopping',
  shipTo: 'Ship to',
  pendingNote:
    'Please contact customer service to complete payment (WeChat Pay / Alipay).',
}

export type Dict = typeof en

const zh: Dict = {
  shop: '商店',
  cart: '购物车',
  contactUs: '联系客服',
  myOrders: '我的订单',
  logIn: '登录',
  signUp: '注册',
  logOut: '退出',
  welcomeTitle: '欢迎光临 TabakoStore 🧸',
  welcomeSub: '好玩玩具，运送全球。支持微信支付 / 支付宝（通过客服付款）。',
  noProducts: '暂无商品。',
  details: '详情',
  addToCart: '加入购物车',
  inStock: '库存 {n} 件',
  outOfStock: '已售罄',
  noImage: '暂无图片',
  yourCart: '购物车',
  cartEmpty: '购物车是空的。',
  browseProducts: '浏览商品',
  product: '商品',
  price: '价格',
  qty: '数量',
  subtotal: '小计',
  remove: '移除',
  total: '合计',
  proceedToCheckout: '去结算',
  paymentNote:
    '支付方式：通过客服使用微信支付 / 支付宝。信用卡（PayPal）即将上线。',
  loginTitle: '登录',
  email: '邮箱',
  password: '密码',
  loggingIn: '登录中…',
  noAccount: '没有账户？',
  signupTitle: '注册',
  passwordMin: '密码（至少 6 位）',
  signingUp: '注册中…',
  haveAccount: '已有账户？',
  checkEmail: '请检查邮箱中的验证链接。',
  checkoutTitle: '结算',
  orderSummary: '订单摘要',
  shippingInfo: '收货信息',
  fullName: '姓名 *',
  country: '国家 *',
  countryPlaceholder: '例如：美国',
  address: '地址 *',
  addressPlaceholder: '街道、城市、邮编',
  phone: '电话（可选）',
  paymentMethod: '支付方式',
  payWechat: '微信支付 / 支付宝',
  payWechatDesc: '通过客服聊天付款',
  payCard: '信用卡 / 借记卡',
  payCardDesc: '通过 PayPal（即将上线）',
  fillRequired: '请填写所有必填（*）字段。',
  placeOrder: '提交订单',
  placingOrder: '提交中…',
  orderPlaced: '下单成功！🎉',
  orderNumber: '订单号',
  howToPay: '支付方式',
  howToPay1: '点击下方按钮打开客服聊天。',
  howToPay2: '向客服提供你的订单号。',
  howToPay3: '按客服指引使用微信支付或支付宝付款。',
  howToPay4: '我们确认收款后安排发货。',
  cardComingSoon: '信用卡（PayPal）支付即将上线。',
  openChat: '打开客服聊天',
  close: '关闭',
  noOrders: '暂无订单。',
  startShopping: '开始购物',
  shipTo: '收货人',
  pendingNote: '请联系客服完成支付（微信支付 / 支付宝）。',
}

const ja: Dict = {
  shop: 'ショップ',
  cart: 'カート',
  contactUs: 'お問い合わせ',
  myOrders: '注文履歴',
  logIn: 'ログイン',
  signUp: '新規登録',
  logOut: 'ログアウト',
  welcomeTitle: 'TabakoStoreへようこそ 🧸',
  welcomeSub:
    'おもちゃを世界中へお届け。WeChat支付・支付宝（カスタマーサポート経由）でお支払いいただけます。',
  noProducts: '商品はまだありません。',
  details: '詳細',
  addToCart: 'カートに追加',
  inStock: '在庫 {n} 個',
  outOfStock: '在庫なし',
  noImage: '画像なし',
  yourCart: 'カート',
  cartEmpty: 'カートは空です。',
  browseProducts: '商品を見る',
  product: '商品',
  price: '価格',
  qty: '数量',
  subtotal: '小計',
  remove: '削除',
  total: '合計',
  proceedToCheckout: 'チェックアウトへ進む',
  paymentNote:
    'お支払い：カスタマーサポート経由でWeChat支付・支付宝。クレジットカード（PayPal）は近日対応予定。',
  loginTitle: 'ログイン',
  email: 'メールアドレス',
  password: 'パスワード',
  loggingIn: 'ログイン中…',
  noAccount: 'アカウントをお持ちでないですか？',
  signupTitle: '新規登録',
  passwordMin: 'パスワード（6文字以上）',
  signingUp: '登録中…',
  haveAccount: 'すでにアカウントをお持ちですか？',
  checkEmail: 'メールの確認リンクをご確認ください。',
  checkoutTitle: 'チェックアウト',
  orderSummary: '注文内容',
  shippingInfo: '配送情報',
  fullName: 'お名前 *',
  country: '国 *',
  countryPlaceholder: '例：アメリカ',
  address: '住所 *',
  addressPlaceholder: '番地、市区町村、郵便番号',
  phone: '電話番号（任意）',
  paymentMethod: 'お支払い方法',
  payWechat: 'WeChat支付・支付宝',
  payWechatDesc: 'カスタマーサポート経由で支払い',
  payCard: 'クレジットカード',
  payCardDesc: 'PayPal経由（近日対応予定）',
  fillRequired: '必須項目（*）を入力してください。',
  placeOrder: '注文を確定する',
  placingOrder: '送信中…',
  orderPlaced: '注文完了！🎉',
  orderNumber: '注文番号',
  howToPay: 'お支払い方法',
  howToPay1: '下のボタンからカスタマーサポートチャットを開いてください。',
  howToPay2: 'カスタマーサポートに注文番号を伝えてください。',
  howToPay3:
    'カスタマーサポートの案内に従い、WeChat支付または支付宝でお支払いください。',
  howToPay4: '入金確認後に発送いたします。',
  cardComingSoon: 'クレジットカード（PayPal）決済は近日対応予定です。',
  openChat: 'カスタマーサポートを開く',
  close: '閉じる',
  noOrders: '注文はまだありません。',
  startShopping: '買い物を始める',
  shipTo: '配送先',
  pendingNote:
    'カスタマーサポートに連絡して支払いを完了してください（WeChat支付・支付宝）。',
}

export function getDictionary(lang: Lang): Dict {
  if (lang === 'zh') return zh
  if (lang === 'ja') return ja
  return en
}

// 服务端用的翻译函数（客户端用 LangProvider 的 t()）
export function tr(
  dict: Dict,
  key: keyof Dict,
  params?: Record<string, string | number>
): string {
  let s = dict[key] as string
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(`{${k}}`, String(v))
    }
  }
  return s
}
