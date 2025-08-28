import { CreateCentralBankUserDal, GetCentralBankUserDal } from "../dal/centralbank.dal";
import { validateSchema } from "../middleware/validate";

export const seedAdminService = async (adminDetails: any) => {
  console.log("=== adminDetails ===", adminDetails);
  validateSchema({ body: adminDetails });
  const query = {
    realm: "central",
    role: adminDetails.role,
  };
  const response = await GetCentralBankUserDal(query, true);
  console.log("=== response ===",  response);
  if (response !== null) {
    console.log({ success: false, message: "user already exists" }, 400);
    return { success: false, resp: null };
  } else {
    const createUser = await CreateCentralBankUserDal(adminDetails);
    console.log("=== createUser ===", createUser);
    return { success: true, resp: createUser };
  }
};
