import { getPermissions } from "../dal/permissions.dal";
import { setPermissionData } from "../dal/redis.dal";
import AppError from "../util/appError";
import { createToken } from "../util/authToken.utils";
import { encryptData } from "../util/encryptData.util";
import { hashData } from "../util/hashData.utils";
import { generateUUIDRandomNumber } from "../util/randNum.utils";

export const getPermissionsService = async (user: any): Promise<any> => {
  try {
    const permissions = await getPermissions(user.realm, user.role);
    console.log("=== permissions ===", permissions);
    if (!permissions) {
      const devError = {
        status: 400,
        response: "Something went wrong. Try again later. - service",
        error: permissions,
      };
      throw new AppError(
        { message: "Something went wrong. Try again later." },
        400,
        devError
      );
    } else {
      const FieldsRaw = {
        id: user._id,
        usercode: user.userCode,
        fullname: user.fullName,
        phonenumber: user.phoneNumber,
      };

      // Remove only null and undefined values
      const Fields = Object.fromEntries(
        Object.entries(FieldsRaw).filter(
          ([, value]) => value !== null && value !== undefined
        )
      );
      const selectedFieldsRaw = {
        id: user._id,
        usercode: user.userCode,
        fullname: user.fullName,
        phonenumber: user.phoneNumber,
        accountlevel: user.accountLevel ?? null,
        schoolname: user.schoolName ?? null,
        schoolcode: user.schoolCode ?? null,
        branchname: user.branchname ?? null,
        branchcode: user.branchcode ?? null,
        r001: user.realm, // realm
        r002: user.role, // role
        r003: permissions, // permissions
      };
      const selectedFields = Object.fromEntries(
        Object.entries(selectedFieldsRaw).filter(
          ([, value]) => value !== null && value !== undefined
        )
      );

      console.log("selectedFields", selectedFields);

      const encrypted = await encryptData(selectedFields);
      const hash = await hashData(selectedFields);
      const data = {
        ...Fields,
        enc: encrypted,
        dtx: hash,
      };
      console.log("--- data to create token ---", data);
      const token = await createToken(data);
      console.log("--- token ---", token);

      return token;
    }
  } catch (error) {
    console.log("error in build response token catch --", error.message);
    const devError = {
      status: 500,
      response: "Something went wrong. Try again later. - service",
      error: error,
    };
    throw new AppError(
      { message: "Something went wrong. Try again later." },
      500,
      devError
    );
  }
};
