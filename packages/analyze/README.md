# @birdflop/analyze

Automatic Spark Profile and Paper Timings analyzer for Minecraft servers, developed by [Birdflop](https://birdflop.com).

## Installation

```bash
npm install @birdflop/analyze
```

## Usage

```ts
import { analyzeProfile, analyzeTimings, collector } from '@birdflop/analyze';

// Analyze a Spark profile (ID < 30 chars)
const fields = await analyzeProfile('abc1234567');

// Analyze Paper timings (ID >= 30 chars)
const fields = await analyzeTimings('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

// Optionally report the analyzed ID to your own collector endpoint
await collector(id, 'https://api.profiler.birdflop.com', 'spark');
```

Each function returns an array of `Field` objects:

```ts
interface Field {
  name: string;
  value: string;
  buttons?: { text: string; url: string }[];
  inline?: boolean;
}
```

## License

AGPL-3.0-or-later
