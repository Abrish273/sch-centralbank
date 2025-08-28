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
      const selectedFields = {
        id: user._id,
        fullname: user.fullName,
        schoolcode: user.schoolCode,
        schoolname: user.schoolName,
        usercode: user.userCode,
        realm: user.realm,
        role: user.role,
        poolsource: user.poolSource,
        phonenumber: user.contactDetails.phoneNumber,
        r001: user.realm, // realm
        r002: user.role, // role
        r003: permissions, // permissions
      };

      const encryptedD = encryptData(selectedFields);
      const hash = hashData(selectedFields);
      const redKey = generateUUIDRandomNumber();
      const data = {
        encryptedD,
        dtx: hash,
        redKey,
      };
      const token = await createToken(data);
      console.log("--- token ---", token);
      const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      const respondData = {
        token: token,
        tokenExpiration: expirationTime,
        extensionCount: 0,
      };

      console.log("--- response ---", respondData);
      const d: any = await setPermissionData(redKey, respondData);
      console.log("--- d ---", d);

      if (d.success) {
        const dx = {
          message: "2FA successfully login.",
          token: respondData.token,
          key: redKey,
        };
        return dx;
      } else {
        const devError = {
          status: 500,
          response: "Something went wrong. Try again later. - service",
          error: d,
        };

        throw new AppError(
          { message: "Something went wrong. Try again later." },
          500,
          devError
        );
      }
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
