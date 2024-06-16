import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";

function App() {
  const handleConnect = () => {
    const tonConnectURL =
      "https://tonhub.com/ton-connect?v=2&id=ec530b57db301d5aeeb0f84ace65f98d9dd07899f3564917a81b11d320740246&r=%7B%22manifestUrl%22%3A%22https%3A%2F%2Fsterlingking1990.github.io%2Fcontract-front-end%2Ftonconnect-manifest.json%22%2C%22items%22%3A%5B%7B%22name%22%3A%22ton_addr%22%7D%5D%7D&ret=googlechrome%3A%2F%2F";

    // Open the TonConnect URL to initiate the connection
    window.open(tonConnectURL, "_blank");
  };

  const {
    contract_address,
    contract_balance,
    counter_value,
    sendIncrement,
    sendDeposit,
    sendWithdrawalRequest,
  } = useMainContract();

  const { connected } = useTonConnect();

  return (
    <div>
      <div>
        <TonConnectButton />
        <button onClick={handleConnect}>Connect to TonHub</button>
      </div>
      <div>
        <div className="Card">
          <b>Our Contract Address</b>
          <div className="Hint">{contract_address?.slice(0, 30) + "..."}</div>
          <b>Our Contract Balance</b>
          {contract_balance && <div className="Hint">{contract_balance}</div>}
        </div>
        <div className="Card">
          <b>Counter Value</b>
          <div>{counter_value ?? "loading..."}</div>
        </div>

        {connected && <a onClick={() => sendIncrement()}>Increment by 5</a>}
        <br />
        {connected && <a onClick={() => sendDeposit()}>Deposit 1 Ton</a>}
        <br />
        {connected && (
          <a
            onClick={() => {
              sendWithdrawalRequest();
            }}
          >
            Withdraw 0.7 Ton from Contract
          </a>
        )}
      </div>
    </div>
  );
}

export default App;
