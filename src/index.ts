import { T0, T1, T2, T3, T4, T5, T6, T7 } from "./const";
import { bytesToUint64s, uint64sToBytes, bytesToNumberLE, concatBytes, numberToBytesLE } from "./utils";

/**
 * Kupyna abstract class (short implementation for 384 bit)
 * @abstract
 */
export abstract class KupynaShort<T> {
    /** Output length */
    abstract outputLen: number;
    /** Block length */
    abstract blockLen: number;

    /** Clone hash instance */
    abstract clone(): T;

    /** Update hash buffer */
    abstract update(p: Uint8Array): T

    /** Finalize hash computation and return result as Uint8Array */
    abstract digest(): Uint8Array;
}

/**
 * Kupyna abstract class
 * @abstract
 */
export abstract class Kupyna<T> extends KupynaShort<T> {
    abstract s: BigUint64Array;
    abstract x: Uint8Array;
    abstract nx: number;
    abstract len: bigint;
}

/** Kupyna 256 bit */
export class Kupyna256 implements Kupyna<Kupyna256> {
    outputLen = 32;
    blockLen = 64;
    s: BigUint64Array;
    x: Uint8Array;
    nx: number;
    len: bigint;

    /** Kupyna 256 bit */
    constructor() {
        this.s = new BigUint64Array(8);
        this.x = new Uint8Array(this.blockLen);
        this.nx = 0;
        this.len = 0n;

        let s1 = new Uint8Array(8);
        s1[0] = this.blockLen;
        this.s[0] = bytesToNumberLE(s1);
    }
    /** Create hash instance */
    public static create(): Kupyna256 { return new Kupyna256(); }

    private byte(a: bigint): number { return Number(a & 0xFFn); }

    _cloneInto(to?: Kupyna256): Kupyna256 {
        to ||= new Kupyna256();
        to.s = new BigUint64Array(this.s);
        to.x = new Uint8Array(this.x);
        to.nx = this.nx;
        to.len = this.len;

        return to;
    }
    clone(): Kupyna256 { return this._cloneInto(); }

    update(data: Uint8Array): Kupyna256 {
        const nn = data.length;
        this.len += BigInt(nn);
    
        if (this.nx > 0) {
            const available = this.blockLen - this.nx;
            const n = Math.min(available, data.length);
            this.x.set(data.slice(0, n), this.nx);
            this.nx += n;
        
            if (this.nx === this.blockLen) {
                this.block(this.x);
                this.nx = 0;
            }
        
            data = data.slice(n);
        }
    
        while (data.length >= this.blockLen) {
            this.block(data.slice(0, this.blockLen));
            this.nx = 0;
            data = data.slice(this.blockLen);
        }
    
        if (data.length > 0) {
            this.x.set(data, 0);
            this.nx = data.length;
        }
    
        return this;
    }

    digest(): Uint8Array { return this.clone().final() }
    private final(): Uint8Array {
        this.x[this.nx] = 0x80;
        this.nx++;

        const fillBytes = (start: number) => {
            const available = this.x.length - start;
            if (available > 0) this.x.fill(0, start, start + available);
        }

        if (this.nx > 52) {
            fillBytes(this.nx);
            this.block(this.x);
            this.nx = 0;
        }

        fillBytes(this.nx);
        this.x.set(numberToBytesLE(this.len * 8n, 8), 52);
        this.block(this.x);
        this.outputTransform();

        return uint64sToBytes(this.s).slice(this.outputLen);
    }

