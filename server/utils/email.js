// Placeholder email sender. Replace with a real provider (SendGrid/Mailgun/Resend) later.
async function sendResetEmail(to, link) {
  console.log(`[email] Sending reset link to ${to}: ${link}`)
  return true
}
module.exports = { sendResetEmail }
