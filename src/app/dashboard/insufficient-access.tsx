"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, HomeIcon as House, Map, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InsufficientAccess({
  userName,
}: {
  userName: string;
  userId?: string;
  notes?: string;
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
          <motion.article
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>{`Sorry, you don't have sufficient privileges to access profile modification.`}</p>
            <p>{`Apply as a participant to unlock your dashboard, or explore the map as a visitor.`}</p>
          </motion.article>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="w-full">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.push("/map")}
                className="flex items-center gap-2 w-full mb-2 bg-green-500 hover:bg-green-500/80"
              >
                <Map className="mr-2" />
                <span className="flex-grow text-center">Go to Map</span>
              </Button>
            </motion.div>
            <motion.div
              className="mb-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild className="flex items-center gap-2 w-full">
                <Link href="/participate#plans-selection-section">
                  <UserPlus className="mr-2" />
                  <span className="flex-grow text-center">
                    I want to become a participant
                  </span>
                </Link>
              </Button>
            </motion.div>
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
