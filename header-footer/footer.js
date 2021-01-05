function toggle() {
    // This bit is for the toggling between dark and light mode
        let element = document.body;
        element.classList.toggle("dark");
    
        // This part is for toggling the text inside the button 
        var toggle = document.getElementById("mode");
          if (toggle.innerHTML === "Toggle dark mode") {
           toggle.innerHTML = "Dark mode it is";
         } 
           else {
           toggle.innerHTML = "Toggle dark mode"; }
    
        // This part I copy pasted from one of Kevin Powell's videos on darkmode switch, and maintaining persistence but still couldn't figure out howbit works...
    
        // check for saved 'darkMode' in localStorage
        let darkMode = localStorage.getItem('darkMode'); 
    
        const darkModeToggle = document.querySelector('#mode');
    
        const enableDarkMode = () => {
          // 1. Add the class to the body
          document.body.classList.add('dark');
          // 2. Update darkMode in localStorage
          localStorage.setItem('darkMode', 'enabled');
        }
    
        const disableDarkMode = () => {
          // 1. Remove the class from the body
          document.body.classList.remove('dark');
          // 2. Update darkMode in localStorage 
          localStorage.setItem('darkMode', null);
        }
    
        // If the user already visited and enabled darkMode
        // start things off with it on
        if (darkMode === 'enabled') {
          enableDarkMode();
        }
    
        // When someone clicks the button
        darkModeToggle.addEventListener('click', () => {
          // get their darkMode setting
          darkMode = localStorage.getItem('darkMode'); 
    
          // if it not current enabled, enable it
          if (darkMode !== 'enabled') {
            enableDarkMode();
          // if it has been enabled, turn it off  
          } else {  
            disableDarkMode(); 
          }
    });
    
        // This is the solved part I asked earlier, it chages the meta theme color with the dark or light mode change
        var meta = document.querySelector("meta[name=theme-color]");
    
      if (meta.getAttribute("content") === "#002f30") {
        console.log(meta.getAttribute("content"));
        meta.setAttribute("content", "#10101c");
      } else {
        console.log(meta.getAttribute("content"));
        meta.setAttribute("content", "#002f30");
      }
    }
    