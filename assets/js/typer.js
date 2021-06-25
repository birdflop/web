/*
Typer.js Plugin v1.2.0
(c) 2016 123Apps. (http://123apps.org)
*/
(function ($) {
  "use strict";

  $.fn.typer = function(options) {
    // merge options
    var settings = $.extend({
      typeSpeed: 60,
      backspaceSpeed: 20,
      backspaceDelay: 800,
      repeatDelay: 1000,
      repeat: true,
      autoStart: true,
      startDelay: 100,
      useCursor: true,
      strings: [
        "Typer.js plugin"
      ]
    }, options);

    // global variables
    var chars,
        charsLength,
        charIndex = 0,
        stringIndex = 0,
        typerIndex = 0;

    function type(typedElement, strings) {
      if (stringIndex < strings.length) {
        chars = strings[stringIndex].split("");
        charsLength = chars.length;

        setTimeout(function() {
          typedElement.append(chars[charIndex]);
          charIndex++;
          if (charIndex < charsLength) {
            type(typedElement, strings);
          } else {
            charIndex = 0;
            stringIndex++;

            // type next string and backspace what is typed
            setTimeout(function() {
              backspace(typedElement, function() {
                type(typedElement, strings);
              });
            }, settings.backspaceDelay);
          }
        }, settings.typeSpeed);
      } else {
        // all strings are typed
        // repeat
        if (settings.repeat) {
          repeat(typedElement, strings);
        }
      }
    }

    // repeat typing
    function repeat(typedElement, strings) {
      stringIndex = 0;
      setTimeout(function() {
        type(typedElement, strings);
      }, settings.repeatDelay);
    }

    // backspace what is typed
    function backspace(typedElement, callback) {
      setTimeout(function() {
        typedElement.text(typedElement.text().slice(0, -1));
        if (0 < typedElement.text().length) {
          backspace(typedElement, callback);
        } else {
          if ("function" === typeof callback) {
            callback();
          }
        }
      }, settings.backspaceSpeed);
    }

    function blinkCursor(cursorElement) {
      setInterval(function() {
        cursorElement.fadeOut(400).fadeIn(400);
      }, 900);
    }


    return this.each(function() {
      var t = $(this),
          typedElement,
          cursorElement;

      if (settings.autoStart) {
        // add typed element
        t.append("<span class=\"typed\"></span>");

        if (settings.useCursor) {
          // add cursor element
          t.append("<span class=\"typed_cursor\">&#x7c;</span>");

          // blink cursor
          cursorElement = t.children(".typed_cursor");
          blinkCursor(cursorElement);
        }

        // type all strings
        typedElement = t.children(".typed");
        setTimeout(function() {
          type(typedElement, settings.strings);
        }, settings.startDelay);
      }
    });
  };
}(jQuery));
