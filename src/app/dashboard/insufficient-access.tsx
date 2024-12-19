"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, House, Map, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function InsufficientAccess({
  userName,
  userId,
}: {
  userName: string;
  userId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const onContinueAction = () => {
    /* API to send the Email */
    console.log("Sending Email from:", userName, userId);

    setTimeout(
      () =>
        toast({
          title: "Thank you for your interest!",
          description: "We'll be in touch by email or phone soon.",
        }),
      1000
    );
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            <p>Hello! {userName}</p>
            <p>Insufficient Access</p>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          </motion.div>
          <motion.article
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>{`Sorry, you don't have sufficient privileges to access profile modification.`}</p>
            <p>
              {`Visitors and base members can only access the Map to see the routes`}
            </p>
          </motion.article>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/map")}
                className="flex items-center gap-2 w-full mb-2 bg-green-500 hover:bg-green-500/80"
              >
                <Map className="mr-2" />
                <span className="flex-grow text-center">Go to Map</span>
              </Button>
            </motion.div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <motion.div
                  className="mb-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="flex items-center gap-2">
                    <UserPlus className="mr-2" />
                    <span className="flex-grow text-center">
                      I want to become a participant
                    </span>
                  </Button>
                </motion.div>
              </AlertDialogTrigger>
              <AlertDialogContent className="text-black">
                <AlertDialogHeader>
                  <AlertDialogTitle>{`Become a participant ${userName}`}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {`Want to Become a Participant? Click on "Continue" and a GLUE team member will get in touch with you.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onContinueAction}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 w-full"
              >
                <House className="mr-2" />
                <span className="flex-grow text-center">Back home</span>
              </Button>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
