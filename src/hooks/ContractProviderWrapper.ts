import { Address, Cell, ContractGetMethodResult, ContractProvider, ContractState, SendMode, Sender, TupleItem, TupleReader } from "ton-core";
 // Assuming this is the correct import path for ContractProvider
import { Maybe } from "ton-core/dist/utils/maybe";

class MyContractProvider implements ContractProvider {
    private client: any; // Define state variable or initialize it in the constructor
    private address:Address;


    constructor(client: any, address: Address) {
        this.client = client;
        this.address = address;
    }

    async getState(): Promise<ContractState> {
        return this.client.getContractState(this.address);
    }

    async get(name: string, args: TupleItem[]): Promise<ContractGetMethodResult> {
        return this.client.runGetMethod(this.address, name, args);
    }

    async external(message: Cell): Promise<void> {
        return this.client.sendExternalMessage(this.address, message);
    }

    async internal(via: Sender, args: {
        value: bigint | string;
        bounce?: Maybe<boolean>;
        sendMode?: SendMode;
        body?: Maybe<Cell | string>;
    }): Promise<void> {
        return this.client.sendInternalMessage(via, this.address, args.value, args.bounce, args.sendMode, args.body);
    }
}

export default MyContractProvider;
