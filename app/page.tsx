import { Button } from "@/components/ui/button"
import { HomeCountCard } from "@/components/utils/cooperative/home/countCard";
import { ChartBarLabel } from "@/components/utils/cooperative/home/chart";
import { Suspense } from "react";
import LastReception from "@/components/utils/cooperative/home/lastReception";

export default function Page() {
  return (
    <div className="flex flex-col space-y-12 min-h-svh p-6">
      <HomeCountCard />

      <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-6">
        <div className="col-span-2">
         <Suspense fallback={<div>Loading...</div>}> 
          <ChartBarLabel />
         </Suspense>
         </div>

         <div> 
          <Suspense fallback={<div>Loading...</div>}> 
            <LastReception />
          </Suspense>
         </div>
      </div>
    </div>
  )
}
