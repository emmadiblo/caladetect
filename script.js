const colorThief = new ColorThief();
const dropArea = document.getElementById('dropArea');
const statusDiv = document.getElementById('status');
const colorsContainer = document.getElementById('colorsContainer');
const previewImage = document.getElementById('previewImage');
const copyFeedback = document.getElementById('copyFeedback');
const colorCountInput = document.getElementById('colorCount');

dropArea.innerText='Cliquez ou déposez une image ici';


function moins() {
    if (colorCountInput.value > 2) {
        colorCountInput.value = parseInt(colorCountInput.value) - 1;
        colorCountInput.dispatchEvent(new Event('change'));
    }
}

function plus() {
    if (colorCountInput.value < 20) {
        colorCountInput.value = parseInt(colorCountInput.value) + 1;
        colorCountInput.dispatchEvent(new Event('change'));
    }
}


function showLoader() {
    statusDiv.innerHTML = '<p class="searching">Preparation en cours...</p>';
}

function hideLoader() {
    statusDiv.innerHTML = '';

}

function reset() {
    colorsContainer.innerHTML = '';
    previewImage.src = '';
    previewImage.style.display = 'none';
    statusDiv.innerHTML = '';
    document.getElementById('colorCountGroup').style.display = 'none';
}

// Gestion des onglets
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        reset();
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-content`).classList.add('active');
    });
});

function processImageUrl() {
    const url = document.getElementById('imageUrl').value;
    if (!url) {
     
        handleError(new Error("Veuillez entrer une URL valide"));
        return;
    }

    showLoader();
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        previewImage.src = url;
        previewImage.style.display = 'block';
        try {
            const palette = colorThief.getPalette(img, parseInt(colorCountInput.value));
            displayPalette(palette);
        } catch (error) {
            handleError(error);
        }
    };
    img.onerror = function() {
        handleError(new Error("Impossible de charger l'image"));
        
    };
    img.src = url;
}

function handleError(error) {
    hideLoader();
    statusDiv.innerHTML = `<p style="color: red;">Erreur: ${error.message}</p>`;
    console.error('Erreur:', error);
}

async function processImage(imageFile) {
    if (!imageFile.type.startsWith('image/')) {

        handleError(new Error("Veuillez sélectionner un fichier image valide"));
        return;
    }


    showLoader();
    colorsContainer.innerHTML = '';
    previewImage.style.display = 'block';

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = function() {
            previewImage.src = e.target.result;
            try {
                if (img.complete) {
                    const palette = colorThief.getPalette(img, parseInt(colorCountInput.value));
                    displayPalette(palette);
                } else {
                    img.addEventListener('load', function() {
                        const palette = colorThief.getPalette(img, parseInt(colorCountInput.value));
                        displayPalette(palette);
                    });
                }
            } catch (error) {
                handleError(error);
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function showCopyFeedback() {
    copyFeedback.style.display = 'block';
    setTimeout(() => {
        copyFeedback.style.display = 'none';
    }, 2000);
}


function displayPalette(palette) {
hideLoader();
document.getElementById('colorCountGroup').style.display = 'block';

// Utiliser un ensemble pour éviter les couleurs en double
const uniqueColors = new Set();

palette.forEach(color => {
const hexColor = rgbToHex(color[0], color[1], color[2]);
uniqueColors.add(hexColor);
});

// Limiter au nombre spécifié par l'utilisateur
const colorLimit = parseInt(colorCountInput.value);
const limitedColors = Array.from(uniqueColors).slice(0, colorLimit);

// Vider le conteneur avant d'afficher les couleurs
colorsContainer.innerHTML = '';

limitedColors.forEach(hexColor => {
const colorItem = document.createElement('div');
colorItem.className = 'color-item';

const colorBox = document.createElement('div');
colorBox.className = 'color-box';
colorBox.style.backgroundColor = hexColor;
colorBox.onclick = () => {
    navigator.clipboard.writeText(hexColor);
    showCopyFeedback();
};

const colorCode = document.createElement('span');
colorCode.className = 'color-code';
colorCode.textContent = hexColor;

colorItem.appendChild(colorBox);
colorItem.appendChild(colorCode);
colorsContainer.appendChild(colorItem);
});
}

// Modifier la fonction qui génère la palette
function processImage(imageFile) {
if (!imageFile.type.startsWith('image/')) {

handleError(new Error("Veuillez sélectionner un fichier image valide"));
return;
}


showLoader();
previewImage.style.display = 'block';

const reader = new FileReader();
reader.onload = function(e) {
const img = new Image();
img.crossOrigin = 'Anonymous';

img.onload = function() {
    previewImage.src = e.target.result;
    try {
        if (img.complete) {
            let palette = colorThief.getPalette(img, 20); // Obtenez plus de couleurs pour éviter les doublons
            displayPalette(palette);
        }
    } catch (error) {
        handleError(error);
    }
};
img.src = e.target.result;
};
reader.readAsDataURL(imageFile);
}


// Gestionnaires d'événements pour le drag & drop
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
    dropArea.innerText='Relâchez pour déposer l\'image';

});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
    dropArea.innerText='Cliquez ou déposez une image ici';
    
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');

    dropArea.innerText='Cliquez ou déposez une image ici';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processImage(files[0]);
    }
});

dropArea.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        if (e.target.files.length > 0) {
            processImage(e.target.files[0]);
        }
    };
    input.click();
});

// Mise à jour automatique des couleurs lors du changement du nombre de couleurs
colorCountInput.addEventListener('change', () => {
    if (previewImage.src) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            try {
                const palette = colorThief.getPalette(img, parseInt(colorCountInput.value));
                displayPalette(palette);
            } catch (error) {
                handleError(error);
            }
        };
        img.src = previewImage.src;
    }
});