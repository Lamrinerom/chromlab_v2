let cart = [];
let cartOffcanvasInstance = null; 
// Initialize cart functionality
document.addEventListener('DOMContentLoaded', function() {
  setupProductQuantityControls();
  // Add to cart button event listeners - ALL TYPES
  const allCartButtons = document.querySelectorAll('.btn.cart, .qvcart-btn, .add-to-cart');
  
  allCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      addToCart(this);
    });
  });
    // Fix: Event delegation for dynamic cart buttons (no more onclick issues)
    document.getElementById('cartItemsContainer')?.addEventListener('click', function(e) {
        if (e.target.closest('.cart-qty-btn')) {
            const itemId = parseInt(e.target.closest('.cart-item').dataset.itemId);
            const change = e.target.classList.contains('minus') ? -1 : 1;
            updateQuantity(itemId, change);
            e.stopPropagation();
        } else if (e.target.closest('.remove-item')) {
            const itemId = parseInt(e.target.closest('.cart-item').dataset.itemId);
            removeItem(itemId);
            e.stopPropagation();
        }
    });
  updateCartDisplay();
});
// NEW: Setup quantity controls on product description pages
function setupProductQuantityControls() {
  // Handle plus/minus buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('qty-plus')) {
      e.preventDefault();
      const input = e.target.previousElementSibling;
      let val = parseInt(input.value) || 1;
      if (val < parseInt(input.max)) {
        input.value = val + 1;
      }
    } else if (e.target.classList.contains('qty-minus')) {
      e.preventDefault();
      const input = e.target.nextElementSibling;
      let val = parseInt(input.value) || 1;
      if (val > parseInt(input.min)) {
        input.value = val - 1;
      }
    }
  });

  // Handle direct input changes
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('qty-input')) {
      let val = parseInt(e.target.value) || 1;
      const min = parseInt(e.target.min) || 1;
      const max = parseInt(e.target.max) || 99;
      if (val < min) val = min;
      if (val > max) val = max;
      e.target.value = val;
    }
  });
}

// Global backdrop cleanup
document.addEventListener('click', function(e) {
    // Clean up any lingering backdrops
    document.querySelectorAll('.offcanvas-backdrop').forEach(backdrop => {
        if (!document.querySelector('.offcanvas.show')) {
            backdrop.remove();
        }
    });
});
function addToCart(button) {
  // Get closest addtocart container to find quantity input
  const addToCartContainer = button.closest('.addtocart') || button.closest('.product-qty')?.parentElement;
  let quantity = 1;
  
  if (addToCartContainer) {
    const qtyInput = addToCartContainer.querySelector('.qty-input');
    quantity = parseInt(qtyInput?.value) || 1;
  }
  const productName = button.getAttribute('data-product-name');
  const productImg = button.getAttribute('data-product-img');
  const productPrice = parseFloat(button.getAttribute('data-product-price'));

  if (!productName || !productImg || isNaN(productPrice)) {
    console.error('Missing data attributes on Add to Cart button');
    return;
  }

  // Check if product already exists in cart
  const existingItem = cart.find(item => item.name === productName);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: Date.now(),
      name: productName,
      img: productImg,
      price: productPrice,
      quantity: quantity
    });
  }

  updateCartDisplay();
  showCartOffcanvas();

  // Visual feedback
  button.style.transform = 'scale(0.95)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 150);
}

function showCartOffcanvas() {
    const offcanvasEl = document.getElementById('offcanvasCart');
    if (!offcanvasEl) return;

    // Clean any existing backdrops first
    document.querySelectorAll('.offcanvas-backdrop').forEach(backdrop => backdrop.remove());

    // Use single instance or create new
    if (cartOffcanvasInstance && cartOffcanvasInstance._isShown) {
        cartOffcanvasInstance.hide();
        setTimeout(() => {
            cartOffcanvasInstance.show();
        }, 100);
    } else {
        cartOffcanvasInstance = new bootstrap.Offcanvas(offcanvasEl, {
            backdrop: true,
            keyboard: true
        });
        cartOffcanvasInstance.show();
    }

    // Listen for hide event to clean up
    offcanvasEl.addEventListener('hidden.bs.offcanvas', function cleanup() {
        document.querySelectorAll('.offcanvas-backdrop').forEach(backdrop => backdrop.remove());
        offcanvasEl.removeEventListener('hidden.bs.offcanvas', cleanup);
    }, { once: true });
}


