import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";
import WebApp from "@twa-dev/sdk";

function App() {
  const { connected } = useTonConnect();

  const {
    contract_address,
    contract_balance,
    counter_value,
    sendIncrement,
    sendDeposit,
    sendWithdrawalRequest,
  } = useMainContract();

  return (
    <div>
      <TonConnectButton />
      <div>
        <div className="Card">
          <b>{WebApp.platform}</b>
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
