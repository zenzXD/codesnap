const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store IP addresses that liked files
const ipLikes = {};

// Make sure we initialize the code and data directories
const codeDir = path.join(__dirname, 'code');
const dataDir = path.join(__dirname, 'data');

// Ensure required directories exist
if (!fs.existsSync(codeDir)) {
  fs.mkdirSync(codeDir, { recursive: true });
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Check if config.json exists, if not create it
const configPath = path.join(dataDir, 'config.json');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
}

// Load site settings from siteConfig.json
let siteConfig = {};
const siteConfigPath = path.join(dataDir, 'siteConfig.json');

function loadSiteConfig() {
  if (fs.existsSync(siteConfigPath)) {
    try {
      siteConfig = JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
    } catch (error) {
      console.error('Error loading site config:', error);
      siteConfig = {
        name: 'CodeSnap',
        description: 'Share code snippets easily',
        author: 'CodeSnap Team',
        contact: 'contact@codesnap.com',
        social: {
          github: 'https://github.com/codesnap',
          twitter: 'https://twitter.com/codesnap'
        },
        theme: {
          primary: '#3498db',
          secondary: '#2ecc71'
        }
      };
      fs.writeFileSync(siteConfigPath, JSON.stringify(siteConfig, null, 2));
    }
  } else {
    // Create default site config
    siteConfig = {
      name: 'CodeSnap',
      description: 'Share code snippets easily',
      author: 'CodeSnap Team',
      contact: 'contact@codesnap.com',
      social: {
        github: 'https://github.com/codesnap',
        twitter: 'https://twitter.com/codesnap'
      },
      theme: {
        primary: '#3498db',
        secondary: '#2ecc71'
      }
    };
    fs.writeFileSync(siteConfigPath, JSON.stringify(siteConfig, null, 2));
  }
  return siteConfig;
}

// Function to generate a unique ID for each file
function generateUniqueId(length = 8) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to synchronize files with config
function syncFiles() {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const fileNames = fs.readdirSync(codeDir);
  
  // Add new files to config
  fileNames.forEach(fileName => {
    if (!config[fileName]) {
      const shortId = generateUniqueId();
      config[fileName] = {
        title: fileName,
        likes: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        shortId: shortId
      };
    }
  });
  
  // Remove deleted files from config
  Object.keys(config).forEach(fileName => {
    if (!fileNames.includes(fileName)) {
      delete config[fileName];
    }
  });
  
  // Save updated config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return config;
}

// Watch the code directory for changes
fs.watch(codeDir, (eventType, filename) => {
  if (filename) {
    console.log(`File ${filename} was ${eventType}d`);
    syncFiles();
  }
});

// Routes
app.get('/api/list', (req, res) => {
  const config = syncFiles();
  res.json(config);
});

