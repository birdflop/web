function setLang(language) {
    Cookies.set("Lang", language, { expires: 365 });
    location.reload();
}
function getLang() {
    return Cookies.get("Lang");
}

function loadLang(page) {
    let lang = getLang();
    if (lang == null) {
        lang = "en_US";
    }
    $.getJSON("/lang/" + page + ".json", function(data) {
        $("[data-translate]").each(function() {
            const key = $(this).data("translate");
            if(!data[key][lang]) {
                console.log("Error: " + key + " not found in " + lang);
                return $(this).html(data[key]["en_US"]);
            }
            $(this).html(data[key][lang]);
        });
    });
}

function loadLangHeader() {
    let lang = getLang();
    if (lang == null) {
        lang = "en_US";
    }
    $.getJSON("/lang/header.json", function(data) {
        $("[data-translate-header]").each(function() {
            const key = $(this).data("translate-header");
            $(this).html(data[key][lang]);
        });
    });
}

loadLangHeader();