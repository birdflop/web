function setLang(language) {
    Cookies.set("Lang", language, { expires: 365 });
}
function getLang() {
    return Cookies.get("Lang");
}

function loadLang(page) {
    var lang = getLang();
    if (lang == null) {
        lang = "en_US";
    }
    $.getJSON("lang/" + page + ".json", function (data) {
        $("[data-translate]").each(function(){
            var key = $(this).data("translate");
            console.log(data[key], key);
            $(this).html(data[key][lang]);
        }); 
    });
};

function loadLangHeader(){
    var lang = getLang();
    if (lang == null) {
        lang = "en_US";
    }
    $.getJSON("lang/header.json", function (data) {
        $("[data-translate-header]").each(function(){
            var key = $(this).data("translate-header");
            $(this).html(data[key][lang]);
        }); 
    });
}

loadLangHeader();