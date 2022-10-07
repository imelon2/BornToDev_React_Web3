import './App.css';
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

import ConnectButton from './components/ConnectButton';

function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined)
  const [walletAddress, setWalletAddress] = useState(undefined)
  const [currentBalance, setCurrentBalance] = useState(undefined)
  const [chainId, setChainId] = useState(undefined)
  const [isConnected,setIsConnected] = useState(false)

  const connectWallet = useCallback(async () => {
    try {
      if(typeof window.ethereum !== 'undefined') {
        await getMetamaskData();
        setIsConnected(true);
      } else {
        alert("please install MetaMask")
      }
    } catch (error) {
      console.log(error);
    }
  },[])

  const addToken = useCallback(async() => {
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: "0x3f9A92c67a6B349e94E8868c9CC1a1505D34FFCb", // The address that the token is at.
            symbol: "BTD", // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
          },
        },
      });
      if(wasAdded) {
        console.log('토큰 추가 승인 후 action');
      } else {
        console.log('토큰 추가 승인 취소 후 action');
      }
    } catch (error) {
      console.log(error);
    }
  })

  const getMetamaskData = async () => {
    const _provider = await getProvider();
    const _signer = await getSigner(_provider);
    await getWalletData(_signer);
  }

  const getProvider = async () => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    return provider;
  }

  const getSigner = async (provider) => {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer) 

    return signer;
  }
  
  const getWalletData = async(signer) => {
    const result = await Promise.all([signer.getAddress(),signer.getBalance(),signer.getChainId()])
    setWalletAddress(result[0])
    setCurrentBalance(Number(ethers.utils.formatEther(result[1])))
    setChainId(result[2])
  
  }


  return (
    <div className="App">
      <nav className='nav'>
        <div className='rightNav'>
          <div className="connectButtonContainer">
            <ConnectButton
              isConnected={isConnected}
              connectWallet={connectWallet}
              walletAddress={walletAddress}
              currentBalance={currentBalance}
              chainId={chainId}
              addToken={addToken}
            />
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
