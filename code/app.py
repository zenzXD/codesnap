"""
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
    
    # Create posts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Helper functions
def dict_factory(cursor, row):
    """Convert database row to dictionary"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

# API Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, username, email, created_at FROM users')
    users = cursor.fetchall()
    
    conn.close()
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.get_json()
    
    if not all(key in data for key in ['username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            (data['username'], data['email'], data['password'])  # Password should be hashed in production
        )
        conn.commit()
        
        # Get the created user
        user_id = cursor.lastrowid
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        conn.close()
        return jsonify(user), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username or email already exists'}), 409
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Get all posts with user info"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT posts.id, posts.title, posts.content, posts.created_at, 
           users.id as user_id, users.username
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
    ''')
    posts = cursor.fetchall()
    
    conn.close()
    return jsonify(posts)

@app.route('/api/posts', methods=['POST'])
def create_post():
    """Create a new post"""
    data = request.get_json()
    
    if not all(key in data for key in ['user_id', 'title', 'content']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE id = ?', (data['user_id'],))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        cursor.execute(
            'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
            (data['user_id'], data['title'], data['content'])
        )
        conn.commit()
        
        # Get the created post
        post_id = cursor.lastrowid
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        cursor.execute('''
        SELECT posts.id, posts.title, posts.content, posts.created_at, 
               users.id as user_id, users.username
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.id = ?
        ''', (post_id,))
        post = cursor.fetchone()
        
        conn.close()
        return jsonify(post), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))