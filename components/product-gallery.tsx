'use client'

import { useState } from 'react'
import Image from 'next/image'

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
      <Image
        className="detail-img"
        src={images[active]}
        alt={name}
        width={800}
        height={800}
        priority
        sizes="(max-width: 900px) 100vw, 50vw"
      />
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`gallery-thumb${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
            >
              <Image src={img} alt="" width={72} height={72} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
