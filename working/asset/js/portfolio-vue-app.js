// Portfolio Vue Application
const portfolioApp = Vue.createApp({
    data() {
        return {
            selectedFilter: 'all',
            portfolioItems: []
        }
    },
    computed: {
        filteredItems() {
            if (this.selectedFilter === 'all') {
                return this.portfolioItems;
            }
            return this.portfolioItems.filter(item => item.category === this.selectedFilter);
        }
    },
    methods: {
        async loadPortfolioData() {
            try {
                const response = await fetch('./asset/data/portfolio-data.json');
                const data = await response.json();
                // Add isExpanded property for checkbox handling and ensure details exists
                this.portfolioItems = data.portfolioItems.map(item => ({
                    ...item,
                    details: item.details || {},
                    isExpanded: false
                }));
            } catch (error) {
                console.error('Error loading portfolio data:', error);
            }
        }
    },
    mounted() {
        this.loadPortfolioData();
    }
});

// Mount the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        portfolioApp.mount('#portfolio-app');
    });
} else {
    portfolioApp.mount('#portfolio-app');
}