// Qualification Vue Application
const qualificationApp = Vue.createApp({
    data() {
        return {
            workExperience: [],
            education: []
        }
    },
    async mounted() {
        try {
            const response = await fetch('./asset/data/qualification-data.json');
            const data = await response.json();
            this.workExperience = data.workExperience;
            this.education = data.education;
        } catch (error) {
            console.error('Error loading qualification data:', error);
        }
    }
});

// Mount the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        qualificationApp.mount('#qualification-app');
    });
} else {
    qualificationApp.mount('#qualification-app');
}