function updateCartDisplay() {
  const cartContainer = document.getElementById('cartItemsContainer');
  const cartCount = document.getElementById('cartCount');
  const cartFooter = document.querySelector('.cart-footer');
  const cartTotal = document.getElementById('cartTotal');

  if (!cartContainer || !cartCount || !cartFooter || !cartTotal) {
    console.error('Cart elements not found in DOM');
    return;
  }

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

  if (totalItems === 0) {
    // Show empty cart
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <i class="hgi hgi-stroke hgi-shopping-cart-remove-01" 
          style="font-size: 100px;
          color: #ccc;
          display: block;
          margin: 0 auto;
          text-align: center;">
        </i>
        <p class="emptycart">Your cart is empty</p>
        <div class="shopnow"><a href="index.html">Shop Now</div>
      </div>
    `;
    cartFooter.style.display = 'none';
  } else {
    // Render each cart item
    const itemsHtml = cart.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="remove-item" onclick="removeItem(${item.id})"><i class="hgi hgi-stroke hgi-delete-02"></i></div>
        <img src="${item.img}" class="cart-img" alt="${item.name}">
        <div class="cart-details">
          <div class="cart-name">${item.name}</div>
          <div class="r-qunt">
            <div class="cart-price">$${item.price.toFixed(2)}</div>
            <div class="quantity-controls">
              <button class="cart-qty-btn minus" onclick="updateQuantity(${item.id}, -1)">-</button>
              <span class="qty">${item.quantity}</span>
              <button class="cart-qty-btn plus" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
          </div>
          <div class="subtotal">
            Subtotal: $${(item.price * item.quantity).toFixed(2)}
          </div>
        </div>
      </div>
    `).join('');

    cartContainer.innerHTML = itemsHtml;

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
    cartFooter.style.display = 'block';
  }
}

function updateQuantity(itemId, change) {
  const item = cart.find(item => item.id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeItem(itemId);
    } else {
      updateCartDisplay();
    }
  }
}

function removeItem(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  updateCartDisplay();
}

// --------------------------------------------Wishlist

let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let wishlistDropdownOpen = false;

document.addEventListener('DOMContentLoaded', function() {
    // Wishlist card button event listeners
    document.querySelectorAll('.btn.view, .qvwish').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // keep dropdown from closing
            addToWishlist(this, { openDropdown: true });
        });
    });

    // Header wishlist toggle
    const toggleEl = document.getElementById('wishlistToggle');
    if (toggleEl) {
        toggleEl.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlistDropdown();
        });
    }

    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#wishlistToggle') && !e.target.closest('.wishlist-dropdown')) {
            closeWishlistDropdown();
        }
    });

    // Keep clicks inside dropdown from closing it
    const dropdown = document.getElementById('wishlistDropdown');
    if (dropdown) {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Restore tooltip state for already-wishlisted items
    document.querySelectorAll('.btn.view').forEach(button => {
        const name = button.getAttribute('data-product-name');
        const exists = wishlist.find(item => item.name === name);
        if (exists) {
            button.style.color = '#dc3545';
            button.setAttribute('data-tip', 'Added');
            button.setAttribute('title', 'Added in Wishlist');
        }
    });

    updateWishlistDisplay();
});

