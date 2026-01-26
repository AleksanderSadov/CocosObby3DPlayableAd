import { _decorator, Camera, Color, Component, geometry, GeometryRenderer, Vec3 } from 'cc';
import { DEBUG } from 'cc/env';
const { ccclass, property } = _decorator;

// отдельные вектора чтобы не запутаться с расчетными
export const v3_dd_0 = new Vec3();
export const v3_dd_1 = new Vec3();

@ccclass('DebugDrawer')
export class DebugDrawer extends Component {
    @property(Camera)
    public camera: Camera;

    public static gr: GeometryRenderer;

    public static get i(): DebugDrawer {
        return this._instance;
    }

    private static _instance: DebugDrawer;

    protected onLoad(): void {
        if (!DEBUG) {
            this.enabled = false;
            return;
        }

        DebugDrawer._instance = this;
        this.camera.camera.initGeometryRenderer();
        DebugDrawer.gr = this.camera.camera.geometryRenderer;
    }

    public static drawRay(ray: geometry.Ray, distance: number, color: Color) {
        const start = v3_dd_0.set(ray.o);
        const end = v3_dd_1.set(ray.d);
        Vec3.scaleAndAdd(end, start, end, distance);
        this.gr.addLine(start, end, color);
    }

    public static drawLine(startPosition: Vec3, direction: Vec3, distance: number, color: Color, offset?: Vec3) {
        const start = v3_dd_0.set(startPosition);
        const end = v3_dd_1.set(Vec3.ZERO);
        if (offset) {
            start.add(offset);
            end.add(offset);
        }
        Vec3.scaleAndAdd(end, start, direction, distance);
        DebugDrawer.gr.addLine(start, end, color);
    }
}