    private G(x: BigUint64Array, y: BigUint64Array) {
        const T = [T0, T1, T2, T3, T4, T5, T6, T7];
        for (let i = 0; i < 8; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) result ^= T[j][this.byte(x[(i - j + 8) % 8] >> (BigInt(j) * 8n))];
            y[i] = result;
        }
    }

    private G1(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        const T = [T0, T1, T2, T3, T4, T5, T6, T7];
        for (let i = 0; i < 8; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) result ^= T[j][this.byte(x[(i - j + 8) % 8] >> (BigInt(j) * 8n))];
            y[i] = result ^ BigInt(i << 4) ^ round;
        }
    }

    private G2(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        let r = 0x00F0F0F0F0F0F0F3n;
        const T = [T0, T1, T2, T3, T4, T5, T6, T7];
        for (let i = 0; i < 8; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) result ^= T[j][this.byte(x[(i - j + 8) % 8] >> (BigInt(j) * 8n))];
            y[i] = result + (r ^ ((BigInt((7 - i) * 16) ^ round) << 56n));
        }
    }
    
    private P(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        for(let idx = 0n; idx < 8n; idx++) x[Number(idx)] ^= (idx << 4n) ^ round;
        this.G1(x, y, round+1n);
        this.G(y, x);
    }

    private Q(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        let r = 0x00F0F0F0F0F0F0F3n;
        for(let j = 0n; j < 8n; j++) x[Number(j)] += (r ^ ((((7n - j) * 0x10n) ^ round) << 56n));
        this.G2(x, y, round+1n);
        this.G(y, x);
    }

    private outputTransform() {
        let t1 = new BigUint64Array(this.s),
            t2 = new BigUint64Array(8);
        
        for(let r = 0n; r < 10n; r += 2n) this.P(t1, t2, r);
        for(let column = 0; column < 8; column++) this.s[column] ^= t1[column];
    }

    private transform(b: BigUint64Array) {
        let AQ1 = new BigUint64Array(8);
        let AP1 = new BigUint64Array(8);
        let tmp = new BigUint64Array(8);

        for(let column = 0; column < 8; column++) {
            AP1[column] = this.s[column] ^ b[column];
            AQ1[column] = b[column];
        }

        for(let r = 0n; r < 10n; r += 2n) {
            this.P(AP1, tmp, r);
            this.Q(AQ1, tmp, r);
        }

        for(let column = 0; column < 8; column++) this.s[column] ^= AP1[column] ^ AQ1[column];
    }
    private block(b: Uint8Array): void { return this.transform(bytesToUint64s(b)); }
}

/** Kupyna 512 bit */
export class Kupyna512 implements Kupyna<Kupyna512> {
    outputLen = 64;
    blockLen = 128;
    s: BigUint64Array;
    x: Uint8Array;
    nx: number;
    len: bigint;

    /** Kupyna 512 bit */
    constructor() {
        this.s = new BigUint64Array(16);
        this.x = new Uint8Array(this.blockLen);
        this.nx = 0;
        this.len = 0n;

        let s1 = new Uint8Array(8);
        s1[0] = this.blockLen;
        this.s[0] = bytesToNumberLE(s1);
    }
    /** Create hash instance */
    public static create(): Kupyna512 { return new Kupyna512(); }

    private byte(a: bigint) { return Number(a & 0xFFn); }

    _cloneInto(to?: Kupyna512): Kupyna512 {
        to ||= new Kupyna512();
        to.s = new BigUint64Array(this.s);
        to.x = new Uint8Array(this.x);
        to.nx = this.nx;
        to.len = this.len;

        return to;
    }
    clone(): Kupyna512 { return this._cloneInto(); }

    update(data: Uint8Array): Kupyna512 {
        const nn = data.length;
        this.len += BigInt(nn);
    
        if (this.nx > 0) {
            const available = this.blockLen - this.nx;
            const n = Math.min(available, data.length);
            this.x.set(data.slice(0, n), this.nx);
            this.nx += n;
        
            if (this.nx === this.blockLen) {
                this.block(this.x);
                this.nx = 0;
            }
        
            data = data.slice(n);
        }
    
        while (data.length >= this.blockLen) {
            this.block(data.slice(0, this.blockLen));
            this.nx = 0;
            data = data.slice(this.blockLen);
        }
    
        if (data.length > 0) {
            this.x.set(data, 0);
            this.nx = data.length;
        }
    
        return this;
    }

    digest(): Uint8Array { return this.clone().final(); }
    private final(): Uint8Array {
        this.x[this.nx] = 0x80;
        this.nx++;

        const fillBytes = (start: number) => {
            const available = this.x.length - start;
            if (available > 0) this.x.fill(0, start, start + available);
        };

        if (this.nx > 116) {
            fillBytes(this.nx);
            this.block(this.x);
            this.nx = 0;
        }

        fillBytes(this.nx);
        this.x.set(numberToBytesLE(this.len * 8n, 8), 116);
        this.block(this.x);
        this.outputTransform();

        return uint64sToBytes(this.s).slice(this.outputLen);
    }

