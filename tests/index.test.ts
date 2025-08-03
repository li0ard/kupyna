import { describe, test, expect } from "bun:test"
import { randomBytes } from "crypto"
import { kupyna256, Kupyna256, kupyna304, Kupyna304, kupyna384, Kupyna384, kupyna48, Kupyna48, kupyna512, Kupyna512 } from "../src"

describe("Test symmetric", () => {
    let chunks: Buffer[] = [];
    for(let i = 0; i < 10; i++) chunks.push(randomBytes(10));

    test("48", () => {
        let m = new Kupyna48()
        for(let i of chunks) m.update(i);
        expect(m.digest()).toStrictEqual(kupyna48(Buffer.concat(chunks)))
    })

    test("256", () => {
        let m = new Kupyna256()
        for(let i of chunks) m.update(i);
        expect(m.digest()).toStrictEqual(kupyna256(Buffer.concat(chunks)))
    })

    test("304", () => {
        let m = new Kupyna304()
        for(let i of chunks) m.update(i);
        expect(m.digest()).toStrictEqual(kupyna304(Buffer.concat(chunks)))
    })

    test("384", () => {
        let m = new Kupyna384()
        for(let i of chunks) m.update(i);
        expect(m.digest()).toStrictEqual(kupyna384(Buffer.concat(chunks)))
    })

    test("512", () => {
        let m = new Kupyna512()
        for(let i of chunks) m.update(i);
        expect(m.digest()).toStrictEqual(kupyna512(Buffer.concat(chunks)))
    })
})

describe("Clone", () => {
    test("48", () => {
        let m = new Kupyna48().update(new TextEncoder().encode("foo"))
        let c = m.clone()
        c.update(new TextEncoder().encode("bar"))
        m.update(new TextEncoder().encode("bar"))

        expect(c.digest()).toStrictEqual(m.digest())
    })

    test("256", () => {
        let m = new Kupyna256().update(new TextEncoder().encode("foo"))
        let c = m.clone()
        c.update(new TextEncoder().encode("bar"))
        m.update(new TextEncoder().encode("bar"))

        expect(c.digest()).toStrictEqual(m.digest())
    })

    test("304", () => {
        let m = new Kupyna304().update(new TextEncoder().encode("foo"))
        let c = m.clone()
        c.update(new TextEncoder().encode("bar"))
        m.update(new TextEncoder().encode("bar"))

        expect(c.digest()).toStrictEqual(m.digest())
    })

    test("384", () => {
        let m = new Kupyna384().update(new TextEncoder().encode("foo"))
        let c = m.clone()
        c.update(new TextEncoder().encode("bar"))
        m.update(new TextEncoder().encode("bar"))

        expect(c.digest()).toStrictEqual(m.digest())
    })

    test("512", () => {
        let m = new Kupyna512().update(new TextEncoder().encode("foo"))
        let c = m.clone()
        c.update(new TextEncoder().encode("bar"))
        m.update(new TextEncoder().encode("bar"))

        expect(c.digest()).toStrictEqual(m.digest())
    })
})