function addToWishlist(button, options = {}) {
    const productName = button.getAttribute('data-product-name');
    const productImg = button.getAttribute('data-product-img');
    const productPrice = parseFloat(button.getAttribute('data-product-price'));

    if (!productName || !productImg || isNaN(productPrice)) {
        console.error('Missing wishlist data attributes');
        return;
    }

    const existingItem = wishlist.find(item => item.name === productName);
    
    if (existingItem) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.name !== productName);
        button.style.color = '#097bd9';          // Reset icon color
        button.style.backgroundColor = '#bdddf8';
        button.setAttribute('data-tip', 'Wishlist');
        button.setAttribute('title', 'Add to Wishlist');
    } else {
        // Add to wishlist
        wishlist.push({
            id: Date.now(),
            name: productName,
            img: productImg,
            price: productPrice,
            addedAt: new Date().toISOString()
        });
        button.style.color = '#dc3545';          // Active icon color
        button.setAttribute('data-tip', 'Added');
        button.setAttribute('title', 'Added');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    updateWishlistDisplay();

    // 1) When clicking wishlist button, also show dropdown
    if (options.openDropdown) {
        openWishlistDropdown();
    }

    // Visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

function updateWishlistDisplay() {
    const wishlistContainer = document.getElementById('wishlistItemsContainer');
    const wishlistCount = document.getElementById('wishlistCount');
    const wishlistTotalCount = document.getElementById('wishlistTotalCount');
    const wishlistFooter = document.querySelector('.wishlist-footer');

    if (!wishlistContainer || !wishlistCount || !wishlistTotalCount || !wishlistFooter) return;

    const totalItems = wishlist.length;
    
    wishlistCount.textContent = totalItems;
    wishlistCount.style.display = totalItems > 0 ? 'flex' : 'none';
    wishlistTotalCount.textContent = totalItems;

    if (totalItems === 0) {
        wishlistContainer.innerHTML = `
            <div class="wishlist-empty">
                <i class="hgi hgi-stroke hgi-heart-remove"></i>
                <p>Your wishlist is empty</p>
                <small>Add items to your wishlist for quick access</small>
            </div>
        `;
        wishlistFooter.style.display = 'none';
    } else {
        wishlistContainer.innerHTML = wishlist.map(item => `
            <div class="wishlist-item" data-id="${item.id}">
                <img src="${item.img}" class="wishlist-img" alt="${item.name}">
                <div class="wishlist-details">
                    <div class="wishlist-name">${item.name}</div>
                    <div class="wishlist-price">$${item.price.toFixed(2)}</div>
                    <div class="wishlist-actions">
                        <button class="wishlist-btn wishdelete" onclick="removeFromWishlist(${item.id}); event.stopPropagation();"><i class="hgi hgi-stroke hgi-delete-02"></i></button>
                        <a href="productdescription.html" class="wishlist-btn wishview">View</a>
                    </div>
                </div>
            </div>
        `).join('');
        wishlistFooter.style.display = 'block';
    }
}

function toggleWishlistDropdown() {
    if (wishlistDropdownOpen) {
        closeWishlistDropdown();
    } else {
        openWishlistDropdown();
    }
}

function openWishlistDropdown() {
    const dropdown = document.getElementById('wishlistDropdown');
    if (!dropdown) return;
    dropdown.classList.add('show');
    document.body.classList.add('dropdown-open');
    wishlistDropdownOpen = true;
    updateWishlistDisplay();
}

function closeWishlistDropdown() {
    const dropdown = document.getElementById('wishlistDropdown');
    if (!dropdown) return;
    dropdown.classList.remove('show');
    document.body.classList.remove('dropdown-open');
    wishlistDropdownOpen = false;
}

function removeFromWishlist(itemId) {
    wishlist = wishlist.filter(item => item.id !== itemId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistDisplay();

    // 2) Keep dropdown open after removing
    openWishlistDropdown();

    // Reset related card button tooltip/color if present
    const removedItem = wishlist.find(item => item.id === itemId);
    document.querySelectorAll('.btn.view').forEach(button => {
        const name = button.getAttribute('data-product-name');
        const exists = wishlist.find(item => item.name === name);
        if (!exists) {
            button.style.color = '#6c757d';
            button.setAttribute('data-tip', 'Wishlist');
            button.setAttribute('title', 'Wishlist');
        }
    });
}

// -----------------------------------------------------------------------------


document.addEventListener('DOMContentLoaded', function() {
  const topHeader = document.getElementById('topHeader');
  const mainContent = document.querySelector('.main-content');
  let headerHeight = 0;
  let ticking = false;

  // Measure header height once
  function measureHeader() {
    headerHeight = topHeader.offsetHeight;
    if (mainContent) {
      mainContent.style.paddingTop = headerHeight + 'px';
    }
  }

  // Toggle sticky state
  function updateSticky() {
    const scrollTop = window.scrollY;
    
    if (scrollTop > 10) {
      topHeader.classList.add('sticky');
    } else {
      topHeader.classList.remove('sticky');
    }
    
    ticking = false;
  }

  // Efficient scroll listener
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateSticky);
      ticking = true;
    }
  });

  // Initial measure
  measureHeader();
  window.addEventListener('resize', measureHeader);
});




// -----------------------------newupcate

