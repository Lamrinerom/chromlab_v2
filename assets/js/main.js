// Full product data for Chromlab/Biopex
let products = [
  { name: "Automatic Fraction Collector", full: "Automatic Fraction Collector CLFC-401", category: "Fraction Collectors", subcat: "Auto", img: "assets/images/products/automatic-fraction-collector.jpg" },
  { name: "Element Analyzer", full: "Element Analyzer CLEA-101", category: "Analyzers", subcat: "Element", img: "assets/images/products/element-analyzer.jpg" },
  { name: "Gas Chromatography", full: "Gas Chromatography CLGC-601", category: "Chromatography", subcat: "Gas", img: "assets/images/products/gas-chromatography.jpg" },
  { name: "Gas Chromatography Mass Spectrometry", full: "Gas Chromatograph-Mass Spectrometer CLGMS-601", category: "GC-MS", subcat: "Lab", img: "assets/images/products/gas-chromatography-mass-spectrometry-1737962764.jpg" },
  { name: "Ion Chromatograph", full: "Ion Chromatograph CLIC-601", category: "Chromatography", subcat: "Ion", img: "assets/images/products/ion-chromatograph-1737962696.jpg" },
  { name: "Liquid Chromatography", full: "Liquid Chromatography CLLC-601", category: "Chromatography", subcat: "Liquid", img: "assets/images/products/ion-chromatograph-1737962696.jpg" },
  { name: "Liquid Chromatography Mass Spectrometry", full: "Liquid Chromatograph Mass Spectrometer CLMS-601", category: "LC-MS", subcat: "Lab", img: "assets/images/products/liquid-chromatograph-mass-spectrometer-1737980133.jpg" },
  { name: "Portable GC-MS", full: "Portable GC-MS CLPCS-601", category: "Portable", subcat: "GC-MS", img: "assets/images/products/portable-gc-ms.jpg" },
  { name: "Portable Ion Chromatograph", full: "Portable Ion Chromatograph CLPIC-601", category: "Portable", subcat: "Ion", img: "assets/images/products/portable-ion-chromatograph.jpg" },
  { name: "TLC Scanner", full: "TLC Scanner CLTS-601", category: "Scanners", subcat: "TLC", img: "assets/images/products/tlc-scanner-1740127345.jpg" },
  { name: "Triple Quadrupole", full: "Triple Quadrupole GCMS CLTQC-601", category: "GC-MS", subcat: "Triple Quad", img: "assets/images/products/triple-quadrupole-gc-ms-1741694172.jpg" },
  // Add more models as needed...
];

// Elements
const searchInput = document.querySelector(".searchInput");
const input = document.querySelector("#labSearch");
const resultBox = document.querySelector(".resultBox");
const icon = document.querySelector(".icon");

// Rotating placeholders
const placeholders = [
  "Search lab equipment…", "Search centrifuge, oven…", "Search Chromlab instruments…",
  "Find GC-MS, HPLC…", "Explore lab products…", "Discover lab analyzers…", "TLC Scanner"
];
let phIndex = 0;
let phTimer = setInterval(rotatePlaceholder, 3000);

function rotatePlaceholder() {
  input.placeholder = placeholders[phIndex];
  phIndex = (phIndex + 1) % placeholders.length;
}

// Pause rotation on focus
input.addEventListener("focus", () => clearInterval(phTimer));
input.addEventListener("blur", () => phTimer = setInterval(rotatePlaceholder, 3000));

// Search functionality
input.onkeyup = (e) => {
  let userData = e.target.value.trim();
  let filtered = [];
  
  if (userData.length > 0) {
    filtered = products.filter((data) => 
      data.name.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase()) ||
      data.full.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase()) ||
      data.category.toLocaleLowerCase().includes(userData.toLocaleLowerCase())
    ).slice(0, 8); // Limit to 8 results
    
    if (filtered.length > 0) {
      let listData = filtered.map((data) => `
        <li class="suggestion-item" data-full="${data.full}">
          <img src="${data.img}" alt="${data.name}" class="suggestion-img" loading="lazy">
          <div class="suggestion-text">
            <div class="product-name">${data.name}</div>
            <small class="subtle">${data.category} › ${data.subcat}</small>
          </div>
        </li>
      `).join('');
      
      resultBox.innerHTML = listData;
      searchInput.classList.add("active");
      
      // Click handlers
      resultBox.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('mousedown', function(e) {
          e.preventDefault();
          e.stopPropagation();
          select(this);
        });
      });
    } else {
      resultBox.innerHTML = '<li class="no-result">No lab products found for "<strong>' + userData + '</strong>"</li>';
      searchInput.classList.add("active");
    }
  } else {
    searchInput.classList.remove("active");
  }
};

function select(element) {
  let fullName = element.getAttribute('data-full');
  input.value = fullName;
  searchInput.classList.remove("active");
  // Filter products or redirect
  console.log('🔍 Selected:', fullName);
  // Example: filterProducts(fullName); or window.location = `/products/${fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target)) {
    searchInput.classList.remove("active");
  }
});

// Icon click
icon.addEventListener('click', () => {
  if (input.value.trim()) {
    console.log('Search for:', input.value);
    // Perform search
  }
});

// ---------------------------------------------------------------------------bannee00000


 document.addEventListener('DOMContentLoaded', () => {
  const banners = document.querySelectorAll('.banner-item');
  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  const changeInterval = 7500;

  function showBanner(index) {
    // Update banners
    banners.forEach((banner, i) => {
      banner.classList.toggle('active', i === index);
    });
    
    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function nextBanner() {
    currentIndex = (currentIndex + 1) % banners.length;
    showBanner(currentIndex);
  }

  // Dot click handler
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      showBanner(currentIndex);
    });
  });

  showBanner(currentIndex);
  setInterval(nextBanner, changeInterval);
});

