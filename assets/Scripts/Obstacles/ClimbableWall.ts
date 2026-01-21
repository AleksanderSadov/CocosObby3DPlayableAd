import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ClimbableWall')
export class ClimbableWall extends Component {
    @property
    public climbSpeed: number = 2.5;

    @property
    public detachImpulse: number = 6;

    @property
    public pushBack: number = 2.5;
}
