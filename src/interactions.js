export const motionBehavior = reduced => reduced ? 'auto' : 'smooth'

export async function copyContact(clipboard) {
  try {
    if (!clipboard?.writeText) throw new Error('Clipboard unavailable')
    await clipboard.writeText('duyufei000@126.com')
    return '邮箱已复制'
  } catch {
    return '复制未成功，请点击邮箱发送邮件'
  }
}
