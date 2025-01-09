// import  { useState, useEffect } from 'react'
// import { Bell } from 'lucide-react'
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"

// const mockNotifications = [
//   { id: 1, message: "New property listed: Beachfront Villa", timestamp: "2 minutes ago" },
//   { id: 2, message: "Rental income received: $500", timestamp: "1 hour ago" },
//   { id: 3, message: "Token price update: Mountain Cabin +5%", timestamp: "3 hours ago" },
// ]

// function Notifications() {
//   const [notifications, setNotifications] = useState([])
//   const [isOpen, setIsOpen] = useState(false)

//   useEffect(() => {
//     // In a real application, you would set up WebSocket or SSE here
//     setNotifications(mockNotifications)
//   }, [])

//   return (
//     <div className="relative">
//       <Button
//         variant="ghost"
//         size="icon"
//         className="fixed top-4 right-4 z-50"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <Bell className="h-6 w-6" />
//         {notifications.length > 0 && (
//           <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full" />
//         )}
//       </Button>
//       {isOpen && (
//         <Card className="fixed top-16 right-4 w-80 z-50">
//           <CardHeader>
//             <CardTitle>Notifications</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {notifications.map((notification) => (
//               <div key={notification.id} className="mb-4 last:mb-0">
//                 <p>{notification.message}</p>
//                 <p className="text-sm text-gray-500">{notification.timestamp}</p>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }

// export default Notifications

