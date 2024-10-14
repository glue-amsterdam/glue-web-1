import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { Participant } from "@/utils/about-types";

export default function MemberInfo({ member }: { member: Participant }) {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{member.name}</h1>
      <p className="whitespace-pre-wrap">{member.description}</p>
      <div>
        <h2 className="text-xl font-semibold mb-2">Address</h2>
        <p className="whitespace-pre-wrap">{member.address}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Visiting Hours</h2>
        {Object.entries(member.visitingHours).map(([day, hours]) => (
          <p key={day}>
            {day}: {hours}
          </p>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Phone className="w-5 h-5 mr-2" />
          <a href={`tel:${member.phoneNumber}`} className="hover:underline">
            {member.phoneNumber}
          </a>
        </div>
        <div className="flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          <a href={`mailto:${member.email}`} className="hover:underline">
            {member.email}
          </a>
        </div>
        <div className="flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          <a
            href={member.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {member.website}
          </a>
        </div>
      </div>
      <div className="flex space-x-4">
        {member.socialMedia.instagram && (
          <a
            href={member.socialMedia.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram className="w-6 h-6" />
          </a>
        )}
        {member.socialMedia.facebook && (
          <a
            href={member.socialMedia.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="w-6 h-6" />
          </a>
        )}
        {member.socialMedia.linkedin && (
          <a
            href={member.socialMedia.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="w-6 h-6" />
          </a>
        )}
      </div>
    </div>
  );
}
