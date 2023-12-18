use tauri::{CustomMenuItem, Menu, Submenu};

#[tauri::command]
fn greet() -> &'static str { "Hello, Tauri!" }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let refresh: CustomMenuItem = CustomMenuItem::new("refresh".to_string(), "Refresh");
  let quit: CustomMenuItem = CustomMenuItem::new("quit".to_string(), "Quit");
  let simplymc: Submenu = Submenu::new("SimplyMC", Menu::new()
    .add_item(refresh)
    .add_item(quit)
  );
  let en_us: CustomMenuItem = CustomMenuItem::new("en-US".to_string(), "English (US)");
  let es_es: CustomMenuItem = CustomMenuItem::new("es-ES".to_string(), "Español (Spanish - ES)");
  let nl_nl: CustomMenuItem = CustomMenuItem::new("nl-NL".to_string(), "Nederlands (Dutch - NL)");
  let pt_pt: CustomMenuItem = CustomMenuItem::new("pt-PT".to_string(), "Português (Portuguese - PT)");
  let language: Submenu = Submenu::new("Language", Menu::new()
    .add_item(en_us)
    .add_item(es_es)
    .add_item(nl_nl)
    .add_item(pt_pt)
  );
  let menu: Menu = Menu::new().add_submenu(simplymc).add_submenu(language);
  tauri::Builder::default()
    .menu(menu)
    .on_menu_event(|event| {
      match event.menu_item_id() {
        "quit" => { std::process::exit(0); }
        _ => {}
      }
    })
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
