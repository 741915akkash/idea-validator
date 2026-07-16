export default async function execute({ input, context }) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          messaging_product: 'whatsapp',

          to: input.to,

          type: 'text',

          text: {
            body: input.message
          }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,

        warning: {
          code: 'WHATSAPP_SEND_FAILED',
          message: data?.error?.message ?? 'Unknown error.'
        }
      }
    }

    return {
      success: true,

      output: {
        messageId: data.messages?.[0]?.id ?? ''
      }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'WHATSAPP_SEND_FAILED',
        message: error.message
      }
    }
  }
}
