class AIImageGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.gallery = [];
    }

    initializeElements() {
        this.promptInput = document.getElementById('prompt');
        this.aspectSelect = document.getElementById('aspect');
        this.transparentCheckbox = document.getElementById('transparent');
        this.generateBtn = document.getElementById('generateBtn');
        this.placeholderArea = document.getElementById('placeholderArea');
        this.imageArea = document.getElementById('imageArea');
        this.generatedImage = document.getElementById('generatedImage');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.galleryContainer = document.getElementById('gallery');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateImage());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.regenerateBtn.addEventListener('click', () => this.regenerateImage());
        
        // Enable Enter key to generate
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.generateImage();
            }
        });
        
        // Auto-resize textarea
        this.promptInput.addEventListener('input', () => {
            this.promptInput.style.height = 'auto';
            this.promptInput.style.height = this.promptInput.scrollHeight + 'px';
        });
    }

    async generateImage() {
        const prompt = this.promptInput.value.trim();
        
        if (!prompt) {
            this.showError('Please enter a prompt to generate an image');
            return;
        }

        this.setLoading(true);
        
        try {
            const options = {
                prompt: prompt,
                aspect_ratio: this.aspectSelect.value,
                transparent: this.transparentCheckbox.checked
            };

            const result = await websim.imageGen(options);
            
            this.displayImage(result.url, prompt);
            this.addToGallery(result.url, prompt);
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.showError('Failed to generate image. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async regenerateImage() {
        if (this.lastPrompt) {
            this.promptInput.value = this.lastPrompt;
            await this.generateImage();
        }
    }

    displayImage(imageUrl, prompt) {
        this.generatedImage.src = imageUrl;
        this.generatedImage.alt = `AI generated: ${prompt}`;
        this.lastPrompt = prompt;
        this.lastImageUrl = imageUrl;
        
        this.placeholderArea.style.display = 'none';
        this.imageArea.style.display = 'block';
    }

    downloadImage() {
        if (this.lastImageUrl) {
            const link = document.createElement('a');
            link.href = this.lastImageUrl;
            link.download = `ai-generated-${Date.now()}.png`;
            link.click();
        }
    }

    addToGallery(imageUrl, prompt) {
        const galleryItem = {
            url: imageUrl,
            prompt: prompt,
            timestamp: Date.now()
        };
        
        this.gallery.unshift(galleryItem);
        
        // Keep only last 12 images
        if (this.gallery.length > 12) {
            this.gallery = this.gallery.slice(0, 12);
        }
        
        this.renderGallery();
    }

    renderGallery() {
        this.galleryContainer.innerHTML = '';
        
        this.gallery.forEach((item, index) => {
            const galleryElement = document.createElement('div');
            galleryElement.className = 'gallery-item';
            galleryElement.style.animationDelay = `${index * 0.1}s`;
            
            galleryElement.innerHTML = `
                <img src="${item.url}" alt="Generated image" class="gallery-image">
                <div class="gallery-prompt">${this.truncateText(item.prompt, 100)}</div>
            `;
            
            galleryElement.addEventListener('click', () => {
                this.displayImage(item.url, item.prompt);
                this.promptInput.value = item.prompt;
            });
            
            this.galleryContainer.appendChild(galleryElement);
        });
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    setLoading(isLoading) {
        this.generateBtn.classList.toggle('loading', isLoading);
        this.generateBtn.disabled = isLoading;
        
        if (isLoading) {
            this.promptInput.disabled = true;
            this.aspectSelect.disabled = true;
            this.transparentCheckbox.disabled = true;
        } else {
            this.promptInput.disabled = false;
            this.aspectSelect.disabled = false;
            this.transparentCheckbox.disabled = false;
        }
    }

    showError(message) {
        // Create and show error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, #ff4757, #ff3838);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 30px rgba(255, 71, 87, 0.3);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new AIImageGenerator();
});

