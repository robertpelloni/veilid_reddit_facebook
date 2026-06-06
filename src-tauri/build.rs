fn main() {
    println!("cargo:rerun-if-changed=bin/sidecar-x86_64-unknown-linux-gnu");
    tauri_build::build()
}
