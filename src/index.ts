import { KupynaBase, KupynaDerived } from "./modes/kupyna";

export { type Kupyna } from "./const";
export { KupynaBase, KupynaDerived } from "./modes/kupyna";
export * from "./kmac";

/** Kupyna 256 bit version */
export class Kupyna256 extends KupynaBase<Kupyna256> {
    readonly outputLen = 32;
    readonly rounds = 10;
    readonly offsets = [0, 1, 2, 3, 4, 5, 6, 7];

    /** Kupyna 256 bit version */
    constructor() { super(64); }
    _cloneInto(to?: Kupyna256): Kupyna256 {
        to ||= new Kupyna256();
        to.s = new BigUint64Array(this.s);
        to.x = new Uint8Array(this.x);
        to.nx = this.nx;
        to.len = this.len;

        return to;
    }
    clone(): Kupyna256 { return this._cloneInto(); }
    /** Create hash instance */
    public static create(): Kupyna256 { return new Kupyna256(); }
}

/** Kupyna 512 bit version */
export class Kupyna512 extends KupynaBase<Kupyna512> {
    readonly outputLen = 64;
    readonly rounds = 14;
    readonly offsets = [0, 1, 2, 3, 4, 5, 6, 11];

    /** Kupyna 512 bit version */
    constructor() { super(128); }
    _cloneInto(to?: Kupyna512): Kupyna512 {
        to ||= new Kupyna512();
        to.s = new BigUint64Array(this.s);
        to.x = new Uint8Array(this.x);
        to.nx = this.nx;
        to.len = this.len;

        return to;
    }
    clone(): Kupyna512 { return this._cloneInto(); }
    /** Create hash instance */
    public static create(): Kupyna512 { return new Kupyna512(); }
}

/** Kupyna 48 bit */
export class Kupyna48 extends KupynaDerived<Kupyna256> {
    constructor() { super(Kupyna256.create, -6); }
    /** Create hash instance */
    public static create(): Kupyna48 { return new Kupyna48(); }
    _cloneInto(to?: Kupyna48): Kupyna48 {
        to ||= new Kupyna48();
        to.buffer = new Uint8Array(this.buffer);
        return to;
    }
    clone(): Kupyna48 { return this._cloneInto(); }
}

/** Kupyna 304 bit */
export class Kupyna304 extends KupynaDerived<Kupyna512> {
    constructor() { super(Kupyna512.create, -38); }
    /** Create hash instance */
    public static create(): Kupyna304 { return new Kupyna304(); }
    _cloneInto(to?: Kupyna304): Kupyna304 {
        to ||= new Kupyna304();
        to.buffer = new Uint8Array(this.buffer);
        return to;
    }
    clone(): Kupyna304 { return this._cloneInto(); }
}

/** Kupyna 384 bit */
export class Kupyna384 extends KupynaDerived<Kupyna512> {
    constructor() { super(Kupyna512.create, -48); }
    /** Create hash instance */
    public static create(): Kupyna384 { return new Kupyna384(); }
    _cloneInto(to?: Kupyna384): Kupyna384 {
        to ||= new Kupyna384();
        to.buffer = new Uint8Array(this.buffer);
        return to;
    }
    clone(): Kupyna384 { return this._cloneInto(); }
}

/**
 * Compute hash with Kupyna 48 bit
 * @param data Input data
 */
export const kupyna48 = (data: Uint8Array): Uint8Array => new Kupyna48().update(data).digest();
/**
 * Compute hash with Kupyna 256 bit
 * @param data Input data
 */
export const kupyna256 = (data: Uint8Array): Uint8Array => new Kupyna256().update(data).digest();
/**
 * Compute hash with Kupyna 304 bit
 * @param data Input data
 */
export const kupyna304 = (data: Uint8Array): Uint8Array => new Kupyna304().update(data).digest();
/**
 * Compute hash with Kupyna 384 bit
 * @param data Input data
 */
export const kupyna384 = (data: Uint8Array): Uint8Array => new Kupyna384().update(data).digest();
/**
 * Compute hash with Kupyna 512 bit
 * @param data Input data
 */
export const kupyna512 = (data: Uint8Array): Uint8Array => new Kupyna512().update(data).digest();