import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function execute({ input, context }) {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,

      to: input.to,

      cc: input.cc,

      bcc: input.bcc,

      subject: input.subject,

      ...(input.html ? { html: input.body } : { text: input.body })
    })

    return {
      success: true,

      output: {
        messageId: response.data?.id ?? ''
      }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'EMAIL_SEND_FAILED',
        message: error.message
      }
    }
  }
}
