import { _decorator, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { CocosExamplePlayerController } from './CocosExamplePlayerController';
const { ccclass, property } = _decorator;

enum CocosExampleBlockType {
    BT_NONE,
    BT_STONE,
}

enum CocosExampleGameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
}

@ccclass('CocosExampleGameManager')
export class CocosExampleGameManager extends Component {
    @property({type: Prefab})
    public cubePrefab: Prefab | null = null;
    @property({type: CocosExamplePlayerController})
    public playerCtrl: CocosExamplePlayerController | null = null;
    @property({type: Node})
    public startMenu: Node | null = null;
    @property({type: Label})
    public stepsLabel: Label | null = null;
    @property
    public roadLength = 50;
    private _road: CocosExampleBlockType[] = [];

    start() {
        this.curState = CocosExampleGameState.GS_INIT;
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            this.stepsLabel.string = ' ' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex);
    }

    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        this.generateRoad();
        if (this.playerCtrl) {
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(new Vec3(0, 1.5, 0));
        }
        this.playerCtrl.reset();
    }

    set curState(value: CocosExampleGameState) {
        switch(value) {
            case CocosExampleGameState.GS_INIT:
                this.init();
                break;
            case CocosExampleGameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';
                }
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case CocosExampleGameState.GS_END:
                break;
        }
    }

    generateRoad() {
        this.node.removeAllChildren();
        this._road = [];
        this._road.push(CocosExampleBlockType.BT_STONE);

        for (let i = 1; i < this.roadLength; i++) {
            if (this._road[i-1] === CocosExampleBlockType.BT_NONE) {
                this._road.push(CocosExampleBlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let j = 0; j < this._road.length; j++) {
            let block: Node = this.spawnBlockType(this._road[j]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, 0, 0);
            }
        }
    }
     
    spawnBlockType(type: CocosExampleBlockType): Node {
        if (!this.cubePrefab) {
            return null;
        }

        let block: Node | null = null;
        switch(type) {
            case CocosExampleBlockType.BT_STONE:
                block = instantiate(this.cubePrefab);
                break;
        }

        return block;
    }

    onStartButtonClicked() {
        this.curState = CocosExampleGameState.GS_PLAYING;
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength) {
            if (this._road[moveIndex] == CocosExampleBlockType.BT_NONE) {
                this.curState = CocosExampleGameState.GS_INIT;
            }
        } else {
            this.curState = CocosExampleGameState.GS_INIT;
        }
    }
}


