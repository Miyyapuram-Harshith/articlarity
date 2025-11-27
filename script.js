// --- STATE ---
const appRoot = document.getElementById('app-root');
let geminiApiKey = localStorage.getItem('articlarity_api_key') || '';
// Load PDF-LIB from CDN for client-side merging/splitting
const PDFLib = window.PDFLib;
const { jsPDF } = window.jspdf;


// --- TEMPLATES ---

// 1. DASHBOARD (Home) - UPDATED with PDF Splitter
const dashboardPage = `
    <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-extrabold text-gray-900 mb-4">The Creator's <span class="text-blue-600">Swiss Army Knife</span></h1>
            <p class="text-gray-600 max-w-2xl mx-auto">11 Free tools. No login. No server uploads.</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${createToolCard('Attendance Calc', 'Check if you can skip or need to attend.', '#/attendance', '📅')}
            ${createToolCard('AI Humanizer', 'Rewrite AI text to sound natural.', '#/humanizer', '📝')}
            ${createToolCard('Smart Img Compressor', 'Compress to specific size (<100KB).', '#/compressor', '🖼️')}
            ${createToolCard('PDF Merger', 'Combine multiple PDF files into one.', '#/pdf-merger', '🔗')}
            ${createToolCard('PDF Splitter', 'Extract pages or split into custom ranges.', '#/pdf-splitter', '✂️')}
            ${createToolCard('Img to PDF', 'Convert JPG, PNG, etc., to a single PDF.', '#/img-to-pdf', '📸')}
            ${createToolCard('PDF Compressor', 'Shrink PDF file size instantly.', '#/pdf-tools', '📄')}
            ${createToolCard('QR Generator', 'Create custom QR codes.', '#/qr', '📱')}
            ${createToolCard('YouTube Summarizer', 'Get key points from video transcripts.', '#/summarizer', '📺')}
            ${createToolCard('Grammar Fixer', 'AI-powered grammar correction.', '#/grammar', '✨')}
            ${createToolCard('Password Generator', 'Create secure, random passwords.', '#/password', '🔒')}
            ${createToolCard('Case Converter', 'UPPER, lower, Title Case.', '#/case', 'Aa')}
            ${createToolCard('Word Counter Pro', 'Count words, chars, and paragraphs.', '#/counter', '📊')}
            ${createToolCard('Lorem Ipsum', 'Generate placeholder text.', '#/lorem', '¶')}
        </div>
    </div>
`;

function createToolCard(title, desc, link, icon) {
    return `
    <a href="${link}" class="tool-card block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
        <div class="text-3xl mb-4">${icon}</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">${title}</h3>
        <p class="text-gray-500 text-sm">${desc}</p>
    </a>`;
}

// 2. IMAGE TO PDF CONVERTER (NEW TOOL)
const imgToPdfPage = `
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-900">Image to PDF Converter</h2>
        <p class="text-sm text-gray-500 mb-4">Select multiple images (JPG, PNG) to combine them into one multi-page PDF.</p>
        
        <input type="file" id="img-to-pdf-input" accept="image/*" multiple
            class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6">
        
        <div id="img-to-pdf-controls" class="hidden">
            <div class="bg-gray-100 p-4 rounded-lg mb-4">
                <p class="text-sm font-semibold mb-2 text-gray-700">Images Selected: <span id="img-count" class="text-blue-600 font-bold">0</span></p>
                <div class="flex items-center gap-4">
                    <label class="text-sm font-medium text-gray-700">Page Size:</label>
                    <select id="pdf-size" class="border p-1 rounded-lg">
                        <option value="a4">A4 (Portrait)</option>
                        <option value="letter">Letter</option>
                        <option value="fit">Fit Image to Page</option>
                    </select>
                </div>
            </div>
            
            <button id="btn-convert-to-pdf" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
                Convert & Download PDF
            </button>
        </div>

        <div id="img-to-pdf-status" class="hidden mt-4 p-3 bg-yellow-100 rounded-lg text-sm text-center text-yellow-800">
            Awaiting images...
        </div>
    </div>
`;

