# CodeSnap

Aplikasi berbagi kode yang kece badai dengan tampilan yang ciamik dan fitur tracking.

![banner](ss.jpg)

## Struktur Proyek

```
project-root/
├── code/               # Folder untuk file-file kode
│   ├── example.js      # Contoh file JavaScript
│   ├── style.css       # Contoh file CSS
│   └── app.py          # Contoh file Python
├── data/               # Folder untuk file data
│   ├── config.json     # Metadata buat file kode
│   └── siteConfig.json # Konfigurasi website
├── public/             # File statis buat frontend
│   └── index.html      # Halaman utama frontend
├── server.js           # Aplikasi server utama
├── package.json        # Dependensi Node.js
├── vercel.json         # Konfigurasi untuk deploy di Vercel
└── README.md           # File ini
```

## Fitur Keren

- **UI Modern**: Desain bersih dan responsif yang works di semua perangkat
- **URL Pendek**: URL yang enak dibaca dan dishare (misalnya /abc123)
- **Syntax Highlighting**: Pemformatan kode yang cantik untuk berbagai bahasa pemrograman
- **Sinkronisasi Otomatis**: Otomatis mendeteksi file baru dan update config
- **Tracking Statistik**: Ngitung views dan likes untuk setiap snippet kode
- **Likes Sekali Aja**: User cuma bisa ngelike kode sekali (pakai IP dan localStorage)
- **Kopas Langsung**: Gampang copy kode dengan satu klik
- **Pengaturan Kustom**: Ganti nama website, tema, dan info kontak sesuai keinginan

## Endpoint API

- `GET /api/list` - Dapetin semua file kode dengan metadatanya
- `POST /api/like/:shortId` - Nambahin like ke file (sekali per user)
- `GET /:shortId` - Liat kode dengan syntax highlighting
- `GET /raw/:shortId` - Dapetin isi file mentah untuk di-copy
- `GET /api/site-config` - Dapetin konfigurasi website

## Cara Pasang

