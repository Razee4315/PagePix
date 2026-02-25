use base64::Engine;
use image::{DynamicImage, ImageFormat as ImgFmt};
use pdfium_render::prelude::*;
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionProgress {
    pub current_page: usize,
    pub total_pages: usize,
    pub thumbnail_base64: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionResult {
    pub output_dir: String,
    pub total_size: u64,
    pub page_count: usize,
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionError {
    pub message: String,
}

/// Global cancellation flag
static CANCELLED: AtomicBool = AtomicBool::new(false);

pub fn cancel() {
    CANCELLED.store(true, Ordering::Relaxed);
}

pub fn reset_cancel() {
    CANCELLED.store(false, Ordering::Relaxed);
}

fn is_cancelled() -> bool {
    CANCELLED.load(Ordering::Relaxed)
}

/// Build the output directory path based on the PDF filename
fn build_output_dir(pdf_path: &Path, custom_output: &str) -> PathBuf {
    let stem = pdf_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("output");

    let base = if custom_output.is_empty() {
        pdf_path.parent().unwrap_or(Path::new(".")).to_path_buf()
    } else {
        PathBuf::from(custom_output)
    };

    base.join(stem)
}

/// Generate a filename based on the naming pattern
fn generate_filename(
    pattern: &str,
    stem: &str,
    page: usize,
    total: usize,
    ext: &str,
) -> String {
    let pad_width = total.to_string().len().max(3);
    let padded = format!("{:0>width$}", page, width = pad_width);

    match pattern {
        "filename_page_padded" => format!("{}_page_{}.{}", stem, padded, ext),
        "filename_number" => format!("{}_{}.{}", stem, page, ext),
        "page_padded" => format!("page_{}.{}", padded, ext),
        "number_only" => format!("{}.{}", padded, ext),
        _ => format!("{}_page_{}.{}", stem, padded, ext),
    }
}

/// Create a thumbnail (base64-encoded PNG) from an image
fn create_thumbnail(img: &DynamicImage) -> String {
    let thumb = img.thumbnail(800, 1100);
    let mut buf = Cursor::new(Vec::new());
    if thumb.write_to(&mut buf, ImgFmt::Png).is_ok() {
        base64::engine::general_purpose::STANDARD.encode(buf.into_inner())
    } else {
        String::new()
    }
}

/// Save an image in the requested format
fn save_image(
    img: &DynamicImage,
    path: &Path,
    format: &str,
    quality: u8,
) -> Result<u64, String> {
    match format {
        "png" => img
            .save(path)
            .map_err(|e| format!("Failed to save PNG: {}", e))?,
        "jpeg" | "jpg" => {
            let rgb = img.to_rgb8();
            let mut buf = Cursor::new(Vec::new());
            let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut buf, quality);
            encoder
                .encode(
                    rgb.as_raw(),
                    rgb.width(),
                    rgb.height(),
                    image::ExtendedColorType::Rgb8,
                )
                .map_err(|e| format!("Failed to encode JPEG: {}", e))?;
            std::fs::write(path, buf.into_inner())
                .map_err(|e| format!("Failed to write JPEG: {}", e))?;
        }
        "webp" => {
            // Use the image crate's WebP encoder
            img.save(path)
                .map_err(|e| format!("Failed to save WebP: {}", e))?;
        }
        _ => return Err(format!("Unsupported format: {}", format)),
    }

    std::fs::metadata(path)
        .map(|m| m.len())
        .map_err(|e| format!("Failed to get file size: {}", e))
}

/// Parse a page range string like "1-5, 8, 10-12" into a sorted Vec of page numbers.
/// Returns None if the string is empty (meaning all pages).
fn parse_page_range(range_str: &str, total_pages: usize) -> Option<Vec<usize>> {
    let trimmed = range_str.trim();
    if trimmed.is_empty() {
        return None; // all pages
    }

    let mut pages = Vec::new();
    for part in trimmed.split(',') {
        let part = part.trim();
        if part.contains('-') {
            let bounds: Vec<&str> = part.split('-').collect();
            if bounds.len() == 2 {
                let start = bounds[0].trim().parse::<usize>().unwrap_or(1).max(1);
                let end = bounds[1].trim().parse::<usize>().unwrap_or(total_pages).min(total_pages);
                for p in start..=end {
                    pages.push(p);
                }
            }
        } else if let Ok(p) = part.parse::<usize>() {
            if p >= 1 && p <= total_pages {
                pages.push(p);
            }
        }
    }

    pages.sort();
    pages.dedup();
    if pages.is_empty() { None } else { Some(pages) }
}

/// Main conversion function
pub fn convert_pdf(
    app: &AppHandle,
    pdf_path: &str,
    format: &str,
    quality: u8,
    output_dir: &str,
    naming_pattern: &str,
    page_range: &str,
) -> Result<(), String> {
    reset_cancel();

    let pdf_path = Path::new(pdf_path);
    if !pdf_path.exists() {
        return Err("PDF file not found".to_string());
    }

    // Initialize PDFium
    let pdfium = Pdfium::default();

    let document = pdfium
        .load_pdf_from_file(pdf_path, None)
        .map_err(|e| format!("Failed to open PDF: {}", e))?;

    let total_pages = document.pages().len() as usize;
    let stem = pdf_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("page");

    // Determine which pages to convert
    let pages_to_convert = parse_page_range(page_range, total_pages)
        .unwrap_or_else(|| (1..=total_pages).collect());
    let convert_count = pages_to_convert.len();

    // Build output directory
    let out_dir = build_output_dir(pdf_path, output_dir);
    std::fs::create_dir_all(&out_dir)
        .map_err(|e| format!("Failed to create output directory: {}", e))?;

    let ext = match format {
        "jpeg" => "jpg",
        other => other,
    };

    let mut total_size: u64 = 0;
    let render_config = PdfRenderConfig::new()
        .set_target_width(2480) // ~300 DPI for A4
        .set_maximum_height(3508);

    for (progress_idx, &page_num) in pages_to_convert.iter().enumerate() {
        if is_cancelled() {
            return Err("Conversion cancelled".to_string());
        }

        let page_index = (page_num - 1) as u16;
        let page = document.pages().get(page_index)
            .map_err(|e| format!("Failed to get page {}: {}", page_num, e))?;

        // Render page to image
        let dynamic_image = page
            .render_with_config(&render_config)
            .map_err(|e| format!("Failed to render page {}: {}", page_num, e))?
            .as_image();

        // Generate thumbnail
        let thumbnail = create_thumbnail(&dynamic_image);

        // Save the full image
        let filename = generate_filename(naming_pattern, stem, page_num, total_pages, ext);
        let file_path = out_dir.join(&filename);
        let file_size = save_image(&dynamic_image, &file_path, format, quality)?;
        total_size += file_size;

        // Emit progress
        let progress = ConversionProgress {
            current_page: progress_idx + 1,
            total_pages: convert_count,
            thumbnail_base64: thumbnail,
        };
        let _ = app.emit("conversion-progress", &progress);
    }

    // Emit completion
    let result = ConversionResult {
        output_dir: out_dir.to_string_lossy().to_string(),
        total_size,
        page_count: convert_count,
        format: format.to_string(),
    };
    let _ = app.emit("conversion-complete", &result);

    Ok(())
}
