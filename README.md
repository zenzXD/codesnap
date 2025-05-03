# CodeSnap

A modern code sharing platform with beautiful syntax highlighting and tracking features.

## Project Structure

```
project-root/
├── code/               # Directory for code files
│   ├── example.js      # Example JavaScript file
│   ├── style.css       # Example CSS file
│   └── app.py          # Example Python file
├── data/               # Directory for data files
│   ├── config.json     # Metadata for code files
│   └── siteConfig.json # Site configuration
├── public/             # Static files for frontend
│   └── index.html      # Main frontend page
├── server.js           # Main server application
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Features

- **Modern UI**: Clean, responsive design that works on all devices
- **Short URLs**: Clean, short URLs for easy sharing (e.g., /abc123)
- **Syntax Highlighting**: Beautiful code highlighting for various programming languages
- **Automatic File Synchronization**: Automatically detects new files and updates config
- **Statistics Tracking**: Tracks views and likes for each code snippet
- **One-time Likes**: Users can only like a code snippet once (using IP and localStorage)
- **Copy Functionality**: Easy one-click copying of code
- **Customizable Site Settings**: Configure website name, theme, and contact information

## API Endpoints

- `GET /api/list` - List all code files with metadata
- `POST /api/like/:shortId` - Increment like count for a file (once per user)
- `GET /:shortId` - View code with syntax highlighting
- `GET /raw/:shortId` - Get raw file content for copying
- `GET /api/site-config` - Get site configuration

## Setup and Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 14.x or higher recommended)

2. Clone the repository or download the files

3. Install the dependencies:
   ```
   npm install express
   ```

4. Start the server:
   ```
   node server.js
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Configuration

### Site Configuration

You can customize the website's appearance and information by editing `data/siteConfig.json`:

```json
{
  "name": "CodeSnap",
  "description": "Share your code snippets easily and beautifully",
  "author": "Your Name",
  "contact": "your.email@example.com",
  "social": {
    "github": "https://github.com/yourusername",
    "twitter": "https://twitter.com/yourusername"
  },
  "theme": {
    "primary": "#3498db",
    "secondary": "#2ecc71"
  }
}
```

### Adding Code Files

Simply add your code files to the `code/` directory. The server will automatically detect new files and update the config.

## How It Works

1. When a file is added to the `code/` directory, it's automatically detected and added to `config.json` with a unique shortId
2. The home page displays all available code snippets with information and stats
3. Each code snippet has its own URL using the shortId (e.g., /abc123)
4. Views are tracked every time someone visits a code snippet
5. Likes are tracked once per user using IP address and localStorage

## License

This project is open source, feel free to use and modify as needed.