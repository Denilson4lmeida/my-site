document.addEventListener("DOMContentLoaded", function () {
    const linkInicio = document.querySelector("a[href='painel.html']");

    if (linkInicio) {
        linkInicio.addEventListener("click", function (event) {
            if (window.location.href.includes("painel.html") || window.location.pathname === "/") {
                event.preventDefault();
                alert("Já está na página!");
            }
        });
    }
});

document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('nav ul').classList.toggle('active');
});
