import { CardContent } from "@/components/ui/card";
import { CombinedUserInfo } from "@/types/combined-user-info";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DOMPurify from "dompurify";
import { Clock, Globe, Phone, CreditCard, User } from "lucide-react";
import { useEventsDays } from "@/app/context/MainContext";

type Props = {
  selectedUser: CombinedUserInfo;
};

function UserFullViewContent({ selectedUser }: Props) {
  const eventDays = useEventsDays();

  const getDayLabel = (dayId: string) => {
    const day = eventDays.find((day) => day.dayId === dayId);
    return day ? day.label : dayId;
  };

  return (
    <CardContent className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <section>
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
            <User className="w-5 h-5 mr-2" />
            User Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium mr-2">User ID:</span>
              <span className="text-sm sm:text-base">
                {selectedUser.user_id}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium mr-2">Plan Type:</span>
              <Badge variant="outline">{selectedUser.plan_type}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium mr-2">Is Moderator:</span>
              <Badge variant={selectedUser.is_mod ? "default" : "secondary"}>
                {selectedUser.is_mod ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </section>

        <Separator />

        {selectedUser.participantDetails && (
          <section>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Participant Details
            </h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div>
                <p className="font-medium">Short Description</p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {selectedUser.participantDetails.short_description}
                </p>
              </div>
              <div>
                <p className="font-medium">Description</p>
                <p
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedUser.participantDetails.description || ""
                    ),
                  }}
                  className="text-sm sm:text-base text-muted-foreground font-overpass"
                />
              </div>
              <div>
                <p className="font-medium">Slug</p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {selectedUser.participantDetails.slug}
                </p>
              </div>
              <div>
                <p className="font-medium">Is Sticky</p>
                <Badge
                  variant={
                    selectedUser.participantDetails.is_sticky
                      ? "default"
                      : "secondary"
                  }
                >
                  {selectedUser.participantDetails.is_sticky ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="font-medium">Year</p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {selectedUser.participantDetails.year || "N/A"}
                </p>
              </div>
              <div>
                <p className="font-medium">Status</p>
                <Badge>{selectedUser.participantDetails.status}</Badge>
              </div>
            </div>
          </section>
        )}

        {selectedUser.invoiceData && (
          <>
            <Separator />
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Invoice Information
              </h3>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div>
                  <p className="font-medium">Company Name</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {selectedUser.invoiceData.invoice_company_name}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {selectedUser.invoiceData.invoice_address}
                  </p>
                </div>
                <div>
                  <p className="font-medium">City</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {selectedUser.invoiceData.invoice_city}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Zip Code</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {selectedUser.invoiceData.invoice_zip_code}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Country</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {selectedUser.invoiceData.invoice_country}
                  </p>
                </div>
                {selectedUser.invoiceData.invoice_extra && (
                  <div>
                    <p className="font-medium">Additional Info</p>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {selectedUser.invoiceData.invoice_extra}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
        {selectedUser.visitingHours &&
          Array.isArray(selectedUser.visitingHours) &&
          selectedUser.visitingHours.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Visiting Hours
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedUser.visitingHours.map((visitingHour, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      <p className="font-medium mb-2">
                        {getDayLabel(visitingHour.day_id)}
                      </p>
                      {Array.isArray(visitingHour.hours) &&
                      visitingHour.hours.length > 0 ? (
                        visitingHour.hours.map(
                          (
                            time: { open: string; close: string },
                            timeIndex: number
                          ) => (
                            <p key={timeIndex} className="text-sm sm:text-base">
                              {time.open} - {time.close}
                            </p>
                          )
                        )
                      ) : (
                        <p className="text-sm sm:text-base">
                          No hours set for this day
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

        {selectedUser.phone_numbers &&
          selectedUser.phone_numbers.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Phone Numbers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.phone_numbers.map((phone, index) => (
                    <Badge key={index} variant="outline">
                      {phone}
                    </Badge>
                  ))}
                </div>
              </section>
            </>
          )}

        {selectedUser.social_media &&
          Object.keys(selectedUser.social_media).length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Social Media
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(selectedUser.social_media).map(
                    ([platform, link]) => (
                      <div
                        key={platform}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <span className="font-medium mr-2 capitalize">
                          {platform}:
                        </span>
                        <a
                          href={link as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm sm:text-base text-blue-500 hover:underline"
                        >
                          {link as string}
                        </a>
                      </div>
                    )
                  )}
                </div>
              </section>
            </>
          )}

        {selectedUser.visible_websites &&
          selectedUser.visible_websites.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Websites
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedUser.visible_websites.map((website, index) => (
                    <a
                      key={index}
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base text-blue-500 hover:underline"
                    >
                      {website}
                    </a>
                  ))}
                </div>
              </section>
            </>
          )}
      </div>
    </CardContent>
  );
}

export default UserFullViewContent;
