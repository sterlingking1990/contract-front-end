import { OpenedContract, Address } from "ton-core";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useEffect, useState } from "react";
import { MainContract } from '../contracts/MainContract';
import { useTonConnect } from "./useTonConnect";
import { toNano } from "ton-core";

interface ContractData {
    counter_value: number;
    recent_sender: Address;
    owner_address: Address;
}

interface ContractState {
    contract_address: string;
    contract_balance: number | null;
    contractData: ContractData | null;
}

export function useMainContract() {
    const client = useTonClient();
    const { sender } = useTonConnect();

    const sleep = (time: number) =>
        new Promise((resolve) => setTimeout(resolve, time));

    const [contractState, setContractState] = useState<ContractState>({
        contract_address: '',
        contract_balance: 0,
        contractData: null,
    });

    const mainContract = useAsyncInitialize(async () => {
        if (!client) {
            console.log("Client not initialized");
            return null;
        }
        console.log("Initializing mainContract");
        const contract = new MainContract(
            Address.parse("0QCD1o3InWOcSeWEh8P6mOisSDfWm6DdmyecyUQO8EanuyFx")
        );
        return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!mainContract) {
                console.log("mainContract not initialized");
                return;
            }
            setContractState((prevState) => ({
                ...prevState,
                contractData: null,
            }));
            console.log("Calling mainContract.getData()");
            const val:any = await mainContract.getData();
            console.log("Received data:", val);

            const balance:any  = await mainContract.getBalance();
            console.log("Received balance:", balance);

            setContractState((prevState) => ({
                ...prevState,
                contractData: {
                    counter_value: val.number,
                    recent_sender: val.recent_sender,
                    owner_address: val.owner_address,
                },
                contract_balance: balance,
            }));
            await sleep(5000);
            getValue();
        }
        getValue();
    }, [mainContract]);

    return {
        contract_address: mainContract?.address.toString() || '',
        contract_balance: contractState.contract_balance,
        ...contractState.contractData,
        sendIncrement: async () => {
            return mainContract?.sendIncrement(sender, toNano("0.05"), 5);
        },
        sendDeposit: async () => {
            return mainContract?.sendDeposit(sender, toNano("1"));
        },
        sendWithdrawalRequest: async () => {
            return mainContract?.sendWithdrawalRequest(sender, toNano("0.05"), toNano("0.7"));
        },
    };
}
