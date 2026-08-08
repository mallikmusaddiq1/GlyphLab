document.addEventListener("DOMContentLoaded", () => {
    localforage.getItem("GLYPH_FAB_STATE").then((e) => {
        if (e) {
            let menu = $("fabMenu"),
                main = $("fabMain");
            if (menu) menu.classList.add("active");
            if (main) main.classList.add("active");
        }
    });

    let t = $("toast");
    if (t) {
        new MutationObserver(() => {
            if (t.innerText.includes("!")) t.innerText = t.innerText.replace(/!/g, "");
        }).observe(t, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    let touchTime = 0;
    document.addEventListener(
        "touchend",
        (e) => {
            let currentTime = new Date().getTime();
            if (currentTime - touchTime <= 300 && e.cancelable) e.preventDefault();
            touchTime = currentTime;
        },
        false
    );
});