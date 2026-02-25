<div align="center">

<img src="public/pagepix.svg" alt="PagePix Logo" width="120" />

# PagePix

**PDF to images, done right.**

Drop a PDF, get perfectly organized images. Every page, every time.

[![Release](https://img.shields.io/github/v/release/Razee4315/pagepix)](https://github.com/Razee4315/pagepix/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/Razee4315/pagepix/ci.yml)](https://github.com/Razee4315/pagepix/actions)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Windows** &middot; macOS &middot; Linux

</div>

---

## Why PagePix

Converting PDFs to images shouldn't require online tools, bloated software, or command-line gymnastics.

PagePix does one thing and does it perfectly: takes a multi-page PDF and converts every page into individual high-quality images, organized into a clean, dedicated folder. Drop. Convert. Done.

---

## Overview

PagePix is a lightweight desktop utility built with Tauri. It runs natively on your machine -- no internet required, no file uploads, no privacy concerns. Your documents never leave your computer.

<p align="center">
  <img src="images/home.png" alt="Home Screen" width="380" />
  <img src="images/processing.png" alt="Converting" width="380" />
</p>

---

## Features

- **Drag and Drop** -- Drop a PDF directly onto the window
- **Three Output Formats** -- PNG (lossless), JPEG (compact), WebP (modern)
- **300 DPI Rendering** -- High-quality output powered by PDFium
- **Real-Time Progress** -- Watch page thumbnails appear as they convert
- **Auto-Organized** -- Images saved to a folder named after your PDF
- **Custom Naming** -- Choose from 4 naming patterns for output files
- **Dark and Light Mode** -- System-aware with manual toggle
- **Configurable Output** -- Set default directory, format, and quality

---

## Installation

Download the latest release:

| Platform | Download |
|----------|----------|
| Windows | [`.msi`](https://github.com/Razee4315/pagepix/releases/latest) (recommended), [`.exe`](https://github.com/Razee4315/pagepix/releases/latest) |

---

## Usage

1. **Open** PagePix
2. **Drop** a PDF onto the window (or click to browse)
3. **Wait** -- watch the progress bar and thumbnails appear
4. **Done** -- click "Open Folder" to see your images

### Settings

Open settings via the gear icon to configure:

| Setting | Options |
|---------|---------|
| Format | PNG, JPEG, WebP |
| Quality | 10-100% (JPEG/WebP only) |
| Output Directory | Same as PDF / custom folder |
| Naming Pattern | `report_page_001`, `report_1`, `page_001`, `001` |
| Theme | Light, Dark, System |

---

## Development

### Requirements

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.70+
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)
- PDFium binary (see below)

### Setup

```bash
# Clone the repo
git clone https://github.com/Razee4315/pagepix.git
cd pagepix

# Install frontend dependencies
npm install

# Install Tauri plugins (if not already in Cargo.lock)
cd src-tauri
cargo add tauri-plugin-dialog tauri-plugin-fs tauri-plugin-store
cd ..
```

### PDFium Setup

PagePix uses [pdfium-render](https://github.com/ajrcarey/pdfium-render) which requires the PDFium shared library at runtime. Pre-built binaries are provided by [bblanchon/pdfium-binaries](https://github.com/bblanchon/pdfium-binaries).

**Windows:**
```powershell
cd src-tauri
Invoke-WebRequest -Uri "https://github.com/bblanchon/pdfium-binaries/releases/latest/download/pdfium-win-x64.tgz" -OutFile "pdfium-win-x64.tgz"
tar -xzf pdfium-win-x64.tgz
mkdir -Force target\debug
copy bin\pdfium.dll target\debug\pdfium.dll
cd ..
```

**macOS (Apple Silicon):**
```bash
cd src-tauri
curl -L -o pdfium.tgz "https://github.com/bblanchon/pdfium-binaries/releases/latest/download/pdfium-mac-arm64.tgz"
tar -xzf pdfium.tgz && mkdir -p target/debug && cp lib/libpdfium.dylib target/debug/
cd ..
```

**Linux:**
```bash
cd src-tauri
curl -L -o pdfium.tgz "https://github.com/bblanchon/pdfium-binaries/releases/latest/download/pdfium-linux-x64.tgz"
tar -xzf pdfium.tgz && mkdir -p target/debug && cp lib/libpdfium.so target/debug/
cd ..
```

### Run

```bash
npm run tauri dev
```

First build takes a few minutes (compiling Rust dependencies). Subsequent builds are fast.

### Build

```bash
npm run tauri build
```

Produces platform-specific installers in `src-tauri/target/release/bundle/`.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Tauri v2](https://v2.tauri.app/) |
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Backend | Rust |
| PDF Engine | [PDFium](https://pdfium.googlesource.com/pdfium/) via pdfium-render |
| Animations | Framer Motion |
| Icons | Phosphor Icons |

---

## Project Structure

```
pagepix/
  src/                    # React frontend
    components/           # Reusable UI components
    views/                # App screens (Home, Processing, Complete, Settings)
    hooks/                # Custom React hooks
    types/                # TypeScript type definitions
  src-tauri/              # Rust backend
    src/
      lib.rs              # Tauri command handlers
      converter.rs        # PDF-to-image conversion engine
    capabilities/         # Tauri security permissions
    icons/                # App icons (all platforms)
  public/                 # Static assets
```

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Author

**Saqlain Razee**

- GitHub: [Razee4315](https://github.com/Razee4315)
- LinkedIn: [saqlainrazee](https://linkedin.com/in/saqlainrazee)
