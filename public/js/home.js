const cursor = document.querySelector('.custom-cursor');
const navItems = document.querySelectorAll('.nav-item, a, button');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

navItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        cursor.classList.add('grow');
    });
    
    item.addEventListener('mouseleave', () => {
        cursor.classList.remove('grow');
    });
});

document.body.style.cursor = 'none';

function playVideo() {
    const videoContainer = document.querySelector('.video-container');
    const thumbnail = videoContainer.querySelector('.video-thumbnail');
    const overlay = videoContainer.querySelector('.play-button-overlay');
    const video = document.getElementById('introVideo');
    
    thumbnail.style.display = 'none';
    overlay.style.display = 'none';
    video.classList.remove('hidden');
    video.style.display = 'block';
    video.play();
}

function handleImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewId);

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            previewContainer.innerHTML = '';
            const img = document.createElement('img');
            img.classList.add('image-preview');
            img.src = URL.createObjectURL(file);
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-preview');
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => {
                previewContainer.innerHTML = '';
                input.value = '';
            };
            previewContainer.appendChild(img);
            previewContainer.appendChild(removeBtn);
            setTimeout(() => {
                img.classList.add('show');
            }, 10);
        } else {
            previewContainer.innerHTML = '<p class="text-red-500 text-sm">Please upload an image file</p>';
        }
    });
}

handleImagePreview('front_id', 'front_id_preview');
handleImagePreview('back_id', 'back_id_preview');

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
const menuOverlay = document.getElementById('menuOverlay');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('open');
});

closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
});

menuOverlay.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
});

const mobileMenuLinks = mobileMenu.querySelectorAll('a');
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
    });
});

const validateFirstName = (value) => value.length >= 2;
const validateLastName = (value) => value.length >= 1;
const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validateWhatsapp = (value) => /^\d{8,15}$/.test(value);
const validateAddress = (value) => value.length >= 10;
const validateWorkPosition = (value) => value.length >= 2;
const validateFileInput = (input) => {
    const file = input.files[0];
    return file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
};

function toggleError(input, errorElement, isValid) {
    if (!input || !errorElement) return;
    if (isValid) {
        input.classList.remove('error');
        errorElement.classList.remove('show');
    } else {
        input.classList.add('error');
        errorElement.classList.add('show');
    }
}

document.getElementById('contactForm').addEventListener('input', function(e) {
    const target = e.target;
    
    switch(target.id) {
        case 'first_name':
            toggleError(target, document.getElementById('firstNameError'), validateFirstName(target.value));
            break;
        case 'last_name':
            toggleError(target, document.getElementById('lastNameError'), validateLastName(target.value));
            break;
        case 'email':
            toggleError(target, document.getElementById('emailError'), validateEmail(target.value));
            break;
        case 'wtsp-number':
            toggleError(target, document.getElementById('whatsappError'), validateWhatsapp(target.value));
            break;
        case 'address':
            toggleError(target, document.getElementById('addressError'), validateAddress(target.value));
            break;
        case 'work-position':
            toggleError(target, document.getElementById('workPositionError'), validateWorkPosition(target.value));
            break;
    }
});

document.getElementById('front_id').addEventListener('change', function() {
    toggleError(this, document.getElementById('frontIdError'), validateFileInput(this));
});

document.getElementById('back_id').addEventListener('change', function() {
    toggleError(this, document.getElementById('backIdError'), validateFileInput(this) || !this.files[0]);
});

document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('first_name');
    const lastName = document.getElementById('last_name');
    const email = document.getElementById('email');
    const whatsapp = document.getElementById('wtsp-number');
    const address = document.getElementById('address');
    const workPosition = document.getElementById('work-position');
    const frontId = document.getElementById('front_id');
    const backId = document.getElementById('back_id');
    const nfcCheckbox = document.querySelector('input[name="nfcCheckbox"]');
    const termsCheckbox = document.querySelector('input[name="termsCheckbox"]');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeError = document.getElementById('closeError');

    const isValid = (
        firstName && validateFirstName(firstName.value) &&
        lastName && validateLastName(lastName.value) &&
        email && validateEmail(email.value) &&
        whatsapp && validateWhatsapp(whatsapp.value) &&
        address && validateAddress(address.value) &&
        workPosition && validateWorkPosition(workPosition.value) &&
        frontId && validateFileInput(frontId) &&
        backId && (validateFileInput(backId) || !backId.files[0]) &&
        termsCheckbox && termsCheckbox.checked
    );

    if (!isValid) {
        if (!termsCheckbox || !termsCheckbox.checked) {
            errorMessage.textContent = 'Please agree to the Terms and Conditions';
            errorModal.classList.add('show');
        }
        return;
    }

    const formData = new FormData();
    formData.append('first_name', firstName.value);
    formData.append('last_name', lastName.value);
    formData.append('email', email.value);
    formData.append('wtsp-number', whatsapp.value);
    formData.append('address', address.value);
    formData.append('work-position', workPosition.value);
    formData.append('front_id', frontId.files[0]);
    if (backId.files[0]) formData.append('back_id', backId.files[0]);
    formData.append('nfcCheckbox', nfcCheckbox.checked);
    formData.append('termsCheckbox', termsCheckbox.checked);

    try {
        // Show loading spinner
        loadingOverlay.classList.add('show');
        
        const response = await fetch('/submit', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        const successModal = document.getElementById('successModal');

        if (response.ok && result.success) {
            successModal.classList.remove('hidden');
            setTimeout(() => {
                successModal.classList.add('show');
                const checkmark = document.querySelector('.checkmark');
                const circle = document.querySelector('.circle');
                const check = document.querySelector('.check');
                checkmark.classList.add('active');
                circle.classList.add('active');
                check.classList.add('active');
            }, 10);

            this.reset();
            document.getElementById('front_id_preview').innerHTML = '';
            document.getElementById('back_id_preview').innerHTML = '';
        } else {
            throw new Error(result.message || 'Form submission failed');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        errorMessage.textContent = error.message || 'An unexpected error occurred. Please try again later.';
        errorModal.classList.add('show');
    } finally {
        // Hide loading spinner regardless of success or failure
        loadingOverlay.classList.remove('show');
    }
});

const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModal');

closeModalBtn.addEventListener('click', function() {
    successModal.classList.remove('show');
    setTimeout(() => {
        successModal.classList.add('hidden');
        const checkmark = document.querySelector('.checkmark');
        const circle = document.querySelector('.circle');
        const check = document.querySelector('.check');
        checkmark.classList.remove('active');
        circle.classList.remove('active');
        check.classList.remove('active');
    }, 300);
});

successModal.addEventListener('click', function(e) {
    if (e.target === successModal) {
        successModal.classList.remove('show');
        setTimeout(() => {
            successModal.classList.add('hidden');
            const checkmark = document.querySelector('.checkmark');
            const circle = document.querySelector('.circle');
            const check = document.querySelector('.check');
            checkmark.classList.remove('active');
            circle.classList.remove('active');
            check.classList.remove('active');
        }, 300);
    }
});

// Error modal close handler
document.getElementById('closeError').addEventListener('click', function() {
    const errorModal = document.getElementById('errorModal');
    errorModal.classList.remove('show');
});

// Close error modal when clicking outside
document.getElementById('errorModal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('show');
    }
});

document.querySelectorAll('.checkbox-input').forEach(checkbox => {
    checkbox.addEventListener('click', function() {
        const ripple = this.nextElementSibling.querySelector('.ripple');
        ripple.style.animation = 'none';
        void ripple.offsetWidth;
        ripple.style.animation = 'ripple-effect 0.6s linear';
    });
});