"use client";

import React, { Suspense } from "react";
import MemberDataForm from "./member-data-form";
import { useSearchParams } from "next/navigation";
import CenteredLoader from "../centered-loader";
import { motion } from "framer-motion";

function MemberAdminSection() {
  const sectionParams = useSearchParams();
  const section = sectionParams.get("section");
  console.log(section);
  const firstPage = section === "member-data" || !section;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      {firstPage && (
        <Suspense fallback={<CenteredLoader />}>
          <MemberDataForm />
        </Suspense>
      )}
    </motion.div>
  );
}

export default MemberAdminSection;
