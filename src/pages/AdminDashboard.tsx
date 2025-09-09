// // AdminDashboard.jsx
// import { useEffect, useState } from "react";
// import { supabase } from "../client";
// import type { UserProfile } from "../../lib/types";


// export default function AdminDashboard() {
//   const [users, setUsers] = useState<UserProfile[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const {
//         data: currentUser,
//         error: userError
//       } = await supabase.auth.getUser();

//       if (userError) return console.error(userError);

//       // Check if current user is admin
//       const { data: profile, error: profileError } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", currentUser.user.id)
//         .single();

//         // Handle errors or missing profile
// if (profileError || !profile) {
//   alert("Unable to verify admin status.");
//   return;
// }

//       if (profile.role !== "admin") {
//         alert("Access denied: Admins only");
//         return;
//       }

//       // Fetch all users
//       const { data: allUsers, error: allUsersError } = await supabase
//         .from("profiles")
//         .select("id, email, full_name, role, created_at");

//       if (allUsersError) console.error(allUsersError);
//       else setUsers(allUsers);

//       setLoading(false);
//     };

//     fetchUsers();
//   }, []);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div>
//       <h1>Admin Dashboard</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Email</th>
//             <th>Full Name</th>
//             <th>Role</th>
//             <th>Registered At</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(user => (
//             <tr key={user.id}>
//               <td>{user.email}</td>
//               <td>{user.full_name}</td>
//               <td>{user.role}</td>
//               <td>{new Date(user.created_at).toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
