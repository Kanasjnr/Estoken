import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { NotificationsDropdown } from "./NotificationsDropdown"
// import useNotifications from "../../hooks/useNotifications"

export function Header() {
  // const { notifications } = useNotifications()

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center">{/* Your logo or other header content */}</div>
      <div className="flex items-center space-x-4">
        {/* <NotificationsDropdown notifications={notifications} /> */}
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
        <appkit-account-button />
      </div>
    </header>
  )
}