// 3. PDF SPLITTER
const pdfSplitterPage = `
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-900">PDF Splitter (Client-Side)</h2>
        <p class="text-sm text-gray-500 mb-4">Upload a PDF and define the page ranges you want to extract.</p>
        
        <input type="file" id="pdf-splitter-input" accept=".pdf" 
            class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6">
        
        <div id="splitter-controls" class="hidden">
            <div class="bg-gray-100 p-4 rounded-lg mb-4">
                <p class="text-sm font-semibold mb-2 text-gray-700">Total Pages: <span id="total-pages" class="text-blue-600 font-bold">0</span></p>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ranges to Extract (e.g., 1-5, 8, 10-END)</label>
                <input type="text" id="split-ranges" class="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1-5, 10, 15-20">
                <p id="range-error" class="text-xs text-red-500 mt-1 hidden">Invalid range format or page number exceeds total.</p>
            </div>
            
            <button id="btn-split-pdfs" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50" disabled>
                Split & Download All
            </button>
        </div>

        <div id="splitter-status" class="hidden mt-4 p-3 bg-yellow-100 rounded-lg text-sm text-center text-yellow-800">
            Waiting for input...
        </div>
    </div>
`;

// 4. PDF MERGER
const pdfMergerPage = `
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 class="text-2xl font-bold mb-6 text-gray-900">PDF Merger (Client-Side)</h2>
        <p class="text-sm text-gray-500 mb-4">Select multiple PDFs to combine them into one file directly in your browser.</p>
        
        <input type="file" id="pdf-merger-input" accept=".pdf" multiple
            class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6">
        
        <div id="file-list-container" class="mb-4 space-y-2">
            <p id="merger-info" class="text-sm text-gray-500">Select at least two PDFs.</p>
            <ul id="merger-file-list" class="list-disc pl-5 text-gray-700 text-sm"></ul>
        </div>
        
        <button id="btn-merge-pdfs" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50" disabled>
            Merge PDFs
        </button>

        <div id="merger-status" class="hidden mt-4 p-3 bg-gray-100 rounded-lg text-sm text-center">
            Merging...
        </div>
        
        <a id="merger-download-link" class="hidden block w-full bg-green-600 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700 mt-4" href="#" download="merged_articlarity.pdf">
            Download Merged PDF
        </a>
    </div>
`;
const attendancePage = `
    <div class="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 class="text-2xl font-bold mb-2 text-gray-900">Student Attendance Calculator</h2>
        <p class="text-sm text-gray-500 mb-6">Calculate how many classes you need to attend or can safely skip.</p>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Total Classes Held</label>
                <input type="number" id="att-total" class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 50">
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Classes Attended</label>
                <input type="number" id="att-present" class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 40">
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Target Percentage (%)</label>
                <input type="number" id="att-target" value="75" class="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="75">
            </div>
            
            <button id="btn-calc-attendance" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Calculate Status</button>
        </div>

        <div id="att-result" class="hidden mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <p class="text-sm text-gray-500 uppercase tracking-wide font-semibold">Current Attendance</p>
            <h3 id="att-percentage" class="text-4xl font-extrabold text-blue-600 my-2">0%</h3>
            <div id="att-message" class="text-lg font-medium mt-4 p-3 rounded-lg"></div>
        </div>
    </div>
`;
const compressorPage = `
    <div class="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 class="text-2xl font-bold mb-6">Smart Image Compressor</h2>
        
        <div id="drop-zone" class="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-10 text-center cursor-pointer hover:bg-blue-100 transition-colors">
            <p class="text-blue-600 font-medium">Click or Drag Image Here</p>
            <input type="file" id="img-input" class="hidden" accept="image/*">
        </div>

        <div id="img-controls" class="hidden mt-8 space-y-6">
            <div class="flex gap-4 p-1 bg-gray-100 rounded-lg">
                <button id="mode-manual" class="flex-1 py-2 rounded-md bg-white shadow-sm text-sm font-bold">Manual Slider</button>
                <button id="mode-auto" class="flex-1 py-2 rounded-md text-gray-500 text-sm font-bold">Target < 100KB</button>
            </div>

            <div id="manual-ui">
                <label class="block text-sm font-medium text-gray-700 mb-2">Quality: <span id="qual-val">80</span>%</label>
                <input type="range" id="qual-slider" min="1" max="100" value="80" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
            </div>

            <div id="auto-ui" class="hidden">
                <label class="block text-sm font-medium text-gray-700 mb-2">Target Size (KB)</label>
                <div class="flex gap-2">
                    <input type="number" id="target-kb" value="100" class="w-full border p-2 rounded-lg">
                    <button id="btn-auto-compress" class="bg-blue-600 text-white px-4 rounded-lg font-bold">Go</button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-center bg-gray-50 p-4 rounded-lg">
                <div><p class="text-xs text-gray-500">Original</p><p id="orig-size" class="font-bold">0 KB</p></div>
                <div><p class="text-xs text-gray-500">Compressed</p><p id="new-size" class="font-bold text-green-600">0 KB</p></div>
            </div>
            
            <a id="dl-img-btn" class="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700">Download Image</a>
        </div>
    </div>
`;
const pdfPage = `
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 class="text-2xl font-bold mb-6">PDF Compressor</h2>
        <p class="text-sm text-gray-500 mb-4">Note: This rebuilds the PDF to reduce size. Best for scanned documents.</p>
        
        <input type="file" id="pdf-input" accept=".pdf" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6">
        
        <div id="pdf-status" class="hidden">
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div id="pdf-progress" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
            </div>
            <p id="pdf-status-text" class="text-sm text-center text-gray-600">Processing...</p>
        </div>

        <button id="btn-compress-pdf" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4 hidden">Compress PDF</button>
    </div>
`;
const humanizerPage = `
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4">AI Text Humanizer</h2>
        <textarea id="human-input" class="w-full h-64 p-4 border rounded-lg mb-4" placeholder="Paste AI text here..."></textarea>
        <button id="btn-humanize" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">Humanize</button>
        <div id="human-result" class="mt-6 p-4 bg-gray-50 border rounded-lg min-h-[100px] whitespace-pre-wrap"></div>
    </div>
`;
const passwordPage = `
    <div class="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
        <h2 class="text-2xl font-bold mb-6">Secure Password Generator</h2>
        <div class="bg-gray-100 p-4 rounded-lg mb-6 text-2xl font-mono break-all" id="pass-display">---</div>
        <div class="flex justify-center gap-4 mb-6">
            <label><input type="checkbox" id="chk-nums" checked> 123</label>
            <label><input type="checkbox" id="chk-syms" checked> !@#</label>
            <label>Length: <input type="number" id="pass-len" value="16" class="w-16 border rounded px-1"></label>
        </div>
        <button id="btn-gen-pass" class="bg-green-600 text-white px-8 py-3 rounded-lg font-bold">Generate</button>
    </div>
`;
const routes = {
    '/': dashboardPage,
    '/attendance': attendancePage,
    '/humanizer': humanizerPage,
    '/compressor': compressorPage,
    '/pdf-merger': pdfMergerPage,
    '/pdf-splitter': pdfSplitterPage,
    '/img-to-pdf': imgToPdfPage, // <-- NEW ROUTE
    '/pdf-tools': pdfPage,
    '/password': passwordPage,
    // Simple placeholders for remaining tools
    '/qr': `<div class="text-center mt-10"><h2 class="text-2xl font-bold">QR Generator</h2><input id="qr-in" class="border p-2 m-4 rounded"><button onclick="genQR()" class="bg-blue-600 text-white p-2 rounded">Generate</button><div id="qr-out" class="mt-4"></div></div>`,
    '/case': `<div class="max-w-2xl mx-auto bg-white p-6 mt-10 rounded shadow"><textarea id="case-in" class="w-full border p-2 h-40"></textarea><div class="flex gap-2 mt-4"><button onclick="toCase('upper')" class="bg-gray-200 p-2 rounded">UPPER</button><button onclick="toCase('lower')" class="bg-gray-200 p-2 rounded">lower</button><button onclick="toCase('title')" class="bg-gray-200 p-2 rounded">Title Case</button></div></div>`,
    '/counter': `<div class="max-w-2xl mx-auto bg-white p-6 mt-10 rounded shadow"><h2 class="text-2xl font-bold mb-4">Word Counter</h2><textarea id="count-in" class="w-full border p-2 h-40" oninput="countWords()"></textarea><div class="mt-4 text-lg font-bold">Words: <span id="w-count">0</span> | Chars: <span id="c-count">0</span></div></div>`,
    '/lorem': `<div class="max-w-2xl mx-auto bg-white p-6 mt-10 rounded shadow text-center"><h2 class="text-2xl font-bold mb-4">Lorem Ipsum</h2><button onclick="genLorem()" class="bg-blue-600 text-white px-4 py-2 rounded">Generate Paragraph</button><p id="lorem-out" class="mt-4 text-left text-gray-600"></p></div>`
};

