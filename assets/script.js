// ========== SINGLE DOCUMENT READY EVENT - ALL CODE INSIDE ==========
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== GLOBAL VARIABLES ==========
    let cart = [];
    let productStock = {};
    let currentLanguage = 'en';
    let recentOrders = JSON.parse(localStorage.getItem('recent-orders')) || [];
    
    // ========== CURRENCY CONVERSIONS ==========
    const currencyRates = {
        en: { symbol: '$', rate: 1.00, code: 'USD' },
        pt: { symbol: '€', rate: 0.92, code: 'EUR' },
        es: { symbol: '€', rate: 0.92, code: 'EUR' },
        fr: { symbol: '€', rate: 0.92, code: 'EUR' },
        bn: { symbol: '৳', rate: 110.00, code: 'BDT' },
        ar: { symbol: 'ر.س', rate: 3.75, code: 'SAR' }
    };

    // ========== TRANSLATIONS OBJECT (keep your existing full translations) ==========
    // ... YOUR EXISTING translations OBJECT GOES HERE ...
    // (I'm not including it here to save space, but KEEP your full translations object)

    // ========== MOBILE MENU TOGGLE ==========
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
        
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                if (mobileToggle) mobileToggle.textContent = '☰';
            });
        });
    }
    
    // ========== HIDE/SHOW HEADER ON SCROLL ==========
    if (header) {
        let lastScrollTop = 0;
        const headerHeight = header.offsetHeight;
        
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (!nav || !nav.classList.contains('active')) {
                if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
                    header.classList.add('hide-header');
                } else {
                    header.classList.remove('hide-header');
                }
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }
    
    // ========== SECTION NAVIGATION ==========
    const productsSection = document.getElementById('products-section');
    const aboutSection = document.getElementById('about');
    const servicesSection = document.getElementById('services');
    const contactSection = document.getElementById('contact');
    const homeSection = document.getElementById('home');
    const coverSection = document.querySelector('.cover');
    const footer = document.querySelector('footer');
    const cartSection = document.getElementById('cart');
    const paymentSection = document.getElementById('payment');
    
    function hideAllSections() {
        if (productsSection) productsSection.style.display = 'none';
        if (aboutSection) aboutSection.style.display = 'none';
        if (servicesSection) servicesSection.style.display = 'none';
        if (contactSection) contactSection.style.display = 'none';
        if (cartSection) cartSection.style.display = 'none';
        if (paymentSection) paymentSection.style.display = 'none';
        
        const trustSection = document.querySelector('.trust-section');
        if (trustSection) {
            trustSection.style.display = 'none';
        }
    }
    
    function showSection(sectionId) {
        hideAllSections();
        
        if (homeSection) homeSection.style.display = 'block';
        if (coverSection) coverSection.style.display = 'block';
        if (footer) footer.style.display = 'block';
        
        const trustSection = document.querySelector('.trust-section');
        if (trustSection) {
            if (sectionId === 'services') {
                trustSection.style.display = 'flex';
            } else {
                trustSection.style.display = 'none';
            }
        }
        
        if (sectionId === 'products' && productsSection) {
            productsSection.style.display = 'block';
        } else if (sectionId === 'about' && aboutSection) {
            aboutSection.style.display = 'block';
        } else if (sectionId === 'services' && servicesSection) {
            servicesSection.style.display = 'block';
        } else if (sectionId === 'contact' && contactSection) {
            contactSection.style.display = 'block';
        } else if (sectionId === 'cart' && cartSection) {
            cartSection.style.display = 'block';
        } else if (sectionId === 'payment' && paymentSection) {
            paymentSection.style.display = 'block';
        }
        
        // Update spinner visibility after section change
        setTimeout(updateSpinnerVisibility, 100);
    }

    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const sectionId = href.replace('#', '');
            
            if (sectionId === 'home') {
                hideAllSections();
                if (homeSection) homeSection.style.display = 'block';
                if (coverSection) coverSection.style.display = 'block';
                if (footer) footer.style.display = 'block';
                
                const trustSection = document.querySelector('.trust-section');
                if (trustSection) trustSection.style.display = 'none';
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(updateSpinnerVisibility, 100);
            } else {
                e.preventDefault();
                showSection(sectionId);
                setTimeout(() => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        window.scrollTo({
                            top: section.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        });
    });

    // Cart icon click
    const cartIcon = document.querySelector('.cart-icon a');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('cart');
            setTimeout(() => {
                if (cartSection) {
                    window.scrollTo({
                        top: cartSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });
    }
    
    // ========== CATEGORY FILTERING ==========
    const categoryItems = document.querySelectorAll('.category-list li');
    const defaultProducts = document.getElementById('default-products');
    const categoryContainers = document.querySelectorAll('.category-products');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            categoryItems.forEach(cat => {
                cat.style.background = '';
                const span = cat.querySelector('span:last-child');
                if (span) span.textContent = '+';
            });
            
            this.style.background = 'rgba(52, 152, 219, 0.1)';
            const thisSpan = this.querySelector('span:last-child');
            if (thisSpan) thisSpan.textContent = '−';
            
            if (defaultProducts) {
                defaultProducts.style.display = 'none';
            }
            
            categoryContainers.forEach(container => {
                container.style.display = 'none';
            });
            
            const selectedCategory = document.getElementById(`${category}-products`);
            if (selectedCategory) {
                selectedCategory.style.display = 'grid';
            }
        });
    });
    
    // Show mobile products by default
    const mobileCategory = document.querySelector('[data-category="mobile"]');
    if (mobileCategory) {
        setTimeout(() => {
            mobileCategory.click();
        }, 100);
    }
    
    // ========== CONTACT FORM ==========
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentLang = localStorage.getItem('preferred-language') || 'en';
            alert(translations[currentLang]['send'] + ' (Demo)');
            this.reset();
        });
    }
    
    // ========== CART FUNCTIONALITY ==========
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateStockFromCart();
        updateCartDisplay();
    }
    
    // Initialize stock for all products
    function initializeProductStock() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productName = card.querySelector('.cart-btn')?.getAttribute('data-product');
            if (productName && !productStock[productName]) {
                productStock[productName] = 4;
            }
        });
    }
    initializeProductStock();
    
    function updateStockFromCart() {
        for (let product in productStock) {
            productStock[product] = 4;
        }
        
        cart.forEach(item => {
            if (productStock[item.name] !== undefined) {
                productStock[item.name] -= item.quantity;
            }
        });
        
        updateStockUI();
    }
    
    function updateStockUI() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productName = card.querySelector('.cart-btn')?.getAttribute('data-product');
            if (productName && productStock[productName] !== undefined) {
                const stockLeft = productStock[productName];
                
                let stockElement = card.querySelector('.stock-count');
                if (!stockElement) {
                    stockElement = document.createElement('div');
                    stockElement.className = 'stock-count';
                    const priceElement = card.querySelector('.price');
                    if (priceElement) {
                        card.insertBefore(stockElement, priceElement);
                    } else {
                        card.appendChild(stockElement);
                    }
                }
                
                if (stockLeft <= 0) {
                    card.classList.add('out-of-stock');
                    stockElement.innerHTML = `<span>OUT OF STOCK</span>`;
                } else {
                    card.classList.remove('out-of-stock');
                    stockElement.innerHTML = `<span>${stockLeft}</span> left in stock`;
                }
            }
        });
    }
    
    function getTotalItems() {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    function updateCartTotal() {
        const totalUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotalElement) {
            const currentLang = localStorage.getItem('preferred-language') || 'en';
            const currency = currencyRates[currentLang];
            const convertedTotal = totalUSD * currency.rate;
            cartTotalElement.textContent = `${currency.symbol}${convertedTotal.toFixed(2)}`;
        }
        return totalUSD;
    }
    
    function updateCartDisplay() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        const currentLang = localStorage.getItem('preferred-language') || 'en';
        
        if (cart.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="5" class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>${translations[currentLang]['cart-title']} ${translations[currentLang]['is-empty'] || 'is empty'}</p>
                </td>
            `;
            cartItemsContainer.appendChild(emptyRow);
        } else {
            const currency = currencyRates[currentLang];
            
            cart.forEach((item, index) => {
                const itemTotalUSD = item.price * item.quantity;
                const itemTotalConverted = itemTotalUSD * currency.rate;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="product-info">
                            <img src="${item.image}" alt="${item.name}">
                            <span class="product-name">${item.name}</span>
                        </div>
                    </td>
                    <td>${currency.symbol}${(item.price * currency.rate).toFixed(2)}</td>
                    <td>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                    </td>
                    <td>${currency.symbol}${itemTotalConverted.toFixed(2)}</td>
                    <td>
                        <button class="remove-btn" data-index="${index}">${translations[currentLang]['action'] || 'Remove'}</button>
                    </td>
                `;
                cartItemsContainer.appendChild(row);
            });
        }
        
        if (cartCount) {
            cartCount.textContent = getTotalItems();
        }
        
        updateCartTotal();
        localStorage.setItem('cart', JSON.stringify(cart));
        
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    productStock[cart[index].name] = (productStock[cart[index].name] || 0) + 1;
                    updateStockUI();
                    updateCartDisplay();
                }
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const productName = cart[index].name;
                
                if (productStock[productName] > 0) {
                    cart[index].quantity++;
                    productStock[productName]--;
                    updateStockUI();
                    updateCartDisplay();
                } else {
                    const currentLang = localStorage.getItem('preferred-language') || 'en';
                    alert('This product is out of stock!');
                }
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const productName = cart[index].name;
                
                productStock[productName] = (productStock[productName] || 0) + cart[index].quantity;
                cart.splice(index, 1);
                updateStockUI();
                updateCartDisplay();
            });
        });
    }
    
    document.querySelectorAll('.cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productCard = this.closest('.product-card');
            const productImage = productCard ? productCard.querySelector('.product-image').src : '';
            
            if (productStock[productName] <= 0) {
                alert('This product is out of stock!');
                return;
            }
            
            const existingItemIndex = cart.findIndex(item => item.name === productName);
            
            if (existingItemIndex !== -1) {
                if (productStock[productName] > 0) {
                    cart[existingItemIndex].quantity += 1;
                    productStock[productName]--;
                } else {
                    alert('Cannot add more - out of stock!');
                    return;
                }
            } else {
                cart.push({
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
                productStock[productName] = (productStock[productName] || 4) - 1;
            }
            
            updateStockUI();
            updateCartDisplay();
            
            const currentLang = localStorage.getItem('preferred-language') || 'en';
            showToast(`${productName} ${translations[currentLang]['add-to-cart'] || 'added to cart'}!`);
        });
    });
    
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            if (productsSection) {
                showSection('products');
                window.scrollTo({
                    top: productsSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const currentLang = localStorage.getItem('preferred-language') || 'en';
            
            if (cart.length === 0) {
                alert(translations[currentLang]['cart-title'] + ' ' + (translations[currentLang]['is-empty'] || 'is empty'));
                return;
            }
            
            updatePaymentSummary();
            showSection('payment');
            setTimeout(() => {
                if (paymentSection) {
                    window.scrollTo({
                        top: paymentSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });
    }
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // ========== PAYMENT FUNCTIONALITY ==========

    function addToRecentOrders(orderNumber) {
        let recentOrders = JSON.parse(localStorage.getItem('recent-orders')) || [];
        if (!recentOrders.includes(orderNumber)) {
            recentOrders.unshift(orderNumber);
            if (recentOrders.length > 5) recentOrders.pop();
            localStorage.setItem('recent-orders', JSON.stringify(recentOrders));
        }
    }

    function saveCompletedOrder(orderNumber, total, itemCount) {
        const orders = JSON.parse(localStorage.getItem('completed-orders')) || [];
        
        const orderItems = cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));
        
        orders.push({
            orderNumber: orderNumber,
            date: new Date().toISOString(),
            total: total,
            itemCount: itemCount,
            items: orderItems
        });
        
        localStorage.setItem('completed-orders', JSON.stringify(orders));
        addToRecentOrders(orderNumber);
    }

    // Payment method switching
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const cardForm = document.getElementById('card-form');
    const mbwayForm = document.getElementById('mbway-form');
    const googlepayInfo = document.getElementById('googlepay-info');
    const applepayInfo = document.getElementById('applepay-info');
    const paypalInfo = document.getElementById('paypal-info');

    if (paymentRadios.length > 0) {
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (cardForm) cardForm.style.display = 'none';
                if (mbwayForm) mbwayForm.style.display = 'none';
                if (googlepayInfo) googlepayInfo.style.display = 'none';
                if (applepayInfo) applepayInfo.style.display = 'none';
                if (paypalInfo) paypalInfo.style.display = 'none';
                
                const value = this.value;
                if (value === 'card' && cardForm) {
                    cardForm.style.display = 'block';
                } else if (value === 'mbway' && mbwayForm) {
                    mbwayForm.style.display = 'block';
                } else if (value === 'google-pay' && googlepayInfo) {
                    googlepayInfo.style.display = 'block';
                } else if (value === 'apple-pay' && applepayInfo) {
                    applepayInfo.style.display = 'block';
                } else if (value === 'paypal' && paypalInfo) {
                    paypalInfo.style.display = 'block';
                }
            });
        });
    }

    function updatePaymentSummary() {
        const orderItems = document.getElementById('order-items');
        const paymentSubtotal = document.getElementById('payment-subtotal');
        const paymentTotal = document.getElementById('payment-total');
        
        if (!orderItems || !paymentSubtotal || !paymentTotal) return;
        
        orderItems.innerHTML = '';
        
        const currentLang = localStorage.getItem('preferred-language') || 'en';
        const currency = currencyRates[currentLang];
        
        if (cart.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-cart-message';
            emptyMessage.innerHTML = `<p>${translations[currentLang]['cart-title']} ${translations[currentLang]['is-empty'] || 'is empty'}</p>`;
            orderItems.appendChild(emptyMessage);
        } else {
            cart.forEach(item => {
                const itemTotalUSD = item.price * item.quantity;
                const itemTotalConverted = itemTotalUSD * currency.rate;
                
                const itemElement = document.createElement('div');
                itemElement.className = 'order-item-payment';
                itemElement.innerHTML = `
                    <div class="order-item-info">
                        <h4>${item.name}</h4>
                        <p>${translations[currentLang]['quantity']}: ${item.quantity}</p>
                    </div>
                    <div class="order-item-price">${currency.symbol}${itemTotalConverted.toFixed(2)}</div>
                `;
                orderItems.appendChild(itemElement);
            });
        }
        
        const subtotalUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const subtotalConverted = subtotalUSD * currency.rate;
        const shipping = 5.99 * currency.rate;
        const totalConverted = subtotalConverted + shipping;
        
        paymentSubtotal.textContent = `${currency.symbol}${subtotalConverted.toFixed(2)}`;
        paymentTotal.textContent = `${currency.symbol}${totalConverted.toFixed(2)}`;
    }

    const backToCartBtn = document.querySelector('.back-to-cart');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('cart');
            setTimeout(() => {
                if (cartSection) {
                    window.scrollTo({
                        top: cartSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });
    }

    // Helper functions for email
    function formatOrderItemsForEmail(cart) {
        if (!cart || cart.length === 0) return 'No items';
        let text = '';
        cart.forEach((item) => {
            text += item.name + ' x ' + item.quantity + ' = $' + (item.price * item.quantity).toFixed(2) + '\n';
        });
        return text;
    }

    function formatShippingAddressForEmail() {
        const firstName = document.getElementById('first-name')?.value || '';
        const lastName = document.getElementById('last-name')?.value || '';
        const address1 = document.getElementById('address-line1')?.value || '';
        const address2 = document.getElementById('address-line2')?.value || '';
        const city = document.getElementById('city')?.value || '';
        const state = document.getElementById('state')?.value || '';
        const zip = document.getElementById('zip-code')?.value || '';
        const country = document.getElementById('country')?.value || '';
        
        let address = `${firstName} ${lastName}<br>${address1}`;
        if (address2) address += `<br>${address2}`;
        address += `<br>${city}, ${state} ${zip}<br>${country}`;
        return address;
    }

    function getSelectedPaymentMethodName() {
        const selected = document.querySelector('input[name="payment"]:checked');
        if (selected) {
            const label = selected.parentElement.querySelector('span:last-child')?.innerText;
            if (label) return label;
            if (selected.value === 'card') return 'Card Payment';
            if (selected.value === 'mbway') return 'MB WAY';
            if (selected.value === 'paypal') return 'PayPal';
            if (selected.value === 'google-pay') return 'Google Pay';
            if (selected.value === 'apple-pay') return 'Apple Pay';
        }
        return 'Card Payment';
    }

    function sendOrderEmail(orderData) {
        const templateParams = {
            order_number: orderData.orderNumber,
            order_date: orderData.orderDate,
            customer_name: orderData.customerName,
            customer_email: orderData.customerEmail,
            customer_phone: orderData.customerPhone,
            order_items: orderData.orderItems,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            discount: orderData.discount,
            total: orderData.total,
            shipping_address: orderData.shippingAddress,
            payment_method: orderData.paymentMethod
        };
        
        emailjs.send('snowfall_shop', 'template_2nxtcpx', templateParams)
            .then(function(response) {
                console.log('✅ Order email sent!', response.status);
            })
            .catch(function(error) {
                console.log('❌ Failed to send email:', error);
            });
    }

    function sendCustomerOrderEmail(orderData) {
        emailjs.send('snowfall_shop', 'template_wlu3spp', {
            customer_name: orderData.customerName,
            customer_email: orderData.customerEmail,
            order_number: orderData.orderNumber,
            order_date: orderData.orderDate,
            order_items: orderData.orderItems,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            total: orderData.total,
            shipping_address: orderData.shippingAddress,
            payment_method: orderData.paymentMethod
        })
        .then(function(response) {
            console.log('✅ Receipt sent to customer:', orderData.customerEmail);
        })
        .catch(function(error) {
            console.log('❌ Failed to send receipt:', error);
        });
    }

    function showPaymentSuccessModal(orderNumber, currency, total) {
        const modal = document.getElementById('payment-success-modal');
        const orderDisplay = document.getElementById('order-number-display');
        
        if (orderDisplay) {
            orderDisplay.textContent = orderNumber;
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
        
        const continueBtn = document.querySelector('.continue-shopping-btn');
        if (continueBtn) {
            const newContinueBtn = continueBtn.cloneNode(true);
            continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
            
            newContinueBtn.addEventListener('click', function() {
                modal.style.display = 'none';
                
                const paymentSectionElem = document.getElementById('payment');
                const homeSectionElem = document.getElementById('home');
                const coverSectionElem = document.querySelector('.cover');
                const footerElem = document.querySelector('footer');
                
                if (paymentSectionElem) paymentSectionElem.style.display = 'none';
                if (homeSectionElem) homeSectionElem.style.display = 'block';
                if (coverSectionElem) coverSectionElem.style.display = 'block';
                if (footerElem) footerElem.style.display = 'block';
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(updateSpinnerVisibility, 100);
            });
        }
    }

    // ========== SINGLE PAY NOW BUTTON ==========
    const payNowBtn = document.querySelector('.pay-now-btn');
    if (payNowBtn) {
        payNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                const currentLang = localStorage.getItem('preferred-language') || 'en';
                alert(translations[currentLang]['select-payment'] || 'Please select a payment method');
                return;
            }
            
            const currentLang = localStorage.getItem('preferred-language') || 'en';
            const currency = currencyRates[currentLang];
            const totalUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const totalConverted = totalUSD * currency.rate;
            
            let paymentMethod = selectedPayment.value;

            // Shipping Address Validation
            const firstName = document.getElementById('first-name')?.value;
            const lastName = document.getElementById('last-name')?.value;
            const addressLine1 = document.getElementById('address-line1')?.value;
            const city = document.getElementById('city')?.value;
            const state = document.getElementById('state')?.value;
            const zipCode = document.getElementById('zip-code')?.value;
            const country = document.getElementById('country')?.value;
            const phone = document.getElementById('phone')?.value;
            const confirmEmail = document.getElementById('confirmation-email')?.value;

            if (!firstName || !lastName || !addressLine1 || !city || !state || !zipCode || !country || !phone || !confirmEmail) {
                alert(translations[currentLang]['fill-shipping-details'] || 'Please fill in all shipping details');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(confirmEmail)) {
                alert(translations[currentLang]['valid-email'] || 'Please enter a valid email address');
                return;
            }

            const saveAddress = document.getElementById('save-address')?.checked;
            if (saveAddress) {
                const shippingAddress = {
                    firstName, lastName, addressLine1,
                    addressLine2: document.getElementById('address-line2')?.value,
                    city, state, zipCode, country, phone
                };
                localStorage.setItem('saved-shipping-address', JSON.stringify(shippingAddress));
            }

            if (paymentMethod === 'card') {
                const cardNumber = document.getElementById('card-number')?.value;
                const expiry = document.getElementById('expiry')?.value;
                const cvv = document.getElementById('cvv')?.value;
                const cardName = document.getElementById('card-name')?.value;
                if (!cardNumber || !expiry || !cvv || !cardName) {
                    alert(translations[currentLang]['fill-card-details'] || 'Please fill in all card details');
                    return;
                }
            } else if (paymentMethod === 'mbway') {
                const mbwayPhone = document.getElementById('mbway-phone')?.value;
                if (!mbwayPhone) {
                    alert(translations[currentLang]['enter-phone'] || 'Please enter your phone number');
                    return;
                }
            }
            
            const orderNumber = 'SNOW-' + Math.floor(10000000 + Math.random() * 90000000);
            
            saveCompletedOrder(orderNumber, totalConverted, getTotalItems());
            
            const subtotalUSD = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderEmailData = {
                orderNumber: orderNumber,
                orderDate: new Date().toLocaleString(),
                customerName: firstName + ' ' + lastName,
                customerEmail: confirmEmail,
                customerPhone: phone,
                orderItems: formatOrderItemsForEmail(cart),
                subtotal: `$${subtotalUSD.toFixed(2)}`,
                shipping: `$5.99`,
                discount: '$0.00',
                total: `$${totalConverted.toFixed(2)}`,
                shippingAddress: formatShippingAddressForEmail(),
                paymentMethod: getSelectedPaymentMethodName()
            };
            
            sendOrderEmail(orderEmailData);
            sendCustomerOrderEmail(orderEmailData);
            
            showPaymentSuccessModal(orderNumber, currency, totalConverted);
            
            cart = [];
            updateCartDisplay();
            initializeProductStock();
            updateStockUI();
        });
    }

    function updatePrices(lang) {
        const currency = currencyRates[lang];
        if (!currency) return;
        
        document.querySelectorAll('.price').forEach(priceElement => {
            let usdPrice = parseFloat(priceElement.getAttribute('data-usd-price'));
            
            if (isNaN(usdPrice)) {
                const priceText = priceElement.textContent;
                const match = priceText.match(/\d+(\.\d+)?/);
                if (match) {
                    usdPrice = parseFloat(match[0]);
                    priceElement.setAttribute('data-usd-price', usdPrice);
                }
            }
            
            if (!isNaN(usdPrice)) {
                const convertedPrice = usdPrice * currency.rate;
                priceElement.textContent = `${currency.symbol}${convertedPrice.toFixed(2)}`;
            }
        });
    }

    function updateAllText(lang) {
        const elements = document.querySelectorAll('[data-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.hasAttribute('placeholder')) {
                        element.setAttribute('placeholder', translations[lang][key]);
                    } else {
                        element.value = translations[lang][key];
                    }
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
    }

    // ========== LANGUAGE SELECTOR ==========
    document.querySelectorAll('.price').forEach(priceElement => {
        const priceText = priceElement.textContent;
        const match = priceText.match(/\d+(\.\d+)?/);
        if (match) {
            priceElement.setAttribute('data-usd-price', match[0]);
        }
    });
    
    function changeLanguage(lang) {
        updateAllText(lang);
        
        const langBtnSpan = document.querySelector('.lang-btn span');
        if (langBtnSpan) {
            let displayLang = '';
            if (lang === 'en') displayLang = 'EN';
            else if (lang === 'pt') displayLang = 'PT';
            else if (lang === 'es') displayLang = 'ES';
            else if (lang === 'fr') displayLang = 'FR';
            else if (lang === 'bn') displayLang = 'বাংলা';
            else if (lang === 'ar') displayLang = 'العربية';
            langBtnSpan.textContent = displayLang;
        }
        
        updatePrices(lang);
        
        if (cart && cart.length > 0) {
            updateCartDisplay();
        }
        
        if (document.getElementById('payment') && document.getElementById('payment').style.display === 'block') {
            updatePaymentSummary();
        }
        
        if (lang === 'ar') {
            document.body.setAttribute('dir', 'rtl');
        } else {
            document.body.setAttribute('dir', 'ltr');
        }
        
        localStorage.setItem('preferred-language', lang);
    }
    
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
            
            const dropdown = document.querySelector('.lang-dropdown');
            if (dropdown) {
                dropdown.style.display = 'none';
            }
        });
    });
    
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    changeLanguage(savedLang);
    
    const langBtn = document.querySelector('.lang-btn');
    const langDropdown = document.querySelector('.lang-dropdown');
    
    if (langBtn && langDropdown) {
        langBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isVisible = langDropdown.style.display === 'block';
            langDropdown.style.display = isVisible ? 'none' : 'block';
        });
        
        document.addEventListener('click', function(e) {
            if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.style.display = 'none';
            }
        });
    }

    // ========== SPINNER VISIBILITY - SHOW ONLY ON HOME PAGE ==========
    function updateSpinnerVisibility() {
        const spinner = document.querySelector('.spin-wheel-container');
        const scrollArrow = document.querySelector('.scroll-indicator');
        
        const homeSectionElem = document.getElementById('home');
        const isHomeVisible = homeSectionElem && homeSectionElem.style.display !== 'none';
        
        if (spinner) {
            spinner.style.display = isHomeVisible ? 'block' : 'none';
        }
        if (scrollArrow) {
            scrollArrow.style.display = isHomeVisible ? 'block' : 'none';
        }
    }

    // Initial call
    setTimeout(updateSpinnerVisibility, 200);

    // Watch for navigation clicks
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(updateSpinnerVisibility, 200);
        });
    });

    window.addEventListener('hashchange', function() {
        setTimeout(updateSpinnerVisibility, 100);
    });

    // ========== AI CHAT BOT ==========
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotModal = document.getElementById('chatbot-modal');
    const chatbotClose = document.querySelector('.chatbot-close');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const quickQuestions = document.querySelectorAll('.quick-question');
    
    if (chatbotToggle && chatbotModal) {
        const trustItems = document.querySelectorAll('.trust-item');
        trustItems.forEach(item => {
            const itemText = item.textContent || item.innerText;
            if (itemText.includes('24/7') || itemText.includes('Support')) {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    chatbotToggle.style.display = 'flex';
                    setTimeout(() => {
                        chatbotModal.style.display = 'block';
                        chatbotToggle.style.display = 'none';
                    }, 300);
                });
            }
        });
        
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            const cardText = card.textContent || card.innerText;
            if (cardText.includes('24/7') || cardText.includes('Customer Support')) {
                card.addEventListener('click', function(e) {
                    e.preventDefault();
                    chatbotToggle.style.display = 'flex';
                    setTimeout(() => {
                        chatbotModal.style.display = 'block';
                        chatbotToggle.style.display = 'none';
                    }, 300);
                });
            }
        });
        
        chatbotToggle.addEventListener('click', function() {
            chatbotModal.style.display = 'block';
            chatbotToggle.style.display = 'none';
        });
        
        if (chatbotClose) {
            chatbotClose.addEventListener('click', function() {
                chatbotModal.style.display = 'none';
                chatbotToggle.style.display = 'flex';
            });
        }
        
        function sendMessage() {
            const message = chatbotInput.value.trim();
            if (message === '') return;
            
            addMessage(message, 'user');
            chatbotInput.value = '';
            showTypingIndicator();
            
            setTimeout(() => {
                removeTypingIndicator();
                const response = getAIResponse(message);
                addMessage(response, 'bot');
            }, 1500);
        }
        
        if (chatbotSend) {
            chatbotSend.addEventListener('click', sendMessage);
        }
        
        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
        
        quickQuestions.forEach(btn => {
            btn.addEventListener('click', function() {
                const question = this.getAttribute('data-question');
                let message = '';
                
                switch(question) {
                    case 'shipping':
                        message = 'Tell me about your shipping options';
                        break;
                    case 'returns':
                        message = 'What is your return policy?';
                        break;
                    case 'payment':
                        message = 'What payment methods do you accept?';
                        break;
                    case 'warranty':
                        message = 'Tell me about product warranty';
                        break;
                }
                
                chatbotInput.value = message;
                sendMessage();
            });
        });
        
        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = text;
            
            messageDiv.appendChild(contentDiv);
            chatbotMessages.appendChild(messageDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot-message typing-indicator';
            typingDiv.id = 'typing-indicator';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = '<span>.</span><span>.</span><span>.</span>';
            
            typingDiv.appendChild(contentDiv);
            chatbotMessages.appendChild(typingDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        function removeTypingIndicator() {
            const typing = document.getElementById('typing-indicator');
            if (typing) {
                typing.remove();
            }
        }
        
        function getAIResponse(message) {
            const lowerMsg = message.toLowerCase();
            
            if (lowerMsg.includes('shipping') || lowerMsg.includes('delivery') || lowerMsg.includes('deliver')) {
                return "📦 We offer worldwide shipping! Standard delivery takes 3-7 business days. Express shipping (1-3 days) is available for an additional fee. Free shipping on orders over $50!";
            } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
                return "🔄 You can return any item within 30 days of delivery for a full refund. Items must be unused and in original packaging. We also offer free returns!";
            } else if (lowerMsg.includes('payment') || lowerMsg.includes('pay') || lowerMsg.includes('card')) {
                return "💳 We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Google Pay, Apple Pay, and MB WAY. All payments are 100% secure with SSL encryption!";
            } else if (lowerMsg.includes('warranty') || lowerMsg.includes('guarantee')) {
                return "🛡️ All our products come with a minimum 1-year manufacturer's warranty. Some products have extended warranty options available at checkout!";
            } else if (lowerMsg.includes('product') || lowerMsg.includes('item') || lowerMsg.includes('buy')) {
                return "🛍️ We have a wide range of products including smartphones, laptops, tablets, cameras, gaming consoles, headphones, smartwatches, and accessories. All products are 100% genuine!";
            } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much')) {
                return "💰 Prices vary by product. You can check individual product pages for current prices. We also have frequent sales and discounts!";
            } else if (lowerMsg.includes('track') || lowerMsg.includes('order') || lowerMsg.includes('where is my')) {
                return "📱 You can track your order from your account dashboard. You'll also receive SMS and email updates with tracking information once your order ships!";
            } else if (lowerMsg.includes('help') || lowerMsg.includes('support') || lowerMsg.includes('contact')) {
                return "🤝 Our 24/7 customer support team is here to help! You can reach us via live chat, email at support@snowfall.com, or call us at +1 (555) 123-4567.";
            } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
                return "👋 Hello! How can I assist you with your shopping today?";
            } else {
                return "I'm not sure I understand. Could you please rephrase? You can ask me about shipping, returns, payments, warranty, or products!";
            }
        }
    }

    // ========== ORDER TRACKING & RETURNS ==========
    const returnsBtn = document.getElementById('returns-tracking-btn');
    const trackingModal = document.getElementById('order-tracking-modal');
    const trackingCloseBtn = document.getElementById('tracking-modal-close');
    const trackOrderBtn = document.getElementById('track-order-btn');
    const orderInput = document.getElementById('order-confirmation-input');
    const orderResult = document.getElementById('order-result');
    const recentOrdersList = document.getElementById('recent-orders-list');

    let recentOrdersListData = JSON.parse(localStorage.getItem('recent-orders')) || [];

    function updateRecentOrders() {
        if (!recentOrdersList) return;
        
        recentOrdersList.innerHTML = '';
        if (recentOrdersListData.length === 0) {
            recentOrdersList.innerHTML = '<p style="color: #999;">No recent orders</p>';
            return;
        }
        
        recentOrdersListData.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'recent-order-item';
            orderItem.innerHTML = `<i class="fas fa-box"></i> ${order}`;
            orderItem.addEventListener('click', function() {
                orderInput.value = order;
                trackOrder(order);
            });
            recentOrdersList.appendChild(orderItem);
        });
    }

    function trackOrder(orderNumber) {
        const orders = JSON.parse(localStorage.getItem('completed-orders')) || [];
        const order = orders.find(o => o.orderNumber === orderNumber);
        
        if (order) {
            const orderDate = new Date(order.date);
            const today = new Date();
            const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
            const isWithinReturn = daysDiff <= 30;
            
            orderResult.innerHTML = `
                <div class="order-result-header">
                    <i class="fas fa-check-circle"></i>
                    <h4>Order Found!</h4>
                </div>
                <div class="order-details">
                    <div class="order-detail-row">
                        <span class="detail-label">Order Number:</span>
                        <span class="detail-value">${order.orderNumber}</span>
                    </div>
                    <div class="order-detail-row">
                        <span class="detail-label">Order Date:</span>
                        <span class="detail-value">${new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <div class="order-detail-row">
                        <span class="detail-label">Total:</span>
                        <span class="detail-value">$${order.total.toFixed(2)}</span>
                    </div>
                    <div class="order-detail-row">
                        <span class="detail-label">Items:</span>
                        <span class="detail-value">${order.itemCount}</span>
                    </div>
                    <div class="order-detail-row">
                        <span class="detail-label">Return Status:</span>
                        <span class="detail-value ${isWithinReturn ? 'return-eligible' : 'return-not-eligible'}">
                            ${isWithinReturn ? '✅ Eligible for return' : '❌ Return period expired'}
                        </span>
                    </div>
                </div>
                <div class="return-deadline">
                    ${isWithinReturn 
                        ? `⏰ You have ${30 - daysDiff} days left to return this order.` 
                        : `⏰ Return period ended ${daysDiff - 30} days ago.`}
                </div>
                ${isWithinReturn ? '<button class="start-return-btn" onclick="startReturnFromTracking()">Start Return</button>' : ''}
            `;
            orderResult.className = 'order-result valid';
        } else {
            orderResult.innerHTML = `
                <div class="order-result-header">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>Order Not Found</h4>
                </div>
                <p style="color: #666; margin-top: 10px;">No order found with number: ${orderNumber}</p>
                <p style="color: #666; margin-top: 5px;">Please check your order confirmation email or try again.</p>
            `;
            orderResult.className = 'order-result invalid';
        }
        
        orderResult.style.display = 'block';
    }

    window.startReturnFromTracking = function() {
        if (trackingModal) trackingModal.style.display = 'none';
        const returnModal = document.getElementById('returns-modal');
        if (returnModal) {
            returnModal.style.display = 'block';
            if (typeof resetReturnForm === 'function') {
                resetReturnForm();
            }
        }
    };

    if (returnsBtn) {
        returnsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (trackingModal) {
                trackingModal.style.display = 'block';
                updateRecentOrders();
                if (orderResult) orderResult.style.display = 'none';
                if (orderInput) orderInput.value = 'SNOW-';
            }
        });
    }

    if (trackingCloseBtn) {
        trackingCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (trackingModal) trackingModal.style.display = 'none';
            if (orderResult) orderResult.style.display = 'none';
            if (orderInput) orderInput.value = 'SNOW-';
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target === trackingModal) {
            if (trackingModal) trackingModal.style.display = 'none';
            if (orderResult) orderResult.style.display = 'none';
            if (orderInput) orderInput.value = 'SNOW-';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && trackingModal && trackingModal.style.display === 'block') {
            trackingModal.style.display = 'none';
            if (orderResult) orderResult.style.display = 'none';
            if (orderInput) orderInput.value = 'SNOW-';
        }
    });

    if (trackOrderBtn) {
        trackOrderBtn.addEventListener('click', function() {
            const orderNumber = orderInput?.value.trim();
            if (orderNumber && orderNumber !== 'SNOW-') {
                trackOrder(orderNumber);
            } else {
                alert('Please enter a valid order number');
            }
        });
    }

    if (orderInput) {
        orderInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const orderNumber = orderInput.value.trim();
                if (orderNumber && orderNumber !== 'SNOW-') {
                    trackOrder(orderNumber);
                }
            }
        });
    }

    // ========== RETURNS FUNCTIONALITY ==========
    const returnsModal = document.getElementById('returns-modal');
    const returnsClose = document.querySelector('.returns-close');
    const returnShippingBtn = document.getElementById('return-shipping-btn');
    let currentReturnStep = 1;
    let selectedReturnOrder = null;

    if (returnShippingBtn) {
        returnShippingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.setItem('returnType', '30day');
            if (returnsModal) returnsModal.style.display = 'block';
            resetReturnForm();
        });
    }

    const returns7DayBtn = document.getElementById('returns-7day-btn');
    if (returns7DayBtn) {
        returns7DayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.setItem('returnType', '7day');
            if (returnsModal) returnsModal.style.display = 'block';
            resetReturnForm();
        });
    }

    if (returnsClose) {
        returnsClose.addEventListener('click', function() {
            if (returnsModal) returnsModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target === returnsModal) {
            if (returnsModal) returnsModal.style.display = 'none';
        }
    });

    function resetReturnForm() {
        currentReturnStep = 1;
        selectedReturnOrder = null;
        const step1 = document.getElementById('return-step-1');
        const step2 = document.getElementById('return-step-2');
        const step3 = document.getElementById('return-step-3');
        const step4 = document.getElementById('return-step-4');
        if (step1) step1.classList.remove('hidden');
        if (step2) step2.classList.add('hidden');
        if (step3) step3.classList.add('hidden');
        if (step4) step4.classList.add('hidden');
        
        const step1El = document.getElementById('step1');
        const step2El = document.getElementById('step2');
        const step3El = document.getElementById('step3');
        const step4El = document.getElementById('step4');
        if (step1El) step1El.classList.add('active');
        if (step2El) step2El.classList.remove('active');
        if (step3El) step3El.classList.remove('active');
        if (step4El) step4El.classList.remove('active');
        if (step2El) step2El.classList.remove('completed');
        if (step3El) step3El.classList.remove('completed');
        if (step4El) step4El.classList.remove('completed');
        
        const prevBtn = document.getElementById('return-prev-btn');
        if (prevBtn) prevBtn.disabled = true;
        const orderPreview = document.getElementById('order-preview');
        if (orderPreview) orderPreview.style.display = 'none';
        const orderNumberInput = document.getElementById('return-order-number');
        if (orderNumberInput) orderNumberInput.value = '';
        const itemsList = document.getElementById('return-items-list');
        if (itemsList) itemsList.innerHTML = '';
        const reasonSelect = document.getElementById('return-reason-select');
        if (reasonSelect) reasonSelect.value = '';
        const comments = document.getElementById('return-comments');
        if (comments) comments.value = '';
        const termsCheck = document.getElementById('confirm-return-terms');
        if (termsCheck) termsCheck.checked = false;
    }

    const searchOrderBtn = document.getElementById('search-order-btn');
    if (searchOrderBtn) {
        searchOrderBtn.addEventListener('click', function() {
            const orderNumber = document.getElementById('return-order-number')?.value.trim();
            if (!orderNumber) {
                alert('Please enter an order number');
                return;
            }
            
            const orders = JSON.parse(localStorage.getItem('completed-orders')) || [];
            const order = orders.find(o => o.orderNumber === orderNumber);
            
            if (order) {
                selectedReturnOrder = {
                    number: order.orderNumber,
                    date: order.date,
                    total: order.total,
                    items: order.items || []
                };
                
                const previewNumber = document.getElementById('preview-order-number');
                const previewDate = document.getElementById('preview-order-date');
                const previewTotal = document.getElementById('preview-order-total');
                if (previewNumber) previewNumber.textContent = selectedReturnOrder.number;
                if (previewDate) previewDate.textContent = new Date(selectedReturnOrder.date).toLocaleDateString();
                if (previewTotal) previewTotal.textContent = `$${selectedReturnOrder.total.toFixed(2)}`;
                
                const orderDate = new Date(selectedReturnOrder.date);
                const today = new Date();
                const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
                const returnType = localStorage.getItem('returnType') || '30day';
                const maxDays = returnType === '7day' ? 7 : 30;
                const fee = returnType === '7day' ? 30 : 5.99;
                const feeSymbol = returnType === '7day' ? '€' : '$';
                const eligibility = document.getElementById('return-eligibility');
                
                if (eligibility) {
                    if (daysDiff <= maxDays) {
                        eligibility.className = 'return-eligibility eligible';
                        eligibility.innerHTML = `✅ Eligible for return (${maxDays - daysDiff} days left) - Fee: ${feeSymbol}${fee}`;
                    } else {
                        eligibility.className = 'return-eligibility not-eligible';
                        eligibility.innerHTML = `❌ Return period expired (over ${maxDays} days)`;
                    }
                }
                
                const orderPreview = document.getElementById('order-preview');
                if (orderPreview) orderPreview.style.display = 'block';
            } else {
                alert('Order not found. Please enter a valid order number from your completed purchases.');
            }
        });
    }

    function loadReturnItems(order) {
        const container = document.getElementById('return-items-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!order.items || order.items.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No items found in this order.</p>';
            return;
        }
        
        order.items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'return-item';
            const imageSrc = item.image || 'image/snow.png';
            const quantity = item.quantity || 1;
            
            itemDiv.innerHTML = `
                <img src="${imageSrc}" alt="${item.name}" class="return-item-image" onerror="this.src='image/snow.png'">
                <div class="return-item-details">
                    <h4>${item.name}</h4>
                    <div class="return-item-price">$${item.price.toFixed(2)}</div>
                    <div class="return-item-quantity">
                        <span>Quantity to return:</span>
                        <select class="return-qty-${index}" data-price="${item.price}" data-max="${quantity}">
                            <option value="0">0</option>
                            <option value="1" selected>1</option>
                            ${quantity > 1 ? `<option value="2">2</option>` : ''}
                            ${quantity > 2 ? `<option value="3">3</option>` : ''}
                            ${quantity > 3 ? `<option value="4">4</option>` : ''}
                        </select>
                        <span class="max-qty">(Max ${quantity})</span>
                    </div>
                </div>
            `;
            container.appendChild(itemDiv);
            
            const selectEl = itemDiv.querySelector('select');
            if (selectEl) {
                selectEl.addEventListener('change', updateReturnTotals);
            }
        });
        
        updateReturnTotals();
    }

    function updateReturnTotals() {
        let itemCount = 0;
        let totalAmount = 0;
        
        document.querySelectorAll('[class^="return-qty-"]').forEach(select => {
            const qty = parseInt(select.value);
            const price = parseFloat(select.getAttribute('data-price'));
            if (!isNaN(qty) && qty > 0) {
                itemCount += qty;
                totalAmount += price * qty;
            }
        });
        
        const returnType = localStorage.getItem('returnType') || '30day';
        const returnFee = returnType === '7day' ? 30 : 5.99;
        const feeSymbol = returnType === '7day' ? '€' : '$';
        
        const itemCountSpan = document.getElementById('return-item-count');
        const amountSpan = document.getElementById('return-amount');
        const totalSpan = document.getElementById('return-total');
        if (itemCountSpan) itemCountSpan.textContent = itemCount;
        if (amountSpan) amountSpan.textContent = `$${totalAmount.toFixed(2)}`;
        if (totalSpan) totalSpan.textContent = `${feeSymbol}${(totalAmount + returnFee).toFixed(2)}`;
        
        const returnFeeText = document.querySelector('.return-summary .summary-row:nth-child(3) span:first-child');
        if (returnFeeText) {
            returnFeeText.textContent = returnType === '7day' ? 'Return Fee:' : 'Return Shipping:';
        }
        
        const returnFeeAmount = document.querySelector('.return-summary .summary-row:nth-child(3) span:last-child');
        if (returnFeeAmount) {
            returnFeeAmount.textContent = `${feeSymbol}${returnFee.toFixed(2)}`;
        }
    }

    const prevBtn = document.getElementById('return-prev-btn');
    const nextBtn = document.getElementById('return-next-btn');

    function updateReturnStep(step) {
        const step1Div = document.getElementById('return-step-1');
        const step2Div = document.getElementById('return-step-2');
        const step3Div = document.getElementById('return-step-3');
        const step4Div = document.getElementById('return-step-4');
        if (step1Div) step1Div.classList.add('hidden');
        if (step2Div) step2Div.classList.add('hidden');
        if (step3Div) step3Div.classList.add('hidden');
        if (step4Div) step4Div.classList.add('hidden');
        
        const currentStepDiv = document.getElementById(`return-step-${step}`);
        if (currentStepDiv) currentStepDiv.classList.remove('hidden');
        
        for (let i = 1; i <= 4; i++) {
            const stepEl = document.getElementById(`step${i}`);
            if (stepEl) {
                if (i < step) {
                    stepEl.classList.add('completed');
                    stepEl.classList.remove('active');
                } else if (i === step) {
                    stepEl.classList.add('active');
                    stepEl.classList.remove('completed');
                } else {
                    stepEl.classList.remove('active', 'completed');
                }
            }
        }
        
        if (prevBtn) prevBtn.disabled = step === 1;
        
        if (nextBtn) {
            if (step === 4) {
                nextBtn.textContent = 'Submit Return Request';
                nextBtn.classList.add('return');
            } else {
                nextBtn.textContent = 'Next →';
                nextBtn.classList.remove('return');
            }
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentReturnStep === 1) {
                if (!selectedReturnOrder) {
                    alert('Please search and select an order first');
                    return;
                }
                loadReturnItems(selectedReturnOrder);
                currentReturnStep = 2;
                updateReturnStep(2);
            } 
            else if (currentReturnStep === 2) {
                const itemCount = parseInt(document.getElementById('return-item-count')?.textContent || '0');
                if (itemCount === 0) {
                    alert('Please select at least one item to return');
                    return;
                }
                currentReturnStep = 3;
                updateReturnStep(3);
            } 
            else if (currentReturnStep === 3) {
                const reason = document.getElementById('return-reason-select')?.value;
                if (!reason) {
                    alert('Please select a return reason');
                    return;
                }
                
                const confirmOrder = document.getElementById('confirm-order-number');
                const confirmItemCount = document.getElementById('confirm-item-count');
                const confirmRefund = document.getElementById('confirm-refund-amount');
                const confirmReason = document.getElementById('confirm-reason');
                
                if (confirmOrder) confirmOrder.textContent = selectedReturnOrder.number;
                if (confirmItemCount) confirmItemCount.textContent = document.getElementById('return-item-count')?.textContent + ' items';
                if (confirmRefund) confirmRefund.textContent = document.getElementById('return-total')?.textContent;
                
                const reasonSelect = document.getElementById('return-reason-select');
                if (reasonSelect && confirmReason) {
                    const reasonText = reasonSelect.options[reasonSelect.selectedIndex].text;
                    confirmReason.textContent = reasonText;
                }
                
                currentReturnStep = 4;
                updateReturnStep(4);
            } 
            else if (currentReturnStep === 4) {
                const terms = document.getElementById('confirm-return-terms');
                if (!terms || !terms.checked) {
                    alert('Please confirm that you have read the return policy');
                    return;
                }
                
                const returnNumber = 'RET-' + Math.floor(10000000 + Math.random() * 90000000);
                const returnNumberSpan = document.getElementById('return-request-number');
                if (returnNumberSpan) returnNumberSpan.textContent = returnNumber;
                
                if (returnsModal) returnsModal.style.display = 'none';
                const successModal = document.getElementById('return-success-modal');
                if (successModal) successModal.style.display = 'block';
                
                setTimeout(resetReturnForm, 500);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentReturnStep > 1) {
                currentReturnStep--;
                updateReturnStep(currentReturnStep);
            }
        });
    }

    const viewLabelBtn = document.getElementById('view-label-btn');
    if (viewLabelBtn) {
        viewLabelBtn.addEventListener('click', function() {
            const successModal = document.getElementById('return-success-modal');
            if (successModal) successModal.style.display = 'none';
            
            const labelReturn = document.getElementById('label-return-number');
            const labelOrder = document.getElementById('label-order-number');
            if (labelReturn) labelReturn.textContent = document.getElementById('return-request-number')?.textContent || 'RET-12345678';
            if (labelOrder) labelOrder.textContent = selectedReturnOrder?.number || 'SNOW-12345678';
            
            const savedAddress = localStorage.getItem('saved-shipping-address');
            let customerName = 'Customer';
            let address = '';
            
            if (savedAddress) {
                const addr = JSON.parse(savedAddress);
                customerName = `${addr.firstName} ${addr.lastName}`;
                address = `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
            }
            
            const labelFrom = document.getElementById('label-from');
            if (labelFrom) labelFrom.textContent = `${customerName}, ${address}`;
            
            const labelModal = document.getElementById('shipping-label-modal');
            if (labelModal) labelModal.style.display = 'block';
        });
    }

    const successModalBtns = document.querySelectorAll('.return-success-modal .return-btn');
    successModalBtns.forEach(btn => {
        if (btn.id !== 'view-label-btn') {
            btn.addEventListener('click', function() {
                const successModal = document.getElementById('return-success-modal');
                if (successModal) successModal.style.display = 'none';
            });
        }
    });

    window.addEventListener('click', function(e) {
        const shippingLabelModal = document.getElementById('shipping-label-modal');
        if (e.target === shippingLabelModal) {
            if (shippingLabelModal) shippingLabelModal.style.display = 'none';
        }
        const returnSuccessModal = document.getElementById('return-success-modal');
        if (e.target === returnSuccessModal) {
            if (returnSuccessModal) returnSuccessModal.style.display = 'none';
        }
    });

    // ========== SPIN TO WIN WHEEL - 5 SPINS PER DAY ==========
    (function() {
        const DISCOUNTS = [
            { label: "5% OFF", value: 5, color: "#ff6b6b" },
            { label: "10% OFF", value: 10, color: "#4ecdc4" },
            { label: "15% OFF", value: 15, color: "#45b7d1" },
            { label: "20% OFF", value: 20, color: "#96ceb4" },
            { label: "25% OFF", value: 25, color: "#ffeaa7" },
            { label: "FREE SHIPPING", value: "free", color: "#dfe6e9" },
            { label: "30% OFF", value: 30, color: "#ff7675" },
            { label: "TRY AGAIN", value: 0, color: "#74b9ff" }
        ];
        
        let spinning = false;
        let currentRotation = 0;
        
        function hasWonToday() {
            const today = new Date().toDateString();
            const lastWinDate = localStorage.getItem('lastWinDate');
            return lastWinDate === today;
        }
        
        function checkAndResetSpins() {
            const today = new Date().toDateString();
            const lastSpinDate = localStorage.getItem('lastSpinDate');
            const savedSpins = localStorage.getItem('spinRemaining');
            
            if (hasWonToday()) {
                return 0;
            }
            
            if (lastSpinDate !== today) {
                const newRemaining = 5;
                localStorage.setItem('spinRemaining', newRemaining);
                localStorage.setItem('lastSpinDate', today);
                return newRemaining;
            } else {
                return savedSpins ? parseInt(savedSpins) : 5;
            }
        }
        
        let remainingSpins = checkAndResetSpins();
        
        const canvas = document.getElementById('wheelCanvas');
        const ctx = canvas?.getContext('2d');
        const spinBtn = document.getElementById('spinBtn');
        const discountResult = document.getElementById('discountResult');
        const discountValue = document.getElementById('discountValue');
        const couponCodeSpan = document.getElementById('couponCode');
        const spinLimit = document.getElementById('spinLimit');
        
        function updateSpinDisplay() {
            if (spinLimit) {
                if (hasWonToday()) {
                    spinLimit.innerHTML = "🏆 You already won a prize today! 🏆<br><small>Come back tomorrow!</small>";
                    if (spinBtn) spinBtn.disabled = true;
                } else if (remainingSpins > 0) {
                    spinLimit.innerHTML = `🎡 ${remainingSpins} spin${remainingSpins > 1 ? 's' : ''} left today! 🎡`;
                    if (spinBtn) spinBtn.disabled = false;
                } else {
                    spinLimit.innerHTML = "😢 No spins left today! Come back tomorrow! 🎁";
                    if (spinBtn) spinBtn.disabled = true;
                }
            }
        }
        
        updateSpinDisplay();
        
        function drawWheel() {
            if (!canvas || !ctx) return;
            
            const size = canvas.width;
            const center = size / 2;
            const radius = size / 2;
            const angleStep = (Math.PI * 2) / DISCOUNTS.length;
            
            ctx.clearRect(0, 0, size, size);
            
            for (let i = 0; i < DISCOUNTS.length; i++) {
                const startAngle = i * angleStep + currentRotation;
                const endAngle = startAngle + angleStep;
                
                ctx.beginPath();
                ctx.moveTo(center, center);
                ctx.arc(center, center, radius, startAngle, endAngle);
                ctx.fillStyle = DISCOUNTS[i].color;
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.save();
                ctx.translate(center, center);
                ctx.rotate(startAngle + angleStep / 2);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "bold 12px 'Segoe UI'";
                ctx.fillStyle = "#2c3e50";
                
                let text = DISCOUNTS[i].label;
                if (text === "FREE SHIPPING") text = "FREE\nSHIP";
                else if (text === "TRY AGAIN") text = "TRY\nAGAIN";
                
                const lines = text.split('\n');
                if (lines.length === 1) {
                    ctx.fillText(text, radius * 0.65, 0);
                } else {
                    ctx.fillText(lines[0], radius * 0.65, -8);
                    ctx.fillText(lines[1], radius * 0.65, 10);
                }
                ctx.restore();
            }
            
            ctx.beginPath();
            ctx.arc(center, center, 30, 0, Math.PI * 2);
            ctx.fillStyle = "#2c3e50";
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.font = "bold 20px 'Segoe UI'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🎁", center, center);
        }
        
        function getRandomDiscount() {
            const random = Math.random();
            if (random < 0.15) return DISCOUNTS[0];
            if (random < 0.28) return DISCOUNTS[1];
            if (random < 0.4) return DISCOUNTS[2];
            if (random < 0.5) return DISCOUNTS[3];
            if (random < 0.6) return DISCOUNTS[4];
            if (random < 0.68) return DISCOUNTS[5];
            if (random < 0.8) return DISCOUNTS[6];
            return DISCOUNTS[7];
        }
        
        function savePrize(selected) {
            if (selected.value !== 0 && selected.value !== "free") {
                const today = new Date().toDateString();
                localStorage.setItem('lastWinDate', today);
                
                let couponCode = `SAVE${selected.value}${Math.floor(Math.random() * 1000)}`;
                const couponData = {
                    code: couponCode,
                    type: 'percentage',
                    value: selected.value,
                    claimedAt: new Date().toISOString()
                };
                localStorage.setItem('activeCoupon', JSON.stringify(couponData));
                localStorage.setItem('wonCoupon', couponCode);
                return couponCode;
            } else if (selected.value === "free") {
                const today = new Date().toDateString();
                localStorage.setItem('lastWinDate', today);
                
                let couponCode = "SHIPFREE" + Math.floor(Math.random() * 1000);
                const couponData = {
                    code: couponCode,
                    type: 'free_shipping',
                    value: 'FREE',
                    claimedAt: new Date().toISOString()
                };
                localStorage.setItem('activeCoupon', JSON.stringify(couponData));
                localStorage.setItem('wonCoupon', couponCode);
                return couponCode;
            }
            return null;
        }
        
        window.copyCoupon = function() {
            const couponText = document.getElementById('couponCode')?.innerText;
            
            if (couponText && couponText !== "No luck this time! Try again!") {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(couponText).then(function() {
                        showCopyNotification(couponText);
                    }).catch(function(err) {
                        fallbackCopy(couponText);
                    });
                } else {
                    fallbackCopy(couponText);
                }
                
                const activeCoupon = localStorage.getItem('activeCoupon');
                if (activeCoupon) {
                    const coupon = JSON.parse(activeCoupon);
                    let message = '';
                    if (coupon.type === 'percentage') {
                        message = `🎉 Coupon copied: ${couponText}\n💰 ${coupon.value}% OFF on your entire order!\n\nApply at checkout!`;
                    } else if (coupon.type === 'free_shipping') {
                        message = `🎉 Coupon copied: ${couponText}\n🚚 FREE SHIPPING on your order!\n\nApply at checkout!`;
                    } else {
                        message = '🎉 Coupon copied: ' + couponText;
                    }
                    alert(message);
                } else {
                    alert('🎉 Coupon copied: ' + couponText);
                }
                
                const cartIconElem = document.querySelector('.cart-icon');
                if (cartIconElem) {
                    cartIconElem.style.animation = 'shake 0.5s ease';
                    setTimeout(function() {
                        cartIconElem.style.animation = '';
                    }, 500);
                }
            } else {
                alert('Nothing to copy! Spin the wheel first!');
            }
        };
        
        function fallbackCopy(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.top = '-9999px';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showCopyNotification(text);
        }
        
        function showCopyNotification(couponText) {
            let notification = document.querySelector('.copy-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.className = 'copy-notification';
                notification.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#2ecc71; color:white; padding:12px 24px; border-radius:8px; z-index:10000; font-weight:bold; box-shadow:0 4px 15px rgba(0,0,0,0.2);';
                document.body.appendChild(notification);
            }
            
            notification.textContent = `✅ Copied: ${couponText}`;
            notification.style.display = 'block';
            
            setTimeout(function() {
                notification.style.display = 'none';
            }, 3000);
        }
        
        function spinWheel() {
            if (spinning) return;
            
            if (hasWonToday()) {
                alert("🏆 You already won a prize today! Come back tomorrow!");
                return;
            }
            
            remainingSpins = checkAndResetSpins();
            updateSpinDisplay();
            
            if (remainingSpins <= 0) {
                alert("😢 No spins left today! Come back tomorrow!");
                return;
            }
            
            spinning = true;
            if (spinBtn) spinBtn.disabled = true;
            
            const selected = getRandomDiscount();
            const segmentAngle = (Math.PI * 2) / DISCOUNTS.length;
            const targetIndex = DISCOUNTS.findIndex(d => d.label === selected.label);
            
            let rotations = 8;
            let targetRotation = currentRotation + (rotations * Math.PI * 2);
            
            const targetAngle = targetIndex * segmentAngle;
            const currentAngle = ((currentRotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
            let delta = targetAngle - currentAngle;
            if (delta < 0) delta += Math.PI * 2;
            
            targetRotation += delta;
            
            const duration = 3000;
            const startTime = Date.now();
            const startRotation = currentRotation;
            
            function animate() {
                const now = Date.now();
                const elapsed = now - startTime;
                const progress = Math.min(1, elapsed / duration);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
                drawWheel();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    spinning = false;
                    
                    remainingSpins--;
                    localStorage.setItem('spinRemaining', remainingSpins);
                    
                    const couponCode = savePrize(selected);
                    
                    if (selected.value === 0) {
                        if (discountValue) discountValue.innerHTML = "😢<br>TRY AGAIN";
                        if (couponCodeSpan) couponCodeSpan.textContent = "No luck this time! Try again!";
                        if (spinBtn) spinBtn.disabled = false;
                        updateSpinDisplay();
                    } else {
                        if (selected.value === "free") {
                            if (discountValue) discountValue.innerHTML = "🚚<br>FREE SHIPPING!";
                        } else {
                            if (discountValue) discountValue.innerHTML = `${selected.value}%<br>OFF!`;
                        }
                        if (couponCodeSpan) couponCodeSpan.textContent = couponCode;
                        if (spinBtn) spinBtn.disabled = true;
                        updateSpinDisplay();
                    }
                    
                    if (discountResult) discountResult.style.display = 'block';
                    if (discountResult) discountResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    
                    const resultBox = document.querySelector('.result-box');
                    if (resultBox) {
                        resultBox.style.animation = 'none';
                        setTimeout(() => {
                            resultBox.style.animation = 'bounce 0.5s ease';
                        }, 10);
                    }
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        const scrollIndicator = document.querySelector('.scroll-indicator');
        const wheelContainer = document.querySelector('.wheel-wrapper');
        
        if (scrollIndicator && wheelContainer) {
            scrollIndicator.addEventListener('click', function() {
                wheelContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            });
        }
        
        if (canvas && spinBtn) {
            drawWheel();
            spinBtn.addEventListener('click', spinWheel);
        }
    })();

    // Apply coupon from spin wheel
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', function() {
            const couponInput = document.getElementById('coupon-input');
            const enteredCode = couponInput?.value.trim().toUpperCase();
            
            const savedCoupon = localStorage.getItem('activeCoupon');
            if (savedCoupon) {
                const coupon = JSON.parse(savedCoupon);
                if (coupon.code === enteredCode) {
                    applyCouponDiscount(coupon);
                } else {
                    alert('Invalid coupon code');
                }
            } else {
                alert('No coupon available. Spin the wheel to win a discount!');
            }
        });
    }

    function applyCouponDiscount(coupon) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountAmount = 0;
        let discountText = '';
        
        if (coupon.type === 'percentage') {
            discountAmount = subtotal * (coupon.value / 100);
            discountText = `${coupon.value}% OFF`;
        } else if (coupon.type === 'free_shipping') {
            discountText = 'FREE SHIPPING';
            const shippingElem = document.getElementById('cart-shipping');
            if (shippingElem) shippingElem.innerHTML = '$0.00 <span style="color:green;">(FREE)</span>';
        }
        
        if (discountAmount > 0) {
            const discountRow = document.getElementById('cart-discount-row');
            const discountElem = document.getElementById('cart-discount');
            if (discountRow && discountElem) {
                discountRow.style.display = 'table-row';
                discountElem.textContent = `-$${discountAmount.toFixed(2)}`;
            }
            
            const total = subtotal - discountAmount + (coupon.type !== 'free_shipping' ? 5.99 : 0);
            const cartTotal = document.getElementById('cart-total');
            if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
        }
        
        alert(`Coupon applied: ${discountText}`);
    }

    // Fix hamburger menu toggle
    const mobileToggleBtn = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('nav');

    if (mobileToggleBtn && navMenu) {
        const newToggle = mobileToggleBtn.cloneNode(true);
        mobileToggleBtn.parentNode.replaceChild(newToggle, mobileToggleBtn);
        
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            navMenu.classList.toggle('active');
            this.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
        });
        
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                if (newToggle) newToggle.textContent = '☰';
            });
        });
    }

    // EmailJS initialization
    const EMAILJS_PUBLIC_KEY = '5g9Si30AG9AQZmtIJ';
    emailjs.init(EMAILJS_PUBLIC_KEY);
    
    // Update spinner visibility on load
    setTimeout(updateSpinnerVisibility, 100);
});
