const fetch = (...args) => import('node-fetch').then(({ default: e }) => e(...args));
const YAML = require('yaml');
const fs = require('fs');
const createField = require('./createField.js');
const evalField = require('./evalField.js');

module.exports = async function analyzeTimings(timings_id) {
	const timings_json = `https://timings.aikar.co/data.php?id=${timings_id}`;
	const url_raw = `https://timings.aikar.co/?id=${timings_id}&raw=1`;

	const response_raw = await fetch(url_raw);
	const request_raw = await response_raw.json();
	const response_json = await fetch(timings_json);
	const request = await response_json.json();

	if (!request_raw) {
		return [{ name: '❌ Processing Error', value: 'SimplyMC cannot process this timings report. Please use an alternative timings report.', buttons: [{ text: 'Go back', url: '/PaperTimings' }] }];
	}

	if (!request_raw || !request) {
		return [{ name: '❌ Invalid report', value: 'Create a new timings report.', buttons: [{ text: 'Go back', url: '/PaperTimings' }] }];
	}

	let version = request.timingsMaster.version;

	if (version.endsWith('(MC: 1.17)')) version = version.replace('(MC: 1.17)', '(MC: 1.17.0)');

	let server_properties, bukkit, spigot, paper, pufferfish, purpur;

	const plugins = Object.keys(request.timingsMaster.plugins).map(i => { return request.timingsMaster.plugins[i]; });
	const configs = request.timingsMaster.config;
	if (configs) {
		if (configs['server.properties']) server_properties = configs['server.properties'];
		if (configs['bukkit']) bukkit = configs['bukkit'];
		if (configs['spigot']) spigot = configs['spigot'];
		if (configs['paper'] || configs['paperspigot']) paper = configs['paper'] ?? configs['paperspigot'];
		if (configs['pufferfish']) pufferfish = configs['pufferfish'];
		if (configs['purpur']) purpur = configs['purpur'];
	}

	const TIMINGS_CHECK = {
		servers: await YAML.parse(fs.readFileSync('./analyze/config/servers.yml', 'utf8')),
		plugins: {
			paper: await YAML.parse(fs.readFileSync('./analyze/config/timings/plugins/paper.yml', 'utf8')),
			purpur: await YAML.parse(fs.readFileSync('./analyze/config/timings/plugins/purpur.yml', 'utf8')),
		},
		config: {
			'server.properties': await YAML.parse(fs.readFileSync('./analyze/config/server.properties.yml', 'utf8')),
			bukkit: await YAML.parse(fs.readFileSync('./analyze/config/bukkit.yml', 'utf8')),
			spigot: await YAML.parse(fs.readFileSync('./analyze/config/spigot.yml', 'utf8')),
			paper: await YAML.parse(fs.readFileSync(`./analyze/config/timings/paper-v${paper._version ? 28 : 27}.yml`, 'utf8')),
			pufferfish: await YAML.parse(fs.readFileSync('./analyze/config/timings/pufferfish.yml', 'utf8')),
			purpur: await YAML.parse(fs.readFileSync('./analyze/config/purpur.yml', 'utf8')),
		},
	};

	const fields = [];

	const timing_cost = parseInt(request.timingsMaster.system.timingcost);
	if (timing_cost > 300) {
		fields.push({ name: '❌ Timingcost', value: `Your timingcost is ${timing_cost}. Your cpu is overloaded and/or slow.`, buttons: [{ text: 'Find a better host', url: 'https://www.birdflop.com' }] });
	}

	// fetch the latest mc version
	const req = await fetch('https://api.purpurmc.org/v2/purpur');
	const json = await req.json();
	const latest = json.versions[json.versions.length - 1];

	// ghetto version check
	if (version.split('(MC: ')[1].split(')')[0] != latest) {
		version = version.replace('git-', '').replace('MC: ', '');
		fields.push({ name: '❌ Outdated', value: `You are using \`${version}\`. Update to \`${latest}\`.`, buttons: [{ text: 'Paper', url: 'https://papermc.io' }, { text: 'Pufferfish', url: 'https://ci.pufferfish.host/job/Pufferfish-1.19/' }, { text: 'Purpur', url: 'https://purpurmc.org' }] });
	}

	if (TIMINGS_CHECK.servers) {
		TIMINGS_CHECK.servers.forEach(server => {
			if (version.includes(server.name)) fields.push(createField(server));
		});
	}

	const flags = request.timingsMaster.system.flags;
	const jvm_version = request.timingsMaster.system.jvmversion;
	if (flags.includes('-XX:+UseZGC') && flags.includes('-Xmx')) {
		const flaglist = flags.split(' ');
		flaglist.forEach(flag => {
			if (flag.startsWith('-Xmx')) {
				let max_mem = flag.split('-Xmx')[1];
				max_mem = max_mem.replace('G', '000');
				max_mem = max_mem.replace('M', '');
				max_mem = max_mem.replace('g', '000');
				max_mem = max_mem.replace('m', '');
				if (parseInt(max_mem) < 10000) fields.push({ name: '❌ Low Memory', value:'ZGC is only good with a lot of memory.', buttons: [{ text: 'Learn More', url: 'https://developers.redhat.com/articles/2021/11/02/how-choose-best-java-garbage-collector#z_garbage_collector__zgc_' }] });
			}
		});
	}
	else if (flags.includes('-Daikars.new.flags=true')) {
		if (!flags.includes('-XX:+PerfDisableSharedMem')) fields.push({ name: '❌ Outdated Flags', value: 'Add `-XX:+PerfDisableSharedMem` to flags.' });
		if (!flags.includes('-XX:G1MixedGCCountTarget=4')) fields.push({ name: '❌ Outdated Flags', value: 'Add `XX:G1MixedGCCountTarget=4` to flags.' });
		if (!flags.includes('-XX:+UseG1GC') && jvm_version.startsWith('1.8.')) fields.push({ name: '❌ Aikar\'s Flags', value: 'You must use G1GC when using Aikar\'s flags.' });
		if (flags.includes('-Xmx')) {
			let max_mem = 0;
			const flaglist = flags.split(' ');
			flaglist.forEach(flag => {
				if (flag.startsWith('-Xmx')) {
					max_mem = flag.split('-Xmx')[1];
					max_mem = max_mem.replace('G', '000');
					max_mem = max_mem.replace('M', '');
					max_mem = max_mem.replace('g', '000');
					max_mem = max_mem.replace('m', '');
				}
			});
			if (parseInt(max_mem) < 5400) fields.push({ name: '❌ Low Memory', value: 'Allocate at least 6-10GB of ram to your server if you can afford it.' });
			let index = 0;
			let max_online_players = 0;
			while (index < request.timingsMaster.data.length) {
				const timed_ticks = request.timingsMaster.data[index].minuteReports[0].ticks.timedTicks;
				const player_ticks = request.timingsMaster.data[index].minuteReports[0].ticks.playerTicks;
				const players = (player_ticks / timed_ticks);
				max_online_players = Math.max(players, max_online_players);
				index = index + 1;
			}
			if (1000 * max_online_players / parseInt(max_mem) > 6 && parseInt(max_mem) < 10000) fields.push({ name: '❌ Low Memory', value: 'You should be using more RAM with this many players.' });
			if (flags.includes('-Xms')) {
				let min_mem = 0;
				flaglist.forEach(flag => {
					if (flag.startsWith('-Xmx')) {
						min_mem = flag.split('-Xmx')[1];
						min_mem = min_mem.replace('G', '000');
						min_mem = min_mem.replace('M', '');
						min_mem = min_mem.replace('g', '000');
						min_mem = min_mem.replace('m', '');
					}
				});
				if (min_mem != max_mem) fields.push({ name: '❌ Aikar\'s Flags', value: 'Your Xmx and Xms values should be equal when using Aikar\'s flags.' });
			}
		}
	}
	else if (flags.includes('-Dusing.aikars.flags=mcflags.emc.gs')) {
		fields.push({ name: '❌ Outdated Flags', value: 'Your flags are outdated.', buttons: [{ text: 'Update Aikar\'s Flags', url: 'https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/' }] });
	}
	else {
		fields.push({ name: '❌ Aikar\'s Flags', value: 'Aikar\'s Flags add some optimizations to the java garbage collector.', buttons: [{ text: 'Use Aikar\'s Flags', url: 'https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/' }] });
	}

	const cpu = parseInt(request.timingsMaster.system.cpu);
	if (cpu <= 2) fields.push({ name: '❌ Threads', value: `You only have ${cpu} thread(s).`, buttons: [{ text: 'Find a better host', url: 'https://www.birdflop.com' }] });

	const handlers = Object.keys(request_raw.idmap.handlers).map(i => { return request_raw.idmap.handlers[i]; });
	handlers.forEach(handler => {
		let handler_name = handler[1];
		if (handler_name.startsWith('Command Function - ') && handler_name.endsWith(':tick')) {
			handler_name = handler_name.split('Command Function - ')[1].split(':tick')[0];
			fields.push({ name: `❌ ${handler_name}`, value: 'This datapack uses command functions which are laggy.' });
		}
	});

	if (TIMINGS_CHECK.plugins) {
		Object.keys(TIMINGS_CHECK.plugins).forEach(server_name => {
			if (Object.keys(request.timingsMaster.config).includes(server_name)) {
				plugins.forEach(plugin => {
					Object.keys(TIMINGS_CHECK.plugins[server_name]).forEach(plugin_name => {
						if (plugin.name == plugin_name) {
							const stored_plugin = TIMINGS_CHECK.plugins[server_name][plugin_name];
							stored_plugin.name = plugin_name;
							fields.push(createField(stored_plugin));
						}
					});
				});
			}
		});
	}
	if (TIMINGS_CHECK.config) {
		Object.keys(TIMINGS_CHECK.config).map(i => { return TIMINGS_CHECK.config[i]; }).forEach(config => {
			Object.keys(config).forEach(option_name => {
				const option = config[option_name];
				evalField(fields, option, option_name, plugins, server_properties, bukkit, spigot, paper, pufferfish, purpur);
			});
		});
	}

	plugins.forEach(plugin => {
		if (plugin.authors && plugin.authors.toLowerCase().includes('songoda')) {
			if (plugin.name == 'EpicHeads') fields.push({ name: '❌ EpicHeads', value: 'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.', buttons: [{ text: 'HeadsPlus', url: 'https://spigotmc.org/resources/headsplus-»-1-8-1-16-4.40265/' }, { text: 'HeadDatabase', url: 'https://www.spigotmc.org/resources/head-database.14280/' }] });
			else if (plugin.name == 'UltimateStacker') fields.push({ name: '❌ UltimateStacker', value: 'Stacking plugins actually causes more lag.\nRemove UltimateStacker.' });
			else fields.push({ name: `❌ ${plugin.name}`, value: 'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.' });
		}
	});

	const worlds = request_raw.worlds ? Object.keys(request_raw.worlds).map(i => { return request_raw.worlds[i]; }) : [];
	let high_mec = false;
	worlds.forEach(world => {
		const max_entity_cramming = parseInt(world.gamerules.maxEntityCramming);
		if (max_entity_cramming >= 24) high_mec = true;
	});
	if (high_mec) fields.push({ name: '❌ maxEntityCramming', value: 'Decrease this by running the /gamerule command in each world. Recommended: 8.' });

	if (timing_cost > 500) {
		const suggestions = fields.length - 1;
		return [{ name: '❌ Timingcost (URGENT)', value: `Your timingcost is ${timing_cost}. This value would be at most 200 on a reasonable server. Your cpu is critically overloaded and/or slow. Hiding ${suggestions} comparitively negligible suggestions until you resolve this fundamental problem.`, buttons: [{ text: 'Find a better host', url: 'https://www.birdflop.com' }] }];
	}

	if (fields.length == 0) {
		return [{ name: '✅ All good', value: 'Analyzed with no recommendations.' }];
	}

	return fields;
};
