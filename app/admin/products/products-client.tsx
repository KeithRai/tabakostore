'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertProduct, deleteProduct } from '../actions'
import { usd } from '@/lib/format'
import { useLang } from '@/components/lang-provider'
import { useCurrency } from '@/components/currency-provider'
import type { Product } from '@/lib/types'

// 商品管理：新增/编辑（含种类、多张图片）+ 删除
// 现有商品列表由"现有商品"按钮控制显隐
export default function ProductsClient({
  products,
}: {
  products: Product[]
}) {
  const router = useRouter()
  const { t } = useLang()
  const { cny, jpy } = useCurrency()
  // 视图切换：新增商品表单 和 现有商品列表 分开显示
  const [view, setView] = useState<'form' | 'list'>('form')
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

  function startEdit(p: Product) {
    setEditingId(p.id)
    setName(p.name)
    setDescription(p.description ?? '')
    setPrice(p.price)
    setStock(String(p.stock))
    setCategory(p.category ?? '')
    setImageUrl(p.image_url ?? '')
    setExistingImages(p.image_urls ?? [])
    setFiles([])
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

      {/* 新增/编辑商品表单（单独显示） */}
      {view === 'form' && (
        <form className="admin-panel" onSubmit={onSubmit}>
        <h2 style={{ marginTop: 0 }}>
          {editingId ? '编辑商品' : '新增商品'}
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
          <label className="label">价格（美元）*</label>
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="例如 24.99"
          />
          {/* 汇率换算提示（人民币 / 日元） */}
          {price ? (
            <p className="muted">
              ≈ {cny(parseFloat(price) || 0)} /{' '}
              {jpy(parseFloat(price) || 0)}
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
            placeholder="例如 50"
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

      {/* 现有商品列表（单独显示，不与新增商品在一起） */}
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
                      {usd(p.price)} · {cny(parseFloat(p.price))} /{' '}
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
        </>
      )}
    </div>
  )
}
