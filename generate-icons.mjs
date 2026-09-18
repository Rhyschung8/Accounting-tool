// Minimal PNG generator — no external deps, pure Node.js
// Generates a solid-colour square PNG with a simple "♩" glyph approximation.
// Uses raw PNG encoding with zlib deflate.

import { createWriteStream } from 'fs'
import { deflateSync } from 'zlib'

function writePng(filePath, size) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii')
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    // CRC over type + data
    const crcBuf = Buffer.concat([typeBytes, data])
    const crc = crc32(crcBuf)
    const crcBytes = Buffer.alloc(4)
    crcBytes.writeUInt32BE(crc >>> 0, 0)
    return Buffer.concat([len, typeBytes, data, crcBytes])
  }

  // CRC32 table
  const crcTable = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })()
  function crc32(buf) {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // colour type RGB
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace

  // Background: #3b5bdb = 59, 91, 219
  const R = 59, G = 91, B = 219

  // Build raw image rows (filter byte 0 + RGB pixels)
  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)
  for (let y = 0; y < size; y++) {
    const base = y * rowSize
    raw[base] = 0 // filter = None
    for (let x = 0; x < size; x++) {
      const off = base + 1 + x * 3
      // Draw a simple white rectangle "piano key" shape in the centre
      const margin = Math.floor(size * 0.2)
      const keyW = Math.floor(size * 0.08)
      const keyH = Math.floor(size * 0.45)
      const keysX = [
        margin,
        margin + Math.floor(size * 0.13),
        margin + Math.floor(size * 0.26),
        margin + Math.floor(size * 0.39),
        margin + Math.floor(size * 0.52),
      ]
      const keyTop = Math.floor(size * 0.2)
      const noteY1 = Math.floor(size * 0.52)
      const noteY2 = Math.floor(size * 0.72)

      let isWhite = false
      for (const kx of keysX) {
        if (x >= kx && x < kx + keyW && y >= keyTop && y < keyTop + keyH) {
          isWhite = true
          break
        }
      }
      // Thin vertical stem right side
      const stemX = Math.floor(size * 0.62)
      const stemW = Math.max(2, Math.floor(size * 0.04))
      if (x >= stemX && x < stemX + stemW && y >= noteY1 && y < noteY2) {
        isWhite = true
      }
      // Note head (filled ellipse)
      const nhCX = Math.floor(size * 0.56), nhCY = Math.floor(size * 0.72)
      const nhRX = Math.floor(size * 0.09), nhRY = Math.floor(size * 0.065)
      const dx = (x - nhCX) / nhRX, dy = (y - nhCY) / nhRY
      if (dx * dx + dy * dy <= 1.0) isWhite = true

      raw[off]     = isWhite ? 255 : R
      raw[off + 1] = isWhite ? 255 : G
      raw[off + 2] = isWhite ? 255 : B
    }
  }

  const compressed = deflateSync(raw, { level: 9 })
  const idat = chunk('IDAT', compressed)
  const iend = chunk('IEND', Buffer.alloc(0))

  const png = Buffer.concat([sig, chunk('IHDR', ihdr), idat, iend])
  const ws = createWriteStream(filePath)
  ws.write(png)
  ws.end()
  console.log(`Written ${filePath} (${png.length} bytes, ${size}x${size})`)
}

writePng('public/icons/icon-192.png', 192)
writePng('public/icons/icon-512.png', 512)
