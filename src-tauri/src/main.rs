// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      let data_dir = app.path().app_data_dir().expect("failed to get app data dir");
      std::fs::create_dir_all(&data_dir).expect("failed to create app data dir");
      let data_dir_str = data_dir.to_string_lossy().to_string();

      let sidecar_command = app.shell().sidecar("sidecar").expect("failed to setup sidecar");
      let (mut rx, _child) = sidecar_command
        .args(["-data-dir", &data_dir_str])
        .spawn()
        .expect("failed to spawn sidecar");

      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          if let CommandEvent::Stdout(line) = event {
            println!("sidecar: {}", String::from_utf8_lossy(&line));
          }
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
