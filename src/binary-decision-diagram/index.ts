// import fs from "fs"

// import { createBddFromTruthTable } from "./create-bdd-from-truth-table"
// import { InternalNode } from "./internal-node"
// import { LeafNode } from "./leaf-node"
// import { bddToMinimalString } from "./minimal-string/bdd-to-minimal-string"
// import { RootNode } from "./root-node"

// export * from "./abstract-node"
// export * from "./branches"
// export * from "./create-bdd-from-truth-table"
// export * from "./ensure-correct-bdd"
// export * from "./fill-truth-table"
// export * from "./find-similar-node"
// export * from "./internal-node"
// export * from "./leaf-node"
// export * from "./minimal-string/index"
// export * from "./optimize-brute-force"
// export * from "./parents"
// export * from "./root-node"
// /**
//  * There is no "export type * from 'xxx'"
//  * So we have to export each type by its own
//  * to ensure the types js file is not included
//  * into the bundle.
//  */
// export type {
//     BooleanString,
//     NodeType,
//     NonLeafNode,
//     NonRootNode,
//     ResolverFunction,
//     ResolverFunctions,
//     SimpleBdd,
//     SimpleBddLeafNode,
//     TruthTable
// } from "./types"
// export * from "./util"

// // let truthTable = new Map()
// // truthTable.set('0000', 0)
// // truthTable.set('0001', 0)
// // truthTable.set('0010', 0)
// // truthTable.set('0011', 1)
// // truthTable.set('0100', 0)
// // truthTable.set('0101', 0)
// // truthTable.set('0110', 0)
// // truthTable.set('0111', 1)
// // truthTable.set('1000', 0)
// // truthTable.set('1001', 0)
// // truthTable.set('1010', 0)
// // truthTable.set('1011', 1)
// // truthTable.set('1100', 1)
// // truthTable.set('1101', 1)
// // truthTable.set('1110', 1)
// // truthTable.set('1111', 1)

// let truthTable = new Map()
// truthTable.set("000", 0)
// truthTable.set("001", 0)
// truthTable.set("010", 0)
// truthTable.set("011", 1)
// truthTable.set("100", 0)
// truthTable.set("101", 1)
// truthTable.set("110", 0)
// truthTable.set("111", 1)

// let bdd = createBddFromTruthTable(truthTable)

// bdd.minimize()

// let content = 'digraph G {\n\tordering="out"\n'

// const variables = ['A','B','C']//,'D']

// function printInternalNode(node: RootNode | InternalNode) {
//     const branches = node.branches
//     const left = branches.getBranch("0")
//     const right = branches.getBranch("1")
//     printBranch(node, left)
//     printBranch(node, right)
// }

// function printBranch(origin: RootNode | InternalNode, node: InternalNode | LeafNode) {
//     content += `\t${origin.id} [label="${variables[origin.level]}"]\n`
//     if (node.isInternalNode()) {
//         content += `\t${node.id} [label="${variables[node.level]}"]\n`
//         content += `\t${origin.id} -> ${node.id}\n`
//     }
//     else {
//         content += `\t${origin.id+node.id} [label="${node.asLeafNode().value}"]\n`
//         content += `\t${origin.id} -> ${origin.id+node.id}\n`
//     }
// }

// bdd.nodesByLevel.forEach((nodes) => {
//     nodes.forEach((node) => {
//         if (node.isRootNode() || node.isInternalNode()) {
//             printInternalNode(node as RootNode | InternalNode)
//         }
//     })
// })

// content += "}"
// fs.writeFileSync("./diagram.dot", content)

// console.log(bddToMinimalString(bdd))
