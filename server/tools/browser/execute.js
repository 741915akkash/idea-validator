import { chromium } from 'playwright'

export default async function execute({ input, context }) {
  let browser

  try {
    browser = await chromium.launch({
      headless: true
    })

    const page = await browser.newPage()

    await page.goto(input.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    const title = await page.title()

    const html = await page.content()

    const text = await page.locator('body').innerText()

    return {
      success: true,

      output: {
        url: page.url(),
        title,
        html,
        text
      }
    }
  } catch (error) {
    return {
      success: false,

      warning: {
        code: 'BROWSER_FAILED',
        message: error.message
      }
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
