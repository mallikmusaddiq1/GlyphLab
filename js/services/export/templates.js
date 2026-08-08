function getHTMLHeader() {
    var e = window.EXPORT_TEMPLATES || {};
    return (e.header || "").replace("%EXPORT_CSS%", () => (e.css || ""))
}

function getHTMLFooter(e = !1) {
    var t = window.EXPORT_TEMPLATES || {},
        a = (window.EXPORT_DOC_PNG_SCRIPT || "") + (window.EXPORT_DOC_SCRIPT_CONTENT || "");
    return (t.footer || "").replace("%EXPORT_JS%", () => (e ? "" : a))
}