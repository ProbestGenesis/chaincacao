import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { clsx } from "clsx";

export default function LastReception() {
  const statusText = (itemStatus: string) => {
    switch (itemStatus) {
      case "isPending":
        return "En contrôle";
      case "confirmed":
        return "Confirmé";
      default:
        return "Confirmé";
    }
  };

  const ItemCard = (item: any) => {
    return (
      <Card className="p-2 flex flex-row justify-between">
        <CardHeader className="flex-1">
          <Avatar>
            <AvatarImage src={item.user.image} alt={`${item.user.username} profil picture`} />
            <AvatarFallback>{item.user.username.slice(0, 2)}</AvatarFallback>
          </Avatar>

          <CardDescription className="text-nowrap">{item.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col p-0 space-y-2">
          <p>
            <strong className="text-lg font-extrabold">{item.quantity}</strong>
          </p>

          <Badge
            className={clsx({
              "bg-green-500": item.status === "confirmed",
              "bg-amber-500": item.status === "isPending",
            })}
          >
            {statusText(item.status)}
          </Badge>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col space-y-2.5">
      <span className="flex items-center justify-between">
        <h3 className="text-lg xl:tracking-tight">Dernière réception</h3>
        <Button variant="link">Voir tout</Button>
      </span>

      
        <ScrollArea className="h-87.5">
          <div className="flex flex-col space-y-2 p-2 h-full">
            {lastReceptionData.map((item, index) => (
              <ItemCard key={index} {...item} />
            ))}
          </div>
        </ScrollArea>
      
    </div>
  );
}

export const lastReceptionData = [
  {
    user: { username: "Alice", image: "/alice.png" },
    description: "Réception de cacao",
    quantity: 120,
    status: "confirmed",
  },
  {
    user: { username: "Bob", image: "/bob.png" },
    description: "Contrôle qualité",
    quantity: 80,
    status: "isPending",
  },
  {
    user: { username: "Charlie", image: "/charlie.png" },
    description: "Stockage entrepôt",
    quantity: 200,
    status: "confirmed",
  },
  {
    user: { username: "Diane", image: "/diane.png" },
    description: "Réception sucre brut",
    quantity: 150,
    status: "isPending",
  },
  {
    user: { username: "Eric", image: "/eric.png" },
    description: "Lot de fèves torréfiées",
    quantity: 95,
    status: "confirmed",
  },
  {
    user: { username: "Fatou", image: "/fatou.png" },
    description: "Réception emballages",
    quantity: 300,
    status: "isPending",
  },
  {
    user: { username: "Georges", image: "/georges.png" },
    description: "Livraison cacao premium",
    quantity: 60,
    status: "confirmed",
  },
  {
    user: { username: "Hélène", image: "/helene.png" },
    description: "Contrôle humidité",
    quantity: 40,
    status: "isPending",
  },
  {
    user: { username: "Idriss", image: "/idriss.png" },
    description: "Réception cartons",
    quantity: 500,
    status: "confirmed",
  },
  {
    user: { username: "Julie", image: "/julie.png" },
    description: "Réception sucre raffiné",
    quantity: 220,
    status: "isPending",
  },
];