    private G(x: BigUint64Array, y: BigUint64Array) {
        const T = [T0, T1, T2, T3, T4, T5, T6, T7];
        const offset = [0, 1, 2, 3, 4, 5, 6, 11];
    
        for (let i = 0; i < 16; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) result ^= T[j][this.byte(x[(i - offset[j] + 16) % 16] >> (BigInt(j) * 8n))];
            y[i] = result;
        }
    }

    private G1(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        const T = [T0, T1, T2, T3, T4, T5, T6, T7];
        const offset = [0, 1, 2, 3, 4, 5, 6, 11];
    
        for (let i = 0; i < 16; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) result ^= T[j][this.byte(x[(i - offset[j] + 16) % 16] >> (BigInt(j) * 8n))];
            y[i] = result ^ BigInt(i << 4) ^ round;
        }
    }

    private G2(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        let r = 0x00F0F0F0F0F0F0F3n;
        const T = [T0, T1, T2, T3, T4, T5, T6, T7];
        const offset = [0, 1, 2, 3, 4, 5, 6, 11];
        for (let i = 0; i < 16; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) result ^= T[j][this.byte(x[(i - offset[j] + 16) % 16] >> (BigInt(j) * 8n))];
            y[i] = result + (r ^ ((BigInt((15 - i) * 16) ^ round) << 56n));
        }
    }

    private P(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        for(let idx = 0n; idx < 16n; idx++) x[Number(idx)] ^= (idx << 4n) ^ round;
        this.G1(x, y, round+1n);
        this.G(y, x);
    }

    private Q(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        let r = 0x00F0F0F0F0F0F0F3n;
        for(let j = 0n; j < 16n; j++) x[Number(j)] += (r ^ ((((15n - j) * 0x10n) ^ round) << 56n));
        this.G2(x, y, round+1n);
        this.G(y, x);
    }

    private outputTransform() {
        let t1 = new BigUint64Array(this.s),
            t2 = new BigUint64Array(16);
        
        for(let r = 0n; r < 14n; r += 2n) this.P(t1, t2, r);
        for(let column = 0; column < 16; column++) this.s[column] ^= t1[column];
    }

    private transform(b: BigUint64Array) {
        let AQ1 = new BigUint64Array(16);
        let AP1 = new BigUint64Array(16);
        let tmp = new BigUint64Array(16);

        for(let column = 0; column < 16; column++) {
            AP1[column] = this.s[column] ^ b[column];
            AQ1[column] = b[column];
        }

        for(let r = 0n; r < 14n; r += 2n) {
            this.P(AP1, tmp, r);
            this.Q(AQ1, tmp, r);
        }

        for(let column = 0; column < 16; column++) this.s[column] ^= AP1[column] ^ AQ1[column];
    }
    private block(b: Uint8Array) { return this.transform(bytesToUint64s(b)); }
}

/** Kupyna 384 bit version, potentially broken */
export class Kupyna384 implements KupynaShort<Kupyna384> {
    outputLen: number = 48;
    blockLen: number = 128;
    buffer: Uint8Array = new Uint8Array();

    /** Kupyna 384 bit version, potentially broken */
    constructor() {}
    /** Create hash instance */
    public static create(): Kupyna384 { return new Kupyna384(); }

    _cloneInto(to?: Kupyna384): Kupyna384 {
        to ||= new Kupyna384();
        to.buffer = new Uint8Array(this.buffer);
        return to;
    }
    clone(): Kupyna384 { return this._cloneInto(); }

    update(data: Uint8Array): this {
        this.buffer = concatBytes(this.buffer, data);
        return this;
    }

    digest(): Uint8Array { return this.clone().final(); }
    private final(): Uint8Array { return new Kupyna512().update(this.buffer).digest().slice(16); }
}

export const kupyna256 = (data: Uint8Array): Uint8Array => new Kupyna256().update(data).digest();
export const kupyna384 = (data: Uint8Array): Uint8Array => new Kupyna384().update(data).digest();
export const kupyna512 = (data: Uint8Array): Uint8Array => new Kupyna512().update(data).digest();
export * from "./kmac/index";