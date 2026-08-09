var gridElement = document.getElementById("symbolGrid"),
    scrollArea = document.getElementById("scrollArea"),
    jumpHex = document.getElementById("jumpHex"),
    jumpDec = document.getElementById("jumpDec"),
    charInput = document.getElementById("charInput"),
    hideCheckbox = document.getElementById("hideUnrendered"),
    liveUpdateCheck = document.getElementById("liveUpdateCheck"),
    draftArea = document.getElementById("draftArea"),
    detailsModal = document.getElementById("unifiedModal"),
    uniModalTitle = document.getElementById("uniModalTitle"),
    detailsWrapper = document.getElementById("detailsWrapper"),
    transformWrapper = document.getElementById("transformWrapper"),
    detailsContent = document.getElementById("detailsContent"),
    transformContent = document.getElementById("transformContent"),
    tInput = document.getElementById("tInput"),
    fontSearch = document.getElementById("fontSearch"),
    filtersMenu = document.getElementById("filtersMenu"),
    categorySearch = document.getElementById("categorySearch"),
    shortcutsContainer = document.getElementById("shortcutsContainer"),
    sidebar = document.getElementById("sidebar"),
    panelToolSearch = document.getElementById("panelToolSearch"),
    panelToolJump = document.getElementById("panelToolJump"),
    panelToolDraft = document.getElementById("panelToolDraft"),
    tabToolSearch = document.getElementById("tabToolSearch"),
    tabToolJump = document.getElementById("tabToolJump"),
    tabToolDraft = document.getElementById("tabToolDraft"),
    btnSmartSearch = document.getElementById("btnSmartSearch"),
    btnRawSearch = document.getElementById("btnRawSearch"),
    wrapSearchCheck = document.getElementById("wrapSearchCheck");

var defaultCardsToLoad = 40,
    currentTopHex = 33,
    currentBottomHex = 33,
    MAX_UNICODE = 1114111,
    visibilityCache = new Map(),
    listData = [],
    cardPool = [],
    isFetching = false,
    currentFetchId = 0,
    gridCols = 3,
    itemWidth = 130,
    itemHeight = 188.5,
    GAP = 12;

var canvas = document.createElement("canvas");
canvas.width = 16;
canvas.height = 16;

var ctx = canvas.getContext("2d", { willReadFrequently: true });
ctx.font = "14px sans-serif";
ctx.textBaseline = "top";
ctx.clearRect(0, 0, 16, 16);

var emptyData = new Uint32Array(ctx.getImageData(0, 0, 16, 16).data.buffer);
ctx.fillText(String.fromCodePoint(1114111), 0, 0);
var tofuData = new Uint32Array(ctx.getImageData(0, 0, 16, 16).data.buffer);

var activeFilters = new Map(),
    pendingFilterItems = [],
    isFilterMode = false,
    isJumping = false,
    hlWord = false,
    fTO, 
    rTO,
    currentDetailExportData = null,
    bookmarks = new Set(),
    currentBkmTab = "SINGLE",
    currentFilterTab = "SINGLE",
    COMBINED_GROUPS = {},
    COMBINED_CAT_MAP = {},
    unicodeNames = {},
    unicodeDetailsData = {},
    U_BLOCKS = {},
    COMBINED_CHARS = {},
    fontCategories = {},
    APP_S = {},
    ast,
    isClearing = false,
    currentSearchMode = localStorage.getItem("glyphlab_search_mode") || "smart";

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        const actionEl = e.target.closest("[data-action]");
        if (!actionEl) return;
        
        const action = actionEl.dataset.action;
        if (action === "copy" && typeof copyText === "function") {
            copyText(actionEl.dataset.payload, actionEl.dataset.type);
        } else if (action === "draft" && typeof appendToDraft === "function") {
            appendToDraft(actionEl.dataset.payload);
        } else if (action === "details" && typeof openDetails === "function") {
            openDetails(Number(actionEl.dataset.cp));
        } else if (action === "combinedDetails" && typeof openCombinedDetails === "function") {
            openCombinedDetails(actionEl.dataset.str, actionEl.dataset.name);
        } else if (action === "toggleFilter" && typeof toggleFilter === "function") {
            toggleFilter(actionEl.dataset.id, actionEl.dataset.name);
        } else if (action === "closeModal" && typeof closeModals === "function") {
            closeModals();
        }
    });
});
