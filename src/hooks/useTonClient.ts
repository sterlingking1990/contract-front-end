// Updated useTonClient hook with logging
import { useAsyncInitialize } from "./useAsyncInitialize";
import { TonClient } from 'ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

export function useTonClient() {
    return useAsyncInitialize(async () => {
        const endpoint = await getHttpEndpoint({ network: "testnet" });
        console.log("TonClient endpoint:", endpoint); // Log endpoint for debugging
        return new TonClient({ endpoint });
    });
}