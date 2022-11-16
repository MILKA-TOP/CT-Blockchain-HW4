const { expect } = require("chai");
const { ethers } = require('hardhat');
const { Contract } = require("ethers");


const IUniswapV2Pair = require('@uniswap/v2-core/build/IUniswapV2Pair.json');
const IUniswapV2Factory = require('@uniswap/v2-core/build/IUniswapV2Factory.json');
const UNISWAP2_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

describe("Coins Uniswap (by Uniswap v2)", function () {

    async function testDeploy() {

        let BitFactoryCoin = await ethers.getContractFactory('MixBit');
        let mixBitCoin = await BitFactoryCoin.deploy();

        let ByteFactoryCoin = await ethers.getContractFactory('MixByte');
        let mixByteCoin = await ByteFactoryCoin.deploy();

        [owner, signer] = await ethers.getSigners();
        return { mixBitCoin, mixByteCoin, owner, signer };
    }

    describe("Create pair", function () {

        async function createPair() {
            console.log("--------| Should create correct pairs")
            const { mixBitCoin, mixByteCoin, owner, signer } = await testDeploy();
            const factory = new Contract(UNISWAP2_FACTORY_ADDRESS, IUniswapV2Factory.abi, owner);
            const pairTransaction = await factory.createPair(mixBitCoin.address, mixByteCoin.address);
            const pairArgs = (await pairTransaction.wait()).events[0].args;
            const pairAddress = pairArgs.pair
            console.log("Current pair: " + pairAddress)
            console.log("mixBitCoin  : " + mixBitCoin.address)
            console.log("mixByteCoin : " + mixByteCoin.address)
            tokenArray = [mixBitCoin, mixByteCoin].sort((a,b) => (a.address > b.address) ? 1 : ((b.address > a.address) ? -1 : 0))
            minToken = tokenArray[0]
            maxToken = tokenArray[1]

            console.log("----------------| Check correct token0 and token1 addresses")
            expect(pairArgs.token0).to.equal(minToken.address);
            expect(pairArgs.token1).to.equal(maxToken.address);
            const pair = new Contract(pairAddress, IUniswapV2Pair.abi, owner);
            return { pair, minToken, maxToken };
        }

        async function liquiditing() {
            const { pair, minToken, maxToken } = await createPair()
            console.log("--------| Should create correct liquid")
            console.log("----------------| Check correct token0 and token1 balance (zero)")
            expect(await minToken.balanceOf(pair.address)).to.equal(0)
            expect(await maxToken.balanceOf(pair.address)).to.equal(0)

            await minToken.transfer(pair.address, 1e6);
            await maxToken.transfer(pair.address, 1e9);
            await pair.sync();

            console.log("----------------| Check correct token0 and token1 balance (1e5 and 1e10)")
            expect(await minToken.balanceOf(pair.address)).to.equal(1e6)
            expect(await maxToken.balanceOf(pair.address)).to.equal(1e9)

            console.log("----------------| Check correct reserv balance (1e5 and 1e10)")
            const reserves = await pair.getReserves();
            expect(await reserves.reserve0).to.equal(1e6)
            expect(await reserves.reserve1).to.equal(1e9)
            return { pair, minToken, maxToken };
        }

        async function transferFrom0To1(owner, signer, minToken, pair, excepted) {
            await minToken.transfer(pair.address, 100);
            console.log("----------------| transfer 100")

            await expect(await pair.swap(0, 100, signer.address, '0x'))
                .to.emit(pair, 'Swap')
                .withArgs(owner.address, 100, 0, 0, 100, signer.address);
            expect(await minToken.balanceOf(signer.address)).to.equal(0);
            expect(await maxToken.balanceOf(signer.address)).to.equal(excepted);
            console.log("--------------------| transfer Success")
            console.log("--------------------| MaxToken balance: " + await maxToken.balanceOf(signer.address))
        }

        it("Swapping", async function () {
            const { pair, minToken, maxToken } = await liquiditing()
            console.log("--------| Should create swap")

            console.log("----------------| Pair exchange")

            const [owner, signer] = await ethers.getSigners();
            await transferFrom0To1(owner, signer, minToken, pair, 100);
            await transferFrom0To1(owner, signer, minToken, pair, 200);
            await transferFrom0To1(owner, signer, minToken, pair, 300);
        });
    });
});