import { Permission } from "../model/permission.model";
// import fs from "fs";
// import path from "path";

export const getPermissions = async (
  realm: string,
  // department: string,
  role: string
): Promise<string[]> => {
  try {
    const query = { realm, _id: role };
    console.log("rrrrrr", query);
    const permissionDoc = await Permission.findOne(query);

    return permissionDoc ? permissionDoc.permissions : [];
  } catch (error) {
    console.error("Error in getPermissions:", error.message);
    return [];
  }
};

// const loadPredefinedPermissions = async (): Promise<any[]> => {
//   const filePath = path.resolve(
//     __dirname,
//     "../config/",
//     "predefinedPermissions.json"
//   );
//   const data = await fs.promises.readFile(filePath, "utf-8");
//   return JSON.parse(data);
// };

// export const populatePermissions = async (): Promise<void> => {
//   try {
//     const predefinedPermissions = await loadPredefinedPermissions();
//     console.log("--- predefinedPermissions --", predefinedPermissions);
//     for (const predefinedRealm of predefinedPermissions) {
//       if (
//         !predefinedRealm.permissions ||
//         predefinedRealm.permissions.length === 0
//       ) {
//         throw new Error(
//           `Invalid predefined permissions: role '${predefinedRealm.role}' in realm '${predefinedRealm.realm}' has no permissions.`
//         );
//       }

//       // Check if the role already exists
//       const existingRole = await Permission.findOne({
//         realm: predefinedRealm.realm,
//         department: predefinedRealm.department,
//         role: predefinedRealm.role,
//       });

//       if (!existingRole) {
//         // If it doesn't exist, create a new document
//         const newRole = new Permission({
//           realm: predefinedRealm.realm,
//           department: predefinedRealm.department,
//           role: predefinedRealm.role,
//           permissions: predefinedRealm.permissions,
//         });

//         await newRole.save();
//         console.log(
//           `Added missing role: ${predefinedRealm.role} in realm ${predefinedRealm.realm}`
//         );
//       } else {
//         // If it exists, update the permissions if needed
//         const newPermissionsSet: any = new Set(predefinedRealm.permissions);
//         const existingPermissionsSet = new Set(existingRole.permissions);

//         if (
//           predefinedRealm.permissions.length !==
//             existingRole.permissions.length ||
//           predefinedRealm.permissions.some(
//             (perm: any) => !existingPermissionsSet.has(perm)
//           )
//         ) {
//           existingRole.permissions = [...newPermissionsSet];
//           await existingRole.save();
//           console.log(
//             `Updated permissions for role: ${predefinedRealm.role} in realm ${predefinedRealm.realm}`
//           );
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error updating permissions:", error);
//   }
// };
