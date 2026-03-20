import { Factory } from "fishery";
import { type Device } from "@prisma/client";
export interface DeviceData extends Partial<Device> {
    userId: string;
}
export declare const deviceFactory: Factory<DeviceData, any, DeviceData, import("fishery").DeepPartialObject<DeviceData>>;
//# sourceMappingURL=device.factory.d.ts.map