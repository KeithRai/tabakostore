'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertProduct, deleteProduct } from '../actions'
import { usd } from '@/lib/format'
import type { Product } from '@/lib/types'

// 商品管理：表单新增/编辑 + 列表删除
export default function ProductsClient({
  products,
}: {
  products: Product[]
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState('')

  function startEdit(p: Product) {
    setEditingId(p.id)
    setName(p.name)
    setDescription(p.description ?? '')
    setPrice(p.price)
    setStock(String(p.stock))
    setImageUrl(p.image_url ?? '')
    setFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId('')
    setName('')
    setDescription('')
    setPrice('')
    setStock('')
    setImageUrl('')
    setFile(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('id', editingId)
    fd.set('name', name)
    fd.set('description', description)
    fd.set('price', price)
    fd.set('stock', stock)
    fd.set('image_url', imageUrl)
    if (file) fd.set('image', file)
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
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => {
            resetForm()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          ＋ 新增商品
        </button>
      </div>

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
          <label className="label">商品图片</label>
          <input
            className="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="muted">已选择：{file.name}（保存后上传）</p>
          ) : imageUrl ? (
            <div>
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: 120,
                  borderRadius: 8,
                  marginTop: 8,
                  display: 'block',
                }}
              />
              <p className="muted">当前图片（不选新图片则保留）</p>
            </div>
          ) : (
            <p className="muted">不上传也可以，保存后再补</p>
          )}
        </div>
        {msg ? <p className="muted">{msg}</p> : null}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn btn-primary" type="submit">
            保存
          </button>
          {editingId ? (
            <button
              className="btn btn-outline"
              type="button"
              onClick={resetForm}
            >
              取消编辑
            </button>
          ) : null}
        </div>
      </form>

      <h2>现有商品（{products.length}）</h2>
      {products.length === 0 ? (
        <div className="empty">
          <p>还没有商品，用上面的表单上架第一个商品吧。</p>
        </div>
      ) : (
        products.map((p) => (
          <div className="admin-product-row" key={p.id}>
            {p.image_url ? (
              <img src={p.image_url} alt="" />
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
                {usd(p.price)} · 库存 {p.stock}
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
        ))
      )}
    </div>
  )
}
