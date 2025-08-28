import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
// import {
//   compareHash,
//   createTempToken,
//   formatPhoneNumber,
//   verifyPin,
// } from "../util/auth.utils";
// import moment from "moment-timezone";
// import { deleteData, getData, setData } from "../dal/redis.dal";
// import { AppError } from "../middlewares/errorHandler";
// import {
//   GetCentralBankUserDal,
//   updateCentralBankUserDal,
// } from "../dal/centralbank.dal";
// import {
//   GetBranchBankUserDal,
//   updateBranchBankUserDal,
// } from "../dal/branchbank.dal ";
import { LogConsole } from "../util/log.utils";
import { formatPhoneNumber } from "../util/randNum.utils";
import { GetCentralBankUserDal } from "../dal/centralbank.dal";
import AppError from "../util/appError";
import { compareHashPassword } from "../util/hashpassword.utils";

export const initializePassport = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "phonenumber",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, phonenumber: string, password: string, done) => {
        LogConsole("=== AUTHENTICATING USER ===");
        try {
          let query: any = {
            realm: "central",
            isDeleted: false,
            phoneNumber: formatPhoneNumber(phonenumber),
          };

          LogConsole("=== query ===", query);
          const user = await findUser(query);
          // const user: any = await GetCentralBankUserDal(query, true);
          LogConsole("sealiii - - - ", password);
          const verifiedPassword: boolean = await compareHashPassword(
            password,
            user.login.loginPassword
          );
        //   const value = req.body;
          LogConsole("=== verified ===", verifiedPassword);

          // if (verifiedPassword) {
          //   const data = {
          //     success: true,
          //     message: "Login successful",
          //     loginAttemptCount: 0, // Reset count on success
          //     lastLoginAttempt: moment.tz("Africa/Addis_Ababa"),
          //   };

          //   checkUserDisbaledOrNot(user, done);
          //   checkUsersFirstTimeOrNot(user, done);
          //   updateDB(data, user);

          //   // Save the user to Redis with a TTL (time to live)
          //   const redisResponse = await setData(user);

          //   if (!redisResponse.success) {
          //     LogConsole("Error saving to Redis: ", redisResponse.message);
          //   }

          //   return done(null, user);
          // } else {
          //   LogConsole("=== here in the failed login attempt ===...");
          //   const resp = await checkLoginAttempt(user, done);
          //   LogConsole("=== resp ===", resp);
          //   const update = await updateDB(resp, user);
          //   LogConsole("=== update ===", update);
          //   return done(null, false, { message: String(update) });
          // }
        } catch (error) {
          console.error("Error in authentication passport config:", error);
          return done(error);
        }
      }
    )
  );

  // passport.serializeUser(async (user: any, done: any) => {
  //   LogConsole("=== SERIALIZE USER ===", user.id);

  //   // Store user data in Redis during serialization using setData
  //   const redisResponse = await setData(user);

  //   if (redisResponse.success) {
  //     done(null, user.id);
  //   } else {
  //     done(new Error("Error saving user data to Redis during serialization"));
  //   }
  // });

  // passport.deserializeUser(async (id: string, done: any) => {
  //   LogConsole("=== DESERIALIZE USER ===", id);

  //   try {
  //     // Try to get user data from Redis using getData
  //     const redisResponse = await getData(id);

  //     if (redisResponse.success) {
  //       const user = redisResponse.data;
  //       LogConsole("=== User found in Redis ===", user);

  //       // Remove the user data from Redis after it has been deserialized using deleteData
  //       // await deleteData(id);

  //       return done(null, user);
  //     } else {
  //       // If user not found in Redis, fetch from the database
  //       const query = { _id: id };
  //       const user = await GetCentralBankUserDal(query);

  //       if (user) {
  //         // Optionally, save the user back to Redis after deserialization
  //         await setData(user);
  //       }

  //       done(null, user);
  //     }
  //   } catch (error) {
  //     console.error("Error deserializing user:", error);
  //     done(error, null);
  //   }
  // });
};

const findUser = async (query: any) => {
  const user: any = await GetCentralBankUserDal(query, true);
  if(user !== null) {
    return user;
  } else {
    throw new AppError({message: "User not found"}, 400, { query });
  }
}

// export const comparePasswords = async (
//   password: string,
//   hashedPassword: string
// ): Promise<boolean> => {
//   const verifiedPassword = await verifyPin(password, hashedPassword);
//   LogConsole("=== verified password ===", verifiedPassword);
//   if (verifiedPassword) {
//     return true;
//   } else {
//     return false;
//   }
// };

// export const checkUserDisbaledOrNot = async (
//   user: any,
//   done: (err: any, user?: any) => void
// ): Promise<void> => {
//   if (user.enabled && !user.login.isLoginDisabled) {
//     // User is fine
//     return done(null, user);
//   }

//   // User is disabled
//   let message = "";
//   let devError: any = {};

//   if (user.login.isLoginDisabled) {
//     message = "User is disabled, try after 24 hours.";
//     devError = {
//       status: 400,
//       response: message,
//       error: `user disabled = ${user.login.isLoginDisabled} -- passport`,
//     };
//   } else {
//     message = "User is disabled, contact admin.";
//     devError = {
//       status: 400,
//       response: message,
//       error: `user disabled = ${user.login.isLoginDisabled} -- passport`,
//     };
//   }

