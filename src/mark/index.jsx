import React, { useEffect, useRef } from 'react';
import { getDomRange } from '../util.js/getDomRange.js'
import './index.css'
/**
 * 1， 找到选区
 * 2.  dom遍历
 * 3.  dom序列化与反序列化
 */

const Mark = (props) => {
    const { children } = props
    const markRef = useRef()
    // useEffect(() => {
    //     let markRes = []
    //     console.log(JSON.parse(localStorage.getItem('markDom')));
    //     if (localStorage.getItem('markDom')) {
    //         JSON.parse(localStorage.getItem('markDom')).forEach(
    //             node => {
    //                 markRes.push(deSerialize(node))
    //             }
    //         )
    //     }
    //     if (markRes.length != 0) {
    //         markRes.forEach(
    //             node => {
    //                 parseToDOM(node)
    //             }
    //         )
    //     }
    //     console.log(markRes);
    // })
    let markArr = []
    let data = []
    let flag = 0

    /**
     * 
     * @param {*} node
     * 进行包裹 
     */
    const parseToDOM = (node) => {
        const parentNode = node.parentNode
        const span = document.createElement("span");
        const newNode = node.cloneNode(true);
        span.appendChild(newNode)
        span.className = 'mark'
        parentNode.replaceChild(span, node)
    }

    /**
     * 获取选取的dom信息
     */
    const electoral = () => {
        markArr = []
        let range = getDomRange()

        if (range) {
            // 获取起始位置和终止位置
            const start = {
                node: range.startContainer,
                offset: range.startOffset
            }
            const end = {
                node: range.endContainer,
                offset: range.endOffset
            }
            // 2. 处理头尾
            // 首尾是一个节点的情况,应该是取一个交集
            let newNode
            if (start.node === end.node) {

                newNode = splitNode(start.node, start.offset, end.offset)
                data.push(serialize(newNode))
                parseToDOM(newNode)
            } else {
                // 多节点的时候就需要收集一次了
                traversalDom(start, end)

                markArr[0] = splitHeader(start)
                markArr[markArr.length - 1] = splitTail(end)

                markArr.forEach(node => {
                    data.push(serialize(node))
                })
                console.log(markArr)
                markArr.forEach(node => {
                    parseToDOM(node)
                })
            }
            localStorage.setItem('markDom', JSON.stringify(data))
        }
    }

    /**
     * 
     * @param {*} textNode 
     * @param {*} root 
     * 开始进行DOM的序列化
     */
    const serialize = (textNode, root = document) => {

        // 这里要怎么写呢？
        // 记录每一个文本节点的具体位置，怎么记录呢？

        const node = findFatherNode(textNode)
        let childIndex = -1
        for (let i = 0; i < node.childNodes.length; i++) {
            if (textNode === node.childNodes[i]) {
                childIndex = i
                break
            }
        }

        const tagName = node.tagName
        const list = root.getElementsByTagName(tagName)
        for (let index = 0; index < list.length; index++) {
            if (node === list[index]) {
                return { tagName, index, childIndex }
            }
        }
        return { tagName, index: -1, childIndex }
    }

    /**
     * 
     * @param {*} meta 
     * @param {*} root 
     * 反序列化
     */
    const deSerialize = (meta, root = document) => {
        const { tagName, index, childIndex } = meta;
        const parent = root.getElementsByTagName(tagName)[index];
        return parent.childNodes[childIndex];
    }

    /**
     * 
     * @param {*} header
     * 处理头部节点 
     */
    const splitHeader = (header) => {

        header.node.splitText(header.offset)
        return header.node.nextSibling
    }

    /**
     * 
     * @param {*} tail 
     * 处理尾部节点
     */
    const splitTail = (tail) => {

        return tail.node.splitText(tail.offset).previousSibling
    }

    /**
     * 
     * @param {*} node 
     * @param {*} header 
     * @param {*} tail 
     * 首尾在一个节点的情况
     */
    const splitNode = (node, header, tail) => {
        let newNode = node.splitText(header)
        newNode.splitText(tail - header)

        return newNode
    }

    const findFatherNode = (node) => {
        return node.parentNode
    }

    /**
     * 
     * @param {*} node 
     * @param {*} endNode 
     *  文本节点收集
     */
    const collectTextNode = (node, endNode) => {
        // dfs
        if (node.nodeType === 3) (
            markArr.push(node)
        )

        let childNodes = node.childNodes
        if (childNodes) {
            for (let i = 0; i < childNodes.length; i++) {
                if (childNodes[i].nodeType === 3) {
                    markArr.push(childNodes[i])
                } else {
                    collectTextNode(childNodes[i])
                }

                if (childNodes[i] == endNode) {
                    flag = 1
                    return
                }
            }
        } else {
            return
        }
    }

    /**
     * 
     * @param {*} node 
     * @param {*} endNode 
     * 找叔叔
     */
    const findUncle = (node, endNode) => {
        if (node == markRef.current) {
            return
        }
        let currentNode = node

        // 到头了就找它父亲的下一个节点
        let current_fa = findFatherNode(currentNode)
        if (current_fa.nextSibling) {
            collectTextNode(current_fa.nextSibling, endNode)
            if (flag == 1) {
                return
            } else {
                // 该看它的兄弟了
                currentNode = current_fa.nextSibling
                while (currentNode.nextSibling && flag == 0) {
                    collectTextNode(currentNode.nextSibling, endNode)
                    currentNode = currentNode.nextSibling
                }
                if (flag == 0) {
                    // 这是说明出来的是该层最后一个节点了
                    // 收集一下
                    collectTextNode(currentNode)
                    // 然后将他交给找叔叔
                    findUncle(currentNode)
                }
            }
        } else {
            collectTextNode(currentNode)
            findUncle(current_fa, endNode)
        }
    }

    /**
     * 
     * @param {*} start 
     * @param {*} end 
     * dom树遍历
     */
    const traversalDom = (start, end) => {
        let currentNode = start.node
        if (currentNode.nextSibling) {

            while (currentNode != end.node && currentNode.nextSibling != null) {
                collectTextNode(currentNode)
                currentNode = currentNode.nextSibling
            }

            if (flag == 0) {
                collectTextNode(currentNode)
                findUncle(currentNode, end.node)
            } else {
                return
            }

        } else {
            collectTextNode(currentNode)
            findUncle(currentNode, end.node)
        }

    }

    return (
        <div ref={markRef} onMouseUp={electoral}>
            {children}
        </div>
    );
}

export default Mark;