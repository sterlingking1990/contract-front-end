import { OpenedContract, Address } from "ton-core";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useEffect, useState } from "react";
import { MainContract } from '../contracts/MainContract';
import { useTonConnect } from "./useTonConnect";
import { toNano } from "ton-core";

export function useMainContract() {
    const client = useTonClient();
    const { sender } = useTonConnect();

    const sleep = (time: number) =>
        new Promise((resolve) => setTimeout(resolve, time));

    const [contractData, setContractData] = useState<null | {
        counter_value: number;
        recent_sender: Address;
        owner_address: Address;
    }>();

    const [balance, setBalance] = useState<null | number>(0);

    const mainContract = useAsyncInitialize(async () => {
        if (!client) {
            console.log("Client not initialized");
            return;
        }
        console.log("Initializing mainContract");
        const contract = new MainContract(
            Address.parse("EQCD1o3InWOcSeWEh8P6mOisSDfWm6DdmyecyUQO8Eanu8c-")
        );
        return client.open(contract) as OpenedContract<MainContract>;
    }, [client]);

    useEffect(() => {
        async function getValue() {
            if (!mainContract) {
                console.log("mainContract not initialized");
                return;
            }
            setContractData(null);
            console.log("Calling mainContract.getData()");
            const val = await mainContract.getData();
            console.log("Received data:", val);

            const { balance } = await mainContract.getBalance();
            console.log("Received balance:", balance);

            setContractData({
                counter_value: val.number,
                recent_sender: val.recent_sender,
                owner_address: val.owner_address,
            });
            setBalance(balance);
            await sleep(5000);
            getValue();
        }
        getValue();
    }, [mainContract]);

    return {
        contract_address: mainContract?.address.toString(),
        contract_balance: balance,
        ...contractData,
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
