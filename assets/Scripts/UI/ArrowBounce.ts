import { _decorator, Component, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ArrowBounce')
export class ArrowBounce extends Component {
    start () {
        const startPos = this.node.position.clone();

        tween(this.node)
            .repeatForever(
                tween()
                    .to(0.4, { position: startPos.clone().add(new Vec3(0, -20, 0)) })
                    .to(0.4, { position: startPos })
            )
            .start();
    }
}


