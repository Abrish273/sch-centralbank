import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { EventEmitter } from "stream";
import {
  GetCentralBankUserDal,
  updateCentralBankUserDal,
} from "../dal/centralbank.dal";
import { hashpassword } from "../util/hashpassword.utils";
import moment from "moment-timezone";

const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    let workflow = new EventEmitter();
    const value = req.body;

    workflow.on("validate", async (value) => {
      let query: any;
      if (value.sourceapp === "centralPortal") {
        query = {
          realm: "central",
          isDeleted: false,
          phoneNumber: String(value.phonenumber),
        };
        workflow.emit("fetchUser", value, query);
      } else if (value.sourceapp === "branchPortal") {
        query = {
          realm: "branch",
          phoneNumber: String(value.phonenumber),
          isDeleted: false,
        };
        workflow.emit("fetchUser", value, query);
      } else if (value.sourceapp === "schoolPortal") {
        query = {
          realm: "school",
          phoneNumber: String(value.phonenumber),
          isDeleted: false,
        };
        workflow.emit("fetchUser", value, query);
      } else {
        console.log("In valid query", query);
        return res.status(400).json({
          success: false,
          message: "Invalid Request.",
        });
      }
    });

    workflow.on("fetchUser", async (value, query) => {
      console.log("query", query);
      let result: any;
      try {
        if (value.sourceapp === "centralPortal") {
          result = await GetCentralBankUserDal(query);
          //   if (result.success && result.status === 200) {
          workflow.emit("then", result, value);
          //   } else {
          //     return res.status(400).json({
          //       success: false,
          //       message: "User not found",
          //     });
          //   }
        } else if (value.sourceapp === "branchPortal") {
          //   result = await GetBranchBankUserDal(query);
          //   if (result.success && result.status === 200) {
          //     workflow.emit("then", result.response, value);
          //   } else {
          //     return res.status(400).json({
          //       success: false,
          //       message: "User not found",
          //     });
          //   }
        } else {
          //   result = await GetSchoolUserDal(query);
          //   if (result.success && result.status === 200) {
          //     workflow.emit("then", result.response, value);
          //   } else {
          //     return res.status(400).json({
          //       success: false,
          //       message: "User not found",
          //     });
          //   }
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "soemthing went wrong try again later.",
        });
      }
    });

    workflow.on("then", async (result, value) => {
      console.log("result", result);
      if (value.password === value.confirmedpassword) {
        const hashedPassword = await hashpassword(value.password);
        let lastFiveHashedPasswords = result.login.lastFivePasswords;

        if (!result.login.lastFivePasswords.includes(hashedPassword)) {
          // Push the new hashed password to the array
          lastFiveHashedPasswords.push(hashedPassword);

          // If the array length exceeds 5, remove the first element to keep the array size <= 5
          if (result.login.lastFivePasswords.length > 5) {
            lastFiveHashedPasswords.shift(); // Removes the first element
          }
          console.log("lastFiveHashedPasswords", lastFiveHashedPasswords);
          workflow.emit(
            "updatePassword",
            result,
            value,
            hashedPassword,
            lastFiveHashedPasswords
          );
        } else {
          return res.status(400).json({
            success: false,
            message: "password already used.",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "password doesn't match.",
        });
      }
    });

    workflow.on(
      "updatePassword",
      async (result, value, hashedPassword, lastFiveHashedPasswords) => {
        let updates: any = {};

        updates["login.firstPasswordSet"] = false;
        updates["login.isDefaultPassword"] = false;
        updates["login.lastFivePasswords"] = lastFiveHashedPasswords;
        updates["login.loginPassword"] = hashedPassword;
        updates["login.passwordChangedAt"] = moment
          .tz("Africa/Addis_Ababa")
          .toDate();
        console.log("--- updates --", updates);
        let res: any;
        try {
          if (value.sourceapp === "centralPortal") {
            res = await updateCentralBankUserDal(result._id, updates);
            workflow.emit("notifyUser", res, value);
          } else if (value.sourceapp === "branchPortal") {
            // res = await updateBranchBankUserDal(result._id, updates);
            // workflow.emit("notifyUser", res, value);
          } else {
            // res = await updateSchooUserUserDal(result._id, updates);
            // workflow.emit("notifyUser", res, value);
          }
        } catch (error) {
          console.log("catch error in the update password", error);
          return res.status(500).json({
            success: false,
            message: "something went wrong try again later",
            mssgErr: error,
          });
        }
      }
    );

    workflow.on("notifyUser", async (respose, value) => {
      console.log("--- notify user ---", respose);
      return res.status(200).json({
        success: true,
        message: "password changed successfully.",
      });
    });

    workflow.emit("validate", value);
  }
);

export default {
  changePassword,
};
