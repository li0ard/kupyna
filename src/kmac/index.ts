import { type KupynaKMAC } from "../const";
import { Kupyna256, Kupyna384, Kupyna512 } from "../index";
import { uint64sToBytes } from "../utils";
import { dpad, kpad32, kpad48, kpad64 } from "./pad";

/** Kupyna KMAC (256 bit version) */
export class KupynaKMAC256 implements KupynaKMAC<KupynaKMAC256, Kupyna256> {
    outputLen: number;
    blockLen: number;
    h: Kupyna256;
    ik: Uint8Array;
    len: bigint;
    /**
     * Kupyna KMAC (256 bit version)
     * @param key Authentication key
     */
    constructor(public key: Uint8Array) {
        this.len = 0n;
        this.h = Kupyna256.create();
        this.outputLen = this.h.outputLen
        this.blockLen = this.h.blockLen
        if(key.length != this.h.outputLen) throw new Error("Invalid key length");

        this.h.update(key);
        this.h.update(kpad32);
        this.ik = new Uint8Array(key.length);
        for (let i = 0; i < key.length; i++) this.ik[i] = ~key[i] & 0xFF;
    }

    _cloneInto(to?: KupynaKMAC256): KupynaKMAC256 {
        to ||= new KupynaKMAC256(this.key);
        to.h = this.h.clone();
        to.len = this.len;
        to.ik = new Uint8Array(this.ik);
        return to;
    }
    clone(): KupynaKMAC256 { return this._cloneInto(); }

    update(data: Uint8Array): this {
        this.len += BigInt(data.length);
        this.h.update(data);
        return this;
    }

    digest(): Uint8Array { return this.clone().final(); }
    private final(): Uint8Array {
        let n = this.len;
        let pad_size: bigint;
        if(n < 52n) pad_size = 51n - n;
        else pad_size = 63n - ((n - 52n) % 64n);
        n *= 8n;

        this.h.update(dpad.slice(0, Number(pad_size + 1n)));
        this.h.update(uint64sToBytes(new BigUint64Array([n])));
        this.h.update(dpad.slice(16, 20));
        this.h.update(this.ik);
        return this.h.digest();
    }
}

/** Kupyna KMAC (512 bit version) */
export class KupynaKMAC512 implements KupynaKMAC<KupynaKMAC512, Kupyna512> {
    outputLen: number;
    blockLen: number;
    h: Kupyna512;
    ik: Uint8Array;
    len: bigint;
    /**
     * Kupyna KMAC (512 bit version)
     * @param key Authentication key
     */
    constructor(public key: Uint8Array) {
        this.len = 0n;
        this.h = Kupyna512.create();
        this.outputLen = this.h.outputLen
        this.blockLen = this.h.blockLen
        if(key.length != this.h.outputLen) throw new Error("Invalid key length")
        
        this.h.update(key);
        this.h.update(kpad64);
        this.ik = new Uint8Array(key.length);
        for (let i = 0; i < key.length; i++) this.ik[i] = ~key[i] & 0xFF;
    }

    _cloneInto(to?: KupynaKMAC512): KupynaKMAC512 {
        to ||= new KupynaKMAC512(this.key);
        to.h = this.h.clone();
        to.len = this.len;
        to.ik = new Uint8Array(this.ik);
        return to;
    }
    clone(): KupynaKMAC512 { return this._cloneInto(); }

    update(data: Uint8Array): this {
        this.len += BigInt(data.length);
        this.h.update(data);
        return this;
    }

    digest(): Uint8Array { return this.clone().final() }
    private final(): Uint8Array {
        let n = this.len;
        let pad_size: bigint;
        if(n < 116n) pad_size = 115n - n;
        else pad_size = 127n - ((n - 116n) % 128n);
        n *= 8n;

        this.h.update(dpad.slice(0, Number(pad_size + 1n)));
        this.h.update(uint64sToBytes(new BigUint64Array([n])));
        this.h.update(dpad.slice(16, 20));
        this.h.update(this.ik);
        return this.h.digest();
    }
}

/** Kupyna KMAC (384 bit version) */
export class KupynaKMAC384 implements KupynaKMAC<KupynaKMAC384, Kupyna384> {
    outputLen: number;
    blockLen: number;
    h: Kupyna384;
    ik: Uint8Array;
    len: bigint;
    /**
     * Kupyna KMAC (384 bit version)
     * @param key Authentication key
     */
    constructor(public key: Uint8Array) {
        this.len = 0n;
        this.h = Kupyna384.create();
        this.outputLen = this.h.outputLen
        this.blockLen = this.h.blockLen
        if(key.length != this.h.outputLen) throw new Error("Invalid key length")
        
        this.h.update(key);
        this.h.update(kpad48);
        this.ik = new Uint8Array(key.length);
        for (let i = 0; i < key.length; i++) this.ik[i] = ~key[i] & 0xFF;
    }

    _cloneInto(to?: KupynaKMAC384): KupynaKMAC384 {
        to ||= new KupynaKMAC384(this.key);
        to.h = this.h.clone();
        to.len = this.len;
        to.ik = new Uint8Array(this.ik);
        return to;
    }
    clone(): KupynaKMAC384 { return this._cloneInto(); }

    update(data: Uint8Array): this {
        this.len += BigInt(data.length);
        this.h.update(data);
        return this;
    }

    digest(): Uint8Array { return this.clone().final() }
    private final(): Uint8Array {
        let n = this.len;
        let pad_size: bigint;
        if(n < 116n) pad_size = 115n - n;
        else pad_size = 127n - ((n - 116n) % 128n);
        n *= 8n;

        this.h.update(dpad.slice(0, Number(pad_size + 1n)));
        this.h.update(uint64sToBytes(new BigUint64Array([n])));
        this.h.update(dpad.slice(16, 20));
        this.h.update(this.ik);
        return this.h.digest();
    }
}