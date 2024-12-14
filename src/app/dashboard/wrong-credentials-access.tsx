"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, House } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export default function WrongCredentials({
  userName,
}: {
  userName: string;
  userId: string;
}) {
  const router = useRouter();

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
          <motion.p
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {`Sorry, you don't have sufficient privileges to access this profile modification.`}
          </motion.p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div>
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
