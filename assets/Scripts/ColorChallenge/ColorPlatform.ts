import { _decorator, Component, Enum } from 'cc';
import { ColorChallengeType } from '../General/Constants';
const { ccclass, property } = _decorator;

@ccclass('ColorPlatform')
export class ColorPlatform extends Component {
    @property({type: Enum(ColorChallengeType)})
    public colorType: ColorChallengeType = ColorChallengeType.Red;
}
