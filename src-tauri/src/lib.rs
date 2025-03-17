// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    let output = std::process::Command::new("cmd")
        .args(&["/C", "echo Hello from cmd"])
        .output()
        .expect("failed to execute process");

    let stdout = String::from_utf8_lossy(&output.stdout);
    format!("Hello, {}! You've been greeted from Rust! Command output: {}", name, stdout)
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
    window.maximize().unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, close, minimize, maximize])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
