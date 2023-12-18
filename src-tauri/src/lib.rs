use tauri::menu::MenuBuilder;

#[tauri::command]
fn greet() -> &'static str { "Hello, Tauri!" }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let menu = MenuBuilder::new(app).copy().paste().undo().redo().build()?;
      app.set_menu(menu)?;
      Ok(())
    })
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}