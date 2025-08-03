<p align="center">
    <b>@li0ard/kupyna</b><br>
    <b>Kupyna (DSTU 7564:2014) hash function in pure TypeScript</b>
    <br>
    <a href="https://li0ard.is-cool.dev/kupyna">docs</a>
    <br><br>
    <a href="https://github.com/li0ard/kupyna/actions/workflows/test.yml"><img src="https://github.com/li0ard/kupyna/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/li0ard/kupyna/blob/main/LICENSE"><img src="https://img.shields.io/github/license/li0ard/kupyna" /></a>
    <br>
    <a href="https://npmjs.com/package/@li0ard/kupyna"><img src="https://img.shields.io/npm/v/@li0ard/kupyna" /></a>
    <a href="https://jsr.io/@li0ard/kupyna"><img src="https://jsr.io/badges/@li0ard/kupyna" /></a>
    <br>
    <hr>
</p>

## Installation

```bash
# from NPM
npm i @li0ard/kupyna

# from JSR
bunx jsr i @li0ard/kupyna
```

## Supported modes
- [x] Hash function
- [x] KMAC (MAC)

## Features
- Provides simple and modern API
- Most of the APIs are strictly typed
- Fully complies with [DSTU 7564:2014](https://usts.kiev.ua/wp-content/uploads/2020/07/dstu-7564-2014.pdf) standard
- Supports Bun, Node.js, Deno, Browsers

## Examples
### Compute hash
```ts
import { Kupyna256 } from "@li0ard/kupyna"

let hash = new Kupyna256()
hash.update(new TextEncoder().encode("hello world"))
console.log(hash.digest())
```

### Compute KMAC
```ts
import { KupynaKMAC256 } from "@li0ard/kupyna"

const msg = Buffer.from("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e", "hex")
const key = Buffer.from("1f1e1d1c1b1a191817161514131211100f0e0d0c0b0a09080706050403020100", "hex")
let kmac = new KupynaKMAC256(key)
kmac.update(msg)
console.log(kmac.digest())
```