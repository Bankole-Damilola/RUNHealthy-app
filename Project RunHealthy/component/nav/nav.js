// Toggle mobile menu
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

hamburgerBtn.addEventListener("click", () => {
    hamburgerBtn.classList.toggle("active");
    mobileMenu.classList.toggle("open");
});

// Close menu when clicking a link
mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        hamburgerBtn.classList.remove("active");
        mobileMenu.classList.remove("open");
    });
});

// Highlight active page
const currentPage = location.pathname.split("/").pop();

document.querySelectorAll("[data-page]").forEach(link => {
    if (link.getAttribute("data-page") === currentPage) {
        link.classList.add("active");
    }
});
