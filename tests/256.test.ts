import { hexToBytes } from "../src/utils";
import { describe, test, expect } from "bun:test";
import { Kupyna256 } from "../src";

const prepareInput = (input: string) => hexToBytes(input.split("\n").join("").replaceAll(" ", ""))

describe("256 bit", () => {
    test("N = 512", () => {
        let input = prepareInput(`
000102030405060708090A0B0C0D0E0F
101112131415161718191A1B1C1D1E1F
202122232425262728292A2B2C2D2E2F
303132333435363738393A3B3C3D3E3F
        `)

        let expected = prepareInput(`
08F4EE6F1BE6903B324C4E27990CB24E
F69DD58DBE84813EE0A52F6631239875
        `)
        
        let a = new Kupyna256()
        expect(a.update(input).digest()).toStrictEqual(expected)
    })

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

        let expected = prepareInput(`
0A9474E645A7D25E255E9E89FFF42EC7
EB31349007059284F0B182E452BDA882
        `)
        
        let a = new Kupyna256()
        expect(a.update(input).digest()).toStrictEqual(expected)
    })

    test("N = 2048", () => {
        let input = prepareInput(`
000102030405060708090A0B0C0D0E0F
101112131415161718191A1B1C1D1E1F
202122232425262728292A2B2C2D2E2F
303132333435363738393A3B3C3D3E3F
404142434445464748494A4B4C4D4E4F
505152535455565758595A5B5C5D5E5F
606162636465666768696A6B6C6D6E6F
707172737475767778797A7B7C7D7E7F
808182838485868788898A8B8C8D8E8F
909192939495969798999A9B9C9D9E9F
A0A1A2A3A4A5A6A7A8A9AAABACADAEAF
B0B1B2B3B4B5B6B7B8B9BABBBCBDBEBF
C0C1C2C3C4C5C6C7C8C9CACBCCCDCECF
D0D1D2D3D4D5D6D7D8D9DADBDCDDDEDF
E0E1E2E3E4E5E6E7E8E9EAEBECEDEEEF
F0F1F2F3F4F5F6F7F8F9FAFBFCFDFEFF

        `)

        let expected = prepareInput(`
D305A32B963D149DC765F68594505D40
77024F836C1BF03806E1624CE176C08F
        `)
        
        let a = new Kupyna256()
        expect(a.update(input).digest()).toStrictEqual(expected)
    })

    test("N = 8", () => {
        let input = prepareInput(`FF`)

        let expected = prepareInput(`
EA7677CA4526555680441C117982EA14
059EA6D0D7124D6ECDB3DEEC49E890F4
        `)
        
        let a = new Kupyna256()
        expect(a.update(input).digest()).toStrictEqual(expected)
    })

    test("N = 760", () => {
        let input = prepareInput(`
000102030405060708090A0B0C0D0E0F
101112131415161718191A1B1C1D1E1F
202122232425262728292A2B2C2D2E2F
303132333435363738393A3B3C3D3E3F
404142434445464748494A4B4C4D4E4F
505152535455565758595A5B5C5D5E
        `)

        let expected = prepareInput(`
1075C8B0CB910F116BDA5FA1F19C29CF
8ECC75CAFF7208BA2994B68FC56E8D16
        `)
        
        let a = new Kupyna256()
        expect(a.update(input).digest()).toStrictEqual(expected)
    })

    test("N = 0", () => {
        let input = Buffer.from("", "hex")

        let expected = prepareInput(`
CD5101D1CCDF0D1D1F4ADA56E888CD72
4CA1A0838A3521E7131D4FB78D0F5EB6
        `)
        
        let a = new Kupyna256()
        expect(a.update(input).digest()).toStrictEqual(expected)
    })
})