1. Pastikan punya [Node.js](https://nodejs.org/) (versi 14.x atau lebih tinggi)

2. Clone repository atau download filenya

3. Install dependensinya:
   ```
   npm install
   ```

4. Jalanin servernya:
   ```
   npm start
   ```

5. Buka browser dan kunjungi:
   ```
   http://localhost:3000
   ```

## Cara Deploy ke Vercel

1. Pastikan punya akun [Vercel](https://vercel.com)

2. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

3. Login ke Vercel:
   ```
   vercel login
   ```

4. Deploy project:
   ```
   vercel
   ```

5. Ikuti aja instruksinya, terus tunggu sampai selesai!

## Cara Konfigurasi

### Konfigurasi Website

Kamu bisa kustomisasi tampilan dan info website dengan edit `data/siteConfig.json`:

```json
{
  "name": "CodeSnap",
  "description": "Share kode kamu dengan mudah dan kece",
  "author": "Nama Kamu",
  "contact": "email.kamu@example.com",
  "social": {
    "github": "https://github.com/usernamekamu",
    "twitter": "https://twitter.com/usernamekamu"
  },
  "theme": {
    "primary": "#3498db",
    "secondary": "#2ecc71"
  }
}
```

### Nambahin File Kode

Tinggal masukin file kode kamu ke folder `code/`. Server bakal otomatis deteksi file baru dan update config-nya.

## Cara Kerjanya

1. Pas file ditambahin ke folder `code/`, langsung otomatis kedeteksi dan ditambahin ke `config.json` dengan shortId unik
2. Halaman utama nampilin semua snippet kode yang ada, lengkap dengan info dan statistiknya
3. Setiap snippet kode punya URL sendiri pake shortId (misalnya /abc123)
4. Views dihitung setiap kali ada yang ngunjungin snippet kode
5. Likes dihitung sekali per user pake alamat IP dan localStorage

## Cara Deploy ke Vercel

Vercel adalah platform hosting yang bagus buat web apps Node.js. Berikut cara deploy CodeSnap ke Vercel:

### Cara 1: Deploy Langsung dari Dashboard Vercel

1. Buat akun di [Vercel](https://vercel.com) kalau belum punya
2. Upload project ke GitHub, GitLab, atau Bitbucket
3. Buka dashboard Vercel dan klik "New Project"
4. Import repository dari Git provider yang kamu pilih
5. Pada halaman konfigurasi:
   - Build Command: biarkan kosong (default)
   - Output Directory: biarkan kosong (default)
   - Environment Variables: tidak perlu diisi
6. Klik "Deploy"
7. Tunggu sampai deployment selesai, dan voila! Aplikasi CodeSnap kamu udah live!

### Cara 2: Deploy Pakai Vercel CLI

1. Install Vercel CLI dulu:
   ```bash
   npm install -g vercel
   ```

2. Login ke akun Vercel:
   ```bash
   vercel login
   ```

3. Buka terminal di folder project kamu dan jalankan:
   ```bash
   vercel
   ```

4. Jawab beberapa pertanyaan:
   - Set up and deploy: Yes
   - Which scope: (pilih akun kamu)
   - Link to existing project: No
   - Project name: codesnap (atau nama yang kamu mau)
   - Framework preset: Other
   - Output directory: (kosongkan)
   - Want to override settings: No

5. Tunggu sampai deployment selesai, dan aplikasi kamu sudah online!

### Tentang Deployment di Vercel

CodeSnap sudah dioptimasi untuk Vercel dengan beberapa fitur khusus:

1. **Konfigurasi `vercel.json`**: File ini mengatur cara Vercel menangani rute dan membangun aplikasi kamu

2. **Mode Produksi**: Di Vercel, CodeSnap akan berjalan dalam mode produksi yang menyimpan data di memori (karena Vercel serverless functions tidak bisa menulis file secara permanen)

3. **Konten Sample**: Di Vercel, aplikasi akan menampilkan file contoh yang sudah ditentukan sebelumnya (karena Vercel memiliki filesystem read-only)

### Keterbatasan di Vercel

Ada beberapa keterbatasan saat host di Vercel yang perlu kamu ketahui:

1. **Data tidak persisten**: Likes dan views akan direset setiap kali aplikasi di-deploy ulang atau restart

2. **Tidak bisa menambah file**: Secara teknis fitur upload masih ada, tapi file baru hanya akan ada di memori dan hilang saat app restart

3. **Statistik akan direset**: Setiap kali ada deployment baru, semua statistik (likes, views) akan kembali ke awal

Kamu bisa mengatasi keterbatasan ini dengan menambahkan database eksternal seperti MongoDB, Firebase, atau Supabase, tapi itu di luar cakupan setup dasar ini.

### Kustomisasi Domain

Vercel memungkinkan kamu menggunakan domain kustom untuk aplikasi:

1. Di dashboard Vercel, buka project kamu
2. Klik tab "Domains"
3. Tambahkan domain kustom kamu
4. Ikuti petunjuk untuk mengatur DNS

Setelah pengaturan DNS selesai dan domain terverifikasi, kamu bisa akses CodeSnap kamu dengan domain kustom!
## Cara Deploy ke Vercel

Vercel adalah platform hosting yang bagus buat web apps Node.js. Berikut cara deploy CodeSnap ke Vercel:

### Cara 1: Deploy Langsung dari Dashboard Vercel

1. Buat akun di [Vercel](https://vercel.com) kalau belum punya
2. Upload project ke GitHub, GitLab, atau Bitbucket
3. Buka dashboard Vercel dan klik "New Project"
4. Import repository dari Git provider yang kamu pilih
5. Pada halaman konfigurasi:
   - Build Command: biarkan kosong (default)
   - Output Directory: biarkan kosong (default)
   - Environment Variables: tidak perlu diisi
6. Klik "Deploy"
7. Tunggu sampai deployment selesai, dan voila! Aplikasi CodeSnap kamu udah live!

### Cara 2: Deploy Pakai Vercel CLI

1. Install Vercel CLI dulu:
   ```bash
   npm install -g vercel
   ```

2. Login ke akun Vercel:
   ```bash
   vercel login
   ```

3. Buka terminal di folder project kamu dan jalankan:
   ```bash
   vercel
   ```

4. Jawab beberapa pertanyaan:
   - Set up and deploy: Yes
   - Which scope: (pilih ak# CodeSnap

Aplikasi berbagi kode yang kece badai dengan tampilan yang ciamik dan fitur tracking.

## Struktur Proyek

```
project-root/
├── code/               # Folder untuk file-file kode
│   ├── example.js      # Contoh file JavaScript
│   ├── style.css       # Contoh file CSS
│   └── app.py          # Contoh file Python
├── data/               # Folder untuk file data
│   ├── config.json     # Metadata buat file kode
│   └── siteConfig.json # Konfigurasi website
├── public/             # File statis buat frontend
│   └── index.html      # Halaman utama frontend
├── server.js           # Aplikasi server utama
├── package.json        # Dependensi Node.js
├── vercel.json         # Konfigurasi untuk deploy di Vercel
└── README.md           # File ini
```

## Fitur Keren

- **UI Modern**: Desain bersih dan responsif yang works di semua perangkat
- **URL Pendek**: URL yang enak dibaca dan dishare (misalnya /abc123)
- **Syntax Highlighting**: Pemformatan kode yang cantik untuk berbagai bahasa pemrograman
- **Sinkronisasi Otomatis**: Otomatis mendeteksi file baru dan update config
- **Tracking Statistik**: Ngitung views dan likes untuk setiap snippet kode
- **Likes Sekali Aja**: User cuma bisa ngelike kode sekali (pakai IP dan localStorage)
- **Kopas Langsung**: Gampang copy kode dengan satu klik
- **Pengaturan Kustom**: Ganti nama website, tema, dan info kontak sesuai keinginan

## Endpoint API

- `GET /api/list` - Dapetin semua file kode dengan metadatanya
- `POST /api/like/:shortId` - Nambahin like ke file (sekali per user)
- `GET /:shortId` - Liat kode dengan syntax highlighting
- `GET /raw/:shortId` - Dapetin isi file mentah untuk di-copy
- `GET /api/site-config` - Dapetin konfigurasi website

## Cara Pasang

1. Pastikan punya [Node.js](https://nodejs.org/) (versi 14.x atau lebih tinggi)

2. Clone repository atau download filenya

3. Install dependensinya:
   ```
   npm install
   ```

4. Jalanin servernya:
   ```
   npm start
   ```

5. Buka browser dan kunjungi:
   ```
   http://localhost:3000
   ```

## Cara Deploy ke Vercel

1. Pastikan punya akun [Vercel](https://vercel.com)

2. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

3. Login ke Vercel:
   ```
   vercel login
   ```

4. Deploy project:
   ```
   vercel
   ```

5. Ikuti aja instruksinya, terus tunggu sampai selesai!

## Cara Konfigurasi

### Konfigurasi Website

Kamu bisa kustomisasi tampilan dan info website dengan edit `data/siteConfig.json`:

```json
{
  "name": "CodeSnap",
  "description": "Share kode kamu dengan mudah dan kece",
  "author": "Nama Kamu",
  "contact": "email.kamu@example.com",
  "social": {
    "github": "https://github.com/usernamekamu",
    "twitter": "https://twitter.com/usernamekamu"
  },
  "theme": {
    "primary": "#3498db",
    "secondary": "#2ecc71"
  }
}
```

### Nambahin File Kode

Tinggal masukin file kode kamu ke folder `code/`. Server bakal otomatis deteksi file baru dan update config-nya.

## Cara Kerjanya

1. Pas file ditambahin ke folder `code/`, langsung otomatis kedeteksi dan ditambahin ke `config.json` dengan shortId unik
2. Halaman utama nampilin semua snippet kode yang ada, lengkap dengan info dan statistiknya
3. Setiap snippet kode punya URL sendiri pake shortId (misalnya /abc123)
4. Views dihitung setiap kali ada yang ngunjungin snippet kode
5. Likes dihitung sekali per user pake alamat IP dan localStorage

## Lisensi

Proyek ini open source, bebas dipake dan dimodifikasi sesuka hati.
