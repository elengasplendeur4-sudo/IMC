class BMICalculator {
    constructor() {
        this.BMI_LIMITE_NORMAL = 25.0;
        this.BMI_LIMITE_SURPOIDS = 30.0;
        this.currentGender = 'M';
        this.initElements();
        this.bindEvents();
        this.updateResults();
    }

    initElements() {
        // Elements DOM
        this.genderBtns = document.querySelectorAll('.gender-btn');
        this.heightSlider = document.getElementById('height');
        this.weightSlider = document.getElementById('weight');
        this.heightValue = document.getElementById('height-value');
        this.weightValue = document.getElementById('weight-value');
        this.presetBtns = document.querySelectorAll('.preset-btn');
        
        // Résultats
        this.bmiElement = document.getElementById('bmi');
        this.bmiStatusElement = document.getElementById('bmi-status');
        this.idealWeightElement = document.getElementById('ideal-weight');
        this.weightDiffElement = document.getElementById('weight-diff');
        this.diffNoteElement = document.getElementById('diff-note');
        this.healthTipElement = document.getElementById('health-tip');
        this.scaleIndicator = document.getElementById('scale-indicator');
        
        // Boutons d'action
        this.shareBtn = document.getElementById('share-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.exportBtn = document.getElementById('export-btn');
        
        // Toast
        this.toast = document.getElementById('toast');
        
        // Année en cours
        document.getElementById('current-year').textContent = new Date().getFullYear();
    }

    bindEvents() {
        // Gestion du genre
        this.genderBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setGender(btn.dataset.gender));
        });

        // Sliders
        this.heightSlider.addEventListener('input', () => this.updateSlider('height'));
        this.weightSlider.addEventListener('input', () => this.updateSlider('weight'));

        // Préréglages
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const height = parseInt(btn.dataset.height);
                const weight = parseInt(btn.dataset.weight);
                this.setPreset(height, weight);
            });
        });

        // Boutons d'action
        this.shareBtn.addEventListener('click', () => this.shareResults());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.exportBtn.addEventListener('click', () => this.exportToPDF());

        // Mise à jour initiale
        this.updateSlider('height');
        this.updateSlider('weight');
    }

    setGender(gender) {
        this.currentGender = gender;
        this.genderBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.gender === gender);
        });
        this.updateResults();
    }

    setPreset(height, weight) {
        this.heightSlider.value = height;
        this.weightSlider.value = weight;
        this.updateSlider('height');
        this.updateSlider('weight');
        this.showToast(`Préréglage appliqué: ${height}cm, ${weight}kg`);
    }

    updateSlider(type) {
        const value = type === 'height' 
            ? this.heightSlider.value 
            : this.weightSlider.value;
        
        const displayElement = type === 'height' 
            ? this.heightValue 
            : this.weightValue;
        
        displayElement.textContent = `${value} ${type === 'height' ? 'cm' : 'kg'}`;
        this.updateResults();
    }

    calculateIdealWeight(height, gender) {
        // Formule de Lorenz
        if (gender === 'M') {
            return (height - 100) - ((height - 150) / 4);
        } else {
            return (height - 100) - ((height - 120) / 4);
        }
    }

    calculateBMI(weight, height) {
        const heightM = height / 100;
        return weight / (heightM * heightM);
    }

    getBMIStatus(bmi) {
        if (bmi < 18.5) return { status: 'Maigreur', color: '#4cc9f0', tip: 'Considérez consulter un nutritionniste pour atteindre un poids santé.' };
        if (bmi < this.BMI_LIMITE_NORMAL) return { status: 'Normal', color: '#10b981', tip: 'Votre poids est dans la norme. Continuez vos bonnes habitudes!' };
        if (bmi < this.BMI_LIMITE_SURPOIDS) return { status: 'Surpoids', color: '#f59e0b', tip: 'Une activité physique régulière et une alimentation équilibrée peuvent vous aider.' };
        return { status: 'Obésité', color: '#ef4444', tip: 'Consultez un professionnel de santé pour un accompagnement personnalisé.' };
    }

    updateResults() {
        const height = parseInt(this.heightSlider.value);
        const weight = parseInt(this.weightSlider.value);
        
        // Calculs
        const bmi = this.calculateBMI(weight, height);
        const idealWeight = this.calculateIdealWeight(height, this.currentGender);
        const weightDiff = weight - idealWeight;
        const bmiStatus = this.getBMIStatus(bmi);
        
        // Mise à jour des valeurs
        this.bmiElement.textContent = bmi.toFixed(1);
        this.bmiStatusElement.textContent = bmiStatus.status;
        this.bmiStatusElement.style.color = bmiStatus.color;
        
        this.idealWeightElement.textContent = `${idealWeight.toFixed(1)} kg`;
        this.weightDiffElement.textContent = `${weightDiff >= 0 ? '+' : ''}${weightDiff.toFixed(1)} kg`;
        this.weightDiffElement.style.color = weightDiff >= 0 ? '#ef4444' : '#4cc9f0';
        
        this.diffNoteElement.textContent = weightDiff > 0 
            ? `Au-dessus de l'idéal`
            : weightDiff < 0 
            ? `En-dessous de l'idéal`
            : `Poids idéal atteint`;
        
        this.healthTipElement.textContent = bmiStatus.tip;
        
        // Mise à jour de l'indicateur sur l'échelle
        this.updateScaleIndicator(bmi);
        
        // Animation du cercle BMI
        this.animateBMICircle(bmiStatus.color);
    }

    updateScaleIndicator(bmi) {
        // Position de l'indicateur (0-100%)
        let position;
        if (bmi < 18.5) {
            position = (bmi / 18.5) * 25;
        } else if (bmi < 25) {
            position = 25 + ((bmi - 18.5) / 6.5) * 25;
        } else if (bmi < 30) {
            position = 50 + ((bmi - 25) / 5) * 25;
        } else {
            position = 75 + (Math.min(bmi - 30, 20) / 20) * 25;
        }
        
        this.scaleIndicator.style.left = `${Math.min(position, 100)}%`;
    }

    animateBMICircle(color) {
        const circle = document.querySelector('.bmi-circle');
        circle.style.background = `linear-gradient(135deg, ${color}40 0%, ${color} 100%)`;
        
        // Effet de pulsation
        circle.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
        ], {
            duration: 500,
            easing: 'ease-in-out'
        });
    }

    async shareResults() {
        const height = this.heightSlider.value;
        const weight = this.weightSlider.value;
        const bmi = this.bmiElement.textContent;
        const status = this.bmiStatusElement.textContent;
        
        const text = `Mon IMC: ${bmi} (${status})
Taille: ${height}cm | Poids: ${weight}kg
Calculez le vôtre !`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mon résultat IMC',
                    text: text,
                    url: window.location.href
                });
                this.showToast('Partagé avec succès!');
            } catch (err) {
                console.log('Erreur de partage:', err);
            }
        } else {
            // Fallback: copie dans le presse-papier
            await navigator.clipboard.writeText(text);
            this.showToast('Résultats copiés dans le presse-papier!');
        }
    }

    reset() {
        this.heightSlider.value = 170;
        this.weightSlider.value = 70;
        this.setGender('M');
        this.updateSlider('height');
        this.updateSlider('weight');
        this.showToast('Réinitialisé aux valeurs par défaut');
    }

    exportToPDF() {
        // Simulation d'export PDF
        this.showToast('Fonctionnalité PDF à implémenter');
        // En pratique, vous pouvez utiliser une librairie comme jsPDF
        // ou simplement ouvrir la fenêtre d'impression
        // window.print();
    }

    showToast(message, duration = 3000) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, duration);
    }
}

// Initialisation lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new BMICalculator();
    
    // Ajouter un raccourci clavier pour le calcul
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'c') {
            calculator.shareResults();
        }
        if (e.key === 'Escape') {
            calculator.reset();
        }
    });
    
    // Service Worker pour PWA (optionnel)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('Service Worker échoué:', err);
            });
        });
    }
});