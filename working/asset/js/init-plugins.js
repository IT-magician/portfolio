// Initialize all plugins after DOM is ready
function initializePlugins() {
    // Swiper is now initialized in activities-vue-app.js
    
    // GSAP animations
    if (typeof gsap !== 'undefined') {
        gsap.from(".nav_item", {
            opacity: 0,
            duration: 1,
            delay: .1,
            y: -60,
            stagger: .2
        });
        
        gsap.from(".home_img", {
            opacity: 0,
            duration: 2,
            delay: .5,
            x: 60
        });
    }
    
    // ScrollReveal animations
    if (typeof ScrollReveal !== 'undefined') {
        ScrollReveal().reveal('.nav_logo', {
            distance: '-50px',
            delay: 100,
            duration: 500,
        });
        
        ScrollReveal().reveal('.home_social-icon', {
            origin: 'left',
            distance: '50px',
            delay: 100,
            duration: 750,
            reset: true,
        });
        
        ScrollReveal().reveal('.home_greeting', {
            distance: '50px',
            delay: 100,
            duration: 500,
            reset: true,
        });
        
        ScrollReveal().reveal('.home_name', {
            distance: '50px',
            delay: 200,
            duration: 500,
            reset: true,
        });
        
        ScrollReveal().reveal('.home_profession', {
            distance: '50px',
            delay: 300,
            duration: 500,
            reset: true,
        });
        
        ScrollReveal().reveal('#about .about_description', {
            distance: '50px',
            delay: 150,
            duration: 500,
            reset: true,
        });
        
        ScrollReveal().reveal('.about_number', {
            distance: '50px',
            delay: 150,
            duration: 500,
            reset: true,
        });
        
        ScrollReveal().reveal('.qualification_container', {
            distance: '50px',
            delay: 175,
            duration: 500,
            reset: true,
        });
        
        ScrollReveal().reveal('.skills_data', {
            distance: '100px',
            delay: 200,
            duration: 500,
            reset: true,
        });
        
        ScrollReveal().reveal('.portfolio_content', {
            distance: '100px',
            delay: 225,
            duration: 500,
        });
    }
    
    // Initialize Skills modal handler
    initializeSkillsModal();
}

// Skills modal handler
function initializeSkillsModal() {
    document.querySelectorAll('.skills_data').forEach(btn => {
        const details = btn.querySelector('.skills_description_detail');
        if (!details || details.innerHTML.trim().replace(/<!--.*?-->/g, "") == "") return;

        btn.style.cursor = 'pointer';

        btn.addEventListener('click', function () {
            if (typeof tingle !== 'undefined') {
                var myModal = new tingle.modal({
                    onClose: null,
                    onOpen: null,
                    beforeOpen: null,
                    beforeClose: null,
                    stickyFooter: false,
                    footer: false,
                    cssClass: [],
                    closeLabel: 'Close',
                    closeMethods: ['overlay', 'button', 'escape'],
                });

                myModal.setContent(details.innerHTML);
                myModal.open();
            }
        });
    });
}

// Browser compatibility check
window.addEventListener("load", (e) => {
    if (navigator.userAgent.toLowerCase().indexOf("chrome") == -1) {
        alert("Chrome이 아닌 브라우저는 제대로 동작하지 않을 수 있습니다.");
    }
});

// Initialize plugins after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializePlugins, 500);
    });
} else {
    setTimeout(initializePlugins, 500);
}