import { hexToBytes } from "../src/utils";
import { describe, test, expect } from "bun:test";
import { Kupyna304 } from "../src";

const prepareInput = (input: string) => hexToBytes(input.split("\n").join("").replaceAll(" ", ""))

describe("304 bit", () => {
    test("N = 1024", () => {
        let input = prepareInput(`
000102030405060708090A0B0C0D0E0F
101112131415161718191A1B1C1D1E1F
202122232425262728292A2B2C2D2E2F
303132333435363738393A3B3C3D3E3F
404142434445464748494A4B4C4D4E4F
505152535455565758595A5B5C5D5E5F
606162636465666768696A6B6C6D6E6F
707172737475767778797A7B7C7D7E7F
        `)

        let expected = prepareInput(`0A8CADA32B979635657F256B15D5FCA4A174DE029F0B1B4387C878FCC1C00E8705D783FD7FFE`)
        
        let a = new Kupyna304()
        expect(a.update(input).digest()).toStrictEqual(expected)
    })
})