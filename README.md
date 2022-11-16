# ДЗ №4 К занятию “Solidity + EVM, low-level patterns”
## Выполнил работу Миленин Иван (M33351)

**Задание:** 

- создать в форке mainnet собственный токен
- сделать swap-пару в Uniswap v2
- провести обмен одного токена на другой
- в Hardhat или Brownie
        
___________________

Итак, алгоритм выполнения был следующий:
1) Итак, для форка необходимо произвести эту команду
1) Создать токены `MixBit` и `MixByte`;
``` npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/<API>```
[см. ссылку](https://hardhat.org/hardhat-network/docs/guides/forking-other-networks)
2) Произвести их деплой;
```
async function testDeploy() {

        let BitFactoryCoin = await ethers.getContractFactory('MixBit');
        let mixBitCoin = await BitFactoryCoin.deploy();

        let ByteFactoryCoin = await ethers.getContractFactory('MixByte');
        let mixByteCoin = await ByteFactoryCoin.deploy();

        [owner, signer] = await ethers.getSigners();
        return { mixBitCoin, mixByteCoin, owner, signer };
    }
```
3) Создать Uniswap pair;
Проиpводится через `IUniswapV2Factory` и `createPair`

## Вывод в консоль:
```
PS C:\Users\MILKA\Desktop\DESKTOP_ELEMENTS\HW\blockchain\hw4\template> npx hardhat test test/Token.js --network localhost


  Coins Uniswap (by Uniswap v2)
    Create pair
--------| Should create correct pairs
Current pair: 0x15A60E3cc00B7549f14fDedC182cf3CD5b3EcDfA
mixBitCoin  : 0x90c84237fDdf091b1E63f369AF122EB46000bc70
mixByteCoin : 0x3D63c50AD04DD5aE394CAB562b7691DD5de7CF6f
----------------| Check correct token0 and token1 addresses
--------| Should create correct liquid
----------------| Check correct token0 and token1 balance (zero)
----------------| Check correct token0 and token1 balance (1e5 and 1e10)
----------------| Check correct reserv balance (1e5 and 1e10)
--------| Should create swap
----------------| Pair exchange
----------------| transfer 100
--------------------| transfer Success
--------------------| MaxToken balance: 100
----------------| transfer 100
--------------------| transfer Success
--------------------| MaxToken balance: 200
----------------| transfer 100
--------------------| transfer Success
--------------------| MaxToken balance: 300
      ✔ Swapping (3563ms)


  1 passing (4s)
  ```

