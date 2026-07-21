fn main() {
    if let Ok(target) = std::env::var("TARGET") {
        println!("cargo:rerun-if-changed=bin/sidecar-{}", target);
    }
    tauri_build::build()
}