function render() {
    const path = window.location.hash.substring(1) || '/';
    appRoot.innerHTML = routes[path] || routes['/'];
    window.scrollTo(0,0);
    
    if (path === '/attendance') initAttendance(); // Init new tool
    if (path === '/compressor') initCompressor();
    if (path === '/pdf-tools') initPDF();
    if (path === '/pdf-merger') initPdfMerger(); 
    if (path === '/pdf-splitter') initPdfSplitter(); 
    if (path === '/img-to-pdf') initImgToPdf(); // <-- NEW INIT
    if (path === '/humanizer') initHumanizer();
    if (path === '/password') initPassword();
}

window.addEventListener('hashchange', render);
window.addEventListener('load', render);


// --- LOGIC: IMAGE TO PDF CONVERTER (NEW) ---
/**
 * Initializes the Image to PDF Converter functionality.
 * Note: Requires jspdf.umd.min.js loaded via CDN.
 */
function initImgToPdf() {
    // NOTE: This logic relies on jspdf.jsPDF, which must be loaded.
    const input = document.getElementById('img-to-pdf-input');
    const controls = document.getElementById('img-to-pdf-controls');
    const convertBtn = document.getElementById('btn-convert-to-pdf');
    const statusDiv = document.getElementById('img-to-pdf-status');
    const imgCountEl = document.getElementById('img-count');
    const pdfSizeEl = document.getElementById('pdf-size');
    
    let selectedImages = [];

    // Utility to load an image and get its data URL
    function loadImage(file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        dataURL: e.target.result,
                        width: img.width,
                        height: img.height,
                        name: file.name
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 1. File Upload Handler
    input.addEventListener('change', (e) => {
        selectedImages = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        
        imgCountEl.textContent = selectedImages.length;

        if (selectedImages.length > 0) {
            controls.classList.remove('hidden');
            convertBtn.disabled = false;
            statusDiv.classList.add('hidden');
        } else {
            controls.classList.add('hidden');
            convertBtn.disabled = true;
            statusDiv.textContent = 'Please select one or more images.';
            statusDiv.classList.remove('hidden');
        }
    });

    // 2. Conversion Handler
    convertBtn.addEventListener('click', async () => {
        if (selectedImages.length === 0 || convertBtn.disabled) return;
        
        if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF !== 'function') {
            alert("Error: jspdf library not loaded. Please ensure the script tag is present.");
            return;
        }

        convertBtn.disabled = true;
        statusDiv.textContent = `Processing ${selectedImages.length} images...`;
        statusDiv.classList.remove('hidden', 'bg-green-100', 'bg-red-100');
        statusDiv.classList.add('bg-gray-100', 'text-gray-700');

        const pdfSize = pdfSizeEl.value;
        const pdf = new jsPDF('p', 'mm', pdfSize !== 'fit' ? pdfSize : 'a4'); 
        pdf.deletePage(1); // Start with a blank document

        try {
            for (let i = 0; i < selectedImages.length; i++) {
                const file = selectedImages[i];
                statusDiv.textContent = `Processing image ${i + 1} of ${selectedImages.length}...`;
                
                const imageData = await loadImage(file);
                const imgDataUrl = imageData.dataURL;
                
                // Determine dimensions based on PDF format
                const imgProps = pdf.getImageProperties(imgDataUrl);
                let pageW, pageH;
                let pdfW, pdfH;
                
                // Get standard page dimensions in mm (default 'p' orientation)
                if (pdfSize !== 'fit') {
                    // Use standard page size (A4: 210x297mm, Letter: 215.9x279.4mm)
                    pdfW = pdf.internal.pageSize.getWidth();
                    pdfH = pdf.internal.pageSize.getHeight();
                } else {
                    // 'Fit Image to Page' logic: set page size based on image ratio
                    const aspectRatio = imgProps.width / imgProps.height;
                    
                    // We'll calculate a standard size based on A4 width and adapt the height
                    const maxW = 210; // A4 width
                    pdfW = maxW;
                    pdfH = maxW / aspectRatio; 
                    
                    // Set the next page to the exact image dimensions (resizing needed)
                    pdf.addPage([pdfW, pdfH], 'p');
                    
                    // The image must fit the page exactly
                    pageW = pdfW;
                    pageH = pdfH;
                }

                if (pdfSize !== 'fit') {
                    // Add new standard page
                    pdf.addPage();
                    pdfW = pdf.internal.pageSize.getWidth();
                    pdfH = pdf.internal.pageSize.getHeight();

                    // Calculate image scaling to fit page while maintaining aspect ratio
                    const ratio = Math.min(pdfW / imgProps.width, pdfH / imgProps.height);
                    pageW = imgProps.width * ratio;
                    pageH = imgProps.height * ratio;

                    // Center the image on the page
                    const x = (pdfW - pageW) / 2;
                    const y = (pdfH - pageH) / 2;
                    
                    pdf.addImage(imgDataUrl, imgProps.fileType, x, y, pageW, pageH);
                } else {
                    // Already added page with custom size above
                    // Add image to fill the custom-sized page entirely
                    pdf.addImage(imgDataUrl, imgProps.fileType, 0, 0, pageW, pageH);
                }
            }

            // Save the PDF
            pdf.save("converted_images.pdf");
            
            statusDiv.textContent = `Success! ${selectedImages.length} images converted and downloaded.`;
            statusDiv.classList.remove('bg-gray-100', 'text-gray-700');
            statusDiv.classList.add('bg-green-100', 'text-green-800');

        } catch (error) {
            console.error('Image to PDF Conversion Error:', error);
            statusDiv.textContent = 'Failed to convert images to PDF.';
            statusDiv.classList.remove('bg-gray-100', 'text-gray-700');
            statusDiv.classList.add('bg-red-100', 'text-red-800');
        } finally {
            convertBtn.disabled = false;
        }
    });
}
// --- LOGIC: PDF SPLITTER (OLD) ---
/**
 * Initializes the PDF Splitter functionality.
 * Note: Requires pdf-lib.min.js loaded via CDN.
 */
