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
          {selectedUser.phone_number?.map((phone, index) => (
            <div key={index} className="flex items-center">
              <Phone className="mr-2" size={16} />
              <span className="text-sm">{phone}</span>
            </div>
          ))}
          {selectedUser.visible_email?.map((email, index) => (
            <div key={index} className="flex items-center">
              <Mail className="mr-2" size={16} />
              <span className="text-sm">{email}</span>
            </div>
          ))}
          {selectedUser.visible_website?.map((website, index) => (
            <div key={index} className="flex items-center">
              <Globe className="mr-2" size={16} />
              <span className="text-sm">{website}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedUser.social_media?.instagramLink && (
              <a href={selectedUser.social_media.instagramLink} target="_blank">
                <Badge variant="secondary">
                  <Instagram className="mr-1" size={14} />
                  {selectedUser.social_media.instagramLink}
                </Badge>
              </a>
            )}
            {selectedUser.social_media?.facebookLink && (
              <a href={selectedUser.social_media.facebookLink} target="_blank">
                <Badge variant="secondary">
                  <Facebook className="mr-1" size={14} />
                  {selectedUser.social_media.facebookLink}
                </Badge>
              </a>
            )}
            {selectedUser.social_media?.linkedinLink && (
              <a href={selectedUser.social_media.linkedinLink} target="_blank">
                <Badge variant="secondary">
                  <Linkedin className="mr-1" size={14} />
                  {selectedUser.social_media.linkedinLink}
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