//   return done(new AppError(message, 400, devError));
// };

// // Check if first-time login
// export const checkUsersFirstTimeOrNot = async (
//   user: any,
//   done: (err: any, user?: any) => void
// ): Promise<void> => {
//   if (!user.login.isDefaultPassword) {
//     LogConsole("User already changed default password");
//     return done(null, user);
//   }

//   // User is logging in first time
//   const tok = {
//     phonenumber: formatPhoneNumber(user.contactDetails.phonenumber),
//     otpFor: "firstLogin",
//     sourceapp: "schoolPortal",
//   };
//   const tkn = await createTempToken(tok);

//   const devError = {
//     success: 400,
//     user: "First time login, please change your password. - passport",
//     error: tkn,
//   };

//   return done(
//     new AppError(
//       "First time login, please change your password.",
//       tkn,
//       400
//     )
//   );
// };

// // Check login attempts & temporary/permanent blocking
// export const checkLoginAttempt = async (
//   user: any,
//   done: (err: any, user?: any, info?: any) => void
// ): Promise<void> => {
//   const lastLoginAttempt = moment(user.login.lastLoginAttempt);
//   let loginAttemptCount = user.login.loginAttemptCount;

//   const maxAttempts = 10;
//   const temporaryBlockLimit = 5;
//   const temporaryBlockDuration = 3 * 60; // 3 minutes
//   const permanentBlockDuration = 24 * 60 * 60; // 24 hours

//   const now = moment.tz("Africa/Addis_Ababa");
//   const totalSecondsSinceLastAttempt = now.diff(lastLoginAttempt, "seconds");
//   const totalRemainingSeconds =
//     temporaryBlockDuration - totalSecondsSinceLastAttempt;
//   const remainingMinutes = Math.floor(totalRemainingSeconds / 60);
//   const remainingSeconds = totalRemainingSeconds % 60;

//   // Permanent block
//   if (
//     loginAttemptCount >= maxAttempts &&
//     totalSecondsSinceLastAttempt < permanentBlockDuration
//   ) {
//     return done(
//       new AppError(
//         "Your account is disabled. Try after 24 hours.",
//         { loginAttemptCount: loginAttemptCount + 1, lastLoginAttempt: now },
//         400,
//         { status: 400, error: "Permanent login block - passport" }
//       )
//     );
//   }

//   // Reset attempts after 24h
//   if (totalSecondsSinceLastAttempt >= permanentBlockDuration)
//     loginAttemptCount = 1;

//   // Temporary block < 5 attempts
//   if (loginAttemptCount < temporaryBlockLimit) {
//     return done(null, null, {
//       success: false,
//       message: `Wrong attempt. ${
//         temporaryBlockLimit - (loginAttemptCount + 1)
//       } tries left.`,
//       loginAttemptCount: loginAttemptCount + 1,
//       lastLoginAttempt: now,
//       enabled: true,
//       isLoginDisabled: false,
//     });
//   }

//   // Temporary block = 5 attempts and 3 min not passed
//   if (loginAttemptCount === temporaryBlockLimit && totalRemainingSeconds > 0) {
//     return done(null, null, {
//       success: false,
//       loginAttemptCount,
//       lastLoginAttempt,
//       isLoginDisabled: false,
//       enabled: true,
//       message: `Too many failed attempts. Try again after ${remainingMinutes} minute(s) and ${remainingSeconds} seconds.`,
//     });
//   }

//   // Increment attempts after temporary block
//   if (
//     loginAttemptCount >= temporaryBlockLimit &&
//     loginAttemptCount < maxAttempts
//   ) {
//     loginAttemptCount += 1;
//     return done(null, null, {
//       success: false,
//       loginAttemptCount,
//       lastLoginAttempt: now,
//       isLoginDisabled: false,
//       enabled: true,
//       message: `Wrong attempt. ${maxAttempts - loginAttemptCount} tries left.`,
//     });
//   }

//   // Fallback error
//   return done(
//     new AppError("Something went wrong, try again later.", {}, 400, {
//       status: 400,
//       response: "undefined or null return during fetching db - passport",
//       error: "",
//     })
//   );
// };

// export const updateDB = async (data: any, user: any): Promise<any> => {
//   LogConsole("=== HERE IN THE UPDATE DB ===", data);
//   const updates = {
//     "login.loginAttemptCount": data.loginAttemptCount,
//     "login.lastLoginAttempt": moment.tz("Africa/Addis_Ababa"),
//     enabled: data.enabled ? data.enabled : undefined,
//     "login.isLoginDisabled": data.isLoginDisabled
//       ? data.isLoginDisabled
//       : undefined,
//   };
//   LogConsole("=== updates ===", updates);
//   const filteredUpdates = Object.fromEntries(
//     Object.entries(updates).filter(([_, value]) => value !== undefined)
//   );

//   LogConsole("=== filteredUpdates ===", filteredUpdates);
//   await updateschoolUserDal(user._id, filteredUpdates);
//   return data.message;
// };
