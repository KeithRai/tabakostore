'use client'

import { useState } from 'react'

// 商品图片画廊：主图 + 缩略图
export default function ProductGallery({
  images,
  name,
}: {
  images: string[]
  name: string
}) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="detail-img detail-img-empty">No image</div>
  }

  return (
    <div>
      <img className="detail-img" src={images[active]} alt={name} />
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`gallery-thumb${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
            >
              <img src={img} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
