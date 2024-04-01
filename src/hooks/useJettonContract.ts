import { useEffect, useState } from "react";
import { Address, fromNano, OpenedContract, toNano } from "ton-core";
import {Mint, SampleJetton} from "../../build/SampleJetton/tact_SampleJetton";
import {JettonDefaultWallet} from "../../build/SampleJetton/tact_JettonDefaultWallet";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

export function useJettonContract() {
    const {client} = useTonClient()
    const {wallet, sender} = useTonConnect()
    const [balance, setBalance] = useState<string | null>()

    const jettonContract = useAsyncInitialize(async()=>{
        if(!client || !wallet) return;

        const contract = SampleJetton.fromAddress(Address.parse("EQBbNX--whUfGV6F8vC1TFTG417dRPkVIAQ4jDeAput_EHDA"))
        // const contract = SampleJetton.fromAddress(Address.parse("EQB8StgTQXidy32a8xfu7j4HMoWYV0b0cFM8nXsP2cza_b7Y"))
        // const contract = SampleJetton.fromAddress(Address.parse("EQBFQXpVeSD7xS2Enf5ypDyo5ie3sr9upCDENPkTl_z2CRBt"))
        // const contract = SampleJetton.fromAddress(Address.parse("EQBGU2TOxXP_nPbSRANM-TrOj7mWI6JMi5nOAFNrB4jJQiyk"))
        // const contract = SampleJetton.fromAddress(Address.parse("EQBfD13XTrK91Z-qVZz7J1gvV0Zi1emccDe-Hk_wy4Gu2stD"))
        // const contract = SampleJetton.fromAddress(Address.parse("EQBFQXpVeSD7xS2Enf5ypDyo5ie3sr9upCDENPkTl_z2CRBt"))

        // Address.parse("EQB8StgTQXidy32a8xfu7j4HMoWYV0b0cFM8nXsP2cza_b7Y") // replace with your address from tutorial 2 step 8
        // Address.parse("EQBfD13XTrK91Z-qVZz7J1gvV0Zi1emccDe-Hk_wy4Gu2stD") // replace with your address from tutorial 2 step 8
        // Address.parse("EQBFQXpVeSD7xS2Enf5ypDyo5ie3sr9upCDENPkTl_z2CRBt") // replace with your address from tutorial 2 step 8
        // Address.parse("EQBGU2TOxXP_nPbSRANM-TrOj7mWI6JMi5nOAFNrB4jJQiyk") // replace with your address from tutorial 2 step 8
        // Address.parse("EQB8StgTQXidy32a8xfu7j4HMoWYV0b0cFM8nXsP2cza_b7Y") // replace with your address from tutorial 2 step 8

        return client.open(contract) as OpenedContract<SampleJetton>
    }, [client, wallet])

    const jettonWalletContract = useAsyncInitialize(async()=>{
        if(!jettonContract || !client) return;

        const jettonWalletAddress = await jettonContract.getGetWalletAddress(
            Address.parse(Address.parse(wallet!).toString())
        )
        console.log(jettonWalletAddress);

        return client.open(JettonDefaultWallet.fromAddress(jettonWalletAddress))
    }, [jettonContract, client])

    useEffect(()=>{
        async function getBalance() {
            if(!jettonWalletContract) return
            const a = await jettonContract?.getGetJettonData();
            console.log(a);
            setBalance(null)
            const balance = (await jettonWalletContract.getGetWalletData()).balance
            setBalance(fromNano(balance))
            await sleep(5000)
            getBalance()
        }

        getBalance()

    }, [jettonWalletContract])

    return {
        jettonWalletAddress: jettonWalletContract?.address.toString(),
        balance: balance,
        mint: () => {
            const message: Mint = {
                $$type: "Mint",
                amount: 150n
            }

            jettonContract?.send(sender, {
                value: toNano("0.01")
            }, message)
        }
    }
}