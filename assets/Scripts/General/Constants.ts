import { Color, Quat, Vec2, Vec3 } from "cc";

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

export const ColorChallengeMap: Map<string, Color> = new Map([
    ['Blue', Color.BLUE],
    ['Green', Color.GREEN],
    ['Purple', Color.MAGENTA],
    ['Red', Color.RED],
    ['White', Color.WHITE],
    ['Yelloe', Color.YELLOW],
])