use tauri::{path::BaseDirectory, Manager};

struct AppData {
    apkeditor_path: String,
}

#[tauri::command]
fn close(window: tauri::Window) {
    window.close().unwrap();
}

#[tauri::command]
fn minimize(window: tauri::Window) {
    window.minimize().unwrap();
}

#[tauri::command]
fn maximize(window: tauri::Window) {
    if !window.is_maximized().unwrap() {
        window.maximize().unwrap();
    } else {
        window.unmaximize().unwrap();
    }
}

fn check_command_exists(command: &str) -> bool {
    std::process::Command::new("which")
        .arg(command)
        .output()
        .expect("failed to execute process")
        .status
        .success()
}

#[tauri::command]
fn run_apkeditor_merge(state: tauri::State<AppData>, path_in: String) -> String {
    let jar_path = &state.apkeditor_path;
    let java_args = vec![
        "-jar".to_string(),
        jar_path.clone(),
        "merge".to_string(),
        "-i".to_string(),
        path_in.clone(),
    ];
    if !check_command_exists("java") {
        return "Java not found, please make sure it is installed and in your PATH".to_string();
    }
    let output = std::process::Command::new("java")
        .args(&java_args)
        .output()
        .expect("failed to execute process");
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    println!("{} {}", stdout, stderr);
    println!("{}", jar_path);
    return format!("{}\n{}", stdout, stderr);
}

fn remove_unc_prefix(path: &str) -> String {
    path.strip_prefix(r"\\?\").unwrap_or(path).to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let resource_path = app
                .path()
                .resolve("resources/apkeditor.jar", BaseDirectory::Resource)?;
            app.manage(AppData {
                apkeditor_path: remove_unc_prefix(resource_path.to_str().unwrap()),
            });
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            close,
            minimize,
            maximize,
            run_apkeditor_merge
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
