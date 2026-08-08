function toggleFab() {
    let e = $("fabMenu"),
        t = $("fabMain"),
        n = e.classList.toggle("active");
    t.classList.toggle("active"), localforage.setItem("GLYPH_FAB_STATE", n)
}

function openFiltersFAB() {
    $("filtersMenu").classList.toggle("show")
}

function openTransformFAB() {
    "function" == typeof openTransform && openTransform()
}

function openBkmFAB() {
    "function" == typeof openBkm && openBkm()
}