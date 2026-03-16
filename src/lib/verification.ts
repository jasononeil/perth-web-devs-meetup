async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function generateVerificationUrl(
  baseUrl: string,
  secret: string,
  params: { email: string; type: string; rsvp_id?: number; subscriber_id?: number }
): Promise<string> {
  const expires = String(Date.now() + 48 * 60 * 60 * 1000)
  const url = new URL('/verify-email', baseUrl)
  url.searchParams.set('email', params.email)
  url.searchParams.set('type', params.type)
  if (params.rsvp_id) url.searchParams.set('rsvp_id', String(params.rsvp_id))
  if (params.subscriber_id) url.searchParams.set('subscriber_id', String(params.subscriber_id))
  url.searchParams.set('expires', expires)

  // Sign everything except the signature itself
  const dataToSign = url.searchParams.toString()
  const signature = await hmacSign(dataToSign, secret)
  url.searchParams.set('signature', signature)

  return url.toString()
}

export async function validateVerificationUrl(
  url: URL,
  secret: string
): Promise<boolean> {
  const signature = url.searchParams.get('signature')
  const expires = url.searchParams.get('expires')

  if (!signature || !expires) return false
  if (Date.now() > Number(expires)) return false

  // Rebuild the signed data (without signature param)
  const params = new URLSearchParams(url.searchParams)
  params.delete('signature')
  const dataToSign = params.toString()

  const expectedSignature = await hmacSign(dataToSign, secret)
  return signature === expectedSignature
}