// Data for categories and their products
const categoryData = {
  afc: {
    name: 'Automatic Fraction Collector',
    img: 'assets/images/products/automatic-fraction-collector.jpg',
    desc: 'Automatic Fraction Collector efficiently collects fractions from chromatographic separations with precise timing and volume control. It minimizes sample loss, improves reproducibility, and supports unattended operation, making it ideal for analytical, preparative, and research laboratories handling complex, high-throughput workflows in pharmaceuticals, biotechnology, environmental testing, and chemical analysis.',
    products: [
      {
        name: 'Automatic Fraction Collector CLFC-401',
        img: 'assets/images/products/automatic-fraction-collector.jpg',
        url: 'productdescription.html'
      }
    ]
  },
  ea: {
    name: 'Element Analyzer',
    img: 'assets/images/products/element-analyzer.jpg',
    desc: 'Element Analyzer precisely measures the elemental composition of solid, liquid, or gaseous samples. It delivers accurate, repeatable results for research, quality control, and regulatory testing across pharmaceuticals, environmental labs, and industry. Its advanced detection technology ensures reliable performance, simplified workflows, and fast analysis for complex materials.',
    products: [
      {
        name: 'Element Analyzer CLEA-101',
        img: 'assets/images/products/element-analyzer.jpg',
        url: 'product-elan-201.html'
      }
    ]
  },
  gcms: {
    name: 'Gas Chromatography Mass Spectrometry',
    img: 'assets/images/products/gas-chromatography-mass-spectrometry-1737962764.jpg',
    desc: 'Gas Chromatography Mass Spectrometry (GC‑MS) is an analytical technique that separates complex mixtures and identifies individual compounds with high sensitivity and specificity. It is widely used in pharmaceuticals, environmental analysis, forensics, food safety, and research for precise qualitative and quantitative chemical analysis.',
    products: [
      {
        name: 'Gas Chromatograph-Mass Spectrometer CLGMS-601',
        img: 'assets/images/products/gas-chromatography-mass-spectrometry-1737962764.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Gas Chromatograph-Mass Spectrometer CLGMS-602',
        img: 'assets/images/products/gas-chromatography-mass-spectrometry-1737962764.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  },
  gc: {
    name: 'Gas Chromatography',
    img: 'assets/images/products/gas-chromatography.jpg',
    desc: 'Gas Chromatography (GC) is an essential analytical technique for separating and analyzing volatile compounds in complex mixtures. It excels in environmental monitoring, food safety, pharmaceuticals, and forensics. GC systems deliver high-resolution separation with precise detection, enabling accurate identification and quantification of trace-level analytes efficiently.',
    products: [
      {
        name: 'Gas Chromatography CLGC-601',
        img: 'assets/images/products/gas-chromatography.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Gas Chromatography CLGC-602',
        img: 'assets/images/products/gas-chromatography.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  },
  ic: {
    name: 'Ion Chromatograph',
    img: 'assets/images/products/ion-chromatograph-1737962696.jpg',
    desc: 'Ion Chromatograph delivers precise separation and detection of ions in complex samples. Ideal for water quality analysis, environmental monitoring, and pharmaceutical testing, it features high sensitivity, automated sample injection, and robust columns for anions/cations. Ensure compliance with regulatory standards effortlessly.',
    products: [
      {
        name: 'Ion Chromatograph CLIC-601',
        img: 'assets/images/products/ion-chromatograph-1737962696.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Ion Chromatograph CLIC-602',
        img: 'assets/images/products/ion-chromatograph-1737962696.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Ion Chromatograph CLIC-603',
        img: 'assets/images/products/ion-chromatograph-1737962696.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Ion Chromatograph CLIC-604',
        img: 'assets/images/products/ion-chromatograph-1737962696.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Ion Chromatograph CLIC-605',
        img: 'assets/images/products/ion-chromatograph-1737962696.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  },
  lcms: {
    name: 'Liquid Chromatograph Mass Spectrometer',
    img: 'assets/images/products/liquid-chromatograph-mass-spectrometer-1737980133.jpg',
    desc: 'Liquid Chromatograph Mass Spectrometer (LC-MS) delivers unparalleled precision in analytical chemistry, separating complex mixtures via liquid chromatography and identifying compounds through high-resolution mass spectrometry. Ideal for pharmaceutical research, environmental monitoring, and food safety testing, it provides accurate molecular weight determination and structural elucidation for trace-level detection.',
    products: [
      {
        name: 'Liquid Chromatograph Mass Spectrometer CLMS-601',
        img: 'assets/images/products/liquid-chromatograph-mass-spectrometer-1737980133.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Liquid Chromatograph Mass Spectrometer CLMS-602',
        img: 'assets/images/products/liquid-chromatograph-mass-spectrometer-1737980133.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  },
  lc: {
    name: 'Liquid Chromatography',
    img: 'assets/images/products/liquid-chromatography-1738666603.jpg',
    desc: 'Liquid Chromatography is a powerful analytical technique separating complex mixtures based on molecular interactions with a stationary phase. Ideal for pharmaceutical analysis, protein purification, and environmental monitoring, it delivers high-resolution results with exceptional sensitivity and precision for modern laboratory workflows.',
    products: [
      {
        name: 'Liquid Chromatography CLLC-601',
        img: 'assets/images/products/liquid-chromatography-1738666603.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Liquid Chromatography CLLC-602',
        img: 'assets/images/products/liquid-chromatography-1738666603.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Liquid Chromatography CLLC-603',
        img: 'assets/images/products/liquid-chromatography-1738666603.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  },
  pgc: {
    name: 'Portable GC-MS',
    img: 'assets/images/products/portable-gc-ms.jpg',
    desc: 'Portable GC-MS delivers lab-grade performance in a compact, rugged design. Advanced gas chromatography separation with high-sensitivity mass spectrometry enables precise volatile compound analysis. Ideal for field environmental monitoring, food safety testing, and forensic investigations. Battery-powered operation ensures mobility without compromising accuracy or detection limits.',
    products: [
      {
        name: 'Portable GC-MS CLPCS-601',
        img: 'assets/images/products/portable-gc-ms.jpg',
        url: 'product-gcms-501.html'
      },
      {
        name: 'Portable GC-MS CLPCS-602',
        img: 'assets/images/products/portable-gc-ms.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  },
  pic: {
    name: 'Portable Ion Chromatograph',
    img: 'assets/images/products/portable-ion-chromatograph.jpg',
    desc: 'Portable Ion Chromatograph offers field-ready anion/cation analysis with compact design and high sensitivity. Features battery operation, touch-screen interface, and automated calibration for rapid water quality testing. Ideal for environmental monitoring, ideal for on-site ion detection in groundwater, wastewater, and process streams with lab-grade accuracy.',
    products: [
      {
        name: 'Portable Ion Chromatograph CLPIC-601',
        img: 'assets/images/products/portable-ion-chromatograph.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  },
  tlcs: {
    name: 'TLC Scanner',
    img: 'assets/images/products/tlc-scanner-1740127345.jpg',
    desc: 'TLC Scanner revolutionizes thin-layer chromatography analysis with high-resolution imaging and precise Rf value calculations. Compact design scans plates instantly, detecting compounds via UV/visible light. Ideal for pharmaceutical QC, forensics, and research labs—quantify spots, generate reports, and ensure reproducible results effortlessly. Advanced software integration elevates workflow efficiency.',
    products: [
      {
        name: 'TLC Scanner CLTS-601',
        img: 'assets/images/products/tlc-scanner-1740127345.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  },
  tq: {
    name: 'Triple Quadrupole ',
    img: 'assets/images/products/triple-quadrupole-gc-ms-1741694172.jpg',
    desc: 'Triple Quadrupole GC-MS systems deliver ultra-sensitive detection for trace-level analysis in complex matrices. Featuring three quadrupole analyzers for superior selectivity, multiple reaction monitoring (MRM), and high-resolution mass accuracy, they excel in pesticide screening, pharmaceutical impurities, and environmental contaminants with unmatched speed and precision.',
    products: [
      {
        name: 'Triple Quadrupole GCMS CLTQC-601',
        img: 'assets/images/products/triple-quadrupole-gc-ms-1741694172.jpg',
        url: 'product-gcms-501.html'
      }
    ]
  }
  // add more keys matching data-key attributes
};

document.addEventListener('DOMContentLoaded', function () {
  const categoryList = document.getElementById('categoryList');
  const cateImage   = document.getElementById('cateImage');
  const cateName    = document.getElementById('cateName');
  const cateDesc    = document.getElementById('cateDesc');
  const categoryBox = document.getElementById('categoryDisplay');
  const productList = document.getElementById('productList');

  function renderCategory(key) {
    const data = categoryData[key];
    if (!data) return;

    // fade out middle box then update then fade in
    categoryBox.classList.remove('active');
    setTimeout(() => {
      cateImage.src = data.img;
      cateImage.alt = data.name;
      cateName.textContent = data.name;
      cateDesc.textContent = data.desc;
      categoryBox.classList.add('active');
    }, 150);

    // render products on right column
    productList.innerHTML = data.products
      .map(p => `
        <li class="show">
          <div class="proimgup">
            <img src="${p.img}" alt="${p.name}">
          </div>
          <a href="${p.url}">${p.name}</a>
        </li>
      `)
      .join('');
  }

  // click + hover behaviour on left column
  categoryList.querySelectorAll('li').forEach(li => {
    const key = li.getAttribute('data-key');

    function activateCategory() {
      // update active state on left
      categoryList.querySelectorAll('li').forEach(item =>
        item.classList.remove('active')
      );
      li.classList.add('active');

      // update content
      renderCategory(key);
    }

    li.addEventListener('mouseenter', activateCategory);
    li.addEventListener('click', function (e) {
      e.preventDefault();
      activateCategory();
    });
  });

  // initial load: first active li
  const firstActive = categoryList.querySelector('li.active');
  if (firstActive) {
    renderCategory(firstActive.getAttribute('data-key'));
  }
});
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  const tabContent = document.getElementById('custometabcontent');
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
  tabContent.addEventListener('mousedown', (e) => {
    isDown = true;
    tabContent.style.cursor = 'grabbing';
    startX = e.pageX - tabContent.offsetLeft;
    scrollLeft = tabContent.scrollLeft;
  });
  
  tabContent.addEventListener('mouseleave', () => {
    isDown = false;
    tabContent.style.cursor = 'grab';
  });
  
  tabContent.addEventListener('mouseup', () => {
    isDown = false;
    tabContent.style.cursor = 'grab';
  });
  
  tabContent.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - tabContent.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed
    tabContent.scrollLeft = scrollLeft - walk;
  });
  
  // Touch support for mobile
  let startTouchX = 0;
  tabContent.addEventListener('touchstart', (e) => {
    startTouchX = e.touches[0].pageX - tabContent.offsetLeft;
    scrollLeft = tabContent.scrollLeft;
  });
  
  tabContent.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - tabContent.offsetLeft;
    const walk = (x - startTouchX) * 2;
    tabContent.scrollLeft = scrollLeft - walk;
  });
});
// ------------------------------------------------compare-----------

 document.addEventListener('DOMContentLoaded', function () {
  const compareList = document.getElementById('compareList');
  const emptyState = document.getElementById('emptyState');
  const compareActions = document.getElementById('compareActions');
  const countBadge = document.getElementById('countBadge');
  const offcanvasEl = document.getElementById('offcanvasBottom');
  const cancelBtn = offcanvasEl?.querySelector('.btn-close'); // X button

  const MAX_COMPARE = 4;
  let products = JSON.parse(localStorage.getItem('compareProducts') || '[]');

  let offcanvasInstance = null;

  renderProducts();

  // Toggle add/remove
  document.body.addEventListener('click', function (e) {
    const btn = e.target.closest('.card_compare');
    if (!btn) return;

    const id = btn.dataset.productId?.trim();
    const name = btn.dataset.productName?.trim();
    const img = btn.dataset.productImg?.trim();

    if (!id || !name || !img) return;

    const existingIndex = products.findIndex(p => p.id === id);
    
    if (existingIndex > -1) {
      products.splice(existingIndex, 1);
      btn.classList.remove('added');
    } else {
      if (products.length >= MAX_COMPARE) {
        showLimitToast();
        return;
      }
      products.push({ id, name, img });
      btn.classList.add('added');
    }

    saveProducts();
    renderProducts();
    openOffcanvas();
  });

  // **X BUTTON + OUTSIDE CLICK HANDLER**
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeOffcanvas();
    });
  }

  // Global backdrop click (outside offcanvas)
  document.addEventListener('click', function (e) {
    if (!offcanvasEl.contains(e.target) && offcanvasInstance?._isShown()) {
      const count = products.length;
      if (count === 0) { // Only close when empty
        closeOffcanvas();
      }
    }
  });

  // Remove from offcanvas
  compareList.addEventListener('click', function (e) {
    const removeBtn = e.target.closest('.remove-compare');
    if (!removeBtn) return;

    const id = removeBtn.dataset.id;
    products = products.filter(p => p.id !== id);
    
    const cardBtn = document.querySelector(`.card_compare[data-product-id="${id}"]`);
    if (cardBtn) cardBtn.classList.remove('added');
    
    saveProducts();
    renderProducts();
  });

  function renderProducts() {
    compareList.innerHTML = '';
    products.forEach(product => {
      if (!product.id || !product.name || !product.img) return;
      
      const item = document.createElement('div');
      item.className = 'compare-item d-flex align-items-center gap-2 p-2 border rounded bg-light flex-shrink-0';
      item.innerHTML = `
        <img src="${product.img}" alt="${product.name}" class="rounded shadow-sm" style="width:80px;height:80px;object-fit:cover;">
        <span class="com-pname fw-semibold flex-grow-1 text-truncate" style="max-width:160px;">${product.name}</span>
        <button type="button" class="btn btn-link btn-sm text-danger p-0 remove-compare fw-bold" data-id="${product.id}">×</button>
      `;
      compareList.appendChild(item);
    });
    updateDisplay();
  } 

  function updateDisplay() {
    const count = products.length;
    countBadge.textContent = count;
    if (count === 0) {
      emptyState.classList.remove('d-none');
      compareList.classList.add('d-none');
      compareActions.classList.add('d-none');
    } else {
      emptyState.classList.add('d-none');
      compareList.classList.remove('d-none');
      compareActions.classList.remove('d-none');
    }
  }

  function saveProducts() {
    localStorage.setItem('compareProducts', JSON.stringify(products));
  }

  function openOffcanvas() {
    if (!offcanvasInstance) {
      offcanvasInstance = new bootstrap.Offcanvas(offcanvasEl);
    }
    offcanvasInstance.show();
  }

  function closeOffcanvas() {
    if (offcanvasInstance && offcanvasInstance._isShown()) {
      offcanvasInstance.hide();
    }
  }

  // **BOOTSTRAP EVENT LISTENERS** (Reliable close)
  offcanvasEl.addEventListener('hidden.bs.offcanvas', function () {
    // Cleanup
    offcanvasInstance = null;
  });

  function showLimitToast() {
    const toastEl = document.getElementById('limitToast');
    if (toastEl) {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
});
// ------------------------------------------qv


document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.qview').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const target = this.getAttribute('data-target');
      const modalEl = document.querySelector(target);
      if (!modalEl) return;

      // start loading
      this.classList.add('loading');

      // small delay to show spinner
      setTimeout(() => {
        this.classList.remove('loading');

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }, 600); // change duration if needed
    });
  });
});


document.addEventListener('DOMContentLoaded', function () {
  // Find all slider containers
  document.querySelectorAll('.product-image-slider-container').forEach(container => {
    const slides = container.querySelectorAll('.qvimage-slide');
    const prevBtn = container.querySelector('.image-slider-prev');
    const nextBtn = container.querySelector('.image-slider-next');
    const dots = container.querySelectorAll('.dot');

    let currentSlide = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      currentSlide = index;
    }

    function nextSlide() {
      const next = (currentSlide + 1) % slides.length;
      showSlide(next);
    }

    function prevSlide() {
      const prev = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prev);
    }

    // Arrow events
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Dot events
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    // Touch swipe
    let startX = 0;
    container.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    });
    
    container.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    });

    // Auto play (optional)
    // setInterval(nextSlide, 4000);
  });
});

// ---------------------------------pbc
 // Simple dropdown/accordion behavior for sidebar categories [web:36][web:40]
        document.addEventListener("DOMContentLoaded", () => {
        const catButtons = document.querySelectorAll(".category-side-list .has-children");

        catButtons.forEach(btn => {
            btn.addEventListener("click", () => {
            // Close other open items (accordion style)
            catButtons.forEach(other => {
                if (other !== btn) {
                other.classList.remove("open");
                }
            });

            // Toggle current
            btn.classList.toggle("open");
            });
        });
        });
// ---------------------------------------------

 document.addEventListener("DOMContentLoaded", () => {
      const cards = document.querySelectorAll(".chrom-cards, .hor-card, .pbc-cards"); // all cards

      cards.forEach(card => {
        const tooltip = card.querySelector(".card-tooltip");
        const btns = card.querySelectorAll(".buttons-section .btn");

        if (!tooltip || !btns.length) return;

        btns.forEach(btn => {
          const text = btn.getAttribute("data-tip");

          btn.addEventListener("mouseenter", () => {
            tooltip.textContent = text;
            tooltip.classList.add("show");
          });

          btn.addEventListener("mouseleave", () => {
            tooltip.classList.remove("show");
          });
        });

        const buttonsSection = card.querySelector(".buttons-section");
        buttonsSection.addEventListener("mouseleave", () => {
          tooltip.classList.remove("show");
        });
      });
    });

// ---------------------------------------------------Loader

// JS to show loading cards then replace with real content
// Universal Multi-Tab Loading System
document.addEventListener('DOMContentLoaded', function() {
  // Handle ALL Bootstrap tabs automatically
  const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
  const tabPanes = document.querySelectorAll('.tab-pane, .tab-content > div');
  
  tabButtons.forEach(tabBtn => {
    tabBtn.addEventListener('shown.bs.tab', function(e) {
      const targetTabId = e.target.getAttribute('data-bs-target');
      const targetPane = document.querySelector(targetTabId);
      
      if (targetPane) {
        showLoadingForTab(targetPane);
      }
    });
  });
  
  // Initial active tab
  const activeTab = document.querySelector('.tab-pane.show.active, [aria-selected="true"]');
  if (activeTab) {
    showLoadingForTab(activeTab);
  }
});

function showLoadingForTab(tabPane) {
  // Find loading container and real content in this specific tab
  const loadingContainer = tabPane.querySelector('.loading-container');
  const realProducts = tabPane.querySelector('.real-products');
  
  if (!loadingContainer || !realProducts) return;
  
  // Reset states
  loadingContainer.style.display = 'flex';
  realProducts.style.display = 'none';
  realProducts.style.opacity = '0';
  
  // Generate fresh loading cards for this tab
  generateLoadingCardsForTab(loadingContainer);
  
  // Simulate load (replace with YOUR API call)
  setTimeout(() => {
    loadingContainer.style.display = 'none';
    realProducts.style.display = 'block';
    
    // Smooth fade-in
    realProducts.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      realProducts.style.opacity = '1';
    }, 50);
  }, 1500 + Math.random() * 1000); // Random 1.5-2.5s for realism
}

function generateLoadingCardsForTab(container, count = 6) {
  container.innerHTML = ''; // Clear previous
  
  for(let i = 0; i < count; i++) {
    const col = document.createElement('div');
    col.className = 'col-xl-3 col-lg-4 col-md-4 col-sm-6 mb-4';
    col.innerHTML = `
      <div class="chrom-cards loading-card">
        <div class="vert-btn loading-shimmer"></div>
        <div class="chrom-product-name">
          <div class="skeleton-text skeleton-title"></div>
        </div>
        <div class="chrom-img-section">
          <div class="chrom-slider">
            <div class="chrom-slides">
              <div class="chrom-slide skeleton-image"></div>
            </div>
          </div>
        </div>
        <div class="price-section">
          <div class="skeleton-text skeleton-price"></div>
        </div>
        <div class="specs-list">
          <div class="skeleton-text skeleton-spec"></div>
          <div class="skeleton-text skeleton-spec"></div>
          <div class="skeleton-text skeleton-spec"></div>
          <div class="skeleton-text skeleton-spec"></div>
        </div>
        
      </div>
    `;
    container.appendChild(col);
  }
}
// {
// <div class="buttons-section">
//           <div class="skeleton-button skeleton-explore"></div>
//           <div class="skeleton-button skeleton-cart"></div>
//         </div>}
// Replace setTimeout with your actual fetch
async function loadProductsForTab(tabId ) {
  try {
    const response = await fetch(`/api/products?category=${tabId}`);
    const products = await response.json();
    
    // Update real-products HTML with fetched data
    const realProducts = document.querySelector(`${tabId} .real-products`);
    realProducts.innerHTML = generateProductHTML(products);
    
  } catch (error) {
    console.error('Load failed:', error);
  }
}

// In showLoadingForTab(), replace setTimeout:
setTimeout(() => {
  loadProductsForTab(targetTabId);
}, 500);

// -------------------------------------------------

// -------------------------------------------megamenu

document.addEventListener('DOMContentLoaded', function() {
    // Close mega menu when clicking outside
    document.addEventListener('click', function(e) {
        const megamenu = document.querySelector('.megamenu-dropdown');
        const trigger = document.querySelector('.has-megamenu');
        
        if (!trigger.contains(e.target) && !megamenu.contains(e.target)) {
            megamenu.style.opacity = '0';
            megamenu.style.visibility = 'hidden';
        }
    });
    
    // Smooth scroll prevention
    const links = document.querySelectorAll('.megamenu-column a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {   
            // Add your analytics or smooth scroll here
        });
    });
});
// -----------------------------testimonials slider

