'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('order-form');
    if (!form) return;

    const BOOK_SERVICES = ['Pre-School Textbooks', 'Primary School Textbooks'];
    const GIFAS_SERVICE       = 'Gifas Herbal Mixture';
    const TIME_HERBAL_SERVICE = 'Time Herbal Mixture';
    const SPECIAL_SERVICES    = [GIFAS_SERVICE, TIME_HERBAL_SERVICE];
    const MAX_FILE_MB = 50;
    const WA_NUMBER = '233267621569';

    function getOrderDetails() {
        const selected = document.querySelector('input[name="order-service"]:checked');
        if (!selected) return null;
        
        const serviceName = selected.value;
        const bookMode    = BOOK_SERVICES.includes(serviceName);
        const specialMode = SPECIAL_SERVICES.includes(serviceName);
        let items = [];
        let totalQty = 0;
        let specialData = null;

        if (bookMode) {
            const qtyInputs = Array.from(document.querySelectorAll('.book-qty-input')).filter(inp => Number.parseInt(inp.value || '0', 10) > 0);
            qtyInputs.forEach(input => {
                const qty = Number.parseInt(input.value || '0', 10);
                const bk = input.getAttribute('data-book');
                const grade = input.getAttribute('data-grade');
                totalQty += qty;
                items.push({ name: bk, grade: grade || '', qty });
            });
        } else if (specialMode) {
            if (serviceName === GIFAS_SERVICE) {
                const productType = form.querySelector('input[name="gifas-product"]:checked')?.value || '';
                const qty = Number.parseInt(getEl('gifas-quantity')?.value || '0', 10);
                const pkgType = getEl('gifas-pkg-type')?.value || 'Boxes';
                totalQty = qty;
                specialData = { productType, qty, pkgType };
                items.push({ name: serviceName, qty });
            } else if (serviceName === TIME_HERBAL_SERVICE) {
                const qty = Number.parseInt(getEl('timeherbal-quantity')?.value || '0', 10);
                const pkgType = getEl('timeherbal-pkg-type')?.value || 'Boxes';
                totalQty = qty;
                specialData = { qty, pkgType };
                items.push({ name: serviceName, qty });
            }
        } else {
            const qty = Number.parseInt(document.getElementById('order-quantity').value.trim() || '0', 10);
            totalQty = qty;
            items.push({ name: serviceName, qty });
        }

        return { serviceName, bookMode, specialMode, specialData, items, totalQty };
    }

    // Grade / class options per book subject
    const BOOK_GRADES = {
        // Pre-School
        'Combined Colouring for Nursery'           : { label: 'Class', grades: ['Nursery 1', 'Nursery 2'] },
        'Handwriting for Nursery 1 and 2'          : { label: 'Class', grades: ['Nursery 1', 'Nursery 2'] },
        'Numeracy for Nursery 1 and 2'             : { label: 'Class', grades: ['Nursery 1', 'Nursery 2'] },
        'Phonics for KG 1 and 2'                   : { label: 'Class', grades: ['KG 1', 'KG 2'] },
        'Writing for KG 1 and 2'                   : { label: 'Class', grades: ['KG 1', 'KG 2'] },
        'Numeracy for KG 1 and 2'                  : { label: 'Class', grades: ['KG 1', 'KG 2'] },
        'Language and Literacy KG 1 and 2'         : { label: 'Class', grades: ['KG 1', 'KG 2'] },
        'Our World and Our People KG 1 and 2'      : { label: 'Class', grades: ['KG 1', 'KG 2'] },
        'Creative Arts KG 1 and 2'                 : { label: 'Class', grades: ['KG 1', 'KG 2'] },
        'Alpha Primer Reader for KG 2'             : { label: 'Class', grades: ['KG 2'] },
        'My First 1000 Words Phases 1, 2 and 3'    : { label: 'Phase', grades: ['Phase 1', 'Phase 2', 'Phase 3'] },
        // Primary
        'Creative Arts Basic 1-6'                  : { label: 'Basic', grades: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'] },
        'Science Basic 1-6'                        : { label: 'Basic', grades: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'] },
        'Phonics for Basic 1-4'                    : { label: 'Basic', grades: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4'] },
        'Handwriting for Basic 1-2'                : { label: 'Basic', grades: ['Basic 1', 'Basic 2'] },
    };
    const getEl = (id) => document.getElementById(id);

    const catPrintBtn = getEl('cat-printing-btn');
    const catBooksBtn = getEl('cat-books-btn');
    const catPrint = getEl('cat-printing');
    const catBooks = getEl('cat-books');
    const bodyPrint = getEl('body-printing');
    const bodyBooks = getEl('body-books');

    function isBookOrder() {
        const selected = form.querySelector('input[name="order-service"]:checked');
        return !!selected && BOOK_SERVICES.includes(selected.value);
    }

    function isSpecialOrder() {
        const selected = form.querySelector('input[name="order-service"]:checked');
        return !!selected && SPECIAL_SERVICES.includes(selected.value);
    }

    function toggleOrderCategory(type) {
        if (!catPrint || !catBooks || !bodyPrint || !bodyBooks) return;

        const openingPrint = type === 'printing';
        const activeCat = openingPrint ? catPrint : catBooks;
        const inactiveCat = openingPrint ? catBooks : catPrint;
        const activeBody = openingPrint ? bodyPrint : bodyBooks;
        const inactiveBody = openingPrint ? bodyBooks : bodyPrint;
        const activeBtn = openingPrint ? catPrintBtn : catBooksBtn;
        const inactiveBtn = openingPrint ? catBooksBtn : catPrintBtn;

        const isOpening = !activeCat.classList.contains('active');

        inactiveCat.classList.remove('active');
        inactiveBody.classList.remove('open');
        inactiveBtn?.setAttribute('aria-expanded', 'false');
        inactiveBody.querySelectorAll('input[type="radio"]').forEach((radio) => {
            radio.checked = false;
        });

        if (getEl('err-order-service')) getEl('err-order-service').textContent = '';
        if (getEl('err-order-service-print')) getEl('err-order-service-print').textContent = '';
        if (getEl('err-order-service-books')) getEl('err-order-service-books').textContent = '';

        if (isOpening) {
            activeCat.classList.add('active');
            activeBody.classList.add('open');
            activeBtn?.setAttribute('aria-expanded', 'true');
        } else {
            activeCat.classList.remove('active');
            activeBody.classList.remove('open');
            activeBtn?.setAttribute('aria-expanded', 'false');
            activeBody.querySelectorAll('input[type="radio"]').forEach((radio) => {
                radio.checked = false;
            });
        }
    }
    catPrintBtn?.addEventListener('click', () => toggleOrderCategory('printing'));
    catBooksBtn?.addEventListener('click', () => toggleOrderCategory('books'));

    function showStep(id) {
        document.querySelectorAll('.order-step').forEach((step) => step.classList.add('hidden'));
        const el = getEl(id);
        if (!el) return;
        el.classList.remove('hidden');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateProgress(activeStep) {
        const bookMode = isBookOrder();
        getEl('progress-step-1b').style.display = bookMode ? '' : 'none';
        getEl('progress-line-1b').style.display = bookMode ? '' : 'none';

        const progress2 = getEl('progress-step-2')?.querySelector('span');
        const progress3 = getEl('progress-step-3')?.querySelector('span');
        if (progress2) progress2.textContent = bookMode ? '3' : '2';
        if (progress3) progress3.textContent = bookMode ? '4' : '3';

        const step2Badge = getEl('step-2-badge');
        if (step2Badge) step2Badge.textContent = bookMode ? 'Step 3 of 4' : 'Step 2 of 3';
        getEl('step-3-badge').textContent = bookMode ? 'Step 4 of 4' : 'Step 3 of 3';

        const steps = ['1', '1b', '2', '3'];
        steps.forEach((step) => {
            const stepEl = getEl(`progress-step-${step}`) || document.querySelector(`[data-step="${step}"]`);
            if (stepEl) stepEl.classList.toggle('active', step === String(activeStep));
            const line = getEl(`progress-line-${step}`);
            if (line) {
                line.classList.toggle('active', ['1b', '2', '3'].includes(step) && steps.indexOf(step) <= steps.indexOf(String(activeStep)));
            }
        });
    }

    function buildBookQtyRows() {
        const checked = Array.from(document.querySelectorAll('input[name="book-subject"]:checked'));
        const container = getEl('book-qty-rows');
        if (!container) return;
        container.innerHTML = '';

        checked.forEach((checkbox) => {
            const bookName = checkbox.value;
            const gradeInfo = BOOK_GRADES[bookName];

            const wrapper = document.createElement('div');
            wrapper.className = 'book-qty-item';
            wrapper.setAttribute('data-book', bookName);

            let html = `
                <div class="book-qty-row book-qty-group-header" style="background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 18px; border-radius: 8px 8px 0 0;">
                    <div class="book-qty-row-label">
                        <i class="fas fa-book-open" style="color: var(--gold);"></i>
                        <span style="font-weight: 700; color: var(--white);">${bookName}</span>
                    </div>
                </div>
            `;

            if (gradeInfo && gradeInfo.grades && gradeInfo.grades.length > 0) {
                html += `<div class="book-grade-qty-list" style="padding: 10px 0;">`;
                gradeInfo.grades.forEach(grade => {
                    html += `
                        <div class="book-qty-row sub-book-qty-row" style="padding: 8px 18px 8px 36px; border: none; background: transparent;">
                            <div class="book-qty-row-label sub-grade-label">
                                <i class="fas fa-level-up-alt fa-rotate-90" style="opacity:0.4; font-size: 0.8rem; margin-right: 8px;"></i>
                                <span style="font-size: 0.85rem; color: var(--blue-light); font-weight: 600;">${gradeInfo.label}: ${grade}</span>
                            </div>
                            <div class="book-qty-row-input">
                                <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity"><i class="fas fa-minus"></i></button>
                                <input type="number" class="book-qty-input per-grade-input" name="book-qty" data-book="${bookName}" data-grade="${grade}" value="0" min="0" aria-label="Quantity for ${grade}" />
                                <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
            } else {
                html += `
                    <div class="book-qty-row sub-book-qty-row" style="padding: 12px 18px;">
                        <div class="book-qty-row-label sub-grade-label">
                            <span>Quantity</span>
                        </div>
                        <div class="book-qty-row-input">
                            <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity"><i class="fas fa-minus"></i></button>
                            <input type="number" class="book-qty-input" name="book-qty" data-book="${bookName}" value="0" min="0" />
                            <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                `;
            }

            wrapper.innerHTML = html;
            container.appendChild(wrapper);
        });
    }

    getEl('book-qty-rows')?.addEventListener('click', (event) => {
        const minus = event.target.closest('.qty-minus');
        const plus = event.target.closest('.qty-plus');
        if (!minus && !plus) return;

        const row = event.target.closest('.book-qty-row');
        const input = row?.querySelector('.book-qty-input');
        if (!input) return;
        const current = Number.parseInt(input.value || '0', 10);
        if (minus) input.value = String(Math.max(0, current - 1));
        if (plus) input.value = String(Math.max(0, current + 1));
        
        if (Number(input.value) > 0) {
            const wrapper = input.closest('.book-qty-item');
            if (wrapper) wrapper.querySelectorAll('.qty-input-error').forEach(el => el.classList.remove('qty-input-error'));
        }
    });

    function applyStep2Mode() {
        const bookMode    = isBookOrder();
        const specialMode = isSpecialOrder();
        const selected    = form.querySelector('input[name="order-service"]:checked');
        const serviceName = selected?.value || '';

        // Print-only fields: hidden in book & special modes
        ['field-quantity', 'field-size', 'field-finish', 'field-color', 'field-file'].forEach((id) => {
            const el = getEl(id);
            if (el) el.style.display = (bookMode || specialMode) ? 'none' : '';
        });

        // Book panels
        getEl('book-order-notice').style.display = bookMode ? 'flex' : 'none';
        getEl('book-qty-panel').style.display    = bookMode ? ''     : 'none';

        // Special panels
        const gifasPanel      = getEl('gifas-specs-panel');
        const timeHerbalPanel = getEl('timeherbal-specs-panel');
        if (gifasPanel)      gifasPanel.style.display      = (specialMode && serviceName === GIFAS_SERVICE)       ? '' : 'none';
        if (timeHerbalPanel) timeHerbalPanel.style.display = (specialMode && serviceName === TIME_HERBAL_SERVICE) ? '' : 'none';

        // Deadline & specs labels
        getEl('label-deadline').textContent = (bookMode || specialMode) ? 'Preferred Delivery Date' : 'Preferred Deadline';
        getEl('label-specs').textContent    = bookMode ? 'Order Notes' : 'Additional Notes';
        getEl('order-specs').placeholder    = bookMode
            ? 'Delivery address, school name, or any other instructions...'
            : specialMode
                ? 'Any special delivery instructions or additional notes...'
                : 'e.g. Double-sided, spiral binding, custom dimensions, special requirements...';

        if (bookMode) {
            buildBookQtyRows();
            getEl('order-size').value  = '';
            getEl('order-finish').value = '';
            getEl('order-color').value  = '';
            getEl('err-order-color').textContent = '';
        }
    }

    function validateContactStep() {
        const name = getEl('order-name').value.trim();
        const email = getEl('order-email').value.trim();
        const phone = getEl('order-phone').value.trim();
        const address = getEl('order-address')?.value.trim() || '';
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const phoneOk = phone.replace(/\D/g, '').length >= 7;
        const addressOk = address.length >= 3;

        getEl('err-order-name').textContent = name.length >= 2 ? '' : 'Please enter your full name.';
        getEl('err-order-email').textContent = emailOk ? '' : 'Please enter a valid email address.';
        getEl('err-order-phone').textContent = phoneOk ? '' : 'Please enter a valid phone number.';
        if (getEl('err-order-address')) getEl('err-order-address').textContent = addressOk ? '' : 'Please enter a delivery address.';
        
        return name.length >= 2 && emailOk && phoneOk && addressOk;
    }

    function getSelectedService() {
        return form.querySelector('input[name="order-service"]:checked');
    }

    getEl('order-next-printing')?.addEventListener('click', () => {
        const selected = getSelectedService();
        const error = getEl('err-order-service-print');
        if (!selected || isBookOrder()) {
            error.textContent = 'Please select a printing service above.';
            return;
        }
        error.textContent = '';
        getEl('err-order-service').textContent = '';
        applyStep2Mode();
        updateProgress('2');
        showStep('order-step-2');
    });

    getEl('order-next-books')?.addEventListener('click', () => {
        const selected = getSelectedService();
        const error = getEl('err-order-service-books');
        if (!selected || !isBookOrder()) {
            error.textContent = 'Please select a book type above.';
            return;
        }
        error.textContent = '';
        getEl('err-order-service').textContent = '';

        const preschool = selected.value === 'Pre-School Textbooks';
        getEl('preschool-subjects').style.display = preschool ? '' : 'none';
        getEl('primary-subjects').style.display = preschool ? 'none' : '';
        getEl('step-1b-badge').textContent = 'Step 2 of 4';
        getEl('step-1b-title').textContent = `${preschool ? 'Pre-School' : 'Primary School'} Subjects`;
        getEl('step-1b-subtitle').textContent = 'Choose the subject(s) you want to order';
        document.querySelectorAll('input[name="book-subject"]').forEach((checkbox) => {
            checkbox.checked = false;
        });

        updateProgress('1b');
        showStep('order-step-1b');
    });

    getEl('order-back-1b')?.addEventListener('click', () => {
        updateProgress('1');
        showStep('order-step-1');
    });

    getEl('order-next-1b')?.addEventListener('click', () => {
        const checked = document.querySelectorAll('input[name="book-subject"]:checked');
        if (!checked.length) {
            getEl('err-book-subject').textContent = 'Please select at least one book.';
            return;
        }
        getEl('err-book-subject').textContent = '';
        applyStep2Mode();
        updateProgress('2');
        showStep('order-step-2');
    });

    getEl('order-back-2')?.addEventListener('click', () => {
        if (isBookOrder()) {
            updateProgress('1b');
            showStep('order-step-1b');
            return;
        }
        updateProgress('1');
        showStep('order-step-1');
    });

    function buildSummary() {
        const details = getOrderDetails();
        if (!details) return;

        let html = `<div class="summary-row"><span>Service</span><strong>${details.serviceName}</strong></div>`;

        if (details.bookMode) {
            html += '<div class="summary-row summary-row-books"><span>Books &amp; Quantities</span><div class="summary-book-list" style="margin-top:10px;">';
            details.items.forEach(item => {
                const gradeBadge = item.grade ? `<span class="summary-grade-badge">${item.grade}</span>` : '';
                html += `
                    <div class="summary-book-item" style="display:flex; justify-content:space-between; margin-bottom:8px; align-items:center; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:5px;">
                        <span style="font-size:13px; font-weight:600;">${item.name} ${gradeBadge}</span>
                        <strong style="font-size:14px;">${item.qty} units</strong>
                    </div>`;
            });
            html += '</div></div>';

            html += `
            <div class="summary-total-books" style="margin-top: 15px; background: rgba(247, 195, 37, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(247,195,37,0.3);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(247,195,37,0.2); padding-bottom: 10px; margin-bottom: 10px;">
                    <span style="font-weight: 700; color: #f7c325; letter-spacing: 0.04em;">TOTAL QUANTITY</span>
                    <strong style="font-weight: 800; font-size: 1.15rem; color: #f7c325;">${details.totalQty} items</strong>
                </div>
                <div style="font-size: 11px; color: #888; line-height: 1.4;">
                    <i class="fas fa-info-circle" style="color:#f7c325;"></i> <strong>Note:</strong> Pricing is not currently available. A finalized quote will be provided by our team after order review.
                </div>
            </div>`;

        } else if (details.specialMode) {
            if (details.serviceName === GIFAS_SERVICE && details.specialData) {
                const prodLabel = details.specialData.productType ? `Gifas ${details.specialData.productType}` : 'Not selected';
                const pkgType = details.specialData.pkgType || 'Boxes';
                html += `<div class="summary-row"><span>Product Type</span><strong>${prodLabel}</strong></div>`;
                html += `<div class="summary-row"><span>Quantity</span><strong>${details.specialData.qty} ${pkgType}</strong></div>`;
            } else if (details.serviceName === TIME_HERBAL_SERVICE && details.specialData) {
                const pkgType = details.specialData.pkgType || 'Boxes';
                html += `<div class="summary-row"><span>Quantity</span><strong>${details.specialData.qty} ${pkgType}</strong></div>`;
            }
            html += `
            <div class="summary-total-books" style="margin-top: 15px; background: rgba(247, 195, 37, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(247,195,37,0.3);">
                <div style="font-size: 11px; color: #888; line-height: 1.4;">
                    <i class="fas fa-info-circle" style="color:#f7c325;"></i> <strong>Note:</strong> Pricing is not currently available. A finalized quote will be provided by our team after order review.
                </div>
            </div>`;

        } else {
            const color  = getEl('order-color').value.trim();
            const format = getEl('order-size').value.trim();
            const finish = getEl('order-finish').value.trim();

            if (details.items[0]) {
                html += `<div class="summary-row"><span>Quantity</span><strong>${details.items[0].qty}</strong></div>`;
            }
            if (format) html += `<div class="summary-row"><span>Format / Size</span><strong>${format}</strong></div>`;
            if (finish) html += `<div class="summary-row"><span>Print Finish</span><strong>${finish}</strong></div>`;
            if (color)  html += `<div class="summary-row"><span>Color Mode</span><strong>${color}</strong></div>`;

            html += `
            <div class="summary-total-books" style="margin-top: 15px; background: rgba(247, 195, 37, 0.1); padding: 15px; border-radius: 8px;">
                <div style="font-size: 11px; color: #666; line-height: 1.4;">
                    <i class="fas fa-info-circle"></i> <strong>Note:</strong> Pricing is not currently available. A finalized quote will be provided by our team after order review.
                </div>
            </div>`;
        }

        const deadline = getEl('order-deadline').value;
        if (deadline) {
            html += `<div class="summary-row" style="margin-top:15px; border-top:1px solid rgba(0,0,0,0.1); padding-top:15px;"><span>${(details.bookMode || details.specialMode) ? 'Delivery Date' : 'Deadline'}</span><strong>${deadline}</strong></div>`;
        }
        
        getEl('summary-items').innerHTML = html;
    }

    getEl('order-next-2')?.addEventListener('click', () => {
        const bookMode    = isBookOrder();
        const specialMode = isSpecialOrder();
        const selected    = form.querySelector('input[name="order-service"]:checked');
        const serviceName = selected?.value || '';
        const errQty      = getEl('err-order-quantity');
        const errBooks    = getEl('err-book-quantities');

        if (bookMode) {
            const wrappers = document.querySelectorAll('.book-qty-item');
            let allValid = true;
            wrappers.forEach((wrapper) => {
                const inputs = Array.from(wrapper.querySelectorAll('.book-qty-input'));
                let total = 0;
                inputs.forEach(inp => total += Number.parseInt(inp.value || '0', 10));
                if (total < 1) {
                    allValid = false;
                    inputs.forEach(inp => inp.classList.add('qty-input-error'));
                } else {
                    inputs.forEach(inp => inp.classList.remove('qty-input-error'));
                }
            });
            if (!allValid) {
                errBooks.textContent = 'Please enter a valid quantity (at least 1) for each selected book.';
                return;
            }
            errBooks.textContent = '';

        } else if (specialMode) {
            if (serviceName === GIFAS_SERVICE) {
                const gifasProduct = form.querySelector('input[name="gifas-product"]:checked');
                const gifasQty    = Number.parseInt(getEl('gifas-quantity')?.value || '0', 10);
                const errProduct  = getEl('err-gifas-product');
                const errGifasQty = getEl('err-gifas-quantity');
                if (!gifasProduct) {
                    if (errProduct) errProduct.textContent = 'Please select a product type — Herbal Mixture or Capsules.';
                    return;
                }
                if (errProduct) errProduct.textContent = '';
                if (gifasQty < 1) {
                    if (errGifasQty) errGifasQty.textContent = 'Please enter the quantity required.';
                    return;
                }
                if (errGifasQty) errGifasQty.textContent = '';

            } else if (serviceName === TIME_HERBAL_SERVICE) {
                const timeHerbalQty = Number.parseInt(getEl('timeherbal-quantity')?.value || '0', 10);
                const errTHQty      = getEl('err-timeherbal-quantity');
                if (timeHerbalQty < 1) {
                    if (errTHQty) errTHQty.textContent = 'Please enter the quantity required.';
                    return;
                }
                if (errTHQty) errTHQty.textContent = '';
            }

        } else {
            const qty = Number.parseInt(getEl('order-quantity').value.trim() || '0', 10);
            if (qty < 1) {
                errQty.textContent = 'Please enter a valid quantity.';
                return;
            }
            errQty.textContent = '';

            const color = getEl('order-color').value.trim();
            if (!color) {
                getEl('err-order-color').textContent = 'Please specify a color mode.';
                return;
            }
            getEl('err-order-color').textContent = '';
        }

        updateProgress('3');
        buildSummary();
        showStep('order-step-3');
    });

    getEl('order-back-3')?.addEventListener('click', () => {
        updateProgress('2');
        showStep('order-step-2');
    });

    const fileInput = getEl('order-file');
    const dropZone = getEl('file-drop-zone');
    const dropContent = getEl('file-drop-content');
    const fileSelected = getEl('file-selected');
    const fileNameDisplay = getEl('file-name-display');
    const browseBtn = getEl('file-browse-btn');
    const removeBtn = getEl('file-remove-btn');

    function showFile(name) {
        fileNameDisplay.textContent = name;
        dropContent.style.display = 'none';
        fileSelected.style.display = 'flex';
    }

    function clearFile() {
        if (fileInput) fileInput.value = '';
        if (dropContent) dropContent.style.display = 'flex';
        if (fileSelected) fileSelected.style.display = 'none';
        if (fileNameDisplay) fileNameDisplay.textContent = '';
    }

    function handleFile(file) {
        if (!file) return;
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            alert(`File is too large. Maximum size is ${MAX_FILE_MB} MB.`);
            return;
        }
        if (!/\.(pdf|ai|psd|png|jpe?g|eps)$/i.test(file.name)) {
            alert('Unsupported file type. Use PDF, AI, PSD, PNG, JPG, or EPS.');
            return;
        }
        showFile(file.name);
    }

    browseBtn?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', () => {
        if (fileInput.files?.[0]) handleFile(fileInput.files[0]);
    });
    removeBtn?.addEventListener('click', clearFile);

    let dragCounter = 0;
    dropZone?.addEventListener('dragenter', (event) => {
        event.preventDefault();
        dragCounter += 1;
        dropZone.classList.add('dragging');
    });
    dropZone?.addEventListener('dragleave', () => {
        dragCounter -= 1;
        if (dragCounter <= 0) {
            dragCounter = 0;
            dropZone.classList.remove('dragging');
        }
    });
    dropZone?.addEventListener('dragover', (event) => event.preventDefault());
    dropZone?.addEventListener('drop', (event) => {
        event.preventDefault();
        dragCounter = 0;
        dropZone.classList.remove('dragging');
        handleFile(event.dataTransfer?.files?.[0]);
    });

    /**
     * Generates a unique, date-stamped order ID.
     * Format: AOP-DDMMYYYY-NN
     * Example: AOP-22042026-01
     *
     * A daily counter is stored in localStorage so every order on
     * the same calendar day gets the next sequential number, and
     * the counter resets automatically on a new day.
     */
    function generateReference() {
        const now = new Date();
        const dd   = String(now.getDate()).padStart(2, '0');
        const mm   = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const todayKey = `${dd}${mm}${yyyy}`;   // e.g. "22042026"

        const storedKey   = localStorage.getItem('aop_order_date');
        let   dailyCount  = parseInt(localStorage.getItem('aop_order_count') || '0', 10);

        // Reset counter when the calendar date changes
        if (storedKey !== todayKey) {
            dailyCount = 0;
            localStorage.setItem('aop_order_date', todayKey);
        }

        dailyCount += 1;
        localStorage.setItem('aop_order_count', String(dailyCount));

        const seq = String(dailyCount).padStart(2, '0');   // 01, 02 … 99, 100 …
        return `AOP-${todayKey}-${seq}`;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!validateContactStep()) return;

        const submitBtn = getEl('order-submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting';
        submitBtn.disabled = true;

        const details = getOrderDetails();
        if (!details) { console.error('Submit reached without a service selection.'); return; }
        const reference = generateReference();
        const rawDeadline = getEl('order-deadline').value;
        const orderSpecs = getEl('order-specs').value.trim();
        const orderNotes = getEl('order-notes').value.trim();
        const address = getEl('order-address')?.value.trim() || 'N/A';
        const name = getEl('order-name').value.trim();
        const phone = getEl('order-phone').value.trim();
        const email = getEl('order-email').value.trim();
        const company = getEl('order-company').value.trim();
        const fileName = fileNameDisplay?.textContent?.trim();

        let deadlineText = '';
        if (rawDeadline) {
            const [year, month, day] = rawDeadline.split('-').map(Number);
            deadlineText = new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        let formattedPhone = phone.replace(/[^\d+]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+233' + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('+')) {
            // If they didn't put a plus and didn't put a 0, assume it's a local number missing the prefix
            if (formattedPhone.length <= 10) {
                formattedPhone = '+233' + formattedPhone;
            } else {
                formattedPhone = '+' + formattedPhone;
            }
        }
        let cleanLink = formattedPhone.replace('+', '');

        const invoiceDate = new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        let waMsgRaw = '';

        // ── HEADER ───────────────────────────────────────────────
        waMsgRaw += `✨ *NEW ORDER RECEIVED!* ✨\n`;
        waMsgRaw += `*ALPHA & OMEGA PUBLICATIONS*\n`;
        waMsgRaw += `_Print · Publish · Deliver_\n\n`;
        waMsgRaw += `📝 *ORDER REF:* ${reference}\n`;
        waMsgRaw += `📅 *DATE:* ${invoiceDate}\n\n`;

        // ── CUSTOMER INFORMATION ─────────────────────────────────
        waMsgRaw += `👤 *CUSTOMER DETAILS*\n`;
        waMsgRaw += `▪️ *Name:* ${name}\n`;
        waMsgRaw += `▪️ *Phone:* ${formattedPhone}\n`;
        waMsgRaw += `▪️ *Address:* ${address}\n`;
        if (company) waMsgRaw += `▪️ *Company:* ${company}\n`;
        if (email)   waMsgRaw += `▪️ *Email:* ${email}\n`;
        waMsgRaw += `\n`;

        // ── ORDER ITEMS ──────────────────────────────────────────
        waMsgRaw += `📦 *ORDER SUMMARY*\n`;
        if (details.bookMode) {
            waMsgRaw += `*Service:* Book Sales\n\n`;

            details.items.forEach(item => {
                const unit = item.qty === 1 ? 'copy' : 'copies';
                let cleanName = item.name;
                // Strip the general range from the book name so it reads naturally when combined with grade
                const replacePattern = /\s*(for\s+)?(Basic\s*\d+-\d+|Nursery\s*\d+\s*and\s*\d+|KG\s*\d+\s*and\s*\d+|Phases\s*\d+(,\s*\d+)*\s*and\s*\d+|Nursery|KG\s*\d+)\s*$/i;
                cleanName = cleanName.replace(replacePattern, '').trim();
                const displayName = item.grade ? `${cleanName} ${item.grade}` : item.name;
                waMsgRaw += `📚 *${displayName}* - ${item.qty} ${unit}\n`;
            });
            waMsgRaw += `\n`;

            const totalUnit = details.totalQty === 1 ? 'copy' : 'copies';
            waMsgRaw += `👉 *Total Books:* ${details.totalQty} ${totalUnit}\n\n`;

        } else if (details.specialMode) {
            if (details.serviceName === GIFAS_SERVICE) {
                const gifasProduct = details.specialData?.productType
                    ? `Gifas ${details.specialData.productType}`
                    : 'Not specified';
                const qty  = details.specialData?.qty || 0;
                let unit = details.specialData?.pkgType || 'Boxes';
                if (qty === 1 && unit.endsWith('s')) unit = unit.slice(0, -1);
                
                waMsgRaw += `*Service:* Gifas Herbal Mixture Packaging\n`;
                waMsgRaw += `▪️ *Product Type:* ${gifasProduct}\n`;
                waMsgRaw += `▪️ *Quantity:* ${qty} ${unit}\n\n`;

            } else if (details.serviceName === TIME_HERBAL_SERVICE) {
                const qty  = details.specialData?.qty || 0;
                let unit = details.specialData?.pkgType || 'Boxes';
                if (qty === 1 && unit.endsWith('s')) unit = unit.slice(0, -1);
                
                waMsgRaw += `*Service:* Time Herbal Mixture Packaging\n`;
                waMsgRaw += `▪️ *Quantity:* ${qty} ${unit}\n\n`;
            }

        } else {
            const sizeVal   = getEl('order-size').value.trim()   || 'Not specified';
            const finishVal = getEl('order-finish').value.trim() || 'Not specified';
            const colorVal  = getEl('order-color').value.trim()  || 'Not specified';
            const qtyUnit   = details.totalQty === 1 ? 'copy' : 'copies';

            waMsgRaw += `*Service:* ${details.items[0].name}\n`;
            waMsgRaw += `▪️ *Quantity:* ${details.totalQty} ${qtyUnit}\n`;
            waMsgRaw += `▪️ *Size / Format:* ${sizeVal}\n`;
            waMsgRaw += `▪️ *Print Finish:* ${finishVal}\n`;
            waMsgRaw += `▪️ *Color Mode:* ${colorVal}\n\n`;
        }

        // ── ADDITIONAL DETAILS ───────────────────────────────────
        const hasExtras = deadlineText || orderSpecs || orderNotes;
        if (hasExtras) {
            waMsgRaw += `📋 *EXTRA DETAILS*\n`;
            if (deadlineText) waMsgRaw += `▪️ *Delivery By:* ${deadlineText}\n`;
            if (orderSpecs)   waMsgRaw += `▪️ *Specifications:* ${orderSpecs}\n`;
            if (orderNotes)   waMsgRaw += `▪️ *Notes:* ${orderNotes}\n`;
            waMsgRaw += `\n`;
        }

        // ── FOOTER ───────────────────────────────────────────────
        waMsgRaw += `💬 *Next Steps:* Our team will review these details and reply with a price quote shortly! Thank you for choosing Alpha & Omega Publications. 🤝`;

        let waMsg = encodeURIComponent(waMsgRaw);

        setTimeout(() => {
            window.open(`https://wa.me/${WA_NUMBER}?text=${waMsg}`, '_blank');
            const refEl = getEl('order-ref-number');
            if (refEl) refEl.textContent = reference;

            const modal = getEl('order-modal');
            modal?.classList.add('open');
            document.body.style.overflow = 'hidden';

            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order';
            submitBtn.disabled = false;
        }, 800);
    });

    function closeOrderModal() {
        const modal = getEl('order-modal');
        if (!modal || !modal.classList.contains('open')) return;
        modal.classList.remove('open');
        document.body.style.overflow = '';
        form.reset();
        clearFile();
        // Reset special order error messages
        ['err-gifas-product', 'err-gifas-quantity', 'err-timeherbal-quantity'].forEach(id => {
            const el = getEl(id); if (el) el.textContent = '';
        });
        // Hide special panels
        const gp = getEl('gifas-specs-panel'); if (gp) gp.style.display = 'none';
        const tp = getEl('timeherbal-specs-panel'); if (tp) tp.style.display = 'none';
        // Reset category accordions to their collapsed initial state
        [catPrint, catBooks].forEach(cat => cat?.classList.remove('active'));
        [bodyPrint, bodyBooks].forEach(body => body?.classList.remove('open'));
        [catPrintBtn, catBooksBtn].forEach(btn => btn?.setAttribute('aria-expanded', 'false'));
        showStep('order-step-1');
        updateProgress('1');
    }

    window.globalCloseOrderModal = closeOrderModal;
    getEl('order-modal-close')?.addEventListener('click', closeOrderModal);
    getEl('order-modal-backdrop')?.addEventListener('click', closeOrderModal);

    const deadlineInput = getEl('order-deadline');
    if (deadlineInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        deadlineInput.min = tomorrow.toISOString().split('T')[0];
    }

    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    if (serviceParam) {
        const radio = form.querySelector(`input[name="order-service"][value="${serviceParam}"]`);
        if (radio) {
            radio.checked = true;
            if (isBookOrder()) {
                toggleOrderCategory('books');
                getEl('order-next-books')?.click();
            } else {
                // Covers standard printing AND special orders (Gifas Herbal, Time Herbal)
                toggleOrderCategory('printing');
                getEl('order-next-printing')?.click();
            }
        }
    }
});

