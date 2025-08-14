import { T0, T1, T2, T3, T4, T5, T6, T7, type Kupyna } from "../const";
import { bytesToNumberLE, bytesToUint64s, concatBytes, numberToBytesLE, uint64sToBytes } from "../utils";

const T = [T0, T1, T2, T3, T4, T5, T6, T7];
const r = 0x00F0F0F0F0F0F0F3n;

/** Abstract class for 256/512 bit */
export abstract class KupynaBase<T> implements Kupyna<KupynaBase<T>> {
    abstract readonly outputLen: number;
    /** Rounds count */
    abstract readonly rounds: number;
    /** Offsets for transformations */
    abstract readonly offsets: number[];

    /** State size */
    readonly stSize: number;
    /** Threshold for padding */
    readonly threshold: number;

    protected s: BigUint64Array;
    protected x: Uint8Array;
    protected nx: number;
    protected len: bigint;

    constructor(public readonly blockLen: number) {
        this.stSize = (blockLen / 2) / 4;
        this.threshold = blockLen - 12;

        this.s = new BigUint64Array(this.stSize);
        this.x = new Uint8Array(blockLen);
        this.nx = 0;
        this.len = 0n;

        let s1 = new Uint8Array(8);
        s1[0] = blockLen;
        this.s[0] = bytesToNumberLE(s1);
    }
 
    abstract clone(): KupynaBase<T>;

    /** Update hash buffer */
    update(data: Uint8Array): KupynaBase<T> {
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

        if (this.nx > this.threshold) {
            fillBytes(this.nx);
            this.block(this.x);
            this.nx = 0;
        }

        fillBytes(this.nx);
        this.x.set(numberToBytesLE(this.len * 8n, 12), this.threshold);
        this.block(this.x);
        this.outputTransform();

        return uint64sToBytes(this.s).slice(this.outputLen);
    }

    private byte(a: bigint) { return Number(a & 0xFFn); }

    private G(x: BigUint64Array, y: BigUint64Array) {
        for (let i = 0; i < this.stSize; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) {
                const index = (i - this.offsets[j] + this.stSize) % this.stSize;
                result ^= T[j][this.byte(x[index] >> (BigInt(j) * 8n))];
            }
            y[i] = result;
        }
    }

    private G1(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        for (let i = 0; i < this.stSize; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) {
                const index = (i - this.offsets[j] + this.stSize) % this.stSize;
                result ^= T[j][this.byte(x[index] >> (BigInt(j) * 8n))];
            }
            y[i] = result ^ BigInt(i << 4) ^ round;
        }
    }

    private G2(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        for (let i = 0; i < this.stSize; i++) {
            let result = 0n;
            for (let j = 0; j < 8; j++) {
                const index = (i - this.offsets[j] + this.stSize) % this.stSize;
                result ^= T[j][this.byte(x[index] >> (BigInt(j) * 8n))];
            }
            y[i] = result + (r ^ ((BigInt((this.stSize - 1 - i) * 16) ^ round) << 56n));
        }
    }

    private P(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        for(let idx = 0n; idx < BigInt(this.stSize); idx++) x[Number(idx)] ^= (idx << 4n) ^ round;
        this.G1(x, y, round+1n);
        this.G(y, x);
    }

    private Q(x: BigUint64Array, y: BigUint64Array, round: bigint) {
        for(let j = 0n; j < BigInt(this.stSize); j++) x[Number(j)] += (r ^ ((((BigInt(this.stSize - 1) - j) * 0x10n) ^ round) << 56n));
        this.G2(x, y, round+1n);
        this.G(y, x);
    }

    private outputTransform() {
        let t1 = new BigUint64Array(this.s),
            t2 = new BigUint64Array(this.stSize);
        
        for(let r = 0n; r < BigInt(this.rounds); r += 2n) this.P(t1, t2, r);
        for(let column = 0; column < this.stSize; column++) this.s[column] ^= t1[column];
    }

    private transform(b: BigUint64Array) {
        let AQ1 = new BigUint64Array(this.stSize);
        let AP1 = new BigUint64Array(this.stSize);
        let tmp = new BigUint64Array(this.stSize);

        for(let column = 0; column < this.stSize; column++) {
            AP1[column] = this.s[column] ^ b[column];
            AQ1[column] = b[column];
        }

        for(let r = 0n; r < BigInt(this.rounds); r += 2n) {
            this.P(AP1, tmp, r);
            this.Q(AQ1, tmp, r);
        }

        for(let column = 0; column < this.stSize; column++) this.s[column] ^= AP1[column] ^ AQ1[column];
    }
    private block(b: Uint8Array) { return this.transform(bytesToUint64s(b)); }
}

/** Abstract class for derived versions (48/304/384 bit) */
export abstract class KupynaDerived<T> implements Kupyna<KupynaDerived<T>> {
    readonly outputLen: number;
    readonly blockLen: number;
    buffer: Uint8Array = new Uint8Array();

    constructor(public hash: () => KupynaBase<T>, protected readonly slice: number) {
        this.outputLen = Math.abs(slice)
        this.blockLen = hash().blockLen
    }

    abstract clone(): KupynaDerived<T>

    update(data: Uint8Array): this {
        this.buffer = concatBytes(this.buffer, data);
        return this;
    }

    digest(): Uint8Array { return this.clone().final(); }
    private final(): Uint8Array { return this.hash().update(this.buffer).digest().slice(this.slice); }
}