// ------------------------------------------Slider category


(function() {
  'use strict';
  
  const carousel = document.getElementById("carousel");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  let index = 0;
  let isTransitioning = false;
  let cardWidth = 0;

  function updateCardWidth() {
    cardWidth = carousel.children[0].offsetWidth;
  }

  const originalCards = Array.from(carousel.children);
  const originalCount = originalCards.length;

  // Clone original cards for infinite loop
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    carousel.appendChild(clone);
  });

  updateCardWidth();

  function updateCarousel() {
    carousel.style.transition = '0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    carousel.style.transform = `translateX(-${index * cardWidth}px)`;
    isTransitioning = true;
    setTimeout(() => { isTransitioning = false; }, 600);
  }

  function slideNext() {
    if (isTransitioning) return;
    index++;
    if (index >= originalCount) {
      updateCarousel();
      setTimeout(() => {
        carousel.style.transition = 'none';
        index = 0;
        carousel.style.transform = `translateX(0px)`;
        carousel.offsetHeight; // Trigger reflow
        carousel.style.transition = '0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        isTransitioning = false;
      }, 600);
    } else {
      updateCarousel();
    }
  }

  function slidePrev() {
    if (isTransitioning) return;
    if (index === 0) {
      carousel.style.transition = 'none';
      index = originalCount - 1;
      carousel.style.transform = `translateX(-${index * cardWidth}px)`;
      carousel.offsetHeight;
      carousel.style.transition = '0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      setTimeout(() => {
        index--;
        updateCarousel();
      }, 50);
    } else {
      index--;
      updateCarousel();
    }
  }

  nextBtn.addEventListener("click", slideNext);
  prevBtn.addEventListener("click", slidePrev);

  // Add drag to scroll support for desktop and touch devices
  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.parentElement.style.overflowX = 'auto';
  carousel.parentElement.style.scrollSnapType = 'x mandatory';

  carousel.parentElement.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carousel.parentElement.offsetLeft;
    scrollLeft = carousel.parentElement.scrollLeft;
  });

  carousel.parentElement.addEventListener('mouseleave', () => {
    isDown = false;
  });

  carousel.parentElement.addEventListener('mouseup', () => {
    isDown = false;
  });

  carousel.parentElement.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.parentElement.offsetLeft;
    const walk = (x - startX) * 2; //scroll-fast
    carousel.parentElement.scrollLeft = scrollLeft - walk;
  });

  // Touch events for mobile dragging
  carousel.parentElement.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX - carousel.parentElement.offsetLeft;
    scrollLeft = carousel.parentElement.scrollLeft;
  });

  carousel.parentElement.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - carousel.parentElement.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.parentElement.scrollLeft = scrollLeft - walk;
  });

  window.addEventListener('resize', () => {
    updateCardWidth();
    updateCarousel();
  });
})();

// ------------------------------------------Best seller section


document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.bs-carousel');
  const prevBtn = document.querySelector('.bs-prev');
  const nextBtn = document.querySelector('.bs-next');

  const card = carousel.querySelector('.bs-card');
  const cardWidth = () => card.getBoundingClientRect().width + 16; // 16 = gap

  let holdInterval = null;

  function scrollByCards(direction) {
    carousel.scrollBy({ left: direction * cardWidth(), behavior: 'smooth' });
  }

  // Click scroll
  prevBtn.addEventListener('click', () => scrollByCards(-1));
  nextBtn.addEventListener('click', () => scrollByCards(1));

  // Hold to slide
  function startHold(direction) {
    if (holdInterval) return;
    holdInterval = setInterval(() => {
      carousel.scrollBy({ left: direction * 10, behavior: 'auto' });
    }, 16);
  }
  function stopHold() {
    clearInterval(holdInterval);
    holdInterval = null;
  }

  ['mousedown', 'touchstart'].forEach(ev => {
    prevBtn.addEventListener(ev, e => { e.preventDefault(); startHold(-1); });
    nextBtn.addEventListener(ev, e => { e.preventDefault(); startHold(1); });
  });
  ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(ev => {
    prevBtn.addEventListener(ev, stopHold);
    nextBtn.addEventListener(ev, stopHold);
  });

  // Optional: drag to slide
  let isDown = false, startX, scrollLeft;
  carousel.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });
  window.addEventListener('mouseup', () => isDown = false);
  carousel.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeft - walk;
  });
});
// -------------------------------------------Best seller

$(document).ready(function() {
    $('.slick-carousel').slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        infinite: true,
        arrows: true, // Enable navigation arrows
        autoplay: true,
        autoplaySpeed: 2500, // Slide every 2.5 seconds (customize as needed)
        // prevArrow: '<button type="button" class="slick-prev" style="background: #1d297c; color: #fff; border: none; border-radius: 18px; width: 36px; height: 36px; font-size: 20px; position: absolute; top: 45%; left: -40px; z-index: 3;"></button>',
        // nextArrow: '<button type="button" class="slick-next" style="background: #1d297c; color: #fff; border: none; border-radius: 18px; width: 36px; height: 36px; font-size: 20px; position: absolute; top: 45%; right: -40px; z-index: 3;"></button>',
        responsive: [
           {
                breakpoint: 1400,
                settings: { slidesToShow: 6 }
            },
            {
                breakpoint: 1200,
                settings: { slidesToShow: 3 }
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 2 }
            }
        ]
    });
});


