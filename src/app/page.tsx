import { CustomConnectButton } from "@/components/ui/CustomConnectButton";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
     <div className="flex flex-col items-center justify-center">

      <h1>   -</h1>
      <h1>   -</h1>
      <ConnectButton/>
      <h1>   -</h1>
     <CustomConnectButton/>
     </div>
     <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Namespace Offchain Rainbow Kit Demo</h1>
      <p className="text-lg">This is a demo of the Namespace Offchain Rainbow Kit</p>
     </div>
    </div>
  );
}
