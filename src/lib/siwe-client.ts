import { SiweMessage } from "siwe"
import { signIn } from "next-auth/react"
import { MultiSigService } from "@/services/multisig-service";

export async function logInWithEthereum() {
  const wallet = await MultiSigService.getInstance();
  const provider = await wallet.getProvider();
  const signer = await wallet.getSigner();
  const address = await wallet.getCurrentAccount();
  const chainId = (await provider.getNetwork()).chainId;

  const nonceRes = await fetch("/api/siwe/nonce")
  const { nonce } = await nonceRes.json();

  try {
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: "Sign in with Ethereum.",
      uri: window.location.origin,
      version: "1",
      chainId: Number(chainId),
      nonce
    })

    const signature = await signer.signMessage(message.prepareMessage());

    const res = await signIn("credentials", {
      message: JSON.stringify(message),
      signature,
      redirect: false,
      callbackUrl: "/dashboard"
    })

    if (res?.ok) {
      window.location.href = "/";
    } else {
      console.error("SIWE login failed", res?.error);
    }
  } catch (error) {
    console.log("Error", error)
  }
}