// Unique carousel instance
const carouselId = 'uniqueTestimonialCarousel1';
const trackId = 'uniqueCarouselTrack1';
const prevBtnId = 'uniquePrevBtn1';
const nextBtnId = 'uniqueNextBtn1';
const dotsId = 'uniqueCarouselDots1';

class TestimonialCarousel {
    constructor(carouselId) {
        this.carousel = document.getElementById(carouselId);
        this.track = document.getElementById(trackId);
        this.slides = this.carousel.querySelectorAll('.carousel-slide');
        this.prevBtn = document.getElementById(prevBtnId);
        this.nextBtn = document.getElementById(nextBtnId);
        this.dotsContainer = document.getElementById(dotsId);
        this.currentSlide = 0;
        this.slideCount = this.slides.length;
        this.init();
    }

    init() {
        this.createDots();
        this.updateCarousel();
        this.bindEvents();
        // Auto-slide every 5 seconds
        this.autoSlide();
    }

    createDots() {
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.slideCount; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
        this.dots = this.dotsContainer.querySelectorAll('.dot');
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    updateCarousel() {
        // Remove active from all
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));

        // Add active to current
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');

        // Transform track (for multi-slide preview if needed)
        const translateX = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slideCount;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slideCount) % this.slideCount;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateCarousel();
    }

    autoSlide() {
        setInterval(() => {
            this.nextSlide();
        }, 8000);
    }
}

// Initialize
new TestimonialCarousel(carouselId);

  // ---------------------------Back to top

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('backToTop');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });
  
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});