app.post('/api/save', (req, res) => {
  const { fileName, content } = req.body;
  
  if (!fileName || !content) {
    return res.status(400).json({ error: 'File name and content are required' });
  }
  
  // Validate file name to prevent directory traversal
  if (fileName.includes('/') || fileName.includes('\\')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }
  
  try {
    const filePath = path.join(codeDir, fileName);
    fs.writeFileSync(filePath, content);
    
    // Update config.json
    syncFiles();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

app.post('/api/like/:shortId', (req, res) => {
  const { shortId } = req.params;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  // Find the file with this shortId
  let fileName = null;
  Object.entries(config).forEach(([name, data]) => {
    if (data.shortId === shortId) {
      fileName = name;
    }
  });
  
  if (!fileName) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const filePath = path.join(codeDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on disk' });
  }
  
  // Check if this IP has already liked this file
  const likeKey = `${clientIp}-${shortId}`;
  if (ipLikes[likeKey]) {
    return res.json({ likes: config[fileName].likes, alreadyLiked: true });
  }
  
  // Mark this IP as having liked this file
  ipLikes[likeKey] = true;
  
  config[fileName].likes += 1;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  res.json({ likes: config[fileName].likes, alreadyLiked: false });
});

app.get('/:shortId', (req, res) => {
  const { shortId } = req.params;
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const siteSettings = loadSiteConfig();
  
  // Find the file with this shortId
  let fileName = null;
  let fileData = null;
  
  Object.entries(config).forEach(([name, data]) => {
    if (data.shortId === shortId) {
      fileName = name;
      fileData = data;
    }
  });
  
  if (!fileName || !fileData) {
    return res.status(404).send('File not found');
  }
  
  const filePath = path.join(codeDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found on disk');
  }
  
  // Increment views
  fileData.views += 1;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const fileExtension = path.extname(fileName).substring(1);
  
  // Create an HTML page with syntax highlighting using highlight.js
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${fileData.title} - ${siteSettings.name}</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
      <style>
        :root {
          --primary-color: ${siteSettings.theme.primary};
          --secondary-color: ${siteSettings.theme.secondary};
          --bg-color: #f8f9fa;
          --code-bg: #282c34;
          --text-color: #333;
          --light-text: #f8f9fa;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          background-color: var(--bg-color);
          color: var(--text-color);
        }
        
        header {
          background-color: var(--primary-color);
          color: white;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .logo a {
          color: white;
          text-decoration: none;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .code-title {
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .stats {
          display: flex;
          gap: 1rem;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .code-container {
          background-color: var(--code-bg);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        
        .code-toolbar {
          background-color: #21252b;
          padding: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .file-info {
          color: #abb2bf;
          font-size: 0.9rem;
        }
        
        .toolbar-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .toolbar-btn {
          background: none;
          border: none;
          color: #abb2bf;
          cursor: pointer;
          padding: 0.3rem 0.5rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.85rem;
        }
        
        .toolbar-btn:hover {
          background-color: #2c313a;
        }
        
        pre {
          margin: 0;
          padding: 1rem;
          border-radius: 0;
          overflow: auto;
          max-height: 70vh;
        }
        
        code {
          font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace;
          font-size: 14px;
        }
        
        .actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 0.5rem 1rem;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          background-color: var(--secondary-color);
        }
        
        .btn-secondary {
          background-color: #6c757d;
        }
        
        .btn-secondary:hover {
          background-color: #5a6268;
        }
        
        footer {
          margin-top: 3rem;
          padding: 1rem;
          background-color: #343a40;
          color: white;
          text-align: center;
        }
        
        .social-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .social-links a {
          color: white;
          font-size: 1.5rem;
        }
        
        .copy-tooltip {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .copy-tooltip.show {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .code-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .stats {
            margin-top: 0.5rem;
          }
          
          .actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <div class="logo"><a href="/">${siteSettings.name}</a></div>
      </header>
      
      <div class="container">
        <div class="code-header">
          <div class="code-title">${fileData.title}</div>
          <div class="stats">
            <div class="stat">
              <i class="fas fa-eye"></i>
              <span>${fileData.views} views</span>
            </div>
            <div class="stat">
              <i class="fas fa-heart"></i>
              <span id="likes">${fileData.likes} likes</span>
            </div>
          </div>
        </div>
        
        <div class="code-container">
          <div class="code-toolbar">
            <div class="file-info">${fileName}</div>
            <div class="toolbar-actions">
              <button class="toolbar-btn" id="copyBtn">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>
          <pre><code class="language-${fileExtension}">${fileContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          <div class="copy-tooltip" id="copyTooltip">Copied!</div>
        </div>
        
        <div class="actions">
          <button class="btn" id="likeBtn">
            <i class="fas fa-heart"></i> Like
          </button>
          <button class="btn btn-secondary" onclick="window.location.href='/raw/${shortId}'">
            <i class="fas fa-code"></i> Raw
          </button>
          <button class="btn btn-secondary" onclick="window.location.href='/'">
            <i class="fas fa-arrow-left"></i> Back to List
          </button>
        </div>
      </div>
      
      <footer>
        <p>&copy; ${new Date().getFullYear()} ${siteSettings.name} - ${siteSettings.description}</p>
        <p>Created by ${siteSettings.author}</p>
        <div class="social-links">
          ${siteSettings.social.github ? `<a href="${siteSettings.social.github}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
          ${siteSettings.social.twitter ? `<a href="${siteSettings.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
        </div>
      </footer>
      
      <script>
        // Initialize syntax highlighting
        document.addEventListener('DOMContentLoaded', () => {
          hljs.highlightAll();
        });
        
        // Like button functionality
        document.getElementById('likeBtn').addEventListener('click', async () => {
          try {
            const response = await fetch('/api/like/${shortId}', {
              method: 'POST'
            });
            const data = await response.json();
            document.getElementById('likes').textContent = data.likes + ' likes';
            
            if (data.alreadyLiked) {
              alert('You have already liked this code!');
            }
            
            // Store in localStorage that user has liked this file
            localStorage.setItem('liked-${shortId}', 'true');
            
            // Disable button if already liked
            if (data.alreadyLiked || localStorage.getItem('liked-${shortId}') === 'true') {
              document.getElementById('likeBtn').disabled = true;
              document.getElementById('likeBtn').style.opacity = '0.5';
            }
          } catch (error) {
            console.error('Error liking the file:', error);
          }
        });
        
        // Check if user has already liked this file
        if (localStorage.getItem('liked-${shortId}') === 'true') {
          document.getElementById('likeBtn').disabled = true;
          document.getElementById('likeBtn').style.opacity = '0.5';
        }
        
        // Copy button functionality
        document.getElementById('copyBtn').addEventListener('click', () => {
          const codeContent = document.querySelector('pre code').textContent;
          navigator.clipboard.writeText(codeContent).then(() => {
            const tooltip = document.getElementById('copyTooltip');
            tooltip.classList.add('show');
            setTimeout(() => {
              tooltip.classList.remove('show');
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy text: ', err);
          });
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

app.get('/raw/:shortId', (req, res) => {
  const { shortId } = req.params;
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  // Find the file with this shortId
  let fileName = null;
  
  Object.entries(config).forEach(([name, data]) => {
    if (data.shortId === shortId) {
      fileName = name;
    }
  });
  
  if (!fileName) {
    return res.status(404).send('File not found');
  }
  
  const filePath = path.join(codeDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found on disk');
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  res.setHeader('Content-Type', 'text/plain');
  res.send(fileContent);
});

// Add API endpoint for site config
app.get('/api/site-config', (req, res) => {
  const config = loadSiteConfig();
  res.json(config);
});

// Initialize necessary data on server start
function initializeApp() {
  // Load site config
  loadSiteConfig();
  
  // Sync files
  syncFiles();
  
  console.log('App initialized successfully');
}

// Start server
app.listen(PORT, () => {
  console.log(`CodeSnap server running on http://localhost:${PORT}`);
  initializeApp();
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
