function closeModals(event) {
    if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
    }
    const modals = document.querySelectorAll('.modal-overlay.show, .modal-overlay.active');
    modals.forEach(modal => {
        modal.classList.remove('show', 'active');
    });
    document.body.style.overflow = '';
}

function openModal(modalId) {
    const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function showModal(modalId) {
    openModal(modalId);
}

window.closeModals = closeModals;
window.openModal = openModal;
window.showModal = showModal;

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals(e);
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('modal-overlay')) {
            closeModals(e);
        }
    });
});