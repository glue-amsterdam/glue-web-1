import { Checkbox } from "@/components/ui/checkbox";
import { UserInfo } from "@/schemas/userInfoSchemas";

interface UserCardProps {
  selectedUsers: Set<string>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  user: UserInfo;
  onSelectUser: (userId: string) => void;
}

export default function UserCard({
  selectedUsers,
  setSelectedUsers,
  user,
  onSelectUser,
}: UserCardProps) {
  const handleCheckboxChange = (checked: boolean) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(user.user_id);
      } else {
        newSet.delete(user.user_id);
      }
      return newSet;
    });
  };

  return (
    <div
      className="flex items-center space-x-4 p-2 hover:bg-white/90 bg-white cursor-pointer last:rounded-b-lg"
      onClick={() => onSelectUser(user.user_id)}
    >
      <Checkbox
        checked={selectedUsers.has(user.user_id)}
        onCheckedChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
      />
      <div>
        <p className="text-black font-medium">
          {user.user_name || "Unnamed User"}
        </p>
        <p className=" text-black text-xs">
          v.email: {user.visible_emails?.[0] || "not setted"}
        </p>
      </div>
    </div>
  );
}
