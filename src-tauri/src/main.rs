// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::process::{Command, CommandEvent};
use tauri::Manager;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let (mut rx, _child) = Command::new_sidecar("sidecar")
        .expect("failed to setup sidecar")
        .spawn()
        .expect("failed to spawn sidecar");

      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          if let CommandEvent::Stdout(line) = event {
            println!("sidecar: {}", line);
          }
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
