// API Key 简单混淆存储 —— 仅防明文，不抗逆向。
// 浏览器内置 atob/btoa + 固定 XOR 异或，避免存原文。

const SALT = 'yecai-agent-2026'

function xor(input: string, key: string): string {
  let out = ''
  for (let i = 0; i < input.length; i++) {
    out += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return out
}

export function encryptKey(plain: string): string {
  if (!plain) return ''
  try {
    const xored = xor(plain, SALT)
    // base64 with unicode safety
    return btoa(unescape(encodeURIComponent(xored)))
  } catch {
    return ''
  }
}

export function decryptKey(cipher: string): string {
  if (!cipher) return ''
  try {
    const xored = decodeURIComponent(escape(atob(cipher)))
    return xor(xored, SALT)
  } catch {
    return ''
  }
}

export function maskKey(plain: string): string {
  if (!plain) return ''
  if (plain.length <= 8) return '••••' + plain.slice(-2)
  return plain.slice(0, 4) + '••••••••' + plain.slice(-4)
}
