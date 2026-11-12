const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");

if (menuButton && navigation) {
  const dropdowns = Array.from(navigation.querySelectorAll(".nav-dropdown"));

  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    dropdowns.forEach((dropdown) => dropdown.removeAttribute("open"));
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown.open && !dropdown.contains(event.target)) {
        dropdown.removeAttribute("open");
      }
    });
  });

  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("toggle", () => {
      if (!dropdown.open) return;
      dropdowns.forEach((other) => {
        if (other !== dropdown) other.removeAttribute("open");
      });
    });
  });
}

const currentPage = document.body.dataset.page;
const currentNavigationLink = document.querySelector(
  `[data-nav-page="${currentPage}"]`
);

if (currentNavigationLink) {
  currentNavigationLink.setAttribute("aria-current", "page");
}

document.querySelectorAll("[data-nav-pages]").forEach((link) => {
  const pages = link.dataset.navPages.split(" ");
  if (pages.includes(currentPage)) {
    link.setAttribute("aria-current", "page");
  }
});

const tabList = document.querySelector("[role='tablist']");

if (tabList) {
  const tabs = Array.from(tabList.querySelectorAll("[role='tab']"));
  const panels = Array.from(document.querySelectorAll("[role='tabpanel']"));

  const selectTab = (selectedTab, updateAddress = false) => {
    tabs.forEach((tab) => {
      const selected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== selectedTab.getAttribute("aria-controls");
    });

    if (updateAddress) {
      const panelId = selectedTab.getAttribute("aria-controls");
      window.history.replaceState(null, "", `#${panelId}`);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab, true));

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      selectTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

  const selectTabFromAddress = () => {
    const panelId = window.location.hash.slice(1);
    const matchingTab = tabs.find(
      (tab) => tab.getAttribute("aria-controls") === panelId
    );

    if (matchingTab) {
      selectTab(matchingTab);
    }
  };

  selectTabFromAddress();
  window.addEventListener("hashchange", selectTabFromAddress);
}

const cardSlider = document.querySelector("[data-card-slider]");

if (cardSlider) {
  const viewport = cardSlider.querySelector(".card-slider-viewport");
  const slides = Array.from(cardSlider.querySelectorAll("[data-slide]"));
  const dots = Array.from(cardSlider.querySelectorAll(".card-slider-dots button"));
  const previousButton = cardSlider.querySelector("[data-slider-prev]");
  const nextButton = cardSlider.querySelector("[data-slider-next]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentSlide = 0;
  let timer;

  const updateDots = () => {
    dots.forEach((dot, index) => {
      if (index === currentSlide) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const showSlide = (index, behavior = "smooth") => {
    currentSlide = (index + slides.length) % slides.length;
    viewport.scrollTo({ left: viewport.clientWidth * currentSlide, behavior });
    updateDots();
  };

  const stopAutoPlay = () => window.clearInterval(timer);
  const startAutoPlay = () => {
    stopAutoPlay();
    if (reducedMotion.matches) return;
    timer = window.setInterval(() => showSlide(currentSlide + 1), 5000);
  };

  previousButton?.addEventListener("click", () => {
    showSlide(currentSlide - 1);
    startAutoPlay();
  });

  nextButton?.addEventListener("click", () => {
    showSlide(currentSlide + 1);
    startAutoPlay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startAutoPlay();
    });
  });

  let scrollTimer;
  viewport.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const width = viewport.clientWidth || 1;
      currentSlide = Math.round(viewport.scrollLeft / width);
      updateDots();
    }, 80);
  });

  cardSlider.addEventListener("mouseenter", stopAutoPlay);
  cardSlider.addEventListener("mouseleave", startAutoPlay);
  cardSlider.addEventListener("focusin", stopAutoPlay);
  cardSlider.addEventListener("focusout", startAutoPlay);
  reducedMotion.addEventListener("change", startAutoPlay);
  window.addEventListener("resize", () => showSlide(currentSlide, "auto"));
  startAutoPlay();
}
