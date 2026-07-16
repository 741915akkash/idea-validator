export default async function execute({ input, context }) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          chat_id: input.chatId,
          text: input.message
        })
      }
    )

    const data = await response.json()

    if (!response.ok || !data.ok) {
      return {
        success: false,

        warning: {
          code: 'TELEGRAM_SEND_FAILED',
          message: data?.description ?? 'Unknown error.'
        }
      }
    }

    return {
      success: true,

      output: {
        messageId: data.result.message_id
      }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'TELEGRAM_SEND_FAILED',
        message: error.message
      }
    }
  }
}
