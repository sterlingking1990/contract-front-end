import { Address, Cell, Contract, ContractProvider, SendMode, Sender, beginCell, contractAddress } from "ton-core";

export type MainContractConfig = {
  number: number;
  address: Address;
  owner_address: Address;
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
  return beginCell().storeUint(config.number, 32).storeAddress(config.address).storeAddress(config.owner_address).endCell();
}

export class MainContract implements Contract {
  private initialized: boolean = false;
  private contractProvider: ContractProvider | null = null;
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  async initialize(provider: ContractProvider) {
    if (!provider) {
      console.error("Contract provider not available");
      return;
    }
    console.log("Initializing mainContract");
    try {
      // Perform contract initialization here if necessary
      // Example: const contract = new ContractClass(this.address, this.init);
      this.contractProvider = provider;
      this.initialized = true;
      console.log("mainContract initialized");
    } catch (error) {
      console.error("Error initializing mainContract:", error);
    }
  }

  static createFromConfig(
    config: MainContractConfig,
    code: Cell,
    workchain = 0
  ) {
    const data = mainContractConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);

    return new MainContract(address, init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(2, 32).endCell(),
    });
  }

  async sendIncrement(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    number_to_inc: number
  ) {
    const bodyMsg = beginCell().storeUint(1, 32).storeUint(number_to_inc, 32).endCell();
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: bodyMsg
    });
  }

  async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
    const body = beginCell().storeUint(2, 32).endCell();
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: body
    });
  }

  async sendNoOpCodeCommand(provider: ContractProvider, sender: Sender, value: bigint) {
    const bodyMg = beginCell().endCell();
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: bodyMg
    });
  }

  async sendWithdrawalRequest(provider: ContractProvider, sender: Sender, value: bigint, amount: bigint) {
    const mg_body = beginCell().storeUint(2, 32).storeCoins(amount).endCell();
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: mg_body
    });
  }

  async getData(provider: ContractProvider) {
    if (!this.initialized  || !this.contractProvider) {
      console.error("mainContract not initialized");
      return null;
    }

    console.log("Calling mainContract.getData()");
    try {
      const { stack } = await this.contractProvider.get("get_contract_storage_data", []);
      console.log("Stack response:", stack);
      if (!stack) {
        console.error("Stack response is null");
        return null;
      }
      return {
        number: stack.readNumber(),
        recent_sender: stack.readAddress(),
        owner_address: stack.readAddress()
      };
    } catch (error) {
      console.error("Error fetching contract data:", error);
      return null;
    }
  }

  async getBalance(provider: ContractProvider) {
    if (!this.initialized || !this.contractProvider) {
      console.error("mainContract not initialized");
      return null;
    }

    console.log("Calling mainContract.getBalance()");
    try {
      const { stack } = await this.contractProvider.get("balance", []);
      console.log("Balance stack response:", stack);
      if (!stack) {
        console.error("Balance stack response is null");
        return null;
      }
      return {
        balance: stack.readNumber()
      };
    } catch (error) {
      console.error("Error fetching contract balance:", error);
      return 0;
    }
  }
}
