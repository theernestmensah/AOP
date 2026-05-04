from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 375, "height": 812})
    # Visit index first to set session storage
    page.goto("http://localhost:3001/index.html")
    page.wait_for_timeout(1000)
    # Now visit contact
    page.goto("http://localhost:3001/contact.html")

    # Scroll down to trigger AOS animations
    page.evaluate("window.scrollTo(0, document.body.scrollHeight/3)")
    page.wait_for_timeout(500)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight*2/3)")
    page.wait_for_timeout(500)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(500)

    page.screenshot(path="contact_mobile_real.png", full_page=True)
    browser.close()
    print("Screenshot saved to contact_mobile_real.png")
