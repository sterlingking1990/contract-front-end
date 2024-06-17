import { OpenedContract, Address, address } from "ton-core";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useEffect, useState } from "react";
import { MainContract } from '../contracts/MainContract';
import { useTonConnect } from "./useTonConnect";
import { toNano } from "ton-core";
import { NetworkProvider, compile } from "@ton-community/blueprint";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

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
    const [mainContract, setMainContract] = useState<null | OpenedContract>(null);

    useEffect(() => {
        const initializeContract = async () => {
            if (!client) {
                console.log("Client not initialized");
                return;
            }

            console.log("Initializing mainContract");
            const codeCell = await compile("MainContract");
            const contract = MainContract.createFromConfig(
                {
                    number: 0,
                    address: address("EQDgXBJjYUWwc_X42blcnXoz5yo7tVeJsaLbipzW9BKw_UKt"),
                    owner_address: address("EQDgXBJjYUWwc_X42blcnXoz5yo7tVeJsaLbipzW9BKw_UKt"),
                },
                codeCell
            );

            const openedContract = client.open(contract);
            setMainContract(openedContract);
        };

        initializeContract();
    }, [client]);

    useEffect(() => {
        const getValue = async () => {
            if (!mainContract) {
                console.log("mainContract not initialized");
                return;
            }

            setContractData(null);
            console.log("Calling mainContract.getData()");

            try {
                const val = await mainContract.getData();
                const { balance } = await mainContract.getBalance();
                console.log("Received data:", val);

                if (val) {
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
            } catch (error) {
                console.error("Error fetching contract data:", error);
            }
        };

        getValue();
    }, [mainContract]);

    return {
        contract_address: mainContract?.address.toString(),
        contract_balance: balance,
        ...contractData,
        sendIncrement: async () => {
            try {
                await mainContract?.sendIncrement(sender, toNano("0.05"), 5);
                console.log("Increment sent successfully");
            } catch (error) {
                console.error("Error sending increment:", error);
            }
        },
        sendDeposit: async () => {
            try {
                await mainContract?.sendDeposit(sender, toNano("1"));
                console.log("Deposit sent successfully");
            } catch (error) {
                console.error("Error sending deposit:", error);
            }
        },
        sendWithdrawalRequest: async () => {
            try {
                await mainContract?.sendWithdrawalRequest(sender, toNano("0.05"), toNano("0.7"));
                console.log("Withdrawal request sent successfully");
            } catch (error) {
                console.error("Error sending withdrawal request:", error);
            }
        }
    };
}
