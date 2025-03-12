import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParticipantNotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Participant Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {`The participant you're looking for doesn't exist or may have been removed.`}
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/participants">Return to Participants</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
