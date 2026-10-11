'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getFees,
  saveFees,
  upsertProduct,
  deleteProduct,
} from '../actions'
import { useLang } from '@/components/lang-provider'
import { useCurrency } from '@/components/currency-provider'
import { DEFAULT_FEES } from '@/lib/constants'
import type { FeeSettings, Product } from '@/lib/types'

// 商品管理：新增/编辑（含种类、多张图片）+ 删除 + 费用设置
// "新增商品"和"现有商品"为两个独立视图，点击编辑自动进入商品调整页
export default function ProductsClient({
  products,
}: {
  products: Product[]
}) {
  const router = useRouter()
  const { t } = useLang()
  const { cny, jpy, rates } = useCurrency()
  // 视图切换：新增商品表单 / 现有商品列表 + 费用设置
  const [view, setView] = useState<'form' | 'list'>('form')

  // ===== 商品表单 =====
  const [editingId, setEditingId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [msg, setMsg] = useState('')

  // ===== 费用设置 =====
  const [fees, setFees] = useState<FeeSettings>(DEFAULT_FEES)
  const [feeRate, setFeeRate] = useState('10')
  const [feePacking, setFeePacking] = useState('300')
  const [feeShipping, setFeeShipping] = useState('500')
  const [feeSettlement, setFeeSettlement] = useState('100')
  const [feesMsg, setFeesMsg] = useState('')
  const [feesBusy, setFeesBusy] = useState(false)

  // 切换到列表视图时读取费用设置
  useEffect(() => {
    if (view === 'list') {
      getFees()
        .then((f) => {
          setFees(f)
          setFeeRate(String(Math.round(f.serviceRate * 100)))
          setFeePacking(String(f.packingJpy))
          setFeeShipping(String(f.shippingJpy))
          setFeeSettlement(String(f.settlementCny))
        })
        .catch(() => {})
    }
  }, [view])

  function startEdit(p: Product) {
    setEditingId(p.id)
    setName(p.name)
    setDescription(p.description ?? '')
    // 数据库存的是美元，表单以人民币显示
    setPrice((parseFloat(p.price) * rates.CNY).toFixed(2))
    setStock(String(p.stock))
    setCategory(p.category ?? '')
    setImageUrl(p.image_url ?? '')
    setExistingImages(p.image_urls ?? [])
    setFiles([])
    // 点击编辑 → 进入商品调整页（表单视图）
    setView('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId('')
    setName('')
    setDescription('')
    setPrice('')
    setStock('')
    setCategory('')
    setImageUrl('')
    setExistingImages([])
    setFiles([])
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('id', editingId)
    fd.set('name', name)
    fd.set('description', description)
    fd.set('price', price)
    fd.set('stock', stock)
    fd.set('category', category)
    fd.set('image_url', imageUrl)
    fd.set('existing_images', JSON.stringify(existingImages))
    files.forEach((f) => fd.set('images', f))
    const res = await upsertProduct(fd)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ 保存成功')
      resetForm()
      router.refresh()
    }
  }

  async function onDelete(id: string) {
    if (!confirm('确定删除这个商品吗？')) return
    const res = await deleteProduct(id)
    if (res?.error) {
      setMsg('❌ ' + res.error)
    } else {
      setMsg('✅ 已删除')
      router.refresh()
    }
  }

  function resetFees() {
    setFeeRate(String(Math.round(fees.serviceRate * 100)))
    setFeePacking(String(fees.packingJpy))
    setFeeShipping(String(fees.shippingJpy))
    setFeeSettlement(String(fees.settlementCny))
    setFeesMsg('')
  }

  async function onSaveFees(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('serviceRate', feeRate)
    fd.set('packingJpy', feePacking)
    fd.set('shippingJpy', feeShipping)
    fd.set('settlementCny', feeSettlement)
    setFeesBusy(true)
    setFeesMsg('')
    const res = await saveFees(fd)
    setFeesBusy(false)
    if (res?.error) {
      setFeesMsg('❌ ' + res.error)
    } else {
      setFeesMsg('✅ 保存成功')
      // 刷新内存中的费用
      const f = await getFees()
      setFees(f)
    }
  }

  return (
    <div>
      <div className="admin-bar">
        <h1>商品管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${view === 'form' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              resetForm()
              setView('form')
            }}
          >
            ＋ 新增商品
          </button>
          <button
            type="button"
            className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('list')}
          >
            {t('existingProducts')}（{products.length}）
          </button>
        </div>
      </div>

      {/* 新增/调整商品表单（单独显示） */}
      {view === 'form' && (
        <form className="admin-panel" onSubmit={onSubmit}>
          <h2 style={{ marginTop: 0 }}>
            {editingId ? '调整商品' : '新增商品'}
          </h2>
          <div className="field">
            <label className="label">商品名称 *</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：Building Blocks Set"
            />
          </div>
          <div className="field">
            <label className="label">描述</label>
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label">价格（人民币）*</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="例如：175.00"
            />
            {/* 汇率换算提示（日元） */}
            {price ? (
              <p className="muted">
                ≈ {jpy(parseFloat(price) / rates.CNY)}
              </p>
            ) : null}
          </div>
          <div className="field">
            <label className="label">库存数量 *</label>
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="例如：50"
            />
          </div>
          <div className="field">
            <label className="label">{t('category')}</label>
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例如：积木 / 玩偶 / 遥控车"
            />
          </div>
          <div className="field">
            <label className="label">{t('images')}</label>
            <input
              className="file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            <p className="muted">{t('uploadMultiple')}</p>
            {files.length > 0 ? (
              <p className="muted">已选择 {files.length} 张新图片</p>
            ) : null}
            {existingImages.length > 0 && files.length === 0 ? (
              <div>
                <div className="gallery-thumbs">
                  {existingImages.map((img) => (
                    <div className="gallery-thumb" key={img}>
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
                <p className="muted">当前图片（不选新图片则保留）</p>
              </div>
            ) : null}
          </div>
          {msg ? <p className="muted">{msg}</p> : null}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn-primary" type="submit">
              保存
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={resetForm}
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 现有商品列表 + 费用设置（单独显示） */}
      {view === 'list' && (
        <>
          <h2>
            {t('existingProducts')}（{products.length}）
          </h2>
          {products.length === 0 ? (
            <div className="empty">
              <p>还没有商品，用上面的表单上架第一个商品吧。</p>
            </div>
          ) : (
            products.map((p) => {
              const cover =
                p.image_urls && p.image_urls.length > 0
                  ? p.image_urls[0]
                  : p.image_url
              return (
                <div className="admin-product-row" key={p.id}>
                  {cover ? (
                    <img src={cover} alt="" />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        background: '#eef2f7',
                      }}
                    />
                  )}
                  <div className="admin-product-info">
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="muted">
                      {cny(parseFloat(p.price))} /{' '}
                      {jpy(parseFloat(p.price))} · 库存 {p.stock}
                      {p.category ? ` · ${p.category}` : ''}
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => startEdit(p)}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(p.id)}
                  >
                    删除
                  </button>
                </div>
              )
            })
          )}

          {/* 费用设置（在现有商品后面） */}
          <h2>{t('feeSettings')}</h2>
          <form className="admin-panel" onSubmit={onSaveFees}>
            <div className="field">
              <label className="label">
                {t('serviceFee')}（%）
              </label>
              <input
                className="input"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={feeRate}
                onChange={(e) => setFeeRate(e.target.value)}
              />
              <p className="muted">按商品合计的百分比收取</p>
            </div>
            <div className="field">
              <label className="label">
                {t('packingFee')}（日元）
              </label>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                value={feePacking}
                onChange={(e) => setFeePacking(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">
                {t('shippingFee')}（日元）
              </label>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                value={feeShipping}
                onChange={(e) => setFeeShipping(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">
                {t('settlementFee')}（人民币）
              </label>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                value={feeSettlement}
                onChange={(e) => setFeeSettlement(e.target.value)}
              />
            </div>
            {feesMsg ? <p className="muted">{feesMsg}</p> : null}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={feesBusy}
              >
                {feesBusy ? '保存中…' : '保存'}
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={resetFees}
              >
                取消
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
