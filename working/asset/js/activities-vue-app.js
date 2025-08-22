// Activities Vue Application
const activitiesApp = Vue.createApp({
    data() {
        return {
            activities: [],
            swiperInstance: null
        }
    },
    async mounted() {
        try {
            // Load activities data
            const response = await fetch('./asset/data/activities-data.json');
            const data = await response.json();
            this.activities = data.activities;
            
            // Initialize Swiper after data is loaded and DOM is updated
            this.$nextTick(() => {
                this.initSwiper();
            });
        } catch (error) {
            console.error('Error loading activities data:', error);
        }
    },
    methods: {
        initSwiper() {
            // Initialize Swiper if not already initialized
            if (!this.swiperInstance && document.querySelector('.activities_container')) {
                this.swiperInstance = new Swiper('.activities_container', {
                    spaceBetween: 16,
                    grabCursor: true,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    breakpoints: {
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 }
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
            }
        }
    },
    beforeUnmount() {
        // Destroy Swiper instance if exists
        if (this.swiperInstance) {
            this.swiperInstance.destroy(true, true);
        }
    }
});

// Mount the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        activitiesApp.mount('#activities-app');
    });
} else {
    activitiesApp.mount('#activities-app');
}