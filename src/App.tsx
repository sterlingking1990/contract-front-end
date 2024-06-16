import "./App.css";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract";
import { useTonConnect } from "./hooks/useTonConnect";
import { beginCell, toNano } from "ton-core";

function App() {
  const { connected } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI();

  const contractAddress = "EQCdCuCi-tTagiVdjzaZzcjjlepai8CrdCh-cUZC2apC_LOo";
  const handleIncrement = () => {
    const bodyMsg = beginCell()
      .storeUint(1, 32)
      .storeUint(1, 32)
      .endCell();
    const myTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: contractAddress,
          amount: toNano("0.02").toString(),
          payload: bodyMsg.toBoc().toString("base64"),
        },
      ],
    };
    tonConnectUI.sendTransaction(myTransaction);
  };

  const {
    contract_address,
    contract_balance,
    counter_value,
    sendIncrement,
    sendDeposit,
    sendWithdrawalRequest,
  } = useMainContract();
  const connI = tonConnectUI.connector;

  return (
    <div>
      <div>
        <button onClick={() => connI.connect}>Connect to TonHub</button>
        {connected && (
          <div>
            <button onClick={handleIncrement}>Increment by 1</button>
          </div>
        )}
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
