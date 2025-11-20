const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    table[n] = c >>> 0
  }
  return table
})()

const crc32 = (buf: Uint8Array) => {
  let c = 0 ^ -1
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xFF]
  return (c ^ -1) >>> 0
}

const writeUint16 = (arr: number[], v: number) => { arr.push(v & 0xFF, (v >>> 8) & 0xFF) }
const writeUint32 = (arr: number[], v: number) => { arr.push(v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF) }

export const makeZip = (files: { name: string, content: string }[]) => {
  const enc = new TextEncoder()
  const localParts: number[] = []
  const centralParts: number[] = []
  const offsets: number[] = []
  let offset = 0
  for (const f of files) {
    const nameBytes = enc.encode(f.name)
    const data = enc.encode(f.content)
    const crc = crc32(data)
    const mtime = 0
    offsets.push(offset)
    localParts.push(
      0x50,0x4B,0x03,0x04,
      20,0,0,0,
      0,0,
    )
    writeUint16(localParts, 0)
    writeUint16(localParts, 0)
    writeUint32(localParts, crc)
    writeUint32(localParts, data.length)
    writeUint32(localParts, data.length)
    writeUint16(localParts, nameBytes.length)
    writeUint16(localParts, 0)
    nameBytes.forEach(b => localParts.push(b))
    offset = localParts.length
    data.forEach(b => localParts.push(b))
    offset = localParts.length
  }
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const nameBytes = enc.encode(f.name)
    const data = enc.encode(f.content)
    const crc = crc32(data)
    centralParts.push(0x50,0x4B,0x01,0x02,20,0,0,0,0,0)
    writeUint16(centralParts, 0)
    writeUint16(centralParts, 0)
    writeUint32(centralParts, crc)
    writeUint32(centralParts, data.length)
    writeUint32(centralParts, data.length)
    writeUint16(centralParts, nameBytes.length)
    writeUint16(centralParts, 0)
    writeUint16(centralParts, 0)
    writeUint16(centralParts, 0)
    writeUint16(centralParts, 0)
    writeUint32(centralParts, 0)
    writeUint32(centralParts, offsets[i])
    nameBytes.forEach(b => centralParts.push(b))
  }
  const endParts: number[] = []
  endParts.push(0x50,0x4B,0x05,0x06,0,0)
  writeUint16(endParts, files.length)
  writeUint16(endParts, files.length)
  writeUint32(endParts, centralParts.length)
  writeUint32(endParts, localParts.length)
  writeUint16(endParts, 0)
  const bytes = new Uint8Array(localParts.length + centralParts.length + endParts.length)
  bytes.set(new Uint8Array(localParts), 0)
  bytes.set(new Uint8Array(centralParts), localParts.length)
  bytes.set(new Uint8Array(endParts), localParts.length + centralParts.length)
  return bytes
}

export const downloadZip = (filename: string, files: { name: string, content: string }[]) => {
  const zipBytes = makeZip(files)
  const blob = new Blob([zipBytes], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}