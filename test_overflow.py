from playwright.sync_api import sync_playwright

def check_page(p, url):
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 375, "height": 812})
    page.goto(url)
    page.wait_for_timeout(2000)
    width = page.evaluate("document.documentElement.scrollWidth")
    client_width = page.evaluate("document.documentElement.clientWidth")
    print(f"[{url}] scrollWidth: {width}, clientWidth: {client_width}")
    if width > client_width:
        print(f"!!! OVERFLOW DETECTED ON {url} !!!")
        offenders = page.evaluate('''
            () => {
                const rootWidth = document.documentElement.clientWidth;
                return Array.from(document.querySelectorAll('*')).filter(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.right > rootWidth || rect.width > rootWidth;
                }).map(el => ({tag: el.tagName, class: el.className, id: el.id, right: el.getBoundingClientRect().right, width: el.getBoundingClientRect().width}))
            }
        ''')
        print(offenders)
    browser.close()

with sync_playwright() as p:
    check_page(p, 'http://localhost:8000/index.html')
    check_page(p, 'http://localhost:8000/about.html')
    check_page(p, 'http://localhost:8000/services.html')
    check_page(p, 'http://localhost:8000/portfolio.html')
    check_page(p, 'http://localhost:8000/contact.html')
