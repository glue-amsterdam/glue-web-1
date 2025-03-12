"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ParticipantError() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Error Loading Participant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {`There was a problem loading this participant's information.`}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/participants">Return to Participants</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
