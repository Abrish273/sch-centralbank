import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { LogConsole } from "../util/log.utils";
import { formatPhoneNumber } from "../util/randNum.utils";
import {
  GetCentralBankUserDal,
  updateCentralBankUserDal,
} from "../dal/centralbank.dal";
import AppError from "../util/appError";
import { compareHashPassword } from "../util/hashpassword.utils";
import moment from "moment-timezone";
import { getData, setData } from "../dal/redis.dal";
import { otpFor } from "../util/constants";

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
          console.log("user found", user);
          const verifiedPassword: boolean = await compareHashPassword(
            password,
            user.login.loginPassword
          );
          LogConsole("=== verified ===", verifiedPassword);

          if (verifiedPassword) {
            if (user.login.isDefaultPassword) {
              throw new AppError(
                {
                  requires: "force change password",
                  next: "/v1.0/schpay/api/otp/send/otp",
                  otpFor: otpFor.forceChangePassword,
                  message: "change your password",
                },
                400,
                {
                  messageErr: "It is default password",
                }
              );
            } else {
              const data = {
                success: true,
                message: "Login successful",
                loginAttemptCount: 0, // Reset count on success
                lastLoginAttempt: () =>
                  moment.tz("Africa/Addis_Ababa").toDate(),
              };
              if (user.login.isLoginDisabled) {
                const message = "User is disabled, try after 24 hours.";
                const devError = {
                  status: 400,
                  response: message,
                  error: `user disabled = ${user.login.isLoginDisabled} -- passport`,
                };
                return done(new AppError({ message }, 400, devError));
              }
              updateDB(data, user);
              // Save the user to Redis with a TTL (time to live)
              const redisResponse = await setData(user);
              if (!redisResponse.success) {
                LogConsole("Error saving to Redis: ", redisResponse.message);
              }
              console.log("---user---", user);
              return done(null, user);
            }
          } else {
            LogConsole("=== here in the failed login attempt ===...");
            const resp = await checkLoginAttempt(user, done);
            LogConsole("=== resp ===", resp);
            const update = await updateDB(resp, user);
            LogConsole("=== update ===", update);
            return done(null, false, { message: String(update) });
          }
        } catch (error) {
          console.error("Error in authentication passport config:", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser(async (user: any, done: any) => {
    LogConsole("=== SERIALIZE USER ===", user.id);

    const redisResponse = await setData(user);

    if (redisResponse.success) {
      done(null, user.id);
    } else {
      done(new Error("Error saving user data to Redis during serialization"));
    }
  });

  passport.deserializeUser(async (id: string, done: any) => {
    LogConsole("=== DESERIALIZE USER ===", id);

    try {
      const redisResponse = await getData(id);

      if (redisResponse.success) {
        const user = redisResponse.data;
        LogConsole("=== User found in Redis ===", user);

        return done(null, user);
      } else {
        const query = { _id: id };
        const user = await GetCentralBankUserDal(query);

        if (user) {
          await setData(user);
        }

        done(null, user);
      }
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error, null);
    }
  });
};

const findUser = async (query: any) => {
  const user: any = await GetCentralBankUserDal(query, true);
  if (user !== null) {
    return user;
  } else {
    throw new AppError({ message: "User not found" }, 400, { query });
  }
};

const checkLoginAttempt = async (
  user: any,
  done: (err: any, user?: any, info?: any) => void
): Promise<void> => {
  const lastLoginAttempt = moment(user.login.lastLoginAttempt);
  let loginAttemptCount = user.login.loginAttemptCount;

  const maxAttempts = 10;
  const temporaryBlockLimit = 5;
  const temporaryBlockDuration = 3 * 60; // 3 minutes
  const permanentBlockDuration = 24 * 60 * 60; // 24 hours

  const now = moment.tz("Africa/Addis_Ababa");
  const totalSecondsSinceLastAttempt = now.diff(lastLoginAttempt, "seconds");
  const totalRemainingSeconds =
    temporaryBlockDuration - totalSecondsSinceLastAttempt;
  const remainingMinutes = Math.floor(totalRemainingSeconds / 60);
  const remainingSeconds = totalRemainingSeconds % 60;

  // Permanent block
  if (
    loginAttemptCount >= maxAttempts &&
    totalSecondsSinceLastAttempt < permanentBlockDuration
  ) {
    return done(
      new AppError(
        {
          message: "Your account is disabled. Try after 24 hours.",
          loginAttemptCount: loginAttemptCount + 1,
          lastLoginAttempt: now,
        },
        400,
        { error: "Permanent login block - passport" }
      )
    );
  }

  // Reset attempts after 24h
  if (totalSecondsSinceLastAttempt >= permanentBlockDuration)
    loginAttemptCount = 1;

  // Temporary block < 5 attempts
  if (loginAttemptCount < temporaryBlockLimit) {
    return done(null, null, {
      success: false,
      message: `Wrong attempt. ${
        temporaryBlockLimit - (loginAttemptCount + 1)
      } tries left.`,
      loginAttemptCount: loginAttemptCount + 1,
      lastLoginAttempt: now,
      isLoginDisabled: false,
    });
  }

  // Temporary block = 5 attempts and 3 min not passed
  if (loginAttemptCount === temporaryBlockLimit && totalRemainingSeconds > 0) {
    return done(null, null, {
      success: false,
      loginAttemptCount,
      lastLoginAttempt,
      isLoginDisabled: false,
      message: `Too many failed attempts. Try again after ${remainingMinutes} minute(s) and ${remainingSeconds} seconds.`,
    });
  }

  // Increment attempts after temporary block
  if (
    loginAttemptCount >= temporaryBlockLimit &&
    loginAttemptCount < maxAttempts
  ) {
    loginAttemptCount += 1;
    return done(null, null, {
      success: false,
      loginAttemptCount,
      lastLoginAttempt: now,
      isLoginDisabled: false,
      message: `Wrong attempt. ${maxAttempts - loginAttemptCount} tries left.`,
    });
  }

  return done(
    new AppError({ message: "Something went wrong, try again later." }, 400, {
      status: 400,
      response: "undefined or null return during fetching db - passport",
      error: "",
    })
  );
};

const updateDB = async (data: any, user: any): Promise<any> => {
  LogConsole("=== HERE IN THE UPDATE DB ===", data);
  const updates = {
    "login.loginAttemptCount": data.loginAttemptCount,
    "login.lastLoginAttempt": moment.tz("Africa/Addis_Ababa"),
    "login.isLoginDisabled": data.isLoginDisabled
      ? data.isLoginDisabled
      : undefined,
  };
  LogConsole("=== updates ===", updates);
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );

  LogConsole("=== filteredUpdates ===", filteredUpdates);
  await updateCentralBankUserDal(user._id, filteredUpdates);
  return data.message;
};
