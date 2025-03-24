
function checkAndShowBanner() {
    if (!localStorage.getItem('uniqueBannerDismissed')) {
        document.getElementById('custom-notification-banner').style.display = 'block';
    }
}

function dismissCustomBanner() {
    localStorage.setItem('uniqueBannerDismissed', 'true');
    document.getElementById('custom-notification-banner').style.display = 'none';
}


document.addEventListener("DOMContentLoaded", checkAndShowBanner);
