mod converter;

#[tauri::command]
async fn convert_pdf(
    app: tauri::AppHandle,
    path: String,
    format: String,
    quality: u8,
    output_dir: String,
    naming_pattern: String,
) -> Result<(), String> {
    // Run PDF conversion on a blocking thread since pdfium is synchronous
    let handle = app.clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        converter::convert_pdf(&handle, &path, &format, quality, &output_dir, &naming_pattern)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?;

    result
}

#[tauri::command]
async fn cancel_conversion() -> Result<(), String> {
    converter::cancel();
    Ok(())
}

#[tauri::command]
async fn open_output_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn get_default_output_dir() -> String {
    dirs::document_dir()
        .map(|d| d.join("PagePix").to_string_lossy().to_string())
        .unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            convert_pdf,
            cancel_conversion,
            open_output_folder,
            get_default_output_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
