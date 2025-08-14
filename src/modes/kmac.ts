import { dpad } from "../const";
import { uint64sToBytes } from "../utils";
import type { KupynaBase, KupynaDerived } from "./kupyna";

/** Abstract class for Kupyna KMAC */
export abstract class KupynaKMAC<T, H extends (KupynaBase<H> | KupynaDerived<H>)> {
    readonly outputLen: number;
    readonly blockLen: number;
    readonly threshold: number;
    h: H
    ik: Uint8Array;
    len: bigint;

    constructor(hash: () => H, kpad: Uint8Array, public key: Uint8Array) {
        this.len = 0n;
        this.h = hash();
        this.outputLen = this.h.outputLen;
        this.blockLen = this.h.blockLen;
        if(key.length != this.h.outputLen) throw new Error("Invalid key length");
        this.h.update(key);
        this.h.update(kpad);
        this.ik = new Uint8Array(key.length);
        for (let i = 0; i < key.length; i++) this.ik[i] = ~key[i] & 0xFF;
        this.threshold = this.blockLen - 12;
    }

    /** Clone hash instance */
    abstract clone(): KupynaKMAC<T, H>

    /** Update hash buffer */
    update(data: Uint8Array): T {
        this.len += BigInt(data.length);
        this.h.update(data);
        return this as any as T
    }

    /** Finalize hash computation and return result as Uint8Array */
    digest(): Uint8Array { return this.clone().final(); }
    private final(): Uint8Array {
        let n = this.len;
        let pad_size: bigint;
        if(n < BigInt(this.threshold)) pad_size = (BigInt(this.threshold) - 1n) - n;
        else pad_size = (BigInt(this.blockLen) - 1n) - ((n - BigInt(this.threshold)) % BigInt(this.blockLen));
        n *= 8n;

        this.h.update(dpad.slice(0, Number(pad_size + 1n)));
        this.h.update(uint64sToBytes(new BigUint64Array([n])));
        this.h.update(dpad.slice(16, 20));
        this.h.update(this.ik);
        return this.h.digest();
    }
}