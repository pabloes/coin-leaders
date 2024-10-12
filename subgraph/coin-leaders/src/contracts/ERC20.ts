// src/generated/ERC20.ts
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";

export class ERC20 extends ethereum.SmartContract {
    static bind(address: Address): ERC20 {
        return new ERC20("ERC20", address);
    }

    name(): string {
        let result = super.call("name", "name():(string)", []);

        return result[0].toString();
    }

    try_name(): ethereum.CallResult<string> {
        let result = super.tryCall("name", "name():(string)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toString());
    }

    symbol(): string {
        let result = super.call("symbol", "symbol():(string)", []);

        return result[0].toString();
    }

    try_symbol(): ethereum.CallResult<string> {
        let result = super.tryCall("symbol", "symbol():(string)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toString());
    }

    decimals(): string {
        let result = super.call("decimals", "decimals():(uint8)", []);

        return result[0].toString();
    }

    try_decimals(): ethereum.CallResult<i32> {
        let result = super.tryCall("decimals", "decimals():(uint8)", []);
        if (result.reverted) {
            return new ethereum.CallResult();
        }
        let value = result.value;
        return ethereum.CallResult.fromValue(value[0].toI32());
    }
    // Add other ERC20 methods if needed, like decimals, totalSupply, etc.
}
