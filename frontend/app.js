document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topic-input');
    const generateBtn = document.getElementById('generate-btn');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');

    const statuses = [
        "Writer is drafting...",
        "Dispatching to AXL mesh...",
        "Checker is analyzing facts...",
        "Editor is polishing final draft...",
        "Waiting for Editor consensus..."
    ];

    let statusInterval;

    generateBtn.addEventListener('click', async () => {
        const topic = topicInput.value.trim();
        if (!topic) return;

        // Reset UI
        topicInput.disabled = true;
        generateBtn.disabled = true;
        resultSection.classList.add('hidden');
        statusIndicator.classList.remove('hidden');
        
        // Cycle statuses to simulate mesh progress
        let statusIndex = 0;
        statusText.innerText = statuses[0];
        statusInterval = setInterval(() => {
            statusIndex = (statusIndex + 1) % statuses.length;
            statusText.innerText = statuses[statusIndex];
        }, 4000); // Change text every 4 seconds

        try {
            // Assuming FastAPI runs on 8000 locally
            const response = await fetch('http://127.0.0.1:8000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            clearInterval(statusInterval);
            statusIndicator.classList.add('hidden');
            resultSection.classList.remove('hidden');
            
            if (data.status === 'success') {
                resultContent.innerHTML = marked.parse(data.content);
                
                // Add Copy Button to Editor Action
                const headings = resultContent.querySelectorAll('h2');
                headings.forEach(h2 => {
                    if (h2.textContent.trim() === 'Editor Action') {
                        h2.style.display = 'flex';
                        h2.style.justifyContent = 'space-between';
                        h2.style.alignItems = 'center';
                        
                        const btnGroup = document.createElement('div');
                        btnGroup.className = 'action-btn-group';
                        
                        // Share Button
                        const shareBtn = document.createElement('button');
                        shareBtn.className = 'copy-btn';
                        shareBtn.innerHTML = `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                        `;
                        
                        shareBtn.addEventListener('click', () => {
                            let textToShare = '';
                            let nextNode = h2.nextElementSibling;
                            while (nextNode) {
                                textToShare += nextNode.innerText + '\n\n';
                                nextNode = nextNode.nextElementSibling;
                            }
                            
                            if (navigator.share) {
                                navigator.share({
                                    title: 'GhostWriter Swarm Content',
                                    text: textToShare.trim(),
                                }).catch(err => console.log('Error sharing', err));
                            } else {
                                const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare.substring(0, 240) + '...')}`;
                                window.open(tweetUrl, '_blank');
                            }
                        });

                        // Copy Button
                        const copyBtn = document.createElement('button');
                        copyBtn.className = 'copy-btn';
                        copyBtn.innerHTML = `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        `;
                        
                        copyBtn.addEventListener('click', () => {
                            let textToCopy = '';
                            let nextNode = h2.nextElementSibling;
                            while (nextNode) {
                                textToCopy += nextNode.innerText + '\n\n';
                                nextNode = nextNode.nextElementSibling;
                            }
                            
                            navigator.clipboard.writeText(textToCopy.trim()).then(() => {
                                copyBtn.innerHTML = `
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A29BFE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                `;
                                setTimeout(() => {
                                    copyBtn.innerHTML = `
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    `;
                                }, 2000);
                            });
                        });
                        
                        btnGroup.appendChild(shareBtn);
                        btnGroup.appendChild(copyBtn);
                        h2.appendChild(btnGroup);
                    }
                });

            } else {
                resultContent.innerText = 'Failed to generate content.';
            }

        } catch (error) {
            console.error('Error:', error);
            clearInterval(statusInterval);
            statusIndicator.classList.add('hidden');
            resultSection.classList.remove('hidden');
            resultContent.innerText = 'Error connecting to the Writer agent. Is the FastAPI backend running?';
        } finally {
            topicInput.disabled = false;
            generateBtn.disabled = false;
        }
    });

    topicInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
    });
});
