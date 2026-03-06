import { Node, UITransform } from 'cc';

export interface ArenaBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export function computeArenaBounds(wallsNode: Node, entityHalfW = 0, entityHalfH = 0): ArenaBounds {
    const left = wallsNode.getChildByName('Left')!;
    const right = wallsNode.getChildByName('Right')!;
    const top = wallsNode.getChildByName('Top')!;
    const down = wallsNode.getChildByName('Down')!;

    return {
        minX: left.position.x + left.getComponent(UITransform)!.contentSize.width / 2 + entityHalfW,
        maxX: right.position.x - right.getComponent(UITransform)!.contentSize.width / 2 - entityHalfW,
        minY: down.position.y + down.getComponent(UITransform)!.contentSize.height / 2 + entityHalfH,
        maxY: top.position.y - top.getComponent(UITransform)!.contentSize.height / 2 - entityHalfH,
    };
}
