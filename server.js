;const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Check if we're in development or production
const isDev = process.env.NODE_ENV !== 'production';

// Store IP addresses that liked files
const ipLikes = {};

// In-memory storage for Vercel environment where file system is read-only
let inMemoryConfig = {};
let inMemorySiteConfig = {};

// Make sure we initialize the code and data directories
const codeDir = path.join(__dirname, 'code');
const dataDir = path.join(__dirname, 'data');

// Ensure required directories exist (only in development)
if (isDev) {
  if (!fs.existsSync(codeDir)) {
    fs.mkdirSync(codeDir, { recursive: true });
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Path to config.json
const configPath = path.join(dataDir, 'config.json');
// Path to siteConfig.json
const siteConfigPath = path.join(dataDir, 'siteConfig.json');

// Default site config
const defaultSiteConfig = {
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

// Function to load site config
function loadSiteConfig() {
  // In production (Vercel), use in-memory config
  if (!isDev) {
    // If in-memory config is empty, initialize it
    if (Object.keys(inMemorySiteConfig).length === 0) {
      inMemorySiteConfig = defaultSiteConfig;
    }
    return inMemorySiteConfig;
  }

  // In development, use file system
  if (fs.existsSync(siteConfigPath)) {
    try {
      return JSON.parse(fs.readFileSync(siteConfigPath, 'utf-8'));
    } catch (error) {
      console.error('Error loading site config:', error);
      // Create default site config if error
      fs.writeFileSync(siteConfigPath, JSON.stringify(defaultSiteConfig, null, 2));
      return defaultSiteConfig;
    }
  } else {
    // Create default site config if it doesn't exist
    fs.writeFileSync(siteConfigPath, JSON.stringify(defaultSiteConfig, null, 2));
    return defaultSiteConfig;
  }
}

// Default sample code files for production environment
const sampleFiles = {
  'example.js': {
    content: `/**
 * Example JavaScript file to demonstrate code sharing
 */
function greet(name) {
  return \`Hello, \${name}!\`;
}

class Calculator {
  add(a, b) {
    return a + b;
  }
  
  subtract(a, b) {
    return a - b;
  }
  
  multiply(a, b) {
    return a * b;
  }
  
  divide(a, b) {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }
    return a / b;
  }
}

// Usage example
const calc = new Calculator();
console.log(greet("User"));
console.log(\`2 + 3 = \${calc.add(2, 3)}\`);
console.log(\`5 - 2 = \${calc.subtract(5, 2)}\`);
console.log(\`4 * 6 = \${calc.multiply(4, 6)}\`);
console.log(\`10 / 2 = \${calc.divide(10, 2)}\`);`,
    metadata: {
      title: 'Example JavaScript File',
      likes: 0,
      views: 0,
      createdAt: '2025-05-03T12:00:00Z',
      shortId: 'a1b2c3d4'
    }
  },
  'style.css': {
    content: `/**
 * Modern CSS styles with variables and responsive design
 */

:root {
  /* Main colors */
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --accent-color: #e74c3c;
  --dark-color: #2c3e50;
  --light-color: #ecf0f1;
  
  /* Typography */
  --font-main: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-heading: 'Poppins', sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-main);
  line-height: 1.6;
  color: var(--dark-color);
  background-color: var(--light-color);
}`,
    metadata: {
      title: 'CSS Styling Example',
      likes: 0,
      views: 0,
      createdAt: '2025-05-03T12:30:00Z',
      shortId: 'e5f6g7h8'
    }
  },
  'app.py': {
    content: `"""
Example Python application with Flask
A simple API server with database connection
"""
from flask import Flask, jsonify, request
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)

# Database setup
DB_PATH = "database.db"

def init_db():
    """Initialize the database with tables if not exists"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()`,
    metadata: {
      title: 'Python Application',
      likes: 0,
      views: 0,
      createdAt: '2025-05-03T13:00:00Z',
      shortId: 'i9j0k1l2'
    }
  }
};

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
  // In production (Vercel), use in-memory config and sample files
  if (!isDev) {
    // If in-memory config is empty, initialize it with sample files
    if (Object.keys(inMemoryConfig).length === 0) {
      Object.entries(sampleFiles).forEach(([fileName, fileData]) => {
        inMemoryConfig[fileName] = fileData.metadata;
      });
    }
    return inMemoryConfig;
  }

  // In development, use file system
  // Initialize config.json if it doesn't exist
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
  }
  
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

// Only watch the code directory for changes in development mode
if (isDev) {
  // Initialize config.json if needed
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
  }
  
  // Watch for file changes
  fs.watch(codeDir, (eventType, filename) => {
    if (filename) {
      console.log(`File ${filename} was ${eventType}d`);
      syncFiles();
    }
  });
}

// Route for API site config 
app.get('/api/site-config', (req, res) => {
  const config = loadSiteConfig();
  res.json(config);
});

app.get('/api/list', (req, res) => {
  const config = syncFiles();
  res.json(config);
});

app.post('/api/like/:shortId', (req, res) => {
  const { shortId } = req.params;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // In production (Vercel), use in-memory config
  if (!isDev) {
    // Find the file with this shortId
    let fileName = null;
    Object.entries(inMemoryConfig).forEach(([name, data]) => {
      if (data.shortId === shortId) {
        fileName = name;
      }
    });
    
    if (!fileName) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if this IP has already liked this file
    const likeKey = `${clientIp}-${shortId}`;
    if (ipLikes[likeKey]) {
      return res.json({ likes: inMemoryConfig[fileName].likes, alreadyLiked: true });
    }
    
    // Mark this IP as having liked this file
    ipLikes[likeKey] = true;
    
    inMemoryConfig[fileName].likes += 1;
    
    return res.json({ likes: inMemoryConfig[fileName].likes, alreadyLiked: false });
  }
  
  // In development, use file system
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
  
  // In production (Vercel), use in-memory config and sample files
  if (!isDev) {
    // Find the file with this shortId
    let fileName = null;
    let fileData = null;
    
    Object.entries(inMemoryConfig).forEach(([name, data]) => {
      if (data.shortId === shortId) {
        fileName = name;
        fileData = data;
      }
    });
    
    if (!fileName || !fileData) {
      return res.status(404).send('File not found');
    }
    
    // Get file content from sample files
    const fileContent = sampleFiles[fileName].content;
    const siteSettings = loadSiteConfig();
    
    // Increment views
    fileData.views += 1;
    
    const fileExtension = path.extname(fileName).substring(1);
    
    // Create HTML page with syntax highlighting
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
    
    return res.send(html);
  }
  
  // In development, use file system
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
// Bagian endpoint untuk raw file
app.get('/raw/:shortId', (req, res) => {
  const { shortId } = req.params;
  
  // In production (Vercel), use in-memory config and sample files
  if (!isDev) {
    // Find the file with this shortId
    let fileName = null;
    
    Object.entries(inMemoryConfig).forEach(([name, data]) => {
      if (data.shortId === shortId) {
        fileName = name;
      }
    });
    
    if (!fileName) {
      return res.status(404).send('File not found');
    }
    
    // Get file content from sample files
    const fileContent = sampleFiles[fileName].content;
    
    res.setHeader('Content-Type', 'text/plain');
    return res.send(fileContent);
  }
  
  // In development, use file system
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

// Save API endpoint
app.post('/api/save', (req, res) => {
  const { fileName, content } = req.body;
  
  if (!fileName || !content) {
    return res.status(400).json({ error: 'File name and content are required' });
  }
  
  // Validate file name to prevent directory traversal
  if (fileName.includes('/') || fileName.includes('\\')) {
    return res.status(400).json({ error: 'Invalid file name' });
  }
  
  // In production (Vercel), use in-memory storage
  if (!isDev) {
    const shortId = generateUniqueId();
    
    // Add to in-memory configs
    inMemoryConfig[fileName] = {
      title: fileName,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      shortId: shortId
    };
    
    // Add to sample files
    sampleFiles[fileName] = {
      content: content,
      metadata: inMemoryConfig[fileName]
    };
    
    return res.json({ success: true, shortId: shortId });
  }
  
  // In development, use file system
  try {
    const filePath = path.join(codeDir, fileName);
    fs.writeFileSync(filePath, content);
    
    // Update config.json with syncFiles
    const config = syncFiles();
    
    // Return the shortId for the new file
    const shortId = config[fileName].shortId;
    
    res.json({ success: true, shortId: shortId });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

// Initialize necessary data on server start
function initializeApp() {
  if (isDev) {
    // Load site config from file
    loadSiteConfig();
    
    // Sync files from file system
    syncFiles();
    
    console.log('App initialized in development mode');
  } else {
    // Initialize in-memory configs for production (Vercel)
    loadSiteConfig();
    syncFiles();
    
    console.log('App initialized in production mode (Vercel)');
  }
}

// For Vercel serverless functions
if (process.env.VERCEL) {
  initializeApp();
}

// Start server (only in development)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CodeSnap server running on http://localhost:${PORT}`);
    initializeApp();
  });
}

// Export app for Vercel
module.exports = app;