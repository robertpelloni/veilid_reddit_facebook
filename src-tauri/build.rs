fn main() {
    let target = std::env::var("TARGET").unwrap();
    println!("cargo:rerun-if-changed=bin/sidecar-{}", target);
    tauri_build::build()
}
