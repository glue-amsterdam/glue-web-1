"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UserInfoProps {
  attemptedNextStep: boolean;
}

export default function UserInfo({ attemptedNextStep }: UserInfoProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">User Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-white">
            Email{`(*)`}
          </Label>
          <Input
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address",
              },
            })}
            placeholder="email@example.com"
            className="dashboard-input placeholder:text-sm"
          />
          {attemptedNextStep && errors.email && (
            <p className="text-red-500 text-sm">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="companyName" className="text-white">
            Company/Person Name{`(*)`}
          </Label>
          <Input
            id="companyName"
            placeholder="Company/Person Name"
            {...register("companyName", {
              required: "Company/Person Name is required",
            })}
            className="dashboard-input placeholder:text-sm"
          />
          {attemptedNextStep && errors.companyName && (
            <p className="text-red-500 text-sm">
              {errors.companyName.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="shortDescription" className="text-white">
            Short Description{`(*)`}
          </Label>
          <Textarea
            id="shortDescription"
            {...register("shortDescription", {
              required: "Short description is required",
              maxLength: {
                value: 500,
                message: "Short description must be 500 characters or less",
              },
            })}
            className="dashboard-input placeholder:text-sm h-24"
            placeholder="Briefly describe your company or yourself"
          />
          {attemptedNextStep && errors.shortDescription && (
            <p className="text-red-500 text-sm">
              {errors.shortDescription.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="website" className="text-white">
            Website
          </Label>
          <Input
            id="website"
            {...register("website", {
              pattern: {
                value:
                  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                message: "Invalid website URL",
              },
            })}
            className="dashboard-input placeholder:text-sm"
            placeholder="https://example.com"
          />
          {attemptedNextStep && errors.website && (
            <p className="text-red-500 text-sm">
              {errors.website.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="instagram" className="text-white">
            Instagram Page
          </Label>
          <Input
            id="instagram"
            {...register("instagram")}
            placeholder="https://instagram.com/yourusername"
            className="dashboard-input placeholder:text-sm"
          />
        </div>
        <div>
          <Label htmlFor="facebook" className="text-white">
            Facebook Page
          </Label>
          <Input
            id="facebook"
            {...register("facebook")}
            placeholder="https://facebook.com/yourusername"
            className="dashboard-input placeholder:text-sm"
          />
        </div>
        <div>
          <Label htmlFor="linkedin" className="text-white">
            LinkedIn Page
          </Label>
          <Input
            placeholder="https://linkedin.com/in/yourusername"
            id="linkedin"
            {...register("linkedin")}
            className="dashboard-input placeholder:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
