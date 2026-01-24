import { Color, geometry, Quat, Vec2, Vec3 } from "cc";

// это для оптимизации работы памяти при работе с векторами, вместо создания новых векторов записываем значения в уже созданые 
export const v2_0 = new Vec2();
export const v3_0 = new Vec3();
export const v3_1 = new Vec3();
export const v3_2 = new Vec3();
export const rotation = new Quat();
export const scale = new Vec3(1);
export const ray = new geometry.Ray();

export enum ColorChallengeType {
    Blue = "Blue",
    Green = "Green",
    Purple = "Purple",
    Red = "Red",
    White = "White",
    Yellow = "Yellow",
}

export const ColorChallengeMap: Map<string, Color> = new Map([
    [ColorChallengeType.Blue, Color.BLUE],
    [ColorChallengeType.Green, Color.GREEN],
    [ColorChallengeType.Purple, Color.MAGENTA],
    [ColorChallengeType.Red, Color.RED],
    [ColorChallengeType.White, Color.WHITE],
    [ColorChallengeType.Yellow, Color.YELLOW],
])