import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { NAVBAR_HEIGHT } from "@/constants";
import { XCircle } from "lucide-react";

export default function DeclinedParticipant() {
  return (
    <div
      style={{
        paddingTop: `${NAVBAR_HEIGHT}rem`,
      }}
    >
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Participation Declined
          </CardTitle>
          <CardDescription className="text-center">
            <XCircle className="w-16 h-16 mx-auto text-red-500 my-4" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            {`We're sorry, but your participation request has been declined. If you believe this is an error, please contact the event organizers.`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
