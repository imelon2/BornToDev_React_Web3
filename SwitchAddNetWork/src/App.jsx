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

  const switchNetwork = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: "0x13881" }],
      });

      await getMetamaskData();
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: "0x13881",
                chainName: 'Matic Mumbai',
                nativeCurrency: {
                  name:"MATIC",
                  symbol:"MATIC",
                  decimals: 18
                },
                rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                blockExplorerUrls: ['https://mumbai.ploygonscan.com']
              },
            ],
          });

          await getMetamaskData();
        } catch (addError) {
          // handle "add" error
          console.log(addError);
        }
      }
      // handle other "switch" errors
      console.log(switchError);
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
              switchNetwork={switchNetwork}
            />
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
