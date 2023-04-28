import {
    SimpleBdd,
    SimpleBddLeafNode
} from '../types';
import { splitStringToChunks } from '../util';
import { getNumberOfChar } from './string-format';

export function minimalStringToSimpleBdd(
    str: string
): SimpleBdd {
    const nodesById: Map<string, SimpleBdd | SimpleBddLeafNode> = new Map();

    // parse leaf nodes
    const leafNodeAmount = parseInt(str.charAt(0) + str.charAt(1), 10);
    const lastLeafNodeChar = (2 + leafNodeAmount * 2);
    const leafNodeChars = str.substring(2, lastLeafNodeChar);
    const leafNodeChunks = splitStringToChunks(leafNodeChars, 2);
    for (let i = 0; i < leafNodeChunks.length; i++) {
        const chunk = leafNodeChunks[i];
        const id = chunk.charAt(0);
        const value: SimpleBddLeafNode = getNumberOfChar(chunk.charAt(1));
        nodesById.set(id, value);
    }

    // parse internal nodes
    const internalNodeChars = str.substring(lastLeafNodeChar, str.length - 3);
    const internalNodeChunks = splitStringToChunks(internalNodeChars, 4);
    for (let i = 0; i < internalNodeChunks.length; i++) {
        const chunk = internalNodeChunks[i];
        const id = chunk.charAt(0);
        const idOf0Branch = chunk.charAt(1);
        const idOf1Branch = chunk.charAt(2);
        const level = getNumberOfChar(chunk.charAt(3));


        if (!nodesById.has(idOf0Branch)) {
            throw new Error('missing node with id ' + idOf0Branch);
        }
        if (!nodesById.has(idOf1Branch)) {
            throw new Error('missing node with id ' + idOf1Branch);
        }

        const node0 = nodesById.get(idOf0Branch) as SimpleBdd;
        const node1 = nodesById.get(idOf1Branch) as SimpleBdd;
        const node: SimpleBdd = {
            l: level, // level is first for prettier json output
            0: node0,
            1: node1
        };
        nodesById.set(id, node);
    }

    // parse root node
    const last3 = str.slice(-3);
    const idOf0 = last3.charAt(0);
    const idOf1 = last3.charAt(1);
    const levelOfRoot = getNumberOfChar(last3.charAt(2));
    const nodeOf0 = nodesById.get(idOf0) as SimpleBdd;
    const nodeOf1 = nodesById.get(idOf1) as SimpleBdd;
    const rootNode: SimpleBdd = {
        l: levelOfRoot,
        0: nodeOf0,
        1: nodeOf1,
    };

    return rootNode;
}
