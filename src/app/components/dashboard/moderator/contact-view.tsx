import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { isParticipantUser } from "@/constants";
import { UserWithPlanDetails } from "@/utils/user-types";
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";
import React from "react";

type Props = {
  selectedUser: UserWithPlanDetails;
};

function ContactView({ selectedUser }: Props) {
  return (
    <TabsContent value="contact">
      {isParticipantUser(selectedUser) && (
        <div className="space-y-2">
          {selectedUser.phoneNumber?.map((phone, index) => (
            <div key={index} className="flex items-center">
              <Phone className="mr-2" size={16} />
              <span className="text-sm">{phone}</span>
            </div>
          ))}
          {selectedUser.visibleEmail?.map((email, index) => (
            <div key={index} className="flex items-center">
              <Mail className="mr-2" size={16} />
              <span className="text-sm">{email}</span>
            </div>
          ))}
          {selectedUser.visibleWebsite?.map((website, index) => (
            <div key={index} className="flex items-center">
              <Globe className="mr-2" size={16} />
              <span className="text-sm">{website}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedUser.socialMedia?.instagram?.map((instagram, index) => (
              <Badge key={index} variant="secondary">
                <Instagram className="mr-1" size={14} />
                {instagram}
              </Badge>
            ))}
            {selectedUser.socialMedia?.facebook?.map((facebook, index) => (
              <Badge key={index} variant="secondary">
                <Facebook className="mr-1" size={14} />
                {facebook}
              </Badge>
            ))}
            {selectedUser.socialMedia?.linkedin?.map((linkedin, index) => (
              <Badge key={index} variant="secondary">
                <Linkedin className="mr-1" size={14} />
                {linkedin}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </TabsContent>
  );
}

export default ContactView;
