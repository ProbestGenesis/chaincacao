import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { clsx } from 'clsx';
import { GalleryVerticalEnd, Icon, Package, Truck } from 'lucide-react';
import * as React from 'react';


export function HomeCountCard () {


    const progression = 50
    const count = 48
 
    const SecondaryCard = (item: any) => {
        return (
            <Card className={clsx("w-xs gap-1", {
                "bg-primary dark:text-black text-gray-100" : item.type === "main",
            })}>
                <CardHeader>
                    <item.icon />
                    
                    <CardTitle>{item.title}</CardTitle>
                </CardHeader>

                <CardContent>
                <p className="leading-loose tracking-wider fl-text-sm/lg"> <strong  className="fl-text-2xl/6xl font-bold ">{count } </strong > Tonnes </p>
                 </CardContent>

                <CardFooter className="flex justify-between items-center gap-1.5"> 
                    <Badge variant={item.type === "main" ? "secondary" : "default"} >
                            <strong className={clsx({
                                "text-destructive": item.progression < 0,
                                "text-green-500" : item.progression > 0
                            })}> {item.progression}% </strong> de progession
                        </Badge>

                    <p className="text-muted text-[8px]"> Dernière mise à jour : {item.lastUpdate} </p>
                </CardFooter>
            </Card>
        )
    }

    const summary = [
        {
            type: "main",
            title: "Total des receptionée",
            icon: GalleryVerticalEnd ,
            count: 48,
            progression: 50,
            lastUpdate: "il y a 2 heures"
        },
        {
            type: "secondary",
            title: "Lot agregés",
            icon: Package,
            count: 12,
            progression: 20,
            lastUpdate: "il y a 2 heures"
        },
    {
        type: "secondary",
        title: "Lot en transit",
        icon: Truck,
        count: 12,
        progression: -20,
        lastUpdate: "il y a 2 heures"
    }

]
  return (
   <ScrollArea>
    <div className="flex items-start space-x-4.5 py-1.5 w-full">
            <div className="flex gap-4">
                {summary.map((item, index) => (
                    <SecondaryCard key={index} {...item} />
                ))}
            </div>
        </div>
        
     <ScrollBar orientation="horizontal" className="py-2" />
   </ScrollArea>
  );
}
