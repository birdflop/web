/* !
 * JavaScript Cookie v2.2.1
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function(factory) {
	let registeredInModuleLoader;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		const OldCookies = window.Cookies;
		const api = window.Cookies = factory();
		api.noConflict = function() {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function() {
	function extend() {
		let i = 0;
		const result = {};
		for (; i < arguments.length; i++) {
			const attributes = arguments[ i ];
			for (const key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function decode(s) {
		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	function init(converter) {
		function api() { return; }

		function set(key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			attributes = extend({
				path: '/',
			}, api.defaults, attributes);

			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			try {
				const result = JSON.stringify(value);
				if (/^[{[]/.test(result)) {
					value = result;
				}
			}
			catch (e) {
				return;
			}

			value = converter.write ?
				converter.write(value, key) :
				encodeURIComponent(String(value))
					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			key = encodeURIComponent(String(key))
				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
				.replace(/[()]/g, escape);

			let stringifiedAttributes = '';
			for (const attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		function get(key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			const jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			const cookies = document.cookie ? document.cookie.split('; ') : [];
			let i = 0;

			for (; i < cookies.length; i++) {
				const parts = cookies[i].split('=');
				let cookie = parts.slice(1).join('=');

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					const name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) ||
						decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						}
						catch (e) { return; }
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				}
				catch (e) { return; }
			}

			return key ? jar[key] : jar;
		}

		api.set = set;
		api.get = function(key) {
			return get(key, false);
		};
		api.getJSON = function(key) {
			return get(key, true);
		};
		api.remove = function(key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1,
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function() { return; });
}));