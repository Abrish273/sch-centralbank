import moment from "moment-timezone";
import mongoosePaginate from "mongoose-paginate-v2";
import mongoose, { model } from "mongoose";
import { ICentral } from "../config/Types/centralbank";

const Schema = mongoose.Schema;

const centralbank = new Schema<ICentral>({
  userCode: { type: String, index: true, unique: true, required: true },
  fullName: { type: String, index: true, required: true },
  phoneNumber: { type: String, index: true, required: true, unique: true },
  realm: { type: String, default: "central", required: true },

  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
  login: {
    // Store only hashed passwords (crypto)
    loginPassword: { type: String, required: true },

    // Store last five hashed passwords (to prevent reuse)
    lastFivePasswords: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: "You can only store up to 5 previous passwords.",
      },
    },

    // Multi-factor authentication (MFA)
    isMfaActive: { type: Boolean, required: true, default: false },
    twoFactorSecret: { type: String }, // should be encrypted or stored in secure vault

    // Brute-force protection
    loginAttemptCount: { type: Number, default: 0 },
    lastLoginAttempt: {
      type: Date,
      default: () => moment.tz("Africa/Addis_Ababa").toDate(),
    },
    isMaxLoginLimit: { type: Boolean, default: false },

    // Password lifecycle
    isDefaultPassword: { type: Boolean, default: true },
    passwordChangedAt: { type: Date },

    // Account lockout
    isLoginDisabled: { type: Boolean, default: false },

    // Optional: Add audit metadata
    lastLoginAt: { type: Date },
  },
  isDeleted: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: () => moment.tz("Africa/Addis_Ababa").toDate(),
  },
  updatedAt: {
    type: Date,
    default: () => moment.tz("Africa/Addis_Ababa").toDate(),
  },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "centralbank" },
});

centralbank.plugin(mongoosePaginate);

const centralbankModel = model<ICentral, mongoose.PaginateModel<ICentral>>(
  "centralbank",
  centralbank
);

centralbank.index({ fullName: "text" });
// centralbank.index({ userCode: 1 }, { unique: true });
// centralbank.index({ phoneNumber: 1 }, { unique: true });

export default centralbankModel;
