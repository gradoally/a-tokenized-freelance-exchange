import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode, TupleBuilder } from 'ton-core';

export type AdminCollectionConfig = {
    ownerAddress: Address;
    nextItemIndex: number | bigint;
    content: Cell;
    nftItemCode: Cell;
    royaltyParams: Cell;
};

export function adminCollectionConfigToCell(config: AdminCollectionConfig): Cell {
    return beginCell()
            .storeAddress(config.ownerAddress)
            .storeUint(config.nextItemIndex, 64)
            .storeRef(config.content)
            .storeRef(config.nftItemCode)
            .storeRef(config.royaltyParams)
         //   .storeDict(Dictionary.empty())
        .endCell();
}

export class AdminCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new AdminCollection(address);
    }

    static createFromConfig(config: AdminCollectionConfig, code: Cell, workchain = 0) {
        const data = adminCollectionConfigToCell(config);
        const init = { code, data };
        return new AdminCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getNftAddressByIndex(provider: ContractProvider, itemIndex: number): Promise<Address | null>{
        let builder = new TupleBuilder();
        builder.writeNumber(itemIndex);
        const result = await provider.get('get_nft_address_by_index', builder.build());
        return result.stack.readAddressOpt();
    }
}
