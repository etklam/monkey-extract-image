// ==UserScript==
// @name         Extract and Display All Images in One Page
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Extract all image links (including plain text URLs) from a webpage and display them on a single new page with options to open or download.
// @author       Elliot | ETKLAM@Github
// @match        *://*/*
// @grant        window.open
// ==/UserScript==

(function() {
    'use strict';

    // Create a button to trigger the functionality
    let button = document.createElement('button');
    button.innerHTML = 'Extract and Display All Images';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    document.body.appendChild(button);

    button.addEventListener('click', function() {
        // Define common image file extensions
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)(?=\s|$|\?|#)/i;

        // A set to store all image URLs
        let imageUrls = new Set();

        // 1. Extract src from img tags
        const imgElements = document.getElementsByTagName('img');
        for (let img of imgElements) {
            if (img.src && imageExtensions.test(img.src)) {
                imageUrls.add(img.src);
            }
        }

        // 2. Extract href from a tags
        const linkElements = document.getElementsByTagName('a');
        for (let link of linkElements) {
            if (link.href && imageExtensions.test(link.href)) {
                imageUrls.add(link.href);
            }
        }

        // 3. Extract image URLs from plain text on the page
        const textContent = document.body.innerText;
        const urlRegex = /https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|bmp|webp|svg)(?=\s|$|\?|#)/gi;
        let match;
        while ((match = urlRegex.exec(textContent)) !== null) {
            imageUrls.add(match[0]);
        }

        // If no images are found, show a message
        if (imageUrls.size === 0) {
            alert('No image links found on this page!');
            return;
        }

        // Create the HTML content for the new page
        let htmlContent = `
            <html>
            <head>
                <title>Extracted Images - ${imageUrls.size} Found</title>
                <style>
                    body {
                        background-color: #f0f0f0;
                        margin: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .image-container {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 20px;
                        justify-content: center;
                    }
                    .image-item {
                        max-width: 600px;
                        margin: 15px;
                        text-align: center;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                        border: 2px solid #ddd;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: transform 0.2s;
                    }
                    img:hover {
                        transform: scale(1.05);
                        border-color: #4CAF50;
                    }
                    .image-url {
                        word-break: break-all;
                        font-size: 14px;
                        color: #666;
                        margin-top: 8px;
                    }
                    .download-btn {
                        margin-top: 8px;
                        padding: 5px 10px;
                        background-color: #008CBA;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                    }
                    .download-btn:hover {
                        background-color: #006d9e;
                    }
                </style>
            </head>
            <body>
                <h1>${imageUrls.size} Images Found</h1>
                <div class="image-container">
        `;

        // Add each image and download button
        imageUrls.forEach(url => {
            htmlContent += `
                <div class="image-item">
                    <img src="${url}" alt="Image" data-url="${url}">
                    <div class="image-url">${url}</div>
                    <button class="download-btn" data-url="${url}">Download</button>
                </div>
            `;
        });

        htmlContent += `
                </div>
                <script>
                    // Handle image click events
                    document.querySelectorAll('.image-item img').forEach(img => {
                        img.addEventListener('click', function() {
                            window.open(this.getAttribute('data-url'), '_blank');
                        });
                    });
                    // Handle download button clicks
                    document.querySelectorAll('.download-btn').forEach(btn => {
                        btn.addEventListener('click', async function() {
                            const url = this.getAttribute('data-url');
                            try {
                                const response = await fetch(url, {
                                    mode: 'cors',
                                    credentials: 'omit'
                                });
                                if (!response.ok) throw new Error('Network response error');
                                const blob = await response.blob();
                                const blobUrl = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = url.split('/').pop() || 'image';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(blobUrl);
                            } catch (error) {
                                console.error('Download failed:', error);
                                alert('Download failed, possibly due to cross-origin restrictions. Try clicking the image and saving manually.');
                            }
                        });
                    });
                </script>
            </body>
            </html>
        `;

        // Open a new tab and write the content
        let newWindow = window.open('');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    });
})();