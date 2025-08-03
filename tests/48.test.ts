import { hexToBytes } from "../src/utils";
import { describe, test, expect } from "bun:test";
import { Kupyna48 } from "../src";

const prepareInput = (input: string) => hexToBytes(input.split("\n").join("").replaceAll(" ", ""))

describe("48 bit", () => {
    test("N = 512", () => {
        let input = prepareInput(`
000102030405060708090A0B0C0D0E0F
101112131415161718191A1B1C1D1E1F
202122232425262728292A2B2C2D2E2F
303132333435363738393A3B3C3D3E3F
        `)
        let expected = prepareInput(`2F6631239875`)
        let a = new Kupyna48()
        expect(a.update(input).digest()).toStrictEqual(expected)
    })
})