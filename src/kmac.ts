import { Kupyna256, Kupyna384, Kupyna512 } from "./index";
import { KupynaKMAC } from "./modes/kmac";
import { kpad32, kpad48, kpad64 } from "./const";

/** Kupyna KMAC (256 bit version) */
export class KupynaKMAC256 extends KupynaKMAC<KupynaKMAC256, Kupyna256> {
    constructor(public key: Uint8Array) { super(Kupyna256.create, kpad32, key); }
    _cloneInto(to?: KupynaKMAC256): KupynaKMAC256 {
        to ||= new KupynaKMAC256(this.key);
        to.h = this.h.clone();
        to.len = this.len;
        to.ik = new Uint8Array(this.ik);
        return to;
    }
    clone(): KupynaKMAC256 { return this._cloneInto(); }
}

/** Kupyna KMAC (512 bit version) */
export class KupynaKMAC512 extends KupynaKMAC<KupynaKMAC512, Kupyna512> {
    constructor(public key: Uint8Array) { super(Kupyna512.create, kpad64, key); }
    _cloneInto(to?: KupynaKMAC512): KupynaKMAC512 {
        to ||= new KupynaKMAC512(this.key);
        to.h = this.h.clone();
        to.len = this.len;
        to.ik = new Uint8Array(this.ik);
        return to;
    }
    clone(): KupynaKMAC512 { return this._cloneInto(); }
}

/** Kupyna KMAC (384 bit version) */
export class KupynaKMAC384 extends KupynaKMAC<KupynaKMAC512, Kupyna384> {
    constructor(public key: Uint8Array) { super(Kupyna384.create, kpad48, key); }
    _cloneInto(to?: KupynaKMAC384): KupynaKMAC384 {
        to ||= new KupynaKMAC384(this.key);
        to.h = this.h.clone();
        to.len = this.len;
        to.ik = new Uint8Array(this.ik);
        return to;
    }
    clone(): KupynaKMAC384 { return this._cloneInto(); }
}
