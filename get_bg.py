from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:8000/contact.html')
        page.wait_for_timeout(1000)
        bg = page.evaluate("window.getComputedStyle(document.querySelector('.contact.section')).backgroundColor")
        print(f"Contact section bg: {bg}")
        body_bg = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
        print(f"Body bg: {body_bg}")
        browser.close()

run()
