import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { NAVBAR_HEIGHT } from "@/constants";
import { Clock } from "lucide-react";

export default function PendingParticipant() {
  return (
    <div
      style={{
        paddingTop: `${NAVBAR_HEIGHT}rem`,
      }}
    >
      <Card
        style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
        className="max-w-md mx-auto mt-8"
      >
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Pending Approval
          </CardTitle>
          <CardDescription className="text-center">
            <Clock className="w-16 h-16 mx-auto text-yellow-500 my-4" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            This page is not yet accessible. A moderator will confirm your
            participation soon. Thank you for your patience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
