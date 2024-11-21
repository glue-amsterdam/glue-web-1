import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { isParticipantUser } from "@/constants";
import { UserWithPlanDetails } from "@/schemas/usersSchemas";
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
            {selectedUser.socialMedia?.instagramLink && (
              <a href={selectedUser.socialMedia.instagramLink} target="_blank">
                <Badge variant="secondary">
                  <Instagram className="mr-1" size={14} />
                  {selectedUser.socialMedia.instagramLink}
                </Badge>
              </a>
            )}
            {selectedUser.socialMedia?.facebookLink && (
              <a href={selectedUser.socialMedia.facebookLink} target="_blank">
                <Badge variant="secondary">
                  <Facebook className="mr-1" size={14} />
                  {selectedUser.socialMedia.facebookLink}
                </Badge>
              </a>
            )}
            {selectedUser.socialMedia?.linkedinLink && (
              <a href={selectedUser.socialMedia.linkedinLink} target="_blank">
                <Badge variant="secondary">
                  <Linkedin className="mr-1" size={14} />
                  {selectedUser.socialMedia.linkedinLink}
                </Badge>
              </a>
            )}
          </div>
        </div>
      )}
    </TabsContent>
  );
}

export default ContactView;