function initPdfSplitter() {
    const input = document.getElementById('pdf-splitter-input');
    const controls = document.getElementById('splitter-controls');
    const totalPagesEl = document.getElementById('total-pages');
    const rangesInput = document.getElementById('split-ranges');
    const splitBtn = document.getElementById('btn-split-pdfs');
    const statusDiv = document.getElementById('splitter-status');
    const rangeError = document.getElementById('range-error');

    let pdfFile = null;
    let sourcePdfDoc = null;
    let totalPages = 0;

    // --- Utility Function: Parsing Ranges ---
    /**
     * Parses the range string (e.g., "1-5, 8, 10") into an array of page index arrays.
     * @returns {Array<Array<number>>} An array of page index arrays (0-based), or null on error.
     */
    function parseRanges(rangeStr, maxPages) {
        const parts = rangeStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const result = [];
        const regex = /^(\d+)(-(\d+|END))?$/i; // Matches X, X-Y, X-END

        for (const part of parts) {
            const match = part.match(regex);
            if (!match) return null; // Format error

            let start = parseInt(match[1]);
            let end = maxPages;

            // Check single page (e.g., "8") or start of range (e.g., "1-")
            if (match[3]) {
                // Range specified (e.g., "1-5" or "10-END")
                if (match[3].toUpperCase() !== 'END') {
                    end = parseInt(match[3]);
                }
            } else {
                // Single page specified, end = start
                end = start; 
            }

            // Page numbers must be greater than 0
            if (start < 1 || end < 1) return null;

            // Adjust to 0-based indexing and check boundaries
            const startIdx = start - 1;
            const endIdx = end - 1;

            if (startIdx >= maxPages || endIdx >= maxPages || startIdx > endIdx) return null;
            
            // Push the 0-based index range
            for(let i = startIdx; i <= endIdx; i++) {
                result.push(i);
            }
        }
        
        // Remove duplicates and sort (needed if user enters 1-5, 3)
        const uniqueIndices = [...new Set(result)].sort((a, b) => a - b);
        
        // Group the indices back into ranges for splitting logic (this logic is simplified for speed)
        // We will just process the entire unique set of indices in one go for the single output PDF.
        // For a tool that outputs multiple files, the logic would be much more complex here.
        
        if (uniqueIndices.length === 0) return null;

        // Return 0-based indices to extract
        return uniqueIndices;
    }
    
    // --- Event Handlers ---
    
    // 1. File Upload Handler
    input.addEventListener('change', async (e) => {
        pdfFile = e.target.files[0];
        if (!pdfFile || pdfFile.type !== 'application/pdf') {
            controls.classList.add('hidden');
            return;
        }

        statusDiv.textContent = 'Loading PDF...';
        statusDiv.classList.remove('hidden');
        controls.classList.add('hidden');
        splitBtn.disabled = true;
        rangeError.classList.add('hidden');

        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            sourcePdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            totalPages = sourcePdfDoc.getPageCount();
            
            totalPagesEl.textContent = totalPages;
            controls.classList.remove('hidden');
            statusDiv.classList.add('hidden');
            splitBtn.disabled = false;
            
        } catch (error) {
            console.error('PDF Load Error:', error);
            statusDiv.textContent = 'Error loading PDF. File may be corrupted or encrypted.';
            statusDiv.classList.remove('hidden');
            controls.classList.add('hidden');
        }
    });

    // 2. Range Input Validation
    rangesInput.addEventListener('input', () => {
        splitBtn.disabled = true;
        rangeError.classList.add('hidden');
        
        if (totalPages === 0) return;
        
        const validIndices = parseRanges(rangesInput.value, totalPages);
        
        if (validIndices === null) {
            rangeError.textContent = 'Invalid range format (e.g., 1-5, 8, 10-END) or page number exceeds total.';
            rangeError.classList.remove('hidden');
        } else if (validIndices.length === 0) {
            rangeError.textContent = 'No pages selected.';
            rangeError.classList.remove('hidden');
        } else {
            splitBtn.disabled = false;
        }
    });

    // 3. Split Button Handler
    splitBtn.addEventListener('click', async () => {
        if (!sourcePdfDoc || totalPages === 0 || splitBtn.disabled) return;

        const indicesToExtract = parseRanges(rangesInput.value, totalPages);

        if (!indicesToExtract || indicesToExtract.length === 0) {
            alert('Please check your page ranges.');
            return;
        }

        splitBtn.disabled = true;
        statusDiv.textContent = `Splitting and extracting ${indicesToExtract.length} pages...`;
        statusDiv.classList.remove('hidden', 'bg-red-100', 'text-red-800');
        statusDiv.classList.add('bg-gray-100', 'text-gray-700');

        try {
            // Create the new PDF to contain the extracted pages
            const newPdfDoc = await PDFLib.PDFDocument.create();
            
            // Extract the desired pages (0-based indices)
            const copiedPages = await newPdfDoc.copyPages(sourcePdfDoc, indicesToExtract);
            
            // Add the copied pages to the new document
            copiedPages.forEach(page => newPdfDoc.addPage(page));

            // Serialize and download
            const pdfBytes = await newPdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            
            // Create a download link and trigger download (like your other tools)
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `split_${indicesToExtract[0] + 1}_to_${indicesToExtract[indicesToExtract.length - 1] + 1}_${pdfFile.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            statusDiv.textContent = `Success! ${indicesToExtract.length} pages extracted and downloaded.`;
            statusDiv.classList.remove('bg-gray-100', 'text-gray-700');
            statusDiv.classList.add('bg-green-100', 'text-green-800');


        } catch (error) {
            console.error('PDF Split Error:', error);
            statusDiv.textContent = 'Failed to split PDF.';
            statusDiv.classList.remove('bg-gray-100', 'text-gray-700');
            statusDiv.classList.add('bg-red-100', 'text-red-800');
        } finally {
            splitBtn.disabled = false;
        }
    });
}
// --- LOGIC: PDF MERGER (OLD) ---
function initPdfMerger() {
    // NOTE: For this to work, you MUST include the PDF-LIB library via a CDN script tag
    // e.g., <script src="https://unpkg.com/pdf-lib/dist/pdf-lib.min.js"></script>
    
    const input = document.getElementById('pdf-merger-input');
    const mergeBtn = document.getElementById('btn-merge-pdfs');
    const fileList = document.getElementById('merger-file-list');
    const statusDiv = document.getElementById('merger-status');
    const downloadLink = document.getElementById('merger-download-link');
    const infoText = document.getElementById('merger-info');

    let selectedFiles = [];

    input.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        fileList.innerHTML = '';
        downloadLink.classList.add('hidden');
        statusDiv.classList.add('hidden');

        selectedFiles.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file.name;
            fileList.appendChild(li);
        });

        const count = selectedFiles.length;
        if (count >= 2) {
            mergeBtn.disabled = false;
            infoText.textContent = `Ready to merge ${count} PDFs.`;
        } else {
            mergeBtn.disabled = true;
            infoText.textContent = count === 1 ? 'Please select at least two PDFs.' : 'No PDFs selected.';
        }
    });

    mergeBtn.addEventListener('click', async () => {
        if (selectedFiles.length < 2) return;
        if (!PDFLib) {
             statusDiv.textContent = 'Error: PDF-LIB library not loaded.';
             statusDiv.classList.add('bg-red-100', 'text-red-800');
             statusDiv.classList.remove('hidden');
             return;
        }

        mergeBtn.disabled = true;
        statusDiv.textContent = 'Merging in progress... This may take a moment.';
        statusDiv.classList.remove('hidden', 'bg-green-100', 'text-green-800');
        statusDiv.classList.add('bg-gray-100', 'text-gray-700');
        
        try {
            // Create a new PDF document to hold the merged content
            const mergedPdf = await PDFLib.PDFDocument.create();

            for (const file of selectedFiles) {
                // Read the file buffer
                const arrayBuffer = await file.arrayBuffer();
                
                // Load the source PDF
                const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                
                // Copy all pages from the source PDF to the merged PDF
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });
            }

            // Serialize the merged PDF to bytes
            const mergedPdfBytes = await mergedPdf.save();

            // Create a Blob and a download link
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            downloadLink.href = url;
            downloadLink.classList.remove('hidden');
            statusDiv.textContent = 'Successfully Merged!';
            statusDiv.classList.remove('bg-gray-100', 'text-gray-700');
            statusDiv.classList.add('bg-green-100', 'text-green-800');

        } catch (error) {
            console.error('PDF Merger Error:', error);
            statusDiv.textContent = 'Error merging files. Check console for details.';
            statusDiv.classList.remove('bg-gray-100', 'text-gray-700');
            statusDiv.classList.add('bg-red-100', 'text-red-800');
        } finally {
            mergeBtn.disabled = false;
        }
    });
}
// ... (All other init functions remain the same) ...
function initAttendance() {
    document.getElementById('btn-calc-attendance').addEventListener('click', () => {
        const total = parseFloat(document.getElementById('att-total').value);
        const present = parseFloat(document.getElementById('att-present').value);
        const target = parseFloat(document.getElementById('att-target').value);
        const resultDiv = document.getElementById('att-result');
        const pctDisplay = document.getElementById('att-percentage');
        const msgDisplay = document.getElementById('att-message');

        // Validation
        if (isNaN(total) || isNaN(present) || isNaN(target) || total <= 0) {
            alert("Please enter valid numbers. Total classes must be greater than 0.");
            return;
        }
        if (present > total) {
            alert("Classes attended cannot be greater than classes held!");
            return;
        }

        const currentPct = (present / total) * 100;
        pctDisplay.innerText = currentPct.toFixed(2) + "%";
        resultDiv.classList.remove('hidden');

        // Logic: Need to attend more?
        if (currentPct < target) {
            const needed = Math.ceil((target * total - 100 * present) / (100 - target));
            
            if (needed <= 0) {
                // This handles edge cases where rounding might be tricky close to the target
                msgDisplay.className = "bg-green-100 text-green-800 p-3 rounded-lg";
                msgDisplay.innerHTML = `You are practically at the target! Just attend the next class to be safe.`;
            } else {
                msgDisplay.className = "bg-red-100 text-red-800 p-3 rounded-lg";
                msgDisplay.innerHTML = `⚠️ You are Short!<br>You need to attend <strong>${needed}</strong> more classes consecutively to reach ${target}%.`;
            }
        } 
        // Logic: Can skip?
        else {
            // Calculate how many can be bunked: (Present / (Total + Bunk)) >= Target/100
            const bunkable = Math.floor((100 * present - target * total) / target);
            
            if (bunkable > 0) {
                msgDisplay.className = "bg-green-100 text-green-800 p-3 rounded-lg";
                msgDisplay.innerHTML = `✅ Safe Zone!<br>You can bunk <strong>${bunkable}</strong> classes and still stay above ${target}%.`;
            } else {
                msgDisplay.className = "bg-yellow-100 text-yellow-800 p-3 rounded-lg";
                msgDisplay.innerHTML = `✅ You are on target, but don't bunk any classes right now!`;
            }
        }
    });
}
function initCompressor() {
    const input = document.getElementById('img-input');
    const drop = document.getElementById('drop-zone');
    const slider = document.getElementById('qual-slider');
    let currentFile = null;

    drop.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
        currentFile = e.target.files[0];
        if(currentFile) setupCompressor();
    });

    function setupCompressor() {
        document.getElementById('drop-zone').classList.add('hidden');
        document.getElementById('img-controls').classList.remove('hidden');
        document.getElementById('orig-size').innerText = (currentFile.size/1024).toFixed(1) + ' KB';
        
        slider.addEventListener('input', () => {
            document.getElementById('qual-val').innerText = slider.value;
            runCompression(slider.value / 100);
        });

        document.getElementById('btn-auto-compress').addEventListener('click', async () => {
            const targetKB = parseInt(document.getElementById('target-kb').value);
            let quality = 1.0;
            let blob = null;
            document.getElementById('btn-auto-compress').innerText = "Compressing...";
            while(quality > 0.1) {
                blob = await getCompressedBlob(currentFile, quality);
                if ((blob.size / 1024) < targetKB) break;
                quality -= 0.1;
            }
            updateResultUI(blob);
            document.getElementById('btn-auto-compress').innerText = "Go";
        });

        runCompression(0.8);
    }

    async function runCompression(quality) {
        const blob = await getCompressedBlob(currentFile, quality);
        updateResultUI(blob);
    }

    function getCompressedBlob(file, quality) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(resolve, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function updateResultUI(blob) {
        const url = URL.createObjectURL(blob);
        document.getElementById('new-size').innerText = (blob.size/1024).toFixed(1) + ' KB';
        const btn = document.getElementById('dl-img-btn');
        btn.href = url;
        btn.download = `compressed_${currentFile.name}`;
    }
    
    document.getElementById('mode-manual').onclick = () => {
        document.getElementById('manual-ui').classList.remove('hidden');
        document.getElementById('auto-ui').classList.add('hidden');
    };
    document.getElementById('mode-auto').onclick = () => {
        document.getElementById('manual-ui').classList.add('hidden');
        document.getElementById('auto-ui').classList.remove('hidden');
    };
}
function initPDF() {
    const input = document.getElementById('pdf-input');
    const btn = document.getElementById('btn-compress-pdf');
    const progress = document.getElementById('pdf-progress');
    const status = document.getElementById('pdf-status');

    input.addEventListener('change', () => {
        if(input.files.length > 0) btn.classList.remove('hidden');
    });

    btn.addEventListener('click', async () => {
        const file = input.files[0];
        status.classList.remove('hidden');
        btn.classList.add('hidden');
        
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const newPdf = new jspdf.jsPDF();
            const totalPages = pdf.numPages;

            for (let i = 1; i <= totalPages; i++) {
                document.getElementById('pdf-status-text').innerText = `Processing page ${i} of ${totalPages}...`;
                progress.style.width = `${(i/totalPages)*100}%`;

                const page = await pdf.getPage(i);
                const viewport = page.getViewport({scale: 1.0});
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({canvasContext: ctx, viewport: viewport}).promise;
                const imgData = canvas.toDataURL('image/jpeg', 0.7);
                
                if (i > 1) newPdf.addPage();
                newPdf.setPage(i);
                const imgProps = newPdf.getImageProperties(imgData);
                const pdfWidth = newPdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                newPdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }
            newPdf.save(`compressed_${file.name}`);
            document.getElementById('pdf-status-text').innerText = "Done! Downloading...";
            setTimeout(() => status.classList.add('hidden'), 3000);
        };
        fileReader.readAsArrayBuffer(file);
    });
}
function initHumanizer() {
    document.getElementById('btn-humanize').addEventListener('click', async () => {
        const text = document.getElementById('human-input').value;
        if (!geminiApiKey) return alert('Please set API Key in menu first!');
        
        const resDiv = document.getElementById('human-result');
        resDiv.innerText = "Humanizing...";
        
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "Rewrite this to sound 100% human, vary sentence length, use casual tone: " + text }] }] })
            });
            const data = await res.json();
            resDiv.innerText = data.candidates[0].content.parts[0].text;
        } catch (e) {
            resDiv.innerText = "Error: " + e.message;
        }
    });
}
function initPassword() {
    document.getElementById('btn-gen-pass').addEventListener('click', () => {
        const len = document.getElementById('pass-len').value;
        const useNum = document.getElementById('chk-nums').checked;
        const useSym = document.getElementById('chk-syms').checked;
        let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if(useNum) charset += "0123456789";
        if(useSym) charset += "!@#$%^&*()_+";
        let ret = "";
        for(let i=0; i<len; i++) ret += charset.charAt(Math.floor(Math.random() * charset.length));
        document.getElementById('pass-display').innerText = ret;
    });
}
window.toCase = function(type) {
    const el = document.getElementById('case-in');
    if(type === 'upper') el.value = el.value.toUpperCase();
    if(type === 'lower') el.value = el.value.toLowerCase();
    if(type === 'title') el.value = el.value.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
};
window.countWords = function() {
    const val = document.getElementById('count-in').value;
    document.getElementById('w-count').innerText = val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
    document.getElementById('c-count').innerText = val.length;
}
window.genLorem = function() {
    document.getElementById('lorem-out').innerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
}
window.genQR = function() {
    const txt = document.getElementById('qr-in').value;
    const div = document.getElementById('qr-out');
    div.innerHTML = '';
    if(window.QRCode) new QRCode(div, {text: txt, width: 128, height: 128});
    else {
        const sc = document.createElement('script');
        sc.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
        sc.onload = () => new QRCode(div, {text: txt, width: 128, height: 128});
        document.body.appendChild(sc);
    }
};

const saveBtn = document.getElementById('save-api-key');
if(saveBtn) {
    saveBtn.addEventListener('click', () => {
        const key = document.getElementById('global-api-key').value.trim();
        if(key) {
            localStorage.setItem('articlarity_api_key', key);
            geminiApiKey = key;
            document.getElementById('api-modal').classList.add('hidden');
            alert("Key Saved!");
        }
    });
}