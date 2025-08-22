// Vue 3 Application
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            // Profile & Navigation
            profile: profileData,
            navigation: navigationData,
            about: aboutData,
            footer: footerData,
            
            // Sections Data
            portfolio: portfolioData,
            skills: skillsData,
            activities: activitiesData,
            qualification: qualificationData,
            
            // UI State
            currentFilter: 'all',
            selectedProject: null,
            isMenuOpen: false,
            swiperInstance: null
        };
    },
    
    computed: {
        filteredProjects() {
            if (this.currentFilter === 'all') {
                return this.portfolio.projects;
            }
            return this.portfolio.projects.filter(project => 
                project.category.includes(this.currentFilter.substring(1))
            );
        }
    },
    
    methods: {
        showProjectDetails(project) {
            this.selectedProject = project;
            document.body.style.overflow = 'hidden';
        },
        
        closeProjectDetails() {
            this.selectedProject = null;
            document.body.style.overflow = '';
        },
        
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },
        
        initSwiper() {
            this.$nextTick(() => {
                this.swiperInstance = new Swiper('.activities_container', {
                    spaceBetween: 16,
                    grabCursor: true,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    breakpoints: {
                        640: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        }
                    }
                });
            });
        },
        
        initScrollReveal() {
            const sr = ScrollReveal({
                origin: 'top',
                distance: '60px',
                duration: 2500,
                delay: 400,
                reset: false
            });
            
            sr.reveal('.home_data, .about_img, .skills_subtitle, .skills_text');
            sr.reveal('.home_img, .about_subtitle, .about_text, .skills_img', {delay: 500});
            sr.reveal('.home_social-icon', {interval: 200});
            sr.reveal('.skills_data, .portfolio_content, .activities_content', {interval: 200});
        }
    },
    
    mounted() {
        // Initialize Swiper
        this.initSwiper();
        
        // Initialize ScrollReveal
        this.initScrollReveal();
        
        // Initialize MixItUp (if needed for compatibility)
        if (typeof mixitup !== 'undefined') {
            // MixItUp will be replaced with Vue filtering
            // Keep for backward compatibility if needed
        }
        
        // Handle scroll events
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (window.scrollY >= 200) {
                header.classList.add('scroll-header');
            } else {
                header.classList.remove('scroll-header');
            }
        });
        
        // Close modal on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.selectedProject) {
                this.closeProjectDetails();
            }
        });
    },
    
    components: {
        PortfolioItem,
        ProjectDetail,
        SkillCard,
        ActivityCard,
        QualificationTimeline
    }
});

app.mount('#app');