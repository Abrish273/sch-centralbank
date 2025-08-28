import centralbankModel from "../model/centralbank.model";
import AppError from "../util/appError";
import { LogConsole } from "../util/log.utils";

export const GetCentralBankUserDal = async (query: any, check: boolean = false) => {
  LogConsole("%%%%% QUERY %%%%%", query);
  let devError: object = {};
  try {
    const response = await centralbankModel.findOne(query);
    if (response && (response !== null || response !== undefined)) {
      return response;
    } else {
      if (check) {
        return null;
      } else {
        devError = {
          info: "data doesn't exist",
          error: response,
        };
        throw new AppError(
          {
            success: false,
            message: "user not found.",
          },
          400,
          devError
        );
      }
    }
  } catch (error) {
    devError = {
      info: "catch error during user data fetching in db",
      error: error,
    };
    throw new AppError(
      {
        success: false,
        message: "something went wrong try again later.",
      },
      500,
      devError
    );
  }
};

export const GetManyCentralBankUsersDal = async (query: any) => {
  let devError: object = {};
  try {
    const response = await centralbankModel.find(query);
    if (response && response.length > 0) {
      return response;
    } else {
      devError = {
        info: "error during user data fetching in db",
        error: response,
      };
      throw new AppError(
        {
          success: false,
          message: "something went wrong try again later.",
        },
        400,
        devError
      );
    }
  } catch (error) {
    LogConsole("++++ error response +++", error);
    devError = {
      info: "catch error during user data fetching in db",
      error: error,
    };
    throw new AppError(
      {
        success: false,
        message: "something went wrong try again later.",
      },
      500,
      devError
    );
  }
};

export const CreateCentralBankUserDal = async (
  query: any,
  api: boolean = true
) => {
  let devError: object = {};
  try {
    const newUser = new centralbankModel(query);
    const response: any = await newUser.save();
    LogConsole("++++ response +++", response);
    if (response && response !== null && response !== undefined) {
      return response;
    } else {
      devError = {
        info: "data doesn't exist",
        error: response,
      };
      throw new AppError(
        {
          success: false,
          message: "something went wrong try again later.",
        },
        400,
        devError
      );
    }
  } catch (error) {
    LogConsole("++++ error response +++", error);
    devError = {
      info: "error during data fetching in db",
      error: error,
    };
    throw new AppError(
      {
        success: false,
        message: "something went wrong try again later.",
      },
      500,
      devError
    );
  }
};

export const CreateManyCentralBankUsersDal = async (queries: any[]) => {
  let devError: object = {};
  try {
    const response: any = await centralbankModel.insertMany(queries);
    LogConsole("++++ response +++", response);
    if (response && response.length > 0) {
      return response;
    } else {
      devError = {
        info: "error during data fetching in db",
        error: response,
      };
      throw new AppError(
        {
          success: false,
          message: "something went wrong try again later.",
        },
        500,
        devError
      );
    }
  } catch (error) {
    LogConsole("++++ error response +++", error);
    devError = {
      info: "error during data fetching in db",
      error: error,
    };
    throw new AppError(
      {
        success: false,
        message: "something went wrong try again later.",
      },
      500,
      devError
    );
  }
};

export const updateCentralBankUserDal = async (query: any, updates: any) => {
  let devError: object = {};
  try {
    LogConsole("query", query);
    LogConsole("updates", updates);
    const response = await centralbankModel.findOneAndUpdate(query, updates, {
      new: true,
    });
    LogConsole("===response in update bankUser dalxxx", response);
    if (response && (response !== null || response !== undefined)) {
      return response;
    } else {
      throw new AppError(
        {
          success: false,
          message: "something went wrong try again later",
        },
        400,
        devError
      );
    }
  } catch (error) {
    LogConsole("error dal", error.message);
    devError = {
      info: "error in updating central user --- dal",
      error: error,
    };
    throw new AppError(
      {
        success: false,
        message: "something went wrong try again later",
      },
      500,
      devError
    );
  }
};

export const updateManyCentralBankUsersDal = async (
  query: any,
  updates: any
) => {
  try {
    LogConsole("query", query);
    LogConsole("updates", updates);
    let devError: object = {};

    const response = await centralbankModel.updateMany(query, updates, {
      new: true,
    });

    LogConsole("===response in updateManyUsersDal===", response);
    if (response && response.modifiedCount > 0) {
      return response;
    } else {
      devError = {
        info: "error during updating many users in db",
        error: response,
      };
      throw new AppError(
        {
          success: false,
          message: "something went wrong try again later.",
        },
        500,
        devError
      );
    }
  } catch (error) {
    LogConsole("error in updateManyUsersDal", error.message);
    let devError: object = {
      info: "catch error during updating many users in db",
      error: error,
    };
    throw new AppError(
      {
        success: false,
        message: "something went wrong try again later.",
      },
      500,
      devError
    );
  }
};
