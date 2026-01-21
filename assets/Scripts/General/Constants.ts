import { Quat, Vec2, Vec3 } from "cc";

// это из примера кокоса, пока пробую прочувствовать в чем удобство использования таких констант
export const v2_0 = new Vec2();
export const rotation = new Quat();
export const scale = new Vec3(1);

export enum ColorChallengeType {
    Blue = "Blue",
    Green = "Green",
    Purple = "Purple",
    Red = "Red",
    White = "White",
    Yellow = "Yellow",
}