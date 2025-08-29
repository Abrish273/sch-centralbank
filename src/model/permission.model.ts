import { Document, Schema, Model, model } from "mongoose";

interface PermissionDoc extends Document {
  realm: string;
  department: string;
  role: string;
  permissions: string[];
}

const permissionSchema: Schema<PermissionDoc> = new Schema({
  realm: {
    type: String,
    required: true,
    enum: ["central", "branch", "school", "mobileapp"],
  },
  department: {
    type: String,
    required: true,
    enum: [
      "superAdmin",
      "security",
      "manager",
      "productManager",
      "customerSupport",
      "branch",
      "school",
      "mobileapp",
    ],
  },
  role: { type: String, required: true },
  permissions: [{ type: String, required: true }],
});

const Permission: Model<PermissionDoc> = model<PermissionDoc>(
  "Permission",
  permissionSchema
);

export { Permission, PermissionDoc };
