// Runs in the head, before the page paints. It is a file, not an inline script, because the CSP in layout.html allows only 'self' scripts.
document.documentElement.classList.add('js');
try { if (localStorage.getItem('ewa-notes') === 'off') document.documentElement.classList.add('notes-off'); } catch (e) { /* storage blocked */ }
