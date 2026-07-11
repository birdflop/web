export function analyzeJvmFlags(
  flags: string,
  jvm_version: string,
  playerCount: number
): Field[] {
  const fields: Field[] = [];

  if (flags.includes('-XX:+UseZGC') && flags.includes('-Xmx')) {
    const flaglist: string[] = flags.split(' ');
    flaglist.forEach((flag) => {
      if (flag.startsWith('-Xmx')) {
        let max_mem = flag.split('-Xmx')[1].toLowerCase();
        max_mem = max_mem.replace('g', '000');
        max_mem = max_mem.replace('m', '');
        if (parseInt(max_mem) < 10000)
          fields.push({
            name: '❌ Low Memory',
            value: 'ZGC is only good with a lot of memory.',
            buttons: [
              {
                text: 'Learn More',
                url: 'https://developers.redhat.com/articles/2021/11/02/how-choose-best-java-garbage-collector#z_garbage_collector__zgc_',
              },
            ],
          });
      }
    });
  } else if (flags.includes('-Daikars.new.flags=true')) {
    if (!flags.includes('-XX:+PerfDisableSharedMem'))
      fields.push({
        name: '❌ Outdated Flags',
        value: 'Add `-XX:+PerfDisableSharedMem` to flags.',
      });
    if (!flags.includes('-XX:G1MixedGCCountTarget=4'))
      fields.push({
        name: '❌ Outdated Flags',
        value: 'Add `XX:G1MixedGCCountTarget=4` to flags.',
      });
    if (!flags.includes('-XX:+UseG1GC') && jvm_version.startsWith('1.8.'))
      fields.push({
        name: "❌ Aikar's Flags",
        value: "You must use G1GC when using Aikar's flags.",
      });
    if (flags.includes('-Xmx')) {
      let max_mem = 0;
      const flaglist: string[] = flags.split(' ');
      flaglist.forEach((flag) => {
        if (flag.startsWith('-Xmx')) {
          flag = flag.split('-Xmx')[1].toLowerCase();
          flag = flag.replace('g', '000');
          flag = flag.replace('m', '');
          max_mem = parseInt(flag);
        }
      });
      if (max_mem < 5400)
        fields.push({
          name: '❌ Low Memory',
          value:
            'Allocate at least 6-10GB of ram to your server if you can afford it.',
        });
      if ((1000 * playerCount) / max_mem > 6 && max_mem < 10000)
        fields.push({
          name: '❌ Low Memory',
          value: 'You should be using more RAM with this many players.',
        });
      if (flags.includes('-Xms')) {
        let min_mem = 0;
        flaglist.forEach((flag) => {
          if (flag.startsWith('-Xms')) {
            flag = flag.split('-Xms')[1].toLowerCase();
            flag = flag.replace('g', '000');
            flag = flag.replace('m', '');
            min_mem = parseInt(flag);
          }
        });
        if (min_mem != max_mem)
          fields.push({
            name: "❌ Aikar's Flags",
            value:
              "Your Xmx and Xms values should be equal when using Aikar's flags.",
          });
      }
    }
  } else if (flags.includes('-Dusing.aikars.flags=mcflags.emc.gs')) {
    fields.push({
      name: '❌ Outdated Flags',
      value: 'Your flags are outdated.',
      buttons: [
        {
          text: "Update Aikar's Flags",
          url: 'https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/',
        },
      ],
    });
  } else {
    fields.push({
      name: "❌ Aikar's Flags",
      value:
        "Aikar's Flags add some optimizations to the java garbage collector.",
      buttons: [
        {
          text: "Use Aikar's Flags",
          url: 'https://aikar.co/2018/07/02/tuning-the-jvm-g1gc-garbage-collector-flags-for-minecraft/',
        },
      ],
    });
  }

  return fields;
}
