const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

let pdfDoc = null, pageNum = 1, scale = 2;
const canvas = document.querySelector('#pdf-render');
const ctx = canvas.getContext('2d');

// Render a specific page of the PDF
const renderPage = (num) => {
    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = { canvasContext: ctx, viewport };
        page.render(renderCtx);

        document.querySelector('#page-info').textContent = `Page ${num} of ${pdfDoc.numPages}`;
        localStorage.setItem('pdfPage', num);
    });
};

// Load and display PDF file
const loadPDF = (file) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
        const typedArray = new Uint8Array(fileReader.result);
        pdfjsLib.getDocument(typedArray).promise.then((doc) => {
            pdfDoc = doc;
            pageNum = 1;
            renderPage(pageNum);
            const fileAsBase64 = btoa(String.fromCharCode(...typedArray));
            localStorage.setItem('pdfFile', fileAsBase64);
        });
    };
    fileReader.readAsArrayBuffer(file);
};

// Load PDF from localStorage
const loadPDFFromStorage = () => {
    const storedFile = localStorage.getItem('pdfFile');
    const storedPage = localStorage.getItem('pdfPage');

    if (storedFile) {
        const typedArray = new Uint8Array(atob(storedFile).split('').map((char) => char.charCodeAt(0)));
        pdfjsLib.getDocument(typedArray).promise.then((doc) => {
            pdfDoc = doc;
            pageNum = storedPage ? parseInt(storedPage, 10) : 1;
            renderPage(pageNum);
            document.querySelector('.viewer').style.display = 'block';
            document.querySelector('.upload-section').style.display = 'none';
        });
    }
};

// Toggle dark mode
const toggleDarkMode = () => {
    document.body.classList.toggle('dark');
    const icon = document.getElementById('theme-icon');
    const isDarkMode = document.body.classList.contains('dark');
    icon.classList.toggle('fa-sun', !isDarkMode);
    icon.classList.toggle('fa-moon', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
};

// Load dark mode preference
const loadDarkMode = () => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', isDarkMode);
    const icon = document.getElementById('theme-icon');
    icon.classList.toggle('fa-sun', !isDarkMode);
    icon.classList.toggle('fa-moon', isDarkMode);
};

// Close PDF viewer
document.getElementById('close-viewer').addEventListener('click', () => {
    document.querySelector('.viewer').style.display = 'none';
    document.querySelector('.upload-section').style.display = 'block';
    localStorage.removeItem('pdfFile');
    localStorage.removeItem('pdfPage');
});

// Handle file upload from input
document.getElementById('file-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        loadPDF(file);
        document.querySelector('.viewer').style.display = 'block';
        document.querySelector('.upload-section').style.display = 'none';
    } else {
        alert('Please upload a valid PDF file.');
    }
});

// Handle drag and drop upload
const uploadSection = document.getElementById('upload-section');
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.classList.add('dragover');
});
uploadSection.addEventListener('dragleave', () => uploadSection.classList.remove('dragover'));
uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        loadPDF(file);
        document.querySelector('.viewer').style.display = 'block';
        document.querySelector('.upload-section').style.display = 'none';
    } else {
        alert('Please upload a valid PDF file.');
    }
});

// Pagination buttons
document.getElementById('prev').addEventListener('click', () => {
    if (pageNum > 1) {
        pageNum--;
        renderPage(pageNum);
    }
});
document.getElementById('next').addEventListener('click', () => {
    if (pageNum < pdfDoc.numPages) {
        pageNum++;
        renderPage(pageNum);
    }
});

// Toggle theme
document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPDFFromStorage();
    loadDarkMode();
});
