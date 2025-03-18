use tauri::{path::BaseDirectory, Manager};

struct AppData {
    apkeditor_path: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    let output = std::process::Command::new("cmd")
        .args(&["/C", "echo Hello from cmd"])
        .output()
        .expect("failed to execute process");

    let stdout = String::from_utf8_lossy(&output.stdout);
    format!(
        "Hello, {}! You've been greeted from Rust! Command output: {}",
        name, stdout
    )
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

#[tauri::command]
fn run_apkeditor_merge(state: tauri::State<AppData>, path: String) {
    let jar_path = &state.apkeditor_path;
    let java_args = vec![
        "-jar".to_string(),
        jar_path.clone(),
        "merge".to_string(),
        "-i".to_string(),
        path.clone(),
    ];
    print!("{:?}", java_args);
    let output = std::process::Command::new("java")
        .args(&java_args)
        .output()
        .expect("failed to execute process");
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    println!("{} {}", stdout, stderr);
    println!("{}", jar_path);
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
            greet,
            close,
            minimize,
            maximize,
            run_apkeditor_merge
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
