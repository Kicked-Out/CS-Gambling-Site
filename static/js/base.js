window.addEventListener("scroll", function() {
    var header = document.getElementById("myHeader");
    var headerOffset = header.offsetTop; // Відстань header від верху сторінки

    if (window.pageYOffset > headerOffset) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
});